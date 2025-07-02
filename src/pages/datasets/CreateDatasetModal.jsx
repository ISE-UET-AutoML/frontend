import React, { useState } from 'react';
import { Form, Input, Select, Radio, Button, message, Modal, Tabs } from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { TYPES } from 'src/constants/types';
import * as datasetAPI from 'src/api/dataset';
import { uploadFilesToS3 } from 'src/utils/uploadZipS3';

const { Option } = Select;
const { TextArea } = Input;

const CreateDatasetModal = ({ visible, onCancel, onCreate }) => {
	const [form] = Form.useForm();
	const [files, setFiles] = useState([]);
	const [selectedUrlOption, setSelectedUrlOption] = useState('remote-url');
	const [isLabeled, setIsLabeled] = useState(true);
	const [service, setService] = useState('AWS_S3'); // Default to AWS_S3 since backend uses S3
	const [bucketName, setBucketName] = useState('user-private-dataset');
	const [datasetType, setDatasetType] = useState('IMAGE_CLASSIFICATION');
	const [totalKbytes, setTotalKbytes] = useState('0.00');
	const [isLoading, setIsLoading] = useState(false);
	const [expectedLabels, setExpectedLabels] = useState('');

	const validateFiles = (files, datasetType) => {
		const allowedImageTypes = ['image/jpeg', 'image/png'];
		const allowedTextTypes = ['text/plain', 'text/csv'];
		const allowedTypes = {
			IMAGE_CLASSIFICATION: allowedImageTypes,
			MULTILABEL_IMAGE_CLASSIFICATION: allowedImageTypes,
			OBJECT_DETECTION: allowedImageTypes,
			TEXT_CLASSIFICATION: allowedTextTypes,
		};

		return files.filter((file) => {
			if (!file || !file.type) return false;
			return allowedTypes[datasetType]?.includes(file.type) || false;
		});
	};

	const handleFileChange = (event) => {
		const files = Array.from(event.target.files || []);
		const validatedFiles = validateFiles(files, datasetType);

		const totalSize = validatedFiles.reduce((sum, file) => {
			return sum + (file.size || 0);
		}, 0);

		const totalSizeInKB = totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';

		const fileMetadata = validatedFiles.map((file) => {
			const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
			const label = pathParts.length > 1 ? pathParts[pathParts.length - 2] : null;
			return {
				file: file,
				path: file.webkitRelativePath || file.name,
				label: label,
				// Placeholder for OBJECT_DETECTION (can be extended later)
				boundingBox: datasetType === 'OBJECT_DETECTION' ? { x: 10, y: 10, width: 80, height: 80 } : null,
			};
		});

		setFiles(fileMetadata);
		setTotalKbytes(totalSizeInKB);
	};

	const handleDeleteFile = (webkitRelativePath) => {
		const updatedFiles = files.filter(
			(file) => file.path !== webkitRelativePath
		);
		setFiles(updatedFiles);

		const totalSize = updatedFiles.reduce((sum, file) => sum + (file.file.size || 0), 0);
		setTotalKbytes(totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00');
	};

	const handleSubmit = async (values) => {
		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) => {
			formData.append(key, value);
		});

		formData.append('isLabeled', isLabeled);
		formData.append('service', service);
		formData.append('selectedUrlOption', selectedUrlOption);
		formData.append('bucketName', bucketName);

		const updatedFileMetadata = files.map((f) => {
			let newPath = f.path;

			if (f.path.includes('/')) {
				const pathParts = f.path.split('/');

				pathParts[0] = values.title;
				newPath = pathParts.join('/');
			} else {
				newPath = `${values.title}/${f.path}`;
			}

			return {
				path: newPath,
				label: f.label,
				boundingBox: f.boundingBox, // For OBJECT_DETECTION
			};
		});

		formData.append('fileMetadata', JSON.stringify(updatedFileMetadata));

		const fileNames = files.map((f) => f.path);
		formData.append('fileNames', JSON.stringify(fileNames));

		try {
			setIsLoading(true);
			// const { data } = await datasetAPI.createPresignedUrls(formData);
			// console.log(data)
			// await uploadFilesToS3(data, files.map((f) => f.file));
			await onCreate(formData);
			message.success('Dataset created successfully!');
			// resetFormAndState();
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			message.error('Failed to create dataset. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		resetFormAndState();
		onCancel();
	};

	const resetFormAndState = () => {
		form.resetFields();
		setFiles([]);
		setTotalKbytes('0.00');
		setSelectedUrlOption('remote-url');
		setIsLabeled(true);
		setService('AWS_S3');
		setBucketName('user-private-dataset');
		setDatasetType('IMAGE_CLASSIFICATION');
		setIsLoading(false);
		setExpectedLabels('');
	};

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
							<FolderOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
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
						<div style={{ maxHeight: '200px', overflowY: 'auto' }}>
							{files.map((file) => (
								<div
									key={file.path}
									style={{
										display: 'flex',
										alignItems: 'center',
										borderBottom: '1px solid #f0f0f0',
										padding: '8px 0',
									}}
								>
									<FileOutlined style={{ marginRight: '8px' }} />
									<span>{file.path}</span>
									<span style={{ marginLeft: '8px', color: '#8c8c8c' }}>
										({(file.file.size / 1024).toFixed(2)} kB)
									</span>
									<Button
										type="text"
										icon={<DeleteOutlined />}
										onClick={() => handleDeleteFile(file.path)}
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
	];

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
					rules={[{ required: true, message: 'Please enter a title' }]}
				>
					<Input placeholder="Enter dataset title" />
				</Form.Item>

				<Form.Item
					label="Type"
					name="type"
					rules={[{ required: true, message: 'Please select a type' }]}
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

				{!isLabeled && (
					<Form.Item
						label="Expected Labels"
						name="expectedLabels"
						extra="Enter each label on a new line (e.g., horse, cat, dog)"
					>
						<TextArea
							rows={4}
							placeholder="horse\ncat\ndog"
							value={expectedLabels}
							onChange={(e) => setExpectedLabels(e.target.value)}
						/>
					</Form.Item>
				)}

				<Form.Item label="Service">
					<Radio.Group
						value={service}
						onChange={(e) => setService(e.target.value)}
					>
						<Radio value="AWS_S3">AWS S3</Radio>
						<Radio value="GCP_STORAGE">Google Cloud Storage</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item label="Bucket Name">
					<Select
						value={bucketName}
						onChange={(value) => setBucketName(value)}
					>
						<Option value="user-private-dataset">user-private-dataset</Option>
						<Option value="bucket-2">bucket-2</Option>
					</Select>
				</Form.Item>

				<Tabs defaultActiveKey="file" items={tabItems} />

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={isLoading}>
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
	);
};

export default CreateDatasetModal;