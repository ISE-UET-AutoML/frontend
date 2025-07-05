import React, { useReducer, useEffect, useState } from 'react'
import { Button, Card, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import * as labelProjectAPI from 'src/api/labelProject'
import LabelProjectCard from './card'
import CreateLabelProjectModal from './CreateLabelProjectModal'
import { PATHS } from 'src/constants/paths'

const { Title } = Typography

// Hardcoded sample data for testing
const sampleProjects = [
	{
		_id: "674a8e2f123456789abcdef1",
		name: "Vehicle Detection System",
		description: "Detect and classify vehicles in traffic images including cars, trucks, motorcycles, and buses for traffic monitoring system.",
		type: "object_detection",
		status: "active",
		labels: ["car", "truck", "motorcycle", "bus", "bicycle", "pedestrian"],
		dataset: {
			_id: "674a8e2f123456789abcdef5",
			name: "Traffic Images Dataset",
			totalRecords: 3500
		},
		totalItems: 3500,
		labeledItems: 2100,
		createdBy: {
			_id: "674a8e2f123456789abcdef9",
			name: "Alice Johnson",
			email: "alice@company.com"
		},
		collaborators: [
			{
				_id: "674a8e2f123456789abcdef10",
				name: "Bob Smith",
				email: "bob@company.com",
				role: "annotator"
			},
			{
				_id: "674a8e2f123456789abcdef11",
				name: "Carol Davis",
				email: "carol@company.com",
				role: "reviewer"
			}
		],
		createdAt: "2024-11-20T08:30:00.000Z",
		updatedAt: "2024-12-15T14:22:00.000Z"
	},
	{
		_id: "674a8e2f123456789abcdef2",
		name: "Medical Equipment Recognition",
		description: "Identify and locate medical equipment in hospital images for inventory management and safety compliance.",
		type: "object_detection",
		status: "active",
		labels: ["wheelchair", "stretcher", "iv_stand", "monitor", "defibrillator", "oxygen_tank"],
		dataset: {
			_id: "674a8e2f123456789abcdef6",
			name: "Hospital Images",
			totalRecords: 1200
		},
		totalItems: 1200,
		labeledItems: 450,
		createdBy: {
			_id: "674a8e2f123456789abcdef12",
			name: "Dr. Emma Wilson",
			email: "emma.wilson@medical.com"
		},
		collaborators: [
			{
				_id: "674a8e2f123456789abcdef13",
				name: "Dr. Michael Chen",
				email: "michael.chen@medical.com",
				role: "annotator"
			}
		],
		createdAt: "2024-11-15T10:15:00.000Z",
		updatedAt: "2024-12-20T09:45:00.000Z"
	},
	{
		_id: "674a8e2f123456789abcdef3",
		name: "Security Camera Analysis",
		description: "Detect suspicious objects and activities in security footage for automated surveillance system.",
		type: "object_detection",
		status: "paused",
		labels: ["person", "bag", "weapon", "vehicle", "fire", "smoke"],
		dataset: {
			_id: "674a8e2f123456789abcdef7",
			name: "Security Footage",
			totalRecords: 5000
		},
		totalItems: 5000,
		labeledItems: 800,
		createdBy: {
			_id: "674a8e2f123456789abcdef14",
			name: "Sarah Kim",
			email: "sarah.kim@security.com"
		},
		collaborators: [
			{
				_id: "674a8e2f123456789abcdef15",
				name: "John Martinez",
				email: "john.martinez@security.com",
				role: "annotator"
			}
		],
		createdAt: "2024-10-01T12:00:00.000Z",
		updatedAt: "2024-12-10T16:30:00.000Z"
	}
]

const initialState = {
	projects: sampleProjects,
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

	const getLabelProjects = async () => {
		try {
			updateProjectState({ isLoading: true })
			const response = await labelProjectAPI.getLabelProjects()
			const projects = response.map(mapApiProjectToSampleProject)
			console.log(">>> Dữ liệu nhận được từ API:", projects)
			// Simulate API call delay
			setTimeout(() => {
				updateProjectState({
					projects: projects,
					isLoading: false
				})
			}, 500)
		} catch (error) {
			console.error('Error fetching label projects:', error)
			updateProjectState({ isLoading: false })
		}
	}

	const handleCreateProject = async (formData) => {
		try {
			// Simulate API call
			const newProject = {
				_id: `new_${Date.now()}`,
				...formData,
				status: 'draft',
				totalItems: 0,
				labeledItems: 0,
				createdBy: {
					_id: "current_user",
					name: "Current User",
					email: "user@example.com"
				},
				collaborators: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}

			// Add to sample projects
			sampleProjects.unshift(newProject)
			updateProjectState({
				showCreator: false,
				projects: [...sampleProjects]
			})

			console.log('Project created:', newProject)
		} catch (error) {
			console.error('Error creating label project:', error)
		}
	}

	const handleDeleteProject = async (projectId) => {
		try {
			// Simulate API call
			const updatedProjects = sampleProjects.filter(p => p._id !== projectId)
			sampleProjects.length = 0
			sampleProjects.push(...updatedProjects)
			updateProjectState({ projects: [...sampleProjects] })
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