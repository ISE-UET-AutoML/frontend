import React, { useState } from 'react'
import { Form, Input, Select, Radio, Button, message, Modal, Tabs } from 'antd'
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons'
import { TYPES } from 'src/constants/types'
import { createImgDataset } from 'src/api/dataset'
import {
	uploadZippedFilesToS3,
	parseAndValidateFiles,
} from 'src/utils/uploadZipS3'

const { Option } = Select

const CreateDatasetModal = ({ visible, onCancel, onCreate }) => {
	const [form] = Form.useForm()
	const [files, setFiles] = useState([])
	const [selectedUrlOption, setSelectedUrlOption] = useState('remote-url')
	const [isLabeled, setIsLabeled] = useState(true)
	const [service, setService] = useState('GCP_STORAGE')
	const [bucketName, setBucketName] = useState('user-private-dataset')
	const [datasetType, setDatasetType] = useState('IMAGE_CLASSIFICATION')
	const [totalKbytes, setTotalKbytes] = useState(0)
	const [isLoading, setIsLoading] = useState(false)

	const validateFiles = (files, datasetType) => {
		const allowedImageTypes = ['image/jpeg', 'image/png']
		const allowedCsvType = 'text/csv'

		return files.filter((file) => {
			if (
				datasetType === 'IMAGE_CLASSIFICATION' ||
				datasetType === 'MULTILABEL_IMAGE_CLASSIFICATION'
			) {
				return allowedImageTypes.includes(file.type)
			} else {
				return file.type === allowedCsvType
			}
		})
	}

	const handleFileChange = (event) => {
		const files = Array.from(event.target.files)
		const validatedFiles = validateFiles(files, datasetType)

		const totalSize = validatedFiles.reduce(
			(sum, file) => sum + file.size,
			0
		)
		const totalSizeInKB = (totalSize / 1024).toFixed(2)

		setFiles(validatedFiles)
		setTotalKbytes(totalSizeInKB)
	}

	const handleDeleteFile = (webkitRelativePath) => {
		const updatedFiles = files.filter(
			(file) => file.webkitRelativePath !== webkitRelativePath
		)
		setFiles(updatedFiles)
	}

	const handleSubmit = async (values) => {
		const formData = new FormData()
		Object.entries(values).forEach(([key, value]) => {
			formData.append(key, value)
		})

		// if (!values.isLabeled) {
		// 	setIsLoading(true)
		// 	formData.append('isLabeled', isLabeled)
		// 	formData.append('service', service)
		// 	formData.append('selectedUrlOption', selectedUrlOption)
		// 	formData.append('bucketName', bucketName)
		// }

		// TODO: WRITE THE LOGIO FOR OTHERS TASK TO USING PRESIGNED URL
		if (values.type === 'MULTILABEL_IMAGE_CLASSIFICATION') {
			// Specific handling for MULTILABEL_IMAGE_CLASSIFICATION

			try {
				// Show loading
				setIsLoading(true)

				// Parse and validate files
				const validFiles = parseAndValidateFiles(files)

				formData.append('isLabeled', isLabeled)
				formData.append('service', service)
				formData.append('selectedUrlOption', selectedUrlOption)
				formData.append('bucketName', bucketName)

				// Get presigned URL from backend
				const { data } = await createImgDataset(formData)

				// Upload files to S3
				await uploadZippedFilesToS3(data, validFiles)

				message.success(
					`Successfully uploaded ${validFiles.length} files`
				)
				resetFormAndState()
			} catch (error) {
				console.error('Error uploading files:', error)
				message.error('An error occurred while uploading files')
			} finally {
				setIsLoading(false)
			}
		} else {
			// Current handling for other types
			for (let i = 0; i < files.length; i++) {
				const fileNameBase64 = btoa(
					String.fromCharCode(
						...new TextEncoder().encode(files[i].webkitRelativePath)
					)
				)
				formData.append('files', files[i], fileNameBase64)
			}
			formData.append('isLabeled', isLabeled)
			formData.append('service', service)
			formData.append('selectedUrlOption', selectedUrlOption)
			formData.append('bucketName', bucketName)

			try {
				setIsLoading(true)
				await onCreate(formData)
				message.success('Dataset created successfully!')
				// resetFormAndState()
			} catch (error) {
				message.error('Failed to create dataset. Please try again.')
			} finally {
				setIsLoading(false)
			}
		}
	}

	const handleCancel = () => {
		resetFormAndState()
		onCancel()
	}

	const resetFormAndState = () => {
		form.resetFields()
		setFiles([])
		setTotalKbytes(0)
		setSelectedUrlOption('remote-url')
		setIsLabeled(true)
		setService('GCP_STORAGE')
		setBucketName('user-private-dataset')
		setDatasetType('IMAGE_CLASSIFICATION')
		setIsLoading(false)
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
							height: '100px',
							border: '2px dashed #d9d9d9',
							borderRadius: '8px',
							cursor: 'pointer',
							marginBottom: '16px',
						}}
					>
						<div style={{ textAlign: 'center' }}>
							<FolderOutlined
								style={{ fontSize: '48px', color: '#1890ff' }}
							/>
							<p style={{ marginTop: '8px' }}>
								Drag and drop a folder or click to upload
							</p>
						</div>
						<input
							type="file"
							name="file"
							id="file"
							webkitdirectory="true"
							style={{ display: 'none' }}
							onChange={handleFileChange}
						/>
					</label>

					<div>
						<span>{files.length} Files</span>
						<span style={{ marginLeft: '8px', color: '#8c8c8c' }}>
							({totalKbytes} kB)
						</span>
					</div>

					{files.length > 0 && (
						<div style={{ maxHeight: '40px', overflowY: 'auto' }}>
							{files.map((file) => (
								<div
									key={file.webkitRelativePath}
									style={{
										display: 'flex',
										alignItems: 'center',
										// padding: '8px',
										borderBottom: '1px solid #f0f0f0',
									}}
								>
									<FileOutlined
										style={{ marginRight: '8px' }}
									/>
									<span>{file.webkitRelativePath}</span>
									<span
										style={{
											marginLeft: '8px',
											color: '#8c8c8c',
										}}
									>
										({(file.size / 1024).toFixed(2)} kB)
									</span>
									<Button
										type="text"
										icon={<DeleteOutlined />}
										onClick={() =>
											handleDeleteFile(
												file.webkitRelativePath
											)
										}
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

	return (
		<Modal
			title="Create New Dataset"
			open={visible}
			onCancel={handleCancel}
			footer={null}
			width={800}
			destroyOnClose
			centered
			styles={{ paddingBottom: 0 }}
		>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item
					label="Title"
					name="title"
					rules={[
						{ required: true, message: 'Please enter a title' },
					]}
				>
					<Input placeholder="Enter dataset title" />
				</Form.Item>

				<Form.Item
					label="Type"
					name="type"
					rules={[
						{ required: true, message: 'Please select a type' },
					]}
				>
					<Select
						placeholder="Select dataset type"
						onChange={(value) => setDatasetType(value)}
					>
						{Object.entries(TYPES).map(([key, value]) => (
							<Option key={key} value={key}>
								{value.type}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item label="Labeled Data">
					<Radio.Group
						value={isLabeled}
						onChange={(e) => setIsLabeled(e.target.value)}
					>
						<Radio value={true}>Labeled</Radio>
						<Radio value={false}>Unlabeled</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item label="Service">
					<Radio.Group
						value={service}
						onChange={(e) => setService(e.target.value)}
					>
						<Radio value="GCP_STORAGE">Google Cloud Storage</Radio>
						<Radio value="AWS_S3">AWS S3</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item label="Bucket Name">
					<Select
						value={bucketName}
						onChange={(value) => setBucketName(value)}
					>
						<Option value="user-private-dataset">
							user-private-dataset
						</Option>
						<Option value="bucket-2">bucket-2</Option>
					</Select>
				</Form.Item>

				<Tabs defaultActiveKey="file" items={tabItems} />

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						loading={isLoading}
					>
						Create Dataset
					</Button>
					<Button
						style={{ marginLeft: '8px' }}
						onClick={handleCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	)
}

export default CreateDatasetModal
