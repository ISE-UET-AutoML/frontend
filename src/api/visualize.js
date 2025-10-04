import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const proxyURL = `${API_BASE_URL}/api/service/visualize`

const genUI = (taskType, taskDescription, labels, apiEndpoint) => {
	return instance.post(`${proxyURL}/gen-ui`, {
		task_type: taskType,
		task_description: taskDescription,
		labels: labels,
		api_endpoint: apiEndpoint,
	})
}

const saveMetadata = (projectId, metadata) => {
	return instance.post(`${proxyURL}/save-metadata`, {
		project_id: projectId,
		metadata: metadata,
	})
}

export { genUI, saveMetadata }
