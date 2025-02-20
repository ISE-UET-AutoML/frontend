import React from 'react'
import { Card, Row, Col, Space, Statistic, Alert, Title } from 'antd'
import { ExperimentOutlined, LineChartOutlined } from '@ant-design/icons'

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

const TrainingStep = ({ trainingInfo, chartData }) => {
	return (
		<Card>
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

export default TrainingStep
