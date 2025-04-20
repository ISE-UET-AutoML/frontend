import React, { useState, useEffect } from 'react'
import { Layout, Menu, Typography, Spin, Select } from 'antd'
import LabelingComponent from '../../components/LabelStudio/LabelingComponent'
import {
	imageClassificationTask,
	objectDetectionTask,
	textClassificationTask,
	namedEntityTask,
} from './sampleTasks'

const { Header, Content } = Layout
const { Title } = Typography
const { Option } = Select

const LabelView = () => {
	const [taskData, setTaskData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [taskType, setTaskType] = useState('image_classification')

	const tasks = {
		image_classification: imageClassificationTask,
		object_detection: objectDetectionTask,
		text_classification: textClassificationTask,
		named_entity: namedEntityTask,
	}

	useEffect(() => {
		setLoading(true)

		// Giả lập việc lấy dữ liệu từ API
		setTimeout(() => {
			setTaskData(tasks[taskType])
			setLoading(false)
		}, 1000)
	}, [taskType])

	const handleTaskTypeChange = (value) => {
		setTaskType(value)
	}

	const handleSubmitLabel = (result) => {
		// Xử lý dữ liệu label sau khi người dùng submit
		console.log('Label results:', result)

		// Gửi dữ liệu đến backend thông qua API
		// fetch('your-api-endpoint', {
		//   method: 'POST',
		//   headers: {
		//     'Content-Type': 'application/json',
		//   },
		//   body: JSON.stringify(result),
		// });
	}

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header style={{ background: '#fff', padding: '0 24px' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Title level={4} style={{ margin: '16px 0' }}>
						AutoML System
					</Title>
					<Menu mode="horizontal" defaultSelectedKeys={['labeling']}>
						<Menu.Item key="training">Training</Menu.Item>
						<Menu.Item key="labeling">Labeling</Menu.Item>
						<Menu.Item key="models">Models</Menu.Item>
					</Menu>
				</div>
			</Header>
			<Content style={{ padding: '24px', background: '#f0f2f5' }}>
				<div style={{ marginBottom: '20px' }}>
					<Select
						style={{ width: 300 }}
						value={taskType}
						onChange={handleTaskTypeChange}
					>
						<Option value="image_classification">
							Phân loại hình ảnh
						</Option>
						<Option value="object_detection">
							Phát hiện đối tượng
						</Option>
						<Option value="text_classification">
							Phân loại văn bản
						</Option>
						<Option value="named_entity">Nhận dạng thực thể</Option>
					</Select>
				</div>

				{loading ? (
					<div style={{ textAlign: 'center', padding: '100px' }}>
						<Spin size="large" tip="Đang tải dữ liệu..." />
					</div>
				) : (
					<LabelingComponent
						taskData={taskData}
						onSubmit={handleSubmitLabel}
					/>
				)}
			</Content>
		</Layout>
	)
}

export default LabelView
