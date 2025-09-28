import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
const { Title, Text, Paragraph } = Typography
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
    message,
    Progress,
    Timeline,
    Divider,
    Input,
    Spin,
} from 'antd'
import {
    ExperimentOutlined,
    LineChartOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    DatabaseOutlined,
    BarChartOutlined,
    DashboardOutlined,
    CalendarOutlined,
    HourglassOutlined,
    RadarChartOutlined,
    SettingOutlined,
    CloudDownloadOutlined,
    LoadingOutlined,
    CloseCircleOutlined,
    RocketOutlined,
} from '@ant-design/icons'
import * as deployAPI from 'src/api/deploy'
import { PATHS } from 'src/constants/paths'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useSpring, animated } from '@react-spring/web'
const settingUpProgress = [
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Initialize Virtual Environment
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Set up a clean Python virtual environment to isolate project
                dependencies and prevent conflicts.
            </span>
        ),
    },
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Updating Operating System
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Update system packages and apply the latest patches to
                ensure compatibility and security.
            </span>
        ),
    },
    {
        title: (
            <span style={{ color: 'var(--text)' }}>Installing Tools</span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Install essential development tools such as compilers,
                package managers, and utilities.
            </span>
        ),
    },
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Installing Dependencies
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Download and configure required libraries and frameworks
                from the requirements list.
            </span>
        ),
    },
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Cleaning up conflicting packages
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Uninstall or adjust conflicting packages to ensure smooth
                execution of the environment.
            </span>
        ),
    },
]

const selectingInstanceProgress = [
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Querying Machine
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Searching for a suitable machine to deploy your application efficiently.
            </span>
        ),
    },
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Initialize SSH Protocol
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Set up a secure SSH connection to access and manage the remote machine.
            </span>
        ),
    },
    {
        title: (
            <span style={{ color: 'var(--text)' }}>Installing Tools</span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Install necessary development tools and utilities required for deployment.
            </span>
        ),
    }
];


const downloadModelProgress = [
    {
        title: (
            <span style={{ color: 'var(--text)' }}>
                Downloading Model from Cloud Storage
            </span>
        ),
        description: (
            <span style={{ color: '#94a3b8' }}>
                Retrieving the required model files from cloud storage to your local or remote environment.
            </span>
        ),
    }
];


export default function DeploySettingUpView() {
    const getCurrentStep = (status) => {
        switch (status) {
            case 'CREATING_INSTANCE':
                return 0
            case 'SETTING_UP':
                return 1
            case 'DOWNLOADING_MODEL':
                return 2
            default:
                return 0
        }
    }

    const getProgressSteps = (status) => {
        switch (status) {
            case 'CREATING_INSTANCE':
                return selectingInstanceProgress
            case 'SETTING_UP':
                return settingUpProgress
            case 'DOWNLOADING_MODEL':
                return downloadModelProgress
            default:
                return []
        }
    }
    const { theme } = useTheme()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const deployId = searchParams.get('deployId')
    const { id: projectId } = useParams()
    const navigate = useNavigate()
    const [deployStatus, setDeployStatus] = useState("CREATING_INSTANCE")
    const [currentStep, setCurrentStep] = useState(getCurrentStep(deployStatus))
    const [currentSettingUpStep, setCurrentSettingUpStep] = useState(-1)

    useEffect(() => {
        if (!deployId) return;

        const fetchDeployData = async () => {
            try {
                const deployModelRes = await deployAPI.getDeployData(deployId)
                console.log("Current status:", deployModelRes.data)
                setDeployStatus(deployModelRes.data?.status || 'CREATING_INSTANCE')
                setCurrentStep(getCurrentStep(deployModelRes.data?.status || 0))
                if (deployModelRes.data?.status != deployStatus) {
                    setCurrentSettingUpStep(prev => 0);
                }
                else {
                    setCurrentSettingUpStep(prev => prev + 1);
                }
                if (deployModelRes.data.status === 'ONLINE') {
                    navigate(PATHS.MODEL_DEPLOY_VIEW(projectId, deployId))
                    return
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchDeployData();
        const interval = setInterval(fetchDeployData, 30000);
        return () => clearInterval(interval);
    }, [deployId]);


    return (
        <>
            <style>{`
                body, html {
                    background-color: var(--surface) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
            <div
                className="min-h-screen relative"
                style={{ background: 'var(--surface)' }}
            >
                {theme === 'dark' && (
                    <BackgroundShapes
                        width="1280px"
                        height="1200px"
                        shapes={[
                            {
                                id: 'trainingBlue',
                                shape: 'circle',
                                size: '600px',
                                gradient: {
                                    type: 'radial',
                                    shape: 'ellipse',
                                    colors: [
                                        '#5C8DFF 0%',
                                        '#5C8DFF 35%',
                                        'transparent 75%',
                                    ],
                                },
                                opacity: 0.35,
                                blur: '240px',
                                position: { top: '120px', right: '-200px' },
                                transform: 'none',
                            },
                            {
                                id: 'trainingCyan',
                                shape: 'rounded',
                                size: '500px',
                                gradient: {
                                    type: 'radial',
                                    shape: 'circle',
                                    colors: [
                                        '#40FFFF 0%',
                                        '#40FFFF 45%',
                                        'transparent 80%',
                                    ],
                                },
                                opacity: 0.25,
                                blur: '200px',
                                position: { top: '300px', left: '-180px' },
                                transform: 'none',
                            },
                            {
                                id: 'trainingWarm',
                                shape: 'rounded',
                                size: '450px',
                                gradient: {
                                    type: 'radial',
                                    shape: 'circle',
                                    colors: [
                                        '#FFAF40 0%',
                                        '#FFAF40 55%',
                                        'transparent 90%',
                                    ],
                                },
                                opacity: 0.2,
                                blur: '180px',
                                position: { bottom: '100px', right: '20%' },
                                transform: 'none',
                            },
                        ]}
                    />
                )}
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
                            <Title
                                level={5}
                                style={{
                                    margin: 0,
                                    color: 'var(--text)',
                                    fontFamily:
                                        'Poppins, sans-serif',
                                }}
                            >
                                <RocketOutlined
                                    style={{
                                        color: 'var(--accent-text)',
                                        fontSize: '20px',
                                        marginRight: '10px'
                                    }}
                                />{' '}
                                {'Deployment Preparation'}
                            </Title>
                            <Steps
                                current={currentStep}
                                items={[
                                    {
                                        title: (
                                            <span
                                                style={{ color: 'var(--text)' }}
                                            >
                                                Creating Instance
                                            </span>
                                        ),
                                        icon:
                                            currentStep !== 0 ? (
                                                <DatabaseOutlined />
                                            ) : (
                                                <LoadingOutlined />
                                            ),
                                        description: (
                                            <span style={{ color: '#94a3b8' }}>
                                                Selecting suitable machine for
                                                you
                                            </span>
                                        ),
                                    },
                                    {
                                        title: (
                                            <span
                                                style={{ color: 'var(--text)' }}
                                            >
                                                Downloading Dependencies
                                            </span>
                                        ),
                                        icon:
                                            currentStep !== 1 ? (
                                                <SettingOutlined />
                                            ) : (
                                                <LoadingOutlined />
                                            ),
                                        description: (
                                            <span style={{ color: '#94a3b8' }}>
                                                Setting up your machine
                                            </span>
                                        ),
                                    },
                                    {
                                        title: (
                                            <span
                                                style={{ color: 'var(--text)' }}
                                            >
                                                Downloading Model
                                            </span>
                                        ),
                                        icon:
                                            currentStep !== 2 ? (
                                                <CloudDownloadOutlined />
                                            ) : (
                                                <LoadingOutlined />
                                            ),
                                        description: (
                                            <span style={{ color: '#94a3b8' }}>
                                                Fetching model from cloud storage
                                            </span>
                                        ),
                                    }
                                ]}
                            />
                            <Card
                                title={
                                    <Title
                                        level={5}
                                        style={{
                                            margin: 0,
                                            color: 'var(--text)',
                                            fontFamily:
                                                'Poppins, sans-serif',
                                        }}
                                    >
                                        <SettingOutlined
                                            style={{
                                                color: 'var(--accent-text)',
                                                marginRight: '10px'
                                            }}
                                        />{' '}
                                        {'Current Step Progress'}
                                    </Title>
                                }
                                className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{
                                    background: 'var(--card-gradient)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                <Steps
                                    progressDot={(
                                        dot,
                                        { status, index }
                                    ) => {
                                        if (
                                            index === currentSettingUpStep
                                        ) {
                                            return <Spin size="small" />
                                        }
                                        return dot
                                    }}
                                    current={currentSettingUpStep}
                                    direction="vertical"
                                    items={getProgressSteps(deployStatus)}
                                />
                            </Card>
                        </Space>
                    </animated.div>
                </div>
            </div>
        </>
    )
}
