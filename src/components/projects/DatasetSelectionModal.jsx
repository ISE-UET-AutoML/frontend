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
                .theme-dataset-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 16px !important;
                }
                
                .theme-dataset-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                }
                
                .theme-dataset-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-dataset-modal .ant-modal-close {
                    color: var(--modal-close-color) !important;
                }
                
                .theme-dataset-modal .ant-modal-close:hover {
                    color: var(--modal-close-hover) !important;
                }
                
                .theme-dataset-modal .ant-modal-footer {
                    background: var(--modal-header-bg) !important;
                    border-top: 1px solid var(--modal-header-border) !important;
                }
                
                .theme-dataset-modal .ant-alert {
                    background: var(--alert-info-bg) !important;
                    border: 1px solid var(--alert-info-border) !important;
                    color: var(--alert-color) !important;
                }
                
                .theme-dataset-modal .ant-alert-message {
                    color: var(--alert-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .theme-dataset-modal .ant-alert-description {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-dataset-modal .ant-table {
                    background: transparent !important;
                }
                
                .theme-dataset-modal .ant-table-thead > tr > th {
                    background: var(--table-header-bg) !important;
                    border-bottom: 1px solid var(--table-header-border) !important;
                    color: var(--table-header-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-dataset-modal .ant-table-tbody > tr > td {
                    background: var(--table-cell-bg) !important;
                    border-bottom: 1px solid var(--table-cell-border) !important;
                    color: var(--table-cell-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-dataset-modal .ant-table-tbody > tr:hover > td {
                    background: var(--table-row-hover) !important;
                }
                
                .theme-dataset-modal .ant-table-tbody > tr.ant-table-row-selected > td {
                    background: var(--table-row-selected) !important;
                }
                
                .theme-dataset-modal .ant-radio-wrapper {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-dataset-modal .ant-radio-inner {
                    background: var(--radio-bg) !important;
                    border-color: var(--radio-border) !important;
                }
                
                .theme-dataset-modal .ant-radio-checked .ant-radio-inner {
                    background: var(--radio-checked-bg) !important;
                    border-color: var(--radio-checked-border) !important;
                }
                
                .theme-dataset-modal .ant-btn-primary {
                    background: var(--button-primary-bg) !important;
                    border: 1px solid var(--button-primary-border) !important;
                    color: var(--button-primary-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                }
                
                .theme-dataset-modal .ant-btn-primary:hover {
                    background: var(--button-primary-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    transform: translateY(-1px) !important;
                }
                
                .theme-dataset-modal .ant-btn-default {
                    background: var(--button-default-bg) !important;
                    border: 1px solid var(--button-default-border) !important;
                    color: var(--button-default-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-dataset-modal .ant-btn-default:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--border-hover) !important;
                    color: var(--text) !important;
                }
                
                .theme-dataset-modal .ant-btn-primary:disabled {
                    background: var(--input-disabled-bg) !important;
                    border-color: var(--border) !important;
                    color: var(--input-disabled-color) !important;
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
                className="theme-dataset-modal"
                styles={{
                    content: {
                        background: 'var(--modal-bg)',
                        border: '1px solid var(--modal-border)',
                        borderRadius: '16px',
                    },
                    header: {
                        background: 'var(--modal-header-bg)',
                        borderBottom: '1px solid var(--modal-header-border)',
                    },
                    title: {
                        color: 'var(--modal-title-color)',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                    },
                    close: {
                        color: 'var(--modal-close-color)',
                    },
                    footer: {
                        background: 'var(--modal-header-bg)',
                        borderTop: '1px solid var(--modal-header-border)',
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
