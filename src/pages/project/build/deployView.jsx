import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useOutletContext, useNavigate, useParams } from 'react-router-dom'
import {
    Steps,
    Card,
    Row,
    Col,
    Typography,
    Space,
    Statistic,
    Button,
    Badge,
    Tag,
    Modal,
    Tooltip,
    message,
    Progress,
    Timeline,
    Divider,
    Input,
} from 'antd'
import {
    RocketOutlined,
    ApiOutlined,
    DatabaseOutlined,
    ThunderboltOutlined,
    CloudDownloadOutlined,
    SettingOutlined,
    LineChartOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    CloudServerOutlined,
    CodeOutlined,
    NodeIndexOutlined,
    CloudUploadOutlined,
    LinkOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import { validateFiles } from 'src/utils/file'
import * as experimentAPI from 'src/api/experiment'
import * as modelAPI from 'src/api/model'
import * as mlServiceAPI from 'src/api/mlService'
import * as resourceAPI from 'src/api/resource'
import config from './config'
import { PATHS } from 'src/constants/paths'

const { Step } = Steps
const { Title, Text, Paragraph } = Typography

const steps = [
    {
        title: 'Creating instance for deployment',
        icon: <SettingOutlined />,
    },
]

const AnimatedCard = ({ children, onClick, isSelected }) => {
    const [isHovered, setIsHovered] = useState(false)
    const styles = useSpring({
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered
            ? '0 8px 16px rgba(0,0,0,0.1)'
            : '0 2px 8px rgba(0,0,0,0.05)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: isSelected ? '#1890ff' : isHovered ? '#40a9ff' : '#f0f0f0',
        config: { tension: 300, friction: 20 },
    })

    return (
        <animated.div
            style={{
                ...styles,
                borderRadius: '8px',
                cursor: 'pointer',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {children}
        </animated.div>
    )
}

const DeployView = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const { id: projectId } = useParams()
    const modelId = searchParams.get('modelId')
    const [isDeploying, setIsDeploying] = useState(false)
    const [selectedOption, setSelectedOption] = useState('')
    const [currentStep, setCurrentStep] = useState(0)
    const [isModalVisible, setIsModalVisible] = useState(false)

    // Tính toán Progress tổng
    const deployOptions = [
        {
            id: 'realtime',
            title: 'Realtime Inference',
            description: 'Deploy for immediate, real-time predictions',
            icon: (
                <ThunderboltOutlined
                    style={{ fontSize: '32px', color: '#faad14' }}
                />
            ),
            tags: ['Low Latency', 'High Availability', 'Auto Scaling'],
            stats: {
                latency: '< 100ms',
                uptime: '99.99%',
                scalability: 'Automatic',
            },
            color: '#faad14',
            badge: 'RECOMMENDED',
        },
        {
            id: 'async',
            title: 'Asynchronous Processing',
            description: 'Optimal for handling large batch requests',
            icon: (
                <ApiOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
            ),
            tags: ['High Throughput', 'Cost Effective', 'Durable'],
            stats: {
                throughput: '10K req/s',
                durability: '99.999%',
                cost: 'Medium',
            },
            color: '#52c41a',
        },
        {
            id: 'batch',
            title: 'Batch Transform',
            description: 'Process large datasets efficiently',
            icon: (
                <DatabaseOutlined
                    style={{ fontSize: '32px', color: '#1890ff' }}
                />
            ),
            tags: ['Large Scale', 'Cost Optimized', 'Scheduled'],
            stats: {
                capacity: 'Unlimited',
                efficiency: '95%',
                schedule: 'Flexible',
            },
            color: '#1890ff',
        },
        {
            id: 'serverless',
            title: 'Serverless Deployment',
            description: 'Pay-per-use with zero infrastructure management',
            icon: (
                <CloudDownloadOutlined
                    style={{ fontSize: '32px', color: '#722ed1' }}
                />
            ),
            tags: ['Zero Maintenance', 'Auto Scaling', 'Cost Efficient'],
            stats: {
                scaling: 'Automatic',
                maintenance: 'Zero',
                billing: 'Per Request',
            },
            color: '#722ed1',
        },
    ]

    const startDeployment = async () => {
        try {
            setIsModalVisible(true)
            const createInstanceRequest = await resourceAPI.createInstanceForDeploy()
            console.log("Create instance payload:", createInstanceRequest)
            if (createInstanceRequest.status !== 200) {
                throw new Error("Failed to create instance.")
            }
            const instanceData = createInstanceRequest.data
            const deployRequest = await modelAPI.deployModel(
                modelId,
                instanceData
            )
            console.log(deployRequest)
            if (deployRequest.status !== 200) {
                throw new Error("Failed to deploy model")
            }
            navigate(PATHS.SETTING_UP_DEPLOY(projectId, deployRequest.data?.model_deploy.id, deployRequest.data?.model_deploy.model_id))
        }
        catch (e) {
            console.log(e)
            handleCancel()
        }
    }

    const handleCancel = () => {
        setIsDeploying(false)
        setSelectedOption('')
        setCurrentStep(0)
    }

    return (
        <>
            <style>{`
                .dark-build-page {
                    background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
                    min-height: 100vh;
                    padding: 24px;
                }
                
                .dark-build-card {
                    background: linear-gradient(135deg, rgba(15, 32, 39, 0.8) 0%, rgba(32, 58, 67, 0.6) 50%, rgba(44, 83, 100, 0.8) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                
                .dark-build-title {
                    background: linear-gradient(135deg, #00D4FF 0%, #65FFA0 50%, #FFD700 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                }
                
                .dark-build-text {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-text-strong {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-button {
                    background: linear-gradient(135deg, #00D4FF 0%, #65FFA0 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3) !important;
                }
                
                .dark-build-button:hover {
                    background: linear-gradient(135deg, #65FFA0 0%, #00D4FF 100%) !important;
                    box-shadow: 0 6px 20px rgba(101, 255, 160, 0.4) !important;
                    transform: translateY(-2px) !important;
                }
                
                .dark-build-button:disabled {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                
                .dark-build-deploy-card {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(101, 255, 160, 0.1) 100%);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                .dark-build-deploy-card:hover {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(101, 255, 160, 0.2) 100%);
                    border-color: #00D4FF;
                    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
                    transform: translateY(-2px);
                }
                
                .dark-build-deploy-card.selected {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(101, 255, 160, 0.3) 100%);
                    border-color: #65FFA0;
                    box-shadow: 0 8px 24px rgba(101, 255, 160, 0.3);
                }
                
                .dark-build-modal .ant-modal-content {
                    background: linear-gradient(135deg, rgba(15, 32, 39, 0.95) 0%, rgba(32, 58, 67, 0.95) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                }
                
                .dark-build-modal .ant-modal-header {
                    background: transparent;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .dark-build-modal .ant-modal-title {
                    color: white;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                }
                
                .dark-build-modal .ant-modal-body {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .dark-build-steps .ant-steps-item-title {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-steps .ant-steps-item-description {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-steps .ant-steps-item-icon {
                    background: linear-gradient(135deg, #00D4FF 0%, #65FFA0 100%) !important;
                    border-color: #00D4FF !important;
                }
                
                .dark-build-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: linear-gradient(135deg, #65FFA0 0%, #FFD700 100%) !important;
                    border-color: #65FFA0 !important;
                }
            `}</style>
            <div className="dark-build-page">
                <div style={{ margin: '0 auto' }}>
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
                                            color: '#00D4FF',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        }
                        open={isModalVisible}
                        footer={null}
                        width={1000}
                        className="dark-build-modal"
                    >
                <Card className="dark-build-card preparation-card">
                    <Steps current={currentStep} className="dark-build-steps">
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
            <>
                <Card className="dark-build-card" style={{ marginBottom: '24px' }}>
                    <Row align="middle" style={{ marginBottom: '24px' }}>
                        <Col span={24}>
                            <Space align="center">
                                <RocketOutlined
                                    style={{
                                        fontSize: '28px',
                                        color: '#00D4FF',
                                    }}
                                />
                                <Title level={3} className="dark-build-title" style={{ margin: 0 }}>
                                    Deploy Model {modelId}
                                </Title>
                            </Space>
                            <Paragraph
                                className="dark-build-text"
                                style={{
                                    margin: '16px 0 0',
                                    fontSize: '16px',
                                }}
                            >
                                Choose your deployment option and launch
                                your application with our optimized
                                infrastructure
                            </Paragraph>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        {deployOptions.map((option) => (
                            <Col xs={24} md={12} key={option.id}>
                                <AnimatedCard
                                    isSelected={
                                        selectedOption === option.id
                                    }
                                    onClick={() =>
                                        setSelectedOption(option.id)
                                    }
                                >
                                    <Card
                                        className={`dark-build-deploy-card ${selectedOption === option.id ? 'selected' : ''}`}
                                        bordered={false}
                                        styles={{ padding: '24px' }}
                                    >
                                        <Space
                                            direction="vertical"
                                            size="middle"
                                            style={{ width: '100%' }}
                                        >
                                            <Row
                                                justify="space-between"
                                                align="middle"
                                            >
                                                <Space>
                                                    <div
                                                        style={{
                                                            background: `${option.color}10`,
                                                            padding: '12px',
                                                            borderRadius:
                                                                '8px',
                                                        }}
                                                    >
                                                        {option.icon}
                                                    </div>
                                                    <Title
                                                        level={4}
                                                        className="dark-build-text-strong"
                                                        style={{
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {option.title}
                                                    </Title>
                                                </Space>
                                                {option.badge && (
                                                    <Badge
                                                        count={option.badge}
                                                        style={{
                                                            backgroundColor:
                                                                option.color,
                                                            fontSize:
                                                                '12px',
                                                        }}
                                                    />
                                                )}
                                            </Row>

                                            <Text
                                                className="dark-build-text"
                                                style={{ fontSize: '14px' }}
                                            >
                                                {option.description}
                                            </Text>

                                            <Space wrap>
                                                {option.tags.map((tag) => (
                                                    <Tag
                                                        color={option.color}
                                                        key={tag}
                                                    >
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </Space>

                                            <Row gutter={16}>
                                                {Object.entries(
                                                    option.stats
                                                ).map(([key, value]) => (
                                                    <Col span={8} key={key}>
                                                        <Statistic
                                                            title={
                                                                key
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase() +
                                                                key.slice(1)
                                                            }
                                                            value={value}
                                                            valueStyle={{
                                                                fontSize:
                                                                    '14px',
                                                                color: option.color,
                                                            }}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Space>
                                    </Card>
                                </AnimatedCard>
                            </Col>
                        ))}
                    </Row>
                </Card>

                <Row justify="center">
                    <Space>
                        <Button
                            type="default"
                            size="large"
                            onClick={handleCancel}
                            className="dark-build-button"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            style={{ fontWeight: 'bold' }}
                            onClick={startDeployment}
                            disabled={!selectedOption}
                            className="dark-build-button"
                        >
                            Deploy Now
                        </Button>
                    </Space>
                </Row>
            </>
            </div>
        </div>
        </>
    )
}

export default DeployView
