import React, { useState, useEffect } from 'react';
import { Modal, Steps, message } from 'antd';
import ManualCreationModal from './ManualCreationModal';
import CreateDatasetForm from 'src/pages/datasets/CreateDatasetForm';
import { TASK_TYPES } from 'src/constants/types';
import * as projectAPI from 'src/api/project';
import * as datasetAPI from 'src/api/dataset';
import * as labelProjectAPI from 'src/api/labelProject';
import JSZip from 'jszip';
import { createChunks, organizeFiles, extractCSVMetaData } from 'src/utils/file';
import { uploadToS3 } from 'src/utils/s3';
import { IMG_NUM_IN_ZIP } from 'src/constants/file';
import { usePollingStore } from 'src/store/pollingStore'; // Import polling store

const { Step } = Steps;

const projType = Object.keys(TASK_TYPES);

const CreateProjectModal = ({ open, onCancel, onCreate }) => {
    const [current, setCurrent] = useState(0);
    const [projectData, setProjectData] = useState(null);
    const [datasetData, setDatasetData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelected, setIsSelected] = useState(
		projType.map((_, index) => index === 0)
	);
    
    // Lấy hàm addPending từ Zustand store
    const addPending = usePollingStore((state) => state.addPending);

    const onSelectType = (e, idx) => {
		const tmpArr = isSelected.map((el, index) =>
			index === idx ? true : false
		)
		setIsSelected(tmpArr)
	}

    const next = (values) => {
        const selectedIndex = isSelected.findIndex(v => v === true);
        const task_type = projType[selectedIndex];
        
        setProjectData({ ...values, task_type });
        setCurrent(1);
    };

    const prev = (values) => {
        setDatasetData(values);
        setCurrent(0);
    };

    const handleCancel = () => {
        setCurrent(0);
        setProjectData(null);
        setDatasetData(null);
        setIsSelected(projType.map((_, index) => index === 0));
        onCancel();
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        message.loading({ content: 'Submitting project and data...', key: 'submit' });
        const finalDatasetData = { ...datasetData, ...values };

        try {
            // 1. Create Project
            const projectResponse = await projectAPI.createProject(projectData);
            const createdProject = projectResponse.data;
            message.success({ content: 'Project created!', key: 'submit', duration: 2 });

            // 2. Initialize Dataset
            const initialDatasetPayload = {
                title: createdProject.name,
                dataset_type: TASK_TYPES[createdProject.task_type].dataType,
            };
            const initialResponse = await datasetAPI.initializeDataset(initialDatasetPayload);
            const createdDataset = initialResponse.data;
            const datasetID = createdDataset.id;

            // 3. Process and Upload Files to S3
            const { files, totalKbytes } = finalDatasetData;
            const fileMap = organizeFiles(files);
            const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP);

            const fileToChunkMap = new Map();
            chunks.forEach(chunk => {
                chunk.files.forEach(file => {
                    fileToChunkMap.set(file.path, chunk.name);
                });
            });

            const indexData = {
                dataset_title: createdProject.name,
                dataset_type: TASK_TYPES[createdProject.task_type].dataType,
                files: files.map(file => ({
                    path: `${datasetID}/${file.path}`,
                    chunk: fileToChunkMap.get(file.path) || null,
                })),
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
            ];

            const presignPayload = {
                dataset_title: datasetID,
                files: s3Files.map(file => ({ key: file.key, type: file.type })),
            };
            const { data: presignedUrls } = await datasetAPI.createPresignedUrls(presignPayload);

            for (const file of s3Files) {
                const urlData = presignedUrls.find(u => u.key === file.key);
                if (!urlData) throw new Error(`Missing presigned URL for ${file.key}`);

                if (file.type === 'application/json') {
                    await uploadToS3(urlData.url, new Blob([file.content], { type: 'application/json' }));
                } else {
                    const zip = new JSZip();
                    for (const f of file.files) {
                        zip.file(f.path, f.fileObject);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    await uploadToS3(urlData.url, zipBlob);
                }
            }

            // 4. Finalize Dataset
            let extraMeta = {};
            const csvFile = files.find(f => f.path.endsWith('.csv'));
             if ((createdDataset.dataset_type === 'TEXT' || createdDataset.dataset_type === 'TABULAR' || createdDataset.dataset_type === 'MULTIMODAL') && csvFile) {
                extraMeta = await extractCSVMetaData(csvFile.fileObject);
            }

            const finalizePayload = {
                service: 'AWS_S3', 
                bucket_name: 'user-private-dataset', 
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
            };
            await datasetAPI.finalizeDataset(datasetID, finalizePayload);

            // 5. Add to polling store instead of creating label project directly
            const labelProjectValues = {
                name: createdProject.name,
                taskType: createdProject.task_type,
                datasetId: datasetID,
                expectedLabels: finalDatasetData.detectedLabels || [],
                description: createdProject.description,
            };
            
            addPending({ dataset: createdDataset, labelProjectValues });

            message.success('Project submitted! Dataset is now processing in the background.');
            
            onCreate(); // Callback to refresh project list
            handleCancel();

        } catch (error) {
            console.error('Failed to create project pipeline:', error);
            message.error('An error occurred. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isManualStep = current === 0;

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800} // Same width for both steps - compact and consistent
            title="Create New Project"
            destroyOnClose
            className="theme-create-project-modal"
        >
             <style>{`
                .theme-create-project-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    border-radius: 16px !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid var(--modal-border) !important;
                }
                
                .theme-create-project-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                    padding: 24px 24px 16px 24px !important;
                }
                
                .theme-create-project-modal .ant-modal-body {
                    padding: 24px !important;
                    background: transparent !important;
                }
                
                .theme-create-project-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-create-project-modal .ant-modal-close {
                    color: var(--modal-close-color) !important;
                }
                
                .theme-create-project-modal .ant-modal-close:hover {
                    color: var(--modal-close-hover) !important;
                }
                
                .theme-create-project-modal .ant-steps {
                    background: transparent !important;
                }
                
                .theme-create-project-modal .ant-steps-item-title {
                    color: var(--steps-title-color) !important;
                }
                
                .theme-create-project-modal .ant-steps-item-description {
                    color: var(--steps-description-color) !important;
                }
                
                /* Beautiful step indicators with gradients */
                .theme-create-project-modal .ant-steps-item-icon {
                    background: var(--steps-icon-bg) !important;
                    border: 1px solid var(--steps-icon-border) !important;
                }
                
                .theme-create-project-modal .ant-steps-item-process .ant-steps-item-icon {
                    background: var(--steps-process-icon-bg) !important;
                    border: 1px solid var(--steps-process-icon-border) !important;
                }
                
                .theme-create-project-modal .ant-steps-item-finish .ant-steps-item-icon {
                    background: var(--steps-finish-icon-bg) !important;
                    border: 1px solid var(--steps-finish-icon-border) !important;
                }
                
                .theme-create-project-modal .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
                    color: var(--steps-finish-icon-color) !important;
                }
            `}</style>
            <Steps current={current} style={{ marginBottom: 24 }}>
                <Step key="Project Details" title="Project Details" />
                <Step key="Upload Data" title="Upload Data" />
            </Steps>
            <div>
                {current === 0 && (
                    <ManualCreationModal
                        isStep={true}
                        onNext={next}
                        onCancel={handleCancel}
                        isSelected={isSelected}
                        onSelectType={onSelectType}
                        initialProjectName={projectData?.name}
                        initialDescription={projectData?.description}
                        initialTaskType={projectData?.task_type || projType[0]}
                        initialVisibility={projectData?.visibility || 'private'}
                        initialLicense={projectData?.license || 'MIT'}
                        initialExpectedAccuracy={projectData?.expected_accuracy || 75}
                    />
                )}
                {current === 1 && (
                     <CreateDatasetForm
                        isStep={true}
                        onNext={handleSubmit}
                        onCancel={handleCancel}
                        onBack={prev}
                        initialValues={{
                            ...datasetData,
                            title: projectData?.name,
                            description: projectData?.description,
                            dataset_type: projectData ? TASK_TYPES[projectData.task_type]?.dataType : null,
                        }}
                        disableFields={['title', 'description', 'type']}
                        hideFields={['service', 'bucket_name']}
                    />
                )}
            </div>
        </Modal>
    );
};

export default CreateProjectModal;