import ImagePredict from '../../../components/Predict/ImagePredict'
import TextPredict from '../../../components/Predict/TextPredict'
import TabularPredict from '../../../components/Predict/TabularPredict'
import MultimodalPredict from '../../../components/Predict/MultimodalPredict'
import MultilabelTabularClassificationPredict from '../../../components/Predict/MultilabelTabularClassificationPredict'
import LabelingTextClassification from 'src/pages/project/build/labelData/labeling/LabelingTextClassification'
import LabelingImageClassification from 'src/pages/project/build/labelData/labeling/LabelingImageClassification'
import MultiLabelImgPredict from 'src/components/Predict/MultiLabelImgPredict'
import LiteTabularClassificationPredict from 'src/components/lite-live-preditct/LiteTabularClassificationPredict'
import LiteTextClassificationPredict from 'src/components/lite-live-preditct/LiteTextClassificationPredict'
import LiteTabularRegressionPredict from 'src/components/lite-live-preditct/LiteTabularRegressionPredict'
import { UploadTypes } from 'src/constants/file'

// Empty component fallback
const EmptyLiveInfer = () => <></>

const LiteConfig = {
	IMAGE_CLASSIFICATION: {
		afterUploadURL: 'selectInstance',
		folder: UploadTypes.FOLDER,
		labelingView: LabelingImageClassification,
		predictView: ImagePredict,
		liveInferView: EmptyLiveInfer,
	},
	TEXT_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: LiteTextClassificationPredict,
		liveInferView: EmptyLiveInfer,
	},
	MULTILABEL_TEXT_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: TextPredict,
		liveInferView: EmptyLiveInfer,
	},
	TABULAR_CLASSIFICATION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: LiteTabularClassificationPredict,
		liveInferView: EmptyLiveInfer,
	},
	TABULAR_REGRESSION: {
		folder: UploadTypes.CSV_SINGLE,
		afterUploadURL: 'selectInstance',
		labelingView: LabelingTextClassification,
		predictView: LiteTabularRegressionPredict,
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
