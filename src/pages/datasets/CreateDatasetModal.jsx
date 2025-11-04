import React, { useState, useRef } from 'react';
import { Modal, Steps, Spin, message } from 'antd';
import JSZip, { file } from 'jszip';
import { createChunks, organizeFiles, extractCSVMetaData } from 'src/utils/file';
import { uploadToS3 } from 'src/utils/s3';
import { IMG_NUM_IN_ZIP } from 'src/constants/file';
import * as datasetAPI from 'src/api/dataset';
import CreateDatasetForm from './CreateDatasetForm';
import CreateLabelProjectForm from './CreateLabelProjectForm';

const CreateDatasetModal = ({ visible, onCancel, onCreate }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [datasetFormValues, setDatasetFormValues] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [labelProjectData, setLabelProjectData] = useState(null);

    const handleNext = async (values) => {
        setDatasetFormValues(values);
        setCurrentStep(1);
    };
    
    const handleBack = () => {
        setCurrentStep(0);
    };
    const isImageFolder = (files) => {
        const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        return files.every((file) => allowedImageExtensions.includes(file.path.split('.').pop().toLowerCase()));
    };
    const isAudioFolder = (files) => {
        const allowedAudioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
        return files.every((file) => allowedAudioExtensions.includes(file.path.split('.').pop().toLowerCase()));
    };
    const isVideoFolder = (files) => {
        const allowedVideoExtensions = ['mp4', 'm4v'];
        return files.every((file) => allowedVideoExtensions.includes(file.path.split('.').pop().toLowerCase()));
    }
    const handleSubmit = async (labelProjectValues) => {
        try {
            setIsLoading(true);
            console.log('handleSubmit called with labelProjectValues:', labelProjectValues);
            const { files, totalKbytes, dataset_type, service, bucket_name, title, description, taskType } = datasetFormValues;
        
            console.log('Initial dataset:', title);
            const initialDatasetPayload = {
                title,
                dataset_type
            };
            const initialResponse = await datasetAPI.initializeDataset(initialDatasetPayload);
            console.log('Initial dataset created:', initialResponse.data);
            const createdDataset = initialResponse.data;
            const datasetID = createdDataset.id;
            if (!datasetID) {
                throw new Error("Không thể khởi tạo dataset trên server.");
            }
            console.log('Dataset ID:', datasetID);

            setLabelProjectData(labelProjectValues);
            console.log('labelProjectData set to:', labelProjectValues);
            const fileMap = organizeFiles(files);
            const chunks = [];
            const zips = [];
            for (const [label, folderFiles] of fileMap.entries()) {
                if (isImageFolder(folderFiles)) {
                    const folderChunk = createChunks(new Map([[label, folderFiles]]), IMG_NUM_IN_ZIP);
                    chunks.push(...folderChunk);
                } else if (dataset_type === 'AUDIO' && isAudioFolder(folderFiles)) {
                    const folderChunk = createChunks(new Map([[label, folderFiles]]), IMG_NUM_IN_ZIP);
                    chunks.push(...folderChunk);
                } else if (dataset_type === 'VIDEO' && isVideoFolder(folderFiles)) {
                    const folderChunk = createChunks(new Map([[label, folderFiles]]), IMG_NUM_IN_ZIP);
                    chunks.push(...folderChunk);
                } else {
                    zips.push({
                        name: `chunk_unlabel_0.zip`,
                        files: folderFiles,
                    });
                }
            }

            let extraMeta = {};
            const csvFile = files.find(f => f.path.endsWith('.csv'));
            if ((dataset_type === 'TEXT' || dataset_type === 'TABULAR' || dataset_type === 'MULTIMODAL' || dataset_type === 'TIME_SERIES') && csvFile) {
                try {
                    extraMeta = await extractCSVMetaData(csvFile.fileObject);
                } catch (err) {
                    console.warn('CSV meta extraction failed', err);
                }
            }

            const fileToChunkMap = new Map();
            chunks.forEach(chunk => {
                chunk.files.forEach(file => {
                    fileToChunkMap.set(file.path, chunk.name);
                });
            });

            const indexData = {
                dataset_title: title,
                dataset_type,
                files: files.map(file => {
                    const parts = file.path.split('/');
                    const simplePath = parts.length > 1 ? parts.slice(1).join('/') : file.path;
                    return {
                        path: `${datasetID}/${simplePath}`,
                        chunk: fileToChunkMap.get(file.path) || null,
                    };
                }),
                chunks: chunks.map(chunk => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                })),
            };

            const s3Files = [
                {
                    key: `${datasetID}/index.json`,
                    type: 'application/json',
                    content: JSON.stringify(indexData, null, 2),
                },
                ...chunks.map(chunk => ({
                    key: `${datasetID}/zip/${chunk.name}`,
                    type: 'application/zip',
                    files: chunk.files,
                })),
                ...zips.map(zip => ({
                    key: `${datasetID}/zip/${zip.name}`,
                    type: 'application/zip',
                    files: zip.files,
                })),
            ];

            const presignPayload = {
                dataset_title: datasetID,
                files: s3Files.map(file => ({ key: file.key, type: file.type })),
            };

            const { data: presignedUrls } = await datasetAPI.createPresignedUrls(presignPayload);
            const fileTypes = Array.from(new Set(files.map(file => file.path.split('.').pop().toLowerCase())));
            for (const file of s3Files) {
                const url = presignedUrls.find(u => u.key === file.key)?.url;
                if (!url) throw new Error(`Missing presigned URL for ${file.key}`);

                if (file.type === 'application/json') {
                    await uploadToS3(url, new Blob([file.content], { type: 'application/json' }));
                } else {
                    const zip = new JSZip();
                    for (const f of file.files) {
                        let zipPath = f.path.split('/').slice(-2).join('/');
                        if (f.path.split('/').length === 2) {
                            const name = f.path.split('/').pop();
                            zipPath = `unlabel_${name}`;
                        } else {
                            zipPath = f.path.split('/').slice(-2).join('_');
                        }
                        zip.file(zipPath, f.fileObject);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    await uploadToS3(url, zipBlob);
                }
            }

            const finalizePayload = {
                service,
                bucket_name,
                total_files: files.length,
                total_size_kb: parseFloat(totalKbytes) || 0,
                index_path: `${datasetID}/index.json`,
                chunks: chunks.map(chunk => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                    s3_path: `${datasetID}/zip/${chunk.name}`,
                })),
                status: 'active',
                meta_data: extraMeta,
                //ls_project_creation_data: labelProjectValues 
            };
            console.log("ID đang được dùng để finalize:", datasetID);
            await datasetAPI.finalizeDataset(datasetID, finalizePayload);
            console.log('Dataset finalized on server');
            // Đóng modal ngay lập tức và chuyển polling sang Zustand store
            onCreate(createdDataset, labelProjectValues);
            handleCancel();
        } catch (err) {
            console.error('Submit error:', err);
            message.error('Failed to create dataset and label project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentStep(0);
        setDatasetFormValues(null);
        setLabelProjectData(null);
        setIsLoading(false);
        onCancel();
    };

    return (
        <>
            <style>{`
                .theme-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 16px !important;
                }
                
                .theme-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                }
                
                .theme-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-modal .ant-modal-close {
                    color: var(--modal-close-color) !important;
                }
                
                .theme-modal .ant-modal-close:hover {
                    color: var(--modal-close-hover) !important;
                }
                
                .theme-modal .ant-steps-item-title {
                    color: var(--steps-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-modal .ant-steps-item-description {
                    color: var(--steps-description-color) !important;
                }
                
                .theme-modal .ant-steps-item-icon {
                    background: var(--steps-icon-bg) !important;
                    border-color: var(--steps-icon-border) !important;
                }
                
                .theme-modal .ant-steps-item-icon .ant-steps-icon {
                    color: var(--steps-icon-color) !important;
                }
                
                .theme-modal .ant-steps-item-process .ant-steps-item-icon {
                    background: var(--steps-process-icon-bg) !important;
                    border-color: var(--steps-process-icon-border) !important;
                }
                
                .theme-modal .ant-steps-item-finish .ant-steps-item-icon {
                    background: var(--steps-finish-icon-bg) !important;
                    border-color: var(--steps-finish-icon-border) !important;
                }
                
                .theme-modal .ant-steps-item-finish .ant-steps-icon {
                    color: var(--steps-finish-icon-color) !important;
                }
                
                /* Hide scrollbar but keep scrolling functionality */
                .theme-modal .ant-modal-body {
                    scrollbar-width: none !important; /* Firefox */
                    -ms-overflow-style: none !important; /* IE and Edge */
                }
                
                .theme-modal .ant-modal-body::-webkit-scrollbar {
                    display: none !important; /* Chrome, Safari, Opera */
                }
                
                /* Hide scrollbar for the entire modal content */
                .theme-modal {
                    scrollbar-width: none !important; /* Firefox */
                    -ms-overflow-style: none !important; /* IE and Edge */
                }
                
                .theme-modal::-webkit-scrollbar {
                    display: none !important; /* Chrome, Safari, Opera */
                }
            `}</style>
            <Modal
                title="Create New Dataset"
                open={visible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                destroyOnClose
                centered
                className="theme-modal"
                styles={{
                    content: {
                        background: 'var(--modal-bg)',
                        border: '1px solid var(--modal-border)',
                        borderRadius: '16px',
                    },
                    header: {
                        background: 'var(--modal-header-bg)',
                        borderBottom: '1px solid var(--modal-header-border)',
                    },
                    title: {
                        color: 'var(--modal-title-color)',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                    },
                    close: {
                        color: 'var(--modal-close-color)',
                    }
                }}
            >
                {visible && (isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                        <p style={{ color: 'var(--text)', fontFamily: 'Poppins, sans-serif', marginTop: '16px' }}>
                            Processing dataset, please wait...
                        </p>
                    </div>
                ) : (
                    <>
                        
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
                                taskType={datasetFormValues?.taskType}
                                description={datasetFormValues?.description}
                                initialValues={{ name: datasetFormValues?.title }}
                                detectedLabels={datasetFormValues?.detectedLabels || []}
                                csvMetadata={datasetFormValues?.csvMetadata}
                            />
                        )}
                    </>
                ))}
            </Modal>
        </>
    );
};

export default CreateDatasetModal;
