const PATHS = {
    /*-----------------------------BASE-------------------------------------*/

    ROOT: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DEFAULT: '/app',
    PROJECTS: '/app/projects',
    BUCKETS: '/app/buckets',
    DATASETS: '/app/datasets',
    LABELS: '/app/label-projects',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    MODELS: '/app/models',

    /*-----------------------------PROJECT-------------------------------------*/

    PROJECT_BUILD: (projectID) => `/app/project/${projectID}/build/uploadData`,
    PROJECT_TRAINING: (projectID, experimentId, experimentName) =>
        `/app/project/${projectID}/build/training?experimentId=${experimentId}&experimentName=${experimentName}`,
    PROJECT_TRAININGRESULT: (projectID, experimentId, experimentName) =>
        `/app/project/${projectID}/build/trainResult?experimentId=${experimentId}&experimentName=${experimentName}`,
    PROJECT_MODEL: (projectID) => `/app/project/${projectID}/model`,
    PROJECT_EXPERIMENT: (projectID) => `/app/project/${projectID}/experiments`,
    PROJECT_SETTINGS: (projectID) => `/app/project/${projectID}/settings`,
    PREDICT: (projectID, experimentName) =>
        `/app/project/${projectID}/build?step=4&experiment_name=${experimentName}`,

    /*-----------------------------MODEL-------------------------------------*/
    MODEL_VIEW: (projectId, experimentId, experimentName, modelId) =>
        `/app/project/${projectId}/build/trainResult?experimentId=${experimentId}&experimentName=${experimentName}&modelId=${modelId}`,
    /*-----------------------------DEPLOY----------------------------------- */
    PROJECT_DEPLOY: (projectID) => `/app/project/${projectID}/deploy`,
    MODEL_DEPLOY_VIEW: (projectId, deployId) =>
        `/app/project/${projectId}/deploy/${deployId}`,

    /*-----------------------------DATASET-------------------------------------*/

    DATASET_VIEW: (datasetID) => `/app/dataset/${datasetID}/view`,

    /*-----------------------------LABEL-------------------------------------*/

    LABEL_VIEW: (datasetID, name) => `/app/label/${datasetID}/${name}`,

    // Label Project paths
    LABEL_PROJECTS: '/label-projects',
    LABEL_PROJECT_VIEW: (id) => `/app/label-projects/${id}`,
    LABEL_PROJECT_EDIT: (id) => `/app/label-projects/${id}/edit`,
    LABEL_PROJECT_LABEL: (id) => `/app/label-projects/${id}/label`,
    LABEL_PROJECT_STATS: (id) => `/app/label-projects/${id}/stats`,
    LABEL_PROJECT_EXPORT: (id) => `/app/label-projects/${id}/export`,
    LABEL_PROJECT_COLLABORATORS: (id) => `/app/label-projects/${id}/collaborators`,

    /*-----------------------------OTHER-------------------------------------*/
    TESTING: '/testing',
}

export { PATHS }
