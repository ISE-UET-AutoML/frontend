import React, { useState } from 'react'
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

const { Content } = Layout

export default function Datasets() {
    // State for filter visibility and filter values
    const [selectedType, setSelectedType] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState(null)

    // Custom hook
    const {
        datasetState,
        updateDataState,
        deletingIds,
        currentPage,
        totalItems,
        showFilter,
        pageSize,
        getDatasets,
        handleCreateDataset,
        handleDelete,
        handlePageChange,
        toggleFilter,
    } = useDatasets()

    // Filter datasets based on selected filters
    const filteredDatasets = (datasetState.datasets || []).filter(dataset => {
        const typeMatch = !selectedType || dataset.dataType === selectedType
        const statusMatch = !selectedStatus || dataset.processingStatus === selectedStatus
        return typeMatch && statusMatch
    })

    const handleResetFilters = () => {
        setSelectedType(null)
        setSelectedStatus(null)
    }

    return (
        <>
            <style>{`
                body, html {
                    background-color: #01000A !important;
                }
            `}</style>
            <div className="min-h-screen bg-[#01000A]">
                <Layout className="min-h-screen bg-[#01000A] pt-12">
                    <Content className="relative pt-20 px-6 pb-20">
                        <BackgroundShapes />
                        <ContentContainer className="relative z-10">
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
                        />

                            <DatasetGrid
                                datasets={filteredDatasets}
                                isLoading={datasetState.isLoading}
                                deletingIds={deletingIds}
                                onDelete={handleDelete}
                                currentPage={currentPage}
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
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