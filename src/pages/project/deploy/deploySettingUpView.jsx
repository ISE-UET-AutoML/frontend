import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
} from 'antd'
import {
    SettingOutlined,
    LineChartOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    CloudServerOutlined,
    CodeOutlined,
    NodeIndexOutlined,
    LinkOutlined,
} from '@ant-design/icons'
import * as deployAPI from 'src/api/deploy'
import useDeployStore from 'src/stores/deployStore'
import { PATHS } from 'src/constants/paths'

const { Text } = Typography

const AnimatedProgressBar = ({ percent, title, subtitle, color }) => {
    return (
        <Card
            style={{
                marginBottom: '16px',
                background: `linear-gradient(to right, ${color}10, ${color}05)`,
                border: `1px solid ${color}30`,
                borderRadius: '8px',
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space align="center" style={{ marginBottom: '4px' }}>
                    <Text strong>{title}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {subtitle}
                    </Text>
                </Space>
                <Progress
                    percent={percent}
                    status="active"
                    strokeColor={{
                        '0%': color,
                        '100%': color + 'aa',
                    }}
                    trailColor={color + '20'}
                />
            </Space>
        </Card>
    )
}

export default function DeploySettingUpView() {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const deployId = searchParams.get('deployId')
    const modelId = searchParams.get('modelId')
    const { id: projectId } = useParams()
    const navigate = useNavigate()
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

    // For detailed progress modal
    const [completedTasks, setCompletedTasks] = useState([])
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0)

    // Thêm trạng thái mới để kiểm soát hiển thị chi tiết
    const [showDetails, setShowDetails] = useState(false);
    const totalProgress = Math.floor(
        (setupProgress + configProgress + optimizationProgress + networkProgress) / 4
    );

    const { deployingTasks, startDeployTask } = useDeployStore()
    const deployingTask = deployingTasks[deployId]

    // Detailed deployment task structure
    const deploymentTasks = [
        {
            id: 'environment-setup',
            title: 'Environment Setup',
            description: 'Preparing the runtime environment for your model',
            icon: <CloudServerOutlined />,
            color: '#1890ff',
            progress: setupProgress,
            status:
                setupProgress === 100
                    ? 'completed'
                    : setupProgress > 0
                        ? 'in-progress'
                        : 'pending',
            setProgress: setSetupProgress,
            subtasks: [
                {
                    id: 'init-vm',
                    title: 'Initializing virtual machine',
                    status: 'pending',
                },
                {
                    id: 'config-network',
                    title: 'Configuring network settings',
                    status: 'pending',
                },
                {
                    id: 'setup-security',
                    title: 'Setting up security protocols',
                    status: 'pending',
                },
                {
                    id: 'verify-environment',
                    title: 'Verifying environment configuration',
                    status: 'pending',
                },
            ],
        },
        {
            id: 'dependencies-installation',
            title: 'Dependencies Installation',
            description: 'Installing required packages and libraries',
            icon: <CodeOutlined />,
            color: '#52c41a',
            progress: configProgress,
            status:
                configProgress === 100
                    ? 'completed'
                    : configProgress > 0
                        ? 'in-progress'
                        : 'pending',
            setProgress: setConfigProgress,
            subtasks: [
                {
                    id: 'fetch-manifest',
                    title: 'Fetching package manifests',
                    status: 'pending',
                },
                {
                    id: 'install-core',
                    title: 'Installing core libraries',
                    status: 'pending',
                },
                {
                    id: 'install-extras',
                    title: 'Installing additional dependencies',
                    status: 'pending',
                },
                {
                    id: 'setup-env-vars',
                    title: 'Setting up environment variables',
                    status: 'pending',
                },
            ],
        },
        {
            id: 'model-configuration',
            title: 'Model Configuration',
            description: 'Preparing your model for deployment',
            icon: <NodeIndexOutlined />,
            color: '#faad14',
            progress: optimizationProgress,
            status:
                optimizationProgress === 100
                    ? 'completed'
                    : optimizationProgress > 0
                        ? 'in-progress'
                        : 'pending',
            setProgress: setOptimizationProgress,
            subtasks: [
                {
                    id: 'load-weights',
                    title: 'Loading model weights',
                    status: 'pending',
                },
                {
                    id: 'configure-inference',
                    title: 'Configuring inference parameters',
                    status: 'pending',
                },
                {
                    id: 'optimize-performance',
                    title: 'Optimizing for performance',
                    status: 'pending',
                },
                {
                    id: 'validate-model',
                    title: 'Validating model configuration',
                    status: 'pending',
                },
            ],
        },
        {
            id: 'api-endpoint-setup',
            title: 'API Endpoint Setup',
            description: 'Creating secure API endpoints for your model',
            icon: <LinkOutlined />,
            color: '#722ed1',
            progress: networkProgress,
            status:
                networkProgress === 100
                    ? 'completed'
                    : networkProgress > 0
                        ? 'in-progress'
                        : 'pending',
            setProgress: setNetworkProgress,
            subtasks: [
                {
                    id: 'config-routes',
                    title: 'Configuring API routes',
                    status: 'pending',
                },
                {
                    id: 'setup-auth',
                    title: 'Setting up authentication',
                    status: 'pending',
                },
                {
                    id: 'enable-cors',
                    title: 'Enabling CORS policies',
                    status: 'pending',
                },
                {
                    id: 'test-endpoint',
                    title: 'Testing endpoint connectivity',
                    status: 'pending',
                },
            ],
        },
    ]

    const startDeployment = () => {
        setShouldStopSimulation(false)
        // Reset all progress trackers
        setSetupProgress(0)
        setConfigProgress(0)
        setOptimizationProgress(0)
        setNetworkProgress(0)
        setCompletedTasks([])
        setCurrentTaskIndex(0)
        // Add initial deployment log
        addDeploymentLog('Initializing deployment process', 'info')
        addDeploymentLog(
            `Selected deployment option: null`,
            'info'
        )
        try {
            // Simulate different stages of deployment with progress updates
            simulateDeploymentProgress()
            addDeploymentLog(
                `Create instance for deployment successfully.`,
                'success'
            )
        } catch (error) {
            message.error('Failed to start deployment: ' + error.message, 5)
            addDeploymentLog(
                `Failed to start deployment: ${error.message}`,
                'error'
            )
        }
    }

    const updateDeployProgress = () => {
        // Thêm biến đếm số lần gặp lỗi liên tiếp
        let consecutiveErrorCount = 0;
        try {
            const deployInfo = deployingTask
            console.log("Deploy Status:", deployInfo)
            if (deployInfo.status === 'ONLINE') {
                message.success('Deployment completed successfully!', 5)
                setShouldStopSimulation(true)
                setCurrentTaskIndex(deploymentTasks.length - 1)
                setCurrentAction('Deploy Completely')
                addDeploymentLog(
                    'Deployment successfully completed',
                    'success'
                )
                addDeploymentLog(
                    'Model is now online and ready for predictions',
                    'success'
                )
                navigate(PATHS.MODEL_DEPLOY_VIEW(projectId, deployId))
                // Reset lỗi khi thành công
                consecutiveErrorCount = 0;
            } else if (deployInfo.status === 'ERROR') {
                // Tăng biến đếm lỗi
                consecutiveErrorCount++;

                // Kiểm tra nếu đã có 3 lỗi liên tiếp
                if (consecutiveErrorCount >= 3) {
                    message.error('Deployment failed after 3 consecutive errors', 5)
                    addDeploymentLog(`Deployment failed after 3 consecutive errors`, 'error')
                } else {
                    // Nếu chưa đủ 3 lỗi, ghi log nhưng không dừng quá trình
                    addDeploymentLog(`Deployment error detected (${consecutiveErrorCount}/3), retrying...`, 'warning')
                }
            } else {
                // Reset biến đếm lỗi khi trạng thái khác ERROR
                consecutiveErrorCount = 0;
            }
        } catch (err) {
            // Xem lỗi này như một trạng thái ERROR
            consecutiveErrorCount++;

            if (consecutiveErrorCount >= 3) {
                message.error(
                    'Error checking deployment status after 3 consecutive failures: ' + err.message,
                    5
                )
                addDeploymentLog(
                    `Deployment error after 3 attempts: ${err.message}`,
                    'error'
                )
            } else {
                addDeploymentLog(
                    `Status check error (${consecutiveErrorCount}/3): ${err.message}, retrying...`,
                    'warning'
                )
            }
        }
    }

    // Simulate deployment progress for better visual feedback - SEQUENTIAL VERSION
    const simulateDeploymentProgress = () => {
        const processTask = (taskIndex) => {
            if (taskIndex >= deploymentTasks.length || shouldStopSimulation) {
                return;
            }

            const currentTask = deploymentTasks[taskIndex];
            const { id: taskId, subtasks, setProgress } = currentTask;

            setCurrentTaskIndex(taskIndex);
            setCurrentAction(`${currentTask.title} in progress`);
            addDeploymentLog(`Starting ${currentTask.title.toLowerCase()}`, 'info');

            let subtaskCounter = 0;
            const processSubtask = () => {
                if (subtaskCounter >= subtasks.length || shouldStopSimulation) {
                    if (!shouldStopSimulation) {
                        setProgress(100);
                        addDeploymentLog(`${currentTask.title} completed`, 'success');
                        setTimeout(() => processTask(taskIndex + 1), 5000);
                    }
                    return;
                }

                const subtask = subtasks[subtaskCounter];
                updateSubtaskStatus(taskId, subtask.id, 'in-progress');
                addDeploymentLog(`${subtask.title}`, 'info');

                const progressIncrement = 100 / subtasks.length;
                let progress = 0;

                const incrementInterval = setInterval(() => {
                    if (shouldStopSimulation) {
                        clearInterval(incrementInterval);
                        return;
                    }

                    progress += 5; // Tăng tiến trình bằng số nguyên

                    const overallProgress = Math.min(
                        subtaskCounter * progressIncrement + (progress * progressIncrement) / 100,
                        100
                    );
                    setProgress(Math.floor(overallProgress));

                    if (progress >= 100) {
                        clearInterval(incrementInterval);
                        updateSubtaskStatus(taskId, subtask.id, 'completed');
                        subtaskCounter++;
                        if (!shouldStopSimulation) {
                            setTimeout(processSubtask, 1000);
                        }
                    }
                }, 1000); // Cập nhật mỗi 1 giây
            };

            processSubtask();
        };

        processTask(0);
    };

    // Function to update subtask status
    const updateSubtaskStatus = (taskId, subtaskId, newStatus) => {
        const updatedTasks = [...deploymentTasks]
        const taskIndex = updatedTasks.findIndex((task) => task.id === taskId)

        if (taskIndex !== -1) {
            const subtaskIndex = updatedTasks[taskIndex].subtasks.findIndex(
                (subtask) => subtask.id === subtaskId
            )

            if (subtaskIndex !== -1) {
                updatedTasks[taskIndex].subtasks[subtaskIndex].status =
                    newStatus

                // If this is a completed task, add it to the completed tasks list
                if (newStatus === 'completed') {
                    setCompletedTasks((prev) => [
                        ...prev,
                        {
                            taskId,
                            subtaskId,
                            title: updatedTasks[taskIndex].subtasks[
                                subtaskIndex
                            ].title,
                            timestamp: new Date().toLocaleTimeString(),
                        },
                    ])
                }
            }
        }
    }

    // Helper function to add logs with timestamps
    const addDeploymentLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString()
        setDeploymentLogs((prev) => [...prev, { message, timestamp, type }])
    }

    useEffect(() => {
        if (!deployingTask) {
            startDeployTask(deployId)
            console.log(`Started deploying task id ${deployId}.`)
        } else {
            console.log("Deploying task already exists.")
        }
    }, [deployId])

    const hasStartedDeployTask = useRef(false)

    useEffect(() => {
        if (!hasStartedDeployTask.current) {
            hasStartedDeployTask.current = true
            startDeployment()
        }
        // Always run this when deployingTask changes
        updateDeployProgress()
        console.log("Updated deploy progress.")
    }, [deployingTask])

    return (
        <Card className="border-none">
            <div>
                <div>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} lg={14}>
                            <Card
                                title={
                                    <Space>
                                        <span className="text-lg font-bold">Deployment Progress</span>
                                    </Space>
                                }
                                className="deployment-progress-card"
                                style={{
                                    height: '93%',
                                    marginTop: 20,
                                }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Typography.Title level={5} style={{ marginTop: '0' }}>
                                        {currentAction}
                                    </Typography.Title>

                                    {/* Thanh Progress tổng */}
                                    <AnimatedProgressBar
                                        percent={totalProgress}
                                        title="Total Deployment Progress"
                                        subtitle="Overall progress of the deployment"
                                        color="#1890ff"
                                    />

                                    {/* Nút Show/Hide Detail */}
                                    <Button
                                        type="link"
                                        onClick={() => setShowDetails(!showDetails)}
                                        style={{ margin: '10px 0' }}
                                    >
                                        {showDetails ? 'Hide Details' : 'Show Details'}
                                    </Button>

                                    {/* Các subProgress chỉ hiển thị khi showDetails là true */}
                                    {showDetails && (
                                        <>
                                            <AnimatedProgressBar
                                                percent={setupProgress}
                                                title="Environment Setup"
                                                subtitle="Configuring server environment"
                                                color="#1890ff"
                                            />
                                            <AnimatedProgressBar
                                                percent={configProgress}
                                                title="Dependencies Installation"
                                                subtitle="Installing required packages"
                                                color="#52c41a"
                                            />
                                            <AnimatedProgressBar
                                                percent={optimizationProgress}
                                                title="Model Configuration"
                                                subtitle="Preparing model for inference"
                                                color="#faad14"
                                            />
                                            <AnimatedProgressBar
                                                percent={networkProgress}
                                                title="API Setup"
                                                subtitle="Creating secure endpoints"
                                                color="#722ed1"
                                            />
                                        </>
                                    )}
                                </Space>
                            </Card>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Card
                                title={
                                    <Space>
                                        <CodeOutlined style={{ color: '#1890ff' }} />
                                        <span>Deployment Logs</span>
                                    </Space>
                                }
                                className="deployment-logs-card"
                                style={{
                                    height: '93%',
                                    marginTop: 20,
                                }}
                            >
                                <div
                                    style={{
                                        height: '500px',
                                        overflowY: 'auto',
                                        padding: '8px',
                                    }}
                                >
                                    <Timeline
                                        mode="left"
                                        items={deploymentLogs.map((log, index) => {
                                            let color = '#1890ff';
                                            let dot = <InfoCircleOutlined />;

                                            if (log.type === 'success') {
                                                color = '#52c41a';
                                                dot = <CheckCircleOutlined />;
                                            } else if (log.type === 'error') {
                                                color = '#f5222d';
                                                dot = <InfoCircleOutlined />;
                                            }

                                            return {
                                                color: color,
                                                dot: dot,
                                                children: (
                                                    <>
                                                        <Typography.Text
                                                            style={{
                                                                fontSize: '12px',
                                                                color: '#8c8c8c',
                                                            }}
                                                        >
                                                            {log.timestamp}
                                                        </Typography.Text>
                                                        <br />
                                                        <Typography.Text>{log.message}</Typography.Text>
                                                    </>
                                                ),
                                            };
                                        })}
                                    />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </Card>
    )
}
