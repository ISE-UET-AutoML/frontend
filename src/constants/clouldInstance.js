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
		color: 'var(--accent-text)',
		instanceDetails: GPU_LEVELS[0],
	},
	Medium: {
		title: '⚖️ Balanced Setup',
		suitable: 'Moderate workloads',
		gpuRange: '2-4 GPUs',
		memory: 'Increased memory capacity',
		recommended: 'Regular training tasks',
		color: 'var(--accent-text)',
		instanceDetails: GPU_LEVELS[1],
	},
	Strong: {
		title: '🔥 Enhanced Performance',
		suitable: 'Larger datasets',
		gpuRange: '4-6 GPUs',
		memory: 'High memory allocation',
		recommended: 'Complex model training',
		color: 'var(--accent-text)',
		instanceDetails: GPU_LEVELS[2],
	},
	'Super Strong': {
		title: '⚡ High Performance',
		suitable: 'Demanding workloads',
		gpuRange: '6-8 GPUs',
		memory: 'Extended memory capacity',
		recommended: 'Large-scale training',
		color: 'var(--accent-text)',
		instanceDetails: GPU_LEVELS[3],
	},
	Rocket: {
		title: '🚀 Maximum Power',
		suitable: 'Enterprise-level tasks',
		gpuRange: '8+ GPUs',
		memory: 'Maximum memory allocation',
		recommended: 'Production deployment',
		color: 'var(--accent-text)',
		instanceDetails: GPU_LEVELS[4],
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
			borderColor: selected ? 'var(--accent-text)' : 'var(--border)',
			backgroundColor: selected
				? 'var(--active-bg)'
				: 'var(--card-gradient)',
			color: 'var(--text)',
		}}
		onClick={onClick}
	>
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<Title level={5} className="mr-10" style={{ color: 'var(--text)' }}>
				{details.title}
			</Title>
			{selected && (
				<Collapse ghost>
					<Panel
						header="Detail"
						key="1"
						style={{ color: 'var(--text)' }}
					>
						<Space direction="vertical" size="small">
							<Text style={{ color: 'var(--secondary-text)' }}>
								Suitable for: {details.suitable}
							</Text>
							<Text style={{ color: 'var(--secondary-text)' }}>
								GPU Range: {details.gpuRange}
							</Text>
							<Text style={{ color: 'var(--secondary-text)' }}>
								Memory: {details.memory}
							</Text>
							<Badge
								color="var(--accent-text)"
								text={
									<span
										style={{
											color: 'var(--secondary-text)',
										}}
									>
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
			title={
				<span
					style={{
						color: 'var(--text)',
						fontFamily: 'Poppins',
						fontWeight: 600,
					}}
				>
					Cost Estimation
				</span>
			}
			className="dark-build-cost-estimator"
			style={{
				background: 'var(--hover-bg)',
				border: '1px solid var(--border)',
				borderRadius: '16px',
			}}
		>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Row justify="space-between">
					<Col>
						<Text style={{ color: 'var(--secondary-text)' }}>
							Hourly Rate:
						</Text>
					</Col>
					<Col>
						<Text strong style={{ color: 'var(--text)' }}>
							${hourlyRate}/hour
						</Text>
					</Col>
				</Row>
				<Row justify="space-between">
					<Col>
						<Text style={{ color: 'var(--secondary-text)' }}>
							Training Hours:
						</Text>
					</Col>
					<Col>
						<Text strong style={{ color: 'var(--text)' }}>
							{hours} hours
						</Text>
					</Col>
				</Row>
				<Divider
					style={{
						margin: '12px 0',
						borderColor: 'var(--divider-color)',
					}}
				/>
				<Row justify="space-between">
					<Col>
						<Text style={{ color: 'var(--secondary-text)' }}>
							Estimated Total:
						</Text>
					</Col>
					<Col>
						<Text
							style={{
								color: 'var(--accent-text)',
								fontWeight: 600,
								fontSize: '18px',
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
			title={
				<Title
					level={4}
					style={{
						color: 'var(--text)',
						fontFamily: 'Poppins',
						fontWeight: 600,
					}}
				>
					Instance Configuration
				</Title>
			}
			extra={
				<SafetyCertificateOutlined
					style={{ fontSize: '24px', color: 'var(--accent-text)' }}
				/>
			}
			className="dark-build-card"
			style={{
				background: 'var(--card-gradient)',
				backdropFilter: 'blur(20px)',
				border: '1px solid var(--border)',
				borderRadius: '20px',
			}}
		>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Row gutter={[16, 16]}>
					<Col span={12}>
						<Card
							size="small"
							title={
								<span
									style={{
										color: 'var(--text)',
										fontFamily: 'Poppins',
										fontWeight: 600,
									}}
								>
									Hardware Specs
								</span>
							}
							style={{
								background: 'var(--hover-bg)',
								border: '1px solid var(--border)',
								borderRadius: '12px',
							}}
						>
							<Space direction="vertical">
								<Text
									style={{
										color: 'var(--secondary-text)',
									}}
								>
									<ThunderboltOutlined
										style={{ color: 'var(--accent-text)' }}
									/>{' '}
									GPUs: {formData.gpuNumber}x{' '}
									{formData.gpuName}
								</Text>
								<Text
									style={{
										color: 'var(--secondary-text)',
									}}
								>
									<HddOutlined
										style={{ color: 'var(--accent-text)' }}
									/>{' '}
									Storage: {formData.disk} GB
								</Text>
								<Text
									style={{
										color: 'var(--secondary-text)',
									}}
								>
									<CloudServerOutlined
										style={{ color: 'var(--accent-text)' }}
									/>{' '}
									Provider: {formData.service}
								</Text>
							</Space>
						</Card>
					</Col>
					<Col span={12}>
						<Card
							size="small"
							title={
								<span
									style={{
										color: 'var(--text)',
										fontFamily: 'Poppins',
										fontWeight: 600,
									}}
								>
									Training Details
								</span>
							}
							style={{
								background: 'var(--hover-bg)',
								border: '1px solid var(--border)',
								borderRadius: '12px',
							}}
						>
							<Space direction="vertical">
								<Text
									style={{
										color: 'var(--secondary-text)',
									}}
								>
									<ClockCircleOutlined
										style={{ color: 'var(--accent-text)' }}
									/>{' '}
									Duration: {formData.trainingTime} hours
								</Text>
								<Text
									style={{
										color: 'var(--secondary-text)',
									}}
								>
									<DollarOutlined
										style={{ color: 'var(--accent-text)' }}
									/>{' '}
									Cost: ${formData.cost}
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
