import React, { useState, useEffect, useRef } from 'react'
import {
	useLocation,
	useOutletContext,
	useNavigate,
	useParams,
} from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import {
	Steps,
	Card,
	Row,
	Col,
	Typography,
	Space,
	Statistic,
	Button,
	Badge,
	Tag,
	Modal,
	Tooltip,
	message,
	Progress,
	Timeline,
	Divider,
	Input,
} from 'antd'
import {
	RocketOutlined,
	ApiOutlined,
	DatabaseOutlined,
	ThunderboltOutlined,
	CloudDownloadOutlined,
	SettingOutlined,
	LineChartOutlined,
	LoadingOutlined,
	CheckCircleOutlined,
	InfoCircleOutlined,
	CloudServerOutlined,
	CodeOutlined,
	NodeIndexOutlined,
	CloudUploadOutlined,
	LinkOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import { validateFiles } from 'src/utils/file'
import * as experimentAPI from 'src/api/experiment'
import * as modelAPI from 'src/api/model'
import * as mlServiceAPI from 'src/api/mlService'
import * as resourceAPI from 'src/api/resource'
import config from './config'
import { PATHS } from 'src/constants/paths'

const { Step } = Steps
const { Title, Text, Paragraph } = Typography

const steps = [
	{
		title: 'Creating instance for deployment',
		icon: <SettingOutlined />,
	},
]

const AnimatedCard = ({ children, onClick, isSelected }) => {
	const [isHovered, setIsHovered] = useState(false)
	const styles = useSpring({
		transform: isHovered ? 'scale(1.02)' : 'scale(1)',
		boxShadow: isHovered
			? '0 8px 16px rgba(0,0,0,0.1)'
			: '0 2px 8px rgba(0,0,0,0.05)',
		config: { tension: 300, friction: 20 },
	})

	return (
		<animated.div
			style={{
				...styles,
				borderWidth: 0,
				borderRadius: 12,
				overflow: 'hidden',
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

const DeployView = () => {
	const { theme } = useTheme()
	const navigate = useNavigate()
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const { id: projectId } = useParams()
	const modelId = searchParams.get('modelId')
	const [isDeploying, setIsDeploying] = useState(false)
	const [selectedOption, setSelectedOption] = useState('')
	const [currentStep, setCurrentStep] = useState(0)
	const [isModalVisible, setIsModalVisible] = useState(false)

	// Tính toán Progress tổng
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
		try {
			setIsModalVisible(true)
			const createInstanceRequest =
				await resourceAPI.createInstanceForDeploy()
			console.log('Create instance payload:', createInstanceRequest)
			if (createInstanceRequest.status !== 200) {
				throw new Error('Failed to create instance.')
			}
			const instanceData = createInstanceRequest.data
			const deployRequest = await modelAPI.deployModel(
				modelId,
				instanceData
			)
			console.log(deployRequest)
			if (deployRequest.status !== 200) {
				throw new Error('Failed to deploy model')
			}
			navigate(
				PATHS.SETTING_UP_DEPLOY(
					projectId,
					deployRequest.data?.model_deploy.id,
					deployRequest.data?.model_deploy.model_id
				)
			)
		} catch (e) {
			console.log(e)
			handleCancel()
		}
	}

	const handleCancel = () => {
		setIsDeploying(false)
		setSelectedOption('')
		setCurrentStep(0)
	}

	return (
		<>
			<style>{`
                .theme-build-page {
                    background: var(--surface);
                    min-height: 100vh;
                    padding: 24px;
                }
                
                .theme-build-card {
                    background: var(--card-gradient);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                
                .theme-build-title {
                    background: var(--title-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: var(--title-color);
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                }
                
                .theme-build-text {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-build-text-strong {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-build-button {
                    background: var(--button-primary-bg) !important;
                    border: 1px solid var(--button-primary-border) !important;
                    border-radius: 12px !important;
                    color: var(--button-primary-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
                }
                
                .theme-build-button:hover {
                    background: var(--button-primary-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
                }
                
                .theme-build-button:disabled {
                    background: var(--input-disabled-bg) !important;
                    color: var(--input-disabled-color) !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                
                .theme-build-deploy-card {
                    background: var(--card-gradient);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                .theme-build-deploy-card:hover {
                    background: var(--hover-bg);
                    border-color: var(--border-hover);
                    box-shadow: 0 8px 24px var(--selection-bg);
                }
                
                .theme-build-deploy-card.selected {
                    background: var(--selection-bg);
                    border-color: var(--accent-text);
                    box-shadow: 0 8px 24px var(--selection-bg);
                }
                
                .theme-build-modal .ant-modal-content {
                    background: var(--modal-bg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--modal-border);
                    border-radius: 16px;
                }
                
                .theme-build-modal .ant-modal-header {
                    background: var(--modal-header-bg);
                    border-bottom: 1px solid var(--modal-header-border);
                }
                
                .theme-build-modal .ant-modal-title {
                    color: var(--modal-title-color);
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                }
                
                .theme-build-modal .ant-modal-body {
                    color: var(--text);
                }
                
                .theme-build-steps .ant-steps-item-title {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-build-steps .ant-steps-item-description {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-build-steps .ant-steps-item-icon {
                    background: var(--button-gradient) !important;
                    border-color: var(--accent-text) !important;
                }
                
                .theme-build-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: var(--accent-gradient) !important;
                    border-color: var(--accent-text) !important;
                }

                .theme-build-deploy-card .ant-statistic-title {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .theme-build-deploy-card .ant-statistic-content {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
			<div className="theme-build-page">
				<div style={{ margin: '0 auto' }}>
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
												This process ensures a smooth
												and secure setup:
											</p>
											<ul>
												<li>
													1. Create an isolated
													virtual machine
												</li>
												<li>
													2. Download required
													resources safely
												</li>
												<li>
													3. Configure the environment
													for optimal performance
												</li>
											</ul>
											<p>
												Each step is carefully monitored
												to prevent potential issues.
											</p>
										</div>
									}
								>
									<InfoCircleOutlined
										style={{
											color: 'var(--accent-text)',
											cursor: 'pointer',
										}}
									/>
								</Tooltip>
							</div>
						}
						open={isModalVisible}
						footer={null}
						width={1000}
						className="theme-build-modal"
					>
						<Card className="theme-build-card preparation-card">
							<Steps
								current={currentStep}
								className="theme-build-steps"
							>
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
					<>
						<Card
							className="theme-build-card"
							style={{ marginBottom: '24px' }}
						>
							<Row
								align="middle"
								style={{ marginBottom: '24px' }}
							>
								<Col span={24}>
									<Space align="center">
										<RocketOutlined
											style={{
												fontSize: '28px',
												color: 'var(--accent-text)',
											}}
										/>
										<Title
											level={3}
											className="theme-build-title"
											style={{ margin: 0 }}
										>
											Deploy Model {modelId}
										</Title>
									</Space>
									<Paragraph
										className="theme-build-text"
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
												className={`theme-build-deploy-card ${selectedOption === option.id ? 'selected' : ''}`}
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
																	padding:
																		'12px',
																	borderRadius:
																		'8px',
																}}
															>
																{option.icon}
															</div>
															<Title
																level={4}
																className="theme-build-text-strong"
																style={{
																	margin: 0,
																}}
															>
																{option.title}
															</Title>
														</Space>
														{option.badge && (
															<Badge
																count={
																	option.badge
																}
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
														className="theme-build-text"
														style={{
															fontSize: '14px',
														}}
													>
														{option.description}
													</Text>

													<Space wrap>
														{option.tags.map(
															(tag) => (
																<Tag
																	color={
																		option.color
																	}
																	key={tag}
																>
																	{tag}
																</Tag>
															)
														)}
													</Space>

													<Row gutter={16}>
														{Object.entries(
															option.stats
														).map(
															([key, value]) => (
																<Col
																	span={8}
																	key={key}
																>
																	<Statistic
																		title={
																			<span
																				style={{
																					fontWeight:
																						'bold',
																				}}
																			>
																				{key
																					.charAt(
																						0
																					)
																					.toUpperCase() +
																					key.slice(
																						1
																					)}
																			</span>
																		}
																		value={
																			value
																		}
																		valueStyle={{
																			fontSize:
																				'14px',
																			color: option.color,
																		}}
																	/>
																</Col>
															)
														)}
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
									className="theme-build-button"
									style={{
										background: 'var(--input-bg)',
										border: '1px solid var(--border)',
										color: 'var(--text)',
									}}
								>
									Cancel
								</Button>
								<Button
									type="primary"
									size="large"
									style={{ fontWeight: 'bold' }}
									onClick={startDeployment}
									disabled={!selectedOption}
									className="theme-build-button"
								>
									Deploy Now
								</Button>
							</Space>
						</Row>
					</>
				</div>
			</div>
		</>
	)
}

export default DeployView
