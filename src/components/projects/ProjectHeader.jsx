import React from 'react'
import { Row, Col, Space, Typography, Button, Tooltip } from 'antd'
import { ProjectOutlined, PlusOutlined, FunnelIcon } from '@heroicons/react/24/outline'

const { Title, Paragraph } = Typography

const ProjectHeader = ({ onNewProject, onFilterClick, showFilter }) => {
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
                        Projects
                    </Title>
                    <Paragraph className="text-body font-poppins !mb-0" style={{ color: 'var(--secondary-text)', margin: 0 }}>
                        Create and manage your AI projects. Choose from
                        various types of machine learning models to
                        solve your specific problems.
                    </Paragraph>
                </Space>
            </Col>
            <Col>
                <Space size={12} align="center">
                    {/* Filter Button */}
                    <Tooltip title="Filter projects">
                        <button
                            onClick={onFilterClick}
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group"
                            style={{
                                background: showFilter ? 'var(--active-bg)' : 'var(--hover-bg)',
                                border: `1px solid ${showFilter ? 'var(--border-hover)' : 'var(--border)'}`
                            }}
                        >
                            <FunnelIcon 
                                className="h-6 w-6 transition-all duration-200 group-hover:scale-110"
                                style={{ 
                                    color: showFilter ? 'var(--accent-text)' : 'var(--text)'
                                }}
                            />
                        </button>
                    </Tooltip>
                    
                    {/* New Project Button */}
                    <Tooltip title="Create a new project with AI assistance or manual setup">
                        <button
                            onClick={onNewProject}
                            className="px-6 py-3 rounded-xl font-poppins font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                background: 'var(--button-gradient-dark)',
                                border: '1px solid var(--border)',
                                color: '#ffffff'
                            }}
                        >
                            New Project
                        </button>
                    </Tooltip>
                </Space>
            </Col>
        </Row>
    )
}

export default ProjectHeader
