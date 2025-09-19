import React from 'react'
import { Row, Col, Empty, Space, Typography, Button } from 'antd'
import ProjectCard from 'src/pages/projects/card'

const { Text } = Typography

const ProjectsGrid = ({ projects, getProjects, onCreateProject }) => {
    if (projects.length === 0) {
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
                        <Text strong className="font-poppins text-h2" style={{ color: 'var(--text)' }}>No Projects Yet</Text>
                        <Text className="font-poppins text-body" style={{ color: 'var(--secondary-text)' }}>
                            Start by creating your first AI project
                        </Text>
                        <Button
                            type="primary"
                            onClick={onCreateProject}
                            className="font-poppins"
                            style={{
                                background: 'var(--button-gradient)',
                                border: '1px solid var(--border)',
                                color: '#ffffff'
                            }}
                        >
                            Create Project
                        </Button>
                    </Space>
                }
            />
        )
    }

    return (
        <Row gutter={[16, 16]} className="">
            {projects.map((project) => (
                <Col xs={24} sm={12} xl={8} key={project.id}>
                    <ProjectCard
                        project={project}
                        getProjects={getProjects}
                    />
                </Col>
            ))}
        </Row>
    )
}

export default ProjectsGrid
