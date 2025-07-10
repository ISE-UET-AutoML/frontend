import React from 'react'
import {
    Card,
    Space,
    Typography,
    Steps,
    Badge,
    Row,
    Col,
    Divider,
    Collapse,
    Select,
} from 'antd'
import {
    ClockCircleOutlined,
    CloudServerOutlined,
    HddOutlined,
    ThunderboltOutlined,
    DollarOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Step } = Steps
const { Panel } = Collapse
const { Option } = Select
export const SERVICES = [
    {
        name: 'VastAI',
        description: 'Cost-effective GPU instances',
        icon: <CloudServerOutlined />,
    },
    {
        name: 'AWS EC2',
        description: 'Reliable and scalable computing',
        icon: <CloudServerOutlined />,
    },
    {
        name: 'GCP Compute',
        description: 'High-performance cloud computing',
        icon: <CloudServerOutlined />,
    },
]

export const GPU_NAMES = ['RTX_3060', 'RTX_4090']

export const GPU_LEVELS = [
    {
        name: 'RTX 3060',
        gpuNumber: 1,
        disk: 10,
        cost: 0.2,
        performance: 'Weak',
        memory: '8GB',
    },
    {
        name: 'RTX 3070',
        gpuNumber: 2,
        disk: 20,
        cost: 0.4,
        performance: 'Medium',
        memory: '12GB',
    },
    {
        name: 'RTX 3080',
        gpuNumber: 4,
        disk: 30,
        cost: 0.8,
        performance: 'Strong',
        memory: '16GB',
    },
    {
        name: 'RTX 3090',
        gpuNumber: 6,
        disk: 40,
        cost: 1.0,
        performance: 'Super Strong',
        memory: '24GB',
    },
    {
        name: 'RTX 4090',
        gpuNumber: 8,
        disk: 50,
        cost: 2.0,
        performance: 'Rocket',
        memory: '24GB',
    },
]

export const INSTANCE_SIZE_DETAILS = {
    Weak: {
        title: '🛠️ Basic Configuration',
        suitable: 'Small datasets and simple models',
        gpuRange: '1-2 GPUs',
        memory: 'Basic memory allocation',
        recommended: 'Testing and development',
        color: '#91d5ff',
    },
    Medium: {
        title: '⚖️ Balanced Setup',
        suitable: 'Moderate workloads',
        gpuRange: '2-4 GPUs',
        memory: 'Increased memory capacity',
        recommended: 'Regular training tasks',
        color: '#b7eb8f',
    },
    Strong: {
        title: '🔥 Enhanced Performance',
        suitable: 'Larger datasets',
        gpuRange: '4-6 GPUs',
        memory: 'High memory allocation',
        recommended: 'Complex model training',
        color: '#ffd666',
    },
    'Super Strong': {
        title: '⚡ High Performance',
        suitable: 'Demanding workloads',
        gpuRange: '6-8 GPUs',
        memory: 'Extended memory capacity',
        recommended: 'Large-scale training',
        color: '#ff9c6e',
    },
    Rocket: {
        title: '🚀 Maximum Power',
        suitable: 'Enterprise-level tasks',
        gpuRange: '8+ GPUs',
        memory: 'Maximum memory allocation',
        recommended: 'Production deployment',
        color: '#ff7875',
    },
}

export const generateRandomKey = () => {
    // Generate a random string to use as a key
    const randomString =
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2)

    // Use crypto-js to create a SHA-256 hash of the random string
    const hash = CryptoJS.SHA256(randomString).toString()

    // Format as an SSH public key (simplified version)
    return `ssh-rsa ${hash} generated-key`
}

export const InstanceSizeCard = ({ size, details, selected, onClick }) => (
    <Card
        hoverable
        className={`instance-size-card ${selected ? 'selected' : ''}`}
        style={{
            borderColor: selected ? details.color : '#d9d9d9',
            backgroundColor: selected ? `${details.color}10` : 'white',
        }}
        onClick={onClick}
    >
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Title level={5} className="mr-10">
                {details.title}
            </Title>
            {selected && (
                <Collapse ghost>
                    <Panel header="Detail" key="1">
                        <Space direction="vertical" size="small">
                            <Text type="secondary">
                                Suitable for: {details.suitable}
                            </Text>
                            <Text>GPU Range: {details.gpuRange}</Text>
                            <Text>Memory: {details.memory}</Text>
                            <Badge
                                color={details.color}
                                text={`Recommended for: ${details.recommended}`}
                            />
                        </Space>
                    </Panel>
                </Collapse>
            )}
        </div>
    </Card>
)

export const CostEstimator = ({ hours, gpuLevel }) => {
    const hourlyRate = gpuLevel?.cost || 0
    const totalCost = hours * hourlyRate

    return (
        <Card title="Cost Estimation" className="cost-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row justify="space-between">
                    <Col>
                        <Text>Hourly Rate:</Text>
                    </Col>
                    <Col>
                        <Text strong>${hourlyRate}/hour</Text>
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col>
                        <Text>Training Hours:</Text>
                    </Col>
                    <Col>
                        <Text strong>{hours} hours</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Row justify="space-between">
                    <Col>
                        <Text>Estimated Total:</Text>
                    </Col>
                    <Col>
                        <Text type="success" strong>
                            ${totalCost.toFixed(2)}
                        </Text>
                    </Col>
                </Row>
            </Space>
        </Card>
    )
}

export const InstanceInfo = ({ formData }) => {
    const selectedGPU = GPU_LEVELS.find((gpu) => gpu.name === formData.gpuName)

    return (
        <Card
            title={<Title level={4}>Instance Configuration</Title>}
            extra={
                <SafetyCertificateOutlined
                    style={{ fontSize: '24px', color: '#52c41a' }}
                />
            }
            className="instance-info-card rounded-lg shadow-sm"
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card size="small" title="Hardware Specs">
                            <Space direction="vertical">
                                <Text>
                                    <ThunderboltOutlined /> GPUs:{' '}
                                    {formData.gpuNumber}x {formData.gpuName}
                                </Text>
                                <Text>
                                    <HddOutlined /> Storage: {formData.disk} GB
                                </Text>
                                <Text>
                                    <CloudServerOutlined /> Provider:{' '}
                                    {formData.service}
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" title="Training Details">
                            <Space direction="vertical">
                                <Text>
                                    <ClockCircleOutlined /> Duration:{' '}
                                    {formData.trainingTime} hours
                                </Text>
                                <Text>
                                    <DollarOutlined /> Cost: ${formData.budget}
                                    /hour
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </Card>
    )
}