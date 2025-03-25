import React, { useState, useEffect } from 'react'
import {
	useSearchParams,
	useOutletContext,
	useNavigate,
} from 'react-router-dom'
import * as projectAPI from 'src/api/project'
import { getExperiment } from 'src/api/experiment'
import {
	Card,
	Tabs,
	Slider,
	InputNumber,
	Button,
	Space,
	Typography,
	message,
	Tooltip,
	Steps,
	Badge,
	Row,
	Col,
	Divider,
	Modal,
	Collapse,
	Select,
	Input,
} from 'antd'
import {
	ClockCircleOutlined,
	CloudServerOutlined,
	HddOutlined,
	ThunderboltOutlined,
	InfoCircleOutlined,
	LoadingOutlined,
	CloudDownloadOutlined,
	SettingOutlined,
	DollarOutlined,
	RocketOutlined,
	SafetyCertificateOutlined,
} from '@ant-design/icons'
import CryptoJS from 'crypto-js'

const { Title, Text } = Typography
const { Step } = Steps
const { Panel } = Collapse
const { Option } = Select

const SERVICES = [
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

const GPU_NAMES = ['RTX_3060', 'RTX_4090']

const GPU_LEVELS = [
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

const INSTANCE_SIZE_DETAILS = {
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

const InstanceSizeCard = ({ size, details, selected, onClick }) => (
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

const CostEstimator = ({ hours, gpuLevel }) => {
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

const InstanceInfo = ({ formData }) => {
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

const generateRandomKey = () => {
	// Generate a random string to use as a key
	const randomString =
		Math.random().toString(36).substring(2) +
		Math.random().toString(36).substring(2)

	// Use crypto-js to create a SHA-256 hash of the random string
	const hash = CryptoJS.SHA256(randomString).toString()

	// Format as an SSH public key (simplified version)
	return `ssh-rsa ${hash} generated-key`
}

const SelectInstance = () => {
	const { projectInfo, updateFields, selectedDataset } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
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

	const [currentStep, setCurrentStep] = useState(0)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const steps = [
		{
			title: 'Setting up virtual environment',
			icon: <SettingOutlined />,
		},
		{
			title: 'Downloading dataset on Cloud Storage',
			icon: <CloudDownloadOutlined />,
		},
	]

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
		setIsProcessing(true)

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

			setFormData((prev) => ({
				...prev,
				service: SERVICES[0].name,
				gpuNumber: selectedGPU.gpuNumber,
				gpuName: selectedGPU.name,
				disk: selectedGPU.disk,
				budget: (selectedGPU.cost * formData.trainingTime).toFixed(2),
			}))

			message.success('Found suitable instance')
		} catch (error) {
			message.error('Error finding instance')
		} finally {
			setIsLoading(false)
			setIsProcessing(false)
		}
	}

	const handleTrainModel = async () => {
		const confirmed = window.confirm(
			'Please confirm your instance information before training?'
		)
		if (!confirmed) return

		try {
			setIsProcessing(true)
			setIsCreatingInstance(true)
			setIsModalVisible(true)

			// Combine formData with infrastructureData and sshKey for userInfras tab
			const payload =
				activeTab === 'userInfras'
					? {
							...formData,
							sshKey,
							instanceInfo: infrastructureData,
						}
					: formData

			const res1 = await projectAPI.trainModel(
				projectInfo._id,
				selectedDataset,
				payload
			)

			const experimentName = res1.data.data.task_id

			const interval = setInterval(async () => {
				try {
					const res2 = await getExperiment(experimentName)
					console.log('Status', res2.data.trainInfo.status)

					if (res2.data.trainInfo.status === 'TRAINING') {
						updateFields({
							instanceInfor: res1.data.instance_info,
						})
						clearInterval(interval)
						message.success('Starting training process')
						navigate(
							`/app/project/${projectInfo._id}/build/training?experimentName=${experimentName}`,
							{ replace: true }
						)
					} else if (res2.data.trainInfo.status === 'SETTING_UP') {
						setCurrentStep(0)
					} else {
						setCurrentStep(1)
					}
				} catch (err) {
					console.error('Error checking experiment status:', err)
					clearInterval(interval)
					message.error('Failed to check training status')
					setIsProcessing(false)
				}
			}, 10000)

			return () => clearInterval(interval)
		} catch (error) {
			console.error('Can not create instance:', error)
			message.error('Can not create instance')
		}
	}

	const handleModalCancel = () => {
		setIsModalVisible(false)
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
									formData.trainingTime && (
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
									formData.trainingTime && (
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
									formData.trainingTime && (
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

			{isCreatingInstance && (
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
					onCancel={handleModalCancel}
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
			)}
		</div>
	)
}

export default SelectInstance
