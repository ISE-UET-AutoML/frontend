import React from 'react'
import { CubeTransparentIcon, StarIcon, TrashIcon, DocumentTextIcon, PhotoIcon, TableCellsIcon, PuzzlePieceIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
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

    let IconComponent = CubeTransparentIcon
    if (taskType?.includes("TEXT")) {
        IconComponent = DocumentTextIcon
    } else if (taskType?.includes("IMAGE")) {
        IconComponent = PhotoIcon
    } else if (taskType?.includes("TABULAR")) {
        IconComponent = TableCellsIcon
    } else if (taskType?.includes("SEGMENTATION")) {
        IconComponent = PuzzlePieceIcon
    } else if (taskType?.includes("TIME_SERIES")) {
        IconComponent = ArrowTrendingUpIcon
    }

    const handleCardClick = () => {
        window.location.href = PATHS.PROJECT_INFO(project?.id)
    }

    return (
		<div
            key={project.id}
			className="group rounded-2xl p-6 shadow-lg w-[380px] h-[280px] overflow-hidden font-poppins cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
            style={{ 
                background: 'var(--card-gradient)', 
                border: '1px solid var(--border)',
                color: 'var(--text)'
            }}
            onClick={handleCardClick}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div 
                    className="w-20 h-20 rounded-xl shadow-md flex items-center justify-center"
                    style={{ background: 'var(--accent-gradient)' }}
                >
                    <IconComponent
                        className="h-10 w-10 transition-transform duration-500 ease-out group-hover:rotate-45"
                        style={{ color: 'var(--accent-text)' }}
                        aria-hidden="true"
                    />
                </div>
                <div className="flex gap-3">
                    <button 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition"
                        style={{ 
                            background: 'var(--hover-bg)', 
                            border: '1px solid var(--border)'
                        }}
                    >
                        <StarIcon className="h-5 w-5" style={{ color: 'var(--secondary-text)' }} />
                    </button>
                    <button
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                        style={{ 
                            background: 'var(--hover-bg)', 
                            border: '1px solid var(--border)'
                        }}
                        onClick={(e) => handleDelete(e, project.id)}
                    >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                    </button>
                </div>
            </div>

		{/* Title & Description */}
		<div className="flex-1 flex flex-col">
			<div className="flex items-center justify-between gap-3 mb-2">
				<h2 className="text-xl font-semibold truncate" style={{ color: 'var(--text)' }}>
					{project?.name}
				</h2>
			<span 
				className="px-3 py-1 text-xs font-semibold rounded-full shadow-md shrink-0"
				style={{
					background: 'var(--tag-gradient)',
					border: '1px solid var(--border)',
					color: 'var(--text)'
				}}
			>
				{project?.task_type.replace(/_/g, ' ')}
			</span>
			</div>
			<p className="text-sm leading-relaxed mb-3 max-h-12 overflow-hidden" style={{ color: 'var(--secondary-text)' }}>
				{project?.description}
			</p>
			<div style={{
				width: '100%',
				height: '1px',
				background: 'var(--divider)',
				marginTop: 12,
				marginBottom: 8,
				borderRadius: 2,
			}} />
           
            
			{/* Meta Info Grouped */}
			<div className="flex flex-col gap-2 mb-8">
				<div className="text-xs mb-1" style={{ color: 'var(--secondary-text)' }}>
					<span>Created at: </span> 
					<span className="font-bold" style={{ color: 'var(--text)' }}>
						{dayjs(project?.created_at).format('YYYY-MM-DD HH:mm')}
					</span>
				</div>
			<div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'var(--secondary-text)' }}>
				<span>
					Trained: <span className="font-bold" style={{ color: 'var(--text)' }}>{project?.done_experiments || 0}</span>
				</span>
				<span>
					Training: <span className="font-bold" style={{ color: 'var(--text)' }}>{(project?.training_experiments || 0) + (project?.setting_experiments || 0)}</span>
				</span>
			</div>
		</div>
			</div>
		</div>
	)
}
