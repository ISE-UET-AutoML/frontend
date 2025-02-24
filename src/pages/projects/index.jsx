import { useReducer, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Layout,
	Typography,
	Button,
	Card,
	Empty,
	Tooltip,
	Modal,
	Statistic,
	Row,
	Col,
	Space,
	Alert,
	Input,
	Table,
	message,
	Tag,
} from 'antd'
import {
	PlusOutlined,
	ProjectOutlined,
	RobotOutlined,
	UserOutlined,
	InfoCircleOutlined,
	FileTextOutlined,
	DatabaseOutlined,
	AimOutlined,
	SendOutlined,
	PaperClipOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import instance from 'src/api/axios'
import { API_URL } from 'src/constants/api'
import { PATHS } from 'src/constants/paths'
import { TYPES } from 'src/constants/types'
import ProjectCard from './card'
import * as datasetAPI from 'src/api/dataset'

// Import images
import class_img from 'src/assets/images/classification_img.jpg'
import object_detection from 'src/assets/images/object-detection.png'
import segmentaion_img from 'src/assets/images/segmentation_img.jpg'
import tabular_img from 'src/assets/images/tabular_img.jpg'
import text_classification from 'src/assets/images/text_classification.jpg'
import multimodal_classification from 'src/assets/images/multimodal_classification.png'
import ChatbotImage from 'src/assets/images/chatbot.png'
import NormalImage from 'src/assets/images/normal.png'

const { Title, Text, Paragraph } = Typography
const { Content } = Layout
const { TextArea } = Input

const projType = Object.keys(TYPES)

const imgArray = [
	class_img,
	text_classification,
	tabular_img,
	multimodal_classification,
	object_detection,
	segmentaion_img,
]

const typeDescription = [
	'Identify and categorize objects in images.',
	'Categorize text data based on content.',
	'Classify tabular data rows.',
	'Combine data sources for accurate classification.',
	'Identify objects with bounding boxes.',
	'Segment images to locate objects or regions.',
]

const initialState = {
	showUploader: false,
	showUploaderManual: false,
	showUploaderChatbot: false,
	showSelectData: false,
	projects: [],
}

export default function Projects() {
	const [projectState, updateProjState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	const navigate = useNavigate()
	const [isSelected, setIsSelected] = useState(projType.map(() => false))
	const [input, setInput] = useState('')
	const [selectedDataset, setSelectedDataset] = useState(null)
	const [datasets, setDatasets] = useState([])
	const [showTitle, setShowTitle] = useState(true)
	const [messages, setMessages] = useState([])
	const textareaRef = useRef(null)

	const options = [
		{
			id: 'chatbot',
			title: 'AI Assistant',
			description:
				'Let our AI guide you through project creation step by step',
			image: ChatbotImage,
			icon: <RobotOutlined />,
			action: () => updateProjState({ showUploaderChatbot: true }),
		},
		{
			id: 'normal',
			title: 'Manual Creation',
			description:
				'Create your project with full control over all settings',
			image: NormalImage,
			icon: <UserOutlined />,
			action: () => updateProjState({ showUploaderManual: true }),
		},
	]

	useEffect(() => {
		// const textarea = textareaRef.current
		const textarea = textareaRef.current?.resizableTextArea?.textArea

		if (!textarea) return

		// Reset height to auto to get the correct scrollHeight
		textarea.style.height = 'auto'

		// Set new height based on scrollHeight
		const newHeight = Math.max(
			textarea.scrollHeight, // actual content height
			40 // minimum height in pixels for one line
		)

		textarea.style.height = `${newHeight}px`
	}, [input]) // Re-run when input changes

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (input.trim()) {
				setShowTitle(false)
				setMessages([...messages, { type: 'user', content: input }])
				setInput('')
			}
		}
	}

	const selectType = (e, idx) => {
		const tmpArr = isSelected.map((el, index) => {
			if (index === idx) el = true
			else el = false
			return el
		})
		setIsSelected(tmpArr)
	}

	const handleCreateProject = async (event) => {
		event.preventDefault()

		const formData = new FormData(event.target)
		const data = Object.fromEntries(formData)
		isSelected.forEach((el, idx) => {
			if (el) data.type = projType[idx]
		})

		try {
			const response = await instance.post(API_URL.all_projects, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			console.log('create Project response', { response })

			if (response.status === 200) {
				navigate(PATHS.PROJECT_BUILD(response.data._id))
			}
		} catch (error) {
			message.error('Project already existed')
		}
	}

	const getProjects = async () => {
		const response = await instance.get(API_URL.all_projects)
		updateProjState({ projects: response.data })
		console.log('Project List', response.data)

		return response.data
	}

	const getDatasets = async () => {
		if (datasets.length > 0) {
			updateProjState({ showSelectData: true })
			return datasets
		}
		try {
			const response = await datasetAPI.getDatasets()
			updateProjState({ showSelectData: true })
			setDatasets(response.data)

			console.log('Dataset List:', response.data)

			return response.data
		} catch (error) {
			console.error('Error fetching datasets:', error)
			return []
		}
	}

	useEffect(() => {
		projectState.projects.length >= 0 && getProjects()
	}, [])

	return (
		<Layout className="min-h-screen bg-white">
			<Content className="p-6">
				{/* Header Section */}
				<Row justify="space-between" align="middle" className="mb-4">
					<Col>
						<Space direction="vertical" size={1}>
							<Title level={1}>
								<ProjectOutlined className="mr-3" />
								Projects
							</Title>
							<Paragraph type="secondary" className="w-max">
								Create and manage your AI projects. Choose from
								various types of machine learning models to
								solve your specific problems.
							</Paragraph>
						</Space>
					</Col>
					<Col>
						<Tooltip title="Create a new project with AI assistance or manual setup">
							<Button
								type="primary"
								size="large"
								icon={<PlusOutlined />}
								onClick={() =>
									updateProjState({ showUploader: true })
								}
							>
								New Project
							</Button>
						</Tooltip>
					</Col>
				</Row>

				{/* Projects Grid */}
				{projectState.projects.length > 0 ? (
					<Row gutter={[16, 16]} className="">
						{projectState.projects.map((project) => (
							<Col xs={24} sm={12} xl={8} key={project._id}>
								<ProjectCard
									project={project}
									getProjects={getProjects}
								/>
							</Col>
						))}
					</Row>
				) : (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={
							<Space direction="vertical" align="center">
								<Text strong>No Projects Yet</Text>
								<Text type="secondary">
									Start by creating your first AI project
								</Text>
								<Button
									type="primary"
									onClick={() =>
										updateProjState({ showUploader: true })
									}
								>
									Create Project
								</Button>
							</Space>
						}
					/>
				)}

				{/* Creation Method Modal */}
				<Modal
					open={projectState.showUploader}
					onCancel={() => updateProjState({ showUploader: false })}
					footer={null}
					width={1000}
					centered
				>
					<div className="text-center mb-8">
						<Title level={2}>
							How would you like to create your project?
						</Title>
						<Text type="secondary">
							Choose the method that works best for you
						</Text>
					</div>

					<Row gutter={32} justify="center">
						{options.map((option) => (
							<Col span={12} key={option.id}>
								<motion.div
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Card
										hoverable
										onClick={option.action}
										cover={
											<img
												alt={option.title}
												src={option.image}
												className="p-4"
											/>
										}
									>
										<Card.Meta
											avatar={option.icon}
											title={option.title}
											description={option.description}
										/>
									</Card>
								</motion.div>
							</Col>
						))}
					</Row>
				</Modal>

				{/* Manual Creation Modal */}
				<Modal
					open={projectState.showUploaderManual}
					onCancel={() =>
						updateProjState({ showUploaderManual: false })
					}
					footer={null}
					width={1200}
					centered
				>
					<Row gutter={[16, 16]}>
						<Col span={12}>
							<Title level={3}>Project Details</Title>
							<form onSubmit={handleCreateProject}>
								<Space
									direction="vertical"
									size="large"
									className="w-full"
								>
									<div>
										<Text strong>Project Name</Text>
										<Tooltip title="Choose a descriptive name for your project">
											<Input
												name="name"
												placeholder="E.g., Customer Churn Predictor"
												required
												prefix={<FileTextOutlined />}
												suffix={
													<Tooltip title="Minimum 10 characters">
														<InfoCircleOutlined
															style={{
																color: 'rgba(0,0,0,.45)',
															}}
														/>
													</Tooltip>
												}
											/>
										</Tooltip>
									</div>

									<div>
										<Text strong>Description</Text>
										<Tooltip title="Explain what your project aims to achieve">
											<TextArea
												name="description"
												rows={4}
												placeholder="Describe your project's goals and requirements..."
												required
											/>
										</Tooltip>
									</div>

									<div>
										<Text strong>
											Expected Accuracy (%)
										</Text>
										<Tooltip title="Set your desired model accuracy target">
											<Input
												type="number"
												name="expectation_accuracy"
												min={0}
												max={100}
												defaultValue={100}
												required
											/>
										</Tooltip>
									</div>

									<Button
										type="primary"
										htmlType="submit"
										block
									>
										Create Project
									</Button>
								</Space>
							</form>
						</Col>

						<Col span={12}>
							<Title level={3}>Project Type</Title>
							<Alert
								message="Choose Your AI Model"
								description="Select the type of AI model that best fits your data and goals. Each type is optimized for specific kinds of problems."
								type="info"
								showIcon
								className="mb-4"
							/>
							<div className="overflow-auto max-h-[500px]">
								<Row gutter={[16, 16]}>
									{projType.map((type, idx) => (
										<Col span={24} key={type}>
											<Card
												hoverable
												className={` border-blue-500 border hover:shadow-none hover:bg-blue-50 ${
													isSelected[idx]
														? ' bg-purple-50 border-purple-400'
														: ''
												}
												`}
												onClick={(e) =>
													selectType(e, idx)
												}
											>
												<Row gutter={16} align="middle">
													<Col span={8}>
														<img
															src={imgArray[idx]}
															alt={type}
															className="w-full rounded"
														/>
													</Col>
													<Col span={16}>
														<Title level={4}>
															{TYPES[type].type}
														</Title>
														<Text type="secondary">
															{
																typeDescription[
																	idx
																]
															}
														</Text>
													</Col>
												</Row>
											</Card>
										</Col>
									))}
								</Row>
							</div>
						</Col>
					</Row>
				</Modal>

				{/* AI Assistant Modal */}
				<Modal
					open={projectState.showUploaderChatbot}
					onCancel={() =>
						updateProjState({ showUploaderChatbot: false })
					}
					footer={null}
					width={800}
					centered
				>
					<div className="flex flex-col h-[600px]">
						<div className="flex-1 overflow-auto p-4">
							{showTitle ? (
								<div className="text-center my-12">
									<Title level={2}>
										How can I help you create your project?
									</Title>
									<Text type="secondary">
										Describe your goals, and I'll guide you
										through the process
									</Text>
								</div>
							) : (
								<div className="space-y-4">
									{messages.map((message, index) => (
										<Alert
											key={index}
											message={message.content}
											type={
												message.type === 'user'
													? 'info'
													: 'success'
											}
											showIcon
											style={{
												marginLeft:
													message.type === 'user'
														? 'auto'
														: '0',
												marginRight:
													message.type === 'user'
														? '0'
														: 'auto',
												maxWidth: '70%',
											}}
										/>
									))}
								</div>
							)}
						</div>

						<div className="p-4 border-t">
							{selectedDataset && (
								<Tag color="blue" className="mb-2">
									<DatabaseOutlined />{' '}
									{datasets[selectedDataset].title}
								</Tag>
							)}

							<Input.TextArea
								ref={textareaRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Describe your project goals..."
								autoSize={{ minRows: 1, maxRows: 6 }}
								suffix={
									<Space>
										<Tooltip title="Attach dataset">
											<Button
												type="text"
												icon={<PaperClipOutlined />}
												onClick={() => getDatasets()}
											/>
										</Tooltip>
										<Button
											type="primary"
											icon={<SendOutlined />}
											onClick={() => {
												if (input.trim()) {
													setShowTitle(false)
													setMessages([
														...messages,
														{
															type: 'user',
															content: input,
														},
													])
													setInput('')
												}
											}}
										/>
									</Space>
								}
							/>
						</div>
					</div>
				</Modal>

				{/* Dataset Selection Modal */}
				<Modal
					open={projectState.showSelectData}
					onCancel={() => updateProjState({ showSelectData: false })}
					title="Select Dataset"
					footer={[
						<Button
							key="back"
							onClick={() =>
								updateProjState({ showSelectData: false })
							}
						>
							Cancel
						</Button>,
						<Button
							key="submit"
							type="primary"
							disabled={!selectedDataset}
							onClick={() =>
								updateProjState({ showSelectData: false })
							}
						>
							Use Selected Dataset
						</Button>,
					]}
					width={800}
				>
					<Alert
						message="Choose a Dataset"
						description="Select the dataset you want to use for training your AI model. The dataset should match your chosen project type for best results."
						type="info"
						showIcon
						className="mb-4"
					/>

					<Table
						dataSource={datasets}
						rowKey={(record) => record.id}
						columns={[
							{
								title: 'Title',
								dataIndex: 'title',
								key: 'title',
							},
							{
								title: 'Service',
								dataIndex: 'service',
								key: 'service',
							},
							{
								title: 'Bucket',
								dataIndex: 'bucketName',
								key: 'bucket',
							},
						]}
						rowSelection={{
							type: 'radio',
							selectedRowKeys: selectedDataset
								? [selectedDataset]
								: [],
							onChange: (selectedRowKey) => {
								setSelectedDataset(selectedRowKey[0])
							},
						}}
						pagination={false}
						scroll={{ y: 400 }}
						className="dataset-table"
					/>
				</Modal>
			</Content>
		</Layout>
	)
}
