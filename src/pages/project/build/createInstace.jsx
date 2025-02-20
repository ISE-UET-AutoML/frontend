import React from 'react'
import { Card, Row, Col, Progress, Typography, Space } from 'antd'
import { CloudDownloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const CreateInstanceStep = ({ downloadProgress }) => {
	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Title level={4}>
					<CloudDownloadOutlined /> Downloading Dependencies
				</Title>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Progress
							percent={downloadProgress}
							status="active"
							strokeColor={{
								'0%': '#108ee9',
								'100%': '#87d068',
							}}
						/>
					</Col>
				</Row>
				<Row gutter={[16, 16]}>
					<Col span={12}>
						<Card size="small">
							<Space direction="vertical">
								<Text strong>Current Tasks:</Text>
								<Text type="secondary">
									• Setting up virtual environment
								</Text>
								<Text type="secondary">
									• Installing required packages
								</Text>
								<Text type="secondary">
									• Configuring model dependencies
								</Text>
							</Space>
						</Card>
					</Col>
				</Row>
			</Space>
		</Card>
	)
}

export default CreateInstanceStep
