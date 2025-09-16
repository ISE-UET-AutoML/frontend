import { useState, useReducer, useEffect, useRef } from 'react'
import { message } from 'antd'
import * as datasetAPI from 'src/api/dataset'
import { POLL_DATASET_PROCESSING_STATUS_TIME } from 'src/constants/time'
import { usePollingStore } from 'src/store/pollingStore'

const pageSize = 9

const initialState = {
    datasets: [],
    isLoading: false,
    showCreator: false,
}

export const useDatasets = () => {
    const [datasetState, updateDataState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        initialState
    )
    const [deletingIds, setDeletingIds] = useState(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [showFilter, setShowFilter] = useState(false)

    const pollingRef = useRef(null)

    const hasProcessingDatasets = (datasets) => {
        return Array.isArray(datasets) && datasets.some(ds => ds.processingStatus === 'PROCESSING')
    }

    const updateDatasetStatus = async (datasetId) => {
        try {
            const statusData = await datasetAPI.getProcessingStatus(datasetId).then(response => response.data)
            updateDataState({
                datasets: (datasetState.datasets || []).map(ds =>
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
            const processingDatasets = (datasetState.datasets || []).filter(
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

    const getDatasets = async (page = 1) => {
        try {
            updateDataState({ isLoading: true })
            const response = await datasetAPI.getDatasets({ page: page, limit: pageSize })
            console.log('resDa', response)
            updateDataState({
                datasets: Array.isArray(response.data.data) ? response.data.data : [],
                isLoading: false
            })
            setTotalItems(response.data.total || 0)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching datasets:', error)
            updateDataState({ 
                datasets: [],
                isLoading: false 
            })
        }
    }

    const handleCreateDataset = async (createdDataset, labelProjectValues) => {
        try {
            message.success('Dataset created successfully!')
            updateDataState({ showCreator: false })
            // Add to Zustand store for polling
            usePollingStore.getState().addPending({ dataset: createdDataset, labelProjectValues })
            await getDatasets()
        } catch (error) {
            console.error('Error handling created dataset:', error)
        }
    }

    const handleDelete = async (datasetId) => {
        setDeletingIds(prev => new Set(prev).add(datasetId))
        try {
            await datasetAPI.deleteDataset(datasetId)
            message.success('Dataset deleted successfully!')
            await getDatasets()
        } catch (err) {
            console.error('Failed to delete dataset:', err)
            message.error('Failed to delete dataset')
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(datasetId)
                return newSet
            })
        }
    }

    const handlePageChange = (page) => {
        console.log('Pagination clicked. New page:', page)
        setCurrentPage(page)
    }

    const toggleFilter = () => {
        setShowFilter(!showFilter)
    }

    // Effects
    useEffect(() => {
        getDatasets(currentPage)
    }, [currentPage])

    useEffect(() => {
        if (Array.isArray(datasetState.datasets) && datasetState.datasets.length > 0 && hasProcessingDatasets(datasetState.datasets)) {
            startPolling()
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [datasetState.datasets])

    return {
        // State
        datasetState,
        updateDataState,
        deletingIds,
        currentPage,
        totalItems,
        showFilter,
        pageSize,

        // Actions
        getDatasets,
        handleCreateDataset,
        handleDelete,
        handlePageChange,
        toggleFilter,
    }
}