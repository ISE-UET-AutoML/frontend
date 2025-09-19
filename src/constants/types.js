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
	MULTILABEL_TEXT_CLASSIFICATION: {
		type: 'Multilabel Text Classification',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: { bg: '#f6ffed', text: '#237804', border: '#237804' },
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
	TABULAR_REGRESSION: {
		type: 'Tabular Regression',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: {
			bg: '#f9f0ff',
			text: '#621d5cff',
			border: '#621d5cff',
		},
		dataType: 'TABULAR',
	},
	MULTILABEL_TABULAR_CLASSIFICATION: {
		type: 'Multilabel Tabular Classification',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: {
			bg: '#f9f0ff',
			text: '#391085ff',
			border: '#391085ff',
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
	SEMANTIC_SEGMENTATION: {
		type: 'Semantic Segmentation',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png'],
		dataType: 'IMAGE',
	},
	TIME_SERIES_FORECASTING: {
		type: 'Time Series Forecasting',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		dataType: 'TIME_SERIES',
	},
}

const DATASET_TYPES = {
	IMAGE: {
		type: 'Image',
		description: 'We accept JPEG, PNG image format',
		allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
		card: { bg: '#e6f4ff', text: '#1677ff', border: '#1677ff' },
		preparingInstructions: `📂 Organize your images into folders by class/label:

💡 Example structure:
├── cats/
│   ├── cat1.jpg
│   ├── cat2.png
│   └── cat3.jpeg
├── dogs/
│   ├── dog1.jpg
│   ├── dog2.png
│   └── dog3.jpeg
└── birds/
    ├── bird1.jpg
    └── bird2.png

✅ Requirements:
• Supported formats: JPEG, PNG, WebP
• Recommended image size: 224x224px or higher
• Maximum file size: 10MB per image`,
	},
	TEXT: {
		type: 'Text',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: { bg: '#f6ffed', text: '#52c41a', border: '#52c41a' },
		preparingInstructions: `📄 Prepare your text data in CSV format:

📋 Required columns:
• 'text' - containing your text data
• 'label' - containing classification labels (optional)

💡 Example CSV format:
text,label
"This is a positive review","positive"
"Great product, highly recommend","positive"
"Poor quality, disappointed","negative"

✅ Guidelines:
• UTF-8 encoding required
• Escape quotes with double quotes ("")
• Maximum 10,000 characters per text entry
• Minimum 100 samples recommended`,
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
		preparingInstructions: `📊 Structure your tabular data in CSV format:

📋 Requirements:
• First row must contain column headers
• Target column should be clearly named (e.g., 'target', 'label')
• Numeric data should use decimal points (not commas)

💡 Example format:
age,income,education,target
25,50000,bachelor,approved
35,75000,master,approved
22,30000,high_school,rejected

✅ Data quality tips:
• Handle missing values (use empty cells or 'NULL')
• Ensure consistent data types per column
• Remove or encode special characters
• Maximum 1M rows, 1000 columns`,
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
		preparingInstructions: `🖼️ Create a multimodal dataset structure:

📁 Required folder structure:
dataset_folder/
├── images/
│   ├── img001.jpg
│   ├── img002.png
│   └── img003.jpeg
└── metadata.csv

📄 CSV format requirements:
• 'image_path' - relative path to image file
• 'caption' or 'description' - text descriptions
• Additional columns for labels/metadata

💡 Example CSV:
image_path,caption,category
images/img001.jpg,"A red car on the street",vehicle
images/img002.png,"Beautiful sunset over mountains",nature
images/img003.jpeg,"Cat sleeping on a couch",animal

✅ Guidelines:
• Image files must be in 'images' subfolder
• CSV must reference correct image paths
• Supported image formats: JPEG, PNG
• Text descriptions should be descriptive and accurate`,
	},
	TIME_SERIES: {
		type: 'Time Series',
		description: 'We accept CSV text format',
		allowedExtensions: ['csv'],
		card: {
			bg: '#fff0f6',
			text: '#eb2f96',
			border: '#eb2f96',
		},
		preparingInstructions: `📈 Format your time series data in CSV:

📋 Required columns:
• 'timestamp' or 'date' - time column (ISO 8601 format)
• Value columns - your time series metrics
• Optional: 'target' for forecasting tasks

💡 Example format:
timestamp,value,category
2024-01-01T00:00:00,100.5,A
2024-01-01T01:00:00,102.3,A
2024-01-01T02:00:00,98.7,A

🕐 Time format examples:
• ISO 8601: 2024-01-01T12:30:00
• Simple: 2024-01-01 12:30:00
• Date only: 2024-01-01

✅ Requirements:
• Consistent time intervals recommended
• Handle missing timestamps appropriately
• Sort data chronologically
• Maximum 1M data points per series`,
	},
}

export { DATASET_TYPES, TASK_TYPES }