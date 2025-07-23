// CreateDatasetModal.jsx
import React, { useState, useRef } from 'react';
import { Form, Input, Select, Radio, Button, message, Modal, Tabs } from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { DATASET_TYPES } from 'src/constants/types';
import * as datasetAPI from 'src/api/dataset';
import { organizeFiles, createChunks, extractCSVMetaData } from 'src/utils/file';
import { uploadToS3 } from 'src/utils/s3';
import JSZip from 'jszip';
import { IMG_NUM_IN_ZIP } from 'src/constants/file';

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
			MULTIMODAL: [...allowedImageTypes, ...allowedTextTypes],
		};

		return files.filter((file) => file?.type && allowedTypes[datasetType]?.includes(file.type));
	};

	const handleFileChange = (event) => {
		const uploadedFiles = Array.from(event.target.files || []);
		console.log('Uploaded files:', uploadedFiles.map((file) => ({
			name: file.name,
			type: file.type,
			path: file.webkitRelativePath,
		})));
		const validatedFiles = validateFiles(uploadedFiles, datasetType);
		console.log('Validated files:', validatedFiles);
		const hasImageFolder = validatedFiles.some((file) =>
			file.webkitRelativePath && file.webkitRelativePath.includes('/images/'));
		const hasCSVFile = validatedFiles.some((file) =>
			file.webkitRelativePath && file.webkitRelativePath.endsWith('.csv'));

		console.log('Has image folder:', hasImageFolder);
    	console.log('Has CSV file:', hasCSVFile);

		if (datasetType === 'MULTIMODAL' && (!hasImageFolder || !hasCSVFile)) {
			message.error('For MULTIMODAL datasets, please upload a folder with images and a CSV file.');
			return;
		}

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

	const handleSubmit = async (values) => {
		console.log('handleSubmit called with values:', values); // Log này sẽ xác nhận hàm được gọi

		try {
			setIsLoading(true);
			const fileMap = organizeFiles(files);

			if (datasetType === 'MULTIMODAL') {
				const imageFiles = files.filter((file) =>
					file.path.includes('images/')
				);
				const csvFile = files.find((file) => file.path.endsWith('.csv'));
				if (imageFiles.length === 0) {
					throw new Error('No images found in the "image" folder.');
				}
				if(!csvFile) {
					throw new Error('No CSV file found in the dataset.');
				}
				console.log('Processing Multi-modal dataset:', {
					csvFile,
					imageFiles,
				});
			}
			const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP);

			const fileToChunkMap = new Map();
			chunks.forEach((chunk) => {
				chunk.files.forEach((file) => {
					fileToChunkMap.set(file.path, chunk.name);
				});
			});

			let extraMeta = {};
			const csvFile = files.find((file) => file.path.endsWith('.csv'));
			if ((datasetType === 'TEXT' || datasetType === 'TABULAR' || datasetType === 'MULTIMODAL') && csvFile) {
				try {
					extraMeta = await extractCSVMetaData(csvFile.fileObject);
					console.log('CSV metadata extracted:', extraMeta);
				} catch (err) {
					console.error('CSV metadata extraction failed:', err);
				}
			}

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

			for (const fileInfo of s3Files) {
				const presignedUrl = presignedUrls.find((url) => url.key === fileInfo.key)?.url;
				if (!presignedUrl) throw new Error(`No presigned URL for key: ${fileInfo.key}`);

				if (fileInfo.type === 'application/json') {
					await uploadToS3(presignedUrl, new Blob([fileInfo.content], { type: 'application/json' }));
				} else {
					const zip = new JSZip();
					for (const file of fileInfo.files) {
						let newPath = file.path.split('/').slice(-2).join('/');
						const isUnlabel = file.path.split('/').length === 2 ? true : false;
						if(isUnlabel) {
							const fileName = file.path.split('/').pop(); // "data123.png"
							newPath = `unlabel_${fileName}`;
						} else {
							newPath = file.path.split('/').slice(-2).join('_');
						}
						zip.file(newPath, file.fileObject);
					}
					await uploadToS3(presignedUrl, await zip.generateAsync({ type: 'blob' }));
				}
			}

			await onCreate({
				title: values.title,
				description: values.description || '',
				dataset_type: datasetType,
				service,
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
				meta_data: extraMeta,
			});
			handleCancel();
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			if (error.response && error.response.data) {
			console.log('Error response data:', error.response.data);
			}
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
					<label htmlFor="file" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', border: '2px dashed #d9d9d9', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px' }}>
						<div style={{ textAlign: 'center' }}>
							<FolderOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
							<p style={{ marginTop: '8px' }}>Drag and drop a folder or click to upload</p>
						</div>
						<input type="file" name="file" id="file" webkitdirectory="true" style={{ display: 'none' }} onChange={handleFileChange} />
					</label>
					<div>
						<span>{files.length} Files</span>
						<span style={{ marginLeft: '8px', color: '#8c8c8c' }}>({totalKbytes} kB)</span>
					</div>
					{files.length > 0 && (
						<div style={{ maxHeight: '200px', overflowY: 'auto' }}>
							{files.map((file) => (
								<div key={file.path} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '8px 0' }}>
									<FileOutlined style={{ marginRight: '8px' }} />
									<span>{file.path}</span>
									<span style={{ marginLeft: '8px', color: '#8c8c8c' }}>({(file.fileObject?.size / 1024 || 0).toFixed(2)} kB)</span>
									<Button type="text" icon={<DeleteOutlined />} onClick={() => handleDeleteFile(file.fileId)} />
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
				<Form.Item label="URL" name="url" rules={[{ required: true, message: 'Please enter a URL' }]}> <Input placeholder="Enter remote URL" /> </Form.Item>
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
			destroyOnHidden
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
						onChange={(value) => {
							setDatasetType(value);
							if (value === 'MULTIMODAL') {
								message.info(
									'For Multi-modal classification, please upload a folder containing an "image" folder and a .csv file.'
								);
							}
						}}
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