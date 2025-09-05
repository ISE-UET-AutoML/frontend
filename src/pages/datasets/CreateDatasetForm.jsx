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
		const allowedTextTypes = ['text/plain', 'text/csv','application/xml', 'text/xml'];
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
            const isMetaFile = (f) => {
                const name = (f.webkitRelativePath || f.name || '').toLowerCase();
                return name.endsWith('.csv') || name.endsWith('.xml');
            };
            const metaFiles = validatedFiles.filter(isMetaFile);
            console.log('Meta files (CSV, XML):', metaFiles);
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
                    <label htmlFor="file" style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '120px', 
                        border: '2px dashed rgba(255, 255, 255, 0.3)', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        marginBottom: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = '#65FFA0'
                        e.target.style.background = 'rgba(101, 255, 160, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <FolderOutlined style={{ fontSize: '48px', color: '#65FFA0' }} />
                            <p style={{ marginTop: '8px', color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                                Drag and drop a folder or click to upload
                            </p>
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
                    <div style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                        <span style={{ fontWeight: '500' }}>{files.length} Files</span>
                        <span style={{ marginLeft: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>({totalKbytes} kB)</span>
                    </div>
                    {files.length > 0 && (
                        <div style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '8px',
                            marginTop: '12px'
                        }}>
                            {files.map((file) => (
                                <div key={file.path} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                                    padding: '8px 0',
                                    color: 'white'
                                }}>
                                    <FileOutlined style={{ marginRight: '8px', color: '#65FFA0' }} />
                                    <span style={{ flex: 1, fontFamily: 'Poppins, sans-serif' }}>{file.path}</span>
                                    <span style={{ marginLeft: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                                        ({(file.fileObject?.size / 1024 || 0).toFixed(2)} kB)
                                    </span>
                                    <Button 
                                        type="text" 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => handleDeleteFile(file.fileId)}
                                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
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
        <>
            <style>{`
                .dark-form .ant-form-item-label > label {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .dark-form .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-form .ant-input,
                .dark-form textarea.ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    border-radius: 12px !important;
                }
                
                .dark-form .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                
                .dark-form .ant-input:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                .dark-form .ant-input:focus {
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-form .ant-input:focus,
                .dark-form .ant-input-focused,
                .dark-form textarea.ant-input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-form .ant-input-filled {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 12px !important;
                }
                
                .dark-form .ant-input-filled:focus,
                .dark-form .ant-input-filled:focus-within {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                /* Specific TextArea styling */
                .dark-form .ant-input[type="textarea"],
                .dark-form textarea,
                .dark-form .ant-input-textarea {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    border-radius: 12px !important;
                    resize: vertical !important;
                }
                
                .dark-form .ant-input[type="textarea"]:focus,
                .dark-form textarea:focus,
                .dark-form .ant-input-textarea:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                .dark-form .ant-input[type="textarea"]:hover,
                .dark-form textarea:hover,
                .dark-form .ant-input-textarea:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                /* Count display styling */
                .dark-form .ant-input-textarea-show-count::after {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                /* Override any Ant Design defaults */
                .dark-form .ant-input-textarea .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-form .ant-input-textarea .ant-input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                /* Force override for all textarea elements */
                .dark-form textarea {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-form textarea:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                /* Target the specific Ant Design TextArea structure */
                .dark-form .ant-input-textarea .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                    box-shadow: none !important;
                }
                
                .dark-form .ant-input-textarea .ant-input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                .dark-form .ant-input-textarea .ant-input:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                /* Override the wrapper div background */
                .dark-form .ant-input-textarea {
                    background: transparent !important;
                }
                
                /* Target the count wrapper */
                .dark-form .ant-input-textarea-show-count .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-form .ant-input-textarea-show-count .ant-input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                /* Most aggressive targeting - override all possible Ant Design classes */
                .dark-form .ant-input-textarea-show-count,
                .dark-form .ant-input-textarea-show-count .ant-input,
                .dark-form .ant-input-textarea-show-count textarea {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-form .ant-input-textarea-show-count:focus,
                .dark-form .ant-input-textarea-show-count .ant-input:focus,
                .dark-form .ant-input-textarea-show-count textarea:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                /* Remove any default box-shadow that might create rectangular overlay */
                .dark-form .ant-input-textarea-show-count .ant-input:focus,
                .dark-form .ant-input-textarea .ant-input:focus,
                .dark-form textarea:focus {
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-form .ant-select-selector {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }
                
                .dark-form .ant-select-selection-item {
                    color: white !important;
                }
                
                .dark-form .ant-select-selection-placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                
                .dark-form .ant-select-arrow {
                    color: white !important;
                }
                
                .dark-form .ant-radio-wrapper {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-form .ant-radio-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }
                
                .dark-form .ant-radio-checked .ant-radio-inner {
                    background: #65FFA0 !important;
                    border-color: #65FFA0 !important;
                }
                
                .dark-form .ant-tabs-tab {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-form .ant-tabs-tab-active {
                    color: white !important;
                }
                
                .dark-form .ant-tabs-ink-bar {
                    background: #65FFA0 !important;
                }
                
                .dark-form .ant-tabs-content-holder {
                    background: transparent !important;
                }
                
                .dark-form .ant-btn-primary {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .dark-form .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #2a2a3e 0%, #26314e 50%, #1f4460 100%) !important;
                    border-color: #65FFA0 !important;
                    transform: translateY(-1px) !important;
                }
                
                .dark-form .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-form .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                
                .dark-form .ant-upload-drag {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 2px dashed rgba(255, 255, 255, 0.3) !important;
                    border-radius: 12px !important;
                }
                
                .dark-form .ant-upload-drag:hover {
                    border-color: #65FFA0 !important;
                    background: rgba(101, 255, 160, 0.1) !important;
                }
                
                .dark-form .ant-upload-drag .ant-upload-drag-icon {
                    color: #65FFA0 !important;
                }
                
                .dark-form .ant-upload-drag .ant-upload-text {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-form .ant-upload-drag .ant-upload-hint {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
                className="dark-form"
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
        </>
    );
}
