import React, { useState } from 'react'
import {
	useSearchParams,
	useOutletContext,
	useNavigate,
} from 'react-router-dom'
import {
	Card,
	Tabs,
	InputNumber,
	Slider,
	Select,
	Button,
	Space,
	Typography,
	message,
	Tooltip,
	Steps,
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
} from '@ant-design/icons'
import * as projectAPI from 'src/api/project'
import { getExperiment } from 'src/api/experiment'

const { Title, Text } = Typography
const { Step } = Steps

const SERVICES = ['VastAI', 'AWS EC2', 'GCP Compute']
const GPU_NAMES = ['RTX_3060', 'RTX_4090']
const GPU_LEVELS = [
	{ name: 'RTX 3060', gpuNumber: 1, disk: 10, cost: 0.2 },
	{ name: 'RTX 3070', gpuNumber: 2, disk: 20, cost: 0.4 },
	{ name: 'RTX 3080', gpuNumber: 4, disk: 30, cost: 0.8 },
	{ name: 'RTX 3090', gpuNumber: 6, disk: 40, cost: 1.0 },
	{ name: 'RTX 4090', gpuNumber: 8, disk: 50, cost: 2.0 },
]

const INSTANCE_SIZE_INFO = `
🛠️Weak (Basic Configuration):
• Suitable for small datasets and simple models
• 1-2 GPUs
• Basic memory allocation
• Recommended for testing and development

⚖️Medium (Balanced Setup):
• Optimal for moderate workloads
• 2-4 GPUs
• Increased memory capacity
• Good for regular training tasks

🔥Strong (Enhanced Performance):
• Designed for larger datasets
• 4-6 GPUs
• High memory allocation
• Ideal for complex model training

⚡Super Strong (High Performance):
• Built for demanding workloads
• 6-8 GPUs
• Extended memory capacity
• Perfect for large-scale training

🚀Rocket (Maximum Power):
• Ultimate performance configuration
• 8+ GPUs
• Maximum memory allocation
• Best for enterprise-level training
`

const InstanceInfo = ({ formData }) => (
	<Card
		className="h-full"
		style={{
			background: '#f0f5ff',
			borderStyle: 'dashed',
			borderColor: '#1890ff',
		}}
	>
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Title level={4} style={{ textAlign: 'center', margin: 0 }}>
				Instance Information
			</Title>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<InfoItem
					icon={<CloudServerOutlined />}
					label="Service"
					value={formData.service}
				/>
				<InfoItem
					icon={<ThunderboltOutlined />}
					label="GPU Number"
					value={formData.gpuNumber}
				/>
				<InfoItem
					icon={<ThunderboltOutlined />}
					label="GPU Name"
					value={formData.gpuName}
				/>
				<InfoItem
					icon={<HddOutlined />}
					label="Disk"
					value={formData.disk && `${formData.disk} GB`}
				/>
				<InfoItem
					icon={<ClockCircleOutlined />}
					label="Training Time"
					value={
						formData.trainingTime &&
						`${formData.trainingTime} hours`
					}
				/>
			</Space>
		</Space>
	</Card>
)

const InfoItem = ({ icon, label, value }) => (
	<Space>
		{icon}
		<Text strong>{label}:</Text>
		<Text>{value || '-'}</Text>
	</Space>
)
const SelectInstance = () => {
	const { projectInfo, updateFields, selectedDataset } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const [activeTab, setActiveTab] = useState('automatic')
	const [isLoading, setIsLoading] = useState(false)
	const [isCreatingInstance, setIsCreatingInstance] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [formData, setFormData] = useState({
		service: SERVICES[0],
		gpuNumber: '',
		gpuName: GPU_NAMES[0],
		disk: '',
		trainingTime: '',
		budget: '',
	})

	const [currentStep, setCurrentStep] = useState(0)

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

	const handleFindInstance = async () => {
		if (!formData.trainingTime) {
			message.error('Please input training time')
			return
		}

		setIsLoading(true)
		setIsProcessing(true)

		try {
			// Determine the instance size based on the slider value
			let instanceSize
			if (formData.instanceSize <= 0) {
				instanceSize = 'Weak'
			} else if (formData.instanceSize <= 25) {
				instanceSize = 'Medium'
			} else if (formData.instanceSize <= 50) {
				instanceSize = 'Strong'
			} else if (formData.instanceSize <= 75) {
				instanceSize = 'Super Strong'
			} else {
				instanceSize = 'Rocket'
			}

			// Find the most suitable GPU configuration
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

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1500))

			setFormData((prev) => ({
				...prev,
				service: SERVICES[0],
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

			const res1 = await projectAPI.trainModel(
				projectInfo._id,
				selectedDataset,
				formData
			)

			const experimentName = res1.data.data.task_id

			// Simulate the progress of instance initialization
			const interval = setInterval(async () => {
				try {
					const res2 = await getExperiment(experimentName)
					console.log('Status', res2.data.trainInfo.status)

					// Next Page
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

	const items = [
		{
			key: 'automatic',
			label: 'Automatic',
			children: (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: 24,
						marginTop: 24,
					}}
				>
					<Space
						direction="vertical"
						size="large"
						style={{ width: '100%' }}
					>
						<Card loading={isLoading}>
							<Space
								direction="vertical"
								size="large"
								style={{ width: '100%' }}
							>
								<div>
									<Text strong>Training Time (hours)</Text>
									<InputNumber
										style={{ width: '100%', marginTop: 8 }}
										min={0}
										value={formData.trainingTime}
										onChange={(value) =>
											setFormData((prev) => ({
												...prev,
												trainingTime: value,
											}))
										}
										prefix={<ClockCircleOutlined />}
									/>
								</div>

								<div>
									<Space align="center">
										<Text strong>Instance Size</Text>
										<Tooltip
											title={
												<div
													style={{
														whiteSpace: 'pre-wrap',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
														fontSize: '14px',
														lineHeight: '1.6',
														color: 'black',
													}}
												>
													{INSTANCE_SIZE_INFO}
												</div>
											}
											placement="right"
											overlayInnerStyle={{
												backgroundColor: 'white',
												color: 'black',
												padding: '16px',
												minWidth: '330px',
												border: '1px solid #d9d9d9',
												borderRadius: '8px',
												boxShadow:
													'0 2px 8px rgba(0,0,0,0.15)',
											}}
											color="white"
										>
											<InfoCircleOutlined
												style={{
													color: '#1890ff',
													cursor: 'help',
													fontSize: '16px',
												}}
											/>
										</Tooltip>
									</Space>
									<Slider
										marks={{
											0: 'Weak',
											25: 'Medium',
											50: 'Strong',
											75: 'Super Strong',
											100: 'Rocket',
										}}
										step={25}
										value={formData.instanceSize}
										onChange={(value) =>
											setFormData((prev) => ({
												...prev,
												instanceSize: value,
											}))
										}
									/>
								</div>
								{formData.budget && (
									<div>
										<Text strong>Estimated Cost: </Text>
										<Text type="success">
											${formData.budget}
										</Text>
									</div>
								)}

								<Button
									type="primary"
									block
									onClick={handleFindInstance}
									disabled={
										!formData.trainingTime || isLoading
									}
									loading={isLoading}
								>
									Find Suitable Instance
								</Button>
							</Space>
						</Card>
					</Space>

					<InstanceInfo formData={formData} />
				</div>
			),
		},
		{
			key: 'manual',
			label: 'Manual',
			children: (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: 24,
						marginTop: 24,
					}}
				>
					<Card>
						<Space
							direction="vertical"
							size="large"
							style={{ width: '100%' }}
						>
							<div>
								<Text strong>Service</Text>
								<Select
									style={{ width: '100%', marginTop: 8 }}
									value={formData.service}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											service: value,
										}))
									}
								>
									{SERVICES.map((service) => (
										<Select.Option
											key={service}
											value={service}
										>
											{service}
										</Select.Option>
									))}
								</Select>
							</div>

							<div>
								<Text strong>GPU Number</Text>
								<InputNumber
									style={{ width: '100%', marginTop: 8 }}
									min={1}
									value={formData.gpuNumber}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											gpuNumber: value,
										}))
									}
								/>
							</div>

							<div>
								<Text strong>GPU Name</Text>
								<Select
									style={{ width: '100%', marginTop: 8 }}
									value={formData.gpuName}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											gpuName: value,
										}))
									}
								>
									{GPU_NAMES.map((gpu) => (
										<Select.Option key={gpu} value={gpu}>
											{gpu}
										</Select.Option>
									))}
								</Select>
							</div>

							<div>
								<Text strong>Disk Size (GB)</Text>
								<InputNumber
									style={{ width: '100%', marginTop: 8 }}
									min={10}
									value={formData.disk}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											disk: value,
										}))
									}
								/>
							</div>

							<div>
								<Text strong>Training Time (hours)</Text>
								<InputNumber
									style={{ width: '100%', marginTop: 8 }}
									min={1}
									value={formData.trainingTime}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											trainingTime: value,
										}))
									}
								/>
							</div>
						</Space>
					</Card>

					<InstanceInfo formData={formData} />
				</div>
			),
		},
	]

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
			{/* {isProcessing && <LoadingOverlay />} */}

			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				type="card"
				size="large"
				items={items}
			/>

			{isCreatingInstance && (
				<Card style={{ marginTop: 24 }}>
					<Steps current={currentStep}>
						{steps.map((step, index) => (
							<Step
								key={index}
								title={step.title}
								icon={
									currentStep === index ? (
										<LoadingOutlined spin />
									) : (
										step.icon
									)
								}
								status={
									currentStep === index
										? 'process'
										: currentStep > index
											? 'finish'
											: 'wait'
								}
							/>
						))}
					</Steps>
				</Card>
			)}

			{formData.gpuNumber &&
				formData.trainingTime &&
				!isCreatingInstance && (
					//TODO: Change buttuon here
					<div className="flex justify-center mt-6">
						<button
							className="btn relative"
							onClick={handleTrainModel}
							disabled={isProcessing}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="size-6 text-white"
							>
								<path
									fillRule="evenodd"
									d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="text">
								{isProcessing ? 'Processing...' : 'Train Model'}
							</span>
						</button>
					</div>
				)}
		</div>
	)
}

export default SelectInstance
