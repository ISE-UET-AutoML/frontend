import ImageUploadPreview from './uploadData/ImageUploadPreview'
import TextUploadPreview from './uploadData/TextUploadPreview'
import ImageTrainPreview from './labelData/preview/ImageTrainPreview'
import TextTrainPreview from './labelData/preview/TextTrainPreview'
import ImagePredict from './predictData/ImagePredict'
import TextPredict from './predictData/TextPredict'

const config = {
	IMAGE_CLASSIFICATION: {
		gridClasses: 'grid-cols-6 gap-3',
		uploadPreview: ImageUploadPreview,
		trainPreview: ImageTrainPreview,
		predictView: ImagePredict,
	},
	TEXT_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		uploadPreview: TextUploadPreview,
		trainPreview: TextTrainPreview,
		predictView: TextPredict,
	},

	// Add more types here as needed
}

export default config
