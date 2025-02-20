import React, { useEffect, useState } from 'react'
import {
	Button,
	Radio,
	Select,
	Table,
	Typography,
	Card,
	Space,
	Row,
	Col,
	Spin,
	Alert,
	Tooltip,
	Empty,
	Tag,
} from 'antd'
import {
	CloudUploadOutlined,
	ArrowRightOutlined,
	InfoCircleOutlined,
	FilterOutlined,
} from '@ant-design/icons'
import * as datasetAPI from 'src/api/dataset'
import { PATHS } from 'src/constants/paths'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const UploadData = ({ updateFields, projectInfo }) => {
	const [datasets, setDatasets] = useState([])
	const [serviceFilter, setServiceFilter] = useState('')
	const [bucketFilter, setBucketFilter] = useState('')
	const [labeledFilter, setLabeledFilter] = useState('')
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchDatasets = async () => {
			setLoading(true)
			try {
				const response = await datasetAPI.getDatasets()
				setDatasets(Array.isArray(response.data) ? response.data : [])
			} catch (error) {
				console.error('Error fetching datasets:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchDatasets()
	}, [])

	const filteredDatasets = datasets.filter(
		(item) =>
			(!serviceFilter || item.service === serviceFilter) &&
			(!bucketFilter || item.bucketName === bucketFilter) &&
			(!labeledFilter ||
				(labeledFilter === 'yes' ? item.isLabeled : !item.isLabeled)) &&
			item.type === projectInfo?.type
	)

	const selectDataset = () => {
		const selectedDataset = filteredDatasets[selectedRowKeys[0]]
		if (!selectedDataset) return

		const fieldUpdates = {
			selectedDataset,
			isDoneUploadData: true,
		}
		if (!selectedDataset.isLabeled) fieldUpdates.isLabeling = true
		if (
			['TABULAR_CLASSIFICATION', 'TEXT_CLASSIFICATION'].includes(
				projectInfo.type
			)
		) {
			fieldUpdates.isSelectTargetCol = true
		} else if (projectInfo.type === 'MULTIMODAL_CLASSIFICATION') {
			fieldUpdates.isSelectTargetColMulti = true
		}
		updateFields(fieldUpdates)
	}

	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			align: 'left',
			render: (text) => <Text strong>{text}</Text>,
		},
		{
			title: 'Service',
			dataIndex: 'service',
			key: 'service',
			align: 'center',
			render: (service) => (
				<Tag color={service === 'AWS_S3' ? 'orange' : 'blue'}>
					{service === 'AWS_S3' ? 'AWS' : 'Google Cloud'}
				</Tag>
			),
		},
		{
			title: 'Bucket',
			dataIndex: 'bucketName',
			key: 'bucket',
			align: 'center',
		},
		{
			title: 'Labeled',
			dataIndex: 'isLabeled',
			key: 'labeled',
			align: 'center',
			render: (isLabeled) => (
				<Tag color={isLabeled ? 'success' : 'warning'}>
					{isLabeled ? 'Yes' : 'No'}
				</Tag>
			),
		},
	]

	return (
		<div className="p-6">
			<Row justify="center" className="">
				<Col xs={24} md={16}>
					<Title level={1} className="text-center">
						Choose Your Dataset
					</Title>
					<Paragraph className="text-center text-gray-600">
						Select an existing dataset or create a new one for your
						project
					</Paragraph>
				</Col>
			</Row>

			<Row gutter={[24, 24]}>
				<Col xs={24} lg={6}>
					<Card
						title={
							<Space>
								<FilterOutlined />
								<span>Filter Options</span>
							</Space>
						}
						className="shadow-md rounded-lg sticky top-4"
					>
						<Space direction="vertical" className="w-full">
							<div>
								<Title level={5}>
									Cloud Service
									<Tooltip title="Choose the cloud storage service where your dataset is stored">
										<InfoCircleOutlined className="ml-2 text-gray-400" />
									</Tooltip>
								</Title>
								<Select
									className="w-full"
									value={serviceFilter}
									onChange={setServiceFilter}
									placeholder="Select Service"
								>
									<Option value="">All Services</Option>
									<Option value="AWS_S3">Amazon S3</Option>
									<Option value="GCP_STORAGE">
										Google Cloud Storage
									</Option>
								</Select>
							</div>

							<div>
								<Title level={5}>
									Storage Bucket
									<Tooltip title="Select the specific storage bucket containing your dataset">
										<InfoCircleOutlined className="ml-2 text-gray-400" />
									</Tooltip>
								</Title>
								<Select
									className="w-full"
									value={bucketFilter}
									onChange={setBucketFilter}
									placeholder="Select Bucket"
								>
									<Option value="">All Buckets</Option>
									<Option value="user-private-dataset">
										User Private Dataset
									</Option>
									<Option value="bucket-1">Bucket 1</Option>
								</Select>
							</div>

							<div>
								<Title level={5}>
									Dataset Status
									<Tooltip title="Filter datasets based on whether they're already labeled">
										<InfoCircleOutlined className="ml-2 text-gray-400" />
									</Tooltip>
								</Title>
								<Radio.Group
									value={labeledFilter}
									onChange={(e) =>
										setLabeledFilter(e.target.value)
									}
									className="w-full"
								>
									<Space
										direction="vertical"
										className="w-full"
									>
										<Radio value="">All Datasets</Radio>
										<Radio value="yes">
											Labeled Datasets
										</Radio>
										<Radio value="no">
											Unlabeled Datasets
										</Radio>
									</Space>
								</Radio.Group>
							</div>

							{selectedRowKeys.length > 0 && (
								<Button
									type="primary"
									size="large"
									icon={<ArrowRightOutlined />}
									onClick={selectDataset}
									className="mt-4"
									block
								>
									Continue with Selected Dataset
								</Button>
							)}
						</Space>
					</Card>
				</Col>

				<Col xs={24} lg={18}>
					<Card className="shadow-md rounded-lg mb-6">
						<Alert
							message="Need help choosing a dataset?"
							description="If you're unsure about which dataset to select, look for one that matches your project type and is already labeled (marked with 'Yes'). This will help you get started faster."
							type="info"
							showIcon
							className="mb-4"
						/>

						<Spin spinning={loading}>
							<Table
								columns={columns}
								dataSource={filteredDatasets}
								rowSelection={{
									type: 'radio',
									selectedRowKeys,
									onChange: setSelectedRowKeys,
								}}
								rowKey={(record, index) => index}
								pagination={{ pageSize: 6 }}
								className="border rounded-lg"
								locale={{
									emptyText: (
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description="No datasets match your current filters"
										/>
									),
								}}
							/>
						</Spin>
					</Card>

					<Card
						// hoverable
						className="shadow-md rounded-lg text-center"
					>
						<Space
							direction="vertical"
							size="medium"
							// className="py-6"
						>
							<CloudUploadOutlined className="text-5xl text-blue-500" />
							<div>
								<Title level={4}>Create a New Dataset</Title>
								<Text type="secondary">
									Don't see what you need? Click here to
									upload and create your own dataset
								</Text>
							</div>
							<Button
								type="primary"
								size="large"
								icon={<CloudUploadOutlined />}
								onClick={() =>
									(window.location = PATHS.DATASETS)
								}
							>
								Create Dataset
							</Button>
						</Space>
					</Card>
				</Col>
			</Row>
		</div>
	)
}

export default UploadData
