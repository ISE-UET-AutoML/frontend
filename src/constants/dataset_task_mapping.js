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
    TABULAR_CLASSIFICATION: {
        displayName: 'Tabular Classification',
        description: 'Classify structured data in tables'
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
    TEXT: ['TEXT_CLASSIFICATION'],
    TABULAR: ['TABULAR_CLASSIFICATION'],
    MULTIMODAL: ['MULTIMODAL_CLASSIFICATION']
};
