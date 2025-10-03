import React, { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import {
	Card,
	Row,
	Col,
	Alert,
	Typography,
	Space,
	Progress,
	Divider,
	Tag,
	Spin,
	Skeleton,
	Steps,
	Button,
	Tooltip,
	Modal,
	Paragraph as AntParagraph,
} from 'antd'
import {
	ExperimentOutlined,
	LineChartOutlined,
	CheckCircleOutlined,
	InfoCircleOutlined,
	DatabaseOutlined,
	BarChartOutlined,
	DashboardOutlined,
	CalendarOutlined,
	HourglassOutlined,
	SettingOutlined,
	CloudDownloadOutlined,
	LoadingOutlined,
	CloseCircleOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import {
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
	ResponsiveContainer,
	Area,
	AreaChart,
} from 'recharts'
import { PATHS } from 'src/constants/paths'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { getExperimentById } from 'src/api/experiment'
import { getExperimentConfig } from 'src/api/experiment_config'
import Loading from 'src/pages/project/build/Loading'

const { Title, Text, Paragraph } = Typography

const calculateElapsedTime = (startTimeValue) => {
	if (!startTimeValue) return 0

	const start = new Date(startTimeValue)
	const currentTime = new Date()
	return ((currentTime - start) / (1000 * 60)).toFixed(2)
}

const TrainingMetricCard = ({
	title,
	value,
	prefix,
	suffix,
	loading,
	icon,
}) => {
	return (
		<Card
			className="h-max border-0 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
			style={{
				background: 'var(--card-gradient)',
				backdropFilter: 'blur(10px)',
				border: '1px solid var(--border)',
				borderRadius: '12px',
			}}
		>
			{loading ? (
				<Skeleton active paragraph={{ rows: 1 }} />
			) : (
				<div className="flex">
					<div className="text-lg font-medium text-gray-300 flex items-center">
						{icon && (
							<span className="mr-2 text-blue-400">{icon}</span>
						)}
						{title}
					</div>
					<div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ml-8">
						{prefix && <span className="mr-1">{prefix}</span>}
						{typeof value === 'number'
							? value % 1 === 0
								? value
								: value.toFixed(2)
							: value}
						{suffix && <span className="ml-1">{suffix}</span>}
					</div>
				</div>
			)}
		</Card>
	)
}

const EnhancedLineGraph = ({ valMetric, data, loading, maxTrainingTime }) => {
	if (loading) {
		return (
			<div className="flex justify-center items-center h-64 w-full">
				<Spin size="large" tip="Loading chart data..." />
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex justify-center items-center h-64 w-full border border-dashed border-slate-600/50 rounded-lg bg-slate-800/20">
				<Space direction="vertical" align="center">
					<LineChartOutlined
						style={{ fontSize: 48, color: '#64748b' }}
					/>
					<Text
						type="secondary"
						style={{
							color: '#94a3b8',
						}}
					>
						Waiting for training data...
					</Text>
				</Space>
			</div>
		)
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<AreaChart
				data={data}
				margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
			>
				<defs>
					<linearGradient
						id="colorAccuracy"
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop
							offset="5%"
							stopColor="#60a5fa"
							stopOpacity={0.8}
						/>
						<stop
							offset="95%"
							stopColor="#22d3ee"
							stopOpacity={0.1}
						/>
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
				<XAxis
					dataKey="step"
					label={{
						value: 'Epoch (Step)',
						position: 'insideBottomRight',
						offset: -5,
						style: {
							fill: '#94a3b8',
						},
					}}
					tick={{
						fontSize: 12,
						fill: '#94a3b8',
					}}
					domain={[0, 'auto']}
				/>
				<YAxis
					label={{
						value: valMetric,
						angle: -90,
						position: 'insideLeft',
						style: {
							fill: '#94a3b8',
						},
					}}
					domain={[0, 'auto']}
					tick={{
						fontSize: 12,
						fill: '#94a3b8',
					}}
				/>
				<RechartsTooltip
					formatter={(value) => [
						`${(value * 1).toFixed(2)}`,
						valMetric,
					]}
					labelFormatter={(label) => `Epoch: ${label} step`}
					contentStyle={{
						backgroundColor: 'rgba(15, 23, 42, 0.95)',
						borderRadius: '8px',
						boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
						border: '1px solid var(--border)',
						color: '#e2e8f0',
					}}
				/>
				<Legend />
				<Area
					type="monotone"
					dataKey="score"
					stroke="#60a5fa"
					strokeWidth={3}
					fillOpacity={1}
					fill="url(#colorAccuracy)"
					activeDot={{
						r: 8,
						stroke: '#60a5fa',
						strokeWidth: 2,
						fill: '#0f172a',
					}}
					name={`Validation ${valMetric}`}
				/>
			</AreaChart>
		</ResponsiveContainer>
	)
}

const TrainingInfoCard = ({
	valMetric,
	experimentName,
	trainingInfo,
	elapsedTime,
	status,
	maxTrainingTime,
	onViewResults,
	trainProgress,
}) => {
	const timeProgress = maxTrainingTime
		? Math.min((elapsedTime / maxTrainingTime) * 100, 100).toFixed(1)
		: 0
	return (
		<Card
			title={
				<Title
					level={5}
					style={{
						margin: 0,
						color: 'var(--text)',
					}}
				>
					<DashboardOutlined style={{ color: '#60a5fa' }} />{' '}
					Experiment Information:{' '}
					<Tag
						color="blue"
						icon={<ExperimentOutlined />}
						style={{
							background:
								'linear-gradient(135deg, #3b82f6, #22d3ee)',
							border: 'none',
							color: 'white',
							marginLeft: '10px',
						}}
					>
						{experimentName}
					</Tag>
				</Title>
			}
			className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
			style={{
				background: 'var(--card-gradient)',
				backdropFilter: 'blur(10px)',
				border: '1px solid var(--border)',
				borderRadius: '12px',
			}}
		>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Row>
					<div className="w-[28%]">
						<TrainingMetricCard
							title="Current Epoch"
							value={trainingInfo.latestEpoch}
							icon={<ExperimentOutlined />}
							loading={
								!trainingInfo.latestEpoch &&
								status === 'TRAINING'
							}
						/>
					</div>
					<div className="w-[28%] ml-10">
						<TrainingMetricCard
							title={`Validation ${valMetric}`}
							value={(trainingInfo.accuracy * 1).toFixed(2)}
							icon={<BarChartOutlined />}
							loading={
								!trainingInfo.accuracy && status === 'TRAINING'
							}
						/>
					</div>
					<div className="w-[28%] ml-10">
						<TrainingMetricCard
							title="Time Elapsed"
							value={elapsedTime}
							suffix="min"
							icon={<CalendarOutlined />}
							loading={status === 'PENDING'}
						/>
					</div>
				</Row>
			</Space>
		</Card>
	)
}

const Training = () => {
	const { theme } = useTheme()
	const { projectInfo, updateFields } = useOutletContext()
	const navigate = useNavigate()
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentId = searchParams.get('experimentId')
	const [trainingInfo, setTrainingInfo] = useState({
		latestEpoch: 0,
		accuracy: 0,
	})
	const [valMetric, setValMetric] = useState('Accuracy')
	const [chartData, setChartData] = useState([])
	const [elapsedTime, setElapsedTime] = useState(0)
	const [status, setStatus] = useState('PENDING')
	const [loading, setLoading] = useState(true)
	const [maxTrainingTime, setMaxTrainingTime] = useState(null)
	const metricExplain = projectInfo.metrics_explain
	const [trainProgress, setTrainProgress] = useState(0)
	const [currentStep, setCurrentStep] = useState(0)
	const [experimentName, setExperimentName] = useState(
		searchParams.get('experimentName') || 'loading'
	)

	const getCurrentStep = (status) => {
		switch (status) {
			case 'SELECTING_INSTANCE':
				return 0
			case 'SETTING_UP':
				return 1
			case 'DOWNLOADING_DATA':
				return 2
			case 'TRAINING':
				return 3
			case 'DONE':
				return 4
			default:
				return 0
		}
	}

	useEffect(() => {
		let timeoutId

		const fetchExperiment = async () => {
			if (!experimentId || experimentId === 'loading') {
				setStatus('SELECTING_INSTANCE')
				setCurrentStep(0)
				setLoading(false)
				return
			}

			try {
				const response = await getExperimentById(experimentId)
				if (
					response.data.name &&
					response.data.name !== experimentName
				) {
					setExperimentName(response.data.name)
				}
				const configResponse = await getExperimentConfig(experimentId)
				const config = configResponse.data[0]
				setStatus(response.data.status)
				setCurrentStep(getCurrentStep(response.data.status))
				setMaxTrainingTime(
					() => response.data.expected_training_time / 60
				)
				setChartData(
					config.metrics?.training_history
						? config.metrics?.training_history
						: []
				)
				const latestTrainingInfo =
					config.metrics?.training_history?.[
						config.metrics.training_history.length - 1
					]
				setTrainingInfo({
					latestEpoch: latestTrainingInfo?.step || 0,
					accuracy: latestTrainingInfo?.score || 0,
				})
				setValMetric(
					config.metrics?.val_metric
						? config.metrics?.val_metric
						: 'Accuracy'
				)
				const elapsed = calculateElapsedTime(response.data.start_time)
				const progress = response.data.expected_training_time
					? Math.min(
							(elapsed /
								(response.data.expected_training_time / 60)) *
								100,
							100
						)
					: 0
				setElapsedTime(elapsed)
				setTrainProgress(
					response.data.status === 'DONE' ? 100 : progress
				)
				console.log('Status: ', response.data.status)

				if (response.data.status === 'DONE') {
					navigate(`/app/project/${projectInfo.id}/build/info`, {
						replace: true,
					})
				} else {
					timeoutId = setTimeout(fetchExperiment, 30000)
				}
			} catch (err) {
				console.error('Failed to fetch experiment:', err)
				timeoutId = setTimeout(fetchExperiment, 30000)
			}
		}

		fetchExperiment()

		return () => {
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [experimentId])

	const enhancedChartData = React.useMemo(() => {
		if (!maxTrainingTime || chartData?.length === 0) return chartData

		return chartData.map((point) => ({
			...point,
			threshold: point.time <= maxTrainingTime ? null : 0,
		}))
	}, [chartData, maxTrainingTime])

	return (
		<>
			<style>{`
                body, html {
                    background-color: var(--surface) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .custom-training-steps .ant-steps-item-icon {
                    width: 64px !important;
                    height: 64px !important;
                    line-height: 64px !important;
                    border-width: 3px !important;
                    box-shadow: none !important;
                    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    margin-bottom: 12px !important;
                }
                
                .custom-training-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: linear-gradient(135deg, #3b82f6, #22d3ee) !important;
                    border-color: #3b82f6 !important;
                    box-shadow: none !important;
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    will-change: transform;
                }
                
                .custom-training-steps .ant-steps-item-process .ant-steps-item-icon .anticon {
                    color: white !important;
                }
                
                .custom-training-steps .ant-steps-item-finish .ant-steps-item-icon {
                    background: var(--card-gradient) !important;
                    border-color: #10b981 !important;
                }
                
                .custom-training-steps .ant-steps-item-finish .ant-steps-item-icon .anticon {
                    color: #10b981 !important;
                }
                
                .custom-training-steps .ant-steps-item-wait .ant-steps-item-icon {
                    background: var(--card-gradient) !important;
                    border-color: var(--border) !important;
                }
                
                .custom-training-steps .ant-steps-item-wait .ant-steps-item-icon .anticon {
                    color: var(--secondary-text) !important;
                }
                
                .custom-training-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
                    background: linear-gradient(90deg, #10b981, #3b82f6) !important;
                    height: 3px !important;
                }
                
                .custom-training-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after {
                    background: linear-gradient(90deg, #3b82f6, var(--border)) !important;
                    height: 3px !important;
                }
                
                .custom-training-steps .ant-steps-item-title {
                    line-height: 1.5 !important;
                    margin-bottom: 16px !important;
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.3px !important;
                }
                
                .custom-training-steps .ant-steps-item-description {
                    margin-top: 0 !important;
                    padding-left: 0 !important;
                    font-size: 15px !important;
                }
                
                .custom-training-steps .ant-steps-item-content {
                    min-height: auto !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                }
                
                .custom-training-steps .ant-steps-item-container {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }
                
                .custom-training-steps .ant-steps-item-tail {
                    left: 50% !important;
                    margin-left: -1px !important;
                }
                
                .custom-training-steps.ant-steps-horizontal {
                    display: flex !important;
                    align-items: center !important;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
            `}</style>
			<div
				className="min-h-screen relative overflow-hidden font-poppins"
				style={{ background: 'var(--surface)' }}
			>
				{theme === 'dark' && (
					<BackgroundShapes
						width="1280px"
						height="1200px"
						shapes={[
							{
								id: 'trainingBlue',
								shape: 'circle',
								size: '600px',
								gradient: {
									type: 'radial',
									shape: 'ellipse',
									colors: [
										'#5C8DFF 0%',
										'#5C8DFF 35%',
										'transparent 75%',
									],
								},
								opacity: 0.35,
								blur: '240px',
								position: { top: '120px', right: '-200px' },
								transform: 'none',
							},
							{
								id: 'trainingCyan',
								shape: 'rounded',
								size: '500px',
								gradient: {
									type: 'radial',
									shape: 'circle',
									colors: [
										'#40FFFF 0%',
										'#40FFFF 45%',
										'transparent 80%',
									],
								},
								opacity: 0.25,
								blur: '200px',
								position: { top: '300px', left: '-180px' },
								transform: 'none',
							},
							{
								id: 'trainingWarm',
								shape: 'rounded',
								size: '450px',
								gradient: {
									type: 'radial',
									shape: 'circle',
									colors: [
										'#FFAF40 0%',
										'#FFAF40 55%',
										'transparent 90%',
									],
								},
								opacity: 0.2,
								blur: '180px',
								position: { bottom: '100px', right: '20%' },
								transform: 'none',
							},
						]}
					/>
				)}
				<div className="relative z-10 px-8 py-6 max-w-7xl mx-auto">
					<animated.div
						style={useSpring({
							from: { opacity: 0, transform: 'translateY(20px)' },
							to: { opacity: 1, transform: 'translateY(0)' },
							config: { tension: 280, friction: 20 },
						})}
					>
						<Space
							direction="vertical"
							size="large"
							style={{ width: '100%' }}
						>
							<div
								style={{
									background: 'transparent',
									padding: '32px 0px',
									marginTop: '40px',
									marginBottom: '40px',
								}}
							>
								<Steps
									current={currentStep}
									className="custom-training-steps"
									items={[
										{
											title: (
												<div>
													<div
														style={{
															color: 'var(--text)',
															fontSize: '16px',
															fontWeight: '600',
															whiteSpace:
																'nowrap',
															marginBottom: '4px',
														}}
													>
														Creating Instance
													</div>
													{currentStep === 0 && (
														<div
															style={{
																color: 'var(--secondary-text)',
																fontSize:
																	'14px',
																fontWeight:
																	'400',
																marginTop:
																	'4px',
															}}
														>
															Setting up...
														</div>
													)}
												</div>
											),
											icon:
												currentStep !== 0 ? (
													<DatabaseOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												) : (
													<LoadingOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												),
										},
										{
											title: (
												<div>
													<div
														style={{
															color: 'var(--text)',
															fontSize: '16px',
															fontWeight: '600',
															whiteSpace:
																'nowrap',
															marginBottom: '4px',
														}}
													>
														Downloading Dependencies
													</div>
													{currentStep === 1 && (
														<div
															style={{
																color: 'var(--secondary-text)',
																fontSize:
																	'14px',
																fontWeight:
																	'400',
																marginTop:
																	'4px',
															}}
														>
															Installing
															packages...
														</div>
													)}
												</div>
											),
											icon:
												currentStep !== 1 ? (
													<SettingOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												) : (
													<LoadingOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												),
										},
										{
											title: (
												<div>
													<div
														style={{
															color: 'var(--text)',
															fontSize: '16px',
															fontWeight: '600',
															whiteSpace:
																'nowrap',
															marginBottom: '4px',
														}}
													>
														Downloading Data
													</div>
													{currentStep === 2 && (
														<div
															style={{
																color: 'var(--secondary-text)',
																fontSize:
																	'14px',
																fontWeight:
																	'400',
																marginTop:
																	'4px',
															}}
														>
															Fetching dataset...
														</div>
													)}
												</div>
											),
											icon:
												currentStep !== 2 ? (
													<CloudDownloadOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												) : (
													<LoadingOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												),
										},
										{
											title: (
												<div>
													<div
														style={{
															color: 'var(--text)',
															fontSize: '16px',
															fontWeight: '600',
															whiteSpace:
																'nowrap',
															marginBottom: '4px',
														}}
													>
														Training
													</div>
													{currentStep === 3 && (
														<div
															style={{
																color: 'var(--secondary-text)',
																fontSize:
																	'14px',
																fontWeight:
																	'400',
																marginTop:
																	'4px',
															}}
														>
															Model training in
															progress...
														</div>
													)}
												</div>
											),
											icon:
												currentStep !== 3 ? (
													<LineChartOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												) : maxTrainingTime &&
												  elapsedTime >=
														maxTrainingTime ? (
													<CloseCircleOutlined
														style={{
															color: '#ef4444',
															fontSize: '32px',
														}}
													/>
												) : (
													<LoadingOutlined
														style={{
															fontSize: '32px',
														}}
													/>
												),
										},
										{
											title: (
												<div>
													<div
														style={{
															color: 'var(--text)',
															fontSize: '16px',
															fontWeight: '600',
															whiteSpace:
																'nowrap',
															marginBottom: '4px',
														}}
													>
														Done
													</div>
													{currentStep === 4 && (
														<div
															style={{
																color: '#10b981',
																fontSize:
																	'14px',
																fontWeight:
																	'600',
																marginTop:
																	'4px',
															}}
														>
															Completed!
														</div>
													)}
												</div>
											),
											icon: (
												<CheckCircleOutlined
													style={{ fontSize: '32px' }}
												/>
											),
										},
									]}
								/>
							</div>

							{status === 'DONE' ? (
								<div className="text-center py-12">
									<div className="mb-6">
										<CheckCircleOutlined
											style={{
												fontSize: '72px',
												color: '#10b981',
												marginBottom: '20px',
											}}
										/>
									</div>
									<Title
										level={2}
										style={{
											color: 'var(--text)',
											marginBottom: '12px',
										}}
									>
										Training Completed Successfully!
									</Title>
									<Paragraph
										style={{
											color: 'var(--secondary-text)',
											marginBottom: '32px',
											fontSize: '16px',
											maxWidth: '600px',
											margin: '0 auto 32px',
										}}
									>
										Your model has been trained and is ready
										for use. Click below to view the results
										and performance metrics.
									</Paragraph>
									<Button
										type="primary"
										size="large"
										onClick={() =>
											navigate(
												PATHS.PROJECT_TRAININGRESULT(
													projectInfo.id,
													experimentId,
													experimentName
												)
											)
										}
										className="hover:shadow-2xl hover:scale-105 transition-all duration-300"
										style={{
											background:
												'linear-gradient(135deg, #3b82f6, #22d3ee)',
											border: 'none',
											borderRadius: '12px',
											padding: '14px 40px',
											height: 'auto',
											fontSize: '16px',
											fontWeight: '600',
											boxShadow:
												'0 8px 32px rgba(59, 130, 246, 0.3)',
										}}
									>
										<CheckCircleOutlined className="mr-2" />
										View Training Results
									</Button>
								</div>
							) : (
								<Loading currentStep={currentStep} />
							)}
						</Space>
					</animated.div>
				</div>
			</div>
		</>
	)
}

export default Training
