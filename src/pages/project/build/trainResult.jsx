import React, { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import {
    Card,
    Row,
    Col,
    Alert,
    Typography,
    Space,
    Statistic,
    Table,
    Tag,
    Button,
    Tooltip,
    message,
} from 'antd'
import {
    HistoryOutlined,
    CloudDownloadOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    RocketOutlined,
    BarChartOutlined,
    InfoCircleOutlined,
    ExperimentOutlined,
} from '@ant-design/icons'
import { ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import LineGraph from 'src/components/LineGraph'

import * as experimentAPI from 'src/api/experiment'
import * as mlServiceAPI from 'src/api/mlService'
const { Title, Text } = Typography

// Performance Metrics Configuration
const getAccuracyStatus = (score) => {
    if (score >= 0.9) {
        return <Tag color="green">Excellent</Tag>
    }
    else if (score >= 0.7) {
        return <Tag color="blue">Good</Tag>
    }
    else if (score >= 0.6) {
        return <Tag color="orange">Medium</Tag>
    }
    else {
        return <Tag color='red'>Bad</Tag>
    }
}

// Enhanced Table Columns with Tooltips
const columns = [
    {
        title: 'Metric',
        dataIndex: 'metric',
        key: 'metric',
        render: (text, record) => (
            <Tooltip title={record.description}>
                {text}{' '}
                <InfoCircleOutlined
                    style={{ color: '#1890ff', marginLeft: 5 }}
                />
            </Tooltip>
        ),
    },
    {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
]

const TrainResult = () => {
    // Currently hard coded this for testing.
    const instanceInfo = {
        "id": 22712659,
        "ssh_port": "50311",
        "public_ip": "185.62.108.226",
        "deploy_port": "50081"
    }
    const { projectInfo, trainingInfo, elapsedTime } = useOutletContext()
    console.log('Train Info', trainingInfo)
    console.log(projectInfo)
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const experimentName = searchParams.get('experimentName')
    const experimentId = searchParams.get('experimentId')
    const modelId = searchParams.get('modelId')
    const [experiment, setExperiment] = useState({})
    const [metrics, setMetrics] = useState([])
    const [GraphJSON, setGraphJSON] = useState({})
    const [val_lossGraph, setValLossGraph] = useState([])
    const [val_accGraph, setValAccGraph] = useState([])
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)

    // Existing data parsing logic
    const readChart = (contents, setGraph) => {
        const lines = contents.split('\n')
        const header = lines[0].split(',')
        let parsedData = []
        for (let i = 1; i < lines.length - 1; i++) {
            const line = lines[i].split(',')
            const item = {}

            for (let j = 1; j < header.length; j++) {
                const key = header[j]?.trim() || ''
                const value = line[j]?.trim() || ''
                item[key] = value
            }

            parsedData.push(item)
        }
        setGraph(parsedData)
    }

    useEffect(() => {
        const fetchExperiment = async () => {
            try {
                const experimentRes = await experimentAPI.getExperimentById(experimentId)
                if (experimentRes.status !== 200) {
                    throw new Error("Cannot get experiment")
                }
                setExperiment(prev => experimentRes.data)

            }
            catch (error) {
                console.log("Error while getting experiment", error)
            }
        }

        const fetchExperimentMetrics = async () => {
            setMetrics((prev) => [])
            try {
                const metricsRes = await mlServiceAPI.getFinalMetrics(experimentId)
                if (metricsRes.status !== 200) {
                    throw new Error("Cannot get metrics")
                }
                console.log(metricsRes)
                for (const key in metricsRes.data) {
                    const metricData = {
                        key: key,
                        metric: metricsRes.data[key].name,
                        value: metricsRes.data[key].score,
                        description: metricsRes.data[key].description,
                        status: getAccuracyStatus(metricsRes.data[key].score)
                    }
                    setMetrics((prev) => [...prev, metricData])
                }
            }
            catch (error) {
                console.log("Error while getting metrics", error)
            }
        }

        const fetchTrainingHistory = async () => {
            try {
                const res =
                    // await experimentAPI.getTrainingHistory(experimentName)
                    await mlServiceAPI.getFitHistory(projectInfo.id, experimentName)
                console.log(res)
                const data = res.data

                console.log('history', data)
                if (data.error) {
                    message.error(
                        'An error occurred while fetching the training history.'
                    )
                    return
                }
                setGraphJSON(data)

                if (data.fit_history.scalars.val_loss) {
                    readChart(
                        data.fit_history.scalars.val_loss,
                        setValLossGraph
                    )
                }
                if (data.fit_history.scalars.val_accuracy) {
                    readChart(data.fit_history.scalars.val_accuracy, setValAccGraph)
                }
            } catch (error) {
                console.error('Error fetching training history:', error)
                // message.error(
                // 	'Failed to load training history. Please try again later.'
                // )
            }
        }

        fetchExperiment()
        fetchExperimentMetrics()
        fetchTrainingHistory()
    }, [])

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Space direction="vertical" size="large" className="w-full">
                {/* Key Metrics Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="shadow-md ">
                            <Statistic
                                title={`Final ${metrics[0]?.metric} score`}
                                value={metrics[0]?.value * 100 || 0}
                                precision={2}
                                prefix={<TrophyOutlined />}
                                suffix="%"
                                valueStyle={{
                                    color: '#3f8600',
                                }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="shadow-md ">
                            <Statistic
                                title="Training Duration"
                                value={experiment.actual_training_time || 0}
                                valueStyle={{
                                    color: '#f0b100',
                                }}
                                precision={2}
                                prefix={<ClockCircleOutlined />}
                                suffix="m"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="shadow-md ">
                            <Statistic
                                title="Total Epochs"
                                value={trainingInfo?.latestEpoch || 0}
                                prefix={<ExperimentOutlined />}
                                valueStyle={{
                                    color: '#2b7fff',
                                }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="🚀 Next Steps" className="rounded-xl shadow-sm">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Alert
                                message="Deploy Model"
                                description="Instantly transform your trained model into a production-ready solution for real-world predictions."
                                type="success"
                                showIcon
                                style={{ height: 130 }}
                            />
                            <Button
                                type="primary"
                                icon={<RocketOutlined />}
                                onClick={() => {
                                    navigate(
                                        `/app/project/${projectInfo.id}/build/deployView?experimentId=${experimentId}&experimentName=${experimentName}&modelId=${modelId}`
                                    )
                                }}
                                size="large"
                                style={{
                                    width: '100%',
                                    fontWeight: 'bold',
                                    marginTop: 15,
                                    backgroundColor: '#52c41a',
                                    borderColor: '#52c41a',
                                }}
                            >
                                Deploy Now
                            </Button>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Alert
                                message="Download Weights"
                                description="Securely export and preserve your model's learned parameters for future iterations or transfer learning."
                                type="warning"
                                showIcon
                                style={{ height: 130 }}
                            />
                            <Button
                                type="default"
                                icon={<CloudDownloadOutlined />}
                                size="large"
                                style={{
                                    width: '100%',
                                    fontWeight: 'bold',
                                    marginTop: 15,
                                    backgroundColor: '#faad14',
                                    color: 'white',
                                    borderColor: '#faad14',
                                }}
                            >
                                Download
                            </Button>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Alert
                                message="Refine Model"
                                description="Continuously improve your model's performance by initiating a new training cycle with enhanced data or parameters."
                                type="info"
                                showIcon
                                style={{ height: 130 }}
                            />
                            <Button
                                type="default"
                                icon={<HistoryOutlined />}
                                size="large"
                                style={{
                                    width: '100%',
                                    fontWeight: 'bold',
                                    marginTop: 15,
                                    backgroundColor: '#1890ff',
                                    color: 'white',
                                    borderColor: '#1890ff',
                                }}
                            >
                                Retrain Model
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Expandable Details Section */}
                <Card>
                    <Button
                        type="link"
                        icon={<BarChartOutlined />}
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        className="text-xl"
                    >
                        {isDetailsExpanded
                            ? 'Hide Details'
                            : 'Show Detailed Results'}
                    </Button>

                    {isDetailsExpanded && (
                        <Space
                            direction="vertical"
                            size="large"
                            className="w-full mt-4"
                        >
                            {/* Performance Charts */}
                            <Card title="Training Performance">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <LineGraph
                                                data={val_accGraph}
                                                label="Validation Accuracy Over Epochs"
                                            />
                                        </ResponsiveContainer>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <LineGraph
                                                data={val_lossGraph}
                                                label="Validation Loss Over Epochs"
                                            />
                                        </ResponsiveContainer>
                                    </Col>

                                </Row>
                            </Card>

                            {/* Detailed Metrics Table */}
                            <Card title="Comprehensive Metrics">
                                <Table
                                    columns={columns}
                                    dataSource={metrics}
                                    pagination={false}
                                />
                            </Card>
                        </Space>
                    )}
                </Card>
            </Space>
        </div>
    )
}

export default TrainResult
