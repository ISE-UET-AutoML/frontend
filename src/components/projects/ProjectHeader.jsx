import React from 'react'
import { Row, Col, Space, Typography, Button, Tooltip } from 'antd'

const { Title, Paragraph } = Typography

const ProjectHeader = ({ onNewProject }) => {
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
							margin: 0,
						}}
					>
						Projects
					</Title>
					<Paragraph
						className="text-body font-poppins !mb-0"
						style={{ color: 'var(--secondary-text)', margin: 0 }}
					>
						Create and manage your AI projects. Choose from various
						types of machine learning models to solve your specific
						problems.
					</Paragraph>
				</Space>
			</Col>
			<Col>
				<Space size={12} align="center">
					{/* New Project Button */}
					<Tooltip title="Create a new project with AI assistance or manual setup">
						<button
							onClick={onNewProject}
							className="px-8 py-3 rounded-xl font-poppins font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg bg-sky-500"
							style={{
								border: '1px solid var(--border)',
								color: '#ffffff',
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
