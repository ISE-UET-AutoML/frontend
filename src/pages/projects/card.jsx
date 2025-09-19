import React, { useState } from 'react'
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
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { deleteProject } from 'src/api/project'
import { Button, Typography, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { TASK_TYPES } from 'src/constants/types'

import image_classification from 'src/assets/images/image_classification.jpg'
import text_classification from 'src/assets/images/text_classification.jpg'
import multilabel_text_classification from 'src/assets/images/multilabel_text_classification.jpg'
import tabular_classification from 'src/assets/images/tabular_classification.jpg'
import tabular_regression from 'src/assets/images/tabular_regression.jpg'
import multilabel_tabular_classification from 'src/assets/images/multilabel_tabular_classification.jpg'
import multimodal_classification from 'src/assets/images/multimodal_classification.jpg'
import multilabel_image_classification from 'src/assets/images/multilabel_image_classification.jpg'
import object_detection from 'src/assets/images/object_detection.jpg'
import semantic_segmentation from 'src/assets/images/semantic_segmentation.jpg'
import time_series_forecasting from 'src/assets/images/time_series_forecasting.jpg'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

export default function ProjectCard({ project, getProjects }) {
	const [isStarred, setIsStarred] = useState(false)

	const handleStarClick = (e) => {
		e.preventDefault()
		e.stopPropagation()
		setIsStarred(!isStarred)
	}

	const handleDelete = (e, projectID) => {
		e.preventDefault() // Prevent card navigation
		e.stopPropagation() // Prevent event bubbling

		if (window.confirm('Are you sure you want to delete this project?')) {
			deleteProject(projectID)
				.then(() => {
					alert('Project deleted successfully!')
					getProjects()
				})
				.catch((error) => {
					alert('Failed to delete project. Please try again.')
					console.error(error)
				})
		}
	}

	const taskType = project?.task_type
	const tagColor =
		TASK_TYPES[taskType]?.card || TASK_TYPES['IMAGE_CLASSIFICATION'].card // in case of no task assigned

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

	const handleCardClick = () => {
		window.location.href = PATHS.PROJECT_INFO(project?.id)
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
		<div
			key={project.id}
			className="group rounded-2xl shadow-lg w-[380px] h-[320px] overflow-hidden font-poppins cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col relative"
			style={{
				background: 'var(--card-gradient)',
				border: '1px solid var(--border)',
				color: 'var(--text)',
			}}
			onClick={handleCardClick}
		>
			{/* Background Image Section */}
			<div className="relative h-32 overflow-hidden">
				<div
					className="w-full h-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"
					style={{
						backgroundImage: `url(${getTaskBackgroundImage(taskType)})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
					}}
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
							className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 transition"
							style={{
								background: 'var(--tag-gradient)',
								border: '1px solid rgba(255, 255, 255, 0.3)',
							}}
							onClick={(e) => handleDelete(e, project.id)}
						>
							<TrashIcon className="h-4 w-4 text-red-500" />
						</button>
					</div>
				</div>

				{/* Task Type Badge */}
				<div className="absolute bottom-4 left-4">
					<span
						className="px-3 py-1 text-sm font-semibold rounded-full shadow-md"
						style={{
							background: 'var(--tag-gradient)',
							border: '1px solid rgba(255, 255, 255, 0.3)',
							color: 'var(--text)',
						}}
					>
						{project?.task_type.replace(/_/g, ' ')}
					</span>
				</div>
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
					<p
						className="text-base leading-relaxed mb-4"
						style={{
							color: 'var(--secondary-text)',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}
					>
						{project?.description}
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
							{dayjs(project?.created_at).format('MMM DD, YYYY')}
						</span>
					</div>
					<div className="flex flex-col">
						<span style={{ color: 'var(--secondary-text)' }}>
							Status
						</span>
						<div className="flex items-center gap-1.5">
							{statusIcon}
							<span className={`font-semibold ${statusColor}`}>
								{projectStatus}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
