import ImageUploadPreview from '../../../components/UploadPreview/ImageUploadPreview'
import TextUploadPreview from '../../../components/UploadPreview/TextUploadPreview'
import TabularUploadPreview from '../../../components/UploadPreview/TabularUploadPreview'
import MultimodalUploadPreview from '../../../components/UploadPreview/MultimodalUploadPreview'
import ImageTrainPreview from '../../../components/TrainPreview/ImageTrainPreview'
import TextTrainPreview from '../../../components/TrainPreview/TextTrainPreview'
import TabularTrainPreview from '../../../components/TrainPreview/TabularTrainPreview'
import MultimodalTrainPreview from '../../../components/TrainPreview/MultimodalTrainPreview'
import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict1 from '../../../components/Predict/TextPredict1'
import TabularPredict from '../../../components/Predict/TabularPredict'
import MultimodalPredict from '../../../components/Predict/MultimodalPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'
import MultimodalTrainingGraph from '../../../components/TrainingGraph/MultimodalTrainingGraph'
import TextTrainingGraph from '../../../components/TrainingGraph/TextTrainingGraph'
import TabularTrainingGraph from '../../../components/TrainingGraph/TabularTrainingGraph'
import { UploadTypes } from 'src/constants/file'

const config = {
	IMAGE_CLASSIFICATION: {
		gridClasses: 'grid-cols-6 gap-3',
		folder: UploadTypes.FOLDER,
		uploadPreview: ImageUploadPreview,
		labelingView: LabelingImageClassification,
		trainPreview: ImageTrainPreview,
		trainingGraph: MultimodalTrainingGraph,
		predictView: ImagePredict,
	},
	TEXT_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		folder: UploadTypes.CSV_SINGLE,
		uploadPreview: TextUploadPreview,
		labelingView: LabelingTextClassification,
		trainPreview: TextTrainPreview,
		trainingGraph: TextTrainingGraph,
		predictView: TextPredict1,
	},
	TABULAR_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		folder: UploadTypes.CSV_SINGLE,
		uploadPreview: TabularUploadPreview,
		labelingView: LabelingTextClassification,
		trainPreview: TabularTrainPreview,
		trainingGraph: TabularTrainingGraph,
		predictView: TabularPredict,
	},
	MULTIMODAL_CLASSIFICATION: {
		gridClasses: 'grid-cols-1',
		folder: UploadTypes.CSV_SINGLE,
		uploadPreview: MultimodalUploadPreview,
		labelingView: LabelingTextClassification,
		trainPreview: MultimodalTrainPreview,
		predictView: MultimodalPredict,
		trainingGraph: MultimodalTrainingGraph,
	},
	// Add more types here as needed
}

export default config
