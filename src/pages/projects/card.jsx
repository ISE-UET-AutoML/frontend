import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	CubeTransparentIcon,
	StarIcon,
	TrashIcon,
	DocumentTextIcon,
	PhotoIcon,
	TableCellsIcon,
	PuzzlePieceIcon,
	ArrowTrendingUpIcon,
	ArrowPathIcon,
	CheckCircleIcon,
	ClockIcon,
} from '@heroicons/react/24/outline'
import { Spin } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { deleteProject } from 'src/api/project'
// removed Typography imports (not used)

import image_classification from 'src/assets/images/image_classification.jpeg'
import text_classification from 'src/assets/images/text_classification.jpeg'
import multilabel_text_classification from 'src/assets/images/multilabel_text_classification.jpeg'
import tabular_classification from 'src/assets/images/tabular_classification.jpeg'
import tabular_regression from 'src/assets/images/tabular_regression.jpeg'
import multilabel_tabular_classification from 'src/assets/images/multilabel_tabular_classification.jpeg'
import multimodal_classification from 'src/assets/images/multimodal_classification.jpeg'
import multilabel_image_classification from 'src/assets/images/multilabel_image_classification.jpg'
import object_detection from 'src/assets/images/object_detection.jpg'
import semantic_segmentation from 'src/assets/images/semantic_segmentation.jpg'
import time_series_forecasting from 'src/assets/images/time_series_forecasting.jpg'
import * as experimentAPI from 'src/api/experiment'
import { useTheme } from 'src/theme/ThemeProvider'
dayjs.extend(relativeTime)

// no Text usage now

export default function ProjectCard({ project, getProjects }) {
	const theme = useTheme()
	const [isStarred, setIsStarred] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const navigate = useNavigate()

	const handleStarClick = (e) => {
		e.preventDefault()
		e.stopPropagation()
		setIsStarred(!isStarred)
	}

	const handleDelete = async (e, projectID) => {
		e.preventDefault() // Prevent card navigation
		e.stopPropagation() // Prevent event bubbling

		if (window.confirm('Are you sure you want to delete this project?')) {
			try {
				setIsDeleting(true) // start loading
				await deleteProject(projectID)
				alert('Project deleted successfully!')
				getProjects()
			} catch (error) {
				alert('Currently cannot delete project. Please try again.')
				console.error(error)
			} finally {
				setIsDeleting(false) // stop loading
			}
		}
	}

	const taskType = project?.task_type

	const getTaskBackgroundImage = (taskType) => {
		const imageMap = {
			IMAGE_CLASSIFICATION: image_classification,
			TEXT_CLASSIFICATION: text_classification,
			MULTILABEL_TEXT_CLASSIFICATION: multilabel_text_classification,
			TABULAR_CLASSIFICATION: tabular_classification,
			TABULAR_REGRESSION: tabular_regression,
			MULTILABEL_TABULAR_CLASSIFICATION:
				multilabel_tabular_classification,
			MULTIMODAL_CLASSIFICATION: multimodal_classification,
			MULTILABEL_IMAGE_CLASSIFICATION: multilabel_image_classification,
			OBJECT_DETECTION: object_detection,
			SEMANTIC_SEGMENTATION: semantic_segmentation,
			TIME_SERIES_FORECASTING: time_series_forecasting,
		}
		return imageMap[taskType] || image_classification
	}

	let IconComponent = CubeTransparentIcon
	if (taskType?.includes('TEXT')) {
		IconComponent = DocumentTextIcon
	} else if (taskType?.includes('IMAGE')) {
		IconComponent = PhotoIcon
	} else if (taskType?.includes('TABULAR')) {
		IconComponent = TableCellsIcon
	} else if (taskType?.includes('SEGMENTATION')) {
		IconComponent = PuzzlePieceIcon
	} else if (taskType?.includes('TIME_SERIES')) {
		IconComponent = ArrowTrendingUpIcon
	}

	const handleCardClick = async (event) => {
		if (event) {
			event.preventDefault()
			event.stopPropagation()
		}
		const experimentsRes = await experimentAPI.getAllExperiments(
			project?.id
		)
		const experiments = experimentsRes.data
		const experiment = experiments.length > 0 ? experiments[0] : null
		if (experiment.status === 'DONE') {
			window.location.href = PATHS.PROJECT_INFO(project?.id)
		} else {
			navigate(
				`/app/project/${project.id}/build/training?experimentName=${experiment.name}&experimentId=${experiment.id}`,
				{ replace: true }
			)
		}
	}

	// Derive status from experiments
	const runningCount =
		(project?.training_experiments || 0) +
		(project?.setting_experiments || 0)
	const doneCount = project?.done_experiments || 0
	let projectStatus = 'Pending'
	let statusIcon = <ClockIcon className="h-4 w-4 text-gray-500" />
	let statusColor = 'text-gray-500'

	if (runningCount > 0) {
		projectStatus = 'Training'
		statusIcon = (
			<ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />
		)
		statusColor = 'text-blue-500'
	} else if (doneCount > 0) {
		projectStatus = 'Completed'
		statusIcon = <CheckCircleIcon className="h-4 w-4 text-green-500" />
		statusColor = 'text-green-500'
	}

	return (
		<Spin spinning={isDeleting} tip="Deleting..." size="large">
			<div
				key={project.id}
				className={`group rounded-2xl shadow-lg w-full h-[320px] overflow-hidden font-poppins cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col relative border-2 ${theme?.theme === 'dark' ? 'border-gray-400' : 'border-blue-300'}`}
				style={{
					background: 'var(--card-gradient)',
					color: 'var(--text)',
				}}
				onClick={handleCardClick}
			>
				{/* Background Image Section */}
				<div className="relative h-40 overflow-hidden">
					<img
						src={getTaskBackgroundImage(taskType)}
						alt="project cover"
						className="max-h-[140px] w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
						loading="lazy"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 dark:to-black/20" />

					{/* Header with Avatar and Actions */}
					<div className="absolute top-4 left-4 right-4 flex justify-between items-start">
						<div
							className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center"
							style={{
								background: 'var(--tag-gradient)',
								border: '2px solid rgba(255, 255, 255, 0.3)',
							}}
						>
							<IconComponent
								className="h-8 w-8 transition-transform duration-500 ease-out"
								style={{ color: 'var(--accent-color)' }}
								aria-hidden="true"
							/>
						</div>
						<div className="flex gap-2">
							<button
								className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
								style={{
									background: 'var(--tag-gradient)',
									border: '1px solid rgba(255, 255, 255, 0.3)',
								}}
								onClick={handleStarClick}
							>
								<StarIcon
									className={`h-4 w-4 transition-all duration-200 ${isStarred ? 'fill-current' : ''}`}
									style={{
										color: isStarred ? '#FFD700' : 'gray',
									}}
								/>
							</button>
							<button
								className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 transition relative"
								style={{
									background: 'var(--tag-gradient)',
									border: '1px solid rgba(255, 255, 255, 0.3)',
								}}
								onClick={(e) => handleDelete(e, project.id)}
								disabled={isDeleting}
							>
								<TrashIcon className="h-4 w-4 text-red-500" />
							</button>
						</div>
					</div>

					{/* Task Type Badge moved below project name */}
				</div>

				{/* Content Section */}
				<div className="flex-1 p-6 flex flex-col">
					{/* Title & Description */}
					<div className="flex-1">
						<h2
							className="text-xl font-bold mb-2 truncate"
							style={{ color: 'var(--text)' }}
						>
							{project?.name}
						</h2>
						{/* New Task Type Tag below the project name - color per task */}
						{(() => {
							const map = {
								IMAGE_CLASSIFICATION: 'bg-blue-500',
								TEXT_CLASSIFICATION: 'bg-emerald-500',
								MULTILABEL_TEXT_CLASSIFICATION: 'bg-teal-500',
								TABULAR_CLASSIFICATION: 'bg-amber-500',
								TABULAR_REGRESSION: 'bg-orange-500',
								MULTILABEL_TABULAR_CLASSIFICATION:
									'bg-lime-500',
								MULTIMODAL_CLASSIFICATION: 'bg-fuchsia-500',
								MULTILABEL_IMAGE_CLASSIFICATION: 'bg-pink-500',
								OBJECT_DETECTION: 'bg-red-500',
								SEMANTIC_SEGMENTATION: 'bg-violet-500',
								TIME_SERIES_FORECASTING: 'bg-cyan-500',
							}
							const cls = map[taskType] || 'bg-sky-500'
							return (
								<div
									className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white mb-3 ${cls}`}
								>
									{(project?.task_type || '').replace(
										/_/g,
										' '
									)}
								</div>
							)
						})()}
						<p
							className="text-base leading-relaxed mb-1"
							style={{
								color: 'var(--secondary-text)',
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}}
						>
							{project?.description || 'No description'}
						</p>
					</div>

					{/* Divider */}
					<div
						style={{
							width: '100%',
							height: '1px',
							background: 'var(--divider)',
							marginBottom: 16,
							borderRadius: 2,
						}}
					/>

					{/* Meta Info */}
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="flex flex-col">
							<span style={{ color: 'var(--secondary-text)' }}>
								Created
							</span>
							<span
								className="font-semibold truncate"
								style={{ color: 'var(--text)' }}
							>
								{dayjs(project?.created_at).format(
									'MMM DD, YYYY'
								)}
							</span>
						</div>
						<div className="flex flex-col">
							<span style={{ color: 'var(--secondary-text)' }}>
								Status
							</span>
							<div className="flex items-center gap-1.5">
								{statusIcon}
								<span
									className={`font-semibold ${statusColor}`}
								>
									{projectStatus}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Spin>
	)
}
