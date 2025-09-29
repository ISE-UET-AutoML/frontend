import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict from '../../../components/Predict/TextPredict'
import TabularPredict from '../../../components/Predict/TabularPredict'
import MultimodalPredict from '../../../components/Predict/MultimodalPredict'
import MultilabelTabularClassificationPredict from '../../../components/Predict/MultilabelTabularClassificationPredict'
import TabularClassificationPredict from 'src/components/Predict/TabularClassificationPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'
import MultiLabelImgPredict from 'src/components/Predict/MultiLabelImgPredict'
import TextLiveInfer from 'src/components/LiveInfer/TextLiveInfer'
import { UploadTypes } from 'src/constants/file'
import ImageClassification from 'src/components/lite-live-preditct/ImageClassification'

// Empty component fallback
const EmptyLiveInfer = () => <></>

const LiteConfig = {
	IMAGE_CLASSIFICATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.FOLDER,
		labelingView: LabelingImageClassification,
		predictView: ImageClassification,
		liveInferView: EmptyLiveInfer,
	},
	TEXT_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: TextPredict,
		liveInferView: TextLiveInfer,
	},
	MULTILABEL_TEXT_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: TextPredict,
		liveInferView: TextLiveInfer,
	},
	TABULAR_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: TabularClassificationPredict,
		liveInferView: EmptyLiveInfer,
	},
	TABULAR_REGRESSION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: TabularPredict,
		liveInferView: EmptyLiveInfer,
	},
	MULTILABEL_TABULAR_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: MultilabelTabularClassificationPredict,
		liveInferView: EmptyLiveInfer,
	},
	TIME_SERIES_FORECASTING: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.CSV_SINGLE,
		labelingView: LabelingTextClassification,
		predictView: TabularPredict,
		liveInferView: EmptyLiveInfer,
	},
	MULTIMODAL_CLASSIFICATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.CSV_SINGLE,
		labelingView: LabelingTextClassification,
		predictView: MultimodalPredict,
		liveInferView: EmptyLiveInfer,
	},
	MULTILABEL_IMAGE_CLASSIFICATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.CSV_SINGLE,
		labelingView: LabelingTextClassification,
		predictView: MultiLabelImgPredict,
		liveInferView: EmptyLiveInfer,
	},
	SEMANTIC_SEGMENTATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.FOLDER,
		labelingView: LabelingImageClassification,
		predictView: ImagePredict,
		liveInferView: EmptyLiveInfer,
	},
}

export default LiteConfig
