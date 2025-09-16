import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import {
	Steps,
	Card,
	Row,
	Col,
	Typography,
	Space,
	Statistic,
	Button,
	Badge,
	Tag,
	message,
	Progress,
	Timeline,
	Divider,
	Input,
} from 'antd'
import {
	RocketOutlined,
	ApiOutlined,
	DatabaseOutlined,
	ThunderboltOutlined,
	CloudDownloadOutlined,
	SettingOutlined,
	LineChartOutlined,
	LoadingOutlined,
	CheckCircleOutlined,
	InfoCircleOutlined,
	CloudServerOutlined,
	CodeOutlined,
	NodeIndexOutlined,
	CloudUploadOutlined,
	LinkOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import { validateFiles } from 'src/utils/file'
import * as experimentAPI from 'src/api/experiment'
import config from './config'

const { Step } = Steps
const { Title, Text, Paragraph } = Typography

const Endpoint = () => {
	// For uploading predict files
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef(null)

	const handleUploadFiles = async (files) => {
		if (!instanceURL) {
			message.error('No deployment instance URL available')
			return
		}

		const validFiles = validateFiles(files, projectInfo.type)

		console.log('uploadedFiles', validFiles)
		setUploadedFiles(validFiles)
		setUploading(true)
		addDeploymentLog('Uploading files for prediction', 'info')

		const formData = new FormData()
		formData.append('task', projectInfo.type)

		Array.from(validFiles).forEach((file) => {
			formData.append('files', file)
			addDeploymentLog(`Processing file: ${file.name}`, 'info')
		})
		console.log('Fetch prediction start')

		try {
			const { data } = await experimentAPI.predictData(
				experimentName,
				formData
			)
			console.log('Fetch prediction successful', data)
			if (data.status === 'failed') {
				message.error(
					'Your Files are not valid. Please select files has the same structure with your training data',
					5
				)
				addDeploymentLog('No predictions found', data.message)
				setUploading(false)
				return
			}
			const { predictions } = data

			setPredictResult(predictions)
			setUploading(false)
			setCurrentStep(2)

			message.success('Success Predict', 3)
			addDeploymentLog('Prediction completed successfully', 'success')
		} catch (error) {
			message.error('Predict Fail', 3)
			addDeploymentLog(`Prediction failed: ${error.message}`, 'error')
			setUploading(false)
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleChange = (event) => {
		const files = event.target.files
		if (files && files.length > 0) {
			handleUploadFiles(files)
		}
	}
	return (
		<>
			<style>{`
				.dark-build-page {
					background: #01000A;
					min-height: 100vh;
					padding: 24px;
				}
				
				.dark-build-card {
					background: linear-gradient(135deg, rgba(15, 32, 39, 0.8) 0%, rgba(32, 58, 67, 0.6) 50%, rgba(44, 83, 100, 0.8) 100%);
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 16px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
				}
				
				.dark-build-text {
					color: rgba(255, 255, 255, 0.8) !important;
					font-family: 'Poppins', sans-serif !important;
				}
				
				.dark-build-text-strong {
					color: white !important;
					font-family: 'Poppins', sans-serif !important;
					font-weight: 600 !important;
				}
				
				.dark-build-button {
					background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
					border: 1px solid rgba(255, 255, 255, 0.2) !important;
					border-radius: 12px !important;
					font-family: 'Poppins', sans-serif !important;
					font-weight: 600 !important;
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
				}
				
				.dark-build-button:hover {
					background: linear-gradient(135deg, #16213e 0%, #0f3460 100%) !important;
					box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
					transform: translateY(-2px) !important;
				}
				
				.dark-build-input .ant-input {
					background: rgba(255, 255, 255, 0.1) !important;
					border: 1px solid rgba(255, 255, 255, 0.2) !important;
					color: white !important;
					border-radius: 12px !important;
				}
				
				.dark-build-input .ant-input:hover {
					border-color: #5C8DFF !important;
					box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
				}
				
				.dark-build-input .ant-input:focus {
					border-color: #5C8DFF !important;
					box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
				}
				
				.dark-build-input .ant-input-group-addon {
					background: rgba(255, 255, 255, 0.1) !important;
					border: 1px solid rgba(255, 255, 255, 0.2) !important;
					color: white !important;
					border-radius: 12px !important;
				}
			`}</style>
			<div className="dark-build-page">
				<Row
					gutter={[24, 24]}
					style={{
						marginTop: '24px',
					}}
				>
					<Col span={24}>
						<Card
							className="dark-build-card"
							title={
								<Space>
									<LinkOutlined
										style={{
											color: '#5C8DFF',
										}}
									/>
									<span className="dark-build-text-strong">Endpoint Information</span>
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
										className="dark-build-input"
										style={{
											width: '30%',
										}}
										value={
											instanceURL ||
											'https://api.example.com/predict/model-123'
										}
										readOnly
									/>
									<Button
										className="dark-build-button"
										type="primary"
										onClick={() => {
											navigator.clipboard
												.writeText(
													instanceURL ||
														'https://api.example.com/predict/model-123'
												)
												.then(() =>
													message.success(
														'Copied to clipboard',
														1
													)
												)
												.catch((err) =>
													message.err(
														'Failed to copy',
														1
													)
												)
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
										className="dark-build-button"
										type="primary"
										onClick={handleClick}
										loading={uploading}
										icon={<CloudUploadOutlined />}
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
								const LiveInferComponent = object.liveInferView
								return (
									<LiveInferComponent
										projectInfo={projectInfo}
										handleUploadFiles={handleUploadFiles}
									/>
								)
							}
							return null
						})()}
					</>
				</Col>
			</Row>
			</div>
		</>
	)
}
export default Endpoint
