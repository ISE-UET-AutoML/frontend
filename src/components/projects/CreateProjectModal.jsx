import React, { useState, useEffect } from 'react'
import { Modal, Steps, message, Spin } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import ManualCreationModal from './ManualCreationModal'
import CreateDatasetForm from 'src/pages/datasets/CreateDatasetForm'
import { TASK_TYPES } from 'src/constants/types'
import * as projectAPI from 'src/api/project'
import * as datasetAPI from 'src/api/dataset'
import * as labelProjectAPI from 'src/api/labelProject'
import JSZip from 'jszip'
import { createChunks, organizeFiles, extractCSVMetaData } from 'src/utils/file'
import { uploadToS3 } from 'src/utils/s3'
import { IMG_NUM_IN_ZIP } from 'src/constants/file'
import { usePollingStore } from 'src/store/pollingStore' // Import polling store
import { WaitForPollingSuccess } from './WaitForPollingSuccess'
import {
    createLbProject,
    getLbProjByTask,
    startExport,
    getExportStatus,
} from 'src/api/labelProject'
import { useNavigate } from 'react-router-dom'
import { trainCloudModel } from 'src/api/mlService'
import { createDownZipPU } from 'src/api/dataset'
import { is } from '@react-spring/shared'

const { Step } = Steps

const projType = Object.keys(TASK_TYPES)

const CreateProjectModal = ({ open, onCancel, onCreate }) => {
    const [current, setCurrent] = useState(0)
    const [projectData, setProjectData] = useState(null)
    const [datasetData, setDatasetData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSelected, setIsSelected] = useState(
        projType.map((_, index) => index === 0)
    )
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const navigate = useNavigate()

    // Lấy hàm addPending từ Zustand store
    const addPending = usePollingStore((state) => state.addPending)

    const onSelectType = (e, idx) => {
        const tmpArr = isSelected.map((el, index) =>
            index === idx ? true : false
        )
        setIsSelected(tmpArr)
    }

    const next = (values) => {
        const selectedIndex = isSelected.findIndex((v) => v === true)
        const task_type = projType[selectedIndex]

        setProjectData({ ...values, task_type })
        setCurrent(1)
    }

    const prev = (values) => {
        setDatasetData(values)
        setCurrent(0)
    }

    const handleCancel = () => {
        // Check if there's any unsaved data (from current state OR from previous steps)
        const hasData = hasUnsavedChanges || projectData || datasetData

        if (hasData) {
            Modal.confirm({
                title: (
                    <span
                        style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            color: 'var(--text)',
                        }}
                    >
                        Are you sure you want to exit?
                    </span>
                ),
                icon: (
                    <ExclamationCircleOutlined
                        style={{ fontSize: '24px', color: '#faad14' }}
                    />
                ),
                content: (
                    <div
                        style={{
                            fontSize: '15px',
                            marginTop: '12px',
                            color: 'var(--text)',
                        }}
                    >
                        You have unsaved data. If you exit, all data will be
                        lost.
                    </div>
                ),
                okText: 'Exit',
                cancelText: 'Continue Working',
                okType: 'danger',
                centered: true,
                width: 520,
                className: 'theme-confirm-modal',
                okButtonProps: {
                    style: {
                        fontSize: '15px',
                        height: '40px',
                        fontWeight: 500,
                    },
                },
                cancelButtonProps: {
                    style: {
                        fontSize: '15px',
                        height: '40px',
                        fontWeight: 500,
                    },
                },
                onOk: () => {
                    setCurrent(0)
                    setProjectData(null)
                    setDatasetData(null)
                    setIsSelected(projType.map((_, index) => index === 0))
                    setHasUnsavedChanges(false)
                    onCancel()
                },
            })
        } else {
            setCurrent(0)
            setProjectData(null)
            setDatasetData(null)
            setIsSelected(projType.map((_, index) => index === 0))
            setHasUnsavedChanges(false)
            onCancel()
        }
    }

    const pollExportStatus = (taskId) => {
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const response = await getExportStatus(taskId)
                    const { status, result, error } = response.data

                    console.log(
                        `[pollExportStatus] Task ${taskId} → status: ${status}`
                    )

                    if (status === 'SUCCESS') {
                        clearInterval(intervalId)
                        console.log(
                            `[pollExportStatus] Task ${taskId} completed. Result:`,
                            result
                        )
                        resolve(result)
                    } else if (status === 'FAILURE') {
                        clearInterval(intervalId)
                        console.error(
                            `[pollExportStatus] Task ${taskId} failed. Error:`,
                            error
                        )
                        reject(new Error(error || 'Export task failed.'))
                    }
                    // Nếu là PENDING thì tiếp tục chờ
                } catch (err) {
                    clearInterval(intervalId)
                    console.error(
                        `[pollExportStatus] Error checking task ${taskId}:`,
                        err?.message || err
                    )
                    reject(err)
                }
            }, 5000) // Hỏi lại mỗi 5 giây
        })
    }

    const handleSubmit = async (values) => {
        setIsLoading(true)
        setHasUnsavedChanges(false) // Clear warning immediately when user clicks Submit
        message.loading({
            content: 'Submitting project and data...',
            key: 'submit',
        })
        const finalDatasetData = { ...datasetData, ...values }

        try {
            // 1. Create Project

            // 1. Initialize Dataset
            const initialDatasetPayload = {
                title: projectData.name,
                dataset_type: TASK_TYPES[projectData.task_type].dataType,
            }
            const initialResponse = await datasetAPI.initializeDataset(
                initialDatasetPayload
            )
            const createdDataset = initialResponse.data
            const datasetID = createdDataset.id
            message.success({
                content: 'Dataset initialized!',
                key: 'submit',
                duration: 2,
            })

            // 2. Create Project
            const projectPayload = {
                ...projectData,
                dataset_id: datasetID,
            }
            const projectResponse =
                await projectAPI.createProject(projectPayload)
            const projectInfo = projectResponse.data
            console.log('Created project:', projectInfo)
            const createdProject = projectResponse.data
            message.success({
                content: 'Project created!',
                key: 'submit',
                duration: 2,
            })

            // 3. Process and Upload Files to S3
            const { files, totalKbytes } = finalDatasetData
            const fileMap = organizeFiles(files)
            const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP)

            const fileToChunkMap = new Map()
            chunks.forEach((chunk) => {
                chunk.files.forEach((file) => {
                    fileToChunkMap.set(file.path, chunk.name)
                })
            })

            const indexData = {
                dataset_title: createdProject.name,
                dataset_type: TASK_TYPES[createdProject.task_type].dataType,
                files: files.map((file) => ({
                    path: `${datasetID}/${file.path}`,
                    chunk: fileToChunkMap.get(file.path) || null,
                })),
                chunks: chunks.map((chunk) => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                })),
            }

            const s3Files = [
                {
                    key: `${datasetID}/index.json`,
                    type: 'application/json',
                    content: JSON.stringify(indexData, null, 2),
                },
                ...chunks.map((chunk) => ({
                    key: `${datasetID}/zip/${chunk.name}`,
                    type: 'application/zip',
                    files: chunk.files,
                })),
            ]

            const presignPayload = {
                dataset_title: datasetID,
                files: s3Files.map((file) => ({
                    key: file.key,
                    type: file.type,
                })),
            }
            const { data: presignedUrls } =
                await datasetAPI.createPresignedUrls(presignPayload)

            for (const file of s3Files) {
                const urlData = presignedUrls.find((u) => u.key === file.key)
                if (!urlData)
                    throw new Error(`Missing presigned URL for ${file.key}`)

                if (file.type === 'application/json') {
                    await uploadToS3(
                        urlData.url,
                        new Blob([file.content], { type: 'application/json' })
                    )
                } else {
                    const zip = new JSZip()
                    for (const f of file.files) {
                        let zipPath = f.path.split('/').slice(-2).join('/')
                        if (f.path.split('/').length === 2) {
                            const name = f.path.split('/').pop()
                            zipPath = `unlabel_${name}`
                        } else {
                            zipPath = f.path.split('/').slice(-2).join('_')
                        }
                        zip.file(zipPath, f.fileObject)
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' })
                    await uploadToS3(urlData.url, zipBlob)
                }
            }

            // 4. Finalize Dataset
            let extraMeta = {}
            const csvFile = files.find((f) => f.path.endsWith('.csv'))
            if (
                (createdDataset.dataset_type === 'TEXT' ||
                    createdDataset.dataset_type === 'TABULAR' ||
                    createdDataset.dataset_type === 'MULTIMODAL') &&
                csvFile
            ) {
                extraMeta = await extractCSVMetaData(csvFile.fileObject)
            }

            const finalizePayload = {
                service: 'AWS_S3',
                bucket_name: 'user-private-dataset',
                total_files: files.length,
                total_size_kb: parseFloat(totalKbytes) || 0,
                index_path: `${datasetID}/index.json`,
                chunks: chunks.map((chunk) => ({
                    name: chunk.name,
                    file_count: chunk.files.length,
                    s3_path: `${datasetID}/zip/${chunk.name}`,
                })),
                status: 'active',
                meta_data: extraMeta,
            }
            await datasetAPI.finalizeDataset(datasetID, finalizePayload)

            // 5. Add to polling store instead of creating label project directly
            const labelProjectValues = {
                name: createdProject.name,
                taskType: createdProject.task_type,
                datasetId: datasetID,
                expectedLabels: finalDatasetData.detectedLabels || [],
                description: createdProject.description,
            }

            addPending({ dataset: createdDataset, labelProjectValues })

            try {
                const datasetSucess = await WaitForPollingSuccess(
                    createdDataset.id
                )
                console.log('Dataset processing completed:', datasetSucess)
                const getedDatasetRes = await datasetAPI.getDataset(
                    createdDataset.id
                )
                const getedDataset = getedDatasetRes.data
                console.log('Geted dataset: ', getedDataset)
                const ls_project_id = getedDataset.ls_project.label_studio_id
                const dataset_id = getedDataset.id
                const meta_data = getedDataset.ls_project.meta_data
                const is_binary_class = meta_data.is_binary_class
                const startResponse = await startExport(ls_project_id)
                const { task_id } = startResponse.data
                console.log('Export started, task ID:', startResponse)

                const finalResult = await pollExportStatus(task_id)
                console.log('Export completed successfully:', finalResult)
                message.success('Data prepared successfully!')

                const presignUrl = await createDownZipPU(dataset_id)
                const payload = {
                    cost: 0.5,
                    trainingTime: 86400,
                    presets: 'medium_quality',
                    datasetUrl: presignUrl.data,
                    datasetLabelUrl: 'hello',
                    problemType: is_binary_class ? 'BINARY' : 'MULTICLASS',
                    framework: 'autogluon',
                    datasetMetadata: meta_data,
                }
                console.log('Train payload: ', payload)
                const trainingRequest = await trainCloudModel(
                    projectInfo.id,
                    payload
                )
                const trainingResult = trainingRequest.data
                console.log('Training response:', trainingResult)

                if (
                    trainingResult &&
                    trainingResult.experimentName &&
                    trainingResult.experimentId
                ) {
                    setIsLoading(false)
                    // Close modal and clear all states before navigating
                    setCurrent(0)
                    setProjectData(null)
                    setDatasetData(null)
                    setIsSelected(projType.map((_, index) => index === 0))
                    setHasUnsavedChanges(false)
                    onCancel() // Close the modal

                    // Small delay to ensure modal is closed before navigation
                    setTimeout(() => {
                        navigate(
                            `/app/project/${projectInfo.id}/build/training?experimentName=${trainingResult.experimentName}&experimentId=${trainingResult.experimentId}`,
                            { replace: true }
                        )
                    }, 100)
                } else {
                    message.error('Training result is invalid!')
                    // Clear states before navigating
                    setCurrent(0)
                    setProjectData(null)
                    setDatasetData(null)
                    setIsSelected(projType.map((_, index) => index === 0))
                    setHasUnsavedChanges(false)
                    onCancel()

                    setTimeout(() => {
                        navigate(`/app/project`, { replace: true })
                    }, 100)
                }
            } catch (error) {
                console.error('Error exporting labels to S3:', error)
                message.error('Không thể chuẩn bị dữ liệu. Vui lòng thử lại.')
            } finally {
                setIsLoading(false)
            }

            message.success('Project submitted! Starting training...')

            // Clear states and close modal
            setCurrent(0)
            setProjectData(null)
            setDatasetData(null)
            setIsSelected(projType.map((_, index) => index === 0))
            setHasUnsavedChanges(false)
            onCreate() // Callback to refresh project list
            onCancel() // Close modal without confirmation
        } catch (error) {
            console.error('Failed to create project pipeline:', error)
            message.error(
                'An error occurred. Please check the console for details.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const isManualStep = current === 0

    return (
        <>
            <Modal
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={1400} // Further increased width to match ManualCreationModal
                title="Create New Project"
                destroyOnClose
                className="theme-create-project-modal"
                style={{ top: 30 }}
                maskClosable={false}
                closable={true}
            >
                <style>{`
                    /* Confirm Modal Theme */
                    .theme-confirm-modal .ant-modal-content {
                        background: var(--modal-bg) !important;
                        border-radius: 16px !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
                        border: 1px solid var(--modal-border) !important;
                    }

                    .theme-confirm-modal .ant-modal-body {
                        background: var(--modal-bg) !important;
                        color: var(--text) !important;
                    }

                    .theme-confirm-modal .ant-modal-confirm-body {
                        background: transparent !important;
                    }

                    .theme-confirm-modal .ant-modal-confirm-title {
                        color: var(--text) !important;
                    }

                    .theme-confirm-modal .ant-modal-confirm-content {
                        color: var(--text) !important;
                    }

                    /* Create Project Modal */
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

                    /* Dataset step overrides – follow theme variables */
                    .theme-create-project-modal .dataset-step .ant-form-item-label > label {
                        color: var(--form-label-color) !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-tabs-tab .ant-tabs-tab-btn,
                    .theme-create-project-modal .dataset-step .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: var(--text) !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-input,
                    .theme-create-project-modal .dataset-step textarea {
                        color: var(--text) !important;
                        background: transparent !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-input[disabled],
                    .theme-create-project-modal .dataset-step textarea[disabled] {
                        color: var(--text) !important;
                        background: transparent !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-input::placeholder,
                    .theme-create-project-modal .dataset-step textarea::placeholder {
                        color: var(--placeholder-color) !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-input::-webkit-input-placeholder,
                    .theme-create-project-modal .dataset-step textarea::-webkit-input-placeholder {
                        color: var(--placeholder-color) !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-select-selector,
                    .theme-create-project-modal .dataset-step .ant-select-selection-item {
                        background: transparent !important;
                        color: var(--text) !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-select-selection-placeholder,
                    .theme-create-project-modal .dataset-step .ant-select-selector .ant-select-selection-placeholder {
                        color: var(--placeholder-color) !important;
                    }

                    /* Submit button sky theme */
                    .theme-create-project-modal .dataset-step .ant-btn-primary {
                        background: #0ea5e9 !important; /* sky-500 */
                        border-color: #0ea5e9 !important;
                        color: #ffffff !important;
                        font-weight: 600 !important; /* semibold */
                        height: 40px !important;
                        padding: 0 16px !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-btn-primary:hover,
                    .theme-create-project-modal .dataset-step .ant-btn-primary:focus {
                        background: #38bdf8 !important; /* sky-400 */
                        border-color: #38bdf8 !important;
                        color: #ffffff !important;
                    }
                    .theme-create-project-modal .dataset-step .ant-btn-primary:disabled {
                        background: #7dd3fc !important; /* sky-300 */
                        border-color: #7dd3fc !important;
                        color: #ffffff !important;
                        opacity: 0.7;
                    }

                    /* Make Cancel match size */
                    .theme-create-project-modal .dataset-step .ant-btn:not(.ant-btn-primary) {
                        height: 40px !important;
                        padding: 0 16px !important;
                    }
                `}</style>
                <Steps current={current} style={{ marginBottom: 24 }}>
                    <Step key="Project Details" title="Project Details" />
                    <Step key="Upload Data" title="Upload Data" />
                </Steps>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {current === 0 && (
                        <ManualCreationModal
                            isStep={true}
                            onNext={next}
                            onCancel={handleCancel}
                            isSelected={isSelected}
                            onSelectType={onSelectType}
                            initialProjectName={projectData?.name}
                            initialDescription={projectData?.description}
                            initialTaskType={
                                projectData?.task_type || projType[0]
                            }
                            initialVisibility={
                                projectData?.visibility || 'private'
                            }
                            initialLicense={projectData?.license || 'MIT'}
                            initialExpectedAccuracy={
                                projectData?.expected_accuracy || 75
                            }
                            onFormChange={(hasChanges) =>
                                setHasUnsavedChanges(hasChanges)
                            }
                        />
                    )}
                    {current === 1 && (
                        <div
                            className="dataset-step"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                position: 'relative',
                                zIndex: 1,
                                height: 'calc(85vh - 180px)',
                                overflow: 'hidden',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#94a3b8 transparent',
                            }}
                        >
                            <CreateDatasetForm
                                isStep={true}
                                onNext={handleSubmit}
                                onCancel={handleCancel}
                                onBack={prev}
                                initialValues={{
                                    ...datasetData,
                                    title: projectData?.name,
                                    description: projectData?.description,
                                    dataset_type: projectData
                                        ? TASK_TYPES[projectData.task_type]
                                            ?.dataType
                                        : null,
                                    task_type: projectData?.task_type,
                                }}
                                disableFields={['title', 'description', 'type']}
                                hideFields={['service', 'bucket_name']}
                                stickyFooter={true}
                                onFormChange={(hasChanges) =>
                                    setHasUnsavedChanges(hasChanges)
                                }
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[2000]">
                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                        <Spin size="large" />
                        <div
                            style={{
                                marginTop: 16,
                                fontSize: 16,
                                fontWeight: 500,
                            }}
                        >
                            Uploading data, wait a moment...
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CreateProjectModal
