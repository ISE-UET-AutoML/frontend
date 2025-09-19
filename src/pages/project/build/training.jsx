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
	RadarChartOutlined,
	SettingOutlined,
	CloudDownloadOutlined,
	LoadingOutlined,
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

// import { calcGeneratorDuration } from 'framer-motion'

const { Title, Text, Paragraph } = Typography

const calculateElapsedTime = (startTimeValue) => {
	if (!startTimeValue) return 0

	const start = new Date(startTimeValue) // ✅ ensure it's a Date
	const currentTime = new Date()
	return ((currentTime - start) / (1000 * 60)).toFixed(2)
}
// Training Metric Card Component - replacement for AnimatedStatistic
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
				fontFamily: 'Poppins, sans-serif',
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

// Enhanced Line Graph Component
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
							fontFamily: 'Poppins, sans-serif',
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
							fontFamily: 'Poppins, sans-serif',
						},
					}}
					tick={{
						fontSize: 12,
						fill: '#94a3b8',
						fontFamily: 'Poppins, sans-serif',
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
							fontFamily: 'Poppins, sans-serif',
						},
					}}
					domain={[0, 'auto']} // auto-fit to your data
					tick={{
						fontSize: 12,
						fill: '#94a3b8',
						fontFamily: 'Poppins, sans-serif',
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
						fontFamily: 'Poppins, sans-serif',
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
				{maxTrainingTime && (
					<Line
						type="monotone"
						dataKey="threshold"
						stroke="transparent"
						strokeWidth={0}
						name="Max Training Time"
					/>
				)}
			</AreaChart>
		</ResponsiveContainer>
	)
}

// Training Information Card
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
	// Calculate time-based progress
	const timeProgress = maxTrainingTime
		? Math.min((elapsedTime / maxTrainingTime) * 100, 100).toFixed(1)
		: 0
	const getProgressStatus = () => {
		if (status === 'DONE') return 'success'
		if (trainProgress >= 100) return 'exception'
		return 'active'
	}
	return (
		<Card
			title={
				<Title
					level={5}
					style={{
						margin: 0,
						color: 'var(--text)',
						fontFamily: 'Poppins, sans-serif',
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
							fontFamily: 'Poppins, sans-serif',
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
				fontFamily: 'Poppins, sans-serif',
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

				<Divider
					orientation="left"
					style={{
						borderColor: 'rgba(255, 255, 255, 0.2)',
						color: '#94a3b8',
						fontFamily: 'Poppins, sans-serif',
					}}
				>
					Experiment Progress
				</Divider>

				<Row gutter={[16, 16]}>
					{maxTrainingTime > 0 && (
						<Col span={24}>
							<Progress
								percent={trainProgress}
								status={getProgressStatus()}
								strokeColor={{
									'0%': '#3b82f6',
									'100%': '#22d3ee',
								}}
								trailColor="rgba(51, 65, 85, 0.5)"
								format={(percent) =>
									status === 'DONE' ? (
										'Completed'
									) : (
										<span style={{ color: 'var(--text)' }}>
											{percent.toFixed(1)}%
										</span>
									)
								}
								style={{
									fontFamily: 'Poppins, sans-serif',
								}}
							/>
							<div className="mt-2">
								<Text
									type="secondary"
									style={{
										color: '#94a3b8',
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									{status === 'DONE'
										? `Training completed in ${elapsedTime} minutes`
										: timeProgress < 100
											? `Experimenting time remaining approximately ${(maxTrainingTime - elapsedTime).toFixed(2)} minutes`
											: 'Maximum training time reached'}
								</Text>
								{status === 'TRAINING' &&
									trainProgress >= 100 && (
										<Alert
											message="Time limit reached"
											description="Training has reached the maximum time limit and will complete soon."
											type="warning"
											showIcon
											style={{
												marginTop: '8px',
												background:
													'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
												border: '1px solid rgba(251, 191, 36, 0.3)',
												borderRadius: '8px',
												fontFamily:
													'Poppins, sans-serif',
											}}
										/>
									)}
							</div>
						</Col>
					)}
				</Row>
			</Space>
		</Card>
	)
}

// Main Component
const Training = () => {
	const { theme } = useTheme()
	const { projectInfo, updateFields } = useOutletContext()
	const navigate = useNavigate()
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experimentName')
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
	const [currentSettingUpStep, setCurrentSettingUpStep] = useState(0)

	// Handle view results button click
	const handleViewResults = () => {
		navigate(
			PATHS.PROJECT_TRAININGRESULT(
				projectInfo.id,
				experimentId,
				experimentName
			)
		)
	}

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

	const settingUpProgress = [
		{
			title: (
				<span style={{ color: 'var(--text)' }}>
					Initialize Virtual Environment
				</span>
			),
			description: (
				<span style={{ color: '#94a3b8' }}>
					Set up a clean Python virtual environment to isolate project
					dependencies and prevent conflicts.
				</span>
			),
		},
		{
			title: (
				<span style={{ color: 'var(--text)' }}>
					Updating Operating System
				</span>
			),
			description: (
				<span style={{ color: '#94a3b8' }}>
					Update system packages and apply the latest patches to
					ensure compatibility and security.
				</span>
			),
		},
		{
			title: (
				<span style={{ color: 'var(--text)' }}>Installing Tools</span>
			),
			description: (
				<span style={{ color: '#94a3b8' }}>
					Install essential development tools such as compilers,
					package managers, and utilities.
				</span>
			),
		},
		{
			title: (
				<span style={{ color: 'var(--text)' }}>
					Installing Dependencies
				</span>
			),
			description: (
				<span style={{ color: '#94a3b8' }}>
					Download and configure required libraries and frameworks
					from the requirements list.
				</span>
			),
		},
		{
			title: (
				<span style={{ color: 'var(--text)' }}>
					Cleaning up conflicting packages
				</span>
			),
			description: (
				<span style={{ color: '#94a3b8' }}>
					Uninstall or adjust conflicting packages to ensure smooth
					execution of the environment.
				</span>
			),
		},
	]

	useEffect(() => {
		if (currentStep !== 1) return
		const stepCount = settingUpProgress.length

		const interval = setInterval(() => {
			setCurrentSettingUpStep((prev) => {
				if (prev < stepCount - 1) {
					return prev + 1
				}
				clearInterval(interval)
				return prev
			})
		}, 60000)

		return () => clearInterval(interval)
	}, [currentStep])

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
				const configResponse = await getExperimentConfig(experimentId)
				const config = configResponse.data[0]
				setStatus(response.data.status)
				setCurrentStep(getCurrentStep(response.data.status))
				setMaxTrainingTime(
					(prev) => response.data.expected_training_time / 60
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
				setTrainingInfo((prev) => ({
					latestEpoch: latestTrainingInfo?.step || 0,
					accuracy: latestTrainingInfo?.score || 0,
				}))
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
				setElapsedTime(calculateElapsedTime(response.data.start_time))
				setTrainProgress(status === 'DONE' ? 100 : progress)
				console.log('Status: ', response.data.status)

				// Schedule next poll in 10 seconds
				if (response.data.status !== 'DONE') {
					timeoutId = setTimeout(fetchExperiment, 30000)
				}
			} catch (err) {
				console.error('Failed to fetch experiment:', err)
				// Retry after 10 seconds even if it failed
				timeoutId = setTimeout(fetchExperiment, 30000)
			}
		}

		fetchExperiment()

		return () => {
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [experimentId])

	// Create chart data with time limit reference line
	const enhancedChartData = React.useMemo(() => {
		if (!maxTrainingTime || chartData?.length === 0) return chartData

		// Add a threshold reference that can be used for visual cues
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
            `}</style>
			<div
				className="min-h-screen relative"
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
				<div className="relative z-10 p-6">
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
							<Steps
								current={currentStep}
								items={[
									{
										title: (
											<span
												style={{ color: 'var(--text)' }}
											>
												Selecting Instance
											</span>
										),
										icon:
											currentStep !== 0 ? (
												<DatabaseOutlined />
											) : (
												<LoadingOutlined />
											),
										description: (
											<span style={{ color: '#94a3b8' }}>
												Selecting suitable machine for
												you
											</span>
										),
									},
									{
										title: (
											<span
												style={{ color: 'var(--text)' }}
											>
												Downloading Dependencies
											</span>
										),
										icon:
											currentStep !== 1 ? (
												<SettingOutlined />
											) : (
												<LoadingOutlined />
											),
										description: (
											<span style={{ color: '#94a3b8' }}>
												Setting up your machine
											</span>
										),
									},
									{
										title: (
											<span
												style={{ color: 'var(--text)' }}
											>
												Downloading Data
											</span>
										),
										icon:
											currentStep !== 2 ? (
												<CloudDownloadOutlined />
											) : (
												<LoadingOutlined />
											),
										description: (
											<span style={{ color: '#94a3b8' }}>
												Fetching data from cloud storage
											</span>
										),
									},
									{
										title: (
											<span
												style={{ color: 'var(--text)' }}
											>
												Training
											</span>
										),
										icon:
											currentStep !== 3 ? (
												<LineChartOutlined />
											) : (
												<LoadingOutlined />
											),
										description: (
											<span style={{ color: '#94a3b8' }}>
												Preparing your model
											</span>
										),
									},
									{
										title: (
											<span
												style={{ color: 'var(--text)' }}
											>
												Done
											</span>
										),
										icon: <CheckCircleOutlined />,
										description: (
											<span style={{ color: '#94a3b8' }}>
												Finished training your model
											</span>
										),
									},
								]}
							/>

							{status === 'DONE' ? (
								<div className="text-center py-8">
									<div className="mb-4">
										<CheckCircleOutlined
											style={{
												fontSize: '64px',
												color: '#10b981',
												marginBottom: '16px',
											}}
										/>
									</div>
									<Title
										level={3}
										style={{
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
											marginBottom: '8px',
										}}
									>
										Training Completed Successfully!
									</Title>
									<Paragraph
										style={{
											color: '#94a3b8',
											fontFamily: 'Poppins, sans-serif',
											marginBottom: '24px',
											fontSize: '16px',
										}}
									>
										Your model has been trained and is ready
										for use. Click below to view the results
										and performance metrics.
									</Paragraph>
									<Button
										type="primary"
										size="large"
										onClick={handleViewResults}
										style={{
											background:
												'linear-gradient(135deg, #3b82f6, #22d3ee)',
											border: 'none',
											borderRadius: '12px',
											padding: '12px 32px',
											height: 'auto',
											fontSize: '18px',
											fontWeight: '600',
											fontFamily: 'Poppins, sans-serif',
											boxShadow:
												'0 8px 32px rgba(59, 130, 246, 0.3)',
											transition: 'all 0.3s ease',
										}}
										className="hover:shadow-2xl hover:scale-105"
									>
										<CheckCircleOutlined className="mr-2" />
										View Training Results
									</Button>
								</div>
							) : (
								<Alert
									showIcon
									description={
										<div>
											<Paragraph
												style={{
													margin: 0,
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												<Text
													strong
													style={{
														color: '#94a3b8',
														fontFamily:
															'Poppins, sans-serif',
													}}
												>
													{experimentName ===
													'loading'
														? 'Finding the best instance for your project. This may take a few moments...'
														: 'This experiment may take a while. You can safely leave the page at any time, and we will automatically create your model once it is finished.'}
												</Text>
											</Paragraph>
										</div>
									}
									type="info"
									style={{
										background:
											'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))',
										border: '1px solid rgba(59, 130, 246, 0.3)',
										borderRadius: '12px',
										fontFamily: 'Poppins, sans-serif',
									}}
								/>
							)}

							<TrainingInfoCard
								valMetric={valMetric}
								experimentName={
									experimentName === 'loading'
										? 'Finding Instance...'
										: experimentName
								}
								experimentId={experimentId}
								trainingInfo={trainingInfo}
								elapsedTime={elapsedTime}
								status={status}
								maxTrainingTime={maxTrainingTime}
								onViewResults={handleViewResults}
								trainProgress={trainProgress}
							/>
							{currentStep === 1 && (
								<Card
									title={
										<Title
											level={5}
											style={{
												margin: 0,
												color: 'var(--text)',
												fontFamily:
													'Poppins, sans-serif',
											}}
										>
											<SettingOutlined
												style={{
													color: 'var(--accent-text)',
												}}
											/>{' '}
											{'Setting Up Progress'}
										</Title>
									}
									className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
									style={{
										background: 'var(--card-gradient)',
										backdropFilter: 'blur(10px)',
										border: '1px solid var(--border)',
										borderRadius: '12px',
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									<Steps
										progressDot={(
											dot,
											{ status, index }
										) => {
											if (
												index === currentSettingUpStep
											) {
												return <Spin size="small" />
											}
											return dot
										}}
										current={currentSettingUpStep}
										direction="vertical"
										items={settingUpProgress}
									/>
								</Card>
							)}
							{currentStep >= 3 && (
								<Card
									title={
										<Title
											level={5}
											style={{
												margin: 0,
												color: 'var(--text)',
												fontFamily:
													'Poppins, sans-serif',
											}}
										>
											<LineChartOutlined
												style={{
													color: 'var(--accent-text)',
												}}
											/>{' '}
											{`${valMetric ? valMetric : 'Accuracy'} Trend`}
										</Title>
									}
									className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
									style={{
										background: 'var(--card-gradient)',
										backdropFilter: 'blur(10px)',
										border: '1px solid var(--border)',
										borderRadius: '12px',
										fontFamily: 'Poppins, sans-serif',
									}}
									extra={
										maxTrainingTime ? (
											<Tag
												color="orange"
												icon={<HourglassOutlined />}
												style={{
													background:
														'linear-gradient(135deg, #f59e0b, #f97316)',
													border: 'none',
													color: 'white',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												Time Limit:{' '}
												{maxTrainingTime.toFixed(2)} min
											</Tag>
										) : null
									}
								>
									<EnhancedLineGraph
										valMetric={valMetric}
										data={enhancedChartData}
										loading={
											loading && chartData?.length === 0
										}
										maxTrainingTime={maxTrainingTime}
									/>
									{maxTrainingTime &&
										status === 'TRAINING' && (
											<div className="mt-4">
												<Alert
													type={
														elapsedTime >=
														maxTrainingTime
															? 'warning'
															: 'info'
													}
													message={
														<span
															style={{
																color: 'var(--text)',
															}}
														>
															{elapsedTime >=
															maxTrainingTime
																? 'Training Time Limit Reached'
																: 'Training Time Limit'}
														</span>
													}
													description={
														<span
															style={{
																color: 'var(--text)',
															}}
														>
															{elapsedTime >=
															maxTrainingTime
																? 'The training has reached its maximum allocated time. It may automatically stop soon.'
																: `This experiment is configured to run for maximum ${maxTrainingTime.toFixed(2)} minutes.`}
														</span>
													}
													showIcon
													style={{
														background:
															elapsedTime >=
															maxTrainingTime
																? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))'
																: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))',
														border:
															elapsedTime >=
															maxTrainingTime
																? '1px solid rgba(251, 191, 36, 0.3)'
																: '1px solid rgba(59, 130, 246, 0.3)',
														borderRadius: '8px',
														border:
															elapsedTime >=
															maxTrainingTime
																? '1px solid rgba(251, 191, 36, 0.6)'
																: '1px solid rgba(59, 130, 246, 0.6)',
														fontFamily:
															'Poppins, sans-serif',
													}}
												/>
											</div>
										)}
								</Card>
							)}

							<Alert
								description={
									<div>
										<Paragraph
											style={{
												margin: 0,
												fontFamily:
													'Poppins, sans-serif',
											}}
										>
											<RadarChartOutlined
												className="mr-2"
												style={{ color: '#60a5fa' }}
											/>
											<Text
												strong
												style={{
													color: 'var(--text)',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												Understand Metrics:
											</Text>{' '}
											<Text
												style={{
													color: 'var(--text)',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												{metricExplain}
											</Text>
										</Paragraph>

										{maxTrainingTime && (
											<Paragraph
												style={{
													margin: '12px 0 0 0',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												<Tooltip title="Time constraints can affect model performance">
													<HourglassOutlined
														className="mr-2"
														style={{
															color: '#f59e0b',
														}}
													/>
													<Text
														strong
														style={{
															color: 'var(--text)',
															fontFamily:
																'Poppins, sans-serif',
														}}
													>
														Training Time Limit:
													</Text>{' '}
													<Text
														style={{
															color: 'var(--text)',
															fontFamily:
																'Poppins, sans-serif',
														}}
													>
														This experiment has a
														maximum training time of{' '}
														{maxTrainingTime.toFixed(
															2
														)}{' '}
														minutes. If the training
														doesn't converge within
														this time, consider
														adjusting model
														complexity or training
														parameters.
													</Text>
												</Tooltip>
											</Paragraph>
										)}
									</div>
								}
								type="info"
								style={{
									background:
										'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))',
									border: '1px solid rgba(59, 130, 246, 0.3)',
									borderRadius: '12px',
									fontFamily: 'Poppins, sans-serif',
								}}
							/>
						</Space>
					</animated.div>
				</div>
			</div>
		</>
	)
}

export default Training
