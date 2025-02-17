import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
	Card,
	Tabs,
	InputNumber,
	Slider,
	Select,
	Button,
	Alert,
	Space,
	Typography,
	message,
	Tooltip,
} from 'antd'
import {
	ClockCircleOutlined,
	CloudServerOutlined,
	HddOutlined,
	ThunderboltOutlined,
	InfoCircleOutlined,
} from '@ant-design/icons'
import * as projectAPI from 'src/api/project'

const { Title, Text } = Typography
const { TabPane } = Tabs

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

const SelectInstance = ({ selectedDataset, updateFields }) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const { id: projectID } = useParams()
	const [activeTab, setActiveTab] = useState('automatic')
	const [isLoading, setIsLoading] = useState(false)
	const [isCreatingInstance, setIsCreatingInstance] = useState(false)
	const [formData, setFormData] = useState({
		service: SERVICES[0],
		gpuNumber: '',
		gpuName: GPU_NAMES[0],
		disk: '',
		trainingTime: '',
		budget: '',
	})

	const handleFindInstance = () => {
		if (!formData.trainingTime) {
			message.error('Please input training time')
			return
		}

		setIsLoading(true)

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
			instanceSize = 'TA dep trai'
		}

		// Find the most suitable GPU configuration based on the instance size
		let selectedGPU
		switch (instanceSize) {
			case 'Weak':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 1) // 1 GPU
				break
			case 'Medium':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 2) // 2 GPUs
				break
			case 'Strong':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 4) // 4 GPUs
				break
			case 'Super Strong':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 6) // 6 GPUs
				break
			case 'TA dep trai':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 8) // 8 GPUs
				break
			default:
				selectedGPU = GPU_LEVELS[0] // Fallback to the first configuration
				break
		}

		// Simulate a delay for finding the instance (e.g., API call)
		setTimeout(() => {
			setFormData((prev) => ({
				...prev,
				service: SERVICES[0], // Default to the first service
				gpuNumber: selectedGPU.gpuNumber,
				gpuName: selectedGPU.name,
				disk: selectedGPU.disk,
				budget: (selectedGPU.cost * formData.trainingTime).toFixed(2), // Calculate cost
			}))
			setIsLoading(false)
			message.success('Found suitable instance')
		}, 1500) // Simulate a 1.5-second delay
	}

	const handleTrainModel = async () => {
		const confirmed = window.confirm(
			'Please confirm your instance information before training?'
		)
		if (!confirmed) return

		try {
			setIsCreatingInstance(true)
			const res = await projectAPI.trainModel(
				projectID,
				selectedDataset,
				formData
			)

			searchParams.set('experiment_name', res.data.data.task_id)
			setSearchParams(searchParams)

			updateFields({
				isDoneSelectInstance: true,
				instanceInfor: res.data.instance_info,
			})

			message.success('Starting training process')
		} catch (error) {
			console.error('Can not create instance:', error)
			message.error('Can not create instance')
		} finally {
			setIsCreatingInstance(false)
		}
	}

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				type="card"
				size="large"
			>
				<TabPane tab="Automatic" key="automatic">
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
										<Text strong>
											Training Time (hours)
										</Text>
										<InputNumber
											style={{
												width: '100%',
												marginTop: 8,
											}}
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
															whiteSpace:
																'pre-wrap',
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
												100: 'TA dep trai',
											}}
											step={25}
											// defaultValue={50}
											value={formData.instanceSize} // Bind slider to formData
											onChange={(value) =>
												setFormData((prev) => ({
													...prev,
													instanceSize: value, // Update state on change
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
				</TabPane>

				<TabPane tab="Manual" key="manual">
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
											<Select.Option
												key={gpu}
												value={gpu}
											>
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
				</TabPane>
			</Tabs>

			{isCreatingInstance && (
				<Alert
					message="Initializing instance..."
					description="This process usually takes about 45 seconds to 1 minute."
					type="info"
					showIcon
					style={{ marginTop: 24 }}
				/>
			)}

			{formData.gpuNumber &&
				formData.trainingTime &&
				!isCreatingInstance && (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: 24,
						}}
					>
						<button className="btn" onClick={handleTrainModel}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-6 text-white"
							>
								<path
									fill-rule="evenodd"
									d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
									clip-rule="evenodd"
								/>
							</svg>

							<span className="text">Train Model</span>
						</button>
					</div>
				)}
		</div>
	)
}

export default SelectInstance
