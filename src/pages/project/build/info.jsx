import { useEffect, useState } from 'react'

import { useOutletContext } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import { getAllExperiments } from 'src/api/experiment'
import * as experimentAPI from 'src/api/experiment'
import * as mlServiceAPI from 'src/api/mlService'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { Button, Card, Statistic, Tag, message } from 'antd'
import { TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import UpDataDeploy from './upDataDeploy'
import instance from 'src/api/axios'
import * as modelServiceAPI from 'src/api/model'
import * as datasetAPI from 'src/api/dataset'
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
	const { projectInfo } = useOutletContext()
	const [experiment, setExperiment] = useState(null)
	const [experimentId, setExperimentId] = useState(null)
	const [metrics, setMetrics] = useState([])
	const [isShowUpload, setIsShowUpload] = useState(false)
	const [usingModel, setUsingModel] = useState(false)
	const [datasetInfo, setDatasetInfo] = useState(null)

	const showUpload = () => {
		setIsShowUpload(true)
	}
	const hideUpload = () => {
		setIsShowUpload(false)
	}

	const handleUseYourModel = async () => {
		try {
			setUsingModel(true)
			// Resolve modelId from experiment id
			const expId = experiment?.id || 1
			if (!expId) {
				throw new Error('Missing experiment id')
			}
			const modelRes = await modelServiceAPI.getModelByExperimentId(expId)
			if (modelRes.status !== 200 || !modelRes.data?.id) {
				throw new Error('Cannot resolve model id from experiment')
			}
			const modelId = modelRes.data.id

			const ensureResp = await instance.post(
				`/api/ml/model/${modelId}/ensure-deployed`
			)
			console.log('Ensure deployed details:', ensureResp?.data)
			const apiUrl = ensureResp?.data?.api_base_url
			if (!apiUrl) {
				throw new Error('Cannot get deployed API URL')
			}
			message.success('Model is ready!')
			console.log('Deployed API:', apiUrl)
			return apiUrl
		} catch (err) {
			console.error(err)
			message.error(err?.response?.data?.error || err.message)
			throw err
		} finally {
			setUsingModel(false)
		}
	}
	useEffect(() => {
		const getExperiment = async () => {
			console.log('Project ID:', projectInfo?.id)
			const { data } = await getAllExperiments(projectInfo?.id)
			if (data && data.length > 0) {
				setExperimentId(data[1]?.id)
			} else {
				console.error('No experiments found')
			}
		}
		getExperiment()
	}, [projectInfo])

	useEffect(() => {
		if (!experimentId) return

		const fetchDataset = async () => {
			const datasetRes = await datasetAPI.getDataset(
				'973ca65c-9005-4dca-8de4-ccb89c9b97e3'
			)
			if (datasetRes.status !== 200) {
				throw new Error('Cannot get dataset')
			}
			setDatasetInfo(datasetRes)
			console.log(datasetRes)
		}

		const fetchExperiment = async () => {
			try {
				const experimentRes =
					await experimentAPI.getExperimentById(experimentId)
				if (experimentRes.status !== 200) {
					throw new Error('Cannot get experiment')
				}
				setExperiment((prev) => experimentRes.data)
			} catch (error) {
				console.log('Error while getting experiment', error)
			}
		}

		const fetchExperimentMetrics = async () => {
			setMetrics((prev) => [])
			try {
				const metricsRes =
					await mlServiceAPI.getFinalMetrics(experimentId)
				if (metricsRes.status !== 200) {
					throw new Error('Cannot get metrics')
				}
				console.log(metricsRes)
				for (const key in metricsRes.data) {
					const metricData = {
						key: key,
						metric: metricsRes.data[key].name,
						value: metricsRes.data[key].score,
						description: metricsRes.data[key].description,
						status: getAccuracyStatus(metricsRes.data[key].score),
					}
					setMetrics((prev) => [...prev, metricData])
				}
			} catch (error) {
				console.log('Error while getting metrics', error)
			}
		}

		fetchExperiment()
		fetchExperimentMetrics()
		fetchDataset()
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
				overflow-y: hidden;
        	}
      `}</style>
			<div
				className="min-h-screen"
				style={{ background: 'var(--surface)' }}
			>
				<div className="relative pt-16 px-4 sm:px-6 lg:px-8 pb-20">
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
						<div className="text-center mb-16">
							<h1
								className="text-4xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent leading-tight"
								style={{ color: 'var(--title-project)' }}
							>
								DASHBOARD
							</h1>
							<p
								className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
								style={{ color: 'var(--secondary-text)' }}
							>
								{projectInfo?.description ||
									'Comprehensive overview of your project metrics and deployment status'}
							</p>
						</div>

						{/* Statistic Cards - 2 cards side by side */}
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
															fontWeight: 'bold',
														}}
														className={`${theme === 'dark' ? 'text-sky-400' : 'text-gray-700'}`}
													>
														No accuracy available
													</span>
												)
											}
											return (
												<span
													className={`${theme === 'dark' ? 'text-sky-500' : 'text-gray-700'} font-bold`}
												>
													{parseFloat(
														(
															metrics[0]?.value *
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
								</div>
							</Card>
							<Button
								size="large"
								className="border border-gray-400 border-1 h-full flex items-center justify-center backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transition:ease-in-out hover:opacity-90 relative group text-green-500"
								style={{
									background: cardGradient,
									backdropFilter: 'blur(10px)',
									borderRadius: '12px',
									fontFamily: 'Poppins, sans-serif',
								}}
								loading={usingModel}
								onClick={hasTraining ? showUpload : undefined}
								disabled={!hasTraining}
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
											Use your model
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

						{/* Demo 2 identical divs side by side */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* First div - Project Details */}
							<div className="p-8 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl bg-[linear-gradient(135deg, var(--card-gradient)_0%, rgba(255,255,255,0.02)_100%)]">
								<div className="flex items-center space-x-3 mb-6">
									<div className="p-2 rounded-xl bg-gradient-to-br from-white/20 to-white/10">
										<SettingOutlined
											className="text-xl"
											style={{
												color: 'var(--accent-text)',
											}}
										/>
									</div>
									<h2
										className="text-xl font-bold"
										style={{ color: 'var(--text)' }}
									>
										Project Details
									</h2>
								</div>
								<div className="space-y-4">
									<MetadataItem
										label="Project Name"
										value={projectInfo?.name}
									/>
									<MetadataItem
										label="Task Type"
										value={projectInfo?.task_type}
									/>
									<MetadataItem
										label="Created"
										value={formattedDate}
									/>
								</div>
							</div>

							{/* Second div - Duplicate of Project Details */}
							<div className="p-8 rounded-3xl border-[var(--border)] border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-2xl bg-[linear-gradient(135deg, var(--card-gradient)_0%, rgba(255,255,255,0.02)_100%)]">
								<div className="flex items-center space-x-3 mb-6">
									<div className="p-2 rounded-xl bg-gradient-to-br from-white/20 to-white/10">
										<SettingOutlined
											className="text-xl"
											style={{
												color: 'var(--accent-text)',
											}}
										/>
									</div>
									<h2
										className="text-xl font-bold"
										style={{ color: 'var(--text)' }}
									>
										Dataset Details
									</h2>
								</div>
								<div className="space-y-4">
									<MetadataItem
										label="Data Type"
										value={
											datasetInfo?.data?.data_type ||
											'N/A'
										}
									/>
									<MetadataItem
										label="Total Files"
										value={(
											datasetInfo?.data?.meta_data
												?.total_files ?? 'N/A'
										).toString()}
									/>
									<MetadataItem
										label="Total Size (MB)"
										value={(() => {
											const kb =
												datasetInfo?.data?.meta_data
													?.total_size_kb
											if (kb == null) return 'N/A'
											const mb = Number(kb) / 1024
											return `${mb.toFixed(2)}`
										})()}
									/>
									<MetadataItem
										label="Title"
										value={
											datasetInfo?.data?.title ||
											datasetInfo?.data?.dataset_title ||
											'N/A'
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<UpDataDeploy
				isOpen={isShowUpload}
				onClose={hideUpload}
				projectId={projectInfo?.id}
				deployModel={handleUseYourModel}
			/>
		</>
	)
}

export default ProjectInfo
