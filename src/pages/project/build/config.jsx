import ImageUploadPreview from '../../../components/UploadPreview/ImageUploadPreview'
import TextUploadPreview from '../../../components/UploadPreview/TextUploadPreview'
import TabularUploadPreview from '../../../components/UploadPreview/TabularUploadPreview'
import ImageTrainPreview from '../../../components/TrainPreview/ImageTrainPreview'
import TextTrainPreview from '../../../components/TrainPreview/TextTrainPreview'
import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict from '../../../components/Predict/TextPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'
import { UploadTypes } from 'src/constants/file'

const config = {
	IMAGE_CLASSIFICATION: {
		gridClasses: 'grid-cols-6 gap-3',
		folder: UploadTypes.FOLDER,
		uploadPreview: ImageUploadPreview,
		trainPreview: ImageTrainPreview,
		predictView: ImagePredict,
		labelingView: LabelingImageClassification,
	},
	TEXT_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		folder: UploadTypes.CSV_SINGLE,
		uploadPreview: TextUploadPreview,
		trainPreview: TextTrainPreview,
		predictView: TextPredict,
		labelingView: LabelingTextClassification,
	},
	TABULAR_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		folder: UploadTypes.CSV_SINGLE,
		uploadPreview: TabularUploadPreview,
		trainPreview: TextTrainPreview,
		predictView: TextPredict,
		labelingView: LabelingTextClassification,
	},

	// Add more types here as needed
}

export default config
