import React, { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import {
	Card,
	Row,
	Col,
	Alert,
	Typography,
	Space,
	Statistic,
	Table,
	Tag,
	Button,
} from 'antd'
import {
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

const { Title, Text } = Typography

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

const TrainResult = () => {
	console.log('context', useOutletContext())
	const { projectInfo, trainingInfo, startTime, chartData } =
		useOutletContext()

	const navigate = useNavigate()
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experimentName')

	const getTrainingDuration = (startTime) => {
		const endTime = new Date()
		const duration = Math.floor((endTime - startTime) / 1000) // in seconds
		const hours = Math.floor(duration / 3600)
		const minutes = Math.floor((duration % 3600) / 60)
		const seconds = duration % 60
		return `${hours}h ${minutes}m ${seconds}s`
	}
	return (
		<Space
			direction="vertical"
			size="large"
			style={{ width: '100%', padding: '24px' }}
		>
			<Card>
				<Space
					direction="vertical"
					size="middle"
					style={{ width: '100%' }}
				>
					<Title level={4}>
						<CheckCircleOutlined style={{ color: '#52c41a' }} />{' '}
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
							value={trainingInfo ? trainingInfo.accuracy : 0}
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
							value={getTrainingDuration(startTime)}
							prefix={<ClockCircleOutlined />}
						/>
					</Card>
				</Col>
				<Col span={8}>
					<Card>
						<Statistic
							title="Total Epochs"
							value={trainingInfo ? trainingInfo.latestEpoch : 0}
							prefix={<RocketOutlined />}
						/>
					</Card>
				</Col>
			</Row>

			<Card title="Training Performance Over Time">
				<ResponsiveContainer width="100%" height={300}>
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
							<Text strong>Architecture:</Text>
							<Text>
								Deep Neural Network with 3 hidden layers
							</Text>
							<Text strong>Optimizer:</Text>
							<Text>Adam (Learning Rate: 0.001)</Text>
							<Text strong>Loss Function:</Text>
							<Text>Categorical Cross-Entropy</Text>
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
							boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
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
									navigate(
										`/app/project/${projectInfo._id}/build/deployView?experimentName=${experimentName}`
									)
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
								icon={<CloudDownloadOutlined />}
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
	)
}

export default TrainResult
