export const API_BASE_URL = process.env.REACT_APP_API_URL
export const API_URL = {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    refresh_token: `${API_BASE_URL}/auth/signup`,
    all_projects: `${API_BASE_URL}/projects`,
    all_models: `${API_BASE_URL}/projects/models`,
    train_model: (projectID) => `${API_BASE_URL}/projects/${projectID}/train`,
    delete_project: (projectID) => `${API_BASE_URL}/projects/${projectID}/delete`,
    upload_file: (projectID) => `${API_BASE_URL}/projects/${projectID}/upload`,
    get_project_dataset: (projectID) => `${API_BASE_URL}/projects/${projectID}/datasets`,
    update_label: (imageId) => `${API_BASE_URL}/images/${imageId}`,
    explain_instance: (projectID) => `${API_BASE_URL}/projects/${projectID}/explain`,
    create_label_for_dataset: (datasetID) => `${API_BASE_URL}/datasets/${datasetID}/labels`,
    get_model: (experimentName) => `${API_BASE_URL}/experiments/model/${experimentName}`,
    get_training_history: (experimentName) => `${API_BASE_URL}/experiments/train-history/?experiment_name=${experimentName}`,
}
