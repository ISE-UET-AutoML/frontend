import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Card,
    Tag,
    Row,
    Col,
    Alert,
    Space,
    Statistic,
    Table,
    Button,
    Tooltip,
    Collapse,
    message
} from 'antd'

import {
    HistoryOutlined,
    CloudDownloadOutlined,
    TrophyOutlined,
    RocketOutlined,
    BarChartOutlined,
    InfoCircleOutlined,
    ExperimentOutlined,
} from '@ant-design/icons'

import * as mlServiceAPI from 'src/api/mlService'
import * as modelServiceAPI from 'src/api/model'

const { Panel } = Collapse;

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

function toNormalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

const ModelView = () => {
    const navigate = useNavigate()
    const { modelId, id } = useParams()
    const [model, setModel] = useState({})
    const [metrics, setMetrics] = useState([])
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(true)

    useEffect(() => {
        const fetchModel = async () => {
            try {
                const modelRes = await modelServiceAPI.getModelById(modelId)
                if (modelRes.status !== 200) {
                    throw new Error("Cannot find model")
                }
                const modelData = modelRes.data
                setModel(prev => modelData)
                console.log("model:", modelData)
                await fetchExperimentMetrics(modelData.experiment_id)
            }
            catch (error) {
                console.log("Error while getting model", error)
            }
        }

        const fetchExperimentMetrics = async (experimentId) => {
            setMetrics((prev) => [])
            try {
                const metricsRes = await mlServiceAPI.getFinalMetrics(experimentId)
                if (metricsRes.status !== 200) {
                    throw new Error("Cannot get metrics")
                }
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
        fetchModel()
    }, [])

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Space direction="vertical" size="large" className="w-full">
                {/* Key Metrics Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="shadow-md ">
                            <Statistic
                                title={`Model ${metrics[0] ? toNormalCase(metrics[0]?.metric) : "Null"} Score`}
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
                                title="Model Size"
                                value={model.metadata?.model_size || 0}
                                valueStyle={{
                                    color: '#f0b100',
                                }}
                                prefix={<CloudDownloadOutlined />}
                                suffix="MB"
                                precision={2}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="shadow-md ">
                            <Statistic
                                title="Model Name"
                                value={model.name}
                                prefix={<ExperimentOutlined />}
                                valueStyle={{
                                    color: '#2b7fff',
                                }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="Next Steps" className="rounded-xl shadow-sm">
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
                                        `/app/project/${id}/build/deployView?modelId=${modelId}`
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
                                onClick={async (e) => {
                                    e.preventDefault()
                                    const urlResponse = await mlServiceAPI.getModelUrl(modelId)
                                    if (urlResponse.status !== 200) {
                                        message.error("Failed to download model.")
                                    }
                                    const url = urlResponse.data
                                    window.location.href = url
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
                            : 'Show Detailed Model'}
                    </Button>

                    {isDetailsExpanded && (
                        <Space
                            direction="vertical"
                            size="large"
                            className="w-full mt-4"
                        >
                            {/* Input Data Display */}
                            <Card
                                title={
                                    <>
                                        Metadata{" "}
                                        <span
                                            style={{
                                                fontSize: "12px",
                                                color: "#888",
                                                fontStyle: "italic"
                                            }}
                                        >
                                            (Details about the model and its expected input, output)
                                        </span>
                                    </>
                                }
                            >
                                <Space direction="vertical" size="middle" className="w-full">
                                    {Object.entries(model.metadata || {}).map(([key, value]) => (
                                        <div key={key}>
                                            {/* Primary Tag */}
                                            <Tag
                                                color="blue"
                                                style={{
                                                    fontSize: "14px",
                                                    padding: "4px 8px",
                                                    minWidth: 120,
                                                    textAlign: "center",
                                                    display: "inline-block",
                                                }}
                                            >
                                                {key}
                                            </Tag>

                                            {/* Render based on type */}
                                            {Array.isArray(value) ? (
                                                <Space wrap style={{ marginLeft: 16 }}>
                                                    {value.map((item, idx) =>
                                                        typeof item === "object" && item !== null ? (
                                                            // 🆕 Handle array of objects
                                                            <Tag
                                                                key={idx}
                                                                style={{
                                                                    minWidth: 100,
                                                                    textAlign: "center",
                                                                    borderColor: item.color,          // border full color
                                                                    color: item.color,                // text full color
                                                                    backgroundColor: `${item.color}20` // hex + 20 = ~12% opacity
                                                                }}
                                                            >
                                                                {item.name} {item.label ? `(${item.label})` : ""}
                                                            </Tag>
                                                        ) : (
                                                            // Handle array of primitives
                                                            <Tag color="purple" key={idx}>
                                                                {item}
                                                            </Tag>
                                                        )
                                                    )}
                                                </Space>
                                            ) : typeof value === "object" && value !== null ? (
                                                // Handle nested objects
                                                <Collapse
                                                    ghost
                                                    size="small"
                                                    style={{
                                                        display: "inline-block",
                                                        verticalAlign: "top",
                                                    }}
                                                >
                                                    <Panel header="View Details" key="1">
                                                        <Space
                                                            direction="vertical"
                                                            size="small"
                                                            style={{
                                                                display: "inline-flex",
                                                                verticalAlign: "top",
                                                            }}
                                                        >
                                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                                <div
                                                                    key={subKey}
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 8,
                                                                    }}
                                                                >
                                                                    <Tag
                                                                        color="green"
                                                                        style={{
                                                                            minWidth: 100,
                                                                            textAlign: "center",
                                                                            marginRight: 8,
                                                                        }}
                                                                    >
                                                                        {subKey}
                                                                    </Tag>
                                                                    <span>{subValue?.toString() || <em>(empty)</em>}</span>
                                                                </div>
                                                            ))}
                                                        </Space>
                                                    </Panel>
                                                </Collapse>
                                            ) : (
                                                // Handle primitives
                                                <span style={{ marginLeft: 10 }}>
                                                    {value?.toString() || <em>(empty)</em>}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </Space>
                            </Card>

                            {/* Detailed Metrics Table */}
                            <Card
                                title={
                                    <>
                                        Model Metrics{" "}
                                        <span style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                                            (Detail about how well the model make predictions)
                                        </span>
                                    </>
                                }
                            >
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

export default ModelView
