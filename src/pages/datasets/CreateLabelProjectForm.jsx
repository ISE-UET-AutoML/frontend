// CreateLabelProjectForm.jsx
import React, { useState, useEffect } from 'react'
import {
	Form,
	Input,
	Select,
	Button,
	Space,
	Tag,
	Divider,
	Alert,
	ColorPicker,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getDatasets } from 'src/api/dataset'
import { TASK_TYPES } from 'src/constants/types'

const { Option } = Select

export default function CreateLabelProjectForm({
	onSubmit,
	onCancel,
	onBack,
	initialValues = {},
	loading,
	detectedLabels = [],
	csvMetadata = null,
	datasetType, // IMAGE | TEXT | TABULAR | MULTIMODAL
	taskType,
	description,
}) {
	const [form] = Form.useForm()
	const [expectedLabels, setLabels] = useState([])
	const [newLabel, setNewLabel] = useState('')
	const [columnOptions, setColumnOptions] = useState([])
	const [selectedImageColumn, setSelectedImageColumn] = useState(null) // State cho cột ảnh
	const [selectedSeriesColumn, setSelectedSeriesColumn] = useState(null) // State cho cột chuỗi
	const [selectedTextColumn, setSelectedTextColumn] = useState(null) // State cho cột text
	const [selectedFeaturesColumn, setSelectedFeaturesColumn] = useState(null) // State cho cột features

	const [labelColors, setLabelColors] = useState({})
	// watch task type selection
	const selectedTaskType = taskType
	console.log('Selected Task Type:', selectedTaskType)
	const isManualLabelTask = (taskType) =>
		['SEMANTIC_SEGMENTATION', 'OBJECT_DETECTION'].includes(taskType)

	useEffect(() => {
		if (
			detectedLabels?.length > 0 &&
			selectedTaskType === 'IMAGE_CLASSIFICATION'
		) {
			console.log(
				'Setting detected labels from folder structure:',
				detectedLabels
			)
			setLabels(detectedLabels)
		}
	}, [detectedLabels, selectedTaskType])

	useEffect(() => {
		// Xử lý cho dataset loại TEXT/TABULAR/MULTIMODAL với CSV
		if (csvMetadata?.columns) {
			console.log('Setting columns from CSV:', csvMetadata.columns)
			const options = Object.entries(csvMetadata.columns).map(
				([key, val]) => ({
					value: key,
					label: `${key} (${val.unique_class_count ?? 0} classes)`,
					uniqueClassCount: val.unique_class_count ?? 0,
				})
			)
			setColumnOptions(options)
			if (options.length === 1 && !isManualLabelTask(selectedTaskType)) {
				setLabels([options[0].value])
			}
		} else {
			setColumnOptions([])
		}
	}, [csvMetadata])

	const handleAddLabel = () => {
		const v = newLabel.trim()
		if (v && !expectedLabels.includes(v)) {
			setLabels((prev) => [...prev, v])
			setLabelColors((prev) => ({
				...prev,
				[v]: '#' + Math.floor(Math.random() * 16777215).toString(16), // Màu random
			}))
			setNewLabel('')
		}
	}

	const handleRemoveLabel = (labelToRemove) => {
		setLabels((prev) => prev.filter((l) => l !== labelToRemove))
		setLabelColors((prev) => {
			const copy = { ...prev }
			delete copy[labelToRemove]
			return copy
		})
	}
	const handleColorChange = (label, color) => {
		setLabelColors((prev) => ({
			...prev,
			[label]: color.toHexString(),
		}))
	}

	const handleSubmit = (values) => {
		const selectedLabel = expectedLabels[0]
		const column = columnOptions.find((opt) => opt.value === selectedLabel)
		const uniqueClassCount = column?.uniqueClassCount ?? 0
		const is_binary_class = uniqueClassCount === 2

		const payload = {
			...values,
			taskType: taskType,
			description: description,
			expectedLabels,
			meta_data: {
				is_binary_class: is_binary_class,
				image_column: selectedImageColumn,
				label_colors: labelColors,
				series_column: selectedSeriesColumn,
				text_columns: selectedTextColumn,
				features_column: selectedFeaturesColumn,
			},
		}
		onSubmit(payload)
	}

	return (
		<>
			<style>{`
                .theme-form .ant-form-item-label > label {
                    color: var(--form-label-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .theme-form .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-input::placeholder {
                    color: var(--placeholder-color) !important;
                }
                
                .theme-form .ant-input:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .theme-form .ant-input:focus {
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }
                
                .theme-form .ant-input:disabled {
                    background: var(--input-disabled-bg) !important;
                    color: var(--input-disabled-color) !important;
                }
                
                .theme-form .ant-select-selector {
                    background: var(--select-selector-bg) !important;
                    border: 1px solid var(--select-selector-border) !important;
                    color: var(--select-selector-color) !important;
                }
                
                .theme-form .ant-select-selection-item {
                    color: var(--select-item-color) !important;
                }
                
                .theme-form .ant-select-selection-placeholder {
                    color: var(--select-placeholder-color) !important;
                }
                
                .theme-form .ant-select-arrow {
                    color: var(--select-arrow-color) !important;
                }
                
                .theme-form .ant-btn-primary {
                    background: var(--button-primary-bg) !important;
                    border: 1px solid var(--button-primary-border) !important;
                    color: var(--button-primary-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .theme-form .ant-btn-primary:hover {
                    background: var(--button-primary-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    transform: translateY(-1px) !important;
                }
                
                .theme-form .ant-btn-default {
                    background: var(--button-default-bg) !important;
                    border: 1px solid var(--button-default-border) !important;
                    color: var(--button-default-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-btn-default:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--border-hover) !important;
                    color: var(--text) !important;
                }
                
                .theme-form .ant-btn-dashed {
                    background: var(--button-dashed-bg) !important;
                    border: 1px dashed var(--button-dashed-border) !important;
                    color: var(--button-dashed-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-btn-dashed:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    color: var(--modal-close-hover) !important;
                }
                
                .theme-form .ant-tag {
                    background: var(--tag-bg) !important;
                    border: 1px solid var(--tag-border) !important;
                    color: var(--tag-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-tag .ant-tag-close-icon {
                    color: var(--tag-close-icon-color) !important;
                }
                
                .theme-form .ant-alert {
                    background: var(--alert-bg) !important;
                    border: 1px solid var(--alert-border) !important;
                    color: var(--alert-color) !important;
                }
                
                .theme-form .ant-alert-warning {
                    background: var(--alert-warning-bg) !important;
                    border-color: var(--alert-warning-border) !important;
                }
                
                .theme-form .ant-alert-info {
                    background: var(--alert-info-bg) !important;
                    border-color: var(--alert-info-border) !important;
                }
                
                .theme-form .ant-divider {
                    border-color: var(--divider-color) !important;
                }
                
                /* TextArea styling */
                .theme-form .ant-input-textarea .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 12px !important;
                    box-shadow: none !important;
                }
                
                .theme-form .ant-input-textarea .ant-input:focus {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    color: var(--input-color) !important;
                }
                
                .theme-form .ant-input-textarea .ant-input:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .theme-form .ant-input-textarea {
                    background: transparent !important;
                }
                
                .theme-form .ant-input-textarea-show-count .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 12px !important;
                }
                
                .theme-form .ant-input-textarea-show-count .ant-input:focus {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    color: var(--input-color) !important;
                }
                
                .theme-form .ant-input-textarea-show-count::after {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
			<Form
				form={form}
				layout="vertical"
				initialValues={{ ...initialValues }}
				onFinish={handleSubmit}
				className="theme-form"
			>
				<Form.Item
					name="name"
					label="Project Name"
					rules={[{ required: true, message: 'Enter project name' }]}
				>
					<Input
						placeholder="Enter project name"
						disabled
						style={{ color: 'var(--input-disabled-color)' }}
					/>
				</Form.Item>

				{datasetType === 'TIME_SERIES' && (
					<Form.Item label="Series Column" required>
						<Select
							placeholder="Select series column"
							value={selectedSeriesColumn || undefined}
							onChange={setSelectedSeriesColumn}
							allowClear
							optionFilterProp="children"
							maxTagCount="responsive"
						>
							{columnOptions.map((col) => (
								<Option key={col.value} value={col.value}>
									{col.label}
								</Option>
							))}
						</Select>
						{!selectedSeriesColumn && (
							<Alert
								message="Please select a series column for TIME_SERIES datasets."
								type="warning"
								showIcon
								className="mt-2"
							/>
						)}
					</Form.Item>
				)}

				{datasetType === 'TEXT' && (
					<Form.Item label="Text Column" required>
						<Select
							placeholder="Select text column"
							value={selectedTextColumn || undefined}
							onChange={setSelectedTextColumn}
							allowClear
							optionFilterProp="children"
							maxTagCount="responsive"
						>
							{columnOptions.map((col) => (
								<Option key={col.value} value={col.value}>
									{col.label}
								</Option>
							))}
						</Select>
						{!selectedTextColumn && (
							<Alert
								message="Please select a text column for TEXT datasets."
								type="warning"
								showIcon
								className="mt-2"
							/>
						)}
					</Form.Item>
				)}

				{datasetType === 'MULTIMODAL' && (
					<Form.Item label="Image Column" required>
						<Select
							placeholder="Select image column"
							value={selectedImageColumn || undefined}
							onChange={setSelectedImageColumn}
							allowClear
							optionFilterProp="children"
							maxTagCount="responsive"
						>
							{columnOptions.map((col) => (
								<Option key={col.value} value={col.value}>
									{col.label}
								</Option>
							))}
						</Select>
						{!selectedImageColumn && (
							<Alert
								message="Please select an image column for MULTIMODAL datasets."
								type="warning"
								showIcon
								className="mt-2"
							/>
						)}
					</Form.Item>
				)}

				<>
					{selectedTaskType === 'CLUSTERING' ? (
						<Form.Item
							label="Features Column"
							required
							// Không dùng name ở đây nếu bạn muốn tự quản lý qua state,
							// hoặc thêm name="featureColumns" nếu vẫn muốn form.validateFields()
						>
							<Select
								mode="multiple"
								placeholder="Select one or more feature columns"
								value={selectedFeaturesColumn}
								onChange={(vals) =>
									setSelectedFeaturesColumn(vals)
								}
								allowClear
								showSearch
								optionFilterProp="children"
								maxTagCount="responsive"
								style={{ width: '100%' }}
							>
								{columnOptions.map((col) => (
									<Option key={col.value} value={col.value}>
										{col.label}
									</Option>
								))}
							</Select>

							{(!selectedFeaturesColumn ||
								selectedFeaturesColumn.length === 0) && (
								<Alert
									message="Please select one or more feature columns for CLUSTERING datasets."
									type="warning"
									showIcon
									className="mt-2"
								/>
							)}
						</Form.Item>
					) : (
						<Form.Item label="Expected Labels" required>
							{!selectedTaskType ? (
								<Alert
									message="Please select Task Type first"
									type="warning"
									showIcon
								/>
							) : columnOptions.length > 0 &&
							  !isManualLabelTask(selectedTaskType) ? (
								// 1. Dành cho TEXT/TABULAR/MULTIMODAL: Chọn cột từ CSV
								<Select
									mode={
										selectedTaskType.startsWith(
											'MULTILABEL'
										)
											? 'multiple'
											: undefined
									}
									placeholder={
										selectedTaskType.startsWith(
											'MULTILABEL'
										)
											? 'Select one or more label columns'
											: 'Select a label column'
									}
									value={
										selectedTaskType.startsWith(
											'MULTILABEL'
										)
											? expectedLabels
											: expectedLabels[0] || undefined
									}
									onChange={(value) => {
										const isMultiLabel =
											selectedTaskType.startsWith(
												'MULTILABEL'
											)
										setLabels(
											isMultiLabel ? value : [value]
										)
									}}
									optionLabelProp="label"
									allowClear
								>
									{columnOptions.map((col) => (
										<Option
											key={col.value}
											value={col.value}
											label={col.value}
										>
											<div
												style={{
													display: 'flex',
													justifyContent:
														'space-between',
												}}
											>
												<span>{col.value}</span>
												<i
													style={{
														fontSize: '0.8em',
														color: 'var(--secondary-text)',
													}}
												>
													{`${col.uniqueClassCount} classes`}
												</i>
											</div>
										</Option>
									))}
								</Select>
							) : (
								// 2. Dành cho IMAGE, SEGMENTATION, DETECTION: Nhập/sửa thủ công
								<>
									<div className="flex gap-2">
										<Input
											placeholder="Enter label name"
											value={newLabel}
											onChange={(e) =>
												setNewLabel(e.target.value)
											}
											onPressEnter={handleAddLabel}
										/>
										<Button
											type="dashed"
											icon={<PlusOutlined />}
											onClick={handleAddLabel}
											disabled={!newLabel.trim()}
										>
											Add
										</Button>
									</div>

									{expectedLabels.length > 0 ? (
										<div className="flex flex-wrap gap-2 mt-2">
											{expectedLabels.map((label) => (
												<div
													key={label}
													className="flex items-center gap-2"
												>
													<Tag
														closable
														onClose={() =>
															handleRemoveLabel(
																label
															)
														}
														color="blue"
													>
														{label}
													</Tag>
													{selectedTaskType ===
														'SEMANTIC_SEGMENTATION' && (
														<ColorPicker
															value={
																labelColors[
																	label
																] || '#ffffff'
															}
															onChange={(color) =>
																handleColorChange(
																	label,
																	color
																)
															}
														/>
													)}
												</div>
											))}
										</div>
									) : (
										<Alert
											message="At least one label is required"
											type="info"
											showIcon
											className="mt-2"
										/>
									)}
								</>
							)}
						</Form.Item>
					)}
				</>

				<Divider />

				<Form.Item>
					<Space
						style={{ justifyContent: 'flex-end', width: '100%' }}
					>
						<Button onClick={onBack}>Back</Button>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							disabled={expectedLabels.length === 0}
						>
							Create
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</>
	)
}
