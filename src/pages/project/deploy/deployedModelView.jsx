import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
	Card,
	Row,
	Col,
	Space,
	Statistic,
	Button,
	message,
	Divider,
	Input,
	Alert,
} from 'antd'
import {
	DeleteOutlined,
	StopOutlined,
	ThunderboltOutlined,
	ClockCircleOutlined,
	RocketOutlined,
	CheckCircleOutlined,
	HourglassOutlined,
	LinkOutlined,
	CloudUploadOutlined,
} from '@ant-design/icons'
import { getDeployData } from 'src/api/deploy'
import { getProjectById } from 'src/api/project'
import { getModelById } from 'src/api/model'
import { getExperimentById } from 'src/api/experiment'
import config from '../build/config'
import * as modelAPI from 'src/api/model'
import { validateFilesForPrediction } from 'src/utils/file'

export default function DeployedModelView() {
	const [projectInfo, setProjectInfo] = useState({})
	const { deployId, id } = useParams()
	const [uploading, setUploading] = useState(false)
	const [deployData, setDeployData] = useState()
	const [model, setModel] = useState(null)
	const [predictResult, setPredictResult] = useState(null)
	const [uploadedFiles, setUploadedFiles] = useState(null)
	const [experimentName, setExperimentName] = useState(null)
	const fileInputRef = useRef(null)

	const object = config[projectInfo.task_type]

	const fetchDeployData = async () => {
		const { data } = await getDeployData(deployId)
		setDeployData(data)
		const res = await getModelById(data.model_id)
		setModel(res.data)
		const experimentId = res.data?.experiment_id
		const res2 = await getExperimentById(experimentId)
		setExperimentName(res2.data?.name)
	}

	const fetchProjectData = async () => {
		const { data } = await getProjectById(id)
		setProjectInfo(data.project)
	}

	useEffect(() => {
		fetchDeployData()
		fetchProjectData()
	}, [])

	const handleUploadFiles = async (files) => {
		console.log('Files: ', files)
		if (!deployData?.api_base_url) {
			message.error('No deployment instance URL available')
			return
		}
		const validFiles = validateFilesForPrediction(
			files,
			projectInfo.task_type
		)

		console.log('uploadedFiles', validFiles)
		setUploadedFiles(validFiles)
		setUploading(true)
		const formData = new FormData()

		Array.from(validFiles).forEach((file) => {
			if (
				projectInfo.task_type === 'MULTILABEL_TABULAR_CLASSIFICATION' ||
				projectInfo.task_type === 'TABULAR_CLASSIFICATION'
			) {
				formData.append('file', file)
			} else {
				formData.append('images', file)
			}
		})
		console.log('Fetch prediction start')

		try {
			// Make predictions
			const predictRequest = await modelAPI.modelPredict(
				deployData?.api_base_url,
				formData
			)
			const data = predictRequest.data
			console.log('Fetch prediction successful', data)
			if (data.status === 'failed') {
				message.error(
					'Your Files are not valid. Please select files has the same structure with your training data',
					5
				)
				setUploading(false)
				return
			}
			const { predictions } = data

			setPredictResult(predictions)
			console.log(predictions)
			setUploading(false)
			message.success('Success Predict', 3)
		} catch (error) {
			message.error('Predict Fail', 3)
			setUploading(false)
		}
	}

	const handleChange = (event) => {
		const files = event.target.files
		if (files && files.length > 0) {
			handleUploadFiles(files)
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<Space direction="vertical" size="large" className="w-full">
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={24} md={12}>
						<Card className="shadow-md">
							<Statistic
								title="Uptime"
								value={`${Math.floor(dayjs().diff(dayjs(deployData?.create_time), 'minute') / 60)} hour(s) ${dayjs().diff(dayjs(deployData?.create_time), 'minute') % 60} minute(s)`}
								valueStyle={{
									color: '#f0b100',
								}}
								prefix={<ClockCircleOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={24} md={12}>
						<Card className="shadow-md">
							<Statistic
								title="Total Requests"
								value={192 || 0}
								prefix={<HourglassOutlined />}
								valueStyle={{
									color: '#2b7fff',
								}}
							/>
						</Card>
					</Col>
				</Row>

				{deployData?.status === 'ONLINE' && projectInfo && (
					<Row
						gutter={[24, 24]}
						style={{
							marginTop: '24px',
						}}
					>
						<Col span={24}>
							<Card
								title={
									<Space>
										<LinkOutlined
											style={{
												color: '#1890ff',
											}}
										/>
										<span>Endpoint Information</span>
									</Space>
								}
							>
								<Row gutter={[24, 24]}>
									<Col xs={24} md={8}>
										<Statistic
											title="Endpoint Status"
											value="Active"
											valueStyle={{
												color: '#52c41a',
											}}
											prefix={<CheckCircleOutlined />}
										/>
									</Col>
									<Col xs={24} md={8}>
										<Statistic
											title="Response Time"
											value="75ms"
											valueStyle={{
												color: '#1890ff',
											}}
											prefix={<ThunderboltOutlined />}
										/>
									</Col>
									<Col xs={24} md={8}>
										<Statistic
											title="Success Rate"
											value="99.9%"
											valueStyle={{
												color: '#faad14',
											}}
											prefix={<CheckCircleOutlined />}
										/>
									</Col>

									<Col span={24}>
										<Divider orientation="left">
											API Endpoint URL
										</Divider>
										<div className="flex">
											<Input.Group compact>
												<Input
													style={{
														width: '30%',
													}}
													value={
														deployData?.api_base_url ||
														'https://api.example.com/predict/model-123'
													}
													readOnly
												/>
												<Button
													type="primary"
													onClick={() => {
														const textToCopy =
															deployData?.api_base_url ||
															'https://api.example.com/predict/model-123'
														try {
															const textarea =
																document.createElement(
																	'textarea'
																)
															textarea.value =
																textToCopy
															document.body.appendChild(
																textarea
															)
															textarea.select()
															document.execCommand(
																'copy'
															)
															document.body.removeChild(
																textarea
															)
															message.success(
																'Copied to clipboard',
																1
															)
														} catch (err) {
															message.error(
																'Failed to copy',
																1
															)
														}
													}}
												>
													Copy URL
												</Button>
											</Input.Group>

											<Space>
												<input
													type="file"
													multiple
													ref={fileInputRef}
													onChange={handleChange}
													className="hidden"
													accept=".csv,.txt,.json,.xlsx,.png,.jpg"
												/>
												<Button
													type="primary"
													onClick={handleClick}
													loading={uploading}
													icon={
														<CloudUploadOutlined />
													}
													size="large"
												>
													{uploading
														? 'Predicting...'
														: 'Upload Files to Predict'}
												</Button>
											</Space>
										</div>
									</Col>
								</Row>
							</Card>
							<>
								{(() => {
									if (object) {
										const LiveInferComponent =
											object.liveInferView
										return (
											<LiveInferComponent
												projectInfo={projectInfo}
												handleUploadFiles={
													handleUploadFiles
												}
											/>
										)
									}
									return null
								})()}
							</>
						</Col>
					</Row>
				)}

				{deployData?.status === 'ONLINE' &&
					!uploading &&
					predictResult &&
					projectInfo && (
						<>
							{(() => {
								if (object) {
									const PredictComponent = object.predictView
									return (
										<PredictComponent
											predictResult={predictResult}
											uploadedFiles={uploadedFiles}
											projectInfo={projectInfo}
											handleUploadFiles={
												handleUploadFiles
											}
											model={model}
										/>
									)
								}
								return null
							})()}
						</>
					)}

				<Card title="🚀 Cloud Server" className="rounded-xl shadow-sm">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Alert
								message={
									deployData?.status === 'ONLINE'
										? 'Shut down server instance'
										: 'Start server instance'
								}
								description={
									deployData?.status === 'ONLINE'
										? 'Gracefully stops the running server instance, making it temporarily unavailable without deleting it.'
										: 'Powers on a previously shut down server, making it active and ready to handle operations.'
								}
								type={
									deployData?.status === 'ONLINE'
										? 'warning'
										: 'info'
								}
								showIcon
								style={{ height: 130 }}
							/>
							<Button
								type="default"
								icon={
									deployData?.status === 'ONLINE' ? (
										<StopOutlined />
									) : (
										<CheckCircleOutlined />
									)
								}
								size="large"
								style={{
									width: '100%',
									fontWeight: 'bold',
									marginTop: 15,
									backgroundColor:
										deployData?.status === 'ONLINE'
											? '#faad14'
											: '#2b7fff',
									color: 'white',
									borderColor:
										deployData?.status === 'ONLINE'
											? '#faad14'
											: '#2b7fff',
								}}
							>
								{deployData?.status === 'ONLINE'
									? 'Shut down'
									: 'Start'}
							</Button>
						</Col>
						<Col xs={24} sm={12}>
							<Alert
								message="Delete server instance"
								description="Permanently removes the server and all associated data from the system. This action is irreversible."
								type="error"
								showIcon
								style={{ height: 130 }}
							/>
							<Button
								type="default"
								icon={<DeleteOutlined />}
								size="large"
								style={{
									width: '100%',
									fontWeight: 'bold',
									marginTop: 15,
									backgroundColor: '#d94343ff',
									color: 'white',
									borderColor: '#d94343ff',
								}}
							>
								Delete Server
							</Button>
						</Col>
					</Row>
				</Card>
			</Space>
		</div>
	)
}
