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
} from 'antd'
import {
	DownloadOutlined,
	ExperimentOutlined,
	LineChartOutlined,
	CheckCircleOutlined,
	CloudDownloadOutlined,
} from '@ant-design/icons'
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
import { useSpring, animated } from '@react-spring/web'
import LineGraph from 'src/components/LineGraph'

const { Step } = Steps
const { Title, Text } = Typography

const AnimatedIcon = ({ icon, isActive }) => {
	const styles = useSpring({
		transform: isActive ? 'scale(1.2)' : 'scale(1)',
		config: { tension: 300, friction: 10 },
	})
	return <animated.div style={styles}>{icon}</animated.div>
}

const TrainModel = (props) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')
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

	const steps = [
		{
			icon: <DownloadOutlined style={{ fontSize: '24px' }} />,
			title: 'Downloading Dependencies',
			description:
				'Setting up environment and fetching required packages',
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

	const getTrainingProgress = async (experimentName) => {
		try {
			const res = await getExperiment(experimentName)
			if (res.status === 422 || res.status === 500) {
				setError('Training failed due to an unstable instance.')
				props.updateFields({ isDoneUploadData: true })
				return
			}

			if (res.status === 200) {
				handleTrainingStatus(res.data)
				updateChartData(res.data)
				// Simulate download progress for step 0
				if (currentStep === 0) {
					setDownloadProgress((prev) => Math.min(prev + 15, 99))
				}
			}
		} catch (err) {
			setError('An error occurred while fetching training progress.')
		} finally {
			setLoading(false)
		}
	}

	const handleTrainingStatus = (data) => {
		if (data.trainInfo.status === 'TRAINING') {
			setCurrentStep(1)
			setTrainingInfo({
				latestEpoch: data.trainInfo.latest_epoch,
				accuracy: data.trainInfo.metrics.val_accuracy,
			})

			if (data.experiment.status === 'DONE') {
				setCurrentStep(2)
				// props.updateFields({ isDoneTrainModel: true })
			}
		} else {
			setCurrentStep(0)
		}
	}

	const updateChartData = (data) => {
		if (data.trainInfo.status === 'TRAINING') {
			const currentTime = new Date() // Current timestamp
			if (!startTime) {
				setStartTime(currentTime) // Set start time on the first data point
			}

			// Calculate elapsed time in minutes
			const elapsedTime = (
				(currentTime - startTime) /
				(1000 * 60)
			).toFixed(2)

			setChartData((prev) => [
				...prev,
				{
					time: parseFloat(elapsedTime), // Elapsed time in minutes
					loss: data.trainInfo.metrics.loss, // Loss value
				},
			])
		}
	}

	useEffect(() => {
		getTrainingProgress(experimentName)
		const interval = setInterval(() => {
			getTrainingProgress(experimentName)
		}, 50000)
		return () => clearInterval(interval)
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
												<Statistic
													title="Dependencies Downloaded"
													value={`${downloadProgress}%`}
													prefix={
														<DownloadOutlined />
													}
												/>
											</Card>
										</Col>
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
							<Card>
								<Row gutter={16}>
									{/* Space thứ nhất */}
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
														suffix="%"
														prefix={
															<LineChartOutlined />
														}
													/>
												</Col>
											</Row>
										</Space>
									</Col>

									{/* Space thứ hai */}
									<Col span={12}>
										<Space
											direction="vertical"
											size="middle"
											style={{ width: '100%' }}
										>
											<Title level={4}>
												<LineChartOutlined /> Loss Chart
											</Title>
											<ResponsiveContainer
												width="100%"
												height={200}
											>
												<LineChart
													data={chartData}
													margin={{
														top: 20,
														right: 30,
														left: 20,
														bottom: 10,
													}}
												>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis
														dataKey="time"
														label={{
															value: 'Time (minutes)',
															position: 'rights',
														}}
													/>
													<YAxis
														label={{
															value: 'Loss',
															angle: -90,
															position:
																'insideLeft',
														}}
													/>
													<Tooltip
														formatter={(
															value,
															name,
															props
														) => [
															`${value.toFixed(4)}`, // Format loss value
															`Time: ${props.payload.time.toFixed(2)} minutes`, // Display elapsed time
														]}
													/>
													<Legend />
													<Line
														type="monotone"
														dataKey="loss"
														stroke="#8884d8"
														strokeWidth={2}
														dot={{ r: 4 }}
														activeDot={{ r: 6 }}
													/>
												</LineChart>
											</ResponsiveContainer>
										</Space>
									</Col>
								</Row>
							</Card>
						)}
						{currentStep === 2 && (
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
										type="success"
										showIcon
									/>
								</Space>
							</Card>
						)}
					</>
				)}
			</Space>
		</div>
	)
}

export default TrainModel
