import { useState, useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import instance from 'src/api/axios'
import { API_URL } from 'src/constants/api'
import { PATHS } from 'src/constants/paths'
import { TASK_TYPES } from 'src/constants/types'

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
    
    const navigate = useNavigate()

    // Lọc project theo name
    const filterProjectsByName = (value) => {
        if (!value) {
            updateProjState({ projects: allProjects })
        } else {
            const filtered = allProjects.filter((p) =>
                p.name && p.name.toLowerCase().includes(value.toLowerCase())
            )
            updateProjState({ projects: filtered })
        }
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
        const proj = response.data.owned
        setAllProjects(prev => proj)
        updateProjState({ projects: proj })
        console.log('All Project', response.data)
        return response.data
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
        if (selectedTrainingTask) {
            updateProjState({
                projects: allProjects.filter((p) => p.task_type === selectedTrainingTask)
            })
        } else {
            updateProjState({ projects: allProjects })
        }
    }, [selectedTrainingTask, allProjects])

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
        // Actions
        selectType,
        getProjects,
        handleCreateProject,
        setTask,
        filterProjectsByName,
    }
}
