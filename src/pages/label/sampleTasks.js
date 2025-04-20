// Dữ liệu mẫu cho phân loại hình ảnh
const imageClassificationTask = {
	id: 1,
	task_type: 'image_classification',
	data: {
		image: 'https://example.com/sample-image.jpg',
	},
	annotations: [],
	predictions: [],
}

// Dữ liệu mẫu cho phát hiện đối tượng
const objectDetectionTask = {
	id: 2,
	task_type: 'object_detection',
	data: {
		image: 'https://example.com/street-scene.jpg',
	},
	annotations: [],
	predictions: [],
}

// Dữ liệu mẫu cho phân loại văn bản
const textClassificationTask = {
	id: 3,
	task_type: 'text_classification',
	data: {
		text: 'Label Studio là một công cụ tuyệt vời cho việc gán nhãn dữ liệu.',
	},
	annotations: [],
	predictions: [],
}

// Dữ liệu mẫu cho nhận dạng thực thể có tên (NER)
const namedEntityTask = {
	id: 4,
	task_type: 'named_entity',
	data: {
		text: 'Google và Microsoft đang mở rộng hoạt động kinh doanh tại Việt Nam.',
	},
	annotations: [],
	predictions: [],
}

export {
	imageClassificationTask,
	objectDetectionTask,
	textClassificationTask,
	namedEntityTask,
}
