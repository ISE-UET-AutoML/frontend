import React from 'react'
import {
	Modal,
	Row,
	Col,
	Button,
	Card,
	Space,
	Typography,
	Input,
	Tooltip,
	Select,
	Tag,
	message,
	Form,
	Slider,
	InputNumber,
	Radio,
} from 'antd'
import {
	InfoCircleOutlined,
	CopyrightOutlined,
	GlobalOutlined,
	LockOutlined,
	CameraOutlined,
	FileTextOutlined,
	LineChartOutlined,
	TagsOutlined,
	DatabaseOutlined,
	ClusterOutlined,
	DeploymentUnitOutlined,
	RadarChartOutlined,
	FundOutlined,
	PictureOutlined,
} from '@ant-design/icons'

import { TASK_TYPES } from 'src/constants/types'
import image_classification from 'src/assets/images/image_classification.jpg'
import text_classification from 'src/assets/images/text_classification.jpg'
import multilabel_text_classification from 'src/assets/images/multilabel_text_classification.jpg'
import tabular_classification from 'src/assets/images/tabular_classification.jpg'
import tabular_regression from 'src/assets/images/tabular_regression.jpg'
import multilabel_tabular_classification from 'src/assets/images/multilabel_tabular_classification.jpg'
import multimodal_classification from 'src/assets/images/multimodal_classification.jpg'
import multilabel_image_classification from 'src/assets/images/multilabel_image_classification.jpg'
import object_detection from 'src/assets/images/object_detection.jpg'
import semantic_segmentation from 'src/assets/images/semantic_segmentation.jpg'
import time_series_forecasting from 'src/assets/images/time_series_forecasting.jpg'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const projType = Object.keys(TASK_TYPES)

const tagIcons = {
	'Computer Vision': <CameraOutlined />,
	'Image Analysis': <PictureOutlined />,
	NLP: <FileTextOutlined />,
	'Text Processing': <FileTextOutlined />,
	'Sentiment Analysis': <FundOutlined />,
	'Text Mining': <ClusterOutlined />,
	'Machine Learning': <DeploymentUnitOutlined />,
	'Structured Data': <DatabaseOutlined />,
	Classification: <TagsOutlined />,
	Prediction: <LineChartOutlined />,
	Numerical: <LineChartOutlined />,
	'Multi-Label': <TagsOutlined />,
	'Complex Analysis': <ClusterOutlined />,
	'Multi-Modal': <DeploymentUnitOutlined />,
	Fusion: <ClusterOutlined />,
	'Advanced AI': <DeploymentUnitOutlined />,
	'Image Recognition': <CameraOutlined />,
	'Object Detection': <RadarChartOutlined />,
	Localization: <RadarChartOutlined />,
	'Pixel-Level': <PictureOutlined />,
	Segmentation: <PictureOutlined />,
	'Time Series': <LineChartOutlined />,
	Forecasting: <LineChartOutlined />,
	'Trend Analysis': <LineChartOutlined />,
}

const imgArray = [
	image_classification,
	text_classification,
	multilabel_text_classification,
	tabular_classification,
	tabular_regression,
	multilabel_tabular_classification,
	multimodal_classification,
	multilabel_image_classification,
	object_detection,
	semantic_segmentation,
	time_series_forecasting,
]

const projectTypeImages = {}
projType.forEach((type, index) => {
	projectTypeImages[type] = imgArray[index]
})

const typeDescription = [
	'Identify and categorize objects in images using advanced computer vision techniques.',
	'Categorize text data based on content, sentiment, and contextual meaning.',
	'Assign multiple relevant labels to each text input for comprehensive classification.',
	'Classify structured tabular data rows into predefined categories.',
	'Predict continuous numerical values for structured tabular datasets.',
	'Assign multiple labels to each row in tabular data for complex analysis.',
	'Combine multiple data sources (text + images + structured data) for enhanced classification.',
	'Assign multiple relevant labels to each image for detailed visual analysis.',
	'Identify and locate multiple objects in images with precise bounding boxes.',
	'Segment images at pixel level to identify specific objects or regions of interest.',
	'Predict future values based on historical time series patterns and trends.',
]

const typeTags = [
	['Computer Vision', 'Single Label', 'Image Analysis'],
	['NLP', 'Text Processing', 'Sentiment Analysis'],
	['NLP', 'Multi-Label', 'Text Mining'],
	['Machine Learning', 'Structured Data', 'Classification'],
	['Machine Learning', 'Prediction', 'Numerical'],
	['Multi-Label', 'Structured Data', 'Complex Analysis'],
	['Multi-Modal', 'Fusion', 'Advanced AI'],
	['Computer Vision', 'Multi-Label', 'Image Recognition'],
	['Computer Vision', 'Object Detection', 'Localization'],
	['Computer Vision', 'Pixel-Level', 'Segmentation'],
	['Time Series', 'Forecasting', 'Trend Analysis'],
]

const getImageByProjectType = (selectedProjectType) => {
	return projectTypeImages[selectedProjectType] || image_classification // default image
}

const ManualCreationModal = ({
	open,
	onCancel,
	onSubmit,
	initialProjectName = '',
	initialDescription = '',
	initialTaskType = projType[0],
	initialVisibility = 'private',
	initialLicense = 'MIT',
	initialExpectedAccuracy = 75,
	isSelected,
	onSelectType,
	onSetCreatingProjectInfo,
}) => {
	const [form] = Form.useForm()

	// Fix: Lấy index đã chọn và project type tương ứng
	const selectedIndex = isSelected.findIndex((item) => item === true)
	const selectedProjectType =
		selectedIndex !== -1 ? projType[selectedIndex] : null

	React.useEffect(() => {
		if (open) {
			form.setFieldsValue({
				name: initialProjectName,
				description: initialDescription,
				task_type: initialTaskType,
				visibility: initialVisibility,
				license: initialLicense,
				expected_accuracy: initialExpectedAccuracy,
			})
		}
	}, [
		open,
		form,
		initialProjectName,
		initialDescription,
		initialTaskType,
		initialVisibility,
		initialLicense,
		initialExpectedAccuracy,
	])

	const handleSubmit = (values) => {
		onSubmit(values)
		onSetCreatingProjectInfo(prev => ({
			...prev,
			project_type: form.getFieldValue('task_type')
		}));
		console.log('Selected project type on submit:', form.getFieldValue('task_type'));
	}

	const handleSelectType = (e, idx) => {
		onSelectType(e, idx)
		form.setFieldValue('task_type', projType[idx])
	}
	return (
		<>
			<style>{`
                .theme-manual-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 16px !important;
                }

                .theme-manual-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                }

                .theme-manual-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }

                .theme-manual-modal .ant-modal-close {
                    color: var(--modal-close-color) !important;
                }

                .theme-manual-modal .ant-modal-close:hover {
                    color: var(--modal-close-hover) !important;
                }

                .theme-manual-modal .ant-typography {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }

                .theme-manual-modal .ant-typography.ant-typography-secondary {
                    color: var(--secondary-text) !important;
                }

                .theme-manual-modal .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    border-radius: 8px !important;
                }

                .theme-manual-modal .ant-input:focus,
                .theme-manual-modal .ant-input-focused {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    color: var(--input-color) !important;
                }

                .theme-manual-modal .ant-input:hover {
                    border-color: var(--input-hover-border) !important;
                }

                .theme-manual-modal .ant-input::placeholder {
                    color: var(--placeholder-color) !important;
                }

                .theme-manual-modal .ant-input-prefix .anticon {
                    color: var(--accent-text) !important;
                }

                .theme-manual-modal .ant-input-suffix .anticon {
                    color: var(--secondary-text) !important;
                }

                /* Input wrapper styling */
                .theme-manual-modal .ant-input-affix-wrapper {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }

                .theme-manual-modal .ant-input-affix-wrapper:focus,
                .theme-manual-modal .ant-input-affix-wrapper-focused {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }

                .theme-manual-modal .ant-input-affix-wrapper:hover {
                    border-color: var(--input-hover-border) !important;
                }

                .theme-manual-modal .ant-input-affix-wrapper .ant-input {
                    background: transparent !important;
                    color: var(--input-color) !important;
                }

                .theme-manual-modal .ant-input-affix-wrapper .ant-input:focus {
                    background: transparent !important;
                    color: var(--input-color) !important;
                }

                /* Force override for all input elements */
                .theme-manual-modal input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }

                .theme-manual-modal input:focus {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    color: var(--input-color) !important;
                }

                .theme-manual-modal input:hover {
                    border-color: var(--input-hover-border) !important;
                }

                .theme-manual-modal .ant-card {
                    background: var(--card-gradient) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                }

                .theme-manual-modal .ant-card:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--border-hover) !important;
                    transform: translateY(-2px) !important;
                }

                .theme-manual-modal .ant-card.selected {
                    background: var(--selection-bg) !important;
                    border-color: var(--accent-text) !important;
                    box-shadow: 0 4px 16px var(--selection-bg) !important;
                }

                .theme-manual-modal .ant-card img {
                    border-radius: 8px !important;
                    filter: brightness(0.9) !important;
                }

                .theme-manual-modal .ant-btn-primary {
                    background: var(--button-primary-bg) !important;
                    border: 1px solid var(--button-primary-border) !important;
                    color: var(--button-primary-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                    border-radius: 8px !important;
                }

                .theme-manual-modal .ant-btn-primary:hover {
                    background: var(--button-primary-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    transform: translateY(-1px) !important;
                }

                .theme-manual-modal .ant-tooltip .ant-tooltip-inner {
                    background: var(--surface) !important;
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    border: 1px solid var(--border) !important;
                }

                .theme-manual-modal .ant-tooltip .ant-tooltip-arrow::before {
                    background: var(--surface) !important;
                    border: 1px solid var(--border) !important;
                }

                /* TextArea styling */
                .theme-manual-modal .ant-input-textarea .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }

                .theme-manual-modal .ant-input-textarea .ant-input:focus {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }

                /* Scrollbar styling */
                .theme-manual-modal .overflow-auto::-webkit-scrollbar {
                    width: 6px !important;
                }

                .theme-manual-modal .overflow-auto::-webkit-scrollbar-track {
                    background: var(--border) !important;
                    border-radius: 3px !important;
                }

                .theme-manual-modal .overflow-auto::-webkit-scrollbar-thumb {
                    background: var(--accent-text) !important;
                    border-radius: 3px !important;
                    opacity: 0.5 !important;
                }

                .theme-manual-modal .overflow-auto::-webkit-scrollbar-thumb:hover {
                    opacity: 0.7 !important;
                }
				.dark-build-slider .ant-slider-track {
                    background: var(--tabs-ink-bar) !important;
                    height: 6px !important;
                }
                
                .dark-build-slider .ant-slider-rail {
                    background: var(--border) !important;
                    height: 6px !important;
                }
                
                .dark-build-slider .ant-slider-handle {
                    border-color: var(--accent-text) !important;
                    width: 20px !important;
                    height: 20px !important;
                    margin-top: 0px !important;
                }
                
                .dark-build-slider .ant-slider-handle:hover {
                    border-color: var(--tabs-ink-bar) !important;
                }
            `}</style>
			<Modal
				open={open}
				onCancel={onCancel}
				footer={null}
				width={1800}
				centered
				className="theme-manual-modal"
				styles={{
					content: {
						background: 'var(--modal-bg)',
						border: '1px solid var(--modal-border)',
						borderRadius: '16px',
					},
					header: {
						background: 'var(--modal-header-bg)',
						borderBottom: '1px solid var(--modal-header-border)',
					},
					title: {
						color: 'var(--modal-title-color)',
						fontFamily: 'Poppins, sans-serif',
						fontWeight: 600,
					},
					close: {
						color: 'var(--modal-close-color)',
					},
				}}
			>
				<Title
					level={3}
					style={{
						fontFamily: 'Poppins, sans-serif',
						fontWeight: 600,
						color: 'var(--text)',
						textAlign: 'center',
						marginBottom: 24,
					}}
				>
					Let&apos;s Create Your Project
				</Title>

				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmit}
					initialValues={{
						name: initialProjectName,
						description: initialDescription,
						task_type: initialTaskType,
						visibility: initialVisibility,
						license: initialLicense,
						expected_accuracy: initialExpectedAccuracy,
					}}
				>
					<Row gutter={[24, 24]}>
						<Col span={6}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										Project Name
									</span>
								}
								name="name"
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message: 'Please enter project name!',
									},
									{
										min: 3,
										message:
											'Name must be at least 3 characters',
									},
								]}
							>
								<Input
									placeholder="E.g., Customer Churn Predictor"
									prefix={<InfoCircleOutlined />}
								/>
							</Form.Item>
						</Col>

						<Col span={6}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										License
									</span>
								}
								name="license"
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message: 'Please select license!',
									},
								]}
							>
								<Select
									placeholder="Select license"
									suffixIcon={<CopyrightOutlined />}
								>
									<Option value="mit">MIT License</Option>
									<Option value="apache">Apache 2.0</Option>
									<Option value="gpl">GPL v3</Option>
									<Option value="proprietary">
										Proprietary
									</Option>
								</Select>
							</Form.Item>
						</Col>

						<Col span={6}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										Expected Accuracy (%)
									</span>
								}
								name="expected_accuracy"
								initialValue={75}
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message:
											'Please input expected accuracy!',
									},
									{
										type: 'number',
										min: 0,
										max: 100,
										message:
											'Accuracy must be between 0 and 100!',
									},
								]}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '16px',
									}}
								>
									<Slider
										min={0}
										max={100}
										step={1}
										style={{ flex: 1 }}
										defaultValue={75}
										onChange={(value) =>
											form.setFieldValue(
												'expected_accuracy',
												value
											)
										}
										className="dark-build-slider"
									/>
								</div>
							</Form.Item>
						</Col>

						<Col span={6}>
							<Form.Item
								label={
									<span
										style={{
											color: '#fff',
											fontSize: 20,
											fontWeight: 500,
										}}
									>
										Visibility
									</span>
								}
								name="visibility"
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message: 'Please choose visibility!',
									},
								]}
							>
								<Radio.Group>
									<Radio value="private">
                                        <span
                                            style={{
                                                color: 'var(--text)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                        >
											Private
										</span>
									</Radio>
									<Radio value="public">
                                        <span
                                            style={{
                                                color: 'var(--text)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                        >
											Public
										</span>
									</Radio>
								</Radio.Group>
							</Form.Item>
						</Col>
					</Row>

					{/* Description */}
					<Row gutter={[24, 24]}>
						<Col span={24}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										Description
									</span>
								}
								name="description"
							>
								<Tooltip title="Explain what your project aims to achieve">
									<TextArea
										rows={3}
										placeholder="Describe your project's goals and requirements..."
										showCount
									/>
								</Tooltip>
							</Form.Item>
						</Col>
					</Row>

					{/* Project Types + Preview */}
					<Row gutter={[24, 24]}>
						<Col span={12}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: 16,
									maxHeight: 525,
									overflowY: 'auto',
									paddingRight: 8,
								}}
							>
								{projType.map(
									(type, idx) => (
										console.log(
											'isSelected array:',
											isSelected
										),
										(
											<Card
												key={type}
												hoverable
												onClick={(e) =>
													handleSelectType(e, idx)
												}
												className={
													isSelected[idx]
														? 'selected'
														: ''
												}
												style={{
													borderRadius: 12,
													border: isSelected[idx]
														? '2px solid var(--primary-color)'
														: '1px solid var(--border-color)',
													backgroundColor: isSelected[
														idx
													]
														? 'var(--selected-bg)'
														: 'var(--card-bg)',
												}}
											>
												<Row
													justify="space-between"
													align="middle"
													style={{ marginBottom: 8 }}
												>
													<Title
														level={4}
														style={{ margin: 0 }}
													>
														{TASK_TYPES[type].type}
													</Title>
													<Space size={[4, 4]} wrap>
														{typeTags[idx].map(
															(tag) => (
																<Tag
																	key={tag}
																	color="blue"
																	style={{
																		display:
																			'flex',
																		alignItems:
																			'center',
																		gap: 4,
																	}}
																>
																	{
																		tagIcons[
																			tag
																		]
																	}{' '}
																	{tag}
																</Tag>
															)
														)}
													</Space>
												</Row>
												<Text
													style={{
														color: 'var(--secondary-text)',
													}}
												>
													{typeDescription[idx]}
												</Text>
											</Card>
										)
									)
								)}
							</div>
						</Col>

						<Col span={12}>
							{selectedProjectType && (
								<img
									src={getImageByProjectType(
										selectedProjectType
									)}
									alt={selectedProjectType || 'Project Type'}
									style={{
										width: '100%',
										height: 525, // Cố định chiều cao 525px
										borderRadius: 12,
										objectFit: 'contain', // Giữ tỷ lệ ảnh và cắt phần thừa nếu cần
										boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
										backgroundColor: '#f5f5f5',
									}}
								/>
							)}
						</Col>
					</Row>

					{/* Submit */}
					<Row justify="end" style={{ marginTop: 24 }}>
						<Button
							type="primary"
							htmlType="submit"
							size="large"
							disabled={selectedIndex === -1}
						>
							Next
						</Button>
					</Row>
				</Form>
			</Modal>
		</>
	)
}

export default ManualCreationModal
