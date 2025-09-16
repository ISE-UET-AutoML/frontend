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
                        className="text-h1 font-poppins text-white !mb-2 inline-block"
                        style={{ 
                            color: 'transparent', 
                            background: 'linear-gradient(90deg, #5C8DFF 0%, #65FFA0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            margin: 0 
                        }}
                    >
                        Projects
                    </Title>
                    <Paragraph className="text-body font-poppins text-gray-300 !mb-0" style={{ color: '#D1D5DB', margin: 0 }}>
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
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                                showFilter 
                                    ? 'bg-blue-500/20 border border-blue-400/30' 
                                    : 'bg-white/10 hover:bg-white/20'
                            }`}
                        >
                            <FunnelIcon className={`h-6 w-6 transition-all duration-200 ${
                                showFilter 
                                    ? 'text-blue-300 group-hover:scale-110' 
                                    : 'text-white group-hover:scale-110'
                            }`} />
                        </button>
                    </Tooltip>
                    
                    {/* New Project Button */}
                    <Tooltip title="Create a new project with AI assistance or manual setup">
                        <button
                            onClick={onNewProject}
                            className="px-6 py-3 rounded-xl font-poppins font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
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
