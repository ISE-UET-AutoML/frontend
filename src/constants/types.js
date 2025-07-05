const TASK_TYPES = {
	IMAGE_CLASSIFICATION: {
		type: 'Image Classification',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
		card: { bg: '#e6f4ff', text: '#1677ff', border: '#1677ff' },
	},
	TEXT_CLASSIFICATION: {
		type: 'Text Classification',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: { bg: '#f6ffed', text: '#52c41a', border: '#52c41a' },
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
	},
	MULTIMODAL_CLASSIFICATION: {
		type: 'Multimodal Classification',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: {
			bg: '#fffbe6',
			text: '#faad14',
			border: '#faad14',
		},
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
	},
	OBJECT_DETECTION: {
		type: 'Object Detection',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png'],
	},
	SEGMENTATION: {
		type: 'Segmentation',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png'],
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
}

export { DATASET_TYPES, TASK_TYPES }
