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
    const [isSelected, setIsSelected] = useState(projType.map(() => false))
    const [projectName, setProjectName] = useState('')
    const [description, setDescription] = useState('')
    const [jsonSumm, setJsonSumm] = useState('')
    // Sort state
    const [selectedSort, setSelectedSort] = useState('created_at')

    const navigate = useNavigate()

    // Lọc project theo name
    const filterProjectsByName = (value) => {
        let filtered = allProjects
        if (value) {
            filtered = filtered.filter((p) =>
                p.name && p.name.toLowerCase().includes(value.toLowerCase())
            )
        }
        // Apply sort after filter
        filtered = sortProjects(filtered, selectedSort)
        updateProjState({ projects: filtered })
    }

    // Sort projects by selectedSort
    const sortProjects = (projects, sortKey = selectedSort) => {
        if (sortKey === 'name') {
            return [...projects].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        } else if (sortKey === 'created_at') {
            return [...projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        return projects
    }

    // Handle sort change
    const handleSortChange = (sortKey) => {
        setSelectedSort(sortKey)
        // Re-sort current projects
        updateProjState({ projects: sortProjects(projectState.projects, sortKey) })
    }

    const selectType = (e, idx) => {
        const tmpArr = isSelected.map((el, index) => {
            if (index === idx) el = true
            else el = false
            return el
        })
        setIsSelected(tmpArr)
    }

    const getProjects = async () => {
        const response = await instance.get(API_URL.all_projects)
        console.log(response.data)
        let proj = response.data.owned

        // Lấy experiments cho từng project và đếm status
        const projectsWithExp = await Promise.all(
            proj.map(async (project) => {
                try {
                    const experiments_res = await getAllExperiments(project.id)
                    const experiments = experiments_res.data
                    const done_experiments = experiments.filter(exp => exp.status === 'DONE').length
                    const training_experiments = experiments.filter(exp => exp.status === 'TRAINING').length
                    const setting_experiments = experiments.filter(exp => exp.status === 'SETTING_UP').length
                    return {
                        ...project,
                        done_experiments,
                        training_experiments,
                        setting_experiments,
                    }
                } catch (err) {
                    // Nếu lỗi thì trả về project không có các trường này
                    return {
                        ...project,
                        done_experiments: 0,
                        training_experiments: 0,
                        setting_experiments: 0,
                    }
                }
            })
        )

        setAllProjects(prev => projectsWithExp)
        // Apply sort
        updateProjState({ projects: sortProjects(projectsWithExp) })
        console.log('All Project', projectsWithExp)
        return projectsWithExp
    }

    const handleCreateProject = async (event) => {
        event.preventDefault()

        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData)
        isSelected.forEach((el, idx) => {
            if (el) data.task_type = projType[idx]
        })

        if (jsonSumm) {
            const givenJson = JSON.parse(jsonSumm)
            const metricsExplain = givenJson.metrics_explain
            if (metricsExplain)
                data.metrics_explain = JSON.stringify(metricsExplain)
        }

        try {
            const response = await instance.post(API_URL.all_projects, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            console.log('create Project response', { response })

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
            let task = -1
            task = Object.values(TASK_TYPES).findIndex(
                (value) => value.task_type === givenTask
            )
            if (task !== -1) selectType(undefined, task)
        }
    }

    // Filter projects by training task
    useEffect(() => {
        let filtered = allProjects
        if (selectedTrainingTask) {
            filtered = filtered.filter((p) => p.task_type === selectedTrainingTask)
        }
        filtered = sortProjects(filtered)
        updateProjState({ projects: filtered })
    }, [selectedTrainingTask, allProjects, selectedSort])

    // Load projects on mount
    useEffect(() => {
        projectState.projects.length >= 0 && getProjects()
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
        selectType,
        getProjects,
        handleCreateProject,
        setTask,
        filterProjectsByName,
        handleSortChange,
    }
}
