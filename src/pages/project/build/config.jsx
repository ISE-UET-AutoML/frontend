import ImageUploadPreview from '../../../components/UploadPreview/ImageUploadPreview'
import TextUploadPreview from '../../../components/UploadPreview/TextUploadPreview'
import ImageTrainPreview from '../../../components/TrainPreview/ImageTrainPreview'
import TextTrainPreview from '../../../components/TrainPreview/TextTrainPreview'
import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict from '../../../components/Predict/TextPredict'

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
