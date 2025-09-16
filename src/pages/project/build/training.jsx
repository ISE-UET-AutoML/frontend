import useTrainingStore from 'src/stores/trainingStore'
import React, { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import {
    Card,
    Row,
    Col,
    Alert,
    Typography,
    Space,
    Progress,
    Divider,
    Tag,
    Spin,
    Skeleton,
    Steps,
    Button,
    Tooltip,
    Modal,
} from 'antd'
import {
    ExperimentOutlined,
    LineChartOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    BarChartOutlined,
    DashboardOutlined,
    CalendarOutlined,
    HourglassOutlined,
    RadarChartOutlined,
    SettingOutlined,
    CloudDownloadOutlined,
    LoadingOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts'
import { PATHS } from 'src/constants/paths'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
const { Step } = Steps
// import { calcGeneratorDuration } from 'framer-motion'

const { Title, Text, Paragraph } = Typography

const steps = [
    {
        title: 'Setting up virtual environment',
        icon: <SettingOutlined />,
    },
    {
        title: 'Downloading dataset on Cloud Storage',
        icon: <CloudDownloadOutlined />,
    },
]

// Training Metric Card Component - replacement for AnimatedStatistic
const TrainingMetricCard = ({
    title,
    value,
    prefix,
    suffix,
    loading,
    icon,
}) => {
    return (
        <Card 
            className="h-max border-0 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
                background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif'
            }}
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
                <div className="flex">
                    <div className="text-lg font-medium text-gray-300 flex items-center">
                        {icon && <span className="mr-2 text-blue-400">{icon}</span>}
                        {title}
                    </div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ml-8">
                        {prefix && <span className="mr-1">{prefix}</span>}
                        {typeof value === 'number'
                            ? value % 1 === 0
                                ? value
                                : value.toFixed(2)
                            : value}
                        {suffix && <span className="ml-1">{suffix}</span>}
                    </div>
                </div>
            )}
        </Card>
    )
}

// Enhanced Line Graph Component
const EnhancedLineGraph = ({ valMetric, data, loading, maxTrainingTime }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <Spin size="large" tip="Loading chart data..." />
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 w-full border border-dashed border-slate-600/50 rounded-lg bg-slate-800/20">
                <Space direction="vertical" align="center">
                    <LineChartOutlined
                        style={{ fontSize: 48, color: '#64748b' }}
                    />
                    <Text type="secondary" style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}>
                        Waiting for training data...
                    </Text>
                </Space>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#22d3ee"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="time"
                    label={{
                        value: 'Time (min)',
                        position: 'insideBottomRight',
                        offset: -5,
                        style: { fill: '#94a3b8', fontFamily: 'Poppins, sans-serif' }
                    }}
                    tick={{ fontSize: 12, fill: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}
                    domain={[0, maxTrainingTime ? maxTrainingTime : 'auto']}
                />
                <YAxis
                    label={{
                        value: valMetric,
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#94a3b8', fontFamily: 'Poppins, sans-serif' }
                    }}
                    domain={['auto', 'auto']}   // auto-fit to your data
                    tick={{ fontSize: 12, fill: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}
                />
                <RechartsTooltip
                    formatter={(value) => [
                        `${(value * 1).toFixed(2)}`,
                        valMetric,
                    ]}
                    labelFormatter={(label) => `Time: ${label} min`}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#e2e8f0',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                    activeDot={{
                        r: 8,
                        stroke: '#60a5fa',
                        strokeWidth: 2,
                        fill: '#0f172a',
                    }}
                    name={`Validation ${valMetric}`}
                />
                {maxTrainingTime && (
                    <Line
                        type="monotone"
                        dataKey="threshold"
                        stroke="transparent"
                        strokeWidth={0}
                        name="Max Training Time"
                    />
                )}
            </AreaChart>
        </ResponsiveContainer>
    )
}

// Training Information Card
const TrainingInfoCard = ({
    valMetric,
    experimentName,
    trainingInfo,
    elapsedTime,
    status,
    maxTrainingTime,
    onViewResults,
    trainProgress,
}) => {
    // Calculate time-based progress
    const timeProgress = maxTrainingTime
        ? Math.min((elapsedTime / maxTrainingTime) * 100, 100).toFixed(1)
        : 0
    const getProgressStatus = () => {
        if (status === 'DONE') return 'success'
        if (trainProgress >= 100) return 'exception'
        return 'active'
    }
    return (
        <Card
            title={
                <Title level={5} style={{ margin: 0, color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>
                    <DashboardOutlined style={{ color: '#60a5fa' }} /> Training Information:{' '}
                    <Tag 
                        color="blue" 
                        icon={<ExperimentOutlined />}
                        style={{ 
                            background: 'linear-gradient(135deg, #3b82f6, #22d3ee)', 
                            border: 'none',
                            color: 'white',
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    >
                        {experimentName}
                    </Tag>
                </Title>
            }
            className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
                background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif'
            }}
            extra={
                <>
                    {status === 'DONE' && (
                        <div className="text-center">
                            <button
                                onClick={onViewResults}
                                className="border border-blue-400 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 p-3 rounded-lg hover:from-blue-500 hover:to-cyan-500 hover:text-white transition-all duration-300 backdrop-blur-sm"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <CheckCircleOutlined className="mr-2" />
                                View Training Results
                            </button>
                        </div>
                    )}
                </>
            }
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row>
                    <div className="w-[28%]">
                        <TrainingMetricCard
                            title="Current Epoch"
                            value={trainingInfo.latestEpoch}
                            icon={<ExperimentOutlined />}
                            loading={
                                !trainingInfo.latestEpoch &&
                                status === 'TRAINING'
                            }
                        />
                    </div>
                    <div className="w-[28%] ml-10">
                        <TrainingMetricCard
                            title={`Validation ${valMetric}`}
                            value={(trainingInfo.accuracy * 1).toFixed(5)}
                            icon={<BarChartOutlined />}
                            loading={
                                !trainingInfo.accuracy && status === 'TRAINING'
                            }
                        />
                    </div>
                    <div className="w-[28%] ml-10">
                        <TrainingMetricCard
                            title="Time Elapsed"
                            value={elapsedTime}
                            suffix="min"
                            icon={<CalendarOutlined />}
                            loading={status === 'PENDING'}
                        />
                    </div>
                </Row>

                <Divider 
                    orientation="left" 
                    style={{ 
                        borderColor: 'rgba(255, 255, 255, 0.2)', 
                        color: '#94a3b8',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                >
                    Training Progress
                </Divider>

                <Row gutter={[16, 16]}>
                    {maxTrainingTime > 0 && (
                        <Col span={24}>
                            <Progress
                                percent={trainProgress}
                                status={getProgressStatus()}
                                strokeColor={{
                                    '0%': '#3b82f6',
                                    '100%': '#22d3ee',
                                }}
                                trailColor="rgba(51, 65, 85, 0.5)"
                                format={(percent) =>
                                    status === 'DONE'
                                        ? 'Completed'
                                        : `${percent.toFixed(1)}%`
                                }
                                style={{
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                            <div className="mt-2">
                                <Text 
                                    type="secondary" 
                                    style={{ 
                                        color: '#94a3b8',
                                        fontFamily: 'Poppins, sans-serif'
                                    }}
                                >
                                    {status === 'DONE'
                                        ? `Training completed in ${elapsedTime} minutes`
                                        : timeProgress < 100
                                            ? `Training time remaining approximately ${(maxTrainingTime - elapsedTime).toFixed(2)} minutes`
                                            : 'Maximum training time reached'}
                                </Text>
                                {status === 'TRAINING' &&
                                    trainProgress >= 100 && (
                                        <Alert
                                            message="Time limit reached"
                                            description="Training has reached the maximum time limit and will complete soon."
                                            type="warning"
                                            showIcon
                                            style={{ 
                                                marginTop: '8px',
                                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                                borderRadius: '8px',
                                                fontFamily: 'Poppins, sans-serif'
                                            }}
                                        />
                                    )}
                            </div>
                        </Col>
                    )}
                </Row>
            </Space>
        </Card>
    )
}

// Main Component
const Training = () => {
    const { projectInfo, updateFields } = useOutletContext()
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const experimentName = searchParams.get('experimentName')
    const experimentId = searchParams.get('experimentId')
    const [trainingInfo, setTrainingInfo] = useState({
        latestEpoch: 0,
        accuracy: 0,
    })
    const [valMetric, setValMetric] = useState("Accuracy")
    const [chartData, setChartData] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [status, setStatus] = useState('PENDING')
    const [loading, setLoading] = useState(true)
    const [maxTrainingTime, setMaxTrainingTime] = useState(null)
    const metricExplain = projectInfo.metrics_explain
    const [trainProgress, setTrainProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleModalCancel = () => {
        setIsModalVisible(false)
    }

    const { trainingTasks, startTrainingTask } = useTrainingStore()
    const trainingTask = trainingTasks[experimentId]
    // Handle view results button click
    const handleViewResults = () => {
        navigate(
            PATHS.PROJECT_TRAININGRESULT(projectInfo.id, experimentId, experimentName)
        )
    }

    useEffect(() => {
        if (!trainingTask) {
            startTrainingTask(experimentId)
            console.log(`starting training for ${experimentId}`)
        } else {
            console.log(`Already trained or done for ${experimentId}`)
        }
    }, [experimentId])

    useEffect(() => {
        if (trainingTask) {
            if (trainingTask.status === 'SETTING_UP') {
                setCurrentStep(0)
                setIsModalVisible(true)
            }
            else if (trainingTask.status === 'DOWNLOADING_DATA') {
                setCurrentStep(1)
                setIsModalVisible(true)
            }
            else {
                setCurrentStep(null)
                setIsModalVisible(false)
                console.log("Current Training stats:", trainingTask)
                setTrainProgress(trainingTask.progress)
                setStatus(trainingTask.status)
                setTrainingInfo((prev) => ({
                    latestEpoch: trainingTask.trainingInfo.latestEpoch || 0,
                    accuracy: trainingTask.trainingInfo.accuracy || 0
                }))
                setValMetric((prev) => trainingTask.valMetric)
                setElapsedTime(prev => trainingTask.elapsed)
                setMaxTrainingTime(prev => trainingTask.expectedTrainingTime / 60)
                setChartData(prev => trainingTask.accuracyTrend)
            }
        }
    }, [trainingTask]);

    // Create chart data with time limit reference line
    const enhancedChartData = React.useMemo(() => {
        if (!maxTrainingTime || chartData?.length === 0) return chartData

        // Add a threshold reference that can be used for visual cues
        return chartData.map((point) => ({
            ...point,
            threshold: point.time <= maxTrainingTime ? null : 0,
        }))
    }, [chartData, maxTrainingTime])

    return (
        <>
            <style>{`
                body, html {
                    background-color: #01000A !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
            <div className="min-h-screen bg-[#01000A] relative">
                <BackgroundShapes 
                    width="1280px" 
                    height="1200px"
                    shapes={[
                        {
                            id: 'trainingBlue',
                            shape: 'circle',
                            size: '600px',
                            gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 35%', 'transparent 75%'] },
                            opacity: 0.35,
                            blur: '240px',
                            position: { top: '120px', right: '-200px' },
                            transform: 'none'
                        },
                        {
                            id: 'trainingCyan',
                            shape: 'rounded',
                            size: '500px',
                            gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 45%', 'transparent 80%'] },
                            opacity: 0.25,
                            blur: '200px',
                            position: { top: '300px', left: '-180px' },
                            transform: 'none'
                        },
                        {
                            id: 'trainingWarm',
                            shape: 'rounded',
                            size: '450px',
                            gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 55%', 'transparent 90%'] },
                            opacity: 0.20,
                            blur: '180px',
                            position: { bottom: '100px', right: '20%' },
                            transform: 'none'
                        }
                    ]}
                />
                <div className="relative z-10 p-6">
                    <animated.div
                        style={useSpring({
                            from: { opacity: 0, transform: 'translateY(20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                            config: { tension: 280, friction: 20 },
                        })}
                    >
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <TrainingInfoCard
                        valMetric={valMetric}
                        experimentName={experimentName}
                        experimentId={experimentId}
                        trainingInfo={trainingInfo}
                        elapsedTime={elapsedTime}
                        status={status}
                        maxTrainingTime={maxTrainingTime}
                        onViewResults={handleViewResults}
                        trainProgress={trainProgress}
                    />

                    <Card
                        title={
                            <Title level={5} style={{ margin: 0, color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>
                                <LineChartOutlined style={{ color: '#60a5fa' }} /> {`${valMetric ? valMetric : "Accuracy"} Trend`}
                            </Title>
                        }
                        className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{
                            background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            fontFamily: 'Poppins, sans-serif'
                        }}
                        extra={
                            maxTrainingTime ? (
                                <Tag
                                    color="orange"
                                    icon={<HourglassOutlined />}
                                    style={{ 
                                        background: 'linear-gradient(135deg, #f59e0b, #f97316)', 
                                        border: 'none',
                                        color: 'white',
                                        fontFamily: 'Poppins, sans-serif'
                                    }}
                                >
                                    Time Limit: {maxTrainingTime.toFixed(2)} min
                                </Tag>
                            ) : null
                        }
                    >
                        <EnhancedLineGraph
                            valMetric={valMetric}
                            data={enhancedChartData}
                            loading={loading && chartData?.length === 0}
                            maxTrainingTime={maxTrainingTime}
                        />

                        {maxTrainingTime && status === 'TRAINING' && (
                            <div className="mt-4">
                                <Alert
                                    type={
                                        elapsedTime >= maxTrainingTime
                                            ? 'warning'
                                            : 'info'
                                    }
                                    message={
                                        elapsedTime >= maxTrainingTime
                                            ? 'Training Time Limit Reached'
                                            : 'Training Time Limit'
                                    }
                                    description={
                                        elapsedTime >= maxTrainingTime
                                            ? 'The training has reached its maximum allocated time. It may automatically stop soon.'
                                            : `This experiment is configured to run for maximum ${maxTrainingTime} minutes.`
                                    }
                                    showIcon
                                    style={{
                                        background: elapsedTime >= maxTrainingTime 
                                            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))'
                                            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))',
                                        border: elapsedTime >= maxTrainingTime 
                                            ? '1px solid rgba(251, 191, 36, 0.3)'
                                            : '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        fontFamily: 'Poppins, sans-serif'
                                    }}
                                />
                            </div>
                        )}
                    </Card>

                    <Alert
                        description={
                            <div>
                                <Paragraph style={{ margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                                    <RadarChartOutlined className="mr-2" style={{ color: '#60a5fa' }} />
                                    <Text strong style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Understand Metrics:</Text>{' '}
                                    <Text style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}>
                                        {metricExplain}
                                    </Text>
                                </Paragraph>

                                {maxTrainingTime && (
                                    <Paragraph style={{ margin: '12px 0 0 0', fontFamily: 'Poppins, sans-serif' }}>
                                        <Tooltip title="Time constraints can affect model performance">
                                            <HourglassOutlined className="mr-2" style={{ color: '#f59e0b' }} />
                                            <Text strong style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                                                Training Time Limit:
                                            </Text>{' '}
                                            <Text style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                                                This experiment has a maximum
                                                training time of {maxTrainingTime}{' '}
                                                minutes. If the training doesn't
                                                converge within this time, consider
                                                adjusting model complexity or
                                                training parameters.
                                            </Text>
                                        </Tooltip>
                                    </Paragraph>
                                )}
                            </div>
                        }
                        type="info"
                        style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '12px',
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    />
                    </Space>
                    </animated.div>
                </div>

                <Modal
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: 'Poppins, sans-serif',
                            color: 'black'
                        }}
                    >
                        Resource Preparation
                        <Tooltip
                            title={
                                <div style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <p>
                                        This process ensures a smooth and
                                        secure setup:
                                    </p>
                                    <ul>
                                        <li>
                                            1. Create an isolated virtual
                                            machine
                                        </li>
                                        <li>
                                            2. Download required resources
                                            safely
                                        </li>
                                        <li>
                                            3. Configure the environment for
                                            optimal performance
                                        </li>
                                    </ul>
                                    <p>
                                        Each step is carefully monitored to
                                        prevent potential issues.
                                    </p>
                                </div>
                            }
                        >
                            <InfoCircleOutlined
                                style={{
                                    color: '#60a5fa',
                                    cursor: 'pointer',
                                }}
                            />
                        </Tooltip>
                    </div>
                }
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width={1000}
                styles={{
                    mask: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)'
                    }
                }}
            >
                <Card 
                    className="preparation-card border-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                >
                    <Steps 
                        current={currentStep}
                        style={{
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    >
                        {steps.map((step, index) => (
                            <Step
                                key={index}
                                title={<span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>{step.title}</span>}
                                description={step.description}
                                icon={
                                    currentStep === index ? (
                                        <LoadingOutlined style={{ color: '#60a5fa' }} />
                                    ) : (
                                        <span style={{ color: '#94a3b8' }}>{step.icon}</span>
                                    )
                                }
                            />
                        ))}
                    </Steps>
                </Card>
            </Modal>
            </div>
        </>
    )
}

export default Training
