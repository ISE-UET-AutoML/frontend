import { API_BASE_URL } from "src/constants/api";
import instance from "./axios";

const proxyURL = `${API_BASE_URL}/api/service/visualize`

const genUI = (taskType, taskDescription, apiEndpoint, projectId) => {
    return instance.post(`${proxyURL}/gen-ui`, {
        task_type: taskType,
        task_description: taskDescription,
        api_endpoint: apiEndpoint,
        project_id: projectId
    })
}

export {
    genUI
}