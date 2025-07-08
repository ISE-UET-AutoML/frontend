import React, { useReducer, useEffect, useState } from 'react'
import { Button, Card, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import LabelProjectCard from './card'
import CreateLabelProjectModal from './CreateLabelProjectModal'
import { createLbProject, getLbProjects } from 'src/api/labelProject'

const { Title } = Typography

const initialState = {
	projects: [],
	isLoading: false,
	showCreator: false,
}

export default function LabelProjects() {
	const [projectState, updateProjectState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)

	const getLabelProjects = async () => {
		try {
			const response = await getLbProjects()
			console.log(response.data)
			updateProjectState({
				projects: response.data,
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
				getLabelProjects // Refresh list after creation
			}
			console.log('Project created:', response.data)
		} catch (error) {
			console.error('Error creating label project:', error)
		}
	}

	const handleDeleteProject = async (projectId) => {
		try {
			console.log('Project deleted:', projectId)
		} catch (error) {
			console.error('Error deleting label project:', error)
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
							key={project._id}
							project={project}
							onDelete={handleDeleteProject}
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