import ImageClassDataView from 'src/components/Dataset/View/ImageClassDataView'
import TextClassDataView from 'src/components/Dataset/View/TextClassDataView'
import TabularClassDataView from 'src/components/Dataset/View/TabularClassDataView'
import MultimodalClassDataView from 'src/components/Dataset/View/MultimodalClassDataView'
import MultilabelImgClassDataView from 'src/components/Dataset/View/MultilabelImgClassDataView'

const config = {
	IMAGE_CLASSIFICATION: {
		datasetView: ImageClassDataView,
	},
	TEXT_CLASSIFICATION: {
		datasetView: MultimodalClassDataView,
	},
	TABULAR_CLASSIFICATION: {
		datasetView: TabularClassDataView,
	},
	MULTIMODAL_CLASSIFICATION: {
		datasetView: MultimodalClassDataView,
	},
	MULTILABEL_IMAGE_CLASSIFICATION: {
		datasetView: MultilabelImgClassDataView,
	},
}

export default config
