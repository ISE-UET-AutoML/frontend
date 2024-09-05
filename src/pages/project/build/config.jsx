import ImageUploadPreview from './uploadData/ImageUploadPreview'
import TextUploadPreview from './uploadData/TextUploadPreview'
import ImageTrainPreview from './labelData/preview/ImageTrainPreview'
import TextTrainPreview from './labelData/preview/TextTrainPreview'
import ImagePredict from './predictData/ImagePredict'
import TextPredict from './predictData/TextPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'

const config = {
	IMAGE_CLASSIFICATION: {
		gridClasses: 'grid-cols-6 gap-3',
		uploadPreview: ImageUploadPreview,
		trainPreview: ImageTrainPreview,
		predictView: ImagePredict,
		labelingView: LabelingImageClassification
	},
	TEXT_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		uploadPreview: TextUploadPreview,
		trainPreview: TextTrainPreview,
		predictView: TextPredict,
		labelingView: LabelingTextClassification
	},

	// Add more types here as needed
}

export default config
