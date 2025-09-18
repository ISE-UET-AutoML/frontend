import React from 'react'
import { Row, Col, Space, Typography, Tooltip } from 'antd'

const { Title, Paragraph } = Typography

const DatasetHeader = ({ onNewDataset }) => {
    return (
        <Row justify="space-between" align="top" className="mb-4">
            <Col>
                <Space direction="vertical" size={1}>
                    <Title
                        level={1}
                        className="text-h1 font-poppins !mb-2 inline-block"
                        style={{
                            color: 'var(--title-color)',
                            background: 'var(--title-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'var(--title-color)',
                            backgroundClip: 'text',
                            margin: 0
                        }}
                    >
                        Datasets
                    </Title>
                    <Paragraph className="text-body font-poppins !mb-0" style={{ color: 'var(--secondary-text)', margin: 0 }}>
                        Upload and manage your datasets. Organize your data
                        for machine learning projects and label your data
                        for training.
                    </Paragraph>
                </Space>
            </Col>
            <Col>
                <Space size={12} align="center">
                    {/* New Dataset Button */}
                    <Tooltip title="Create a new dataset">
                        <button
                            onClick={onNewDataset}
                            className="px-6 py-3 rounded-xl font-poppins font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                background: 'var(--button-gradient-dark)',
                                border: '1px solid var(--border)',
                                color: '#ffffff'
                            }}
                        >
                            New Dataset
                        </button>
                    </Tooltip>
                </Space>
            </Col>
        </Row>
    )
}

export default DatasetHeader
