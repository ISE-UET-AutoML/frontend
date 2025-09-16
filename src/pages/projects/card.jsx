import React from 'react'
import { CubeTransparentIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { deleteProject } from 'src/api/project'
import { Button, Typography, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { TASK_TYPES } from 'src/constants/types'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

export default function ProjectCard({ project, getProjects }) {
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
	const tagColor = TASK_TYPES[taskType]?.card || TASK_TYPES["IMAGE_CLASSIFICATION"].card  // in case of no task assigned

	const handleCardClick = () => {
		window.location.href = PATHS.PROJECT_BUILD(project?.id)
	}

	return (
		<div
			key={project.id}
			className="group bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] rounded-2xl p-6 shadow-lg w-[380px] text-white font-poppins cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
			onClick={handleCardClick}
		>
			{/* Header */}
			<div className="flex justify-between items-start mb-4">
				<div className="w-20 h-20 rounded-xl bg-white/10 shadow-md flex items-center justify-center">
					<CubeTransparentIcon
						className="h-10 w-10 text-white transition-transform duration-500 ease-out group-hover:rotate-45"
						aria-hidden="true"
					/>
				</div>
				<div className="flex gap-3">
					<button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
						<StarIcon className="h-5 w-5 text-white" />
					</button>
					<button 
						className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-400 transition"
						onClick={(e) => handleDelete(e, project.id)}
					>
						<TrashIcon className="h-5 w-5 text-white" />
					</button>
				</div>
			</div>

			{/* Title & Description */}
			<h2 className="text-xl font-semibold mb-2">{project?.name}</h2>
			<p className="text-sm text-gray-300 leading-relaxed mb-4">
				{project?.description}
			</p>

			{/* Tag */}
			<span 
				className="px-4 py-1 text-sm font-semibold rounded-full text-white shadow-md"
				style={{
					background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
					border: `1px solid rgba(255, 255, 255, 0.2)`,
				}}
			>
				{project?.task_type}
			</span>
		</div>
	)
}
