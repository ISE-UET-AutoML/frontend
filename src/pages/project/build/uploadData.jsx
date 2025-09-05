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
    Modal,
    message,
} from 'antd'
import {
    CloudUploadOutlined,
    ArrowRightOutlined,
    InfoCircleOutlined,
    FilterOutlined,
} from '@ant-design/icons'
import { createLbProject, getLbProjByTask, startExport, getExportStatus } from 'src/api/labelProject'
import { useNavigate, useOutletContext } from 'react-router-dom'
import CreateLabelProjectModal from 'src/pages/labels/CreateLabelProjectModal'
import config from './config'
import { PATHS } from 'src/constants/paths'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const UploadData = () => {
    const { updateFields, projectInfo } = useOutletContext()
    const navigate = useNavigate()
    const [labelProjects, setLabelProjects] = useState([])
    const [serviceFilter, setServiceFilter] = useState('')
    const [bucketFilter, setBucketFilter] = useState('')
    const [labeledFilter, setLabeledFilter] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState('')
    const [tableLoading, setTableLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isExporting, setIsExporting] = useState(false)   

    const pollExportStatus = (taskId) => {
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const response = await getExportStatus(taskId);
                    const { status, result, error } = response.data;

                    if (status === 'SUCCESS') {
                        clearInterval(intervalId);
                        resolve(result); // Trả về kết quả khi thành công
                    } else if (status === 'FAILURE') {
                        clearInterval(intervalId);
                        reject(new Error(error || 'Export task failed.')); // Báo lỗi
                    }
                    // Nếu là PENDING, tiếp tục chờ
                } catch (err) {
                    clearInterval(intervalId);
                    reject(err);
                }
            }, 5000); // Hỏi lại mỗi 5 giây
        });
    };

    const fetchProjects = async () => {
        setTableLoading(true)
        try {
            const response = await getLbProjByTask(projectInfo.task_type)
            setLabelProjects(
                Array.isArray(response.data)
                    ? response.data.map((item) => ({
                        ...item,
                        project_id: item.id,
                        title: item.name,
                        bucketName: item.bucket_name,
                        isLabeled: item.annotated_nums > 0,
                        service: item.service,
                    }))
                    : []
            )
            console.log(response)
        } catch (error) {
            console.error('Error fetching label projects by task type:', error)
        } finally {
            setTableLoading(false)
        }
    }

    useEffect(() => {
        if (!projectInfo?.task_type) return
        fetchProjects()
    }, [projectInfo?.task_type])

    const filteredProjects = labelProjects.filter(
        (item) =>
            (!serviceFilter || item.service === serviceFilter) &&
            (!bucketFilter || item.bucketName === bucketFilter) &&
            (!labeledFilter ||
                (labeledFilter === 'yes' ? item.isLabeled : !item.isLabeled)) &&
            item.task_type === projectInfo?.task_type
    )

    const handleContinue = async () => {
        const selectedProject = filteredProjects.find(p => p.project_id === selectedRowKeys)

        if (!selectedProject) return

        console.log('selectedProject', selectedProject)
        setIsExporting(true)
        try {
            const startResponse = await startExport(selectedProject.label_studio_id)
            const {task_id} = startResponse.data
            console.log('Export started, task ID:', startResponse)
            
            const finalResult = await pollExportStatus(task_id);
            message.success('Data prepared successfully!');

            //await uploadToS3(selectedProject.label_studio_id)      
            updateFields({
                selectedProject,
            })
            const object = config[projectInfo.task_type]
            navigate(`/app/project/${projectInfo.id}/build/${object.afterUploadURL}`)

        } catch (error) {
            console.error('Error exporting labels to S3:', error)
            message.error('Không thể chuẩn bị dữ liệu. Vui lòng thử lại.');
        } finally {
            setIsExporting(false); // Luôn ẩn dialog sau khi hoàn tất
        }
        //if (!selectedProject.isLabeled) {
          //  navigate(PATHS.LABEL_VIEW(selectedProject.project_id, 'labeling'))
        //}
    }

    const showModal = () => {
        setIsModalVisible(true)
    }

    const hideModal = () => {
        setIsModalVisible(false)
    }

    const handleCreateLabelProject = async (payload) => {
        setTableLoading(true)
        try {
            const response = await createLbProject(payload)
            if (response.status === 201) {
                hideModal() // Đóng modal
                await fetchProjects() // Refresh bảng
            }
        } catch (error) {
            console.error('Error creating label project:', error)
        } finally {
            setTableLoading(false)
        }
    }


    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            align: 'left',
            render: (text) => <Text strong className="dark-build-text-strong">{text}</Text>,
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
            render: (text) => <Text className="dark-build-text">{text}</Text>,
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

    const selectedProject =
        selectedRowKeys.length > 0 ? filteredProjects[selectedRowKeys[0]] : null
    const isSelectedProjectLabeled = selectedProject?.isLabeled

    return (
        <>
            <style>{`
                .dark-build-page {
                    background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
                    min-height: 100vh;
                    padding: 24px;
                }
                
                .dark-build-card {
                    background: linear-gradient(135deg, rgba(15, 32, 39, 0.8) 0%, rgba(32, 58, 67, 0.6) 50%, rgba(44, 83, 100, 0.8) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                
                .dark-build-title {
                    background: linear-gradient(135deg, #00D4FF 0%, #65FFA0 50%, #FFD700 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                }
                
                .dark-build-text {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-text-strong {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-button {
                    background: linear-gradient(135deg, #00D4FF 0%, #65FFA0 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3) !important;
                }
                
                .dark-build-button:hover {
                    background: linear-gradient(135deg, #65FFA0 0%, #00D4FF 100%) !important;
                    box-shadow: 0 6px 20px rgba(101, 255, 160, 0.4) !important;
                    transform: translateY(-2px) !important;
                }
                
                .dark-build-select .ant-select-selector {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-select .ant-select-selector:hover {
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-build-select .ant-select-selection-item {
                    color: white !important;
                }
                
                .dark-build-select .ant-select-arrow {
                    color: #65FFA0 !important;
                }
                
                .dark-build-radio .ant-radio-wrapper {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-radio .ant-radio-checked .ant-radio-inner {
                    background: linear-gradient(135deg, #00D4FF 0%, #65FFA0 100%) !important;
                    border-color: #00D4FF !important;
                }
                
                .dark-build-table .ant-table-thead > tr > th {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(101, 255, 160, 0.2) 100%) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-build-table .ant-table-tbody > tr > td {
                    color: rgba(255, 255, 255, 0.9) !important;
                    font-family: 'Poppins', sans-serif !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                
                .dark-build-table .ant-table-tbody > tr:hover > td {
                    background: rgba(0, 212, 255, 0.1) !important;
                }
                
                .dark-build-table .ant-table-tbody > tr.ant-table-row-selected > td {
                    background: rgba(0, 212, 255, 0.2) !important;
                }
                
                .dark-build-table .ant-table-tbody > tr.ant-table-row-selected:hover > td {
                    background: rgba(0, 212, 255, 0.3) !important;
                }
                
                .dark-build-modal .ant-modal-content {
                    background: linear-gradient(135deg, rgba(15, 32, 39, 0.95) 0%, rgba(32, 58, 67, 0.95) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                }
                
                .dark-build-modal .ant-modal-header {
                    background: transparent;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .dark-build-modal .ant-modal-title {
                    color: white;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                }
                
                .dark-build-modal .ant-modal-body {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .dark-build-alert {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(101, 255, 160, 0.1) 100%) !important;
                    border: 1px solid rgba(0, 212, 255, 0.4) !important;
                    border-radius: 12px !important;
                    backdrop-filter: blur(10px) !important;
                }
                
                .dark-build-alert .ant-alert-message {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-alert .ant-alert-description {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-alert .ant-alert-icon {
                    color: #00D4FF !important;
                }
                
                .dark-build-empty .ant-empty-description {
                    color: rgba(255, 255, 255, 0.6) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-empty .ant-empty-image {
                    filter: invert(1) brightness(0.8) !important;
                }
                
                .dark-build-card .ant-card-body {
                    background: transparent !important;
                    color: white !important;
                }
                
                .dark-build-card .ant-card {
                    background: linear-gradient(135deg, rgba(15, 32, 39, 0.8) 0%, rgba(32, 58, 67, 0.6) 50%, rgba(44, 83, 100, 0.8) 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-build-card .ant-card-hoverable:hover {
                    background: linear-gradient(135deg, rgba(15, 32, 39, 0.9) 0%, rgba(32, 58, 67, 0.7) 50%, rgba(44, 83, 100, 0.9) 100%) !important;
                    border: 1px solid rgba(0, 212, 255, 0.3) !important;
                    box-shadow: 0 12px 40px rgba(0, 212, 255, 0.2) !important;
                }
                
                .dark-build-table .ant-table-thead > tr > th:first-child {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(101, 255, 160, 0.2) 100%) !important;
                }
                
                .dark-build-table .ant-table-thead > tr > th:not(:first-child) {
                    background: linear-gradient(135deg, rgba(101, 255, 160, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%) !important;
                }
                
                .dark-build-table .ant-table-tbody > tr > td .ant-typography {
                    color: rgba(255, 255, 255, 0.9) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-table .ant-tag {
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                    border-radius: 8px !important;
                }
                
                .dark-build-table .ant-tag.ant-tag-success {
                    background: linear-gradient(135deg, #65FFA0 0%, #00D4FF 100%) !important;
                    color: white !important;
                    border: none !important;
                }
                
                .dark-build-table .ant-tag.ant-tag-warning {
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
                    color: white !important;
                    border: none !important;
                }
                
                .dark-build-table .ant-tag.ant-tag-orange {
                    background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%) !important;
                    color: white !important;
                    border: none !important;
                }
                
                .dark-build-table .ant-tag.ant-tag-blue {
                    background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%) !important;
                    color: white !important;
                    border: none !important;
                }
            `}</style>
            <div className="dark-build-page">
                <div className="pl-6 pr-6">
                    <Row justify="center">
                        <Col xs={24} md={16}>
                            <Title level={1} className="dark-build-title text-center">
                                Choose Your Label Project
                            </Title>
                            <Paragraph className="dark-build-text text-center">
                                Select an existing label project or create a new one for your labeling task
                            </Paragraph>
                        </Col>
                    </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={6}>
                    <Card
                        title={
                            <Space>
                                <FilterOutlined />
                                <span className="dark-build-text-strong">Filter Options</span>
                            </Space>
                        }
                        className="dark-build-card shadow-md rounded-lg sticky top-4"
                    >
                        <Space direction="vertical" className="w-full">
                            <div>
                                <Title level={5} className="dark-build-text-strong">
                                    Cloud Service
                                    <Tooltip title="Choose the cloud storage service where your label project is stored">
                                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                                    </Tooltip>
                                </Title>
                                <Select
                                    className="dark-build-select w-full"
                                    value={serviceFilter}
                                    onChange={setServiceFilter}
                                    placeholder="Select Service"
                                >
                                    <Option value="">All Services</Option>
                                    <Option value="AWS_S3">Amazon S3</Option>
                                    <Option value="GCP_STORAGE">Google Cloud Storage</Option>
                                </Select>
                            </div>

                            <div>
                                <Title level={5} className="dark-build-text-strong">
                                    Storage Bucket
                                    <Tooltip title="Select the specific storage bucket containing your label project">
                                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                                    </Tooltip>
                                </Title>
                                <Select
                                    className="dark-build-select w-full"
                                    value={bucketFilter}
                                    onChange={setBucketFilter}
                                    placeholder="Select Bucket"
                                >
                                    <Option value="">All Buckets</Option>
                                    <Option value="user-private-project">User Private Project</Option>
                                    <Option value="bucket-1">Bucket 1</Option>
                                </Select>
                            </div>

                            <div>
                                <Title level={5} className="dark-build-text-strong">
                                    Project Status
                                    <Tooltip title="Filter projects based on whether they're already labeled">
                                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                                    </Tooltip>
                                </Title>
                                <Radio.Group
                                    value={labeledFilter}
                                    onChange={(e) => setLabeledFilter(e.target.value)}
                                    className="dark-build-radio w-full"
                                >
                                    <Space direction="vertical" className="w-full">
                                        <Radio value="">All Projects</Radio>
                                        <Radio value="yes">Labeled Projects</Radio>
                                        <Radio value="no">Unlabeled Projects</Radio>
                                    </Space>
                                </Radio.Group>
                            </div>

                            {selectedRowKeys && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleContinue}
                                    className="dark-build-button mt-4 flex items-center justify-between"
                                    block
                                >
                                    <>
                                        Go to Training <ArrowRightOutlined />
                                    </>
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={18}>
                    <Card className="dark-build-card shadow-md rounded-lg mb-6">
                        <Alert
                            message="Need help choosing a label project?"
                            description="If you're unsure about which project to select, look for one that matches your task type and is already labeled (marked with 'Yes'). This will help you get started faster."
                            type="info"
                            showIcon
                            className="mb-4 dark-build-alert"
                        />

                        <Spin spinning={tableLoading} tip="Processing label project creation...">
                            <Table
                                columns={columns}
                                dataSource={filteredProjects}
                                rowSelection={{
                                    type: 'radio',
                                    selectedRowKeys: selectedRowKeys ? [selectedRowKeys] : [],

                                    onChange: (keys) => setSelectedRowKeys(keys[0]),
                                    getCheckboxProps: (record) => ({
                                        name: record.project_id ? record.project_id.toString() : '',
                                        // Thêm disabled nếu project_id không tồn tại
                                        disabled: !record.project_id || record.annotated_nums === 0
                                    }),
                                }}
                                rowKey="project_id"
                                pagination={{ pageSize: 2 }}
                                className="dark-build-table border rounded-lg"
                                locale={{
                                    emptyText: (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No label projects match your current filters"
                                            className="dark-build-empty"
                                        />
                                    ),
                                }}
                            />
                        </Spin>
                    </Card>

                    <Card
                        hoverable
                        className="dark-build-card shadow-md rounded-lg text-center cursor-pointer"
                        onClick={showModal}
                    >
                        <Space direction="vertical" size="medium" className="w-full py-6">
                            <CloudUploadOutlined className="text-5xl text-blue-500" />
                            <div>
                                <Title level={4} className="dark-build-text-strong">Create a New Label Project</Title>
                                <Text className="dark-build-text">
                                    Don't see what you need? Click here to create a new label project
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <CreateLabelProjectModal
                visible={isModalVisible}
                onCancel={hideModal}
                onCreate={handleCreateLabelProject}
            />

            <Modal
                title="Đang chuẩn bị dữ liệu"
                open={isExporting}
                closable={false}
                footer={null}
                centered
                className="dark-build-modal"
            >
                <div className="text-center py-8">
                    <Spin size="large" />
                    <Paragraph className="dark-build-text mt-4">
                        Hệ thống đang export nhãn và chuẩn bị dữ liệu.
                        <br />
                        Quá trình này có thể mất vài phút, vui lòng không đóng cửa sổ này.
                    </Paragraph>
                </div>
            </Modal>
            </div>
        </div>
        </>
    )
}

export default UploadData