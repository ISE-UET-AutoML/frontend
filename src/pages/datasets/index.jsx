import React, { useState, useReducer, useEffect, useRef } from 'react'
import { Layout, message } from 'antd'

// Components
import {
	DatasetHeader,
	DatasetFilter,
	DatasetGrid,
} from 'src/components/datasets'
import CreateDatasetModal from './CreateDatasetModal'
import ContentContainer from 'src/components/ContentContainer'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import Pager from 'src/components/Pager'

// Hooks
import { useDatasets } from 'src/hooks'
import { useTheme } from 'src/theme/ThemeProvider'

// APIs
import * as datasetAPI from 'src/api/dataset'
import { POLL_DATASET_PROCESSING_STATUS_TIME } from 'src/constants/time'
import { usePollingStore } from 'src/store/pollingStore'

const { Content } = Layout
const pageSize = 6

const initialState = {
	datasets: [],
	isLoading: false,
	showCreator: false,
}

export default function Datasets() {
	// filter + sort state
	const [selectedType, setSelectedType] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [sortBy, setSortBy] = useState('latest')

	// reducer state
	const [datasetState, updateDataState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)

	const [deletingIds, setDeletingIds] = useState(new Set())
	const [currentPage, setCurrentPage] = useState(1)
	const [totalItems, setTotalItems] = useState(0)

	// polling
	const pollingRef = useRef(null)

	const hasProcessingDatasets = (datasets) =>
		datasets.some((ds) => ds.processingStatus === 'PROCESSING')

	const updateDatasetStatus = async (datasetId) => {
		try {
			const statusData = await datasetAPI
				.getProcessingStatus(datasetId)
				.then((res) => res.data)

			updateDataState({
				datasets: datasetState.datasets.map((ds) =>
					ds.id === datasetId
						? {
								...ds,
								processingStatus: statusData.processingStatus,
							}
						: ds
				),
			})
			return statusData.processingStatus
		} catch (error) {
			console.error(
				`Error updating status for dataset ${datasetId}:`,
				error
			)
			return null
		}
	}

	const startPolling = () => {
		if (pollingRef.current) clearInterval(pollingRef.current)

		pollingRef.current = setInterval(async () => {
			const processingDatasets = datasetState.datasets.filter(
				(ds) => ds.processingStatus === 'PROCESSING'
			)

			if (processingDatasets.length === 0) {
				clearInterval(pollingRef.current)
				return
			}

			for (const dataset of processingDatasets) {
				const newStatus = await updateDatasetStatus(dataset.id)
				if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
					// thêm hành động nếu cần
				}
			}
		}, POLL_DATASET_PROCESSING_STATUS_TIME)
	}

	const getDatasets = async (page = 1) => {
		try {
			updateDataState({ isLoading: true })

			const response = await datasetAPI.getDatasets({
				page,
				limit: pageSize,
				search: searchTerm || undefined,
				data_type: selectedType || undefined,
				sort_by: sortBy,
			})

			updateDataState({
				datasets: response.data.data,
				isLoading: false,
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
			usePollingStore
				.getState()
				.addPending({ dataset: createdDataset, labelProjectValues })
			await getDatasets(1)
		} catch (error) {
			console.error('Error handling created dataset:', error)
		}
	}

	const handleDelete = async (datasetId) => {
		setDeletingIds((prev) => new Set(prev).add(datasetId))
		try {
			await datasetAPI.deleteDataset(datasetId)
			message.success('Dataset deleted successfully!')
			await getDatasets(currentPage)
		} catch (err) {
			console.error('Failed to delete dataset:', err)
			message.error('Failed to delete dataset')
		} finally {
			setDeletingIds((prev) => {
				const newSet = new Set(prev)
				newSet.delete(datasetId)
				return newSet
			})
		}
	}

	// Effects
	useEffect(() => {
		getDatasets(currentPage)
	}, [currentPage, selectedType, searchTerm, sortBy])

	useEffect(() => {
		if (
			datasetState.datasets.length > 0 &&
			hasProcessingDatasets(datasetState.datasets)
		) {
			startPolling()
		}
		return () => {
			if (pollingRef.current) clearInterval(pollingRef.current)
		}
	}, [datasetState.datasets])

	const handleResetFilters = () => {
		setSelectedType(null)
		setSearchTerm('')
		setSortBy('latest')
		setCurrentPage(1)
	}

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const { theme } = useTheme()

	return (
		<div
			className="min-h-screen"
			style={{
				background: 'var(--surface)',
				color: 'var(--text)',
				fontFamily: 'Poppins, sans-serif',
			}}
		>
			<Layout
				className="min-h-screen pt-12"
				style={{ background: 'var(--surface)' }}
			>
				<Content className="relative pt-20 px-6 pb-20">
					{theme === 'dark' && (
						<BackgroundShapes
							width="1280px"
							height="1100px"
							shapes={[
								{
									id: 'datasetsBlue',
									shape: 'circle',
									size: '520px',
									gradient: {
										type: 'radial',
										shape: 'ellipse',
										colors: [
											'#5C8DFF 0%',
											'#5C8DFF 35%',
											'transparent 75%',
										],
									},
									opacity: 0.45,
									blur: '220px',
									position: { top: '240px', right: '-140px' },
									transform: 'none',
								},
								{
									id: 'datasetsCyan',
									shape: 'rounded',
									size: '420px',
									gradient: {
										type: 'radial',
										shape: 'circle',
										colors: [
											'#40FFFF 0%',
											'#40FFFF 55%',
											'transparent 40%',
										],
									},
									opacity: 0.3,
									blur: '180px',
									position: { top: '60px', left: '-120px' },
									transform: 'none',
								},
								{
									id: 'datasetsWarm',
									shape: 'rounded',
									size: '520px',
									gradient: {
										type: 'radial',
										shape: 'circle',
										colors: [
											'#FFAF40 0%',
											'#FFAF40 50%',
											'transparent 85%',
										],
									},
									opacity: 0.25,
									blur: '220px',
									position: { top: '820px', left: '50%' },
									transform: 'translate(-50%, -50%)',
								},
							]}
						/>
					)}

					<ContentContainer className="relative z-10">
						{/* Header */}
						<DatasetHeader
							onNewDataset={() =>
								updateDataState({ showCreator: true })
							}
						/>

						{/* Filter */}
						<DatasetFilter
							selectedType={selectedType}
							onTypeChange={setSelectedType}
							onReset={handleResetFilters}
							searchTerm={searchTerm}
							onSearchChange={setSearchTerm}
							sortBy={sortBy}
							onSortChange={setSortBy}
						/>

						{/* Grid */}
						<DatasetGrid
							datasets={datasetState.datasets}
							isLoading={datasetState.isLoading}
							deletingIds={deletingIds}
							onDelete={handleDelete}
							onCreateDataset={() =>
								updateDataState({ showCreator: true })
							}
							getDatasets={getDatasets}
						/>

						{/* Pager */}
						<div className="mt-8">
							<Pager
								currentPage={currentPage}
								totalItems={totalItems}
								pageSize={pageSize}
								onPageChange={handlePageChange}
							/>
						</div>
					</ContentContainer>
				</Content>
			</Layout>

			<CreateDatasetModal
				visible={datasetState.showCreator}
				onCancel={() => updateDataState({ showCreator: false })}
				onCreate={handleCreateDataset}
			/>
		</div>
	)
}