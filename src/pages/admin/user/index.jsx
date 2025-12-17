import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
	getUserProjects,
	getDatasetsByProjectId,
	getExperimentsByProjectId,
	getModelsByExperimentId,
	getModelDeploysByModelId,
	getUserDatasets,
	getUserInfo,
} from 'src/api/user'
import {
	ArrowLeftIcon,
	UserIcon,
	EnvelopeIcon,
	CalendarIcon,
	ClockIcon,
	FolderIcon,
	Squares2X2Icon,
	ArchiveBoxIcon,
	RocketLaunchIcon,
	ChartBarIcon,
} from '@heroicons/react/24/outline'

const AdminUserDetail = () => {
	const { userId } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const [user, setUser] = useState(location.state?.user || null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [stats, setStats] = useState({
		projectsCount: 0,
		datasetsCount: 0,
		experimentsCount: 0,
		modelsCount: 0,
		modelDeploysCount: 0,
	})
	const [taskTypeStats, setTaskTypeStats] = useState([])
	const [dataTypeStats, setDataTypeStats] = useState([])

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A'
		try {
			const date = new Date(dateString)
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch (e) {
			return dateString
		}
	}

	useEffect(() => {
		fetchUserData()
	}, [userId])

	const fetchUserData = async () => {
		try {
			setLoading(true)
			setError(null)

			// Only fetch user info if not passed via state
			if (!location.state?.user) {
				try {
					const userRes = await getUserInfo(userId)
					setUser(userRes.data?.data || userRes.data)
				} catch (userError) {
					console.error('Error fetching user info:', userError)
				}
			}

			// Step 1: Fetch all projects and datasets for the user
			try {
				const [projectsRes, datasetsRes] = await Promise.all([
					getUserProjects(userId),
					getUserDatasets(userId).catch(() => ({
						data: { data: [] },
					})),
				])

				const projectsData =
					projectsRes.data?.data || projectsRes.data || {}

				// Extract owned and collaborative projects
				const ownedProjects = Array.isArray(projectsData.owned)
					? projectsData.owned
					: []
				const collaborativeProjects = Array.isArray(
					projectsData.collaborative
				)
					? projectsData.collaborative
					: []

				// Combine both arrays
				const projects = [...ownedProjects, ...collaborativeProjects]

				// Extract datasets and filter by owner_id
				const datasetsData =
					datasetsRes.data?.data || datasetsRes.data || []
				const allDatasets = Array.isArray(datasetsData)
					? datasetsData.filter(
							(dataset) => dataset.owner_id === userId
						)
					: []

				console.log('User projects:', projects)
				console.log('User datasets:', allDatasets)

				// Step 2: For each project, fetch experiments
				const projectDataPromises = projects.map(async (project) => {
					const projectId = project.id || project.project_id
					if (!projectId)
						return {
							experiments: [],
							models: [],
							deploys: [],
						}

					try {
						// Fetch experiments for this project
						const experimentsRes = await getExperimentsByProjectId(
							projectId
						).catch(() => ({ data: [] }))

						const experiments = experimentsRes?.data || []

						// Step 3: For each experiment, fetch models
						const modelsPromises = experiments.map(
							async (experiment) => {
								const experimentId =
									experiment.id || experiment.experiment_id
								if (!experimentId) return []

								try {
									const modelsRes =
										await getModelsByExperimentId(
											experimentId
										)
									return modelsRes.data || []
								} catch (error) {
									console.error(
										`Error fetching models for experiment ${experimentId}:`,
										error
									)
									return []
								}
							}
						)

						const modelsArrays = await Promise.all(modelsPromises)
						const models = modelsArrays.flat()

						// Step 4: For each model, fetch deploys
						const deploysPromises = models.map(async (model) => {
							const modelId = model.id || model.model_id
							if (!modelId) return []

							try {
								const deploysRes =
									await getModelDeploysByModelId(modelId)
								return deploysRes.data || []
							} catch (error) {
								console.error(
									`Error fetching deploys for model ${modelId}:`,
									error
								)
								return []
							}
						})

						const deploysArrays = await Promise.all(deploysPromises)
						const deploys = deploysArrays.flat()

						return {
							experiments,
							models,
							deploys,
						}
					} catch (error) {
						console.error(
							`Error fetching data for project ${projectId}:`,
							error
						)
						return {
							experiments: [],
							models: [],
							deploys: [],
						}
					}
				})

				// Wait for all project data to be fetched
				const projectDataResults =
					await Promise.all(projectDataPromises)

				// Step 5: Aggregate totals

				const totalExperiments = projectDataResults.reduce(
					(sum, result) => {
						const count = Array.isArray(result.experiments)
							? result.experiments.length
							: 0
						return sum + count
					},
					0
				)

				const totalModels = projectDataResults.reduce((sum, result) => {
					const count = Array.isArray(result.models)
						? result.models.length
						: 0
					return sum + count
				}, 0)

				const totalDeploys = projectDataResults.reduce(
					(sum, result) => {
						const count = Array.isArray(result.deploys)
							? result.deploys.length
							: 0
						return sum + count
					},
					0
				)

				console.log('Aggregated stats:', {
					projectsCount: projects.length,
					datasetsCount: allDatasets.length,
					experimentsCount: totalExperiments,
					modelsCount: totalModels,
					modelDeploysCount: totalDeploys,
				})

				setStats({
					projectsCount: projects.length,
					datasetsCount: allDatasets.length,
					experimentsCount: totalExperiments,
					modelsCount: totalModels,
					modelDeploysCount: totalDeploys,
				})

				// Calculate task type and data type statistics
				calculateActivityStats(projects, allDatasets)
			} catch (statsError) {
				console.error('Error fetching statistics:', statsError)
				// Continue even if statistics fail
			}
		} catch (err) {
			console.error('Error fetching user data:', err)
			setError(err.message || 'Failed to fetch user details')
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	const calculateActivityStats = (projects, datasets) => {
		// Count task types
		const taskTypeCounts = {}
		projects.forEach((project) => {
			const taskType = project.task_type || 'Unknown'
			taskTypeCounts[taskType] = (taskTypeCounts[taskType] || 0) + 1
		})

		// Count data types
		const dataTypeCounts = {}
		datasets.forEach((dataset) => {
			const dataType = dataset.data_type || 'Unknown'
			dataTypeCounts[dataType] = (dataTypeCounts[dataType] || 0) + 1
		})

		// Convert to sorted arrays and take top 3
		const taskTypeArray = Object.entries(taskTypeCounts)
			.map(([type, count]) => ({
				type,
				count,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 3)

		const dataTypeArray = Object.entries(dataTypeCounts)
			.map(([type, count]) => ({
				type,
				count,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 3)

		setTaskTypeStats(taskTypeArray)
		setDataTypeStats(dataTypeArray)
	}

	if (loading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ backgroundColor: '#01000A' }}
			>
				<div className="text-center">
					<p className="text-white text-xl">
						Loading user details...
					</p>
				</div>
			</div>
		)
	}

	const statsCards = [
		{
			title: 'Projects',
			value: stats.projectsCount,
			icon: FolderIcon,
			color: 'text-blue-400',
			bgColor: 'bg-blue-500/10',
		},
		{
			title: 'Experiments',
			value: stats.experimentsCount,
			icon: Squares2X2Icon,
			color: 'text-purple-400',
			bgColor: 'bg-purple-500/10',
		},
		{
			title: 'Datasets',
			value: stats.datasetsCount,
			icon: ArchiveBoxIcon,
			color: 'text-orange-400',
			bgColor: 'bg-orange-500/10',
		},
		{
			title: 'Models',
			value: stats.modelsCount,
			icon: ChartBarIcon,
			color: 'text-cyan-400',
			bgColor: 'bg-cyan-500/10',
		},
		{
			title: 'Deployed Models',
			value: stats.modelDeploysCount,
			icon: RocketLaunchIcon,
			color: 'text-green-400',
			bgColor: 'bg-green-500/10',
		},
	]

	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: '#01000A',
				fontFamily: 'Poppins, sans-serif',
			}}
		>
			{/* Header */}
			<div
				className="border-b border-white/10"
				style={{ background: 'rgba(255,255,255,0.02)' }}
			>
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<button
								onClick={() => navigate('/admin/dashboard')}
								className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
							>
								<ArrowLeftIcon className="w-4 h-4" />
								<span>Back to Dashboard</span>
							</button>
							<div className="flex items-center gap-3">
								<img
									src="/PrimaryLogo.svg"
									width={100}
									alt="ASTRAL"
								/>
								<span className="text-white/40 text-xl">|</span>
								<h1 className="text-white text-xl font-semibold">
									User Details
								</h1>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* User Info Card */}
				<div
					className="backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8"
					style={{ background: 'rgba(255,255,255,0.04)' }}
				>
					<div className="flex items-start gap-6">
						<div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 flex items-center justify-center">
							<UserIcon className="w-12 h-12 text-white" />
						</div>
						<div className="flex-1">
							<h2 className="text-white text-3xl font-bold mb-2">
								{user?.full_name || user?.name || 'N/A'}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
								<div className="flex items-center gap-3">
									<div className="bg-white/5 rounded-lg p-2">
										<EnvelopeIcon className="w-4.5 h-4.5 text-white/60" />
									</div>
									<div>
										<p className="text-white/50 text-xs">
											Email
										</p>
										<p className="text-white text-sm">
											{user?.email || 'N/A'}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="bg-white/5 rounded-lg p-2">
										<CalendarIcon className="w-4.5 h-4.5 text-white/60" />
									</div>
									<div>
										<p className="text-white/50 text-xs">
											Created At
										</p>
										<p className="text-white text-sm">
											{formatDate(
												user?.created_at ||
													user?.createdAt
											)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="mb-8">
					<h3 className="text-white text-xl font-semibold mb-4">
						Activity Overview
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
						{statsCards.map((stat, index) => {
							const Icon = stat.icon
							return (
								<div
									key={index}
									className="backdrop-blur-xl rounded-2xl p-6 border border-white/10"
									style={{
										background: 'rgba(255,255,255,0.04)',
									}}
								>
									<div className="flex items-center justify-between mb-4">
										<div
											className={`${stat.bgColor} rounded-xl p-3`}
										>
											<Icon
												className={`${stat.color} w-6 h-6`}
											/>
										</div>
									</div>
									<p className="text-white/60 text-sm mb-1">
										{stat.title}
									</p>
									<p className="text-white text-3xl font-bold">
										{stat.value}
									</p>
								</div>
							)
						})}
					</div>
				</div>

				{/* Activity Distribution Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Most Active Task Types */}
					<div
						className="backdrop-blur-xl rounded-2xl p-8 border border-white/10"
						style={{ background: 'rgba(255,255,255,0.04)' }}
					>
						<h3 className="text-white text-lg font-semibold mb-6">
							Top Task Types
						</h3>
						<div className="space-y-4">
							{taskTypeStats.length > 0 ? (
								taskTypeStats.map((stat, index) => (
									<div key={index} className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="text-white/70 text-sm">
												{stat.type}
											</p>
											<span className="text-white text-sm font-semibold">
												{stat.count}
											</span>
										</div>
										<div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
												style={{
													width: `${(stat.count / (taskTypeStats[0]?.count || 1)) * 100}%`,
													transition:
														'width 0.3s ease-out',
												}}
											></div>
										</div>
									</div>
								))
							) : (
								<p className="text-white/40 text-sm text-center py-6">
									No task type data available
								</p>
							)}
						</div>
					</div>

					{/* Most Active Data Types */}
					<div
						className="backdrop-blur-xl rounded-2xl p-8 border border-white/10"
						style={{ background: 'rgba(255,255,255,0.04)' }}
					>
						<h3 className="text-white text-lg font-semibold mb-6">
							Top Data Types
						</h3>
						<div className="space-y-4">
							{dataTypeStats.length > 0 ? (
								dataTypeStats.map((stat, index) => (
									<div key={index} className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="text-white/70 text-sm">
												{stat.type}
											</p>
											<span className="text-white text-sm font-semibold">
												{stat.count}
											</span>
										</div>
										<div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-orange-500 to-red-500"
												style={{
													width: `${(stat.count / (dataTypeStats[0]?.count || 1)) * 100}%`,
													transition:
														'width 0.3s ease-out',
												}}
											></div>
										</div>
									</div>
								))
							) : (
								<p className="text-white/40 text-sm text-center py-6">
									No data type information available
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminUserDetail
