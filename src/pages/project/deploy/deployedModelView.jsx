import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import dayjs from 'dayjs'
import {
    Card,
    Row,
    Col,
    Space,
    Statistic,
    Button,
    message,
    Divider,
    Input,
    List,
    Alert,
    Tooltip,
    Modal,
    Spin,
} from 'antd'
import {
    DeleteOutlined,
    StopOutlined,
    ThunderboltOutlined,
    ClockCircleOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    HourglassOutlined,
    LinkOutlined,
    SettingOutlined,
    ExportOutlined,
    DownloadOutlined,
    CloudUploadOutlined,
    StarOutlined,
} from '@ant-design/icons'
import { getDeployData } from 'src/api/deploy'
import { getProjectById } from 'src/api/project'
import { getModelById } from 'src/api/model'
import { getExperimentById } from 'src/api/experiment'
import config from '../build/config'
import * as modelAPI from 'src/api/model'
import * as dataServiceAPI from 'src/api/dataset'
import * as visualizeAPI from 'src/api/visualize'
import { validateFilesForPrediction } from 'src/utils/file'
import UpDataDeploy from 'src/components/UpDataDeploy'
import { formatDistanceToNow, format } from 'date-fns'
import { file } from 'jszip'
import axios from 'axios'
import Papa from 'papaparse'
import ImageHistoryViewer from 'src/components/RecentPredictView/ImageHistoryViewer'
import TextHistoryViewer from 'src/components/RecentPredictView/TextHistoryViewer'
import MultilabelHistoryViewer from 'src/components/RecentPredictView/MultilabelHistoryViewer'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { PATHS } from 'src/constants/paths'

export default function DeployedModelView() {
    const { theme } = useTheme()
    const [recentPredictions, setRecentPredictions] = useState([])
    const [projectInfo, setProjectInfo] = useState({})
    const { deployId, id } = useParams()
    const [uploading, setUploading] = useState(false)
    const [deployData, setDeployData] = useState()
    const [model, setModel] = useState(null)
    const [predictResult, setPredictResult] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState(null)
    const [experimentName, setExperimentName] = useState(null)
    const [isShowUpload, setIsShowUpload] = useState(false)
    const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isJsonLoading, setIsJsonLoading] = useState(false)
    const [selectedPredictionContent, setSelectedPredictionContent] =
        useState(null)
    const simpleDataModalRef = useRef(null)
    const multilabelModalRef = useRef(null)
    const fileInputRef = useRef(null)
    const [isGeneratingUI, setIsGeneratingUI] = useState(false)
    const [isCheckingUIStatus, setIsCheckingUIStatus] = useState(true)
    const [isUIGenerated, setIsUIGenerated] = useState(false)
    const [s3Url, setS3Url] = useState(null)

    const livePredictGradient =
        theme === 'dark'
            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)'
            : // : 'linear-gradient(150deg, #fff8e1 0%, #bbdefb 40%, #ffcdd2 100%)'
            'rgb(249 250 251 / var(--tw-bg-opacity, 1)'

    const hideUpload = () => {
        setIsShowUpload(false)
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

    const handleViewPrediction = async (prediction) => {
        setIsModalVisible(true)
        setIsJsonLoading(true)
        setSelectedPredictionContent(null)

        try {
            const s3_key = prediction.predict_data_url
            const downloadJsonContentPresignedUrl =
                await dataServiceAPI.createDownPresignedUrls(s3_key)
            //console.log("Presigned URL response:", downloadJsonContentPresignedUrl);
            const predictUrl = downloadJsonContentPresignedUrl.data.url
            //console.log("Predict URL:", predictUrl);
            if (!downloadJsonContentPresignedUrl) {
                throw new Error('Không nhận được Presigned URL.')
            }
            const jsonResponse = await axios.get(predictUrl)
            console.log('Prediction content:', jsonResponse.data)
            const predictContent = jsonResponse.data

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
                console.log('Combined image data:', combinedImageData)
                setSelectedPredictionContent(combinedImageData)
            } else {
                const dataUrl = prediction.data_url + prediction.file_name
                console.log('Data URL:', dataUrl)
                const fileUrl =
                    await dataServiceAPI.createDownPresignedUrls(dataUrl)
                const fileDownloadUrl = fileUrl.data.url
                const fileContentResponse = await axios.get(fileDownloadUrl)
                const fileContent = fileContentResponse.data
                const parsedCsv = Papa.parse(fileContent, { header: true })

                const inputData = parsedCsv.data.filter((row) =>
                    // Điều kiện: Giữ lại dòng nếu có ít nhất một giá trị không phải là chuỗi rỗng
                    Object.values(row).some(
                        (value) => value !== '' && value !== null
                    )
                )
                const combinedData = inputData.map((row, index) => ({
                    ...row,
                    ...(predictContent[index] || {}),
                }))
                console.log('File content:', combinedData)
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

    const object = config[projectInfo.task_type]

    const fetchDeployData = async () => {
        console.log(projectInfo)
        const { data } = await getDeployData(deployId)
        setDeployData(data)
        const res = await getModelById(data.model_id)
        setModel(res.data)
        const experimentId = res.data?.experiment_id
        const res2 = await getExperimentById(experimentId)
        setExperimentName(res2.data?.name)
    }

    const fetchProjectData = async () => {
        const { data } = await getProjectById(id)
        setProjectInfo(data.project)
    }

    useEffect(() => {
        if (!projectInfo?.id) return

        const fetchRecentPredictions = async () => {
            setIsLoadingPredictions(true)
            try {
                const response = await dataServiceAPI.getAllDeployData(model.id)

                if (response.status === 200) {
                    setRecentPredictions(response.data.deploy_data)
                    console.log('Recent predictions:', response.data)
                }
            } catch (error) {
                console.error("Can't fetch recent predictions:", error)
            } finally {
                setIsLoadingPredictions(false)
            }
        }

        fetchRecentPredictions()
    }, [model, predictResult])

    useEffect(() => {
        fetchDeployData()
        fetchProjectData()
    }, [])

    // Live predict file upload handler
    const handleUploadFiles = async (files, s3_url) => {
        setS3Url(s3_url)
        console.log('Files: ', files)
        const fileName = files[0]?.name || 'unknown'
        console.log('File name:', fileName)
        const validFiles = validateFilesForPrediction(
            files,
            projectInfo?.task_type
        )

        console.log('uploadedFiles', validFiles)
        setUploadedFiles((prevFiles) =>
            prevFiles ? [...prevFiles, ...validFiles] : validFiles
        )
        console.log('Valid files:', uploadedFiles)
        setUploading(true)

        const formData = new FormData()

        Array.from(validFiles).forEach((file) => {
            if (projectInfo?.task_type === 'IMAGE_CLASSIFICATION') {
                formData.append('images', file)
            }
            else if (projectInfo?.task_type === "AUDIO_CLASSIFICATION") {
                formData.append('audios', file)
            }
            else {
                formData.append('file', file)
            }
        })
        console.log('Fetch prediction start')
        formData.append('s3_url', s3_url)
        formData.append('api_base_url', deployData?.api_base_url)
        formData.append('file_name', fileName)
        console.log("FormData: ", deployData?.api_base_url)
        console.log("S3 URL: ", s3_url)
        try {
            // Make predictions
            const predictRequest = await modelAPI.modelPredict(
                formData,
                model.id
            )
            const data = predictRequest.data
            console.log('Fetch prediction successful', data)
            if (data.status === 'failed') {
                message.error(
                    'Your Files are not valid. Please select files has the same structure with your training data',
                    5
                )
                setUploading(false)
                return
            }
            const { predictions } = data

            console.log('prediction:', predictions)

            setPredictResult((prevPredictions) =>
                prevPredictions
                    ? [...prevPredictions, ...predictions]
                    : predictions
            )
            console.log(predictions)
            setUploading(false)
            message.success('Success Predict', 3)
        } catch (error) {
            message.error('Predict Fail', 3)
            setUploading(false)
        }
    }

    const handleClick = () => {
        setIsShowUpload(true)
    }

    const handleGenUI = async () => {
        if (isUIGenerated) {
            const url = PATHS.PROJECT_DEMO(projectInfo.id)
            window.open(url, '_blank', 'noopener,noreferrer')
            return
        }

        setIsGeneratingUI(true)

        const generatingData = {
            isGenerating: true,
            startedAt: Date.now(),
        }
        localStorage.setItem(
            `ui_generating_${projectInfo.id}`,
            JSON.stringify(generatingData)
        )

        try {
            const projectName = projectInfo.name
            const projectDescription = projectInfo.description
            const taskType = projectInfo.task_type
            const taskDescription =
                projectInfo.description || `A model for ${taskType}`
            const labelsName = model.metadata.label_column
            const labelValues = model.metadata.labels
            const apiEndpoint = deployData?.api_base_url
            let sampleData = model.metadata.sample_data

            if (taskType === 'Image Classification') {
                sampleData = []
            }

            console.log('Calling genUI API with:', {
                taskType,
                taskDescription,
                labelsName,
                labelValues,
                apiEndpoint,
                sampleData,
            })

            const metadata = {
                projectName: projectName,
                projectDescription: projectDescription,
                taskType: taskType,
                description: '',
                apiUrl: deployData?.api_base_url,
                samples: [],
                modelInfo: model,
            }

            await visualizeAPI.saveMetadata(projectInfo.id, metadata)

            const uiGeneratedData = {
                isGenerated: true,
                timestamp: Date.now(),
                expiresAt: Date.now() + 60 * 60 * 1000,
            }
            localStorage.setItem(
                `ui_generated_${projectInfo.id}`,
                JSON.stringify(uiGeneratedData)
            )
            // Clear the generating state
            localStorage.removeItem(`ui_generating_${projectInfo.id}`)

            // Mark UI as generated in state
            setIsUIGenerated(true)

            const url = PATHS.PROJECT_DEMO(projectInfo.id)
            console.log('Opening generated UI at:', url)
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (error) {
            console.error('Error generating UI:', error)
            message.error({
                content:
                    error.response?.data?.detail ||
                    'Failed to generate UI. Please try again.',
                key: 'genui',
                duration: 3,
            })
            // Clear generating state on error
            localStorage.removeItem(`ui_generating_${projectInfo.id}`)
        } finally {
            setIsGeneratingUI(false)
        }
    }

    useEffect(() => {
        if (!projectInfo?.id) return

        const checkUIGenerationStatus = () => {
            setIsCheckingUIStatus(true)

            try {
                // Step 1: Check if UI is currently being generated
                const generatingKey = `ui_generating_${projectInfo.id}`
                const generatingData = localStorage.getItem(generatingKey)

                if (generatingData) {
                    try {
                        const genData = JSON.parse(generatingData)
                        const elapsedMinutes = Math.floor(
                            (Date.now() - genData.startedAt) / (60 * 1000)
                        )

                        // Set generating state - deployment polling will handle completion
                        setIsGeneratingUI(true)
                        setIsUIGenerated(false)
                        setIsCheckingUIStatus(false)
                        return
                    } catch (e) {
                        // Corrupted data, remove it
                        localStorage.removeItem(generatingKey)
                    }
                }

                // Step 2: Check if UI is already generated (completed)
                const generatedKey = `ui_generated_${projectInfo.id}`
                const generatedData = localStorage.getItem(generatedKey)

                if (!generatedData) {
                    // Not found in localStorage -> UI not generated
                    setIsUIGenerated(false)
                    setIsGeneratingUI(false)
                    setIsCheckingUIStatus(false)
                    return
                }

                // Parse the stored data
                const uiData = JSON.parse(generatedData)
                const currentTime = Date.now()

                // Check if the data has expired (more than 1 hour)
                if (currentTime > uiData.expiresAt) {
                    // Expired -> remove from localStorage and set as not generated
                    localStorage.removeItem(generatedKey)
                    setIsUIGenerated(false)
                    setIsGeneratingUI(false)
                } else {
                    // Still valid -> UI is generated
                    const remainingMinutes = Math.floor(
                        (uiData.expiresAt - currentTime) / (60 * 1000)
                    )
                    setIsUIGenerated(true)
                    setIsGeneratingUI(false)
                }
            } catch (error) {
                // Error parsing or data is corrupted -> treat as not generated
                localStorage.removeItem(`ui_generated_${projectInfo.id}`)
                localStorage.removeItem(`ui_generating_${projectInfo.id}`)
                setIsUIGenerated(false)
                setIsGeneratingUI(false)
            } finally {
                setIsCheckingUIStatus(false)
            }
        }

        checkUIGenerationStatus()
    }, [projectInfo?.id])

    return (
        <>
            <style>
                {`
                body, html {
                    background-color: var(--surface) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}
            </style>
            <div
                className="p-6 bg-gray-50 min-h-screen"
                style={{ background: 'var(--surface)' }}
            >
                {theme === 'dark' && (
                    <BackgroundShapes
                        width="1280px"
                        height="1200px"
                        shapes={[
                            {
                                id: 'resultBlue',
                                shape: 'circle',
                                size: '580px',
                                gradient: {
                                    type: 'radial',
                                    shape: 'ellipse',
                                    colors: [
                                        '#5C8DFF 0%',
                                        '#5C8DFF 38%',
                                        'transparent 78%',
                                    ],
                                },
                                opacity: 0.32,
                                blur: '230px',
                                position: { top: '160px', right: '-170px' },
                                transform: 'none',
                            },
                            {
                                id: 'resultCyan',
                                shape: 'rounded',
                                size: '500px',
                                gradient: {
                                    type: 'radial',
                                    shape: 'circle',
                                    colors: [
                                        '#40FFFF 0%',
                                        '#40FFFF 48%',
                                        'transparent 82%',
                                    ],
                                },
                                opacity: 0.28,
                                blur: '200px',
                                position: { top: '380px', left: '-180px' },
                                transform: 'none',
                            },
                            {
                                id: 'resultWarm',
                                shape: 'rounded',
                                size: '460px',
                                gradient: {
                                    type: 'radial',
                                    shape: 'circle',
                                    colors: [
                                        '#FFAF40 0%',
                                        '#FFAF40 58%',
                                        'transparent 88%',
                                    ],
                                },
                                opacity: 0.22,
                                blur: '180px',
                                position: { bottom: '120px', right: '22%' },
                                transform: 'none',
                            },
                        ]}
                    />
                )}
                <Space direction="vertical" size="large" className="w-full">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12}>
                            <Card
                                className="shadow-md"
                                style={{
                                    background: 'var(--card-gradient)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                <Statistic
                                    title={
                                        <span
                                            style={{
                                                color: 'var(--secondary-text)',
                                                fontFamily:
                                                    'Poppins, sans-serif',
                                            }}
                                        >
                                            Uptime
                                        </span>
                                    }
                                    value={`${Math.floor(dayjs().diff(dayjs(deployData?.created_at), 'minute') / 60)} hour(s) ${dayjs().diff(dayjs(deployData?.created_at), 'minute') % 60} minute(s)`}
                                    valueStyle={{
                                        color: '#f0b100',
                                    }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                            <Card
                                className="shadow-md"
                                style={{
                                    background: 'var(--card-gradient)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                <Statistic
                                    title={
                                        <span
                                            style={{
                                                color: 'var(--secondary-text)',
                                                fontFamily:
                                                    'Poppins, sans-serif',
                                            }}
                                        >
                                            Total Predictions
                                        </span>
                                    }
                                    value={recentPredictions.length || 0}
                                    prefix={<HourglassOutlined />}
                                    valueStyle={{
                                        color: '#2b7fff',
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {deployData?.status === 'ONLINE' && projectInfo && (
                        <Row
                            gutter={[24, 24]}
                            style={{
                                marginTop: '24px',
                            }}
                        >
                            <Col span={24}>
                                <Card
                                    title={
                                        <Space>
                                            <LinkOutlined
                                                style={{
                                                    color: '#1890ff',
                                                }}
                                            />
                                            <span
                                                style={{
                                                    color: 'var(--secondary-text)',
                                                    fontFamily:
                                                        'Poppins, sans-serif',
                                                }}
                                            >
                                                Endpoint Information
                                            </span>
                                        </Space>
                                    }
                                    style={{
                                        background: 'var(--card-gradient)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    <Row gutter={[24, 24]}>
                                        <Col span={24}>
                                            <Divider
                                                orientation="left"
                                                orientationMargin={0}
                                                style={{
                                                    color: 'var(--secondary-text)',
                                                    fontFamily:
                                                        'Poppins, sans-serif',
                                                }}
                                            >
                                                API Endpoint URL
                                            </Divider>
                                            <div className="flex">
                                                <Input.Group compact>
                                                    <Input
                                                        style={{
                                                            width: '30%',
                                                        }}
                                                        value={
                                                            deployData?.api_base_url ||
                                                            'https://api.example.com/predict/model-123'
                                                        }
                                                        readOnly
                                                    />
                                                    <Button
                                                        type="primary"
                                                        onClick={() => {
                                                            const textToCopy =
                                                                deployData?.api_base_url ||
                                                                'https://api.example.com/predict/model-123'
                                                            try {
                                                                const textarea =
                                                                    document.createElement(
                                                                        'textarea'
                                                                    )
                                                                textarea.value =
                                                                    textToCopy
                                                                document.body.appendChild(
                                                                    textarea
                                                                )
                                                                textarea.select()
                                                                document.execCommand(
                                                                    'copy'
                                                                )
                                                                document.body.removeChild(
                                                                    textarea
                                                                )
                                                                message.success(
                                                                    'Copied to clipboard',
                                                                    1
                                                                )
                                                            } catch (err) {
                                                                message.error(
                                                                    'Failed to copy',
                                                                    1
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        Copy URL
                                                    </Button>
                                                </Input.Group>

                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        onClick={handleClick}
                                                        loading={uploading}
                                                        icon={
                                                            <CloudUploadOutlined />
                                                        }
                                                        size="large"
                                                    >
                                                        {uploading
                                                            ? 'Predicting...'
                                                            : 'Upload Files to Predict'}
                                                    </Button>
                                                    <UpDataDeploy
                                                        isOpen={isShowUpload}
                                                        onClose={hideUpload}
                                                        projectId={model?.id}
                                                        taskType={
                                                            projectInfo?.task_type
                                                        }
                                                        featureColumns={Object.keys(
                                                            model?.metadata.csv
                                                                ? model
                                                                    ?.metadata
                                                                    .csv
                                                                : new Object()
                                                        )}
                                                        onUploadStart={null}
                                                        onUploadComplete={
                                                            handleUploadFiles
                                                        }
                                                    />
                                                </Space>

                                                <Space className="ml-2">
                                                    <Button
                                                        type="primary"
                                                        onClick={
                                                            isGeneratingUI ||
                                                                isCheckingUIStatus
                                                                ? undefined
                                                                : handleGenUI
                                                        }
                                                        disabled={
                                                            isGeneratingUI ||
                                                            isCheckingUIStatus
                                                        }
                                                        loading={isGeneratingUI}
                                                        size="large"
                                                        icon={
                                                            isUIGenerated ? (
                                                                <ExportOutlined />
                                                            ) : (
                                                                <StarOutlined />
                                                            )
                                                        }
                                                    >
                                                        {isCheckingUIStatus ? (
                                                            <span>
                                                                Checking
                                                            </span>
                                                        ) : isGeneratingUI ? (
                                                            <span>
                                                                Generating
                                                            </span>
                                                        ) : isUIGenerated ? (
                                                            <span>
                                                                Your App is
                                                                Ready
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                Generate UI
                                                            </span>
                                                        )}
                                                    </Button>
                                                </Space>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                                <>
                                    {(() => {
                                        if (object) {
                                            const LiveInferComponent =
                                                object.liveInferView
                                            return (
                                                <LiveInferComponent
                                                    projectInfo={projectInfo}
                                                    handleUploadFiles={
                                                        handleUploadFiles
                                                    }
                                                />
                                            )
                                        }
                                        return null
                                    })()}
                                </>
                            </Col>
                        </Row>
                    )}

                    {deployData?.status === 'ONLINE' &&
                        !uploading &&
                        predictResult &&
                        projectInfo && (
                            <>
                                {(() => {
                                    if (object) {
                                        const PredictComponent =
                                            object.predictView
                                        return (
                                            <PredictComponent
                                                predictResult={predictResult}
                                                uploadedFiles={uploadedFiles}
                                                projectInfo={projectInfo}
                                                handleUploadFiles={
                                                    handleUploadFiles
                                                }
                                                model={model}
                                                s3_url={s3Url || deployData?.s3_url}
                                            />
                                        )
                                    }
                                    return null
                                })()}
                            </>
                        )}

                    {/* Recent Predictions */}
                    <div className="mt-8">
                        <Card
                            title={
                                <Space>
                                    <ClockCircleOutlined />
                                    <span style={{ color: 'var(--text)' }}>
                                        Recent Predictions
                                    </span>
                                </Space>
                            }
                            className="border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl"
                            style={{
                                background: livePredictGradient,
                                borderRadius: '12px',
                            }}
                        >
                            {!isLoadingPredictions && (
                                <List
                                    dataSource={recentPredictions}
                                    renderItem={(prediction) => {
                                        const filename = prediction.file_name

                                        const dateObject = new Date(
                                            prediction.created_at
                                        )

                                        const timeAgo = formatDistanceToNow(
                                            dateObject,
                                            {
                                                addSuffix: true,
                                            }
                                        )

                                        const exactTime = format(
                                            dateObject,
                                            'HH:mm:ss, dd/MM/yyyy'
                                        )

                                        return (
                                            <List.Item
                                                style={{
                                                    borderBottom:
                                                        '1px solid var(--border)',
                                                }}
                                                actions={[
                                                    <Button
                                                        type="primary"
                                                        onClick={() =>
                                                            handleViewPrediction(
                                                                prediction
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </Button>,
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <CheckCircleOutlined
                                                            style={{
                                                                color: '#52c41a',
                                                            }}
                                                        />
                                                    }
                                                    title={
                                                        <span
                                                            style={{
                                                                color: 'var(--text)',
                                                            }}
                                                        >
                                                            {`File: ${filename}`}
                                                        </span>
                                                    }
                                                    description={
                                                        <Tooltip
                                                            title={`Exact time: ${exactTime}`}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: 'var(--secondary-text)',
                                                                    cursor: 'help',
                                                                }}
                                                            >
                                                                {`Predicted ${timeAgo}`}
                                                            </span>
                                                        </Tooltip>
                                                    }
                                                />
                                            </List.Item>
                                        )
                                    }}
                                />
                            )}
                        </Card>
                    </div>

                    {projectInfo?.id && (
                        <Modal
                            title="Recent Prediction Details"
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
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '50px',
                                    }}
                                >
                                    {' '}
                                    <Spin size="large" />{' '}
                                </div>
                            ) : (
                                (() => {
                                    if (
                                        projectInfo.task_type.includes('IMAGE')
                                    ) {
                                        return (
                                            <ImageHistoryViewer
                                                data={selectedPredictionContent}
                                            />
                                        )
                                    }
                                    if (
                                        projectInfo.task_type.includes(
                                            'MULTILABEL'
                                        )
                                    ) {
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

                    <Card
                        title={
                            <span
                                style={{
                                    color: 'var(--secondary-text)',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                🚀 Cloud Server
                            </span>
                        }
                        className="rounded-xl shadow-sm"
                        style={{
                            background: 'var(--card-gradient)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Alert
                                    message={
                                        deployData?.status === 'ONLINE' ? (
                                            <span
                                                style={{
                                                    color: 'var(--secondary-text)',
                                                    fontFamily:
                                                        'Poppins, sans-serif',
                                                }}
                                            >
                                                Shut down server instance
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: 'var(--secondary-text)',
                                                    fontFamily:
                                                        'Poppins, sans-serif',
                                                }}
                                            >
                                                Start server instance
                                            </span>
                                        )
                                    }
                                    description={
                                        deployData?.status === 'ONLINE' ? (
                                            <span
                                                style={{
                                                    color: 'var(--secondary-text)',
                                                    fontFamily:
                                                        'Poppins, sans-serif',
                                                }}
                                            >
                                                Gracefully stops the running
                                                server instance, making it
                                                temporarily unavailable without
                                                deleting it.
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: 'var(--secondary-text)',
                                                    fontFamily:
                                                        'Poppins, sans-serif',
                                                }}
                                            >
                                                Powers on a previously shut down
                                                server, making it active and
                                                ready to handle operations.
                                            </span>
                                        )
                                    }
                                    type={
                                        deployData?.status === 'ONLINE'
                                            ? 'warning'
                                            : 'info'
                                    }
                                    showIcon
                                    style={{
                                        height: 130,
                                        background: livePredictGradient,
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                />
                                <Button
                                    type="default"
                                    icon={
                                        deployData?.status === 'ONLINE' ? (
                                            <StopOutlined />
                                        ) : (
                                            <CheckCircleOutlined />
                                        )
                                    }
                                    size="large"
                                    style={{
                                        width: '100%',
                                        fontWeight: 'bold',
                                        marginTop: 15,
                                        backgroundColor:
                                            deployData?.status === 'ONLINE'
                                                ? '#faad14'
                                                : '#2b7fff',
                                        color: 'white',
                                        borderColor:
                                            deployData?.status === 'ONLINE'
                                                ? '#faad14'
                                                : '#2b7fff',
                                    }}
                                >
                                    {deployData?.status === 'ONLINE'
                                        ? 'Shut down'
                                        : 'Start'}
                                </Button>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Alert
                                    message={
                                        <span
                                            style={{
                                                color: 'var(--secondary-text)',
                                                fontFamily:
                                                    'Poppins, sans-serif',
                                            }}
                                        >
                                            Delete server instance
                                        </span>
                                    }
                                    description={
                                        <span
                                            style={{
                                                color: 'var(--secondary-text)',
                                                fontFamily:
                                                    'Poppins, sans-serif',
                                            }}
                                        >
                                            Permanently removes the server and
                                            all associated data from the system.
                                            This action is irreversible.
                                        </span>
                                    }
                                    type="error"
                                    showIcon
                                    style={{
                                        height: 130,
                                        background: livePredictGradient,
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                />
                                <Button
                                    type="default"
                                    icon={<DeleteOutlined />}
                                    size="large"
                                    style={{
                                        width: '100%',
                                        fontWeight: 'bold',
                                        marginTop: 15,
                                        backgroundColor: '#d94343ff',
                                        color: 'white',
                                        borderColor: '#d94343ff',
                                    }}
                                >
                                    Delete Server
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Space>
            </div>
        </>
    )
}
