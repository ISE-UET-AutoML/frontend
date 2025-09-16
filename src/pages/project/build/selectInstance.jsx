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
            datasetMetadata: selectedProject.meta_data
        }
        console.log("Train payload: ", payload)
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
                            <Card className="dark-build-card rounded-lg shadow-sm">
                                <Space
                                    direction="vertical"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Text className="dark-build-text-gradient ">Training Duration</Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: 8,
                                            }}
                                        >
                                            <Slider
                                                className="dark-build-slider"
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
                                                className="dark-build-input"
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
                                                addonAfter={<span style={{ color: 'white' }}>Hours</span>}
                                            />
                                        </div>
                                        <Text className="dark-build-text">
                                            Recommended: 1-24 hours for most
                                            models
                                        </Text>
                                    </div>

                                    <div>
                                        <Text className="dark-build-text-gradient">Performance Level</Text>
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
                                    className="dark-build-button"
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
                            <Card className="dark-build-card rounded-lg shadow-sm">
                                <Space
                                    direction="vertical"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Text className="dark-build-text-gradient">Training Duration</Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: 8,
                                            }}
                                        >
                                            <Slider
                                                className="dark-build-slider"
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
                                                className="dark-build-input"
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
                                                addonAfter={<span style={{ color: 'white' }}>Hours</span>}
                                            />
                                        </div>
                                        <Text className="dark-build-text">
                                            Recommended: 1-24 hours for most
                                            models
                                        </Text>
                                    </div>

                                    <div>
                                        <Text className="dark-build-text-gradient">Manual Configuration</Text>
                                        <Space
                                            direction="vertical"
                                            size="middle"
                                            style={{
                                                width: '100%',
                                                marginTop: 16,
                                            }}
                                        >
                                            <div>
                                                <Text className="dark-build-text">Service Provider</Text>
                                                <Select
                                                    className="dark-build-select"
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
                                                <Text className="dark-build-text">GPU Type</Text>
                                                <Select
                                                    className="dark-build-select"
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
                                                <Text className="dark-build-text">Number of GPUs</Text>
                                                <InputNumber
                                                    className="dark-build-input"
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
                                                    addonAfter={
                                                        <span style={{ color: 'white' }}>GPUs</span>
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Text className="dark-build-text">Disk Space</Text>
                                                <InputNumber
                                                    className="dark-build-input"
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
                                                    addonAfter={
                                                        <span style={{ color: 'white' }}>GB</span>
                                                    }
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
                            <Card className="dark-build-card rounded-lg shadow-sm">
                                <Space
                                    direction="vertical"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Text className="dark-build-text-gradient">Training Duration</Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: 8,
                                            }}
                                        >
                                            <Slider
                                                className="dark-build-slider"
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
                                                className="dark-build-input"
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
                                                addonAfter={<span style={{ color: 'white' }}>Hours</span>}
                                            />
                                        </div>
                                        <Text className="dark-build-text">
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
                                                <Text className="dark-build-text">SSH Public Key</Text>
                                                <Input.TextArea
                                                    className="dark-build-input"
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
                                                <Text className="dark-build-text">Instance ID</Text>
                                                <Input
                                                    className="dark-build-input"
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
                                                <Text className="dark-build-text">SSH Port</Text>
                                                <InputNumber
                                                    className="dark-build-input"
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
                                                <Text className="dark-build-text">Public IP</Text>
                                                <Input
                                                    className="dark-build-input"
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
                                                <Text className="dark-build-text">Quality Presets</Text>
                                                <Select
                                                    className="dark-build-select"
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
                                                <Text className="dark-build-text">Deploy Port</Text>
                                                <InputNumber
                                                    className="dark-build-input"
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
                                                <Text className="dark-build-text">Username</Text>
                                                <Input
                                                    className="dark-build-input"
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
                                                <Text className="dark-build-text">Dataset Path</Text>
                                                <Input
                                                    className="dark-build-input"
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
        <>
            <style>{`
                .dark-build-page {
                    background: transparent;
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-page * {
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-tabs .ant-tabs-tab {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                    font-size: 16px !important;
                }
                
                .dark-build-tabs .ant-tabs-tab:hover {
                    color: #5C8DFF !important;
                }
                
                .dark-build-tabs .ant-tabs-tab-active {
                    color: #5C8DFF !important;
                }
                
                .dark-build-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #5C8DFF !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-tabs .ant-tabs-ink-bar {
                    background: linear-gradient(90deg, #5C8DFF 0%, #8B5CF6 100%) !important;
                    height: 3px !important;
                }
                
                .dark-build-tabs .ant-tabs-content-holder {
                    background: transparent !important;
                }
                
                .dark-build-card {
                    background: rgba(0, 0, 0, 0.4) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
                }
                
                .dark-build-text {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 400 !important;
                }
                
                .dark-build-text-strong {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-text-gradient {
                    background: linear-gradient(90deg, #5C8DFF 0%, #8B5CF6 100%) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    font-size: 20px !important;
                }
                
                .dark-build-slider .ant-slider-track {
                    background: linear-gradient(90deg, #5C8DFF 0%, #8B5CF6 100%) !important;
                    height: 6px !important;
                }
                
                .dark-build-slider .ant-slider-rail {
                    background: rgba(255, 255, 255, 0.2) !important;
                    height: 6px !important;
                }
                
                .dark-build-slider .ant-slider-handle {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                    width: 20px !important;
                    height: 20px !important;
                    margin-top: 0px !important;
                }
                
                .dark-build-slider .ant-slider-handle:hover {
                    border-color: #8B5CF6 !important;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2) !important;
                }
                
                .dark-build-slider .ant-slider-tooltip {
                    color: white !important;
                    background: rgba(0, 0, 0, 0.8) !important;
                    border: 1px solid rgba(92, 141, 255, 0.3) !important;
                }
                
                .dark-build-input .ant-input-number {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-input .ant-input-number:hover {
                    border-color: #8B5CF6 !important;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
                }
                
                .dark-build-input .ant-input-number-focused {
                    border-color: #8B5CF6 !important;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
                }
                
                .dark-build-input .ant-input-number-input {
                    color: white !important;
                    background: transparent !important;
                    font-size: 16px !important;
                    font-weight: 500 !important;
                }
                
                .dark-build-input .ant-input-number-addon {
                    color: white !important;
                    background: rgba(92, 141, 255, 0.2) !important;
                    border-color: rgba(92, 141, 255, 0.3) !important;
                    font-weight: 500 !important;
                }
                
                .dark-build-input .ant-input-number-addon .ant-input-number-addon-text {
                    color: white !important;
                }
                
                .dark-build-input .ant-input-number-addon-after {
                    color: white !important;
                    background: rgba(92, 141, 255, 0.2) !important;
                    border-color: rgba(92, 141, 255, 0.3) !important;
                }
                
                .dark-build-input .ant-input-number-addon-after span {
                    color: white !important;
                }
                
                .dark-build-input .ant-input-number-addon-after {
                    color: white !important;
                }
                
                .dark-build-input .ant-input-number-addon-after * {
                    color: white !important;
                }
                
                .dark-build-input .ant-input-number .ant-input-number-addon-after {
                    color: white !important;
                    background: rgba(92, 141, 255, 0.2) !important;
                    border-color: rgba(92, 141, 255, 0.3) !important;
                }
                
                .dark-build-input .ant-input-number .ant-input-number-addon-after span {
                    color: white !important;
                }
                
                .dark-build-input .ant-input-number .ant-input-number-addon-after .ant-input-number-addon-text {
                    color: white !important;
                }
                
                .dark-build-select .ant-select-selector {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-select .ant-select-selector:hover {
                    border-color: #8B5CF6 !important;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
                }
                
                .dark-build-select .ant-select-selection-item {
                    color: white !important;
                }
                
                .dark-build-select .ant-select-arrow {
                    color: #8B5CF6 !important;
                }
                
                .dark-build-button {
                    background: linear-gradient(135deg, #5C8DFF 0%, #8B5CF6 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 16px rgba(92, 141, 255, 0.3) !important;
                    height: 48px !important;
                }
                
                .dark-build-button:hover {
                    background: linear-gradient(135deg, #4A7CFF 0%, #7C4AFF 100%) !important;
                    box-shadow: 0 6px 20px rgba(92, 141, 255, 0.4) !important;
                    transform: translateY(-2px) !important;
                }
                
                .dark-build-button:disabled {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                
                .dark-build-modal .ant-modal-content {
                    background: rgba(0, 0, 0, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 20px !important;
                }
                
                .dark-build-modal .ant-modal-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-build-modal .ant-modal-title {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-modal .ant-modal-body {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                .dark-build-statistic .ant-statistic-title {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-statistic .ant-statistic-content {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-statistic .ant-statistic-content-value {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-cost-estimator {
                    background: rgba(92, 141, 255, 0.1) !important;
                    border: 1px solid rgba(92, 141, 255, 0.3) !important;
                    border-radius: 16px !important;
                    padding: 20px !important;
                }
                
                .dark-build-cost-estimator h4 {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-cost-estimator p {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .instance-size-card {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 16px !important;
                    transition: all 0.3s ease !important;
                    backdrop-filter: blur(10px) !important;
                }
                
                .instance-size-card:hover {
                    background: rgba(92, 141, 255, 0.15) !important;
                    border-color: #5C8DFF !important;
                    box-shadow: 0 8px 24px rgba(92, 141, 255, 0.2) !important;
                    transform: translateY(-2px) !important;
                }
                
                .instance-size-card.selected {
                    background: rgba(92, 141, 255, 0.25) !important;
                    border-color: #5C8DFF !important;
                    box-shadow: 0 8px 24px rgba(92, 141, 255, 0.3) !important;
                }
                
                .instance-size-card .ant-card-body {
                    color: white !important;
                }
                
                .instance-size-card .ant-card-body h5 {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .instance-size-card .ant-card-body .ant-typography {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .instance-size-card .ant-collapse {
                    background: transparent !important;
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-item {
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-header {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    background: transparent !important;
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-content {
                    background: transparent !important;
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-content-box {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                /* Input and TextArea styling - More specific selectors */
                .dark-build-input .ant-input,
                .dark-build-input .ant-input-textarea,
                .dark-build-input .ant-input-affix-wrapper,
                .dark-build-input .ant-input-affix-wrapper .ant-input {
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(26, 26, 46, 0.6) 100%) !important;
                    border: 1px solid rgba(92, 141, 255, 0.3) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-input .ant-input:hover,
                .dark-build-input .ant-input-textarea:hover,
                .dark-build-input .ant-input-affix-wrapper:hover,
                .dark-build-input .ant-input-affix-wrapper:hover .ant-input {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                }
                
                .dark-build-input .ant-input:focus,
                .dark-build-input .ant-input-textarea:focus,
                .dark-build-input .ant-input-affix-wrapper:focus,
                .dark-build-input .ant-input-affix-wrapper:focus .ant-input {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                }
                
                .dark-build-input .ant-input::placeholder,
                .dark-build-input .ant-input-textarea::placeholder,
                .dark-build-input .ant-input-affix-wrapper .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                
                /* Force styling on all input elements */
                .dark-build-page input[type="text"],
                .dark-build-page textarea {
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(26, 26, 46, 0.6) 100%) !important;
                    border: 1px solid rgba(92, 141, 255, 0.3) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-page input[type="text"]:hover,
                .dark-build-page textarea:hover {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                }
                
                .dark-build-page input[type="text"]:focus,
                .dark-build-page textarea:focus {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                }
                
                .dark-build-page input[type="text"]::placeholder,
                .dark-build-page textarea::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                
                /* InputNumber specific styling */
                .dark-build-input .ant-input-number {
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(26, 26, 46, 0.6) 100%) !important;
                    border: 1px solid rgba(92, 141, 255, 0.3) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-input .ant-input-number:hover {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                }
                
                .dark-build-input .ant-input-number:focus,
                .dark-build-input .ant-input-number-focused {
                    border-color: #5C8DFF !important;
                    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
                }
                
                .dark-build-input .ant-input-number-input {
                    background: transparent !important;
                    color: white !important;
                }
                
                .dark-build-input .ant-input-number-input::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
            `}</style>
            <div className="dark-build-page font-poppins">
                <div className="select-instance-container p-6">
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
                        className="dark-build-modal"
                    >
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <Spin size="large" tip="Searching for the best instance for your project..." />
                            <Text className="dark-build-text">Please wait a moment while the system finds the most suitable resources.</Text>
                        </Space>
                    </Modal>
                    <Tabs items={items} onChange={(key) => setActiveTab(key)} className="dark-build-tabs" />
                </div>
            </div>
        </>
    )
}

export default SelectInstance
