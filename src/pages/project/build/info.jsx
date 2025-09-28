import { useEffect, useState } from 'react'

import { useOutletContext } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import { getAllExperiments } from 'src/api/experiment'
import * as experimentAPI from 'src/api/experiment'
import * as mlServiceAPI from 'src/api/mlService'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { getExperimentConfig } from 'src/api/experiment_config'
import { Button, Card, Statistic, Tag, message, Skeleton, Empty } from 'antd'
import { TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import UpDataDeploy from './upDataDeploy'
import instance from 'src/api/axios'
import * as modelServiceAPI from 'src/api/model'
import * as datasetAPI from 'src/api/dataset'
import * as visualizeAPI from 'src/api/visualize'
import * as projectAPI from 'src/api/project'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
} from 'recharts'
const getAccuracyStatus = (score) => {
    if (score >= 0.9) {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Excellent
            </Tag>
        )
    } else if (score >= 0.7) {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Good
            </Tag>
        )
    } else if (score >= 0.6) {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Medium
            </Tag>
        )
    } else {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Bad
            </Tag>
        )
    }
}

const ProjectInfo = () => {
    const { theme } = useTheme()
    const { projectInfo } = useOutletContext()
    const [experiment, setExperiment] = useState(null)
    const [experimentId, setExperimentId] = useState(null)
    const [metrics, setMetrics] = useState([])
    const [isShowUpload, setIsShowUpload] = useState(false)
    const [isModelOnline, setIsModelOnline] = useState(true)
    const [isCheckingModelStatus, setIsCheckingModelStatus] = useState(false)
    const [datasetInfo, setDatasetInfo] = useState(null)
    const [isDeploySettingUp, setIsDeploySettingUp] = useState(false)
    const [modelStatus, setModelStatus] = useState(null)
    const [modelId, setModelId] = useState(null)
    const [isPredictDone, setIsPredictDone] = useState(false)
    const [isPreparing, setIsPreparing] = useState(false)
    const [chartData, setChartData] = useState([])
    const [valMetric, setValMetric] = useState('Accuracy')
    const [isChartLoading, setIsChartLoading] = useState(false)
    const [isGeneratingUI, setIsGeneratingUI] = useState(false)
    const [streamlitUrl, setStreamlitUrl] = useState(null)
    const [validDuration, setValidDuration] = useState(null)

    const hideUpload = () => {
        setIsShowUpload(false)
    }

    const handleModelButtonClick = async () => {
        if (streamlitUrl) {
            // If we have a streamlit URL, open it
            window.open(streamlitUrl, '_blank', 'noopener,noreferrer')
        } else {
            // If no streamlit URL, show upload dialog
            setIsShowUpload(true)
        }
    }

    // Gọi sau khi upload xong để vừa check vừa trigger deploy
    const handleAfterUpload = async (selectedDuration) => {
        try {
            let ensuredModelId = modelId
            if (!ensuredModelId) {
                const modelRes =
                    await modelServiceAPI.getModelByExperimentId(experimentId)
                ensuredModelId =
                    modelRes?.status === 200 ? modelRes?.data?.id : null
                setModelId(ensuredModelId)
            }
            if (!ensuredModelId) return
            const ensureResp = await instance.post(
                `/api/ml/model/${ensuredModelId}/ensure-deployed`
            )
            const status = ensureResp?.data?.status
            const apiUrl = ensureResp?.data?.api_base_url
            const deployId = ensureResp?.data?.deploy_id
            console.log('ensureResp:', ensureResp.data)
            console.log('projectINfo', projectInfo)
            setModelStatus(status || null)
            const online = status === 'ONLINE' && !!apiUrl
            setIsModelOnline(online)
            if (online) {
                setIsDeploySettingUp(false)
                setIsPredictDone(true)
                setIsPreparing(false)

                // Call visualize API after deployment is ONLINE
                try {
                    setIsGeneratingUI(true)
                    console.log('Calling visualize API with endpoint:', apiUrl)
                    console.log('Project info:', projectInfo)
                    const visualizeResponse = await visualizeAPI.genUI(
                        projectInfo?.task_type,
                        projectInfo?.description || 'No description provided',
                        apiUrl + '/predict',
                        projectInfo?.id
                    )
                    console.log('Visualize API response:', visualizeResponse.data)
                    if (visualizeResponse.status === 200 && visualizeResponse.data.success) {
                        const { url } = visualizeResponse.data
                        if (url && url.startsWith('http')) {
                            // Update project with deploy_url and valid_duration
                            try {
                                // await projectAPI.updateProject(projectInfo?.id, {
                                //     deploy_url: url,
                                //     valid_duration: selectedDuration || '6hours'
                                // })
                                console.log('Project updated with deploy URL and duration:', url, selectedDuration)
                                // setStreamlitUrl(url)
                                // setValidDuration(selectedDuration || '6hours')
                            } catch (updateError) {
                                console.error('Error updating project with deploy URL:', updateError)
                            }

                            message.info({
                                content: (
                                    <div>
                                        Streamlit app is ready!
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                marginLeft: '8px',
                                                textDecoration: 'underline',
                                                color: '#1890ff'
                                            }}
                                            onClick={() => message.destroy()}
                                        >
                                            Click here to open
                                        </a>
                                    </div>
                                ),
                                duration: 10,
                            })
                        }
                    }
                } catch (visualizeError) {
                    console.error('Error calling visualize API:', visualizeError)
                } finally {
                    setIsGeneratingUI(false)
                }
            } else {
                setIsDeploySettingUp(true)
                setIsPreparing(true)
            }
        } catch (err) {
            console.error(err)
            message.error(err?.response?.data?.error || err.message)
            setIsPreparing(false)
        }
    }

    // Chạy ngầm ensure-deployed ngay khi bắt đầu upload, không chặn UI
    const handleUploadStartBackground = async () => {
        try {
            // Bắt đầu trạng thái chuẩn bị khi vừa upload
            setIsPreparing(true)
            let ensuredModelId = modelId
            if (!ensuredModelId) {
                const modelRes =
                    await modelServiceAPI.getModelByExperimentId(experimentId)
                ensuredModelId =
                    modelRes?.status === 200 ? modelRes?.data?.id : null
                setModelId(ensuredModelId)
            }
            if (!ensuredModelId) return
            // Fire-and-forget
            instance
                .post(`/api/ml/model/${ensuredModelId}/ensure-deployed`)
                .catch(() => { })
            console.log("Under handleUploadStartBackground")
        } catch (err) {
            console.error('ensure-deployed (background) error:', err)
        }
    }

    // 1) Lấy experimentId theo projectInfo.id
    useEffect(() => {
        if (!projectInfo?.id) return
        const getExperiment = async () => {
            try {
                const { data } = await getAllExperiments(projectInfo?.id)
                if (data && data.length > 0) {
                    setExperimentId(data[0]?.id)
                    setIsPredictDone(false)
                    setIsPreparing(false)
                } else {
                    console.error('No experiments found')
                }
            } catch (e) {
                console.error('Error fetching experiments:', e)
            }
        }
        getExperiment()
    }, [projectInfo])

    // 2) Lấy chi tiết experiment
    useEffect(() => {
        if (!experimentId) return
        const fetchExperiment = async () => {
            try {
                const res = await experimentAPI.getExperimentById(experimentId)
                if (res.status === 200) setExperiment(res.data)
            } catch (error) {
                console.error('Error fetching experiment:', error)
            }
        }
        fetchExperiment()
    }, [experimentId])

    // 3) Lấy metrics
    useEffect(() => {
        if (!experimentId) return
        const fetchMetrics = async () => {
            try {
                const res = await mlServiceAPI.getFinalMetrics(experimentId)
                if (res.status === 200) {
                    const newMetrics = []
                    for (const key in res.data) {
                        newMetrics.push({
                            key: key,
                            metric: res.data[key].name,
                            value: res.data[key].score,
                            description: res.data[key].description,
                            status: getAccuracyStatus(res.data[key].score),
                        })
                    }
                    setMetrics(newMetrics)
                }
            } catch (error) {
                console.error('Error fetching metrics:', error)
            }
        }
        fetchMetrics()
    }, [experimentId])

    // 4) Lấy dataset
    useEffect(() => {
        if (!projectInfo?.dataset_id) return
        const fetchDataset = async () => {
            try {
                const res = await datasetAPI.getDataset(projectInfo?.dataset_id)
                if (res.status === 200) setDatasetInfo(res)
            } catch (error) {
                console.error('Error fetching dataset:', error)
            }
        }
        fetchDataset()
    }, [projectInfo])

    // 5) Lấy chart config/history
    useEffect(() => {
        if (!experimentId) return
        const fetchConfig = async () => {
            try {
                setIsChartLoading(true)
                const res = await getExperimentConfig(experimentId)
                const config = Array.isArray(res?.data)
                    ? res.data[0]
                    : res?.data
                const history = config?.metrics?.training_history || []
                const metricName = config?.metrics?.val_metric || 'Accuracy'
                setValMetric(metricName)
                setChartData(history)
            } catch (error) {
                console.error('Error fetching config:', error)
                setChartData([])
            } finally {
                setIsChartLoading(false)
            }
        }
        fetchConfig()
    }, [experimentId])

    // 6) Check existing deploy_url from projectInfo
    useEffect(() => {
        if (!projectInfo) return
        
        if (projectInfo.deploy_url && projectInfo.deploy_url.startsWith('http')) {
            setStreamlitUrl(projectInfo.deploy_url)
        }
        
        if (projectInfo.valid_duration) {
            setValidDuration(projectInfo.valid_duration)
        }
    }, [projectInfo])

    // Format created_at
    const formattedDate = new Date(projectInfo?.created_at).toLocaleString(
        'en-US',
        {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }
    )

    const hasTraining = (experiment?.actual_training_time || 0) > 0

    // Dynamic card background: blue gradient in light mode
    const cardGradient =
        theme === 'dark'
            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)'
            : 'linear-gradient(150deg, #fff8e1 0%, #bbdefb 40%, #ffcdd2 100%)'

    const MetadataItem = ({ label, value }) => (
        <div className="flex flex-col space-y-1 p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-gray-400 transition-all duration-200 hover:bg-white/10">
            <span
                className="text-xs font-medium uppercase tracking-wider opacity-60"
                style={{ color: 'var(--secondary-text)' }}
            >
                {label}
            </span>
            <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text)' }}
            >
                {value}
            </span>
        </div>
    )

    return (
        <>
            <style>{`
        	 	body, html {
         	 	background-color: var(--surface) !important;

        	}
      `}</style>
            <div
                className="min-h-screen"
                style={{ background: 'var(--surface)' }}
            >
                <div className="relative pt-16 px-4 sm:px-6 lg:px-8 pb-20">
                    {theme === 'dark' && (
                        <BackgroundShapes
                            width="1280px"
                            height="1200px"
                            shapes={[
                                {
                                    id: 'uploadBlue',
                                    shape: 'circle',
                                    size: '480px',
                                    gradient: {
                                        type: 'radial',
                                        shape: 'ellipse',
                                        colors: [
                                            '#5C8DFF 0%',
                                            '#5C8DFF 35%',
                                            'transparent 75%',
                                        ],
                                    },
                                    opacity: 0.4,
                                    blur: '200px',
                                    position: { top: '200px', right: '-120px' },
                                    transform: 'none',
                                },
                                {
                                    id: 'uploadCyan',
                                    shape: 'rounded',
                                    size: '380px',
                                    gradient: {
                                        type: 'radial',
                                        shape: 'circle',
                                        colors: [
                                            '#40FFFF 0%',
                                            '#40FFFF 55%',
                                            'transparent 85%',
                                        ],
                                    },
                                    opacity: 0.25,
                                    blur: '160px',
                                    position: { top: '50px', left: '-100px' },
                                    transform: 'none',
                                },
                                {
                                    id: 'uploadWarm',
                                    shape: 'rounded',
                                    size: '450px',
                                    gradient: {
                                        type: 'radial',
                                        shape: 'circle',
                                        colors: [
                                            '#FFAF40 0%',
                                            '#FFAF40 50%',
                                            'transparent 85%',
                                        ],
                                    },
                                    opacity: 0.2,
                                    blur: '180px',
                                    position: { top: '700px', left: '50%' },
                                    transform: 'translate(-50%, -50%)',
                                },
                            ]}
                        />
                    )}
                    <div className="relative z-10 max-w-7xl mx-auto">
                        {/* Per-section loading indicators handled below; no global overlay */}
                        <div className="text-center mb-16">
                            <h1
                                className="text-4xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent leading-tight"
                                style={{ color: 'var(--title-project)' }}
                            >
                                {projectInfo?.name || 'PROJECT'}
                            </h1>
                            <div
                                className="max-w-4xl mx-auto p-4 rounded-2xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl"
                                style={{ background: 'var(--card-gradient)' }}
                            >
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                                    <div
                                        className="text-sm font-semibold"
                                        style={{ color: 'var(--text)' }}
                                    >
                                        Task:{' '}
                                        <span className="opacity-80">
                                            {projectInfo?.task_type || 'N/A'}
                                        </span>
                                    </div>
                                    <div
                                        className="text-sm font-semibold"
                                        style={{ color: 'var(--text)' }}
                                    >
                                        Created:{' '}
                                        <span className="opacity-80">
                                            {formattedDate}
                                        </span>
                                    </div>
                                    {projectInfo?.visibility && (
                                        <div
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--text)' }}
                                        >
                                            Visibility:{' '}
                                            <span className="opacity-80">
                                                {projectInfo.visibility}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Statistic Cards - render progressively per section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card
                                className="border border-1 border-gray-300 backdrop-blur-sm shadow-lg hover:shadow-xl transition duration-500 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group"
                                style={{
                                    background: cardGradient,
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                <div className="relative">
                                    {/* Tooltip cho Training Duration */}
                                    <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                        <div className="px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg min-w-max">
                                            Training time for the model
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
                                        </div>
                                    </div>

                                    {!experiment ? (
                                        <Skeleton
                                            active
                                            paragraph={{ rows: 2 }}
                                            title={false}
                                        />
                                    ) : (
                                        <Statistic
                                            title={
                                                <span
                                                    style={{
                                                        color: 'var(--secondary-text)',
                                                        fontFamily:
                                                            'Poppins, sans-serif',
                                                    }}
                                                    className="flex items-center"
                                                >
                                                    Training Duration
                                                    <span className="ml-2">
                                                        <QuestionCircleOutlined className="text-blue-400 text-base" />
                                                    </span>
                                                </span>
                                            }
                                            valueRender={() => {
                                                const totalMinutes =
                                                    experiment?.actual_training_time ||
                                                    0
                                                if (totalMinutes === 0) {
                                                    return (
                                                        <span
                                                            className={`${theme === 'dark' ? 'text-yellow-500' : 'text-gray-700'} font-bold`}
                                                        >
                                                            No training time
                                                        </span>
                                                    )
                                                }
                                                const mins =
                                                    Math.floor(totalMinutes)
                                                const secs = Math.round(
                                                    (totalMinutes - mins) * 60
                                                )
                                                return (
                                                    <span
                                                        className={`${theme === 'dark' ? 'text-yellow-500' : 'text-gray-700'} font-bold`}
                                                    >
                                                        {mins}m {secs}s
                                                    </span>
                                                )
                                            }}
                                            prefix={
                                                <ClockCircleOutlined
                                                    style={{ color: '#f59e0b' }}
                                                />
                                            }
                                        />
                                    )}
                                </div>
                            </Card>

                            <Card
                                className="border border-1 border-gray-300 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group"
                                style={{
                                    background: cardGradient,
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                <div className="relative">
                                    {/* Tooltip hiện khi hover vào card */}
                                    <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                        <div className="px-3 py-2 text-sm text-white bg-gray-800 rounded-lg min-w-max shadow-lg">
                                            The proportion of correct
                                            predictions.
                                            <div className="absolute bottom-full right-4 transform -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
                                        </div>
                                    </div>

                                    {!metrics.length ? (
                                        <Skeleton
                                            active
                                            paragraph={{ rows: 2 }}
                                            title={false}
                                        />
                                    ) : (
                                        <Statistic
                                            title={
                                                <span
                                                    style={{
                                                        color: 'var(--secondary-text)',
                                                        fontFamily:
                                                            'Poppins, sans-serif',
                                                    }}
                                                    className="flex items-center"
                                                >
                                                    Accuracy
                                                    <span className="ml-2">
                                                        <QuestionCircleOutlined className="text-blue-400 text-base" />
                                                    </span>
                                                </span>
                                            }
                                            valueRender={() => {
                                                if (!hasTraining) {
                                                    return (
                                                        <span
                                                            style={{
                                                                fontFamily:
                                                                    'Poppins, sans-serif',
                                                                fontWeight:
                                                                    'bold',
                                                            }}
                                                            className={`${theme === 'dark' ? 'text-sky-400' : 'text-gray-700'}`}
                                                        >
                                                            No accuracy
                                                            available
                                                        </span>
                                                    )
                                                }
                                                return (
                                                    <span
                                                        className={`${theme === 'dark' ? 'text-sky-500' : 'text-gray-700'} font-bold`}
                                                    >
                                                        {parseFloat(
                                                            (
                                                                metrics[0]
                                                                    ?.value *
                                                                100 || 0
                                                            ).toFixed(2)
                                                        )}
                                                    </span>
                                                )
                                            }}
                                            precision={2}
                                            prefix={
                                                <TrophyOutlined
                                                    style={{
                                                        color: 'var(--accent-text)',
                                                    }}
                                                />
                                            }
                                            suffix={
                                                <span
                                                    className={`${theme === 'dark' ? 'text-sky-500' : 'text-gray-700'} font-bold`}
                                                >
                                                    %
                                                </span>
                                            }
                                        />
                                    )}
                                </div>
                            </Card>

                            <Button
                                size="large"
                                className="border border-gray-400 border-1 h-full flex items-center justify-center backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group text-green-500"
                                style={{
                                    background: cardGradient,
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                                loading={
                                    !streamlitUrl && (
                                        isCheckingModelStatus ||
                                        isPreparing ||
                                        modelStatus === 'SETTING_UP' ||
                                        modelStatus === 'CREATING_INSTANCE' ||
                                        isDeploySettingUp ||
                                        isGeneratingUI
                                    )
                                }
                                onClick={
                                    hasTraining
                                        ? handleModelButtonClick
                                        : undefined
                                }
                                disabled={!hasTraining}
                            >
                                <span
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    {hasTraining ? (
                                        <span
                                            className={`${theme === 'dark' ? 'text-green-500' : 'text-gray-700'}`}
                                        >
                                            {streamlitUrl
                                                ? 'Open App'
                                                : isCheckingModelStatus
                                                    ? 'Fetching deploy status'
                                                    : isPreparing
                                                        ? 'Preparing...'
                                                        : isGeneratingUI
                                                            ? 'Generating UI...'
                                                            : isModelOnline
                                                                ? isPredictDone
                                                                    ? 'Done'
                                                                    : 'Your model online'
                                                                : modelStatus ===
                                                                    'SETTING_UP' ||
                                                                    modelStatus ===
                                                                    'CREATING_INSTANCE'
                                                                    ? 'Setting your model…'
                                                                    : 'Use your model'}
                                        </span>
                                    ) : (
                                        <span
                                            className={`${theme === 'dark' ? 'text-red-400' : 'text-gray-700'}`}
                                        >
                                            Your model not available
                                        </span>
                                    )}
                                </span>
                            </Button>
                        </div>

                        {/* Dataset details + Training history on the same row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {datasetInfo === null ? (
                                <div className="lg:col-span-1 p-6 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl">
                                    <Skeleton
                                        active
                                        paragraph={{ rows: 4 }}
                                        title={false}
                                    />
                                </div>
                            ) : datasetInfo?.data ? (
                                <div className="lg:col-span-1 p-6 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl bg-[linear-gradient(135deg, var(--card-gradient)_0%, rgba(255,255,255,0.02)_100%)]">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-white/20 to-white/10">
                                            <SettingOutlined
                                                className="text-xl"
                                                style={{
                                                    color: 'var(--accent-text)',
                                                }}
                                            />
                                        </div>
                                        <h2
                                            className="text-xl font-bold"
                                            style={{ color: 'var(--text)' }}
                                        >
                                            Dataset Details
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        <MetadataItem
                                            label="Data Type"
                                            value={
                                                datasetInfo?.data?.data_type ||
                                                'N/A'
                                            }
                                        />
                                        <MetadataItem
                                            label="Total Files"
                                            value={(
                                                datasetInfo?.data?.meta_data
                                                    ?.total_files ?? 'N/A'
                                            ).toString()}
                                        />
                                        <MetadataItem
                                            label="Total Size (MB)"
                                            value={(() => {
                                                const kb =
                                                    datasetInfo?.data?.meta_data
                                                        ?.total_size_kb
                                                if (kb == null) return 'N/A'
                                                const mb = Number(kb) / 1024
                                                return `${mb.toFixed(2)}`
                                            })()}
                                        />
                                        <MetadataItem
                                            label="Title"
                                            value={
                                                datasetInfo?.data?.title ||
                                                datasetInfo?.data
                                                    ?.dataset_title ||
                                                'N/A'
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="lg:col-span-1 p-6 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                                    <Empty
                                        description="No dataset info"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                </div>
                            )}

                            {/* Training history chart on the same row, wider column */}
                            {isChartLoading ||
                                (Array.isArray(chartData) &&
                                    chartData.length > 0) ? (
                                <div className="lg:col-span-2 p-6 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl">
                                    <h2
                                        className="text-xl font-bold mb-4"
                                        style={{ color: 'var(--text)' }}
                                    >
                                        Training History ({valMetric})
                                    </h2>
                                    <div style={{ width: '100%', height: 300 }}>
                                        {isChartLoading ? (
                                            <div className="w-full h-full">
                                                <Skeleton
                                                    active
                                                    paragraph={{ rows: 6 }}
                                                    title={false}
                                                />
                                            </div>
                                        ) : (
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <AreaChart
                                                    data={chartData}
                                                    margin={{
                                                        top: 10,
                                                        right: 30,
                                                        left: 0,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <defs>
                                                        <linearGradient
                                                            id="colorAccuracy"
                                                            x1="0"
                                                            y1="0"
                                                            x2="0"
                                                            y2="1"
                                                        >
                                                            <stop
                                                                offset="5%"
                                                                stopColor="#60a5fa"
                                                                stopOpacity={
                                                                    0.8
                                                                }
                                                            />
                                                            <stop
                                                                offset="95%"
                                                                stopColor="#22d3ee"
                                                                stopOpacity={
                                                                    0.1
                                                                }
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="#334155"
                                                    />
                                                    <XAxis
                                                        dataKey="step"
                                                        tick={{
                                                            fontSize: 12,
                                                            fill: '#94a3b8',
                                                        }}
                                                        domain={[0, 'auto']}
                                                    />
                                                    <YAxis
                                                        tick={{
                                                            fontSize: 12,
                                                            fill: '#94a3b8',
                                                        }}
                                                        domain={[0, 'auto']}
                                                    />
                                                    <RechartsTooltip
                                                        formatter={(value) => [
                                                            `${(value * 1).toFixed(2)}`,
                                                            valMetric,
                                                        ]}
                                                        labelFormatter={(
                                                            label
                                                        ) =>
                                                            `Epoch: ${label} step`
                                                        }
                                                        contentStyle={{
                                                            backgroundColor:
                                                                'rgba(15, 23, 42, 0.95)',
                                                            borderRadius: '8px',
                                                            boxShadow:
                                                                '0 4px 20px rgba(0,0,0,0.5)',
                                                            border: '1px solid var(--border)',
                                                            color: '#e2e8f0',
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="score"
                                                        stroke="#60a5fa"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorAccuracy)"
                                                        name={`Validation ${valMetric}`}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="lg:col-span-2 p-6 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                                    <Empty
                                        description="No training history yet"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Training history chart moved into the row above */}
                </div>
            </div>
            <UpDataDeploy
                isOpen={isShowUpload}
                onClose={hideUpload}
                projectId={projectInfo?.id}
                onUploaded={handleAfterUpload}
                onUploadStart={handleUploadStartBackground}
            />
        </>
    )
}

export default ProjectInfo
