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
    Table,
    Typography
} from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined, InfoCircleOutlined, QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DATASET_TYPES } from 'src/constants/types';
import { organizeFiles, createChunks, extractCSVMetaData } from 'src/utils/file';
import Papa from 'papaparse';


const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

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
    const [form] = Form.useForm();
    const [files, setFiles] = useState(initialFiles);
    const [selectedUrlOption, setSelectedUrlOption] = useState('remote-url');
    const [service, setService] = useState(initialValues?.service || 'AWS_S3');
    const [bucketName, setBucketName] = useState(initialValues?.bucket_name || 'user-private-dataset');
    const [datasetType, setDatasetType] = useState(initialValues?.dataset_type);
    const fileRefs = useRef(new Map());

    // States for validation and preview
    const [imageStructureValid, setImageStructureValid] = useState(null);
    const [csvPreview, setCsvPreview] = useState(null);
    const [csvHasHeader, setCsvHasHeader] = useState(null);

    const calcSizeKB = (fileArr) => {
        const totalSize = fileArr.reduce((sum, f) => sum + (f.fileObject?.size || 0), 0);
        return totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';
    };

    const [totalKbytes, setTotalKbytes] = useState(calcSizeKB(initialFiles));
    const [detectedLabels, setDetectedLabels] = useState(initialDetectedLabels);
    const [csvMetadata, setCsvMetadata] = useState(initialCsvMetadata);
    
    useEffect(() => {
        form.setFieldsValue(initialValues);
        if (initialValues?.dataset_type) {
            setDatasetType(initialValues.dataset_type);
        }
    }, [initialValues, form]);


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

    const validateFiles = (files, currentDatasetType) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedTextTypes = ['text/csv', 'application/vnd.ms-excel'];
        const allowedTypes = {
            IMAGE: allowedImageTypes,
            TEXT: allowedTextTypes,
            TABULAR: allowedTextTypes,
            MULTIMODAL: [...allowedImageTypes, ...allowedTextTypes],
            TIME_SERIES: allowedTextTypes,
        };
        const validExts = allowedTypes[currentDatasetType] || [];
        return files.filter((file) => validExts.includes(file.type));
    };
    
    const validateImageFolderStructure = (uploadedFiles) => {
        if (!uploadedFiles || uploadedFiles.length === 0) return false;
        return uploadedFiles.every(file => (file.webkitRelativePath || file.name).split('/').length > 1);
    };

    const previewCsv = (csvFile) => {
        Papa.parse(csvFile, {
            header: true,
            preview: 4, 
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0 && results.meta.fields && results.meta.fields.length > 0) {
                    setCsvHasHeader(true);
                    setCsvPreview(results.data.slice(0, 3));
                } else {
                    setCsvHasHeader(false);
                    setCsvPreview(null);
                }
            },
            error: () => {
                setCsvHasHeader(false);
                setCsvPreview(null);
                message.error("Could not parse the CSV file.");
            }
        });
    };

    const handleFileChange = async (event) => {
        setImageStructureValid(null);
        setCsvPreview(null);
        setCsvHasHeader(null);

        const uploadedFiles = Array.from(event.target.files || []);
        
        if (!datasetType) {
            message.error("Please select a dataset type before uploading files.");
            return;
        }

        const validatedFiles = validateFiles(uploadedFiles, datasetType);

        if (validatedFiles.length !== uploadedFiles.length) {
            message.warning("Some files were ignored due to incompatible types.");
        }
        
        if (datasetType === 'IMAGE') {
            const isValidStructure = validateImageFolderStructure(validatedFiles);
            setImageStructureValid(isValidStructure);
            if (!isValidStructure) {
                message.error("The folder structure is incorrect. Please ensure all images are inside labeled subdirectories.", 5);
            }
        }
        
        const csvFile = validatedFiles.find(file => (file.webkitRelativePath || file.name || '').toLowerCase().endsWith('.csv'));
        if ((datasetType === 'TEXT' || datasetType === 'TABULAR' || datasetType === 'MULTIMODAL') && csvFile) {
            previewCsv(csvFile); // Corrected: Pass the File object directly
        }


        const hasImageFolder = validatedFiles.some((file) =>
            file.webkitRelativePath && file.webkitRelativePath.includes('/images/')
        );
        const hasCSVFile = !!csvFile;

        if (datasetType === 'MULTIMODAL' && (!hasImageFolder || !hasCSVFile)) {
            message.error('For MULTIMODAL datasets, upload a folder with an "images" subfolder and a CSV file.');
            return;
        }

        const totalSize = validatedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        const totalSizeInKB = totalSize > 0 ? (totalSize / 1024).toFixed(2) : '0.00';

        const fileMetadata = validatedFiles.map((file) => ({
            path: file.webkitRelativePath || file.name,
            fileObject: file,
        }));

        const fileMap = organizeFiles(fileMetadata);
        const labels = Array.from(fileMap.keys()).filter(label => label !== 'unlabeled');
        setDetectedLabels(labels);

        if (csvFile) {
            try {
                const metadata = await extractCSVMetaData(csvFile);
                setCsvMetadata(metadata);
            } catch (err) {
                message.error('Failed to analyze CSV file');
            }
        }

        setFiles(fileMetadata);
        setTotalKbytes(totalSizeInKB);
    };

    const handleDeleteFile = (filePath) => {
        const updatedFiles = files.filter((file) => file.path !== filePath);
        setFiles(updatedFiles);
        const fileMap = organizeFiles(updatedFiles);
        const labels = Array.from(fileMap.keys()).filter(label => label !== 'unlabeled');
        setDetectedLabels(labels);
        setTotalKbytes(calcSizeKB(updatedFiles));
        
        const csvFile = updatedFiles.find(file => file.path.toLowerCase().endsWith('.csv'));
        if (csvFile) {
            extractCSVMetaData(csvFile.fileObject).then(setCsvMetadata).catch(() => setCsvMetadata(null));
        } else {
            setCsvMetadata(null);
            setCsvPreview(null);
            setCsvHasHeader(null);
        }
    };

    const renderPreparingInstructions = () => {
        const currentType = DATASET_TYPES[datasetType];
        if (!currentType || !currentType.preparingInstructions) {
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
                        Dataset Preparation Instructions
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
                        border: `1px solid ${currentType.card.border}20`
                    }}>
                        {currentType.preparingInstructions}
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
                    border: `1px solid ${currentType.card.border}40`,
                    borderRadius: '6px',
                }}
                className="preparing-instructions-collapse"
            />
        );
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
                        border: '2px dashed var(--upload-border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        background: 'var(--upload-bg)',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.borderColor = 'var(--modal-close-hover)';
                            target.style.background = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                             const target = e.currentTarget;
                            target.style.borderColor = 'var(--upload-border)';
                            target.style.background = 'var(--upload-bg)';
                        }}
                    >
                        <div style={{ textAlign: 'center', background: 'transparent' }}>
                            <FolderOutlined style={{ fontSize: '48px', color: 'var(--upload-icon)' }} />
                            <p style={{ marginTop: '8px', color: 'var(--upload-text)', fontFamily: 'Poppins, sans-serif' }}>
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
                                        onClick={() => handleDeleteFile(file.path)}
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
            }
        };
        onNext(payload);
    };

    return (
        <>
            <style>{/*... CSS styles from previous turn ...*/}</style>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
                className="theme-form"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[
                                { required: true, message: 'Please enter a title' },
                                {
                                    pattern: /^[a-zA-Z0-9_.-]+$/,
                                    message: 'Title can only contain letters, numbers, and _.-'
                                }
                            ]}
                        >
                            <Input placeholder="Enter dataset title"
                                disabled={disableFields.includes('title')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Type" 
                            name="dataset_type" 
                            rules={[{ required: true, message: 'Please select a type' }]}
                        >
                            <Select
                                placeholder="Select dataset type"
                                onChange={(value) => {
                                    setDatasetType(value);
                                }}
                                disabled={disableFields.includes('type')}
                            >
                                {Object.entries(DATASET_TYPES).map(([key, value]) => (
                                    <Option key={key} value={key}>{value.type}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {renderPreparingInstructions()}

                <Form.Item name="description" label="Description">
                    <TextArea rows={2} maxLength={500} showCount disabled={disableFields.includes('description')} />
                </Form.Item>

                {!hideFields.includes('service') && !hideFields.includes('bucket_name') && (
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
                )}

                <Tabs defaultActiveKey="file" items={tabItems} />

                {/* Validation and Preview Section */}
                {imageStructureValid !== null && (
                     <Alert
                        message={
                            <span className="font-semibold">Image Folder Structure Check</span>
                        }
                        description={
                            imageStructureValid
                                ? "The folder structure appears to be correct for image classification."
                                : "Incorrect structure. Images should be organized in subfolders named after their labels (e.g., 'cats/cat1.jpg')."
                        }
                        type={imageStructureValid ? "success" : "error"}
                        showIcon
                        icon={imageStructureValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        className="mt-4"
                    />
                )}

                {csvHasHeader !== null && (
                    <Alert
                        message={
                             <span className="font-semibold">CSV Header Check</span>
                        }
                        description={
                            csvHasHeader
                                ? "The CSV file appears to have a valid header row."
                                : "A header row could not be detected. Please ensure the first row of your CSV contains column names."
                        }
                        type={csvHasHeader ? "success" : "warning"}
                        showIcon
                        icon={csvHasHeader ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
                        className="mt-4"
                    />
                )}

                {csvPreview && (
                    <div className="mt-4">
                        <Text strong>CSV File Preview (First 3 rows):</Text>
                        <Table
                            dataSource={csvPreview}
                            columns={Object.keys(csvPreview[0]).map(key => ({
                                title: key,
                                dataIndex: key,
                                key: key,
                            }))}
                            pagination={false}
                            size="small"
                            bordered
                            className="mt-2"
                        />
                    </div>
                )}


                <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                    {isStep && (
                        <Button style={{ marginRight: 8 }} onClick={() => onBack({ files, detectedLabels, csvMetadata })}>
                            Back
                        </Button>
                    )}
                    <Button type="primary" htmlType="submit">
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
    );
}