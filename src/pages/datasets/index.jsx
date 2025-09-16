import React, { useReducer, useEffect, useRef, useState } from 'react' // Added useState
import { Button, Card, Typography, message, Pagination } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import * as datasetAPI from 'src/api/dataset'
import DatasetCard from './card'
import CreateDatasetModal from './CreateDatasetModal'
import { POLL_DATASET_PROCESSING_STATUS_TIME } from 'src/constants/time'
import { usePollingStore } from 'src/store/pollingStore'
import { Input } from 'antd';
import { Select, Space } from 'antd';

const { Option } = Select;

const { Search } = Input;
const { Title } = Typography
const pageSize = 6; 
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

	// New states for sorting, filtering, and search
	const [sortBy, setSortBy] = useState('latest');
	const [filterBy, setFilterBy] = useState('none');
	const [processedData, setProcessedData] = useState([]);

	// Get all datasets for search functionality
	const [allDatasetList, setAllDatasetList] = useState([]) 

	const [deletingIds, setDeletingIds] = useState(new Set()) // Added to track deleting datasets
	const [currentPage, setCurrentPage] = useState(1) // Added for pagination
	const [totalItems, setTotalItems] = useState(0) 

	const pollingRef = useRef(null)
	const hasProcessingDatasets = (datasets) => {
		return datasets.some(ds => ds.processingStatus === 'PROCESSING')
	}
	const [searchTerm, setSearchTerm] = useState('')
	
	
	const allDatasets = async () => {
		try {
			const response = await datasetAPI.getDatasets({page: 1, limit: 10000})
			setAllDatasetList(response.data.data) 
			console.log('All datasets fetched for search:', response.data.data)
		} catch (error) {
			console.error('Error fetching all datasets:', error)
		}
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
  		allDatasets()
	}, [])


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

	const sortDatasetsByTime = (datasets) => {
		return datasets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}
	const getDatasets = async (page = 1) => {
		try {
			updateDataState({ isLoading: true })
			const response = await datasetAPI.getDatasets({page: page, limit: pageSize})
			console.log('resDa', response)
			updateDataState({
				datasets: sortDatasetsByTime(response.data.data),
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
			// Thêm vào Zustand store để polling 
			usePollingStore.getState().addPending({ dataset: createdDataset, labelProjectValues });
			await getDatasets()
			await allDatasets() 
			setSortBy('latest')
    		setFilterBy('none')
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
			await allDatasets() // Refresh all datasets for search functionality
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

	useEffect(() => {
		let data = [...allDatasetList];

		if (searchTerm) {
			data = data.filter(dataset =>
				(dataset.title ?? '').toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// filter
		if (filterBy !== 'none') {
			data = data.filter(dataset=>dataset.dataType === filterBy)
		}

		// sort
		if (sortBy === 'name') {
			data.sort((a, b) => a.title.localeCompare(b.title));
		} else if (sortBy === 'latest') {
			data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		} else if (sortBy === 'oldest') {
			data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
		}
		setProcessedData(data)
		setCurrentPage(1) 
	}, [allDatasetList, searchTerm, sortBy, filterBy])

	const startIndex = (currentPage - 1) * pageSize
  	const paginatedData = processedData.slice(startIndex, startIndex + pageSize)



return (
	<div className="p-6">
		<div className="h-16"></div>
		<div className="flex items-center gap-4 mb-6">
			{/* New Dataset Button */}
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => updateDataState({ showCreator: true })}
			>
				New Dataset
			</Button>
			<div className="flex-1" /> {/* Spacer */}

			{/* Search */}
			<div className="flex-1 max-w-md">
				<Search
					placeholder="Search datasets"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					size="large"
					allowClear
				/>
			</div>
			

			{/* Sort */}
			<div className="flex items-center gap-2">
				<span className="font-medium">Sort by:</span>
				<Select
					value={sortBy}
					onChange={(value) => setSortBy(value)}
					style={{ width: 90, height: 40 }}
				>
					<Option value="name">Name</Option>
					<Option value="latest">Latest</Option>
					<Option value="oldest">Oldest</Option>
				</Select>
			</div>

			{/* Filter */}
			<div className="flex items-center gap-2">
				<span className="font-medium">Type:</span>
				<Select
					value={filterBy}
					onChange={(value) => setFilterBy(value)}
					style={{ width: 120, height: 40 }}
				>
					<Option value="none">None</Option>
					<Option value="TEXT">Text</Option>
					<Option value="IMAGE">Image</Option>
					<Option value="TABULAR">Tabular</Option>
					<Option value="MULTIMODAL">Multimodal</Option>
				</Select>
			</div>
		</div>

		{/* Space between controls and content */}
		<div className="h-12"></div>

		{/* Content container */}
		<div className="min-h-[600px] relative">
			{datasetState.isLoading ? (
				<Card loading={true} className="text-center" />
			) : processedData.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{paginatedData.map((dataset) => (
						<DatasetCard
							key={dataset.id}
							dataset={dataset}
							onDelete={() => handleDelete(dataset.id)}
							isDeleting={deletingIds.has(dataset.id)}
						/>
					))}
				</div>
			) : (
				<div className="absolute inset-0 flex items-center justify-center">
					<Card className="text-center">
						<Title level={4}>No Datasets Found</Title>
						<p>Get started by creating a new dataset.</p>
					</Card>
				</div>
			)}
		</div>
		
		{/* pagination*/}
		<div className="flex justify-center mt-8">
			<Pagination
				current={currentPage}
				total={processedData.length}
				pageSize={pageSize}
				onChange={(page) => {
					setCurrentPage(page);
				}}
				showSizeChanger={false}
			/>
		</div>

		<CreateDatasetModal
			visible={datasetState.showCreator}
			onCancel={() => updateDataState({ showCreator: false })}
			onCreate={handleCreateDataset}
		/>
	</div>
)}