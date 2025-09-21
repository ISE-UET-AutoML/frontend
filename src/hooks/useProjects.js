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
console.log('Available project types:', projType)

export const useProjects = () => {
	const [projectState, updateProjState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	const [allProjects, setAllProjects] = useState([])
	const [selectedTrainingTask, setSelectedTrainingTask] = useState(null)
	const [isSelected, setIsSelected] = useState(
		projType.map((_, index) => index === 0)
	)
	const [projectName, setProjectName] = useState('')
	const [description, setDescription] = useState('')
	const [visibility, setVisibility] = useState('private')
	const [license, setLicense] = useState('MIT')
	const [expectedAccuracy, setExpectedAccuracy] = useState(75)
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

	// Sort projects
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

	// Apply filters + sort
	const applyFilters = () => {
		let filtered = allProjects

		// 1. filter theo search
		if (searchValue) {
			filtered = filtered.filter(
				(p) =>
					p.name &&
					p.name.toLowerCase().includes(searchValue.toLowerCase())
			)
		}

		// 2. filter theo task
		if (selectedTrainingTask) {
			filtered = filtered.filter(
				(p) => p.task_type === selectedTrainingTask
			)
		}

		// 3. sort
		filtered = sortProjects(filtered, selectedSort)

		updateProjState({ projects: filtered })
	}

	useEffect(() => {
		applyFilters()
	}, [searchValue, selectedTrainingTask, selectedSort, allProjects])

	// Handle sort change
	const handleSortChange = (sortKey) => {
		setSelectedSort(sortKey)
	}

	// Handle search
	const handleSearch = (value) => {
		setSearchValue(value)
	}

	const selectType = (e, idx) => {
		console.log('Selected project type index:', idx)
		const tmpArr = isSelected.map((el, index) =>
			index === idx ? true : false
		)
		console.log('Updated isSelected array:', tmpArr)
		setIsSelected(tmpArr)
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

	// const handleCreateProject = async (event) => {
	//     event.preventDefault()

	//     const formData = new FormData(event.target)
	//     const data = Object.fromEntries(formData)
	//     isSelected.forEach((el, idx) => {
	//         if (el) data.task_type = projType[idx]
	//     })

	//     if (jsonSumm) {
	//         const givenJson = JSON.parse(jsonSumm)
	//         const metricsExplain = givenJson.metrics_explain
	//         if (metricsExplain) data.metrics_explain = JSON.stringify(metricsExplain)
	//     }

	//     try {
	//         const response = await instance.post(API_URL.all_projects, data, {
	//             headers: {
	//                 'Content-Type': 'application/json',
	//             },
	//         })

	//         if (response.status === 200) {
	//             navigate(PATHS.PROJECT_BUILD(response.data.id))
	//         }
	//     } catch (error) {
	//         message.error('Project already existed')
	//     }
	// }

	// KHÔNG cần event.preventDefault nữa
	const handleCreateProject = async (values) => {
		const data = { ...values }

		// Gán project type được chọn
		isSelected.forEach((el, idx) => {
			if (el) data.task_type = projType[idx]
		})

		// Nếu có jsonSumm thì thêm metrics_explain
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

	const setTask = (_jsonSumm) => {
		if (_jsonSumm) {
			const givenSumm = JSON.parse(_jsonSumm)
			const givenTask = givenSumm.task
			const givenDescription = givenSumm.project_summary
			const givenName = givenSumm.project_name
			setDescription(givenDescription)
			setProjectName(givenName)
			let task = Object.values(TASK_TYPES).findIndex(
				(value) => value.task_type === givenTask
			)
			if (task !== -1) selectType(undefined, task)
		}
	}

	// Load projects on mount
	useEffect(() => {
		getProjects()
	}, [])

	return {
		// State
		projectState,
		updateProjState,
		allProjects,
		selectedTrainingTask,
		setSelectedTrainingTask,
		isSelected,
		projectName,
		setProjectName,
		description,
		setDescription,
		jsonSumm,
		setJsonSumm,
		selectedSort,
		searchValue,
		setSearchValue,
		isReset,
		selectType,
		getProjects,
		handleCreateProject,
		setTask,
		handleSearch,
		handleSortChange,
		resetFilters,
		visibility,
		setVisibility,
		license,
		setLicense,
		expectedAccuracy,
		setExpectedAccuracy,
	}
}
