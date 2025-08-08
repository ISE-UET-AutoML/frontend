// CreateDatasetForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Radio,
    Button,
    message,
    Tabs
} from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { DATASET_TYPES, TASK_TYPES } from 'src/constants/types';
import { organizeFiles, createChunks, extractCSVMetaData } from 'src/utils/file';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateDatasetForm({ 
    onNext, 
    onCancel, 
    initialValues, 
    initialFiles = [],
    initialDetectedLabels = [],
    initialCsvMetadata = null
 }) {
    const [form] = Form.useForm();
    const [files, setFiles] = useState(initialFiles);
    const [selectedUrlOption, setSelectedUrlOption] = useState('remote-url');
    const [service, setService] = useState(initialValues?.service || 'AWS_S3');
    const [bucketName, setBucketName] = useState(initialValues?.bucket_name || 'user-private-dataset');
    const [datasetType, setDatasetType] = useState(initialValues?.dataset_type || 'IMAGE_CLASSIFICATION');
    const fileRefs = useRef(new Map());

    const calcSizeKB = (fileArr) => {
        const totalSize = fileArr.reduce((sum, f) => sum + (f.fileObject?.size || 0), 0);
        return totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';
    };

    const [totalKbytes, setTotalKbytes] = useState(calcSizeKB(initialFiles));
    const [detectedLabels, setDetectedLabels] = useState(initialDetectedLabels);
    const [csvMetadata, setCsvMetadata] = useState(initialCsvMetadata);

    // whenever initial props change (when coming back), refresh states
    useEffect(() => {
        if (initialFiles.length) {
            setFiles(initialFiles);
            setTotalKbytes(calcSizeKB(initialFiles));
        }
        if (initialDetectedLabels.length) {
            setDetectedLabels(initialDetectedLabels);
        }
        if (initialCsvMetadata) {
            setCsvMetadata(initialCsvMetadata);
        }
    }, [initialFiles, initialDetectedLabels, initialCsvMetadata]);

    const validateFiles = (files, datasetType) => {
		const allowedImageTypes = ['image/jpeg', 'image/png'];
		const allowedTextTypes = ['text/plain', 'text/csv'];
		const allowedTypes = {
			IMAGE: [...allowedImageTypes, ...allowedTextTypes],
			TEXT: allowedTextTypes,
			TABULAR: allowedTextTypes,
			MULTIMODAL: [...allowedImageTypes, ...allowedTextTypes],
		};
		return files.filter((file) => file?.type && allowedTypes[datasetType]?.includes(file.type));
	};

    const handleFileChange = async (event) => {
        const uploadedFiles = Array.from(event.target.files || []);
        console.log('Uploaded files:', uploadedFiles.map((file) => ({
            name: file.name,
            type: file.type,
            path: file.webkitRelativePath,
        })));
        
        const validatedFiles = validateFiles(uploadedFiles, datasetType);
        console.log('Validated files:', validatedFiles);
        if (['IMAGE'].includes(datasetType)) {
            const isCsv = (f) => ((f.webkitRelativePath || f.name || '')).toLowerCase().endsWith('.csv');
            const csvFiles = validatedFiles.filter(isCsv);
            if (csvFiles.length > 1) {
                message.warning('Only 1 CSV file is allowed for IMAGE data type. The first CSV file will be used.');
                const firstCsv = csvFiles[0];
                validatedFiles = validatedFiles.filter((f) => !isCsv(f));
                validatedFiles.push(firstCsv);
            }
        }
        const hasImageFolder = validatedFiles.some((file) =>
            file.webkitRelativePath && file.webkitRelativePath.includes('/images/')
        );
        const hasCSVFile = validatedFiles.some((file) =>
            (file.webkitRelativePath || file.name || '').toLowerCase().endsWith('.csv')
        );

        console.log('Has image folder:', hasImageFolder);
        console.log('Has CSV file:', hasCSVFile);

        if (datasetType === 'MULTIMODAL' && (!hasImageFolder || !hasCSVFile)) {
            message.error('For MULTIMODAL datasets, upload a folder with images and a CSV file.');
            return;
        }

        const totalSize = validatedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        const totalSizeInKB = totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';

        const fileMetadata = validatedFiles.map((file) => ({
            path: file.webkitRelativePath || file.name,
            fileObject: file,
        }));

        // Detect labels từ cấu trúc thư mục
        const fileMap = organizeFiles(fileMetadata);
        const labels = Array.from(fileMap.keys()).filter(label => label !== 'unlabeled');
        setDetectedLabels(labels);

        // Extract metadata từ CSV nếu có
        const csvFile = validatedFiles.find(file => 
            (file.webkitRelativePath || file.name || '').toLowerCase().endsWith('.csv')
        );
        
        if (csvFile) {
            try {
                const metadata = await extractCSVMetaData(csvFile);
                console.log('CSV metadata extracted:', metadata);
                setCsvMetadata(metadata);
            } catch (err) {
                console.error('Failed to extract CSV metadata:', err);
                message.error('Failed to analyze CSV file');
            }
        }

        console.log('Final file metadata:', fileMetadata);
        console.log('Total size (KB):', totalSizeInKB);

        setFiles(fileMetadata);
        setTotalKbytes(totalSizeInKB);
    };

    const handleDeleteFile = (fileId) => {
        const updatedFiles = files.filter((file) => file.fileId !== fileId);
        fileRefs.current.delete(fileId);
        setFiles(updatedFiles);
        setDetectedLabels([]);
        setCsvMetadata(null);

        const totalSize = updatedFiles.reduce((sum, file) => {
            const fileObj = fileRefs.current.get(file.fileId);
            return sum + (fileObj?.size || 0);
        }, 0);
        setTotalKbytes(totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00');
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
                        <input 
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
                <Form.Item label="URL" name="url" rules={[{ required: true, message: 'Please enter a URL' }]}>
                    <Input placeholder="Enter remote URL" />
                </Form.Item>
            ),
        },
    ];

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
                csvMetadata
            } // Ensure metadata is included
        };
        onNext(payload);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSubmit}
        >
            <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
                <Input placeholder="Enter dataset title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <TextArea rows={3} maxLength={500} showCount />
            </Form.Item>

            <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select a type' }]}>
                <Select
                    placeholder="Select dataset type"
                    onChange={(value) => {
                        setDatasetType(value);
                        if (value === 'MULTIMODAL') {
                            message.info('Upload folder with images and CSV for MULTIMODAL.');
                        }
                    }}
                >
                    {Object.entries(DATASET_TYPES).map(([key, value]) => (
                        <Option key={key} value={key}>{value.type}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Service">
                <Radio.Group value={service} onChange={(e) => setService(e.target.value)}>
                    <Radio value="AWS_S3">AWS S3</Radio>
                    <Radio value="GCP_STORAGE">Google Cloud Storage</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item label="Bucket Name">
                <Select value={bucketName} onChange={(value) => setBucketName(value)}>
                    <Option value="user-private-dataset">user-private-dataset</Option>
                    <Option value="bucket-2">bucket-2</Option>
                </Select>
            </Form.Item>

            <Tabs defaultActiveKey="file" items={tabItems} />

            <Form.Item>
                <Button type="primary" htmlType="submit">Next</Button>
                <Button style={{ marginLeft: 8 }} onClick={onCancel}>Cancel</Button>
            </Form.Item>
        </Form>
    );
}
