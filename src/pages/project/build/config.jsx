import ImageUploadPreview from '../../../components/UploadPreview/ImageUploadPreview'
import TextUploadPreview from '../../../components/UploadPreview/TextUploadPreview'
import TabularUploadPreview from '../../../components/UploadPreview/TabularUploadPreview'
import MultimodalUploadPreview from '../../../components/UploadPreview/MultimodalUploadPreview'
import ImageTrainPreview from '../../../components/TrainPreview/ImageTrainPreview'
import TextTrainPreview from '../../../components/TrainPreview/TextTrainPreview'
import TabularTrainPreview from '../../../components/TrainPreview/TabularTrainPreview'
import MultimodalTrainPreview from '../../../components/TrainPreview/MultimodalTrainPreview'
import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict from '../../../components/Predict/TextPredict'
import TabularPredict from '../../../components/Predict/TabularPredict'
import MultimodalPredict from '../../../components/Predict/MultimodalPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'
import ImageTrainingGraph from '../../../components/TrainingGraph/ImageTrainingGraph'
import MultimodalTrainingGraph from '../../../components/TrainingGraph/MultimodalTrainingGraph'
import { UploadTypes } from 'src/constants/file'

const config = {
	IMAGE_CLASSIFICATION: {
		gridClasses: 'grid-cols-6 gap-3',
		folder: UploadTypes.FOLDER,
		uploadPreview: ImageUploadPreview,
		trainPreview: ImageTrainPreview,
		predictView: ImagePredict,
		trainingGraph: ImageTrainingGraph,
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
		trainPreview: TabularTrainPreview,
		predictView: TabularPredict,
		labelingView: LabelingTextClassification,
	},
	MULTIMODAL_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		folder: UploadTypes.CSV_SINGLE,
		uploadPreview: MultimodalUploadPreview,
		trainPreview: MultimodalTrainPreview,
		predictView: MultimodalPredict,
		trainingGraph: MultimodalTrainingGraph,
		labelingView: LabelingTextClassification,
	},
	// Add more types here as needed
}

export default config
