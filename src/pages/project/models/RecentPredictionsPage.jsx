import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useOutletContext  } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import {
    Card,
    Space,
    Button,
    Table,
    Tooltip,
    Modal,
    Spin,
    message,
    Typography,
} from 'antd'
import {
    CheckCircleOutlined,
    DownloadOutlined,
    SettingOutlined,
    ArrowLeftOutlined,
    RocketOutlined
} from '@ant-design/icons'
import { getProjectById } from 'src/api/project'
import { getModelById } from 'src/api/model'
import { getExperimentById } from 'src/api/experiment'
import { getLbProjects, getLbProjByTask, startExport, getExportStatus } from 'src/api/labelProject'
import * as dataServiceAPI from 'src/api/dataset'
import { formatDistanceToNow, format } from 'date-fns'
import axios from 'axios'
import Papa from 'papaparse'
import ImageHistoryViewer from 'src/components/RecentPredictView/ImageHistoryViewer'
import TextHistoryViewer from 'src/components/RecentPredictView/TextHistoryViewer'
import MultilabelHistoryViewer from 'src/components/RecentPredictView/MultilabelHistoryViewer'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'

const { Title } = Typography

export default function RecentPredictionsPage() {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const { id, modelId } = useParams()
    const [recentPredictions, setRecentPredictions] = useState([])
    const [projectInfo, setProjectInfo] = useState({})
    const [model, setModel] = useState(null)
    const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
    const [isRetraining, setIsRetraining] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedPredictions, setSelectedPredictions] = useState([])
    const [isDatasetModalVisible, setIsDatasetModalVisible] = useState(false)
    const [availableDatasets, setAvailableDatasets] = useState([])
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(false)
    const [selectedDatasetKeys, setSelectedDatasetKeys] = useState([])
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isJsonLoading, setIsJsonLoading] = useState(false)
    const [selectedPredictionContent, setSelectedPredictionContent] = useState(null)
    
    const simpleDataModalRef = useRef(null)
    const multilabelModalRef = useRef(null)

    const fetchModelData = async () => {
        try {
            const res = await getModelById(modelId)
            setModel(res.data)
        } catch (error) {
            console.error("Error fetching model data:", error)
        }
    }

    const fetchProjectData = async () => {
        try {
            const { data } = await getProjectById(id)
            setProjectInfo(data.project)
        } catch (error) {
            console.error("Error fetching project data:", error)
        }
    }

    useEffect(() => {
        fetchModelData()
        fetchProjectData()
    }, [])

    useEffect(() => {
        if (!model?.id) return

        const fetchRecentPredictions = async () => {
            setIsLoadingPredictions(true)
            try {
                const response = await dataServiceAPI.getAllDeployData(model.id)
                if (response.status === 200) {
                    setRecentPredictions(response.data.deploy_data)
                }
            } catch (error) {
                console.error("Can't fetch recent predictions:", error)
            } finally {
                setIsLoadingPredictions(false)
            }
        }

        fetchRecentPredictions()
    }, [model])

    const handleViewPrediction = async (prediction) => {
        setIsModalVisible(true)
        setIsJsonLoading(true)
        setSelectedPredictionContent(null)

        try {
            const s3_key = prediction.predict_data_url
            const downloadJsonContentPresignedUrl =
                await dataServiceAPI.createDownPresignedUrls(s3_key)

            if (!downloadJsonContentPresignedUrl) {
                throw new Error('Không nhận được Presigned URL.')
            }

            const predictUrl = downloadJsonContentPresignedUrl.data.url
            // console.logs("Predict URL:", predictUrl)
            
            const jsonResponse = await axios.get(predictUrl)
            const predictContent = jsonResponse.data

            try {
                const feedback_s3_key = prediction.predict_data_url.split("predict.")[0] + "feedback.json";
                const downloadFeedbackJsonContentPresignedUrl = await dataServiceAPI.createDownPresignedUrls(feedback_s3_key);

                const feedbackUrl = downloadFeedbackJsonContentPresignedUrl.data.url;
                const feedbackJsonResponse = await axios.get(feedbackUrl);
                const feedbackContent = feedbackJsonResponse.data;
                console.log("Feedback Content:", feedbackContent)
            } catch (error) {
                console.warn("Could not load feedback data, it might not exist yet.", error.message);
                const feedbackContent = []
            }

            if (projectInfo.task_type.includes('IMAGE')) {
                const imageUrlResponse =
                    await dataServiceAPI.getPresignedUrlsForImages(
                        prediction.data_url
                    )
                const imageUrl = imageUrlResponse.data.data
                const combinedImageData = predictContent.map((item, index) => ({
                    ...item,
                    imageUrl: imageUrl[index],
                }))
                setSelectedPredictionContent(combinedImageData)
            } else {
                const dataUrl = prediction.data_url + prediction.file_name
                const fileUrl =
                    await dataServiceAPI.createDownPresignedUrls(dataUrl)
                const fileDownloadUrl = fileUrl.data.url
                const fileContentResponse = await axios.get(fileDownloadUrl)
                const fileContent = fileContentResponse.data
                const parsedCsv = Papa.parse(fileContent, { header: true })

                const inputData = parsedCsv.data.filter((row) =>
                    Object.values(row).some(
                        (value) => value !== '' && value !== null
                    )
                )
                const combinedData = inputData.map((row, index) => ({
                    ...row,
                    ...(predictContent[index] || {}),
                }))
                setSelectedPredictionContent(combinedData)
            }
        } catch (error) {
            console.error('Error fetching prediction content:', error)
            message.error(
                'Failed to load prediction content. Please try again.'
            )
            setSelectedPredictionContent({
                error: 'Download failed.',
                details: error.message,
            })
        } finally {
            setIsJsonLoading(false)
        }
    }

    const handleCloseModal = () => {
        setIsModalVisible(false)
        setSelectedPredictionContent(null)
    }

    const handleDownloadHistory = () => {
        if (projectInfo.task_type.includes('MULTILABEL')) {
            multilabelModalRef.current?.downloadCsv()
        } else {
            simpleDataModalRef.current?.downloadCsv()
        }
    }

    const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
        setSelectedRowKeys(newSelectedRowKeys)
        setSelectedPredictions(newSelectedRows)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    const datasetRowSelection = {
        type: 'radio',
        selectedRowKeys: selectedDatasetKeys,
        onChange: (keys) => setSelectedDatasetKeys(keys),
    }

    const handleRetrain = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one prediction history to retrain.");
            return;
        }

        setIsDatasetModalVisible(true);
        setIsLoadingDatasets(true);
        setSelectedDatasetKeys([]); // Reset selection

        try {
            const lbProjectsRes = await getLbProjByTask(projectInfo.task_type)
            setAvailableDatasets(lbProjectsRes.data || [])
        } catch (error) {
            console.error("Failed to fetch datasets:", error);
            message.error("Failed to load available datasets.");
        } finally {
            setIsLoadingDatasets(false);
        }
    }

    const pollExportStatus = (taskId) => {
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const response = await getExportStatus(taskId)
                    // Kiểm tra cấu trúc response dựa trên UploadData.jsx
                    const { status, result, error } = response.data

                    console.log(`[pollExportStatus] Task ${taskId} → status: ${status}`)

                    if (status === 'SUCCESS') {
                        clearInterval(intervalId)
                        resolve(result)
                    } else if (status === 'FAILURE') {
                        clearInterval(intervalId)
                        reject(new Error(error || 'Export task failed.'))
                    }
                    // Nếu status là PENDING hoặc khác thì tiếp tục chờ
                } catch (err) {
                    clearInterval(intervalId)
                    console.error(`[pollExportStatus] Error checking task ${taskId}:`, err?.message || err)
                    reject(err)
                }
            }, 2000) // Kiểm tra mỗi 2 giây
        })
    }

    const confirmRetrain = async () => {
        if (selectedDatasetKeys.length === 0) {
            message.warning("Please select a base dataset.");
            return;
        }

        const selectedDatasetId = selectedDatasetKeys[0];
        const selectedProject = availableDatasets.find(p => p.id === selectedDatasetId);

        if (!selectedProject) {
            message.error("Selected project not found.");
            return;
        }

        setIsRetraining(true);
        message.loading({ content: 'Initiating retraining process...', key: 'retrain' });

        try {
            const payload = {
                project_id: id,
                task_type: projectInfo.task_type,
                model_id: modelId,
                original_dataset_id: selectedProject.dataset_id,
                predictions: selectedPredictions,
            }

            console.log("Recent prediction: ", selectedPredictions)

            const retrainingDataset = await dataServiceAPI.createRetrainingDataset(payload)
            console.log("Retraining dataset response:", retrainingDataset)
            const lsProject = retrainingDataset.data.ls_project
            const lsProjectId = retrainingDataset.data.ls_project.label_studio_id
            const newDatasetId = retrainingDataset.data.dataset.id

            // start export data
            if (!lsProjectId) {
                throw new Error("Could not retrieve Label Studio Project ID from response.");
            }

            message.loading({ content: 'Exporting dataset for training...', key: 'retrain' });
            const startResponse = await startExport(lsProjectId);
            const { task_id } = startResponse.data;

            if (!task_id) {
                throw new Error("Failed to start export task.");
            }

            console.log('Export started, task ID:', task_id);

            // 3. Polling kiểm tra trạng thái Export
            await pollExportStatus(task_id);
            message.success({ content: 'Dataset prepared successfully!', key: 'retrain', duration: 3 });
            setIsDatasetModalVisible(false);
            navigate(`/app/project/${id}/build/selectInstance`, { 
                state: { 
                    isRetraining: true,
                    previousModelId: modelId,
                    metadata: lsProject.meta_data,
                    datasetId: newDatasetId,
                    retrainDatasetId: newDatasetId
                } 
            });

            message.success({ content: 'Dataset prepared successfully!', key: 'retrain', duration: 3 });
            setIsDatasetModalVisible(false);

            message.success({ content: 'Retraining dataset created successfully!', key: 'retrain', duration: 3 });
            setIsDatasetModalVisible(false);
        } catch (error) {
            console.error("Retraining failed:", error);
            message.error({ content: error.response?.data?.error || error.message || 'Failed to start retraining.', key: 'retrain', duration: 5 });
        } finally {
            setIsRetraining(false);
        }
    }

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'file_name',
            key: 'file_name',
            render: (text) => <span style={{ color: 'var(--text)', fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Predicted At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => {
                const dateObject = new Date(date);
                const timeAgo = formatDistanceToNow(dateObject, { addSuffix: true });
                const exactTime = format(dateObject, 'HH:mm:ss, dd/MM/yyyy');
                return (
                    <Tooltip title={`Exact time: ${exactTime}`}>
                        <span style={{ color: 'var(--secondary-text)', cursor: 'help' }}>
                            {timeAgo}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => handleViewPrediction(record)}
                >
                    View
                </Button>
            ),
        },
    ];

    const datasetColumns = [
        {
            title: 'Project Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ color: 'var(--text)', fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? format(new Date(date), 'HH:mm:ss, dd/MM/yyyy') : '-',
        },
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
        }
    ];

    return (
        <>
             <style>
                {`
                body, html {
                    background-color: var(--surface) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .ant-table {
                    background: transparent !important;
                    color: var(--text) !important;
                }
                .ant-table-thead > tr > th {
                    background: var(--hover-bg) !important;
                    color: var(--text) !important;
                    border-bottom: 1px solid var(--border) !important;
                }
                .ant-table-tbody > tr > td {
                    border-bottom: 1px solid var(--border) !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background: var(--hover-bg) !important;
                }
            `}
            </style>
            <div className="p-6 bg-gray-50 min-h-screen" style={{ background: 'var(--surface)' }}>
                 {theme === 'dark' && (
                    <BackgroundShapes />
                )}
                <Space direction="vertical" size="large" className="w-full relative z-10">
                    <div className="flex items-center gap-4">
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate(-1)}
                            className="bg-white/10 border-white/20 text-[var(--text)]"
                        >
                            Back
                        </Button>
                        <Title level={3} style={{ margin: 0, color: 'var(--text)' }}>
                            Retrain Model - Recent Predictions
                        </Title>
                    </div>

                    <Card
                        className="border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl"
                        style={{
                            background: theme === 'dark'
                                ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)'
                                : 'rgb(249 250 251 / var(--tw-bg-opacity, 1)',
                            borderRadius: '12px',
                        }}
                    >
                        <div className="flex justify-end mb-4">
                            <Button
                                type="primary"
                                icon={<RocketOutlined />}
                                onClick={handleRetrain}
                                disabled={selectedRowKeys.length === 0 || isRetraining}
                                loading={isRetraining}
                            >
                                Retrain with Selected ({selectedRowKeys.length})
                            </Button>
                        </div>
                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={recentPredictions}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                            }}
                            loading={isLoadingPredictions}
                        />
                    </Card>
                </Space>

                {projectInfo?.id && (
                    <Modal
                        title="Prediction Details"
                        open={isModalVisible}
                        onCancel={handleCloseModal}
                        width="90%"
                        style={{ top: 20 }}
                        footer={[
                            !projectInfo.task_type.includes('IMAGE') && (
                                <Button
                                    key="settings"
                                    icon={<SettingOutlined />}
                                    onClick={() =>
                                        simpleDataModalRef.current?.openDrawer()
                                    }
                                >
                                    Columns Settings
                                </Button>
                            ),
                            !projectInfo.task_type.includes('IMAGE') && (
                                <Button
                                    key="download"
                                    icon={<DownloadOutlined />}
                                    onClick={handleDownloadHistory}
                                    disabled={!selectedPredictionContent}
                                >
                                    Download as CSV
                                </Button>
                            ),
                            <Button
                                key="close"
                                type="primary"
                                onClick={handleCloseModal}
                            >
                                Close
                            </Button>,
                        ]}
                    >
                        {isJsonLoading ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            (() => {
                                if (projectInfo.task_type.includes('IMAGE')) {
                                    return (
                                        <ImageHistoryViewer
                                            data={selectedPredictionContent}
                                        />
                                    )
                                }
                                if (projectInfo.task_type.includes('MULTILABEL')) {
                                    return (
                                        <MultilabelHistoryViewer
                                            data={selectedPredictionContent}
                                            ref={multilabelModalRef}
                                        />
                                    )
                                }
                                return (
                                    <TextHistoryViewer
                                        data={selectedPredictionContent}
                                        ref={simpleDataModalRef}
                                    />
                                )
                            })()
                        )}
                    </Modal>
                )}

                <Modal
                    title="Select Base Dataset for Retraining"
                    open={isDatasetModalVisible}
                    onCancel={() => setIsDatasetModalVisible(false)}
                    onOk={confirmRetrain}
                    confirmLoading={isRetraining}
                    width={800}
                >
                    <Table
                        rowSelection={datasetRowSelection}
                        columns={datasetColumns}
                        dataSource={availableDatasets}
                        rowKey="id"
                        loading={isLoadingDatasets}
                        pagination={{ pageSize: 5 }}
                    />
                </Modal>
            </div>
        </>
    )
}
