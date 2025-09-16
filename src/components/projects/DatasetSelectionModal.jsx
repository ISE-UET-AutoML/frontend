import React from 'react'
import { Modal, Button, Alert, Table } from 'antd'

const DatasetSelectionModal = ({
    open,
    onCancel,
    onConfirm,
    datasets,
    selectedDataset,
    onSelectDataset
}) => {
    return (
        <>
            <style>{`
                .dark-dataset-modal .ant-modal-content {
                    background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 16px !important;
                }
                
                .dark-dataset-modal .ant-modal-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-dataset-modal .ant-modal-title {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-dataset-modal .ant-modal-close {
                    color: white !important;
                }
                
                .dark-dataset-modal .ant-modal-close:hover {
                    color: #65FFA0 !important;
                }
                
                .dark-dataset-modal .ant-modal-footer {
                    background: transparent !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-dataset-modal .ant-alert {
                    background: rgba(24, 144, 255, 0.1) !important;
                    border: 1px solid rgba(24, 144, 255, 0.3) !important;
                    color: white !important;
                }
                
                .dark-dataset-modal .ant-alert-message {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .dark-dataset-modal .ant-alert-description {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-dataset-modal .ant-table {
                    background: transparent !important;
                }
                
                .dark-dataset-modal .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-dataset-modal .ant-table-tbody > tr > td {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-dataset-modal .ant-table-tbody > tr:hover > td {
                    background: rgba(255, 255, 255, 0.05) !important;
                }
                
                .dark-dataset-modal .ant-table-tbody > tr.ant-table-row-selected > td {
                    background: rgba(101, 255, 160, 0.1) !important;
                }
                
                .dark-dataset-modal .ant-radio-wrapper {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-dataset-modal .ant-radio-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }
                
                .dark-dataset-modal .ant-radio-checked .ant-radio-inner {
                    background: #65FFA0 !important;
                    border-color: #65FFA0 !important;
                }
                
                .dark-dataset-modal .ant-btn-primary {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .dark-dataset-modal .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #2a2a3e 0%, #26314e 50%, #1f4460 100%) !important;
                    border-color: #65FFA0 !important;
                    transform: translateY(-1px) !important;
                }
                
                .dark-dataset-modal .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-dataset-modal .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                
                .dark-dataset-modal .ant-btn-primary:disabled {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                }
            `}</style>
            <Modal
                open={open}
                onCancel={onCancel}
                title="Select Dataset"
                footer={[
                    <Button key="back" onClick={onCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        disabled={!selectedDataset}
                        onClick={onConfirm}
                    >
                        Use Selected Dataset
                    </Button>,
                ]}
                width={800}
                style={{ zIndex: 1000 }}
                className="dark-dataset-modal"
                styles={{
                    content: {
                        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                    },
                    header: {
                        background: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    title: {
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                    },
                    close: {
                        color: 'white',
                    },
                    footer: {
                        background: 'transparent',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <Alert
                    message="Choose a Dataset"
                    description="Select the dataset you want to use for training your AI model. The dataset should match your chosen project type for best results."
                    type="info"
                    showIcon
                    className="mb-4"
                />

                <Table
                    dataSource={datasets}
                    rowKey={(record) => record.id}
                    columns={[
                        {
                            title: 'Title',
                            dataIndex: 'title',
                            key: 'title',
                        },
                        {
                            title: 'Service',
                            dataIndex: 'service',
                            key: 'service',
                        },
                        {
                            title: 'Bucket',
                            dataIndex: 'bucketName',
                            key: 'bucket',
                        },
                    ]}
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedDataset ? [selectedDataset] : [],
                        onChange: (selectedRowKey) => {
                            onSelectDataset(selectedRowKey[0])
                        },
                    }}
                    pagination={false}
                    scroll={{ y: 400 }}
                    className="dataset-table"
                />
            </Modal>
        </>
    )
}

export default DatasetSelectionModal
