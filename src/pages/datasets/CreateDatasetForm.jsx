// CreateDatasetForm.jsx
import React, { useState, useRef, useEffect } from 'react'
import {
	Form,
	Input,
	Select,
	Radio,
	Button,
	message,
	Tabs,
	Row,
	Col,
	Alert,
	Collapse,
	Table,
	Typography,
	Image,
	Spin,
} from 'antd'
import {
	FolderOutlined,
	FileOutlined,
	DeleteOutlined,
	InfoCircleOutlined,
	QuestionCircleOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	ReloadOutlined,
} from '@ant-design/icons'
import { TASK_TYPES, DATASET_TYPES } from 'src/constants/types'
import { organizeFiles, createChunks, extractCSVMetaData } from 'src/utils/file'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

export default function CreateDatasetForm({
	onNext,
	onCancel,
	onBack,
	isStep = false,
	initialValues,
	initialFiles = [],
	initialDetectedLabels = [],
	initialCsvMetadata = null,
	disableFields = [],
	hideFields = [],
}) {
	const [form] = Form.useForm()
	const [hasFormErrors, setHasFormErrors] = useState(false)
	const [files, setFiles] = useState(initialFiles)
	const [selectedUrlOption, setSelectedUrlOption] = useState('remote-url')
	const [service, setService] = useState(initialValues?.service || 'AWS_S3')
	const [bucketName, setBucketName] = useState(
		initialValues?.bucket_name || 'user-private-dataset'
	)
	const [datasetType, setDatasetType] = useState(initialValues?.dataset_type)
	const fileRefs = useRef(new Map())
	const taskType = initialValues?.task_type
	// States for validation and preview
	const [imageStructureValid, setImageStructureValid] = useState(null)
	const [csvPreview, setCsvPreview] = useState(null)
	const [csvHasHeader, setCsvHasHeader] = useState(null)
	const [isDataValid, setIsDataValid] = useState(false)
	const [imagePreviews, setImagePreviews] = useState([]) // State mới cho image preview

	// States for task-specific validation
	const [isRegressionTargetValid, setIsRegressionTargetValid] = useState(null)
	const [isMultilabelFormatValid, setIsMultilabelFormatValid] = useState(null)
	const [isValidating, setIsValidating] = useState(false)
	const [csvContainsNaN, setCsvContainsNaN] = useState(null)

	const fileInputRef = useRef(null)

	const calcSizeKB = (fileArr) => {
		const totalSize = fileArr.reduce(
			(sum, f) => sum + (f.fileObject?.size || 0),
			0
		)
		return totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00'
	}

	const [totalKbytes, setTotalKbytes] = useState(calcSizeKB(initialFiles))
	const [detectedLabels, setDetectedLabels] = useState(initialDetectedLabels)
	const [csvMetadata, setCsvMetadata] = useState(initialCsvMetadata)

	useEffect(() => {
		form.setFieldsValue(initialValues)
		if (initialValues?.dataset_type) {
			setDatasetType(initialValues.dataset_type)
		}
	}, [initialValues, form])

	useEffect(() => {
		return () => {
			imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
		}
	}, [imagePreviews])

	// whenever initial props change (when coming back), refresh states
	useEffect(() => {
		if (initialFiles.length) {
			setFiles(initialFiles)
			setTotalKbytes(calcSizeKB(initialFiles))
		}
		if (initialDetectedLabels.length) {
			setDetectedLabels(initialDetectedLabels)
		}
		if (initialCsvMetadata) {
			setCsvMetadata(initialCsvMetadata)
		}
	}, [initialFiles, initialDetectedLabels, initialCsvMetadata])

	const validateFiles = (files, currentDatasetType) => {
		const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
		const allowedTextTypes = [
			'text/csv',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		]
		const allowedTypes = {
			IMAGE: allowedImageTypes,
			TEXT: allowedTextTypes,
			TABULAR: allowedTextTypes,
			MULTIMODAL: [...allowedImageTypes, ...allowedTextTypes],
			TIME_SERIES: allowedTextTypes,
		}
		const validExts = allowedTypes[currentDatasetType] || []
		return files.filter((file) => validExts.includes(file.type))
	}

	const validateImageFolderStructure = (files) => {
		if (!files || files.length === 0) return false
		const labelFolders = new Set()

		for (const file of files) {
			const path = file.path || file.webkitRelativePath || file.name
			const parts = path.split('/')

			if (parts.length < 2) {
				return false
			}

			const parentFolder = parts[parts.length - 2]
			labelFolders.add(parentFolder)
		}

		return labelFolders.size >= 2
	}

	const validateFullCsv = (csvFile, currentTaskType) => {
		return new Promise((resolve) => {
			let isValid = true
			let labelColumn = ''

			Papa.parse(csvFile, {
				header: true,
				skipEmptyLines: true,
				step: (results, parser) => {
					if (!labelColumn) {
						labelColumn =
							results.meta.fields[results.meta.fields.length - 1]
					}
					const labelValue = results.data[labelColumn]

					if (currentTaskType === 'TABULAR_REGRESSION') {
						if (labelValue && isNaN(parseFloat(labelValue))) {
							isValid = false
							parser.abort() // Stop parsing on first error
						}
					} else if (
						currentTaskType === 'MULTILABEL_TEXT_CLASSIFICATION' ||
						currentTaskType === 'MULTILABEL_TABULAR_CLASSIFICATION'
					) {
						if (labelValue) {
							if (
								labelValue.includes(',') ||
								labelValue.includes('|')
							) {
								isValid = false
								parser.abort()
							}

							const labels = labelValue.includes(';')
								? labelValue.split(';')
								: [labelValue] // coi là single-label

							if (labels.some((l) => l.trim() === '')) {
								isValid = false
								parser.abort()
							}
						}
					}
				},
				complete: () => {
					resolve(isValid)
				},
				error: () => {
					resolve(false)
				},
			})
		})
	}

	const previewCsv = (csvFile, currentTaskType) => {
		Papa.parse(csvFile, {
			header: true,
			preview: 10,
			skipEmptyLines: true,
			complete: (results) => {
				const { data, meta } = results
				if (data.length > 0 && meta.fields && meta.fields.length > 0) {
					setCsvHasHeader(true)
					setCsvPreview(data.slice(0, 3))
					const labelColumn = meta.fields[meta.fields.length - 1]

					// Task-specific validations
					/*switch (currentTaskType) {
                        case 'TABULAR_REGRESSION':
                            const allAreFloats = data.every(row => !isNaN(parseFloat(row[labelColumn])));
                            setIsRegressionTargetValid(allAreFloats);
                            break;
                        case 'MULTILABEL_TEXT_CLASSIFICATION':
                        case 'MULTILABEL_TABULAR_CLASSIFICATION':
                            const someHaveSeparator = data.some(row => typeof row[labelColumn] === 'string' && row[labelColumn].includes(';'));
                            setIsMultilabelFormatValid(someHaveSeparator);
                            break;
                        default:
                            break;
                    }*/
				} else {
					setCsvHasHeader(false)
					setCsvPreview(null)
				}
			},
			error: () => {
				setCsvHasHeader(false)
				setCsvPreview(null)
				message.error('Could not parse the CSV file.')
			},
		})
	}
	const handleReset = () => {
		// Clear file input visually
		if (fileInputRef.current) {
			fileInputRef.current.value = null
		}

		// Reset all states
		setFiles([])
		setTotalKbytes(0)
		setDetectedLabels([])
		setCsvMetadata(null)
		setImageStructureValid(null)
		setCsvPreview(null)
		setCsvHasHeader(null)
		setIsRegressionTargetValid(null)
		setIsMultilabelFormatValid(null)
		setCsvContainsNaN(null)
		setImagePreviews((prev) => {
			prev.forEach((p) => URL.revokeObjectURL(p.url))
			return []
		})
		message.info('Form has been reset.')
	}
	const handleFileChange = async (event) => {
		setImageStructureValid(null)
		setCsvPreview(null)
		setCsvHasHeader(null)
		setIsRegressionTargetValid(null)
		setIsMultilabelFormatValid(null)
		setImagePreviews((prev) => {
			prev.forEach((p) => URL.revokeObjectURL(p.url))
			return []
		})

		const uploadedFiles = Array.from(event.target.files || [])

		if (!datasetType) {
			message.error(
				'Please select a dataset type before uploading files.'
			)
			return
		}

		const validatedFiles = validateFiles(uploadedFiles, datasetType)

		// If nothing matches the allowed types for the selected dataset type, show an error and reset
		if (uploadedFiles.length > 0 && validatedFiles.length === 0) {
			message.error({
				content:
					'Selected files are not compatible with the chosen dataset type. Please upload the correct file types.',
				key: 'uploadInvalid',
				duration: 3,
			})
			if (fileInputRef.current) {
				fileInputRef.current.value = null
			}
			setFiles([])
			setTotalKbytes(0)
			setDetectedLabels([])
			setCsvMetadata(null)
			setIsDataValid(false)
			return
		}

		if (validatedFiles.length !== uploadedFiles.length) {
			message.warning(
				'Some files were ignored due to incompatible types.'
			)
		}
		let valid = true

		if (datasetType === 'IMAGE') {
			const isValidStructure =
				validateImageFolderStructure(validatedFiles)
			setImageStructureValid(isValidStructure)
			if (!isValidStructure) {
				message.error(
					'The folder structure is incorrect. Please ensure all images are inside labeled subdirectories.',
					5
				)
				valid = false
			}
			const imageFiles = validatedFiles
				.filter((f) => f.type.startsWith('image/'))
				.map((f) => ({ path: f.webkitRelativePath, fileObject: f }))
			const groupedByLabel = organizeFiles(imageFiles)
			const previews = []
			for (const [label, filesInLabel] of groupedByLabel.entries()) {
				if (filesInLabel.length > 0) {
					previews.push({
						url: URL.createObjectURL(filesInLabel[0].fileObject),
						label: label,
					})
				}
			}
			setImagePreviews(previews.slice(0, 8))
		}

		const csvFile = validatedFiles.find((file) =>
			(file.webkitRelativePath || file.name || '')
				.toLowerCase()
				.endsWith('.csv')
		)
		const excelFile = validatedFiles.find(
			(file) =>
				(file.name || '').toLowerCase().endsWith('.xlsx') ||
				(file.name || '').toLowerCase().endsWith('.xls')
		)

		let effectiveCsvFile = csvFile

		if (excelFile) {
			try {
				const data = await excelFile.arrayBuffer()
				const workbook = XLSX.read(data, { type: 'array' })
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]

				// Convert sheet to CSV
				const csvString = XLSX.utils.sheet_to_csv(sheet)

				// Create a Blob and wrap in File so Papa.parse có thể xử lý
				const csvBlob = new Blob([csvString], { type: 'text/csv' })
				effectiveCsvFile = new File(
					[csvBlob],
					excelFile.name.replace(/\.(xlsx|xls)$/i, '.csv'),
					{ type: 'text/csv' }
				)

				//message.success(`Converted Excel file "${excelFile.name}" to CSV for validation.`);
			} catch (err) {
				console.error('Excel to CSV conversion failed:', err)
				message.error('Failed to convert Excel file to CSV.')
				valid = false
			}
		}
		if (
			(datasetType === 'TEXT' ||
				datasetType === 'TABULAR' ||
				datasetType === 'MULTIMODAL') &&
			effectiveCsvFile
		) {
			previewCsv(effectiveCsvFile, taskType) // Corrected: Pass the File object directly
			setIsValidating(true)
			const isFullyValid = await validateFullCsv(
				effectiveCsvFile,
				taskType
			)
			if (taskType === 'TABULAR_REGRESSION') {
				setIsRegressionTargetValid(isFullyValid)
			}
			if (taskType.includes('MULTILABEL')) {
				setIsMultilabelFormatValid(true)
			}
			setIsValidating(false)
		}

		const hasImageFolder = validatedFiles.some(
			(file) =>
				file.webkitRelativePath &&
				file.webkitRelativePath.includes('/images/')
		)
		const hasCSVFile = !!csvFile

		if (datasetType === 'MULTIMODAL' && (!hasImageFolder || !hasCSVFile)) {
			message.error(
				'For MULTIMODAL datasets, upload a folder with an "images" subfolder and a CSV file.'
			)
			valid = false
			return
		}

		// If previous validations failed, reset selected files and exit early
		if (!valid) {
			if (fileInputRef.current) {
				fileInputRef.current.value = null
			}
			setFiles([])
			setTotalKbytes(0)
			setDetectedLabels([])
			setCsvMetadata(null)
			setIsDataValid(false)
			return
		}

		const totalSize = validatedFiles.reduce(
			(sum, file) => sum + (file.size || 0),
			0
		)
		const totalSizeInKB =
			totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00'

		const fileMetadata = validatedFiles.map((file) => ({
			path: file.webkitRelativePath || file.name,
			fileObject: file,
		}))

		const fileMap = organizeFiles(fileMetadata)
		const labels = Array.from(fileMap.keys()).filter(
			(label) => label !== 'unlabeled'
		)
		setDetectedLabels(labels)

		if (effectiveCsvFile) {
			try {
				const metadata = await extractCSVMetaData(effectiveCsvFile)
				setCsvMetadata(metadata)
			} catch (err) {
				message.error('Failed to analyze CSV file')
				valid = false
			}
		}

		// After metadata analysis, if invalid then reset and exit
		if (!valid) {
			if (fileInputRef.current) {
				fileInputRef.current.value = null
			}
			setFiles([])
			setTotalKbytes(0)
			setDetectedLabels([])
			setCsvMetadata(null)
			setIsDataValid(false)
			return
		}

		setFiles(fileMetadata)
		setTotalKbytes(totalSizeInKB)

		if (fileMetadata.length > 0 && valid) {
			setIsDataValid(true)
		} else {
			setIsDataValid(false)
		}
	}

	const handleDeleteFile = (filePath) => {
		const updatedFiles = files.filter((file) => file.path !== filePath)
		setFiles(updatedFiles)
		const fileMap = organizeFiles(updatedFiles)
		const labels = Array.from(fileMap.keys()).filter(
			(label) => label !== 'unlabeled'
		)
		setDetectedLabels(labels)
		setTotalKbytes(calcSizeKB(updatedFiles))

		const csvFile = updatedFiles.find((file) =>
			file.path.toLowerCase().endsWith('.csv')
		)
		if (csvFile) {
			extractCSVMetaData(csvFile.fileObject)
				.then(setCsvMetadata)
				.catch(() => setCsvMetadata(null))
		} else {
			setCsvMetadata(null)
			setCsvPreview(null)
			setCsvHasHeader(null)
		}
	}

	const renderPreparingInstructions = () => {
		const currentType = TASK_TYPES[taskType]
		if (!currentType || !currentType.preparingInstructions) {
			return null
		}

		const items = [
			{
				key: '1',
				label: (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							color: 'green',
							fontWeight: '500',
						}}
					>
						<QuestionCircleOutlined
							style={{ marginRight: '8px' }}
						/>
						Dataset Preparation Instructions
					</div>
				),
				children: (
					<div
						style={{
							display: 'flex',
							gap: '20px',
							alignItems: 'flex-start',
						}}
					>
						{/* Text instructions on the left */}
						<div
							style={{
								flex: 1,
								whiteSpace: 'pre-line',
								fontFamily: 'Poppins, sans-serif',
								fontSize: '13px',
								lineHeight: '1.6',
								padding: '12px',
								backgroundColor: 'rgba(0, 0, 0, 0.02)',
								borderRadius: '6px',
								border: `1px solid ${currentType.card.border}20`,
							}}
						>
							{currentType.preparingInstructions}
						</div>

						{/* Image on the right */}
						<div
							style={{
								flexShrink: 0,
								width: '350px',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'flex-start',
							}}
						>
							<Image
								width="100%"
								style={{
									borderRadius: '8px',
									border: '1px solid #e8e8e8',
								}}
								src={currentType.instructionImage}
								alt={`${currentType.type} example`}
							/>
						</div>
					</div>
				),
			},
		]

		return (
			<Collapse
				items={items}
				size="small"
				ghost
				style={{
					marginBottom: '16px',
					backgroundColor: 'rgba(255, 255, 255, 0.97)',
					border: `1px solid ${currentType.card.border}40`,
					borderRadius: '6px',
				}}
				className="preparing-instructions-collapse"
			/>
		)
	}
	const tabItems = [
		{
			key: 'file',
			label: 'File Upload',
			children: (
				<>
					<label
						htmlFor="file"
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '120px',
							border: '2px dashed var(--upload-border)',
							borderRadius: '12px',
							cursor: 'pointer',
							marginBottom: '16px',
							background: 'var(--upload-bg)',
							transition: 'all 0.3s ease',
						}}
						onMouseEnter={(e) => {
							const target = e.currentTarget
							target.style.borderColor =
								'var(--modal-close-hover)'
							target.style.background = 'var(--hover-bg)'
						}}
						onMouseLeave={(e) => {
							const target = e.currentTarget
							target.style.borderColor = 'var(--upload-border)'
							target.style.background = 'var(--upload-bg)'
						}}
					>
						<div
							style={{
								textAlign: 'center',
								background: 'transparent',
							}}
						>
							<FolderOutlined
								style={{
									fontSize: '48px',
									color: 'var(--upload-icon)',
								}}
							/>
							<p
								style={{
									marginTop: '8px',
									color: 'var(--upload-text)',
									fontFamily: 'Poppins, sans-serif',
								}}
							>
								Drag and drop a folder or click to upload
							</p>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							name="file"
							id="file"
							webkitdirectory=""
							directory=""
							multiple
							style={{ display: 'none' }}
							onChange={handleFileChange}
						/>
					</label>
					{files.length > 0 && (
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								marginBottom: '12px',
							}}
						>
							<Button
								icon={<ReloadOutlined />}
								onClick={handleReset}
								size="middle"
								style={{
									fontFamily: 'Poppins',
									fontWeight: '500',
									borderRadius: '6px',
									display: 'flex',
									alignItems: 'center',
									gap: '6px',
									backgroundColor: '#ff4d4f',
									borderColor: '#ff4d4f',
									color: '#fff',
									height: '32px',
									padding: '4px 15px',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor =
										'#ff7875'
									e.currentTarget.style.borderColor =
										'#ff7875'
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor =
										'#ff4d4f'
									e.currentTarget.style.borderColor =
										'#ff4d4f'
								}}
							>
								Reset
							</Button>
						</div>
					)}

					<div
						style={{
							color: 'var(--text)',
							fontFamily: 'Poppins, sans-serif',
						}}
					>
						<span style={{ fontWeight: '500' }}>
							{files.length} Files
						</span>
						<span
							style={{
								marginLeft: '8px',
								color: 'var(--secondary-text)',
							}}
						>
							({totalKbytes} kB)
						</span>
					</div>
					{files.length > 0 && (
						<div
							style={{
								maxHeight: '200px',
								overflowY: 'auto',
								background: 'var(--upload-bg)',
								borderRadius: '8px',
								padding: '8px',
								marginTop: '12px',
							}}
						>
							{files.map((file) => (
								<div
									key={file.path}
									style={{
										display: 'flex',
										alignItems: 'center',
										borderBottom:
											'1px solid var(--divider-color)',
										padding: '8px 0',
										color: 'var(--text)',
									}}
								>
									<FileOutlined
										style={{
											marginRight: '8px',
											color: 'var(--upload-icon)',
										}}
									/>
									<span
										style={{
											flex: 1,
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										{file.path}
									</span>
									<span
										style={{
											marginLeft: '8px',
											color: 'var(--secondary-text)',
											fontSize: '12px',
										}}
									>
										(
										{(
											file.fileObject?.size / 1024 || 0
										).toFixed(2)}{' '}
										kB)
									</span>
									<Button
										type="text"
										icon={<DeleteOutlined />}
										onClick={() =>
											handleDeleteFile(file.path)
										}
										style={{
											color: 'var(--secondary-text)',
										}}
									/>
								</div>
							))}
						</div>
					)}
				</>
			),
		},
		{
			key: 'url',
			label: 'Remote URL',
			children: (
				<Form.Item
					label="URL"
					name="url"
					rules={[{ required: true, message: 'Please enter a URL' }]}
				>
					<Input placeholder="Enter remote URL" />
				</Form.Item>
			),
		},
	]
	const getCsvPreviewColumns = () => {
		if (!csvPreview || csvPreview.length === 0) return []

		const keys = Object.keys(csvPreview[0])
		const labelColumnKey = keys[keys.length - 1]

		return keys.map((key) => {
			const isLabelColumn = key === labelColumnKey

			// Cấu hình cho cột
			const columnConfig = {
				title: key,
				dataIndex: key,
				key: key,
			}

			if (isLabelColumn) {
				columnConfig.fixed = 'right'
				//columnConfig.width = 150;
				columnConfig.ellipsis = true
				columnConfig.onHeaderCell = () => ({
					style: {
						backgroundColor: '#8fc5ffff', // vàng nhạt
						fontWeight: 'bold',
					},
				})
			} else {
				columnConfig.ellipsis = true // vẫn giữ ellipsis
				columnConfig.onCell = () => ({
					style: {
						maxWidth: 300,
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					},
				})
			}

			return columnConfig
		})
	}

	const handleSubmit = (values) => {
		const payload = {
			...values,
			files,
			totalKbytes,
			dataset_type: datasetType,
			service,
			bucket_name: bucketName,
			detectedLabels,
			csvMetadata,
			meta_data: {
				detectedLabels,
				csvMetadata,
			},
		}
		onNext(payload)
	}

	return (
		<>
			<style>{/*... CSS styles from previous turn ...*/}</style>
			<Form
				form={form}
				layout="vertical"
				initialValues={initialValues}
				onFinish={handleSubmit}
				onFieldsChange={() => {
					const hasErrors = form
						.getFieldsError()
						.some((f) => (f.errors || []).length > 0)
					setHasFormErrors(hasErrors)
				}}
				className="theme-form"
				style={{
					display: 'flex',
					flexDirection: 'column',
					maxHeight: '70vh',
				}}
			>
				<div
					style={{
						flex: 1,
						overflowY: 'auto',
						minHeight: 0,
						paddingRight: 8,
					}}
				>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								label="Title"
								name="title"
								validateTrigger={['onChange', 'onBlur']}
								rules={[
									{
										required: true,
										message: 'Please enter a title',
									},
									{
										pattern: /^[\p{L}0-9 _-]+$/u,
										message:
											'Only letters, numbers, spaces, _ and - are allowed.',
									},
								]}
							>
								<Input
									placeholder="Enter dataset title"
									disabled={disableFields.includes('title')}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Type"
								name="dataset_type"
								rules={[
									{
										required: true,
										message: 'Please select a type',
									},
								]}
							>
								<Select
									placeholder="Select dataset type"
									onChange={(value) => {
										setDatasetType(value)
									}}
									disabled={disableFields.includes('type')}
								>
									{Object.entries(DATASET_TYPES).map(
										([key, value]) => (
											<Option key={key} value={key}>
												{value.type}
											</Option>
										)
									)}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					{renderPreparingInstructions()}

					<Form.Item name="description" label="Description">
						<TextArea
							rows={2}
							maxLength={500}
							showCount
							disabled={disableFields.includes('description')}
						/>
					</Form.Item>

					{!hideFields.includes('service') &&
						!hideFields.includes('bucket_name') && (
							<Row gutter={16}>
								<Col span={7}>
									<Form.Item label="Storage Provider">
										<Radio.Group
											value={service}
											onChange={(e) =>
												setService(e.target.value)
											}
										>
											<Radio value="AWS_S3">AWS S3</Radio>
											<Radio value="GCP_STORAGE">
												Google Cloud Storage
											</Radio>
										</Radio.Group>
									</Form.Item>
								</Col>
								<Col span={17}>
									<Form.Item label="Bucket Name">
										<Select
											value={bucketName}
											onChange={(value) =>
												setBucketName(value)
											}
										>
											<Option value="user-private-dataset">
												user-private-dataset
											</Option>
											<Option value="bucket-2">
												bucket-2
											</Option>
										</Select>
									</Form.Item>
								</Col>
							</Row>
						)}

					<Tabs defaultActiveKey="file" items={tabItems} />
					{/* Validation and Preview Section */}
					{isValidating && (
						<div className="text-center my-4">
							<Spin tip="Validating full file..." />
						</div>
					)}

					{/* Validation and Preview Section */}
					{imageStructureValid !== null && (
						<Alert
							message={
								<span className="font-semibold">
									Image Folder Structure Check
								</span>
							}
							description={
								imageStructureValid
									? 'The folder structure appears to be correct for image classification.'
									: "Incorrect structure. Images should be organized in subfolders named after their labels (e.g., 'cats/cat1.jpg')."
							}
							type={imageStructureValid ? 'success' : 'error'}
							showIcon
							icon={
								imageStructureValid ? (
									<CheckCircleOutlined />
								) : (
									<CloseCircleOutlined />
								)
							}
							className="mt-4"
						/>
					)}

					{csvHasHeader !== null && (
						<Alert
							message={
								<span className="font-semibold">
									Header Check
								</span>
							}
							description={
								csvHasHeader
									? 'The file appears to have a valid header row.'
									: 'A header row could not be detected. Please ensure the first row of your file contains column names.'
							}
							type={csvHasHeader ? 'success' : 'warning'}
							showIcon
							icon={
								csvHasHeader ? (
									<CheckCircleOutlined />
								) : (
									<InfoCircleOutlined />
								)
							}
							className="mt-4"
						/>
					)}
					{isRegressionTargetValid !== null && (
						<Alert
							message="Tabular Regression - Target Column Check"
							description={
								isRegressionTargetValid
									? 'Target column values appear to be valid numbers.'
									: 'Warning: Some values in the target column are not numbers (float).'
							}
							type={isRegressionTargetValid ? 'success' : 'error'}
							showIcon
							className="mt-4"
						/>
					)}
					{isMultilabelFormatValid !== null && (
						<Alert
							message="Multi-label - Label Column Check"
							description={
								isMultilabelFormatValid
									? 'Labels appear to be correctly formatted.'
									: "Warning: Labels should be separated by '; '."
							}
							type={
								isMultilabelFormatValid ? 'success' : 'warning'
							}
							showIcon
							className="mt-4"
						/>
					)}
					{csvPreview && (
						<div className="mt-4">
							<Text strong style={{ color: 'var(--text)' }}>
								File Preview (First 3 rows):
							</Text>
							<div
								style={{
									overflowX: 'auto',
									border: '1px solid #f0f0f0',
									borderRadius: '8px',
									marginTop: '8px',
								}}
							>
								<Table
									dataSource={csvPreview}
									columns={getCsvPreviewColumns()}
									pagination={false}
									size="small"
									bordered
									scroll={{ x: 'max-content' }}
								/>
							</div>
						</div>
					)}
					{imagePreviews.length > 0 && (
						<div
							className="mt-4"
							style={{
								background: 'var(--upload-bg)',
								borderRadius: '8px',
								padding: '16px',
								border: '1px solid var(--border-color)',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									marginBottom: '12px',
									gap: '8px',
								}}
							>
								<FileOutlined
									style={{
										fontSize: '16px',
										color: 'var(--primary-color)',
									}}
								/>
								<Text
									strong
									style={{
										fontSize: '15px',
										color: 'var(--text)',
									}}
								>
									Image Preview ({imagePreviews.length}{' '}
									folders detected)
								</Text>
							</div>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns:
										'repeat(auto-fill, minmax(140px, 1fr))',
									gap: '16px',
								}}
							>
								<Image.PreviewGroup>
									{imagePreviews.map((preview, index) => (
										<div
											key={index}
											style={{
												textAlign: 'center',
												background: 'var(--surface)',
												borderRadius: '8px',
												padding: '12px',
												boxShadow:
													'0 2px 8px rgba(0, 0, 0, 0.08)',
												transition: 'all 0.3s ease',
												cursor: 'pointer',
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform =
													'translateY(-4px)'
												e.currentTarget.style.boxShadow =
													'0 4px 16px rgba(0, 0, 0, 0.12)'
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform =
													'translateY(0)'
												e.currentTarget.style.boxShadow =
													'0 2px 8px rgba(0, 0, 0, 0.08)'
											}}
										>
											<Image
												width={116}
												height={116}
												src={preview.url}
												alt={`preview ${preview.label}`}
												style={{
													objectFit: 'cover',
													borderRadius: '6px',
													border: '2px solid var(--border-color)',
												}}
												preview={{
													mask: (
														<div
															style={{
																fontSize:
																	'12px',
															}}
														>
															Click to preview
														</div>
													),
												}}
											/>
											<div
												style={{
													marginTop: '8px',
													padding: '4px 8px',
													background:
														'var(--upload-bg)',
													borderRadius: '4px',
													fontSize: '13px',
													fontWeight: '500',
													color: 'var(--text)',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													fontFamily:
														'Poppins, sans-serif',
												}}
												title={preview.label}
											>
												{preview.label}
											</div>
										</div>
									))}
								</Image.PreviewGroup>
							</div>
						</div>
					)}
				</div>

				{/* Footer buttons fixed at the bottom of modal body */}
				<Form.Item
					style={{
						marginTop: 0,
						paddingTop: 12,
						textAlign: 'right',
						background: 'transparent',
						borderTop: '1px solid var(--divider-color)',
						marginBottom: 0,
						paddingBottom: 0,
					}}
				>
					{isStep && (
						<Button
							style={{ marginRight: 8 }}
							onClick={() =>
								onBack({ files, detectedLabels, csvMetadata })
							}
						>
							Back
						</Button>
					)}
					<Button
						type="primary"
						htmlType="submit"
						disabled={!isDataValid || hasFormErrors}
					>
						{isStep ? 'Submit' : 'Next'}
					</Button>
					{!isStep && (
						<Button style={{ marginLeft: 8 }} onClick={onCancel}>
							Cancel
						</Button>
					)}
				</Form.Item>
			</Form>
		</>
	)
}
