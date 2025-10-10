import { useState, useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import instance from 'src/api/axios'
import { API_URL } from 'src/constants/api'
import { PATHS } from 'src/constants/paths'
import { TASK_TYPES } from 'src/constants/types'
import { getAllExperiments } from 'src/api/experiment'
import { getModelByExperimentId } from 'src/api/model'
import { getDeployedModel } from 'src/api/deploy'

const initialState = {
	showUploader: false,
	showUploaderManual: false,
	showUploaderChatbot: false,
	showSelectData: false,
	projects: [],
}

const projType = Object.keys(TASK_TYPES)

export const useProjects = () => {
	const [projectState, updateProjState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	const [allProjects, setAllProjects] = useState([])
	const [selectedTrainingTask, setSelectedTrainingTask] = useState(null)
	const [jsonSumm, setJsonSumm] = useState('')
	const [selectedSort, setSelectedSort] = useState('latest')
	const [searchValue, setSearchValue] = useState('')
	const [isReset, setIsReset] = useState(false)

	const navigate = useNavigate()

	const resetFilters = () => {
		setSearchValue('')
		setSelectedTrainingTask(null)
		setSelectedSort('latest')
		setIsReset(true)
	}

	const sortProjects = (projects, sortKey) => {
		switch (sortKey) {
			case 'name_asc':
				return [...projects].sort((a, b) =>
					(a.name || '').localeCompare(b.name || '')
				)

			case 'name_desc':
				return [...projects].sort((a, b) =>
					(b.name || '').localeCompare(a.name || '')
				)

			case 'latest':
				return [...projects].sort(
					(a, b) => new Date(b.created_at) - new Date(a.created_at)
				)

			case 'oldest':
				return [...projects].sort(
					(a, b) => new Date(a.created_at) - new Date(b.created_at)
				)

			default:
				return projects
		}
	}


	const applyFilters = () => {
		let filtered = allProjects

		if (searchValue) {
			filtered = filtered.filter(
				(p) =>
					p.name &&
					p.name.toLowerCase().includes(searchValue.toLowerCase())
			)
		}

		if (selectedTrainingTask) {
			filtered = filtered.filter(
				(p) => p.task_type === selectedTrainingTask
			)
		}

		filtered = sortProjects(filtered, selectedSort)
		updateProjState({ projects: filtered })
	}

	useEffect(() => {
		applyFilters()
	}, [searchValue, selectedTrainingTask, selectedSort, allProjects])

	const handleSortChange = (sortKey) => {
		setSelectedSort(sortKey)
	}

	const handleSearch = (value) => {
		setSearchValue(value)
	}

	const getProjects = async () => {
		const response = await instance.get(API_URL.all_projects)
		let proj = response.data.owned

		setAllProjects(
			proj.map((project) => ({
				...project,
				done_experiments: null,
				training_experiments: null,
				setting_experiments: null,
				deployStatus: 'Not Ready'
			}))
		)

		proj.forEach(async (project) => {
			try {
				const experiments_res = await getAllExperiments(project.id)
				const experiments = experiments_res.data

                const done_experiments = experiments.filter(
                    (exp) => exp.status === 'DONE'
                ).length
                const training_experiments = experiments.filter(
                    (exp) => exp.status === 'TRAINING'
                ).length
                const setting_experiments = experiments.filter(
                    (exp) => exp.status === 'SETTING_UP' 
                    || exp.status === 'CREATING_INSTANCE' 
                    || exp.status === 'DOWNLOADING_DEPENDENCIES' 
                    || exp.status === 'DOWNLOADING_DATA' 
                ).length

				// Usage status
				let deployStatus = 'Not Ready'
				if (done_experiments > 0) {
					const experimentId = experiments[0].id
					const modelRes = await getModelByExperimentId(experimentId)
					const modelId = modelRes.data.id
					const deployedModelRes = await getDeployedModel(modelId)
					const deployedModel = deployedModelRes.data
					if (deployedModel.length === 0) {
						deployStatus = 'Ready'
					} else {
						if (deployedModel[0].status !== 'FAILED') {
							deployStatus = 'In Use'
						} else {
							deployStatus = 'Failed'
						}
					}
				}

				setAllProjects((prev) =>
					prev.map((p) =>
						p.id === project.id
							? {
									...p,
									done_experiments,
									training_experiments,
									setting_experiments,
									deployStatus
								}
							: p
					)
				)
			} catch (err) {
				return {
					...project,
					done_experiments: 0,
					training_experiments: 0,
					setting_experiments: 0,
					deployStatus: 'Not Ready'
				}
			}
		})

		return allProjects
	}

	const handleCreateProject = async (values) => {
		const data = { ...values }
		
		if (jsonSumm) {
			const givenJson = JSON.parse(jsonSumm)
			if (givenJson.metrics_explain) {
				data.metrics_explain = JSON.stringify(givenJson.metrics_explain)
			}
		}

		try {
			const response = await instance.post(API_URL.all_projects, data, {
				headers: { 'Content-Type': 'application/json' },
			})

			if (response.status === 200) {
				navigate(PATHS.PROJECT_BUILD(response.data.id))
			}
		} catch (error) {
			message.error('Project already existed')
		}
	}

	const setTask = ( _jsonSumm, selectTypeFn ) => {
		if (_jsonSumm) {
			const givenSumm = JSON.parse(_jsonSumm)
			const givenTask = givenSumm.task
			const givenDescription = givenSumm.project_summary
			const givenName = givenSumm.project_name
			
			const taskIndex = projType.findIndex(
				(value) => value === givenTask
			);
	
			if (taskIndex !== -1 && typeof selectTypeFn === 'function') {
				selectTypeFn(undefined, taskIndex);
			}

			return { projectName: givenName, description: givenDescription };
		}
		return {};
	}

	useEffect(() => {
		getProjects()
	}, [])

	return {
		projectState,
		updateProjState,
		selectedTrainingTask,
		setSelectedTrainingTask,
		jsonSumm,
		setJsonSumm,
		getProjects,
		handleCreateProject,
		setTask,
		handleSearch,
		selectedSort,
		handleSortChange,
		searchValue,
		isReset,
		resetFilters,
	}
}