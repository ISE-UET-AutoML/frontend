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
        // ✅ Không tạo dataset ở bước 1, chỉ lưu thông tin và chuyển bước
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
    const handleSubmit = async (labelProjectValues) => {
        try {
            setIsLoading(true);
            console.log('handleSubmit called with labelProjectValues:', labelProjectValues);
            const { files, totalKbytes, dataset_type, service, bucket_name, title, description } = datasetFormValues;
            setLabelProjectData(labelProjectValues);
            console.log('labelProjectData set to:', labelProjectValues);
            const fileMap = organizeFiles(files);
            const chunks = [];
            const zips = [];
            for (const [label, folderFiles] of fileMap.entries()) {
                if(isImageFolder(folderFiles)) {
                    const folderChunk = createChunks(new Map([[label, folderFiles]]), IMG_NUM_IN_ZIP);
                    chunks.push(...folderChunk);
                } else {
                    zips.push({
                        name: `chunk_unlabel_0.zip`,
                        files: folderFiles,
                    })
                }
            }

            let extraMeta = {};
            const csvFile = files.find(f => f.path.endsWith('.csv'));
            if ((dataset_type === 'TEXT' || dataset_type === 'TABULAR' || dataset_type === 'MULTIMODAL') && csvFile) {
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
                        path: `${title}/${simplePath}`,
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
                    key: `${title}/index.json`,
                    type: 'application/json',
                    content: JSON.stringify(indexData, null, 2),
                },
                ...chunks.map(chunk => ({
                    key: `${title}/zip/${chunk.name}`,
                    type: 'application/zip',
                    files: chunk.files,
                })),
                ...zips.map(zip => ({
                key: `${title}/zip/${zip.name}`,
                type: 'application/zip',
                files: zip.files,
            })),
            ];

            const presignPayload = {
                dataset_title: title,
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

            const datasetPayload = {
                title,
                description: description || '',
                dataset_type,
                service,
                bucket_name,
                total_files: files.length,
                total_size_kb: parseFloat(totalKbytes) || 0,
                index_path: `${title}/index.json`,
                chunks: chunks.map(chunk => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                    s3_path: `${title}/zip/${chunk.name}`,
                })),
                status: 'active',
                meta_data: fileTypes,
            };

            const { data: createdDataset } = await datasetAPI.createDataset(datasetPayload);
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
        <Modal
            title="Create New Dataset"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
            centered
        >
            {visible && (isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <p>Processing dataset, please wait...</p>
                </div>
            ) : (
                <>
                    <Steps
                        current={currentStep}
                        items={[{ title: 'Create Dataset' }, { title: 'Create Label Project' }]}
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
                            initialValues={{ name: datasetFormValues?.title }}
                            detectedLabels={datasetFormValues?.detectedLabels || []}
                            csvMetadata={datasetFormValues?.csvMetadata}
                        />
                    )}
                </>
            ))}
        </Modal>
    );
};

export default CreateDatasetModal;
