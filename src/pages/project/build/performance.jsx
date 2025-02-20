import React from 'react'
import {
	Card,
	Row,
	Col,
	Space,
	Statistic,
	Alert,
	Table,
	Button,
	Typography,
} from 'antd'
import {
	CheckCircleOutlined,
	TrophyOutlined,
	ClockCircleOutlined,
	RocketOutlined,
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

const PerformanceStep = ({
	trainingInfo,
	chartData,
	startTime,
	performanceMetrics,
	columns,
	onDeploy,
}) => {
	const getTrainingDuration = (startTime) => {
		const endTime = new Date()
		const duration = Math.floor((endTime - startTime) / 1000)
		const hours = Math.floor(duration / 3600)
		const minutes = Math.floor((duration % 3600) / 60)
		const seconds = duration % 60
		return `${hours}h ${minutes}m ${seconds}s`
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
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
							value={trainingInfo.accuracy}
							precision={2}
							prefix={<TrophyOutlined />}
							suffix="%"
							valueStyle={{ color: '#3f8600' }}
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
							value={trainingInfo.latestEpoch}
							prefix={<RocketOutlined />}
						/>
					</Card>
				</Col>
			</Row>

			{/* Rest of the performance step components... */}
			{/* Add the remaining cards and components from the original performance step */}
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
								onClick={onDeploy}
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

export default PerformanceStep
