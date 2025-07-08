import React, { useState, useRef } from 'react';
import { Form, Input, Select, Radio, Button, message, Modal, Tabs } from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { DATASET_TYPES } from 'src/constants/types';
import * as datasetAPI from 'src/api/dataset';
import { organizeFiles, createChunks } from 'src/utils/file';
import { uploadToS3 } from 'src/utils/s3';
import JSZip from 'jszip';
import { IMG_NUM_IN_ZIP } from 'src/constants/file'

const { Option } = Select;
const { TextArea } = Input;

const CreateDatasetModal = ({ visible, onCancel, onCreate }) => {
	const [form] = Form.useForm();
	const [files, setFiles] = useState([]);
	const [selectedUrlOption, setSelectedUrlOption] = useState('remote-url');
	const [service, setService] = useState('AWS_S3');
	const [bucketName, setBucketName] = useState('user-private-dataset');
	const [datasetType, setDatasetType] = useState('IMAGE_CLASSIFICATION');
	const [totalKbytes, setTotalKbytes] = useState('0.00');
	const [isLoading, setIsLoading] = useState(false);
	const fileRefs = useRef(new Map());

	const validateFiles = (files, datasetType) => {
		const allowedImageTypes = ['image/jpeg', 'image/png'];
		const allowedTextTypes = ['text/plain', 'text/csv'];
		const allowedTypes = {
			IMAGE: allowedImageTypes,
			TEXT: allowedTextTypes,
			TABULAR: allowedTextTypes,
		};

		const validFiles = files.filter((file) => {
			if (!file || !file.type) {
				console.log(`Invalid file (no type): ${file?.name || 'unknown'}`);
				return false;
			}

			const isValid = allowedTypes[datasetType]?.includes(file.type) || false;
			return isValid;
		});
		return validFiles;
	};

	const handleFileChange = (event) => {
		const uploadedFiles = Array.from(event.target.files || []);
		const validatedFiles = validateFiles(uploadedFiles, datasetType);

		const totalSize = validatedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
		const totalSizeInKB = totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';

		const fileMetadata = validatedFiles.map((file) => {
			const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [file.name];
			const relativePath = file.webkitRelativePath || file.name;

			return {
				path: relativePath,
				fileObject: file,
			};
		});

		setFiles(fileMetadata);
		setTotalKbytes(totalSizeInKB);

		console.log(`Total files: ${fileMetadata.length}`);
		console.log('First file metadata:', fileMetadata[0]);
	};

	const handleDeleteFile = (fileId) => {
		const updatedFiles = files.filter((file) => file.fileId !== fileId);
		fileRefs.current.delete(fileId);
		setFiles(updatedFiles);

		const totalSize = updatedFiles.reduce((sum, file) => {
			const fileObj = fileRefs.current.get(file.fileId);
			return sum + (fileObj?.size || 0);
		}, 0);
		setTotalKbytes(totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00');
	};

	const createDatasetPayload = (values, files, chunks, datasetType, service, bucketName) => {
		const processedFiles = files.map((file) => {
			const pathParts = file.path.split('/');
			const simplifiedPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : file.path;

			return {
				path: simplifiedPath,
				bounding_box: file.boundingBox,
			};
		});

		const payload = {
			title: values.title,
			description: values.description || '',
			dataset_type: datasetType,
			service: service,
			bucket_name: bucketName,

			total_files: files.length,
			total_size_kb: parseFloat(totalKbytes) || 0,

			index_path: `${values.title}/index.json`,

			chunks: chunks.map((chunk) => ({
				name: chunk.name,
				file_count: chunk.files.length,
				s3_path: `${values.title}/zip/${chunk.name}`,
			})),

			status: 'active',
		};

		return payload;
	};

	const handleSubmit = async (values) => {
		try {
			setIsLoading(true);

			const fileMap = organizeFiles(files);
			const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP);

			const fileToChunkMap = new Map();
			chunks.forEach((chunk) => {
				chunk.files.forEach((file) => {
					fileToChunkMap.set(file.path, chunk.name);
				});
			});

			const indexData = {
				dataset_title: values.title,
				dataset_type: datasetType,
				files: files.map((file) => {
					const pathParts = file.path.split('/');
					const simplifiedPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : file.path;

					return {
						path: `${values.title}/${simplifiedPath}`,
						chunk: fileToChunkMap.get(file.path) || null,
						bounding_box: file.boundingBox,
					};
				}),
				chunks: chunks.map((chunk) => ({
					name: chunk.name,
					file_count: chunk.files.length,
				})),
			};

			const s3Files = [
				{
					key: `${values.title}/index.json`,
					type: 'application/json',
					content: JSON.stringify(indexData, null, 2),
				},
				...chunks.map((chunk) => ({
					key: `${values.title}/zip/${chunk.name}`,
					type: 'application/zip',
					files: chunk.files,
				})),
			];

			const presignPayload = {
				dataset_title: values.title,
				files: s3Files.map((file) => ({
					key: file.key,
					type: file.type,
				})),
			};
			const { data: presignedUrls } = await datasetAPI.createPresignedUrls(presignPayload);

			if (!presignedUrls || presignedUrls.length !== s3Files.length) {
				throw new Error('Invalid presigned URLs received');
			}

			// Upload các file lên S3
			for (const fileInfo of s3Files) {
				const presignedUrl = presignedUrls.find((url) => url.key === fileInfo.key).url;
				if (!presignedUrl) {
					throw new Error(`No presigned URL for key: ${fileInfo.key}`);
				}

				if (fileInfo.type === 'application/json') {
					const blob = new Blob([fileInfo.content], { type: 'application/json' });
					await uploadToS3(presignedUrl, blob);
				} else {
					const zip = new JSZip();

					console.log(`Creating zip ${fileInfo.key} with ${fileInfo.files.length} files`);

					for (const file of fileInfo.files) {
						console.log(`Processing file: ${file.path}`);
						const pathParts = file.path.split('/');
						const newPath = pathParts.slice(1).join('/');

						if (file.fileObject && file.fileObject instanceof File) {
							zip.file(newPath, file.fileObject);
						} else {
							console.error(`Invalid file object for: ${file.path}`);
							console.error(`File object:`, file.fileObject);
						}
					}

					const zipBlob = await zip.generateAsync({ type: 'blob' });
					console.log(`Zip size: ${zipBlob.size} bytes`);

					await uploadToS3(presignedUrl, zipBlob);
				}
			}

			const payload = createDatasetPayload(
				values,
				files,
				chunks,
				datasetType,
				service,
				bucketName,
			);

			console.log('Dataset payload:', payload);

			await onCreate(payload);
			handleCancel();
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
		setService('AWS_S3');
		setBucketName('user-private-dataset');
		setDatasetType('IMAGE_CLASSIFICATION');
		setIsLoading(false);
		fileRefs.current.clear();
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
										({(file.fileObject?.size / 1024 || 0).toFixed(2)} kB)
									</span>
									<Button
										type="text"
										icon={<DeleteOutlined />}
										onClick={() => handleDeleteFile(file.fileId)}
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
						{Object.entries(DATASET_TYPES).map(([key, value]) => (
							<Option key={key} value={key}>
								{value.type}
							</Option>
						))}
					</Select>
				</Form.Item>

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