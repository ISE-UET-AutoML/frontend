import React, { useReducer, useEffect, useRef, useState } from 'react' // Added useState
import { Button, Card, Typography, message, Pagination } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import * as datasetAPI from 'src/api/dataset'
import DatasetCard from './card'
import CreateDatasetModal from './CreateDatasetModal'
import { POLL_DATASET_PROCESSING_STATUS_TIME } from 'src/constants/time'
import { usePollingStore } from 'src/store/pollingStore'

const { Title } = Typography
const pageSize = 9
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
	const [deletingIds, setDeletingIds] = useState(new Set()) // Added to track deleting datasets

	const [currentPage, setCurrentPage] = useState(1) // Added for pagination
	const [totalItems, setTotalItems] = useState(0) 

	const pollingRef = useRef(null)
	const hasProcessingDatasets = (datasets) => {
		return datasets.some(ds => ds.processingStatus === 'PROCESSING')
	}

	const updateDatasetStatus = async (datasetId) => {
		try {
			const statusData = await datasetAPI.getProcessingStatus(datasetId).then(response => response.data)
			updateDataState({
				datasets: datasetState.datasets.map(ds =>
					ds.id === datasetId
						? { ...ds, processingStatus: statusData.processingStatus }
						: ds
				)
			})
			return statusData.processingStatus
		} catch (error) {
			console.error(`Error updating status for dataset ${datasetId}:`, error)
			return null
		}
	}

	const startPolling = () => {
		if (pollingRef.current) clearInterval(pollingRef.current)

		pollingRef.current = setInterval(async () => {
			const processingDatasets = datasetState.datasets.filter(
				ds => ds.processingStatus === 'PROCESSING'
			)

			if (processingDatasets.length === 0) {
				clearInterval(pollingRef.current)
				return
			}

			for (const dataset of processingDatasets) {
				const newStatus = await updateDatasetStatus(dataset.id)
				if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
					// Additional actions if needed
				}
			}
		}, POLL_DATASET_PROCESSING_STATUS_TIME)
	}

	useEffect(() => {
		getDatasets(currentPage)
	}, [currentPage])

	useEffect(() => {
		if (datasetState.datasets.length > 0 && hasProcessingDatasets(datasetState.datasets)) {
			startPolling()
		}

		return () => {
			if (pollingRef.current) {
				clearInterval(pollingRef.current)
			}
		}
	}, [datasetState.datasets])

	const getDatasets = async (page = 1) => {
		try {
			updateDataState({ isLoading: true })
			const response = await datasetAPI.getDatasets({page: page, limit: pageSize})
			console.log('resDa', response)
			updateDataState({
				datasets: response.data.data,
				isLoading: false
			})
			setTotalItems(response.data.total) 
			setCurrentPage(page) 
		} catch (error) {
			console.error('Error fetching datasets:', error)
			updateDataState({ isLoading: false })
		}
	}

	const handleCreateDataset = async (createdDataset, labelProjectValues) => {
		try {
			message.success('Dataset created successfully!')
			updateDataState({ showCreator: false })
			// Thêm vào Zustand store để polling ngầm
			usePollingStore.getState().addPending({ dataset: createdDataset, labelProjectValues });
			await getDatasets()
		} catch (error) {
			console.error('Error handling created dataset:', error)
		}
	}

	const handleDelete = async (datasetId) => {
		setDeletingIds(prev => new Set(prev).add(datasetId)) // Add to deleting set
		try {
			await datasetAPI.deleteDataset(datasetId)
			message.success('Dataset deleted successfully!') // Added user feedback
			await getDatasets() // Refresh list after deletion
		} catch (err) {
			console.error('Failed to delete dataset:', err)
			message.error('Failed to delete dataset') // Added error feedback
		} finally {
			setDeletingIds(prev => {
				const newSet = new Set(prev)
				newSet.delete(datasetId)
				return newSet
			}) // Remove from deleting set
		}
	}

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
			<>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{datasetState.datasets.map((dataset) => (
						<DatasetCard
							key={dataset.id}
							dataset={dataset}
							onDelete={() => handleDelete(dataset.id)}
							isDeleting={deletingIds.has(dataset.id)}
						/>
					))}
				</div>
				<div className="flex justify-center mt-8">
                        <Pagination
                            current={currentPage}
                            total={totalItems}
                            pageSize={pageSize}
                            onChange={(page) => {
								console.log('Pagination clicked. New page:', page);
								setCurrentPage(page);
							}}
                            showSizeChanger={false}
                        />
                </div>
			</>	
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