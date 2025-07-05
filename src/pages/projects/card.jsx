import React from 'react'
import { CubeTransparentIcon } from '@heroicons/react/24/outline'
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
			className="group relative rounded-lg bg-white shadow-md transition duration-300 hover:shadow-lg cursor-pointer"
			style={{
				border: '1px solid #e8e8e8',
				overflow: 'hidden',
			}}
			onClick={handleCardClick}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'translateY(-5px)'
				e.currentTarget.style.boxShadow =
					'0 4px 12px rgba(0, 0, 0, 0.1)'
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'translateY(0)'
				e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
			}}
		>
			<div className="p-6 flex items-center">
				<div
					className="group rounded-[12px] p-3 ring-4 ring-white transition duration-450"
					style={{
						backgroundColor: '#e6f4ff',
						color: '#1677ff',
					}}
				>
					<CubeTransparentIcon
						className="h-12 w-12 transition-transform group-hover:rotate-45"
						aria-hidden="true"
					/>
				</div>

				<Button
					type="text"
					icon={
						<DeleteOutlined
							style={{ fontSize: 18, color: '#ff4d4f' }}
						/>
					}
					onClick={(e) => handleDelete(e, project.id)}
					className="ml-auto hover:bg-red-100"
					style={{
						width: 48,
						height: 48,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: 12,
						backgroundColor: '#fff1f0',
						transition:
							'transform 0.2s ease, background-color 0.3s ease',
						zIndex: 1,
					}}
				/>
			</div>

			<div
				className="mt-5 p-6 transition duration-300"
				style={{
					backgroundColor: '#fafafa',
				}}
			>
				<div className="flex w-full justify-between items-center">
					<Title level={4} style={{ margin: 0, color: '#000000' }}>
						{project?.name}
					</Title>
					{project.createdAt && (
						<Text style={{ fontSize: 12, color: '#666666' }}>
							Created {dayjs(project.createdAt).fromNow()}
						</Text>
					)}
				</div>
				<div className="flex w-full justify-between items-center mt-2">
					<Text style={{ fontSize: 14, color: '#444444' }}>
						{project?.description}
					</Text>
					<Tag
						style={{
							fontSize: 12,
							backgroundColor: tagColor.bg,
							color: tagColor.text,
							border: `1px solid ${tagColor.border}`,
						}}
					>
						{project?.task_type}
					</Tag>
				</div>
			</div>
		</div>
	)
}
