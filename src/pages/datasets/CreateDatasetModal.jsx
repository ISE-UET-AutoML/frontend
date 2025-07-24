// CreateDatasetModal.jsx
import React, { useState, useRef } from 'react';
import { Form, Input, Select, Radio, Button, message, Modal, Tabs, Steps } from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { DATASET_TYPES } from 'src/constants/types';
import * as datasetAPI from 'src/api/dataset';
import { organizeFiles, createChunks, extractCSVMetaData } from 'src/utils/file';
import { uploadToS3 } from 'src/utils/s3';
import JSZip from 'jszip';
import { IMG_NUM_IN_ZIP } from 'src/constants/file';
import CreateDatasetForm from './CreateDatasetForm';
import CreateLabelProjectForm from './CreateLabelProjectForm';

const CreateDatasetModal = ({ visible, onCancel, onCreate }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [datasetFormValues, setDatasetFormValues] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = async (values) => {
        setDatasetFormValues(values);
        setCurrentStep(1);
    };

    const handleBack = () => {
        setCurrentStep(0);
    };

    const handleSubmit = async (labelProjectValues) => {
        try {
            setIsLoading(true);
            const { files, totalKbytes, dataset_type, service, bucket_name } = datasetFormValues;
            
            // Xử lý tạo dataset như cũ
            const fileMap = organizeFiles(files);
            const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP);

            const fileToChunkMap = new Map();
            chunks.forEach((chunk) => {
                chunk.files.forEach((file) => {
                    fileToChunkMap.set(file.path, chunk.name);
                });
            });

            let extraMeta = {};
            const csvFile = files.find((file) => file.path.endsWith('.csv'));
            if ((dataset_type === 'TEXT' || dataset_type === 'TABULAR' || dataset_type === 'MULTIMODAL') && csvFile) {
                try {
                    extraMeta = await extractCSVMetaData(csvFile.fileObject);
                } catch (err) {
                    console.error('CSV metadata extraction failed:', err);
                }
            }

            const indexData = {
                dataset_title: datasetFormValues.title,
                dataset_type,
                files: files.map((file) => {
                    const pathParts = file.path.split('/');
                    const simplifiedPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : file.path;
                    return {
                        path: `${datasetFormValues.title}/${simplifiedPath}`,
                        chunk: fileToChunkMap.get(file.path) || null,
                    };
                }),
                chunks: chunks.map((chunk) => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                })),
            };

            const s3Files = [
                {
                    key: `${datasetFormValues.title}/index.json`,
                    type: 'application/json',
                    content: JSON.stringify(indexData, null, 2),
                },
                ...chunks.map((chunk) => ({
                    key: `${datasetFormValues.title}/zip/${chunk.name}`,
                    type: 'application/zip',
                    files: chunk.files,
                })),
            ];

            const presignPayload = {
                dataset_title: datasetFormValues.title,
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
                        const isUnlabel = file.path.split('/').length === 2;
                        if(isUnlabel) {
                            const fileName = file.path.split('/').pop();
                            newPath = `unlabel_${fileName}`;
                        } else {
                            newPath = file.path.split('/').slice(-2).join('_');
                        }
                        zip.file(newPath, file.fileObject);
                    }
                    await uploadToS3(presignedUrl, await zip.generateAsync({ type: 'blob' }));
                }
            }

            // Kết hợp dữ liệu từ cả hai form
            const finalPayload = {
                ...datasetFormValues,
                description: datasetFormValues.description || '',
                dataset_type,
                service,
                bucket_name,
                total_files: files.length,
                total_size_kb: parseFloat(totalKbytes) || 0,
                index_path: `${datasetFormValues.title}/index.json`,
                chunks: chunks.map((chunk) => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                    s3_path: `${datasetFormValues.title}/zip/${chunk.name}`,
                })),
                status: 'active',
                meta_data: extraMeta,
                label_project: labelProjectValues
            };

            await onCreate(finalPayload);
            handleCancel();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            message.error('Failed to create dataset and label project. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentStep(0);
        setDatasetFormValues(null);
        onCancel();
    };

    return (
        <Modal
            title="Create New Dataset"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
            centered
        >
            <Steps
                current={currentStep}
                items={[
                    { title: 'Create Dataset' },
                    { title: 'Create Label Project' }
                ]}
                style={{ marginBottom: 24 }}
            />
            
            {currentStep === 0 ? (
                <CreateDatasetForm 
                    onNext={handleNext} 
                    onCancel={handleCancel}
                    initialValues={datasetFormValues}
                />
            ) : (
                <CreateLabelProjectForm 
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                    onCancel={handleCancel}
                    loading={isLoading}
                    prefillTaskType={datasetFormValues?.dataset_type}
                    initialValues={{
                        name: datasetFormValues?.title,
                        taskType: datasetFormValues?.dataset_type
                    }}
                    detectedLabels={datasetFormValues?.detectedLabels || []}
                    csvMetadata={datasetFormValues?.csvMetadata}
                />
            )}
        </Modal>
    );
};

export default CreateDatasetModal;