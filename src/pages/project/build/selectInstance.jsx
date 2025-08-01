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
} from 'antd'
import {
    ThunderboltOutlined,
    CloudDownloadOutlined,
    SettingOutlined,
    RocketOutlined,
} from '@ant-design/icons'
import { createInstance } from 'src/api/resource'
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

    const handleFindInstance = async () => {
        if (!formData.trainingTime) {
            message.error('Please input training time')
            return
        }

        setIsLoading(true)
        // setIsProcessing(true)
        setIsCreatingInstance(true)

        try {
            // Automatic configuration logic
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

            // cập nhật formData với instance được chọn
            setFormData((prev) => ({
                ...prev,
                service: SERVICES[0].name,
                gpuNumber: selectedGPU.gpuNumber,
                gpuName: selectedGPU.name,
                disk: selectedGPU.disk,
                budget: (selectedGPU.cost * formData.trainingTime).toFixed(2),
            }))

            // const presignUrl = await createDownZipPU(selectedProject.dataset_title)
            // console.log('presignUrl', presignUrl)

            const time = formData.trainingTime
            const cost = (selectedGPU.cost * formData.trainingTime).toFixed(2)
            console.log("Cost:", cost)
            console.log("selectedProject:", selectedProject)
            console.log("projectInfo:", projectInfo)

            const createInstancePayload = {
                training_time: time,
                presets: "medium_quality",
                // dataset_meta_data: selectedProject.dataset_meta_data,
                cost: cost,
                // dataset_url: presignUrl.data,
                // dataset_label_url: 'hello',
                // target_column: selectedProject.meta_data?.target_column,
                // image_column: selectedProject.meta_data?.images_column ? selectedProject.meta_data?.images_column : [],
                // text_column: selectedProject.meta_data?.text_columns ? selectedProject.meta_data?.text_columns : [],
                // dataset_download_method: "",
                // problem_type: selectedProject.meta_data?.is_binary_class ? 'BINARY' : 'MULTICLASS',
                // framework: 'autogluon',
                select_best_machine: true,
                projectID: projectInfo.id
            }
            console.log("createInstancePayload:", createInstancePayload)

            const instance = await createInstance(createInstancePayload)
            const instanceInfo = instance.data
            setInstanceInfo(instanceInfo)
            updateFields({
                instanceInfo,
            })
            console.log('instanceInfo', instanceInfo)
            message.success('Found suitable instance')

        } catch (error) {
            console.error(error)
            message.error('Error finding and creating instance')
        } finally {
            setIsLoading(false)
            // setIsProcessing(false)
            setIsCreatingInstance(false)
        }
    }


    const handleTrainModel = async () => {
        const confirmed = window.confirm(
            'Please confirm your instance information before training?'
        )
        if (!confirmed) return

        try {
            console.log('projectInfo', projectInfo)
            console.log('selectedProject', selectedProject)

            const presignUrl = await createDownZipPU(selectedProject.dataset_title)
            console.log('presignUrl', presignUrl)

            const time = formData.trainingTime
            console.log('time', time)
            console.log('instanceInfo', instanceInfo)

            const payload = {
                trainingTime: time * 3600,
                instanceInfo: instanceInfo,
                presets: 'medium_quality',
                datasetUrl: presignUrl.data,
                datasetLabelUrl: 'hello',
                problemType: selectedProject.meta_data?.is_binary_class ? 'BINARY' : 'MULTICLASS',
                framework: 'autogluon',
                target_column: selectedProject.meta_data?.target_column,
                text_column: selectedProject.meta_data?.text_columns,
                image_column: selectedProject.meta_data?.images_column
            }
            console.log('payloadTrain', payload)
            const res1 = await trainCloudModel(projectInfo.id, payload)

            console.log('res1', res1)
            // Navigate imidiately when send training request
            const experimentName = res1.data.experimentName
            navigate(
                `/app/project/${projectInfo.id}/build/training?experimentName=${experimentName}&experimentId=${res1.data.experimentId}`,
                { replace: true }
            )
        } catch (error) {
            console.error('Error', error)
            message.error('Failed to train model.')
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
                                    icon={<RocketOutlined />}
                                    onClick={handleFindInstance}
                                    loading={isLoading}
                                    disabled={
                                        !formData.trainingTime || isProcessing
                                    }
                                    style={{ marginRight: 16 }}
                                >
                                    {isLoading
                                        ? 'Finding Instance...'
                                        : 'Find Instance'}
                                </Button>

                                {formData.gpuNumber &&
                                    formData.trainingTime && instanceInfo && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<ThunderboltOutlined />}
                                            onClick={handleTrainModel}
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
                                            onClick={handleTrainModel}
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
                                            onClick={handleTrainModel}
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
            <Tabs items={items} onChange={(key) => setActiveTab(key)} />
        </div>
    )
}

export default SelectInstance
