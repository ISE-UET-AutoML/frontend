import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict from '../../../components/Predict/TextPredict'
import TabularPredict from '../../../components/Predict/TabularPredict'
import MultimodalPredict from '../../../components/Predict/MultimodalPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'
import { UploadTypes } from 'src/constants/file'

const config = {
	IMAGE_CLASSIFICATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.FOLDER,
		labelingView: LabelingImageClassification,
		predictView: ImagePredict,
	},
	TEXT_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectTargetCol',
		labelingView: LabelingTextClassification,
		predictView: TextPredict,
	},
	TABULAR_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectTargetCol',
		labelingView: LabelingTextClassification,
		predictView: TabularPredict,
	},
	MULTIMODAL_CLASSIFICATION: {
		afterUploadURL: 'selectTargetColMulti',
		folder: UploadTypes.CSV_SINGLE,
		labelingView: LabelingTextClassification,
		predictView: MultimodalPredict,
	},
	MULTILABEL_IMAGE_CLASSIFICATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.CSV_SINGLE,
		labelingView: LabelingTextClassification,
		predictView: MultimodalPredict,
	},
	// Add more types here as needed
}

export default config
