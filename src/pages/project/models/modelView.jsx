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
import BackgroundShapes from 'src/components/landing/BackgroundShapes'

const { Panel } = Collapse;

// Performance Metrics Configuration
const getAccuracyStatus = (score) => {
    if (score >= 0.9) {
        return <Tag style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none', color: 'white', fontFamily: 'Poppins, sans-serif' }}>Excellent</Tag>
    }
    else if (score >= 0.7) {
        return <Tag style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', border: 'none', color: 'white', fontFamily: 'Poppins, sans-serif' }}>Good</Tag>
    }
    else if (score >= 0.6) {
        return <Tag style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', border: 'none', color: 'white', fontFamily: 'Poppins, sans-serif' }}>Medium</Tag>
    }
    else {
        return <Tag style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', border: 'none', color: 'white', fontFamily: 'Poppins, sans-serif' }}>Bad</Tag>
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
                <span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>{text}</span>{' '}
                <InfoCircleOutlined
                    style={{ color: '#60a5fa', marginLeft: 5 }}
                />
            </Tooltip>
        ),
    },
    {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        render: (text) => (
            <span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>{text}</span>
        ),
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
						value: parseFloat(metricsRes.data[key].score).toFixed(
							2
						),
						description: metricsRes.data[key].description,
						status: getAccuracyStatus(metricsRes.data[key].score),
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
        <>
            <style>{`
                body, html {
                    background-color: #01000A !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .dark-table .ant-table {
                    background: transparent !important;
                    color: #e2e8f0 !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .dark-table .ant-table-thead > tr > th {
                    background: rgba(51, 65, 85, 0.4) !important;
                    color: #e2e8f0 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                .dark-table .ant-table-tbody > tr > td {
                    background: rgba(15, 23, 42, 0.3) !important;
                    color: #e2e8f0 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .dark-table .ant-table-tbody > tr:hover > td {
                    background: rgba(51, 65, 85, 0.5) !important;
                }
                .dark-table .ant-empty-description {
                    color: #94a3b8 !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .ant-collapse-ghost > .ant-collapse-item {
                    border: none !important;
                }
                .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
                    background: rgba(51, 65, 85, 0.3) !important;
                    color: #e2e8f0 !important;
                    border-radius: 8px !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content {
                    background: rgba(15, 23, 42, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-top: none !important;
                    border-radius: 0 0 8px 8px !important;
                }
                .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
                    padding: 12px 16px !important;
                }
            `}</style>
            <div className="min-h-screen bg-[#01000A] relative">
                <BackgroundShapes 
                    width="1280px" 
                    height="1200px"
                    shapes={[
                        {
                            id: 'modelBlue',
                            shape: 'circle',
                            size: '550px',
                            gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 40%', 'transparent 80%'] },
                            opacity: 0.3,
                            blur: '220px',
                            position: { top: '180px', right: '-150px' },
                            transform: 'none'
                        },
                        {
                            id: 'modelCyan',
                            shape: 'rounded',
                            size: '480px',
                            gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 50%', 'transparent 85%'] },
                            opacity: 0.25,
                            blur: '190px',
                            position: { top: '350px', left: '-160px' },
                            transform: 'none'
                        },
                        {
                            id: 'modelWarm',
                            shape: 'rounded',
                            size: '420px',
                            gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 60%', 'transparent 90%'] },
                            opacity: 0.2,
                            blur: '170px',
                            position: { bottom: '150px', right: '25%' },
                            transform: 'none'
                        }
                    ]}
                />
                <div className="relative z-10 p-6">
                    <Space direction="vertical" size="large" className="w-full">
                {/* Key Metrics Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card 
                            className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        >
                            <Statistic
                                title={<span style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}>{`Model ${metrics[0] ? toNormalCase(metrics[0]?.metric) : "Null"} Score`}</span>}
                                value={metrics[0]?.value * 100 || 0}
                                precision={2}
                                prefix={<TrophyOutlined style={{ color: '#10b981' }} />}
                                suffix="%"
                                valueStyle={{
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card 
                            className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        >
                            <Statistic
                                title={<span style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}>Model Size</span>}
                                value={model.metadata?.model_size || 0}
                                valueStyle={{
                                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 'bold'
                                }}
                                prefix={<CloudDownloadOutlined style={{ color: '#f59e0b' }} />}
                                suffix="MB"
                                precision={2}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card 
                            className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        >
                            <Statistic
                                title={<span style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}>Model Name</span>}
                                value={model.name}
                                prefix={<ExperimentOutlined style={{ color: '#3b82f6' }} />}
                                valueStyle={{
                                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card 
                    title={<span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Next Steps</span>}
                    className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Alert
                                message={<span style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Deploy Model</span>}
                                description={<span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Instantly transform your trained model into a production-ready solution for real-world predictions.</span>}
                                type="success"
                                showIcon
                                style={{ 
                                    height: 130,
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '8px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
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
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    border: 'none',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                                className="hover:shadow-lg transition-all duration-300"
                            >
                                Deploy Now
                            </Button>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Alert
                                message={<span style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Download Weights</span>}
                                description={<span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Securely export and preserve your model's learned parameters for future iterations or transfer learning.</span>}
                                type="warning"
                                showIcon
                                style={{ 
                                    height: 130,
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1))',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '8px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                            <Button
                                type="default"
                                icon={<CloudDownloadOutlined />}
                                size="large"
                                style={{
                                    width: '100%',
                                    fontWeight: 'bold',
                                    marginTop: 15,
                                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                    color: 'white',
                                    border: 'none',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                                className="hover:shadow-lg transition-all duration-300"
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
                                message={<span style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Refine Model</span>}
                                description={<span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Continuously improve your model's performance by initiating a new training cycle with enhanced data or parameters.</span>}
                                type="info"
                                showIcon
                                style={{ 
                                    height: 130,
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.1))',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '8px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                            <Button
                                type="default"
                                icon={<HistoryOutlined />}
                                size="large"
                                style={{
                                    width: '100%',
                                    fontWeight: 'bold',
                                    marginTop: 15,
                                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                    color: 'white',
                                    border: 'none',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                                className="hover:shadow-lg transition-all duration-300"
                            >
                                Retrain Model
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Expandable Details Section */}
                <Card
                    className="border-0 backdrop-blur-sm shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                >
                    <Button
                        type="link"
                        icon={<BarChartOutlined style={{ color: '#60a5fa' }} />}
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        className="text-xl"
                        style={{
                            color: '#e2e8f0',
                            fontFamily: 'Poppins, sans-serif'
                        }}
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
                                        <span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Metadata</span>{" "}
                                        <span
                                            style={{
                                                fontSize: "12px",
                                                color: "#94a3b8",
                                                fontStyle: "italic",
                                                fontFamily: 'Poppins, sans-serif'
                                            }}
                                        >
                                            (Details about the model and its expected input, output)
                                        </span>
                                    </>
                                }
                                className="border-0 backdrop-blur-sm"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.3) 0%, rgba(15, 23, 42, 0.3) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                <Space direction="vertical" size="middle" className="w-full">
                                    {Object.entries(model.metadata || {}).map(([key, value]) => (
                                        <div key={key}>
                                            {/* Primary Tag */}
                                            <Tag
                                                style={{
                                                    fontSize: "14px",
                                                    padding: "4px 8px",
                                                    minWidth: 120,
                                                    textAlign: "center",
                                                    display: "inline-block",
                                                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontFamily: 'Poppins, sans-serif'
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
                                                            <Tag 
                                                                key={idx}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                                                    border: 'none',
                                                                    color: 'white',
                                                                    fontFamily: 'Poppins, sans-serif'
                                                                }}
                                                            >
                                                                {item}
                                                            </Tag>
                                                        )
                                                    )}
                                                </Space>
                                            ) : typeof value === "object" && value !== null ? (
                                                <Collapse
                                                    ghost
                                                    size="small"
                                                    style={{
                                                        display: "inline-block",
                                                        verticalAlign: "top",
                                                        fontFamily: 'Poppins, sans-serif'
                                                    }}
                                                >
                                                    <Panel 
                                                        header={<span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>View Details</span>} 
                                                        key="1"
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            borderRadius: '8px'
                                                        }}
                                                    >
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
                                                                        style={{
                                                                            minWidth: 100,
                                                                            textAlign: "center",
                                                                            marginRight: 8,
                                                                            background: 'linear-gradient(135deg, #10b981, #34d399)',
                                                                            border: 'none',
                                                                            color: 'white',
                                                                            fontFamily: 'Poppins, sans-serif'
                                                                        }}
                                                                    >
                                                                        {subKey}
                                                                    </Tag>

                                                                    {Array.isArray(subValue) ? (
                                                                        // Handle array values
                                                                        <Space wrap style={{ marginLeft: 16 }}>
                                                                            {subValue.map((item, idx) =>
                                                                                typeof item === "object" && item !== null ? (
                                                                                    // Array of objects
                                                                                    <Tag
                                                                                        key={idx}
                                                                                        style={{
                                                                                            minWidth: 100,
                                                                                            textAlign: "center",
                                                                                            borderColor: item.color,
                                                                                            color: item.color,
                                                                                            backgroundColor: `${item.color}20`,
                                                                                        }}
                                                                                    >
                                                                                        {item.name} {item.label ? `(${item.label})` : ""}
                                                                                    </Tag>
                                                                                ) : (
                                                                                    // Array of primitives
                                                                                    <Tag 
                                                                                        key={idx}
                                                                                        style={{
                                                                                            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                                                                            border: 'none',
                                                                                            color: 'white',
                                                                                            fontFamily: 'Poppins, sans-serif'
                                                                                        }}
                                                                                    >
                                                                                        {item}
                                                                                    </Tag>
                                                                                )
                                                                            )}
                                                                        </Space>
                                                                    ) : (
                                                                        // Primitive values
                                                                        <span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>
                                                                            {subValue?.toString() || <em style={{ color: '#94a3b8' }}>(empty)</em>}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </Space>
                                                    </Panel>
                                                </Collapse>
                                            ) : (
                                                // Handle primitives
                                                <span style={{ marginLeft: 10, color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>
                                                    {value?.toString() || <em style={{ color: '#94a3b8' }}>(empty)</em>}
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
                                        <span style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}>Model Metrics</span>{" "}
                                        <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", fontFamily: 'Poppins, sans-serif' }}>
                                            (Detail about how well the model make predictions)
                                        </span>
                                    </>
                                }
                                className="border-0 backdrop-blur-sm"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.3) 0%, rgba(15, 23, 42, 0.3) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                <Table
                                    columns={columns}
                                    dataSource={metrics}
                                    pagination={false}
                                    style={{
                                        background: 'transparent',
                                        fontFamily: 'Poppins, sans-serif'
                                    }}
                                    className="dark-table"
                                />
                            </Card>
                        </Space>
                    )}
                </Card>
                    </Space>
                </div>
            </div>
        </>
    )
}

export default ModelView
