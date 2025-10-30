// Mapping giữa loại dataset và các task type có thể sử dụng
export const TASK_TYPE_INFO = {
    IMAGE_CLASSIFICATION: {
        displayName: 'Image Classification',
        description: 'Classify images into predefined categories'
    },
    TEXT_CLASSIFICATION: {
        displayName: 'Text Classification',
        description: 'Classify text into predefined categories'
    },
    MULTILABEL_TEXT_CLASSIFICATION: {
        displayName: 'Multilabel Text Classification',
        description: 'Assign multiple labels to each text entry'
    },
    TABULAR_CLASSIFICATION: {
        displayName: 'Tabular Classification',
        description: 'Classify structured data in tables'
    },
    TABULAR_REGRESSION: {
        displayName: 'Tabular Regression',
        description: 'Predict continuous values for structured data in tables'
    },
    MULTILABEL_TABULAR_CLASSIFICATION: {
        displayName: 'Multilabel Tabular Classification',
        description: 'Assign multiple labels to each entry in structured data'
    },
    MULTIMODAL_CLASSIFICATION: {
        displayName: 'Multimodal Classification',
        description: 'Classify using both images and text data'
    },
    MULTILABEL_IMAGE_CLASSIFICATION: {
        displayName: 'Multilabel Image Classification',
        description: 'Assign multiple labels to each image'
    },
    OBJECT_DETECTION: {
        displayName: 'Object Detection',
        description: 'Detect and locate objects in images'
    },
    SEMANTIC_SEGMENTATION: {
        displayName: 'Semantic Segmentation',
        description: 'Segment images into different regions'
    },
    TIME_SERIES_FORECASTING: {
        displayName: 'Time Series Forecasting',
        description: 'Predict future values based on historical time series data'
    },
    CLUSTERING: {
        displayName: 'Clustering',
        description: 'Group similar data points together without predefined labels'
    },
    AUDIO_CLASSIFICATION: {
        displayName: 'Audio Classification',
        description: 'Classify audio clips into predefined categories'
    }
};

// Mapping between dataset types and available task types
export const DATASET_TASK_MAPPING = {
    IMAGE: [
        'IMAGE_CLASSIFICATION',
        'MULTILABEL_IMAGE_CLASSIFICATION',
        'OBJECT_DETECTION',
        'SEMANTIC_SEGMENTATION'
    ],
    TEXT: ['TEXT_CLASSIFICATION', 'MULTILABEL_TEXT_CLASSIFICATION'],
    TABULAR: ['TABULAR_CLASSIFICATION', 'TABULAR_REGRESSION', 'MULTILABEL_TABULAR_CLASSIFICATION', 'CLUSTERING'],
    MULTIMODAL: ['MULTIMODAL_CLASSIFICATION'],
    TIME_SERIES: ['TIME_SERIES_FORECASTING'],
    AUDIO: ['AUDIO_CLASSIFICATION']
};
