import React from 'react'
import { Row, Col, Empty, Space, Typography, Button, Pagination } from 'antd'
import DatasetCard from './DatasetCard'

const { Text } = Typography

const DatasetGrid = ({ 
    datasets, 
    getDatasets, 
    onCreateDataset, 
    onDelete, 
    deletingIds, 
    currentPage, 
    totalItems, 
    pageSize, 
    onPageChange,
    isLoading 
}) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <Text className="text-white font-poppins">Loading datasets...</Text>
                </div>
            </div>
        )
    }

    if (datasets.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{ 
                    filter: 'invert(1)',
                    opacity: 1,
                    color: 'white'
                }}
                description={
                    <Space direction="vertical" align="center">
                        <Text strong className="text-white font-poppins text-h2" style={{ color: 'white' }}>No Datasets Yet</Text>
                        <Text className="text-white font-poppins text-body" style={{ color: 'white' }}>
                            Start by creating your first dataset
                        </Text>
                        <Button
                            type="primary"
                            onClick={onCreateDataset}
                            className="font-poppins bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                        >
                            Create Dataset
                        </Button>
                    </Space>
                }
            />
        )
    }

    return (
        <>
            <Row gutter={[16, 16]} className="mb-8">
                {datasets.map((dataset) => (
                    <Col xs={24} sm={12} xl={8} key={dataset.id}>
                        <DatasetCard
                            dataset={dataset}
                            onDelete={onDelete}
                            isDeleting={deletingIds.has(dataset.id)}
                        />
                    </Col>
                ))}
            </Row>
            
            {totalItems > pageSize && (
                <div className="flex justify-center">
                    <Pagination
                        current={currentPage}
                        total={totalItems}
                        pageSize={pageSize}
                        onChange={onPageChange}
                        showSizeChanger={false}
                        className="custom-pagination"
                    />
                </div>
            )}
        </>
    )
}

export default DatasetGrid
