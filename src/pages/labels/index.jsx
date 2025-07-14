import React, { useReducer, useEffect, useState } from 'react'
import { Button, Card, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import LabelProjectCard from './card'
import CreateLabelProjectModal from './CreateLabelProjectModal'
import { createLbProject, getLabelProjects, deleteProject } from 'src/api/labelProject'
import * as labelProjectAPI from 'src/api/labelProject'
import { snakeToCamel } from 'src/utils/mapper'

const { Title } = Typography

const initialState = {
	projects: [],
	isLoading: false,
	showCreator: false,
}
const typeRegex = /TaskType\.(\w+)\s+task/;

const mapApiProjectToSampleProject = (apiProject) => {
    return {
        _id: apiProject.id, // Map 'id' sang '_id'
        title: apiProject.title, // Map 'title' sang 'title'
        description: apiProject.description,
        type: apiProject.description.match(typeRegex)?.[1] || 'Unknown', // Giữ giá trị mặc định, vì API không có trường này
        status: 'active', // Giữ giá trị mặc định
        labels: apiProject.parsed_label_config?.choice?.labels || [], // Lấy danh sách nhãn
        dataset: {
            _id: `dataset_${apiProject.id}`, // Tạo ID giả
            name: `Dataset for ${apiProject.title}`,
            totalRecords: apiProject.task_number
        },
        totalItems: apiProject.task_number,
        labeledItems: apiProject.finished_task_number,
        createdBy: {
            _id: apiProject.created_by.id,
            name: apiProject.created_by.email.split('@')[0], // Tách tên từ email
            email: apiProject.created_by.email
        },
        collaborators: [], // API không có dữ liệu này, để mảng rỗng
        createdAt: apiProject.created_at,
        updatedAt: apiProject.created_at // Dùng tạm created_at
    };
};

export default function LabelProjects() {
	const [projectState, updateProjectState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)

	const [deletingIds, setDeletingIds] = useState(new Set())

	const getLabelProjects = async () => {
		try {
			const response = await labelProjectAPI.getLabelProjects()
			console.log('Raw API response:', response)
			console.log(snakeToCamel(response.data))

			updateProjectState({
				projects: snakeToCamel(response.data),
				isLoading: false
			})
		} catch (error) {
			console.error('Error fetching label projects:', error)
			updateProjectState({ isLoading: false })
		}
	}

	const handleCreateProject = async (payload) => {
		try {
			const response = await createLbProject(payload)
			if (response.status === 201) {
				updateProjectState({ showCreator: false })
				getLabelProjects() // Refresh list after creation
			}
			console.log('Project created:', snakeToCamel(response.data))
		} catch (error) {
			console.error('Error creating label project:', error)
		}
	}

	const handleDeleteProject = async (projectId) => {
		setDeletingIds(prev => new Set(prev).add(projectId))
		try {
			await deleteProject(projectId)
			message.success('Project deleted successfully!')
			await getLabelProjects()
		} catch (error) {
			console.error('Error deleting label project:', error)
			message.error('Failed to project')
		} finally {
			setDeletingIds(prev => {
				const newSet = new Set(prev)
				newSet.delete(projectId)
				return newSet
			})
		}
	}

	useEffect(() => {
		getLabelProjects()
	}, [])

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<Title level={3}>Label Projects</Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => updateProjectState({ showCreator: true })}
				>
					New Label Project
				</Button>
			</div>

			{projectState.isLoading ? (
				<div className="text-center py-8">
					<p>Loading projects...</p>
				</div>
			) : projectState.projects.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{projectState.projects.map((project) => (
						<LabelProjectCard
							key={project.id}
							project={project}
							onDelete={() => handleDeleteProject(project.id)}
							isDeleting={deletingIds.has(project.id)}
						/>
					))}
				</div>
			) : (
				<Card className="text-center">
					<Title level={4}>No Label Projects Found</Title>
					<p>Get started by creating a new label project to annotate your data.</p>
				</Card>
			)}

			<CreateLabelProjectModal
				visible={projectState.showCreator}
				onCancel={() => updateProjectState({ showCreator: false })}
				onCreate={handleCreateProject}
			/>
		</div>
	)
}