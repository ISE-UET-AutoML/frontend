export const API_BASE_URL = process.env.REACT_APP_API_URL
export const API_URL = {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    refresh_token: `${API_BASE_URL}/auth/signup`,
    all_projects: `${API_BASE_URL}/projects`,
    all_models: `${API_BASE_URL}/projects/models`,
    train_model: (projectID) => `${API_BASE_URL}/projects/${projectID}/train`,
    upload_file: (projectID) => `${API_BASE_URL}/projects/${projectID}/upload`,
}
