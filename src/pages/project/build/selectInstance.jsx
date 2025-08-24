import React, { useState, useEffect } from 'react'
import {
    useSearchParams,
    useOutletContext,
    useNavigate,
} from 'react-router-dom'
import { trainCloudModel } from 'src/api/mlService'
import { createDownZipPU } from 'src/api/dataset'
import {
    Card,
    Tabs,
    Slider,
    InputNumber,
    Button,
    Space,
    Typography,
    message,
    Steps,
    Row,
    Col,
    Collapse,
    Select,
    Input,
    Spin,
    Modal,
} from 'antd'
import {
    ThunderboltOutlined,
    CloudDownloadOutlined,
    SettingOutlined,
    RocketOutlined,
} from '@ant-design/icons'
import { createInstance, deleteInstance } from 'src/api/resource'
import { SERVICES, GPU_NAMES, GPU_LEVELS, INSTANCE_SIZE_DETAILS, InstanceSizeCard, generateRandomKey, CostEstimator, InstanceInfo } from 'src/constants/clouldInstance'

const { Text } = Typography
const { Option } = Select


const SelectInstance = () => {
    const { projectInfo, updateFields, selectedProject } = useOutletContext()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('automatic')
    const [isLoading, setIsLoading] = useState(false)
    const [isCreatingInstance, setIsCreatingInstance] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [formData, setFormData] = useState({
        service: SERVICES[0].name,
        gpuNumber: '',
        gpuName: GPU_NAMES[0],
        disk: '',
        trainingTime: '',
        budget: '',
        instanceSize: 'Weak',
    })
    const [instanceInfo, setInstanceInfo] = useState(null)
    const [showFindingInstanceCard, setShowFindingInstanceCard] = useState(false)
    const [sshKey, setSshKey] = useState('')
    const [infrastructureData, setInfrastructureData] = useState({
        id: '',
        sshPort: '',
        publicIP: '',
        presets: 'medium_quality',
        deployPort: '',
        username: '',
        datasetPath: './datasets/tabular',
    })

    // Generate SSH key when switching to userInfras tab
    useEffect(() => {
        if (activeTab === 'userInfras' && !sshKey) {
            const generatedKey = generateRandomKey()
            setSshKey(generatedKey)
        }
    }, [activeTab])

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(sshKey)
        message.success('SSH Key copied to clipboard')
    }

    const handleInfrastructureChange = (field) => (value) => {
        setInfrastructureData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleTrainingTimeChange = (value) => {
        if (value >= 0 && value <= 24) {
            setFormData((prev) => ({
                ...prev,
                trainingTime: value,
            }))
        }
    }

    const handleManualConfigChange = (field) => (value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Update budget automatically when relevant fields change
        if (field === 'gpuName' || field === 'trainingTime') {
            const selectedGPU = GPU_LEVELS.find(
                (gpu) =>
                    gpu.name ===
                    (field === 'gpuName' ? value : formData.gpuName)
            )
            const trainingTime =
                field === 'trainingTime' ? value : formData.trainingTime
            if (selectedGPU && trainingTime) {
                setFormData((prev) => ({
                    ...prev,
                    budget: (selectedGPU.cost * trainingTime).toFixed(2),
                }))
            }
        }
    }

    const findInstance = async () => {
        let instanceSize = formData.instanceSize
        let selectedGPU
        switch (instanceSize) {
            case 'Weak':
                selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 1)
                break
            case 'Medium':
                selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 2)
                break
            case 'Strong':
                selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 4)
                break
            case 'Super Strong':
                selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 6)
                break
            case 'Rocket':
                selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 8)
                break
            default:
                selectedGPU = GPU_LEVELS[0]
                break
        }
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setFormData((prev) => ({
            ...prev,
            service: SERVICES[0].name,
            gpuNumber: selectedGPU.gpuNumber,
            gpuName: selectedGPU.name,
            disk: selectedGPU.disk,
            budget: (selectedGPU.cost * formData.trainingTime).toFixed(2),
        }))
        const time = formData.trainingTime
        const cost = (selectedGPU.cost * formData.trainingTime).toFixed(2)
        const createInstancePayload = {
            training_time: time,
            presets: "medium_quality",
            cost: cost,
            select_best_machine: true,
            projectID: projectInfo.id
        }
        const instance = await createInstance(createInstancePayload)
        const instanceInfoData = instance.data
        setInstanceInfo(instanceInfoData)
        updateFields({ instanceInfo: instanceInfoData })
        return instanceInfoData // avoid asynchronous state issue
    }

    // Train model with the found instance, avoid asynchronous state issue
    const trainModel = async (instanceInfoData) => {
        const time = formData.trainingTime
        if (!instanceInfoData) {
            message.error('No instance info found!')
            return
        }
        const presignUrl = await createDownZipPU(selectedProject.dataset_title)
        const creating_instance_time = instanceInfoData.creating_time || 60
        const payload = {
            trainingTime: time * 3600 - creating_instance_time,
            instanceInfo: instanceInfoData,
            presets: 'medium_quality',
            datasetUrl: presignUrl.data,
            datasetLabelUrl: 'hello',
            problemType: selectedProject.meta_data?.is_binary_class ? 'BINARY' : 'MULTICLASS',
            framework: 'autogluon',
            target_column: selectedProject.meta_data?.target_column,
            text_column: selectedProject.meta_data?.text_columns,
            image_column: selectedProject.meta_data?.image_column
        }
        const res1 = await trainCloudModel(projectInfo.id, payload)
        const experimentName = res1.data.experimentName
        return res1.data
    }

    // Find instance and train model sequentially
    const handleStartTraining = async () => {
        if (!formData.trainingTime) {
            message.error('Please input training time')
            return
        }
        setIsProcessing(true)
        setShowFindingInstanceCard(true)
        try {
            const instanceInfoData = await findInstance()
            const trainResult = await trainModel(instanceInfoData)
            setShowFindingInstanceCard(false)
            if (trainResult && trainResult.experimentName && trainResult.experimentId) {
                // Navigate immediately when training request sent
                navigate(
                    `/app/project/${projectInfo.id}/build/training?experimentName=${trainResult.experimentName}&experimentId=${trainResult.experimentId}`,
                    { replace: true }
                )
            } else {
                message.error('Training result is invalid!')
            }
        } catch (error) {
            console.error('Error', error)
            message.error('Failed to find instance or train model.')
            setShowFindingInstanceCard(false)
        } finally {
            setIsProcessing(false)
        }
    }

    const items = [
        {
            key: 'automatic',
            label: <span>⚡Automatic Configuration</span>,
            children: (
                <Space
                    direction="vertical"
                    size="large"
                    className="w-full rounded-lg shadow-sm"
                >
                    <Row gutter={[24, 24]}>
                        <Col span={16}>
                            <Card className="rounded-lg shadow-sm">
                                <Space
                                    direction="vertical"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Text strong>Training Duration</Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: 8,
                                            }}
                                        >
                                            <Slider
                                                style={{ width: '85%' }}
                                                min={0}
                                                max={24}
                                                step={0.5}
                                                value={
                                                    formData.trainingTime || 0
                                                }
                                                onChange={
                                                    handleTrainingTimeChange
                                                }
                                                tooltip={{
                                                    formatter: (value) =>
                                                        `${value} hours`,
                                                }}
                                            />
                                            <InputNumber
                                                style={{
                                                    width: '15%',
                                                    marginLeft: '10px',
                                                }}
                                                min={0}
                                                max={24}
                                                step={0.5}
                                                value={formData.trainingTime}
                                                onChange={
                                                    handleTrainingTimeChange
                                                }
                                                addonAfter="Hours"
                                            />
                                        </div>
                                        <Text type="secondary">
                                            Recommended: 1-24 hours for most
                                            models
                                        </Text>
                                    </div>

                                    <div>
                                        <Text strong>Performance Level</Text>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gap: '16px',
                                                marginTop: '16px',
                                            }}
                                        >
                                            {Object.entries(
                                                INSTANCE_SIZE_DETAILS
                                            ).map(([size, details]) => (
                                                <InstanceSizeCard
                                                    key={size}
                                                    size={size}
                                                    details={details}
                                                    selected={
                                                        formData.instanceSize ===
                                                        size
                                                    }
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            instanceSize: size,
                                                        }))
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Space
                                direction="vertical"
                                size="large"
                                style={{ width: '100%' }}
                            >
                                <InstanceInfo formData={formData} />
                                {formData.trainingTime && (
                                    <CostEstimator
                                        hours={formData.trainingTime}
                                        gpuLevel={GPU_LEVELS.find(
                                            (gpu) =>
                                                gpu.name === formData.gpuName
                                        )}
                                    />
                                )}
                            </Space>
                            <div className="action-container mt-4 w-full justify-between items-center">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ThunderboltOutlined />}
                                    onClick={handleStartTraining}
                                    loading={isProcessing}
                                    disabled={!formData.trainingTime || isProcessing}
                                >
                                    {isProcessing ? 'Finding instance...' : 'Start Training'}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Space>
            ),
        },
        {
            key: 'manual',
            label: <span>🛠️Manual Configuration</span>,
            children: (
                <Space
                    direction="vertical"
                    size="large"
                    className="w-full rounded-lg shadow-sm"
                >
                    <Row gutter={[24, 24]}>
                        <Col span={16}>
                            <Card className="rounded-lg shadow-sm">
                                <Space
                                    direction="vertical"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Text strong>Training Duration</Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: 8,
                                            }}
                                        >
                                            <Slider
                                                style={{ width: '85%' }}
                                                min={0}
                                                max={24}
                                                step={0.5}
                                                value={
                                                    formData.trainingTime || 0
                                                }
                                                onChange={
                                                    handleTrainingTimeChange
                                                }
                                                tooltip={{
                                                    formatter: (value) =>
                                                        `${value} hours`,
                                                }}
                                            />
                                            <InputNumber
                                                style={{
                                                    width: '15%',
                                                    marginLeft: '10px',
                                                }}
                                                min={0}
                                                max={24}
                                                step={0.5}
                                                value={formData.trainingTime}
                                                onChange={
                                                    handleTrainingTimeChange
                                                }
                                                addonAfter="Hours"
                                            />
                                        </div>
                                        <Text type="secondary">
                                            Recommended: 1-24 hours for most
                                            models
                                        </Text>
                                    </div>

                                    <div>
                                        <Text strong>Manual Configuration</Text>
                                        <Space
                                            direction="vertical"
                                            size="middle"
                                            style={{
                                                width: '100%',
                                                marginTop: 16,
                                            }}
                                        >
                                            <div>
                                                <Text>Service Provider</Text>
                                                <Select
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                    value={formData.service}
                                                    onChange={handleManualConfigChange(
                                                        'service'
                                                    )}
                                                >
                                                    {SERVICES.map((service) => (
                                                        <Option
                                                            key={service.name}
                                                            value={service.name}
                                                        >
                                                            {service.name} -{' '}
                                                            {
                                                                service.description
                                                            }
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div>
                                                <Text>GPU Type</Text>
                                                <Select
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                    value={formData.gpuName}
                                                    onChange={handleManualConfigChange(
                                                        'gpuName'
                                                    )}
                                                >
                                                    {GPU_LEVELS.map((gpu) => (
                                                        <Option
                                                            key={gpu.name}
                                                            value={gpu.name}
                                                        >
                                                            {gpu.name} (
                                                            {gpu.memory})
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div>
                                                <Text>Number of GPUs</Text>
                                                <InputNumber
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                    min={1}
                                                    max={8}
                                                    value={formData.gpuNumber}
                                                    onChange={handleManualConfigChange(
                                                        'gpuNumber'
                                                    )}
                                                    addonAfter="GPUs"
                                                />
                                            </div>

                                            <div>
                                                <Text>Disk Space</Text>
                                                <InputNumber
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                    min={10}
                                                    max={1000}
                                                    value={formData.disk}
                                                    onChange={handleManualConfigChange(
                                                        'disk'
                                                    )}
                                                    addonAfter="GB"
                                                />
                                            </div>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Space
                                direction="vertical"
                                size="large"
                                style={{ width: '100%' }}
                            >
                                <InstanceInfo formData={formData} />
                                {formData.trainingTime && (
                                    <CostEstimator
                                        hours={formData.trainingTime}
                                        gpuLevel={GPU_LEVELS.find(
                                            (gpu) =>
                                                gpu.name === formData.gpuName
                                        )}
                                    />
                                )}
                            </Space>
                            <div className="action-container mt-4 w-full justify-between items-center">
                                {formData.gpuNumber &&
                                    formData.trainingTime && instanceInfo && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<ThunderboltOutlined />}
                                            // onClick={handleTrainModel}
                                            loading={isProcessing}
                                            disabled={
                                                isProcessing ||
                                                !formData.gpuNumber
                                            }
                                        >
                                            {isProcessing
                                                ? 'Processing...'
                                                : 'Start Training'}
                                        </Button>
                                    )}
                            </div>
                        </Col>
                    </Row>
                </Space>
            ),
        },
        {
            key: 'userInfras',
            label: <span>🏗️Your Infrastructure</span>,
            children: (
                <Space
                    direction="vertical"
                    size="large"
                    className="w-full rounded-lg shadow-sm"
                >
                    <Row gutter={[24, 24]}>
                        <Col span={16}>
                            <Card className="rounded-lg shadow-sm">
                                <Space
                                    direction="vertical"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Text strong>Training Duration</Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: 8,
                                            }}
                                        >
                                            <Slider
                                                style={{ width: '85%' }}
                                                min={0}
                                                max={24}
                                                step={0.5}
                                                value={
                                                    formData.trainingTime || 0
                                                }
                                                onChange={
                                                    handleTrainingTimeChange
                                                }
                                                tooltip={{
                                                    formatter: (value) =>
                                                        `${value} hours`,
                                                }}
                                            />
                                            <InputNumber
                                                style={{
                                                    width: '15%',
                                                    marginLeft: '10px',
                                                }}
                                                min={0}
                                                max={24}
                                                step={0.5}
                                                value={formData.trainingTime}
                                                onChange={
                                                    handleTrainingTimeChange
                                                }
                                                addonAfter="Hours"
                                            />
                                        </div>
                                        <Text type="secondary">
                                            Recommended: 1-24 hours for most
                                            models
                                        </Text>
                                    </div>

                                    <div>
                                        <Space
                                            direction="vertical"
                                            size="middle"
                                            style={{
                                                width: '100%',
                                            }}
                                        >
                                            <div>
                                                <Text>SSH Public Key</Text>
                                                <Input.TextArea
                                                    value={sshKey}
                                                    rows={2}
                                                    readOnly
                                                // style={{ marginTop: 8 }}
                                                />
                                                <Button
                                                    onClick={
                                                        handleCopyToClipboard
                                                    }
                                                    type="primary"
                                                    style={{ marginTop: 8 }}
                                                >
                                                    Copy
                                                </Button>
                                            </div>
                                            <div>
                                                <Text>Instance ID</Text>
                                                <Input
                                                    value={
                                                        infrastructureData.id
                                                    }
                                                    onChange={(e) =>
                                                        handleInfrastructureChange(
                                                            'id'
                                                        )(e.target.value)
                                                    }
                                                    style={{ marginTop: 8 }}
                                                    placeholder="Enter instance ID"
                                                />
                                            </div>
                                            <div>
                                                <Text>SSH Port</Text>
                                                <InputNumber
                                                    value={
                                                        infrastructureData.sshPort
                                                    }
                                                    onChange={handleInfrastructureChange(
                                                        'sshPort'
                                                    )}
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                    min={1}
                                                    max={65535}
                                                    placeholder="Enter SSH port"
                                                />
                                            </div>
                                            <div>
                                                <Text>Public IP</Text>
                                                <Input
                                                    value={
                                                        infrastructureData.publicIP
                                                    }
                                                    onChange={(e) =>
                                                        handleInfrastructureChange(
                                                            'publicIP'
                                                        )(e.target.value)
                                                    }
                                                    style={{ marginTop: 8 }}
                                                    placeholder="Enter public IP"
                                                />
                                            </div>
                                            <div>
                                                <Text>Quality Presets</Text>
                                                <Select
                                                    value={
                                                        infrastructureData.presets
                                                    }
                                                    onChange={handleInfrastructureChange(
                                                        'presets'
                                                    )}
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    <Option value="low_quality">
                                                        Low Quality
                                                    </Option>
                                                    <Option value="medium_quality">
                                                        Medium Quality
                                                    </Option>
                                                    <Option value="high_quality">
                                                        High Quality
                                                    </Option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Text>Deploy Port</Text>
                                                <InputNumber
                                                    value={
                                                        infrastructureData.deployPort
                                                    }
                                                    onChange={handleInfrastructureChange(
                                                        'deployPort'
                                                    )}
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 8,
                                                    }}
                                                    min={1}
                                                    max={65535}
                                                    placeholder="Enter deploy port"
                                                />
                                            </div>
                                            <div>
                                                <Text>Username</Text>
                                                <Input
                                                    value={
                                                        infrastructureData.username
                                                    }
                                                    onChange={(e) =>
                                                        handleInfrastructureChange(
                                                            'username'
                                                        )(e.target.value)
                                                    }
                                                    style={{ marginTop: 8 }}
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                            <div>
                                                <Text>Dataset Path</Text>
                                                <Input
                                                    value={
                                                        infrastructureData.datasetPath
                                                    }
                                                    onChange={(e) =>
                                                        handleInfrastructureChange(
                                                            'datasetPath'
                                                        )(e.target.value)
                                                    }
                                                    style={{ marginTop: 8 }}
                                                    placeholder="Enter dataset path"
                                                />
                                            </div>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Space
                                direction="vertical"
                                size="large"
                                style={{ width: '100%' }}
                            >
                                <InstanceInfo formData={formData} />
                                {formData.trainingTime && (
                                    <CostEstimator
                                        hours={formData.trainingTime}
                                        gpuLevel={GPU_LEVELS.find(
                                            (gpu) =>
                                                gpu.name === formData.gpuName
                                        )}
                                    />
                                )}
                            </Space>
                            <div className="action-container mt-4 w-full justify-between items-center">
                                {formData.gpuNumber &&
                                    formData.trainingTime && instanceInfo && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<ThunderboltOutlined />}
                                            // onClick={handleTrainModel}
                                            loading={isProcessing}
                                            disabled={
                                                isProcessing ||
                                                !formData.gpuNumber
                                            }
                                        >
                                            {isProcessing
                                                ? 'Processing...'
                                                : 'Start Training'}
                                        </Button>
                                    )}
                            </div>
                        </Col>
                    </Row>
                </Space>
            ),
        },
    ]

    return (
        <div className="select-instance-container pl-6 pr-6">
            {/* Modal tiến trình tìm instance, không thể tắt thủ công */}
            <Modal
                open={showFindingInstanceCard}
                closable={false}
                footer={null}
                centered
                maskClosable={false}
                title={<span><RocketOutlined /> Finding the suitable instance...</span>}
                width={500}
                zIndex={2000}
            >
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <Spin size="large" tip="Searching for the best instance for your project..." />
                    <Text type="secondary">Please wait a moment while the system finds the most suitable resources.</Text>
                </Space>
            </Modal>
            <Tabs items={items} onChange={(key) => setActiveTab(key)} />
        </div>
    )
}

export default SelectInstance
