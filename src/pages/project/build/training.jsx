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
        <Card className="h-max shadow-md">
            {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
                <div className="flex">
                    <div className="text-lg font-semibold text-gray-600 flex items-center">
                        {icon && <span className="mr-2">{icon}</span>}
                        {title}
                    </div>
                    <div className="text-xl font-bold text-blue-600 ml-8">
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
            <div className="flex justify-center items-center h-64 w-full border border-dashed border-gray-300 rounded-lg">
                <Space direction="vertical" align="center">
                    <LineChartOutlined
                        style={{ fontSize: 48, color: '#d9d9d9' }}
                    />
                    <Text type="secondary">Waiting for training data...</Text>
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
                            stopColor="#1890ff"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#1890ff"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="time"
                    label={{
                        value: 'Time (min)',
                        position: 'insideBottomRight',
                        offset: -5,
                    }}
                    tick={{ fontSize: 12 }}
                    domain={[0, maxTrainingTime ? maxTrainingTime : 'auto']}
                />
                <YAxis
                    label={{
                        value: valMetric,
                        angle: -90,
                        position: 'insideLeft',
                    }}
                    domain={['auto', 'auto']}   // auto-fit to your data
                    tick={{ fontSize: 12 }}
                />
                <RechartsTooltip
                    formatter={(value) => [
                        `${(value * 1).toFixed(2)}`,
                        valMetric,
                    ]}
                    labelFormatter={(label) => `Time: ${label} min`}
                    contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#1890ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                    activeDot={{
                        r: 8,
                        stroke: '#1890ff',
                        strokeWidth: 2,
                        fill: '#fff',
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
                <Title level={5}>
                    <DashboardOutlined /> Training Information:{' '}
                    <Tag color="blue" icon={<ExperimentOutlined />}>
                        {experimentName}
                    </Tag>
                </Title>
            }
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
            extra={
                <>
                    {status === 'DONE' && (
                        <div className="text-center">
                            <button
                                onClick={onViewResults}
                                className="border border-green-500 bg-green-50 text-green-500 p-2 rounded-md hover:bg-green-500 hover:text-white"
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

                <Divider orientation="left">Training Progress</Divider>

                <Row gutter={[16, 16]}>
                    {maxTrainingTime > 0 && (
                        <Col span={24}>
                            <Progress
                                percent={trainProgress}
                                status={getProgressStatus()}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                                format={(percent) =>
                                    status === 'DONE'
                                        ? 'Completed'
                                        : `${percent.toFixed(1)}%`
                                }
                            />
                            <div className="mt-2">
                                <Text type="secondary">
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
                                            style={{ marginTop: '8px' }}
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
        <div className="p-4">
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
                            <Title level={5}>
                                <LineChartOutlined /> {`${valMetric ? valMetric : "Accuracy"} Trend`}
                            </Title>
                        }
                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                        extra={
                            maxTrainingTime ? (
                                <Tag
                                    color="orange"
                                    icon={<HourglassOutlined />}
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
                                />
                            </div>
                        )}
                    </Card>

                    <Alert
                        description={
                            <div>
                                <Paragraph>
                                    <RadarChartOutlined className="mr-2" />
                                    <Text strong>Understand Metrics:</Text>{' '}
                                    {metricExplain}
                                </Paragraph>

                                {maxTrainingTime && (
                                    <Paragraph>
                                        <Tooltip title="Time constraints can affect model performance">
                                            <HourglassOutlined className="mr-2" />
                                            <Text strong>
                                                Training Time Limit:
                                            </Text>{' '}
                                            This experiment has a maximum
                                            training time of {maxTrainingTime}{' '}
                                            minutes. If the training doesn't
                                            converge within this time, consider
                                            adjusting model complexity or
                                            training parameters.
                                        </Tooltip>
                                    </Paragraph>
                                )}
                            </div>
                        }
                        type="info"
                    />
                </Space>
            </animated.div>

            <Modal
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        Resource Preparation
                        <Tooltip
                            title={
                                <div>
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
                                    color: '#1890ff',
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
            >
                <Card className="preparation-card">
                    <Steps current={currentStep}>
                        {steps.map((step, index) => (
                            <Step
                                key={index}
                                title={step.title}
                                description={step.description}
                                icon={
                                    currentStep === index ? (
                                        <LoadingOutlined />
                                    ) : (
                                        step.icon
                                    )
                                }
                            />
                        ))}
                    </Steps>
                </Card>
            </Modal>
        </div>
    )
}

export default Training
