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
        instanceDetails: GPU_LEVELS[0]
    },
    Medium: {
        title: '⚖️ Balanced Setup',
        suitable: 'Moderate workloads',
        gpuRange: '2-4 GPUs',
        memory: 'Increased memory capacity',
        recommended: 'Regular training tasks',
        color: '#b7eb8f',
        instanceDetails: GPU_LEVELS[1]
    },
    Strong: {
        title: '🔥 Enhanced Performance',
        suitable: 'Larger datasets',
        gpuRange: '4-6 GPUs',
        memory: 'High memory allocation',
        recommended: 'Complex model training',
        color: '#ffd666',
        instanceDetails: GPU_LEVELS[2]
    },
    'Super Strong': {
        title: '⚡ High Performance',
        suitable: 'Demanding workloads',
        gpuRange: '6-8 GPUs',
        memory: 'Extended memory capacity',
        recommended: 'Large-scale training',
        color: '#ff9c6e',
        instanceDetails: GPU_LEVELS[3]
    },
    Rocket: {
        title: '🚀 Maximum Power',
        suitable: 'Enterprise-level tasks',
        gpuRange: '8+ GPUs',
        memory: 'Maximum memory allocation',
        recommended: 'Production deployment',
        color: '#ff7875',
        instanceDetails: GPU_LEVELS[4]
    },
}

export const generateRandomKey = () => {
    // Generate a random string to use as a key
    const randomString =
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2)

    // Use crypto-js to create a SHA-256 hash of the random string
    // const hash = CryptoJS.SHA256(randomString).toString()
    const hash = 'hardcoded-hash-for-example' // Placeholder for the hash
    // Format as an SSH public key (simplified version)
    return `ssh-rsa ${hash} generated-key`
}

export const InstanceSizeCard = ({ size, details, selected, onClick }) => (
    <Card
        hoverable
        className={`instance-size-card ${selected ? 'selected' : ''}`}
        style={{
            borderColor: selected ? '#5C8DFF' : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: selected ? 'rgba(92, 141, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
            color: 'white',
        }}
        onClick={onClick}
    >
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Title level={5} className="mr-10" style={{ color: 'white' }}>
                {details.title}
            </Title>
            {selected && (
                <Collapse ghost>
                    <Panel header="Detail" key="1" style={{ color: 'white' }}>
                        <Space direction="vertical" size="small">
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Suitable for: {details.suitable}
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>GPU Range: {details.gpuRange}</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Memory: {details.memory}</Text>
                            <Badge
                                color="#5C8DFF"
                                text={
                                    <span style={{ color: 'gray' }}>
                                        Recommended for: {details.recommended}
                                    </span>
                                }
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
        <Card 
            title={<span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 600 }}>Cost Estimation</span>} 
            className="dark-build-cost-estimator"
            style={{
                background: 'rgba(92, 141, 255, 0.1)',
                border: '1px solid rgba(92, 141, 255, 0.3)',
                borderRadius: '16px',
            }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row justify="space-between">
                    <Col>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Hourly Rate:</Text>
                    </Col>
                    <Col>
                        <Text strong style={{ color: 'white' }}>${hourlyRate}/hour</Text>
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Training Hours:</Text>
                    </Col>
                    <Col>
                        <Text strong style={{ color: 'white' }}>{hours} hours</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: '12px 0', borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                <Row justify="space-between">
                    <Col>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Estimated Total:</Text>
                    </Col>
                    <Col>
                        <Text 
                            style={{ 
                                color: '#5C8DFF', 
                                fontWeight: 600,
                                fontSize: '18px'
                            }}
                        >
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
            title={<Title level={4} style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 600 }}>Instance Configuration</Title>}
            extra={
                <SafetyCertificateOutlined
                    style={{ fontSize: '24px', color: '#5C8DFF' }}
                />
            }
            className="dark-build-card"
            style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
            }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card 
                            size="small" 
                            title={<span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 600 }}>Hardware Specs</span>}
                            style={{
                                background: 'rgba(92, 141, 255, 0.1)',
                                border: '1px solid rgba(92, 141, 255, 0.3)',
                                borderRadius: '12px',
                            }}
                        >
                            <Space direction="vertical">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    <ThunderboltOutlined style={{ color: '#5C8DFF' }} /> GPUs:{' '}
                                    {formData.gpuNumber}x {formData.gpuName}
                                </Text>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    <HddOutlined style={{ color: '#5C8DFF' }} /> Storage: {formData.disk} GB
                                </Text>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    <CloudServerOutlined style={{ color: '#5C8DFF' }} /> Provider:{' '}
                                    {formData.service}
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card 
                            size="small" 
                            title={<span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 600 }}>Training Details</span>}
                            style={{
                                background: 'rgba(92, 141, 255, 0.1)',
                                border: '1px solid rgba(92, 141, 255, 0.3)',
                                borderRadius: '12px',
                            }}
                        >
                            <Space direction="vertical">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    <ClockCircleOutlined style={{ color: '#5C8DFF' }} /> Duration:{' '}
                                    {formData.trainingTime} hours
                                </Text>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    <DollarOutlined style={{ color: '#5C8DFF' }} /> Cost: ${formData.cost}
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