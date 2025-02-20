import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getExperiment } from 'src/api/experiment'
import {
	Steps,
	Card,
	Row,
	Col,
	Alert,
	Typography,
	Space,
	Statistic,
	Spin,
	Progress,
	Table,
	Tag,
	Button,
} from 'antd'
import {
	DownloadOutlined,
	ExperimentOutlined,
	LineChartOutlined,
	CheckCircleOutlined,
	CloudDownloadOutlined,
	TrophyOutlined,
	ClockCircleOutlined,
	RocketOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts'

const { Step } = Steps
const { Title, Text } = Typography

// Line Graph Component
const LineGraph = ({ data }) => {
	return (
		<LineChart width={500} height={300} data={data}>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis
				dataKey="time"
				label={{
					value: 'Time (m)',
					position: 'insideRight',
					offset: -10,
				}}
			/>
			<YAxis
				label={{
					value: 'Accuracy',
					angle: -90,
					position: 'insideLeft',
				}}
			/>
			<Tooltip />
			<Legend />
			<Line
				type="monotone"
				dataKey="accuracy"
				stroke="#4e80ee"
				strokeWidth="3"
				activeDot={{ r: 8 }}
			/>
		</LineChart>
	)
}

// Animated Icon Component
const AnimatedIcon = ({ icon, isActive }) => {
	const styles = useSpring({
		transform: isActive ? 'scale(1.2)' : 'scale(1)',
		config: { tension: 300, friction: 10 },
	})
	return <animated.div style={styles}>{icon}</animated.div>
}

// Main Training Steps
const steps = [
	{
		icon: <DownloadOutlined style={{ fontSize: '24px' }} />,
		title: 'Downloading Dependencies',
		description: 'Setting up environment and fetching required packages',
	},
	{
		icon: <ExperimentOutlined style={{ fontSize: '24px' }} />,
		title: 'Training Model',
		description: 'Processing datasets and adjusting model parameters',
	},
	{
		icon: <LineChartOutlined style={{ fontSize: '24px' }} />,
		title: 'Performance Analysis',
		description: 'Evaluating model accuracy and metrics',
	},
]

// Performance Metrics Data
const performanceMetrics = [
	{
		key: '1',
		metric: 'Validation Accuracy',
		value: '95.2%',
		status: <Tag color="green">Excellent</Tag>,
	},
	{
		key: '2',
		metric: 'Training Loss',
		value: '0.142',
		status: <Tag color="blue">Good</Tag>,
	},
	{
		key: '3',
		metric: 'F1 Score',
		value: '0.934',
		status: <Tag color="green">Excellent</Tag>,
	},
	{
		key: '4',
		metric: 'Precision',
		value: '0.928',
		status: <Tag color="blue">Good</Tag>,
	},
]

// Table Columns Configuration
const columns = [
	{
		title: 'Metric',
		dataIndex: 'metric',
		key: 'metric',
	},
	{
		title: 'Value',
		dataIndex: 'value',
		key: 'value',
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
	},
]

const TrainModel = (props) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')

	// State Management
	const [trainingInfo, setTrainingInfo] = useState({
		latestEpoch: 0,
		accuracy: 0,
	})
	const [currentStep, setCurrentStep] = useState(0)
	const [chartData, setChartData] = useState([])
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(true)
	const [downloadProgress, setDownloadProgress] = useState(0)
	const [startTime, setStartTime] = useState(null)

	// Utility Functions
	const getTrainingDuration = (startTime) => {
		const endTime = new Date()
		const duration = Math.floor((endTime - startTime) / 1000) // in seconds
		const hours = Math.floor(duration / 3600)
		const minutes = Math.floor((duration % 3600) / 60)
		const seconds = duration % 60
		return `${hours}h ${minutes}m ${seconds}s`
	}

	const updateChartData = (data) => {
		if (data.trainInfo.status === 'TRAINING') {
			const currentTime = new Date()
			if (!startTime) {
				setStartTime(currentTime)
			}

			const elapsedTime = (
				(currentTime - startTime) /
				(1000 * 60)
			).toFixed(2)

			setChartData((prev) => [
				...prev,
				{
					time: parseFloat(elapsedTime),
					accuracy: data.trainInfo.metrics.val_acc,
				},
			])
		}
	}

	// Effects
	useEffect(() => {
		let timeout
		const interval = setInterval(async () => {
			try {
				// Start a timeout to cancel messages if no response within 1 minute
				timeout = setTimeout(() => {
					clearInterval(interval)
				}, 60000)

				// Clear timeout if response is received
				clearTimeout(timeout)

				const res = await getExperiment(experimentName)
				if (res.status === 422 || res.status === 500) {
					//TODO: Add log for user
					props.updateFields({ isDoneUploadData: true })
					clearInterval(interval)
					return
				}

				if (res.status === 200) {
					if (res.data.experiment.status === 'DONE') {
						setCurrentStep(2)
						clearInterval(interval)
					} else if (res.data.trainInfo.status === 'TRAINING') {
						setDownloadProgress(100)
						setCurrentStep(1)
						setTrainingInfo({
							latestEpoch: res.data.trainInfo.latest_epoch || 0,
							accuracy: res.data.trainInfo.metrics.val_acc || 0,
						})
					} else {
						setCurrentStep(0)
					}

					updateChartData(res.data)
					if (currentStep === 0) {
						setDownloadProgress((prev) =>
							Math.min(
								prev +
									Math.floor(Math.random() * (8 - 2 + 1)) +
									2,
								99
							)
						)
					}
				}
			} catch (err) {
				//TODO: Add log for user
				setCurrentStep(2) // TODO: FIX HERE BECAUSE FETCHING AFTER DELETE VAST
				clearInterval(interval)
			} finally {
				setLoading(false)
			}
		}, 20000)
		return () => {
			clearInterval(interval)
			clearTimeout(timeout)
		}
	}, [experimentName])

	return (
		<div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				{error && (
					<Alert
						message="Error"
						description={error}
						type="error"
						showIcon
					/>
				)}

				<Card>
					<Steps current={currentStep}>
						{steps.map((step, index) => (
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
				</Card>

				{loading ? (
					<Spin size="large" />
				) : (
					<>
						{/* Step 0: Downloading Dependencies */}
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

						{/* Step 1: Training Model */}
						{currentStep === 1 && (
							<Card>
								<Row gutter={16}>
									<Col span={12}>
										<Space
											direction="vertical"
											style={{ width: '100%' }}
										>
											<Title level={4}>
												Current Training Status
											</Title>
											<Row gutter={[16, 16]}>
												<Col span={12}>
													<Statistic
														title="Current Epoch"
														value={
															trainingInfo.latestEpoch
														}
														prefix={
															<ExperimentOutlined />
														}
													/>
												</Col>
												<Col span={12}>
													<Statistic
														title="Current Accuracy"
														value={
															trainingInfo.accuracy
														}
														precision={2}
														prefix={
															<LineChartOutlined />
														}
													/>
												</Col>
											</Row>
										</Space>
									</Col>
									<Col span={12}>
										<Space
											direction="vertical"
											size="middle"
											style={{ width: '100%' }}
										>
											<Title level={4}>
												Accuracy Over Time
											</Title>
											<LineGraph data={chartData} />
										</Space>
									</Col>
								</Row>
								<Row>
									<Col span={24}>
										<Alert
											message="Accuracy"
											description="Accuracy measures the percentage of correct predictions during model training. It helps evaluate performance but may be misleading for imbalanced data."
											type="info"
											showIcon
										/>
									</Col>
								</Row>
							</Card>
						)}

						{/* Step 2: Performance */}
						{currentStep === 2 && (
							<Space
								direction="vertical"
								size="large"
								style={{ width: '100%' }}
							>
								<Card>
									<Space
										direction="vertical"
										size="middle"
										style={{ width: '100%' }}
									>
										<Title level={4}>
											<CheckCircleOutlined
												style={{ color: '#52c41a' }}
											/>{' '}
											Training Complete
										</Title>
										<Alert
											message="Training completed successfully!"
											description="Your model has been trained and is ready for deployment. Review the performance metrics below."
											type="success"
											showIcon
										/>
									</Space>
								</Card>

								<Row gutter={[16, 16]}>
									<Col span={8}>
										<Card>
											<Statistic
												title="Final Accuracy"
												value={trainingInfo.accuracy}
												precision={2}
												prefix={<TrophyOutlined />}
												suffix="%"
												valueStyle={{
													color: '#3f8600',
												}}
											/>
										</Card>
									</Col>
									<Col span={8}>
										<Card>
											<Statistic
												title="Training Duration"
												value={getTrainingDuration(
													startTime
												)}
												prefix={<ClockCircleOutlined />}
											/>
										</Card>
									</Col>
									<Col span={8}>
										<Card>
											<Statistic
												title="Total Epochs"
												value={trainingInfo.latestEpoch}
												prefix={<RocketOutlined />}
											/>
										</Card>
									</Col>
								</Row>

								<Card title="Training Performance Over Time">
									<ResponsiveContainer
										width="100%"
										height={300}
									>
										<LineGraph data={chartData} />
									</ResponsiveContainer>
								</Card>

								<Card title="Detailed Performance Metrics">
									<Table
										columns={columns}
										dataSource={performanceMetrics}
										pagination={false}
									/>
								</Card>

								<Row gutter={[16, 16]}>
									<Col span={12}>
										<Card title="Model Information">
											<Space direction="vertical">
												<Text strong>
													Architecture:
												</Text>
												<Text>
													Deep Neural Network with 3
													hidden layers
												</Text>
												<Text strong>Optimizer:</Text>
												<Text>
													Adam (Learning Rate: 0.001)
												</Text>
												<Text strong>
													Loss Function:
												</Text>
												<Text>
													Categorical Cross-Entropy
												</Text>
											</Space>
										</Card>
									</Col>

									<Col span={12}>
										<Card
											title="🚀 Next Steps"
											bordered={false}
											style={{
												// background: '#f0f2f5',
												borderRadius: 12,
												boxShadow:
													'0 4px 10px rgba(0,0,0,0.1)',
											}}
										>
											<Space
												direction="vertical"
												size="large"
												style={{ width: '100%' }}
											>
												<Alert
													message="Model is ready for deployment"
													description="You can now use this model for predictions on new data."
													type="success"
													showIcon
												/>
												<Button
													type="primary"
													icon={<RocketOutlined />}
													onClick={() => {
														props.updateFields({
															isDoneTrainModel: true,
														})
													}}
													size="large"
													style={{
														width: '100%',
														fontWeight: 'bold',
													}}
												>
													Deploy Now
												</Button>
												<Alert
													message="Download model weights"
													description="Save the trained model weights for future use."
													type="warning"
													showIcon
												/>
												<Button
													type="default"
													icon={
														<CloudDownloadOutlined />
													}
													size="large"
													style={{
														width: '100%',
														fontWeight: 'bold',
													}}
												>
													Download
												</Button>
											</Space>
										</Card>
									</Col>
								</Row>
							</Space>
						)}
					</>
				)}
			</Space>
		</div>
	)
}

export default TrainModel
