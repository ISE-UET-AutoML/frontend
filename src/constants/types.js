const TASK_TYPES = {
	IMAGE_CLASSIFICATION: {
		type: 'Image Classification',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
		card: { bg: '#e6f4ff', text: '#1677ff', border: '#1677ff' },
		dataType: 'IMAGE',
	},
	TEXT_CLASSIFICATION: {
		type: 'Text Classification',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: { bg: '#f6ffed', text: '#52c41a', border: '#52c41a' },
		dataType: 'TEXT',
	},
	TABULAR_CLASSIFICATION: {
		type: 'Tabular Classification',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: {
			bg: '#f9f0ff',
			text: '#722ed1',
			border: '#722ed1',
		},
		dataType: 'TABULAR',
	},
	MULTIMODAL_CLASSIFICATION: {
		type: 'Multimodal Classification',
    	description: 'Requires a folder containing a CSV file and a subfolder with images.',
		allowedExtensions: [],
		card: {
			bg: '#fffbe6',
			text: '#faad14',
			border: '#faad14',
		},
		dataType: 'MULTIMODAL',
	},
	MULTILABEL_IMAGE_CLASSIFICATION: {
		type: 'Multilabel Image Classification',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
		card: {
			bg: '#fff7e6',
			text: '#fa8c16',
			border: '#fa8c16',
		},
		dataType: 'IMAGE',
	},
	OBJECT_DETECTION: {
		type: 'Object Detection',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png'],
		dataType: 'IMAGE',
	},
	IMAGE_SEGMENTATION: {
		type: 'Image Segmentation',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png'],
		dataType: 'IMAGE',
	},
}

const DATASET_TYPES = {
	IMAGE: {
		type: 'Image',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
		card: { bg: '#e6f4ff', text: '#1677ff', border: '#1677ff' },
	},
	TEXT: {
		type: 'Text',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: { bg: '#f6ffed', text: '#52c41a', border: '#52c41a' },
	},
	TABULAR: {
		type: 'Tabular',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: {
			bg: '#f9f0ff',
			text: '#722ed1',
			border: '#722ed1',
		},
	},
	MULTIMODAL: {
        type: 'Multimodal',
        description: 'We accept a folder containing an "image" folder and a .csv file',
        allowedExtensions: ['jpg', 'jpeg', 'png', 'csv'],
        card: {
            bg: '#fffbe6',
            text: '#faad14',
            border: '#faad14',
        },
    },
}

export { DATASET_TYPES, TASK_TYPES }
