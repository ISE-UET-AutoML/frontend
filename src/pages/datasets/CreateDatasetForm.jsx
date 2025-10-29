// CreateDatasetForm.jsx
import React, { useState, useRef, useEffect } from 'react';
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
} from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { DATASET_TYPES } from 'src/constants/types';
import { organizeFiles, createChunks, extractCSVMetaData } from 'src/utils/file';
import { DATASET_TASK_MAPPING, TASK_TYPE_INFO } from 'src/constants/dataset_task_mapping';
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
    const [datasetType, setDatasetType] = useState(initialValues?.dataset_type || null);
    const [taskType, setTaskType] = useState(initialValues?.taskType || null);
    const fileRefs = useRef(new Map());

    const calcSizeKB = (fileArr) => {
        const totalSize = fileArr.reduce((sum, f) => sum + (f.fileObject?.size || 0), 0);
        return totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';
    };

    const [totalKbytes, setTotalKbytes] = useState(calcSizeKB(initialFiles));
    const [detectedLabels, setDetectedLabels] = useState(initialDetectedLabels);
    const [csvMetadata, setCsvMetadata] = useState(initialCsvMetadata);

    const [isDragging, setIsDragging]  = useState(false);
    const fileInputRef = useRef(null)

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
        const allowedTextTypes = ['text/plain', 'text/csv', 'application/xml', 'text/xml'];
        const allowedTypes = {
            IMAGE: [...allowedImageTypes, ...allowedTextTypes],
            TEXT: allowedTextTypes,
            TABULAR: allowedTextTypes,
            MULTIMODAL: [...allowedImageTypes, ...allowedTextTypes],
            TIME_SERIES: [...allowedTextTypes],
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
	}

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        // Tắt state khi kéo file ra khỏi vùng <label>
        // Kiểm tra relatedTarget để tránh lỗi flickering khi di qua các element con
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // <-- Rất quan trọng, cho phép thả file
        event.stopPropagation();
        setIsDragging(true); // Giữ state true khi vẫn còn đang kéo trên vùng
    };

    const handleDrop = (event) => {
        event.preventDefault(); // <-- Ngăn trình duyệt mở file
        event.stopPropagation();
        setIsDragging(false); // Tắt state khi đã thả file

        const files = event.dataTransfer.files;
        
        if (files && files.length > 0) {
            // Tạo một object sự kiện "giả"
            // vì hàm handleFileChange đang chờ `event.target.files`
            const simulatedEvent = {
                target: {
                    files: files
                }
            };
            
            // Gán file vào ref (giúp reset hoạt động)
            if(fileInputRef.current) {
                fileInputRef.current.files = files;
            }
            
            // Gọi hàm xử lý file đã có
            handleFileChange(simulatedEvent);
        }
    };
    const getAvailableTaskTypes = () => {
        const dataType = datasetType; // Sử dụng state datasetType
        if (!dataType) {
            return [];
        }
        
        const availableTypes = DATASET_TASK_MAPPING[dataType] || [];
        
        const taskTypes = availableTypes.map(typeKey => ({
            key: typeKey,
            ...TASK_TYPE_INFO[typeKey]
        }));
        
        return taskTypes;
    };

    const renderPreparingInstructions = () => {
        const currentTaskInfo = TASK_TYPE_INFO[taskType];
        if (!currentTaskInfo || !currentTaskInfo.preparingInstructions) {
            return null;
        }

        const items = [
            {
                key: '1',
                label: (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'green',
                        fontWeight: '500'
                    }}>
                        <QuestionCircleOutlined style={{ marginRight: '8px' }} />
                        Task Preparation Instructions ({currentTaskInfo.displayName})
                    </div>
                ),
                children: (
                    <div style={{
                        whiteSpace: 'pre-line',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        padding: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '6px',
                        border: `1px solid #ccc` // Màu border chung
                    }}>
                        {currentTaskInfo.preparingInstructions}
                    </div>
                ),
            },
        ];

        return (
            <Collapse
                items={items}
                size="small"
                ghost
                style={{
                    marginBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.97)',
                    border: `1px solid #ddd`, // Màu border chung
                    borderRadius: '6px',
                }}
                className="preparing-instructions-collapse"
            />
        );
    };

    const isFolderUpload = datasetType === 'IMAGE' || datasetType === 'MULTIMODAL';
    const fileInputProps = {
        ref: fileInputRef,
        type: 'file',
        name: 'file',
        id: 'file',
        multiple: true,
        style: { display: 'none' },
        onChange: handleFileChange,
    }
    if (isFolderUpload) {
        fileInputProps.webkitdirectory = ''
        fileInputProps.directory = ''
    } else if (datasetType){
        const allowedExtensions = {
            TEXT: '.csv,.xlsx,.xls',
            TABULAR: '.csv,.xlsx,.xls',
            TIME_SERIES: '.csv,.xlsx,.xls',
        };
        fileInputProps.accept = allowedExtensions[datasetType] || ''
    }
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
                        border: isDragging 
                                ? '2px dashed var(--modal-close-hover)' 
                                : '2px dashed var(--upload-border)',
							background: isDragging 
                                ? 'var(--hover-bg)' 
                                : 'var(--upload-bg)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        background: 'var(--upload-bg)',
                        transition: 'all 0.3s ease'
                    }}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = 'var(--modal-close-hover)'
                            e.target.style.background = 'var(--hover-bg)'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'var(--upload-border)'
                            e.target.style.background = 'var(--upload-bg)'
                        }}
                    >
                        <div style={{ textAlign: 'center', background: 'transparent' }}>
                            {isFolderUpload ? (
								<FolderOutlined
									style={{
										fontSize: '64px',
										color: 'var(--upload-icon)',
									}}
								/>
							) : (
								<FileOutlined
									style={{
										fontSize: '64px',
										color: 'var(--upload-icon)',
									}}
								/>
							)}
                            <p style={{ marginTop: '8px', color: 'var(--upload-text)', fontFamily: 'Poppins, sans-serif' }}>
                                {isFolderUpload
									? 'Drag and drop a folder or click to upload'
									: 'Drag and drop files or click to upload'}
                            </p>
                        </div>
                        <input
                            {...fileInputProps}
                        />
                    </label>
                    <div style={{ color: 'var(--text)', fontFamily: 'Poppins, sans-serif' }}>
                        <span style={{ fontWeight: '500' }}>{files.length} Files</span>
                        <span style={{ marginLeft: '8px', color: 'var(--secondary-text)' }}>({totalKbytes} kB)</span>
                    </div>
                    {files.length > 0 && (
                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: 'var(--upload-bg)',
                            borderRadius: '8px',
                            padding: '8px',
                            marginTop: '12px'
                        }}>
                            {files.map((file) => (
                                <div key={file.path} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--divider-color)',
                                    padding: '8px 0',
                                    color: 'var(--text)'
                                }}>
                                    <FileOutlined style={{ marginRight: '8px', color: 'var(--upload-icon)' }} />
                                    <span style={{ flex: 1, fontFamily: 'Poppins, sans-serif' }}>{file.path}</span>
                                    <span style={{ marginLeft: '8px', color: 'var(--secondary-text)', fontSize: '12px' }}>
                                        ({(file.fileObject?.size / 1024 || 0).toFixed(2)} kB)
                                    </span>
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteFile(file.fileId)}
                                        style={{ color: 'var(--secondary-text)' }}
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
                    border-radius: 12px !important;
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
                
                .theme-form .ant-radio-wrapper {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-radio-inner {
                    background: var(--radio-bg) !important;
                    border-color: var(--radio-border) !important;
                }
                
                .theme-form .ant-radio-checked .ant-radio-inner {
                    background: var(--radio-checked-bg) !important;
                    border-color: var(--radio-checked-border) !important;
                }
                
                .theme-form .ant-tabs-tab {
                    color: var(--tabs-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-tabs-tab-active {
                    color: var(--tabs-active-text) !important;
                }
                
                .theme-form .ant-tabs-ink-bar {
                    background: var(--tabs-ink-bar) !important;
                }
                
                .theme-form .ant-tabs-content-holder {
                    background: transparent !important;
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
                
                .theme-form .ant-upload-drag {
                    background: var(--upload-bg) !important;
                    border: 2px dashed var(--upload-border) !important;
                    border-radius: 12px !important;
                }
                
                .theme-form .ant-upload-drag:hover {
                    border-color: var(--modal-close-hover) !important;
                    background: var(--hover-bg) !important;
                }
                
                .theme-form .ant-upload-drag .ant-upload-drag-icon {
                    color: var(--upload-icon) !important;
                }
                
                .theme-form .ant-upload-drag .ant-upload-text {
                    color: var(--upload-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-form .ant-upload-drag .ant-upload-hint {
                    color: var(--upload-hint) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
                className="theme-form"
            >
                {/* Hàng 1: Title */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                        label="Title"
                        name="title"
                        rules={[
                            { required: true, message: 'Please enter a title' },
                            //{ pattern: /^[a-zA-Z0-9 _-]+$/, message: 'Title can only include letters, numbers, spaces, hyphens, and underscores' }
                        ]}
                        >
                        <Input
                            placeholder="Enter dataset title (letters and numbers only)"
                            style={{ borderRadius: '1px' }}
                        />
                        </Form.Item>
                    </Col>
                    </Row>

                    {/* Hàng 2: Data Type và Task Type */}
                    <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                        label="Data Type"
                        name="dataset_type"
                        rules={[{ required: true, message: 'Please select a type' }]}
                        >
                        <Select
                            placeholder="Select dataset type"
                            onChange={(value) => {
                            setDatasetType(value);
                            setTaskType(null);
                            form.setFieldsValue({ taskType: null });
                            handleReset();
                            }}
                        >
                            {Object.entries(DATASET_TYPES).map(([key, value]) => (
                            <Option key={key} value={key}>
                                {value.type}
                            </Option>
                            ))}
                        </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                        name="taskType"
                        label="Task Type"
                        rules={[{ required: true, message: 'Please select a task type' }]}
                        >
                        <Select
                            placeholder="Select task type"
                            onChange={(value) => {
                            setTaskType(value);
                            }}
                            style={{ width: '100%' }}
                            allowClear
                            //disabled={!datasetType}
                        >
                            {!datasetType && (
                            <Option key="__placeholder_task" value="" disabled>
                                -- Select Data Type first --
                            </Option>
                            )}
                            {datasetType &&
                            getAvailableTaskTypes().map((task) => (
                                <Option key={task.key} value={task.key}>
                                {task.displayName}
                                <span
                                    style={{
                                    fontSize: '0.8em',
                                    color: 'var(--secondary-text)',
                                    marginLeft: '8px',
                                    }}
                                >
                                    ({task.description})
                                </span>
                                </Option>
                            ))}
                        </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {renderPreparingInstructions()}

                <Form.Item name="description" label="Description">
                    <TextArea rows={2} maxLength={500} showCount />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={7}>
                        <Form.Item label="Storage Provider">
                            <Radio.Group value={service} onChange={(e) => setService(e.target.value)}>
                                <Radio value="AWS_S3">AWS S3</Radio>
                                <Radio value="GCP_STORAGE">Google Cloud Storage</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={17}>
                        <Form.Item label="Bucket Name">
                            <Select value={bucketName} onChange={(value) => setBucketName(value)}>
                                <Option value="user-private-dataset">user-private-dataset</Option>
                                <Option value="bucket-2">bucket-2</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="file" items={tabItems} />

                <Form.Item style={{ marginTop: 8, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        Next
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={onCancel}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}
