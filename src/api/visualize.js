import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const proxyURL = `${API_BASE_URL}/api/service/visualize`

const genUI = (
	taskType,
	taskDescription,
	labels,
	apiEndpoint
	// sampleData = null
) => {
	const payload = {
		task_type: taskType,
		task_description: taskDescription,
		labels: labels,
		api_endpoint: apiEndpoint,
	}

	// if (sampleData !== null && sampleData !== undefined) {
	// 	const hasContent = Array.isArray(sampleData)
	// 		? sampleData.length > 0
	// 		: typeof sampleData === 'object'
	// 			? Object.keys(sampleData).length > 0
	// 			: Boolean(sampleData)

	// 	if (hasContent) {
	// 		payload.sample_data = sampleData
	// 	}
	// }

	return instance.post(`${proxyURL}/gen-ui`, payload)
}

const saveMetadata = (projectId, metadata) => {
	return instance.post(`${proxyURL}/save-metadata`, {
		project_id: projectId,
		metadata: metadata,
	})
}

export { genUI, saveMetadata }
