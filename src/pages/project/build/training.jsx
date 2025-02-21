import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
	useParams,
	useSearchParams,
	useOutletContext,
	useNavigate,
} from 'react-router-dom'
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

const { Step } = Steps
const { Title, Text } = Typography

const Training = () => {
	const { projectInfo, updateFields } = useOutletContext()
	const navigate = useNavigate()

	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experimentName')
	const [trainingInfo, setTrainingInfo] = useState({
		latestEpoch: 0,
		accuracy: 0,
	})
	const [chartData, setChartData] = useState([])
	const [startTime, setStartTime] = useState(null)

	// Utility Functions
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

	useEffect(() => {
		let timeout
		const interval = setInterval(async () => {
			try {
				timeout = setTimeout(() => {
					clearInterval(interval)
				}, 60000)

				clearTimeout(timeout)

				const res = await getExperiment(experimentName)
				if (res.status === 422 || res.status === 500) {
					clearInterval(interval)
					return
				}

				console.log('training call')
				if (res.status === 200) {
					if (res.data.experiment.status === 'DONE') {
						updateFields({ trainingInfo, startTime, chartData })
						clearInterval(interval)
						navigate(
							`/app/project/${projectInfo._id}/build/trainResult`
						)
					} else if (res.data.trainInfo.status === 'TRAINING') {
						setTrainingInfo((prev) => ({
							latestEpoch: res.data.trainInfo.latest_epoch || 0,
							accuracy: res.data.trainInfo.metrics.val_acc || 0,
						}))

						// Ensure startTime is set once at the beginning
						setStartTime(
							(prevStartTime) => prevStartTime || new Date()
						)

						updateChartData(res.data)
					}
				}
			} catch (err) {
				clearInterval(interval)
			}
		}, 20000)

		return () => {
			clearInterval(interval)
			clearTimeout(timeout)
		}
	}, [experimentName, startTime]) // Include startTime as a dependency

	return (
		<Card className="p-6">
			<Row gutter={16}>
				<Col span={12}>
					<Space direction="vertical" style={{ width: '100%' }}>
						<Title level={4}>Current Training Status</Title>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Statistic
									title="Current Epoch"
									value={trainingInfo.latestEpoch}
									prefix={<ExperimentOutlined />}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Current Accuracy"
									value={trainingInfo.accuracy}
									precision={2}
									prefix={<LineChartOutlined />}
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
						<Title level={4}>Accuracy Over Time</Title>
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
	)
}

export default Training
