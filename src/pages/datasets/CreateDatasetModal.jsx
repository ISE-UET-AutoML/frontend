// CreateDatasetModal.jsx
import React, { useState, useRef } from 'react';
import { Form, Input, Select, Radio, Button, message, Modal, Tabs, Steps } from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { DATASET_TYPES } from 'src/constants/types';
import * as datasetAPI from 'src/api/dataset';
import * as labelProjectAPI from 'src/api/labelProject';
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
    const [processingStatus, setProcessingStatus] = useState(null);
    const [labelProjectData, setLabelProjectData] = useState(null);

    const handleNext = async (values) => {
        setDatasetFormValues(values);
        setCurrentStep(1);
    };

    const handleBack = () => {
        setCurrentStep(0);
    };

    // Kiểm tra trạng thái processing của dataset
    const checkProcessingStatus = async (datasetId) => {
        try {
            const { data: status } = await datasetAPI.getProcessingStatus(datasetId);
            return status;
        } catch (error) {
            console.error('Error checking processing status:', error);
            return 'FAILED';
        }
    };

    // Tạo Label Studio project sau khi processing xong
    const createLabelProject = async (datasetId) => {
        try {
            if (!labelProjectData) return;

            const payload = {
                name: labelProjectData.name,
                taskType: labelProjectData.taskType,
                datasetId: datasetId,
                expectedLabels: labelProjectData.expectedLabels,
                meta_data: {
                    is_binary_class: labelProjectData.meta_data?.is_binary_class || false
                }
            };

            await labelProjectAPI.createLbProject(payload);
            message.success('Dataset and Label Project created successfully');
            handleCancel();
        } catch (error) {
            console.error('Error creating label project:', error);
            message.error('Failed to create label project');
        }
    };

    // Polling function để check processing status
    const pollProcessingStatus = async (datasetId) => {
        const maxAttempts = 30; // 5 phút (10s * 30)
        let attempts = 0;

        const poll = async () => {
            if (attempts >= maxAttempts) {
                message.error('Dataset processing timeout');
                setProcessingStatus('FAILED');
                return;
            }

            const status = await checkProcessingStatus(datasetId);
            setProcessingStatus(status);

            if (status === 'COMPLETED') {
                await createLabelProject(datasetId);
            } else if (status === 'FAILED') {
                message.error('Dataset processing failed');
            } else {
                attempts++;
                setTimeout(() => poll(), 10000); // check mỗi 10s
            }
        };

        await poll();
    };

    const handleSubmit = async (labelProjectValues) => {
        try {
            setIsLoading(true);
            const { files, totalKbytes, dataset_type, service, bucket_name } = datasetFormValues;
            
            // Đóng modal ngay khi bắt đầu xử lý

            // Khởi tạo fileMap và chunks trước khi dùng
            const fileMap = organizeFiles(files);
            const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP);

            // Khởi tạo extraMeta trước khi dùng
            let extraMeta = {};
            const csvFile = files.find((file) => file.path.endsWith('.csv'));
            if ((dataset_type === 'TEXT' || dataset_type === 'TABULAR' || dataset_type === 'MULTIMODAL') && csvFile) {
                try {
                    extraMeta = await extractCSVMetaData(csvFile.fileObject);
                } catch (err) {
                    console.error('CSV metadata extraction failed:', err);
                }
            }

            // Bước 1: Tạo dataset với trạng thái CREATING_DATASET
            const datasetPayload = {
                title: datasetFormValues.title,
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
                meta_data: extraMeta
            };

            const { data: createdDataset } = await datasetAPI.createDataset(datasetPayload);
            // Gọi onCreate ngay để render card mới ở trạng thái processing
            onCreate(createdDataset);

            // Upload files và đợi backend xử lý
            const fileToChunkMap = new Map();
            chunks.forEach((chunk) => {
                chunk.files.forEach((file) => {
                    fileToChunkMap.set(file.path, chunk.name);
                });
            });

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

            // Sau khi upload xong, lưu thông tin label project và bắt đầu polling trạng thái
            handleCancel();
            setLabelProjectData(labelProjectValues);
            // Hàm pollProcessingStatus sẽ tự gọi createLabelProject khi dataset đạt COMPLETED
            await pollProcessingStatus(createdDataset.id);

            // Khi createLabelProject hoàn thành, hàm handleCancel() đã được gọi.
             
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            message.error('Failed to create dataset and label project. Please try again.');
            
            // Nếu lỗi, cập nhật trạng thái FAILED
            // if (createdDataset?.id) {
            //     await datasetAPI.updateDataset(createdDataset.id, {
            //         processingStatus: 'FAILED'
            //     });
            // }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentStep(0);
        setDatasetFormValues(null);
        setProcessingStatus(null);
        setLabelProjectData(null);
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
                    initialFiles={datasetFormValues?.files || []}
                    initialDetectedLabels={datasetFormValues?.detectedLabels || []}
                    initialCsvMetadata={datasetFormValues?.csvMetadata || null}
                />
            ) : (
                <CreateLabelProjectForm 
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                    onCancel={handleCancel}
                    loading={isLoading}
                    datasetType={datasetFormValues?.dataset_type}
                    initialValues={{
                        name: datasetFormValues?.title,
                        // do not prefill taskType
                    }}
                    detectedLabels={datasetFormValues?.detectedLabels || []}
                    csvMetadata={datasetFormValues?.csvMetadata}
                />
            )}
        </Modal>
    );
};

export default CreateDatasetModal;