import { useState, useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import instance from 'src/api/axios'
import { API_URL } from 'src/constants/api'
import { PATHS } from 'src/constants/paths'
import { TASK_TYPES } from 'src/constants/types'
import { getAllExperiments } from 'src/api/experiment'

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
	const [selectedSort, setSelectedSort] = useState('created_at')
	const [searchValue, setSearchValue] = useState('')
	const [isReset, setIsReset] = useState(false)

	const navigate = useNavigate()

	const resetFilters = () => {
		setSearchValue('')
		setSelectedTrainingTask(null)
		setSelectedSort('created_at')
		setIsReset(true)
	}

	const sortProjects = (projects, sortKey = selectedSort) => {
		if (sortKey === 'name') {
			return [...projects].sort((a, b) =>
				(a.name || '').localeCompare(b.name || '')
			)
		} else if (sortKey === 'created_at') {
			return [...projects].sort(
				(a, b) => new Date(b.created_at) - new Date(a.created_at)
			)
		}
		return projects
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

				setAllProjects((prev) =>
					prev.map((p) =>
						p.id === project.id
							? {
									...p,
									done_experiments,
									training_experiments,
									setting_experiments,
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