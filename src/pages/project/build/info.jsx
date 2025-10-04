import { useEffect, useState, useRef } from 'react'

import { useOutletContext } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import { getAllExperiments } from 'src/api/experiment'
import * as experimentAPI from 'src/api/experiment'
import * as mlServiceAPI from 'src/api/mlService'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useNavigate } from 'react-router-dom'
import { PATHS } from 'src/constants/paths'
import { getExperimentConfig } from 'src/api/experiment_config'
import { TASK_TYPES } from 'src/constants/types'
import {
	Button,
	Card,
	Statistic,
	Tag,
	message,
	Skeleton,
	Empty,
	Space,
	Input,
	Row,
	Col,
	Divider,
} from 'antd'
import {
	TrophyOutlined,
	ClockCircleOutlined,
	CloudUploadOutlined,
	LinkOutlined,
	CheckCircleOutlined,
	ThunderboltOutlined,
	LeftOutlined,
} from '@ant-design/icons'
import { SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import UpDataDeploy from './upDataDeploy'
import instance from 'src/api/axios'
import * as modelServiceAPI from 'src/api/model'
import * as deployServiceAPI from 'src/api/deploy'
import * as datasetAPI from 'src/api/dataset'
import * as visualizeAPI from 'src/api/visualize'
import * as projectAPI from 'src/api/project'
import LiteConfig from 'src/pages/project/build/LiteConfig'
import { validateFilesForPrediction } from 'src/utils/file'
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
} from 'recharts'

const getAccuracyStatus = (score) => {
	if (score >= 0.9) {
		return (
			<Tag
				style={{
					background: 'linear-gradient(135deg, #10b981, #34d399)',
					border: 'none',
					color: 'white',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				Excellent
			</Tag>
		)
	} else if (score >= 0.7) {
		return (
			<Tag
				style={{
					background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
					border: 'none',
					color: 'white',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				Good
			</Tag>
		)
	} else if (score >= 0.6) {
		return (
			<Tag
				style={{
					background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
					border: 'none',
					color: 'white',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				Medium
			</Tag>
		)
	} else {
		return (
			<Tag
				style={{
					background: 'linear-gradient(135deg, #ef4444, #f87171)',
					border: 'none',
					color: 'white',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				Bad
			</Tag>
		)
	}
}

const ProjectInfo = () => {
	const { theme } = useTheme()
	const navigate = useNavigate()
	const { projectInfo } = useOutletContext()
	const [experiment, setExperiment] = useState(null)
	const [experimentId, setExperimentId] = useState(null)
	const [model, setModel] = useState({})
	const [modelDeploy, setModelDeploy] = useState({})
	const [pollFlag, setPollFlag] = useState(false)
	const [metrics, setMetrics] = useState([])
	const [isShowUpload, setIsShowUpload] = useState(false)
	const [isCheckingModelStatus, setIsCheckingModelStatus] = useState(false)
	const [datasetInfo, setDatasetInfo] = useState(null)
	const [isDeploySettingUp, setIsDeploySettingUp] = useState(false)
	const [isPredictDone, setIsPredictDone] = useState(false)
	const [isPreparing, setIsPreparing] = useState(false)
	const [chartData, setChartData] = useState([])
	const [valMetric, setValMetric] = useState('Accuracy')
	const [isChartLoading, setIsChartLoading] = useState(false)

	// Live predict states
	const [uploading, setUploading] = useState(false)
	const [predictResult, setPredictResult] = useState(null)
	const [uploadedFiles, setUploadedFiles] = useState(null)
	const [isWaitingForDeployment, setIsWaitingForDeployment] = useState(false)
	const fileInputRef = useRef(null)

	const object = LiteConfig[projectInfo?.task_type]

	const hideUpload = () => {
		setIsShowUpload(false)
	}

	const handleModelButtonClick = async () => {
		setIsShowUpload(true)
	}

	// Chạy ngầm ensure-deployed ngay khi bắt đầu upload, không chặn UI
	const handleUploadStartBackground = async () => {
		if (!modelDeploy) {
			// Handle case model haven't deploy => Start deploy
			if (!model?.id) return
			const res = await modelServiceAPI.deployModel(model.id)
			setPollFlag(true)
		} else {
			// Model already deployed, ready for prediction
			console.log('Model deployed', modelDeploy)
		}
	}

	// Live predict file upload handler
	const handleUploadFiles = async (files) => {
		console.log('Files: ', files)

		const validFiles = validateFilesForPrediction(
			files,
			projectInfo?.task_type
		)

		console.log('uploadedFiles', validFiles)
		setUploadedFiles((prevFiles) =>
			prevFiles ? [...prevFiles, ...validFiles] : validFiles
		)
		setUploading(true)

		// Wait for deployment to complete if no model is deployed
		let currentModelDeploy = modelDeploy
		if (!currentModelDeploy?.api_base_url) {
			console.log('No deployed model found, waiting for deployment...')
			setIsWaitingForDeployment(true)
			message.info('Deploying model, please wait...', 3)

			// Poll for deployment completion
			const maxWaitTime = 10 * 60 * 1000 // 10 minutes
			const pollInterval = 30000 // 5 seconds
			const startTime = Date.now()

			while (
				!currentModelDeploy?.api_base_url &&
				Date.now() - startTime < maxWaitTime
			) {
				await new Promise((resolve) =>
					setTimeout(resolve, pollInterval)
				)

				try {
					const res = await deployServiceAPI.getDeployedModel(
						model.id
					)
					if (res.status === 200 && res.data?.[0]) {
						const deploy = res.data[0]
						if (deploy.status === 'ONLINE' && deploy.api_base_url) {
							currentModelDeploy = deploy
							setModelDeploy(deploy)
							console.log('Model deployment completed:', deploy)
							message.success('Model deployed successfully!', 2)
							break
						}
					}
				} catch (error) {
					console.log('Error polling deployment status:', error)
				}
			}

			setIsWaitingForDeployment(false)

			// Check if deployment completed successfully
			if (!currentModelDeploy?.api_base_url) {
				message.error(
					'Model deployment failed or timed out. Please try again later.'
				)
				setUploading(false)
				return
			}
		}

		const formData = new FormData()

		Array.from(validFiles).forEach((file) => {
			if (
				projectInfo?.task_type ===
					'MULTILABEL_TABULAR_CLASSIFICATION' ||
				projectInfo?.task_type === 'TABULAR_CLASSIFICATION' ||
				projectInfo?.task_type === 'TEXT_CLASSIFICATION' ||
				projectInfo?.task_type === 'TABULAR_REGRESSION' ||
				projectInfo?.task_type === 'MULTILABEL_TEXT_CLASSIFICATION'
			) {
				formData.append('file', file)
			} else {
				formData.append('images', file)
			}
		})
		console.log('Fetch prediction start')

		try {
			// Make predictions
			const predictRequest = await modelServiceAPI.modelPredict(
				currentModelDeploy.api_base_url,
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

			console.log('prediction:', predictions)

			setPredictResult((prevPredictions) =>
				prevPredictions
					? [...prevPredictions, ...predictions]
					: predictions
			)
			console.log(predictions)
			setUploading(false)
			message.success('Success Predict', 3)
		} catch (error) {
			message.error('Predict Fail', 3)
			setUploading(false)
		}
	}

	const handleFileChange = (event) => {
		const files = event.target.files
		if (files && files.length > 0) {
			handleUploadStartBackground(files)
		}
	}

	const handleFileClick = () => {
		setIsShowUpload(true)
	}

	const handleClearAll = () => {
		setPredictResult(null)
		setUploadedFiles(null)
		message.success('All predictions cleared', 2)
	}

	// 1) Lấy experimentId theo projectInfo.id
	useEffect(() => {
		if (!projectInfo?.id) return
		const getExperiment = async () => {
			try {
				const { data } = await getAllExperiments(projectInfo?.id)
				if (data && data.length > 0) {
					setExperimentId(data[0]?.id)
					setIsPredictDone(false)
					setIsPreparing(false)
				} else {
					console.error('No experiments found')
				}
			} catch (e) {
				console.error('Error fetching experiments:', e)
			}
		}
		getExperiment()
	}, [projectInfo])

	// 2) Lấy chi tiết experiment
	useEffect(() => {
		if (!experimentId) return
		const fetchExperiment = async () => {
			try {
				const res = await experimentAPI.getExperimentById(experimentId)
				if (res.status === 200) setExperiment(res.data)
			} catch (error) {
				console.error('Error fetching experiment:', error)
			}
		}
		fetchExperiment()
	}, [experimentId])

	// Fetch model details
	useEffect(() => {
		if (!experimentId) return
		const fetchModel = async () => {
			try {
				const res =
					await modelServiceAPI.getModelByExperimentId(experimentId)
				if (res.status === 200) {
					setModel(res.data)
					console.log('Model details:', res.data)
				}
			} catch (error) {
				console.log('Error fetching model details', error)
			}
		}
		fetchModel()
	}, [experiment])

	// Fetch model deploy details with polling
	useEffect(() => {
		if (!model.id) return
		let timeoutId

		const fetchModelDeploy = async () => {
			try {
				const res = await deployServiceAPI.getDeployedModel(model.id)
				if (res.status === 200) {
					const deploy = res.data[0]
					setModelDeploy(deploy)
					console.log('Model deploy details:', deploy)

					// keep polling if not ONLINE or not null
					if (deploy && deploy.status !== 'ONLINE') {
						timeoutId = setTimeout(fetchModelDeploy, 30000)
					}
				}
			} catch (error) {
				console.log('Error in fetching model deploy details', error)
			}
		}

		fetchModelDeploy()

		return () => clearTimeout(timeoutId)
	}, [model, pollFlag])

	// 3) Lấy metrics
	useEffect(() => {
		if (!experimentId) return
		const fetchMetrics = async () => {
			try {
				const res = await mlServiceAPI.getFinalMetrics(experimentId)
				if (res.status === 200) {
					const newMetrics = []
					for (const key in res.data) {
						newMetrics.push({
							key: key,
							metric: res.data[key].name,
							value: res.data[key].score,
							description: res.data[key].description,
							status: getAccuracyStatus(res.data[key].score),
						})
					}
					setMetrics(newMetrics)
				}
			} catch (error) {
				console.error('Error fetching metrics:', error)
			}
		}
		fetchMetrics()
	}, [experimentId])

	// 4) Lấy dataset
	useEffect(() => {
		if (!projectInfo?.dataset_id) return
		const fetchDataset = async () => {
			try {
				const res = await datasetAPI.getDataset(projectInfo?.dataset_id)
				if (res.status === 200) setDatasetInfo(res)
			} catch (error) {
				console.error('Error fetching dataset:', error)
			}
		}
		fetchDataset()
	}, [projectInfo])

	// 5) Lấy chart config/history
	useEffect(() => {
		if (!experimentId) return
		const fetchConfig = async () => {
			try {
				setIsChartLoading(true)
				const res = await getExperimentConfig(experimentId)
				const config = Array.isArray(res?.data)
					? res.data[0]
					: res?.data
				const history = config?.metrics?.training_history || []
				const metricName = config?.metrics?.val_metric || 'Accuracy'
				setValMetric(metricName)
				setChartData(history)
			} catch (error) {
				console.error('Error fetching config:', error)
				setChartData([])
			} finally {
				setIsChartLoading(false)
			}
		}
		fetchConfig()
	}, [experimentId])

	// Format created_at
	const formattedDate = new Date(projectInfo?.created_at).toLocaleString(
		'en-US',
		{
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}
	)

	const hasTraining = (experiment?.actual_training_time || 0) > 0

	// Dynamic card background: blue gradient in light mode
	const cardGradient =
		theme === 'dark'
			? 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)'
			: 'linear-gradient(150deg, #fff8e1 0%, #bbdefb 40%, #ffcdd2 100%)'

	const MetadataItem = ({ label, value }) => (
		<div className="flex flex-col space-y-1 p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-gray-400 transition-all duration-200 hover:bg-white/10">
			<span
				className="text-xs font-medium uppercase tracking-wider opacity-60"
				style={{ color: 'var(--secondary-text)' }}
			>
				{label}
			</span>
			<span
				className="text-sm font-semibold"
				style={{ color: 'var(--text)' }}
			>
				{value}
			</span>
		</div>
	)

	return (
		<>
			<style>{`
        	 	body, html {
         	 	background-color: var(--surface) !important;

        	}
      `}</style>
			<div
				className="min-h-screen"
				style={{ background: 'var(--surface)' }}
			>
				<div className="relative pt-16 px-4 sm:px-6 lg:px-8">
					{theme === 'dark' && (
						<BackgroundShapes
							width="1280px"
							height="1200px"
							shapes={[
								{
									id: 'uploadBlue',
									shape: 'circle',
									size: '480px',
									gradient: {
										type: 'radial',
										shape: 'ellipse',
										colors: [
											'#5C8DFF 0%',
											'#5C8DFF 35%',
											'transparent 75%',
										],
									},
									opacity: 0.4,
									blur: '200px',
									position: { top: '200px', right: '-120px' },
									transform: 'none',
								},
								{
									id: 'uploadCyan',
									shape: 'rounded',
									size: '380px',
									gradient: {
										type: 'radial',
										shape: 'circle',
										colors: [
											'#40FFFF 0%',
											'#40FFFF 55%',
											'transparent 85%',
										],
									},
									opacity: 0.25,
									blur: '160px',
									position: { top: '50px', left: '-100px' },
									transform: 'none',
								},
								{
									id: 'uploadWarm',
									shape: 'rounded',
									size: '450px',
									gradient: {
										type: 'radial',
										shape: 'circle',
										colors: [
											'#FFAF40 0%',
											'#FFAF40 50%',
											'transparent 85%',
										],
									},
									opacity: 0.2,
									blur: '180px',
									position: { top: '700px', left: '50%' },
									transform: 'translate(-50%, -50%)',
								},
							]}
						/>
					)}
					<div className="relative z-10 max-w-7xl mx-auto">
						{/* Per-section loading indicators handled below; no global overlay */}
						<div className="text-center mb-16">
							<h1
								className="text-4xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent leading-tight"
								style={{ color: 'var(--title-project)' }}
							>
								{projectInfo?.name || 'PROJECT'}
							</h1>
							{/* Back button + Project info card */}
							<div className="relative mb-12">
								{/* Nút Back cố định bên trái */}
								<Button
									icon={<LeftOutlined />}
									className="absolute left-0 top-1/2 -translate-y-1/2 !bg-sky-500 !text-white border border-gray-400 transition-transform duration-200 ease-in-out hover:scale-105"
									onClick={() => navigate(PATHS.PROJECTS)}
									shape="round"
									size="large"
									style={{borderRadius: '8px'}}
								>
									Home
								</Button>

								{/* Card căn giữa */}
								<div className="max-w-4xl mx-auto">
									<div
										className="p-4 rounded-2xl border-[var(--border)] border-white/10 
        bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl"
										style={{
											background: 'var(--card-gradient)',
										}}
									>
										<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
											<div
												className="text-sm font-semibold"
												style={{ color: 'var(--text)' }}
											>
												Task:{' '}
												<span className="opacity-80">
													{TASK_TYPES[projectInfo?.task_type]?.type || 'N/A'}
												</span>
											</div>
											<div
												className="text-sm font-semibold"
												style={{ color: 'var(--text)' }}
											>
												Created:{' '}
												<span className="opacity-80">
													{formattedDate}
												</span>
											</div>
											{projectInfo?.visibility && (
												<div
													className="text-sm font-semibold"
													style={{
														color: 'var(--text)',
													}}
												>
													Visibility:{' '}
													<span className="opacity-80">
														{projectInfo.visibility}
													</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Statistic Cards - render progressively per section */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<Card
								className="border border-1 border-gray-300 backdrop-blur-sm shadow-lg hover:shadow-xl transition duration-500 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group"
								style={{
									background: cardGradient,
									backdropFilter: 'blur(10px)',
									borderRadius: '12px',
									fontFamily: 'Poppins, sans-serif',
								}}
							>
								<div className="relative">
									{/* Tooltip cho Training Duration */}
									<div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
										<div className="px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg min-w-max">
											Training time for the model
											<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
										</div>
									</div>

									{!experiment ? (
										<Skeleton
											active
											paragraph={{ rows: 2 }}
											title={false}
										/>
									) : (
										<Statistic
											title={
												<span
													style={{
														color: 'var(--secondary-text)',
														fontFamily:
															'Poppins, sans-serif',
													}}
													className="flex items-center"
												>
													Training Duration
													<span className="ml-2">
														<QuestionCircleOutlined className="text-blue-400 text-base" />
													</span>
												</span>
											}
											valueRender={() => {
												const totalMinutes =
													experiment?.actual_training_time ||
													0
												if (totalMinutes === 0) {
													return (
														<span
															className={`${theme === 'dark' ? 'text-yellow-500' : 'text-gray-700'} font-bold`}
														>
															No training time
														</span>
													)
												}
												const mins =
													Math.floor(totalMinutes)
												const secs = Math.round(
													(totalMinutes - mins) * 60
												)
												return (
													<span
														className={`${theme === 'dark' ? 'text-yellow-500' : 'text-gray-700'} font-bold`}
													>
														{mins}m {secs}s
													</span>
												)
											}}
											prefix={
												<ClockCircleOutlined
													style={{ color: '#f59e0b' }}
												/>
											}
										/>
									)}
								</div>
							</Card>

							<Card
								className="border border-1 border-gray-300 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group"
								style={{
									background: cardGradient,
									backdropFilter: 'blur(10px)',
									borderRadius: '12px',
									fontFamily: 'Poppins, sans-serif',
								}}
							>
								<div className="relative">
									{/* Tooltip hiện khi hover vào card */}
									<div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
										<div className="px-3 py-2 text-sm text-white bg-gray-800 rounded-lg min-w-max shadow-lg">
											The proportion of correct
											predictions.
											<div className="absolute bottom-full right-4 transform -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
										</div>
									</div>

									{!metrics.length ? (
										<Skeleton
											active
											paragraph={{ rows: 2 }}
											title={false}
										/>
									) : (
										<Statistic
											title={
												<span
													style={{
														color: 'var(--secondary-text)',
														fontFamily:
															'Poppins, sans-serif',
													}}
													className="flex items-center"
												>
													Accuracy
													<span className="ml-2">
														<QuestionCircleOutlined className="text-blue-400 text-base" />
													</span>
												</span>
											}
											valueRender={() => {
												if (!hasTraining) {
													return (
														<span
															style={{
																fontFamily:
																	'Poppins, sans-serif',
																fontWeight:
																	'bold',
															}}
															className={`${theme === 'dark' ? 'text-sky-400' : 'text-gray-700'}`}
														>
															No accuracy
															available
														</span>
													)
												}
												return (
													<span
														className={`${theme === 'dark' ? 'text-sky-500' : 'text-gray-700'} font-bold`}
													>
														{parseFloat(
															Math.abs(
																metrics[0]
																	?.value *
																	100 || 0
															).toFixed(2)
														)}
													</span>
												)
											}}
											precision={2}
											prefix={
												<TrophyOutlined
													style={{
														color: 'var(--accent-text)',
													}}
												/>
											}
											suffix={
												<span
													className={`${theme === 'dark' ? 'text-sky-500' : 'text-gray-700'} font-bold`}
												>
													%
												</span>
											}
										/>
									)}
								</div>
							</Card>

							{/* Deploy Button */}
							<Button
								size="large"
								className="border border-gray-400 border-1 h-full flex items-center justify-center backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group text-green-500"
								style={{
									background: cardGradient,
									backdropFilter: 'blur(10px)',
									borderRadius: '12px',
									fontFamily: 'Poppins, sans-serif',
								}}
								loading={
									!(
										modelDeploy === undefined ||
										modelDeploy?.status === 'ONLINE'
									)
								}
								onClick={
									hasTraining
										? handleModelButtonClick
										: undefined
								}
								disabled={true}
							>
								<span
									style={{
										fontFamily: 'Poppins, sans-serif',
										fontWeight: 'bold',
										fontSize: '1.5rem',
									}}
								>
									{hasTraining ? (
										<span
											className={`${theme === 'dark' ? 'text-green-500' : 'text-gray-700'}`}
										>
											{modelDeploy?.status
												? modelDeploy.status
												: 'Use Your Model'}
										</span>
									) : (
										<span
											className={`${theme === 'dark' ? 'text-red-400' : 'text-gray-700'}`}
										>
											Your model not available
										</span>
									)}
								</span>
							</Button>
						</div>

						{/* Live Predict Section */}
						{projectInfo && hasTraining && (
							<div className="mt-8 mb-8">
								<Card
									title={
										<Space>
											<LinkOutlined
												style={{
													color: '#1890ff',
												}}
											/>
											<span
												style={{
													color: 'var(--text)',
												}}
											>
												Live Prediction
											</span>
										</Space>
									}
									className="border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl"
									style={{
										background: cardGradient,
										backdropFilter: 'blur(10px)',
										borderRadius: '12px',
										paddingBottom: '10px'
									}}
								>
									<Row gutter={[24, 24]}>
										<Col span={24}>
											<div className="flex flex-col sm:flex-row gap-4 items-start">
												<Space>
													<input
														type="file"
														multiple
														ref={fileInputRef}
														onChange={
															handleFileChange
														}
														className="hidden"
														accept=".csv,.txt,.json,.xlsx,.png,.jpg"
													/>
													<Button
														onClick={
															handleFileClick
														}
														loading={uploading}
														icon={
															<CloudUploadOutlined />
														}
														size="large"
														className="absolute left-0 top-1/2 -translate-y-1/2 !bg-sky-500 !text-white border border-gray-400 mb-10 transition-transform duration-200 ease-in-out hover:scale-105"
													>
														{uploading
															? isWaitingForDeployment
																? 'Deploying Model...'
																: 'Predicting...'
															: 'Upload Files to Predict'}
													</Button>
												</Space>
											</div>
										</Col>
									</Row>
								</Card>

								{/* Prediction Results */}
								{!uploading &&
									predictResult &&
									projectInfo &&
									object && (
										<div className="mt-6">
											{(() => {
												const PredictComponent =
													object.predictView
												return (
													<PredictComponent
														predictResult={
															predictResult
														}
														uploadedFiles={
															uploadedFiles
														}
														projectInfo={
															projectInfo
														}
														handleUploadFiles={
															handleUploadFiles
														}
														model={model}
														onClearAll={
															handleClearAll
														}
													/>
												)
											})()}
										</div>
									)}
							</div>
						)}

						{/* Training history chart - only show when no prediction results */}
						{!predictResult &&
						(isChartLoading ||
							(Array.isArray(chartData) &&
								chartData.length > 0)) ? (
							<div className="p-6 rounded-xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl">
								<h2
									className="text-xl font-bold mb-4"
									style={{ color: 'var(--text)' }}
								>
									Training History
								</h2>
								<div style={{ width: '100%', height: 300 }}>
									{isChartLoading ? (
										<div className="w-full h-full">
											<Skeleton
												active
												paragraph={{ rows: 6 }}
												title={false}
											/>
										</div>
									) : (
										<ResponsiveContainer
											width="100%"
											height="100%"
										>
											<AreaChart
												data={
													Array.isArray(chartData)
														? chartData.map(
																(d) => ({
																	...d,
																	score: Math.abs(
																		Number(
																			d?.score ??
																				0
																		)
																	),
																})
															)
														: []
												}
												margin={{
													top: 10,
													right: 30,
													left: 0,
													bottom: 0,
												}}
											>
												<defs>
													<linearGradient
														id="colorAccuracy"
														x1="0"
														y1="0"
														x2="0"
														y2="1"
													>
														<stop
															offset="5%"
															stopColor="#60a5fa"
															stopOpacity={0.8}
														/>
														<stop
															offset="95%"
															stopColor="#22d3ee"
															stopOpacity={0.1}
														/>
													</linearGradient>
												</defs>
												<CartesianGrid
													strokeDasharray="3 3"
													stroke="#334155"
												/>
												<XAxis
													dataKey="step"
													tick={{
														fontSize: 12,
														fill: '#94a3b8',
													}}
													domain={[0, 'auto']}
												/>
												<YAxis
													tick={{
														fontSize: 12,
														fill: '#94a3b8',
													}}
													domain={[0, 'auto']}
												/>
												<RechartsTooltip
													formatter={(value) => [
														`${Math.abs(value).toFixed(2)}`,
														valMetric,
													]}
													labelFormatter={(label) =>
														`Epoch: ${label} step`
													}
													contentStyle={{
														backgroundColor:
															'rgba(15, 23, 42, 0.95)',
														borderRadius: '8px',
														boxShadow:
															'0 4px 20px rgba(0,0,0,0.5)',
														border: '1px solid var(--border)',
														color: '#e2e8f0',
													}}
												/>
												<Legend />
												<Area
													type="monotone"
													dataKey="score"
													stroke="#60a5fa"
													strokeWidth={3}
													fillOpacity={1}
													fill="url(#colorAccuracy)"
													name={`Validation ${valMetric}`}
												/>
											</AreaChart>
										</ResponsiveContainer>
									)}
								</div>
							</div>
						) : !predictResult ? (
							<div className="p-6 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center">
								<Empty
									description="No training history yet"
									image={Empty.PRESENTED_IMAGE_SIMPLE}
								/>
							</div>
						) : null}
					</div>
				</div>
			</div>
			<UpDataDeploy
				isOpen={isShowUpload}
				onClose={hideUpload}
				projectId={projectInfo?.id}
				taskType={projectInfo?.task_type}
				featureColumns={
					datasetInfo?.data.ls_project.meta_data.text_columns
				}
				onUploadStart={handleUploadStartBackground}
				onUploadComplete={handleUploadFiles}
			/>
		</>
	)
}

export default ProjectInfo
