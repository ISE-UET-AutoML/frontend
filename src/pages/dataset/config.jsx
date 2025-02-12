import ImageClassDataView from 'src/components/Dataset/View/ImageClassDataView'
import TextClassDataView from 'src/components/Dataset/View/TextClassDataView'
import TabularClassDataView from 'src/components/Dataset/View/TabularClassDataView'

const config = {
	IMAGE_CLASSIFICATION: {
		datasetView: ImageClassDataView,
	},
	TEXT_CLASSIFICATION: {
		datasetView: TextClassDataView,
	},
	TABULAR_CLASSIFICATION: {
		datasetView: TabularClassDataView,
	},
}

export default config
