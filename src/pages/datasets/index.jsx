import React, { useState, useReducer, useEffect, useRef } from 'react'
import { Layout } from 'antd'

// Components
import {
    DatasetHeader,
    DatasetFilter,
    DatasetGrid,
} from 'src/components/datasets'
import CreateDatasetModal from './CreateDatasetModal'
import ContentContainer from 'src/components/ContentContainer'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'

// Hooks
import { useDatasets } from 'src/hooks'

// APIs and utilities (preserving teammate's additions)
import * as datasetAPI from 'src/api/dataset'
import { POLL_DATASET_PROCESSING_STATUS_TIME } from 'src/constants/time'
import { usePollingStore } from 'src/store/pollingStore'
import { message, Pagination, Card, Typography } from 'antd'

const { Content } = Layout
const { Title } = Typography
const pageSize = 6

// Initial state for reducer (preserving teammate's structure)
const initialState = {
    datasets: [],
    isLoading: false,
    showCreator: false,
}

export default function Datasets() {
    // State for filter visibility and filter values
    const [selectedType, setSelectedType] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [showFilter, setShowFilter] = useState(false)

    // Teammate's reducer pattern
    const [datasetState, updateDataState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        initialState
    )

    // Teammate's sorting, filtering, and search states
    const [sortBy, setSortBy] = useState('latest')
    const [filterBy, setFilterBy] = useState('none')
    const [processedData, setProcessedData] = useState([])
    const [allDatasetList, setAllDatasetList] = useState([])
    const [deletingIds, setDeletingIds] = useState(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')

    // Polling functionality (teammate's addition)
    const pollingRef = useRef(null)
    
    const hasProcessingDatasets = (datasets) => {
        return datasets.some(ds => ds.processingStatus === 'PROCESSING')
    }

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

    const sortDatasetsByTime = (datasets) => {
        return datasets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
            usePollingStore.getState().addPending({ dataset: createdDataset, labelProjectValues })
            await getDatasets()
            await allDatasets()
            setSortBy('latest')
            setFilterBy('none')
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
            await allDatasets()
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

    // Effects
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

    // Teammate's sorting and filtering logic
    useEffect(() => {
        let data = [...allDatasetList]

        if (searchTerm) {
            data = data.filter(dataset =>
                (dataset.title ?? '').toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // filter
        if (filterBy !== 'none') {
            data = data.filter(dataset => dataset.dataType === filterBy)
        }

        // sort
        if (sortBy === 'name') {
            data.sort((a, b) => a.title.localeCompare(b.title))
        } else if (sortBy === 'latest') {
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else if (sortBy === 'oldest') {
            data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        }
        setProcessedData(data)
        setCurrentPage(1)
    }, [allDatasetList, searchTerm, sortBy, filterBy])

    // Filter datasets based on selected filters
    const filteredDatasets = processedData

    const handleResetFilters = () => {
        setSelectedType(null)
        setSelectedStatus(null)
        setFilterBy('none')
        setSortBy('latest')
        setSearchTerm('')
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const toggleFilter = () => {
        setShowFilter(!showFilter)
    }

    // Pagination logic
    const startIndex = (currentPage - 1) * pageSize
    const paginatedData = processedData.slice(startIndex, startIndex + pageSize)

    return (
        <>
            <style>{`
                body, html {
                    background-color: #01000A !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
            <div className="min-h-screen bg-[#01000A]">
                <Layout className="min-h-screen bg-[#01000A] pt-12">
                    <Content className="relative pt-20 px-6 pb-20">
                        <BackgroundShapes 
                            width="1280px" 
                            height="1100px"
                            shapes={[
                                {
                                    id: 'datasetsBlue',
                                    shape: 'circle',
                                    size: '520px',
                                    gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 35%', 'transparent 75%'] },
                                    opacity: 0.45,
                                    blur: '220px',
                                    position: { top: '240px', right: '-140px' },
                                    transform: 'none'
                                },
                                {
                                    id: 'datasetsCyan',
                                    shape: 'rounded',
                                    size: '420px',
                                    gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 55%', 'transparent 40%'] },
                                    opacity: 0.30,
                                    blur: '180px',
                                    position: { top: '60px', left: '-120px' },
                                    transform: 'none'
                                },
                                {
                                    id: 'datasetsWarm',
                                    shape: 'rounded',
                                    size: '520px',
                                    gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 50%', 'transparent 85%'] },
                                    opacity: 0.25,
                                    blur: '220px',
                                    position: { top: '820px', left: '50%' },
                                    transform: 'translate(-50%, -50%)'
                                }
                            ]}
                        />
                        <ContentContainer className="relative z-10">
                            {/* Header Section */}
                            <DatasetHeader 
                                onNewDataset={() => updateDataState({ showCreator: true })}
                                onFilterClick={toggleFilter}
                                showFilter={showFilter}
                            />

                            <DatasetFilter
                                selectedType={selectedType}
                                selectedStatus={selectedStatus}
                                onTypeChange={setSelectedType}
                                onStatusChange={setSelectedStatus}
                                onReset={handleResetFilters}
                                showFilter={showFilter}
                                // Search and sort props
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                                filterBy={filterBy}
                                onFilterChange={setFilterBy}
                            />

                            {/* Use the existing DatasetGrid component */}
                            <DatasetGrid
                                datasets={paginatedData}
                                isLoading={datasetState.isLoading}
                                deletingIds={deletingIds}
                                onDelete={handleDelete}
                                currentPage={currentPage}
                                totalItems={processedData.length}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onCreateDataset={() => updateDataState({ showCreator: true })}
                                getDatasets={getDatasets}
                            />
                        </ContentContainer>
                    </Content>
                </Layout>

                <CreateDatasetModal
                    visible={datasetState.showCreator}
                    onCancel={() => updateDataState({ showCreator: false })}
                    onCreate={handleCreateDataset}
                />
            </div>
        </>
    )
}