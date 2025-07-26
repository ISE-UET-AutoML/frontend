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
    const { projectInfo } = useOutletContext()
    // console.log(projectInfo)
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const experimentName = searchParams.get('experimentName')
    const { id: projectId } = useParams()
    const modelId = searchParams.get('modelId')
    const [isDeploying, setIsDeploying] = useState(false)
    const [selectedOption, setSelectedOption] = useState('')
    const [currentStep, setCurrentStep] = useState(0)
    const [instanceURL, setInstanceURL] = useState(null)
    const [predictResult, setPredictResult] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState(null)
    const [isComplete, setIsComplete] = useState(false)

    // Added for enhanced UI
    const [shouldStopSimulation, setShouldStopSimulation] = useState(false)
    const [setupProgress, setSetupProgress] = useState(0)
    const [configProgress, setConfigProgress] = useState(0)
    const [optimizationProgress, setOptimizationProgress] = useState(0)
    const [networkProgress, setNetworkProgress] = useState(0)
    const [currentAction, setCurrentAction] = useState(
        'Initializing deployment environment'
    )
    const [deploymentLogs, setDeploymentLogs] = useState([])
    const [selectedDeployOption, setSelectedDeployOption] = useState(null)

    // For detailed progress modal
    const [completedTasks, setCompletedTasks] = useState([])
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0)

    // Thêm trạng thái mới để kiểm soát hiển thị chi tiết
    const [showDetails, setShowDetails] = useState(false);
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
                                    color: '#1890ff',
                                    cursor: 'pointer',
                                }}
                            />
                        </Tooltip>
                    </div>
                }
                open={isModalVisible}
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
            <>
                <Card style={{ marginBottom: '24px' }}>
                    <Row align="middle" style={{ marginBottom: '24px' }}>
                        <Col span={24}>
                            <Space align="center">
                                <RocketOutlined
                                    style={{
                                        fontSize: '28px',
                                        color: '#1890ff',
                                    }}
                                />
                                <Title level={3} style={{ margin: 0 }}>
                                    Deploy {experimentName}
                                </Title>
                            </Space>
                            <Paragraph
                                type="secondary"
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
                                                type="secondary"
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
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            style={{ fontWeight: 'bold' }}
                            onClick={startDeployment}
                            disabled={!selectedOption}
                        >
                            Deploy Now
                        </Button>
                    </Space>
                </Row>
            </>
        </div>
    )
}

export default DeployView
