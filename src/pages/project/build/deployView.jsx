import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
	Steps,
	Card,
	Row,
	Col,
	Alert,
	Typography,
	Space,
	Statistic,
	Button,
	Badge,
	Tag,
	message,
	Progress,
} from 'antd'
import {
	RocketOutlined,
	ApiOutlined,
	DatabaseOutlined,
	ThunderboltOutlined,
	CloudDownloadOutlined,
	SettingOutlined,
	UploadOutlined,
	LineChartOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import { validateFiles } from 'src/utils/file'
import * as experimentAPI from 'src/api/experiment'
import config from './config'

const { Step } = Steps
const { Title, Text, Paragraph } = Typography

const AnimatedCard = ({ children, onClick, isSelected }) => {
	const [isHovered, setIsHovered] = useState(false)
	const styles = useSpring({
		transform: isHovered ? 'scale(1.02)' : 'scale(1)',
		boxShadow: isHovered
			? '0 8px 16px rgba(0,0,0,0.1)'
			: '0 2px 8px rgba(0,0,0,0.05)',
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: isSelected ? '#1890ff' : isHovered ? '#40a9ff' : '#f0f0f0',
		config: { tension: 300, friction: 20 },
	})

	return (
		<animated.div
			style={{
				...styles,
				borderRadius: '8px',
				cursor: 'pointer',
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
		>
			{children}
		</animated.div>
	)
}

const AnimatedIcon = ({ icon, isActive }) => {
	const styles = useSpring({
		transform: isActive ? 'scale(1.2)' : 'scale(1)',
		config: { tension: 300, friction: 10 },
	})
	return <animated.div style={styles}>{icon}</animated.div>
}

const DeployView = (props) => {
	const { projectInfo } = props

	console.log('projectInfo1', projectInfo)
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')
	const [isDeploying, setIsDeploying] = useState(false)
	const [selectedOption, setSelectedOption] = useState('')
	const [currentStep, setCurrentStep] = useState(0)
	const [instanceURL, setInstanceURL] = useState(null)
	const [predictResult, setPredictResult] = useState(null)
	const [downloadProgress, setDownloadProgress] = useState(0)
	const [uploadedFiles, setUploadedFiles] = useState(null)

	const deploySteps = [
		{
			icon: <SettingOutlined style={{ fontSize: '24px' }} />,
			title: 'Setting Up',
			description: 'Preparing deployment environment',
		},
		{
			icon: <RocketOutlined style={{ fontSize: '24px' }} />,
			title: 'Launching Service',
			description: 'Starting the prediction service',
		},
		{
			icon: <LineChartOutlined style={{ fontSize: '24px' }} />,
			title: 'Prediction Result',
			description: '',
		},
	]

	const deployOptions = [
		{
			id: 'realtime',
			title: 'Realtime Inference',
			description: 'Deploy for immediate, real-time predictions',
			icon: (
				<ThunderboltOutlined
					style={{ fontSize: '32px', color: '#faad14' }}
				/>
			),
			tags: ['Low Latency', 'High Availability', 'Auto Scaling'],
			stats: {
				latency: '< 100ms',
				uptime: '99.99%',
				scalability: 'Automatic',
			},
			color: '#faad14',
			badge: 'RECOMMENDED',
		},
		{
			id: 'async',
			title: 'Asynchronous Processing',
			description: 'Optimal for handling large batch requests',
			icon: (
				<ApiOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
			),
			tags: ['High Throughput', 'Cost Effective', 'Durable'],
			stats: {
				throughput: '10K req/s',
				durability: '99.999%',
				cost: 'Medium',
			},
			color: '#52c41a',
		},
		{
			id: 'batch',
			title: 'Batch Transform',
			description: 'Process large datasets efficiently',
			icon: (
				<DatabaseOutlined
					style={{ fontSize: '32px', color: '#1890ff' }}
				/>
			),
			tags: ['Large Scale', 'Cost Optimized', 'Scheduled'],
			stats: {
				capacity: 'Unlimited',
				efficiency: '95%',
				schedule: 'Flexible',
			},
			color: '#1890ff',
		},
		{
			id: 'serverless',
			title: 'Serverless Deployment',
			description: 'Pay-per-use with zero infrastructure management',
			icon: (
				<CloudDownloadOutlined
					style={{ fontSize: '32px', color: '#722ed1' }}
				/>
			),
			tags: ['Zero Maintenance', 'Auto Scaling', 'Cost Efficient'],
			stats: {
				scaling: 'Automatic',
				maintenance: 'Zero',
				billing: 'Per Request',
			},
			color: '#722ed1',
		},
	]

	const startDeployment = async () => {
		if (!selectedOption) {
			message.error(
				'Please select a deployment option before proceeding.',
				5
			)
			return
		}

		if (!experimentName) {
			message.error('Experiment name is required.', 5)
			return
		}

		setIsDeploying(true)
		setCurrentStep(0)

		try {
			const { data } = await experimentAPI.deployModel(
				experimentName,
				selectedOption
			)
			setInstanceURL(data.url)

			const interval = setInterval(async () => {
				try {
					const statusResponse =
						await experimentAPI.getDeployStatus(experimentName)
					const { deployInfo } = statusResponse.data

					if (deployInfo.status === 'ONLINE') {
						setCurrentStep(1)
						clearInterval(interval)
						message.success('Deployment completed successfully!', 5)
					} else {
						setCurrentStep(0)
					}
				} catch (err) {
					setIsDeploying(false)
					clearInterval(interval)
					message.error(
						'Error checking deployment status: ' + err.message,
						5
					)
				}
			}, 10000)
		} catch (error) {
			setIsDeploying(false)
			message.error('Failed to start deployment: ' + error.message, 5)
		}
	}

	const handleCancel = () => {
		setIsDeploying(false)
		setSelectedOption('')
		setCurrentStep(0)
	}

	// For uploading predict files
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef(null)

	const handleUploadFiles = async (files) => {
		if (!instanceURL) {
			message.error('No deployment instance URL available')
			return
		}

		const validFiles = validateFiles(files, projectInfo.type)

		setUploadedFiles(validFiles)
		setUploading(true)
		const formData = new FormData()
		formData.append('task', projectInfo.type)

		Array.from(validFiles).forEach((file) => {
			formData.append('files', file)
		})
		console.log('Fetch prediction start')

		try {
			const { data } = await experimentAPI.predictData(
				experimentName,
				formData
			)
			console.log('Fetch prediction successful', data)
			const { predictions } = data

			setPredictResult(predictions)
			setUploading(false)
			setCurrentStep(2)

			message.success('Success Predict', 3)
		} catch (error) {
			message.error('Predict Fail', 3)
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleChange = (event) => {
		const files = event.target.files
		if (files && files.length > 0) {
			handleUploadFiles(files)
		}
	}

	useEffect(() => {
		if (currentStep === 0 && isDeploying) {
			const interval = setInterval(() => {
				setDownloadProgress((prev) => {
					if (prev >= 100) {
						clearInterval(interval)
						return 100
					}
					return prev + Math.floor(Math.random() * (9 - 2 + 1))
				})
			}, 10000)
		}
	}, [currentStep, isDeploying])

	return (
		<div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
			{!isDeploying ? (
				<>
					<Card style={{ marginBottom: '24px' }}>
						<Row align="middle" style={{ marginBottom: '24px' }}>
							<Col span={24}>
								<Space align="center">
									<RocketOutlined
										style={{
											fontSize: '28px',
											color: '#1890ff',
										}}
									/>
									<Title level={3} style={{ margin: 0 }}>
										Deploy {experimentName}
									</Title>
								</Space>
								<Paragraph
									type="secondary"
									style={{
										margin: '16px 0 0',
										fontSize: '16px',
									}}
								>
									Choose your deployment option and launch
									your application with our optimized
									infrastructure
								</Paragraph>
							</Col>
						</Row>
						<Row gutter={[16, 16]}>
							{deployOptions.map((option) => (
								<Col xs={24} md={12} key={option.id}>
									<AnimatedCard
										isSelected={
											selectedOption === option.id
										}
										onClick={() =>
											setSelectedOption(option.id)
										}
									>
										<Card
											bordered={false}
											styles={{ padding: '24px' }}
										>
											<Space
												direction="vertical"
												size="middle"
												style={{ width: '100%' }}
											>
												<Row
													justify="space-between"
													align="middle"
												>
													<Space>
														<div
															style={{
																background: `${option.color}10`,
																padding: '12px',
																borderRadius:
																	'8px',
															}}
														>
															{option.icon}
														</div>
														<Title
															level={4}
															style={{
																margin: 0,
															}}
														>
															{option.title}
														</Title>
													</Space>
													{option.badge && (
														<Badge
															count={option.badge}
															style={{
																backgroundColor:
																	option.color,
																fontSize:
																	'12px',
															}}
														/>
													)}
												</Row>

												<Text
													type="secondary"
													style={{ fontSize: '14px' }}
												>
													{option.description}
												</Text>

												<Space wrap>
													{option.tags.map((tag) => (
														<Tag
															color={option.color}
															key={tag}
														>
															{tag}
														</Tag>
													))}
												</Space>

												<Row gutter={16}>
													{Object.entries(
														option.stats
													).map(([key, value]) => (
														<Col span={8} key={key}>
															<Statistic
																title={
																	key
																		.charAt(
																			0
																		)
																		.toUpperCase() +
																	key.slice(1)
																}
																value={value}
																valueStyle={{
																	fontSize:
																		'14px',
																	color: option.color,
																}}
															/>
														</Col>
													))}
												</Row>
											</Space>
										</Card>
									</AnimatedCard>
								</Col>
							))}
						</Row>
					</Card>

					<Row justify="center">
						<Space>
							<Button
								type="default"
								size="large"
								onClick={handleCancel}
							>
								Cancel
							</Button>
							<Button
								type="primary"
								icon={<RocketOutlined />}
								size="large"
								style={{ fontWeight: 'bold' }}
								onClick={startDeployment}
								disabled={!selectedOption}
							>
								Deploy Now
							</Button>
						</Space>
					</Row>
				</>
			) : (
				<Card>
					<Steps current={currentStep}>
						{deploySteps.map((step, index) => (
							<Step
								key={index}
								title={step.title}
								description={step.description}
								icon={
									<AnimatedIcon
										icon={step.icon}
										isActive={currentStep === index}
									/>
								}
							/>
						))}
					</Steps>

					<div>
						{currentStep === 0 && (
							<Card>
								<Space
									direction="vertical"
									size="middle"
									style={{ width: '100%' }}
								>
									<Title level={4}>
										<CloudDownloadOutlined /> Downloading
										Dependencies
									</Title>
									<Row gutter={[16, 16]}>
										<Col span={24}>
											<Progress
												percent={downloadProgress}
												status="active"
												strokeColor={{
													'0%': '#108ee9',
													'100%': '#87d068',
												}}
											/>
										</Col>
									</Row>
									<Row gutter={[16, 16]}>
										<Col span={12}>
											<Card size="small">
												<Space direction="vertical">
													<Text strong>
														Current Tasks:
													</Text>
													<Text type="secondary">
														• Setting up virtual
														environment
													</Text>
													<Text type="secondary">
														• Installing required
														packages
													</Text>
													<Text type="secondary">
														• Configuring model
														dependencies
													</Text>
												</Space>
											</Card>
										</Col>
									</Row>
								</Space>
							</Card>
						)}

						{currentStep === 1 && (
							<>
								<Alert
									message="Deployment Complete"
									description="Your application has been successfully deployed!"
									type="success"
									showIcon
									style={{ marginTop: '16px' }}
								/>
								<div className="flex flex-col items-center gap-4 mt-10">
									<input
										type="file"
										multiple
										ref={fileInputRef}
										onChange={handleChange}
										className="hidden"
										accept=".csv,.txt,.json,.xlsx,.png,.jpeg"
									/>

									<Button
										type="primary"
										onClick={handleClick}
										loading={uploading}
										icon={<UploadOutlined />}
										size="large"
										className="flex items-center gap-2"
									>
										{uploading
											? 'Predicting...'
											: 'Upload Files to Predict'}
									</Button>
								</div>
							</>
						)}
						{currentStep === 2 && projectInfo && (
							<>
								{(() => {
									const object = config[projectInfo.type]
									if (object) {
										const PredictComponent =
											object.predictView
										return (
											<PredictComponent
												predictResult={predictResult}
												uploadedFiles={uploadedFiles}
												projectInfo={projectInfo}
											/>
										)
									}
									return null
								})()}
							</>
						)}
					</div>
				</Card>
			)}
		</div>
	)
}

export default DeployView
