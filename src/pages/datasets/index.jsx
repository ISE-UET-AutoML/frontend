import React, { useReducer, useEffect, useRef } from 'react'
import { Button, Card, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import * as datasetAPI from 'src/api/dataset'
import DatasetCard from './card'
import CreateDatasetModal from './CreateDatasetModal'
import { POLL_DATASET_PROCESSING_STATUS_TIME } from 'src/constants/time'

const { Title } = Typography

const initialState = {
	datasets: [],
	isLoading: false,
	showCreator: false,
}

export default function Datasets() {
	const [datasetState, updateDataState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)

	const pollingRef = useRef(null)
	const hasProcessingDatasets = (datasets) => {
		return datasets.some(ds =>
			ds.processingStatus === 'PROCESSING'
		)
	}

	const updateDatasetStatus = async (datasetId) => {
		try {
			const statusData = await datasetAPI.getProcessingStatus(datasetId).then(response => response.data);
			updateDataState(state => ({
				datasets: state.datasets.map(ds =>
					ds.id === datasetId
						? { ...ds, processingStatus: statusData.processingStatus }
						: ds
				)
			}))
			return statusData.processingStatus
		} catch (error) {
			console.error(`Error updating status for dataset ${datasetId}:`, error)
			return null
		}
	}

	// Bắt đầu polling cho các dataset đang xử lý
	const startPolling = () => {
		if (pollingRef.current) clearInterval(pollingRef.current)

		pollingRef.current = setInterval(async () => {
			const processingDatasets = datasetState.datasets.filter(
				ds => ds.processingStatus === 'PROCESSING'
			)

			// Nếu không còn dataset nào đang xử lý thì dừng polling
			if (processingDatasets.length === 0) {
				clearInterval(pollingRef.current)
				return
			}

			// Cập nhật trạng thái cho từng dataset đang xử lý
			for (const dataset of processingDatasets) {
				const newStatus = await updateDatasetStatus(dataset.id)

				// Nếu trạng thái đã hoàn thành, không cần kiểm tra nữa
				if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
					// Có thể trigger các hành động khác ở đây nếu cần
				}
			}
		}, POLL_DATASET_PROCESSING_STATUS_TIME) // Poll mỗi 5 giây
	}

	useEffect(() => {
		getDatasets()
	}, [])

	// Bắt đầu polling khi datasets thay đổi và có dataset đang xử lý
	useEffect(() => {
		if (datasetState.datasets.length > 0 &&
			hasProcessingDatasets(datasetState.datasets)) {
			startPolling()
		}

		// Dọn dẹp khi component unmount
		return () => {
			if (pollingRef.current) {
				clearInterval(pollingRef.current)
			}
		}
	}, [datasetState.datasets])

	const getDatasets = async () => {
		try {
			updateDataState({ isLoading: true })
			const response = await datasetAPI.getDatasets()
			updateDataState({
				datasets: response.data,
				isLoading: false
			})
		} catch (error) {
			console.error('Error fetching datasets:', error)
			updateDataState({ isLoading: false })
		}
	}

	const handleCreateDataset = async (payload) => {
		try {
			const response = await datasetAPI.createDataset(payload)
			if (response.status === 201) {
				message.success('Dataset created successfully!');
				updateDataState({ showCreator: false })
				getDatasets() // Refresh list after creation
			}
		} catch (error) {
			console.error('Error creating dataset:', error)
		}
	}

	useEffect(() => {
		getDatasets()
	}, [])

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<Title level={3}>Datasets</Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => updateDataState({ showCreator: true })}
				>
					New Dataset
				</Button>
			</div>

			{datasetState.isLoading ? (
				<Card loading={true} className="text-center" />
			) : datasetState.datasets.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{datasetState.datasets.map((dataset) => (
						<DatasetCard key={dataset.id} dataset={dataset} />
					))}
				</div>
			) : (
				<Card className="text-center">
					<Title level={4}>No Datasets Found</Title>
					<p>Get started by creating a new dataset.</p>
				</Card>
			)}

			<CreateDatasetModal
				visible={datasetState.showCreator}
				onCancel={() => updateDataState({ showCreator: false })}
				onCreate={handleCreateDataset}
			/>
		</div>
	)
}