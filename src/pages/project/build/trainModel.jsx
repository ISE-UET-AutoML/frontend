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
import { useSpring, animated } from '@react-spring/web'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from 'recharts'

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
				stroke="#8884d8"
				activeDot={{ r: 8 }}
			/>
		</LineChart>
	)
}

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
					setDownloadProgress((prev) => Math.min(prev + 2, 99))
				}
			}
		} catch (err) {
			setError('An error occurred while fetching training progress.')
		} finally {
			setLoading(false)
		}
	}

	const handleTrainingStatus = (data) => {
		if (data.experiment.status === 'DONE') {
			setCurrentStep(2)
			setTimeout(() => {
				props.updateFields({ isDoneTrainModel: true })
			}, 8000)
		} else if (data.trainInfo.status === 'TRAINING') {
			setCurrentStep(1)
			setTrainingInfo({
				latestEpoch: data.trainInfo.latest_epoch,
				accuracy: data.trainInfo.metrics.val_acc,
			})

			console.log('training Infor', data.trainInfo)

			console.log('Training Status', data.experiment.status)
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
					accuracy: data.trainInfo.metrics.val_acc, // Accuracy value
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
									{/* First Space */}
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

									{/* Second Space */}
									<Col span={12}>
										<Space
											direction="vertical"
											size="middle"
											style={{ width: '100%' }}
										>
											{/* Line Chart Here */}
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
