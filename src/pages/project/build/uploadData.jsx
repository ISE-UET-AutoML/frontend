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

                    console.log(`[pollExportStatus] Task ${taskId} → status: ${status}`);

                    if (status === 'SUCCESS') {
                        clearInterval(intervalId);
                        console.log(`[pollExportStatus] Task ${taskId} completed. Result:`, result);
                        resolve(result);
                    } else if (status === 'FAILURE') {
                        clearInterval(intervalId);
                        console.error(`[pollExportStatus] Task ${taskId} failed. Error:`, error);
                        reject(new Error(error || 'Export task failed.'));
                    }
                    // Nếu là PENDING thì tiếp tục chờ
                } catch (err) {
                    clearInterval(intervalId);
                    console.error(`[pollExportStatus] Error checking task ${taskId}:`, err?.message || err);
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
            console.log('Export completed successfully:', finalResult);
            message.success('Data prepared successfully!');

            //await uploadToS3(selectedProject.label_studio_id)      
            updateFields({
                selectedProject,
            })
            const object = config[projectInfo.task_type]
            if (!object) {
            console.error("Config not found for task type:", projectInfo.task_type);
            return;
            }
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

    const selectedProject =
        selectedRowKeys.length > 0 ? filteredProjects[selectedRowKeys[0]] : null
    const isSelectedProjectLabeled = selectedProject?.isLabeled

    return (
        <div className="pl-6 pr-6">
            <Row justify="center">
                <Col xs={24} md={16}>
                    <Title level={1} className="text-center">
                        Choose Your Label Project
                    </Title>
                    <Paragraph className="text-center text-gray-600">
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
                                <span>Filter Options</span>
                            </Space>
                        }
                        className="shadow-md rounded-lg sticky top-4"
                    >
                        <Space direction="vertical" className="w-full">
                            <div>
                                <Title level={5}>
                                    Cloud Service
                                    <Tooltip title="Choose the cloud storage service where your label project is stored">
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
                                    <Option value="GCP_STORAGE">Google Cloud Storage</Option>
                                </Select>
                            </div>

                            <div>
                                <Title level={5}>
                                    Storage Bucket
                                    <Tooltip title="Select the specific storage bucket containing your label project">
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
                                    <Option value="user-private-project">User Private Project</Option>
                                    <Option value="bucket-1">Bucket 1</Option>
                                </Select>
                            </div>

                            <div>
                                <Title level={5}>
                                    Project Status
                                    <Tooltip title="Filter projects based on whether they're already labeled">
                                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                                    </Tooltip>
                                </Title>
                                <Radio.Group
                                    value={labeledFilter}
                                    onChange={(e) => setLabeledFilter(e.target.value)}
                                    className="w-full"
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
                                    className="mt-4 flex items-center justify-between"
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
                    <Card className="shadow-md rounded-lg mb-6">
                        <Alert
                            message="Need help choosing a label project?"
                            description="If you're unsure about which project to select, look for one that matches your task type and is already labeled (marked with 'Yes'). This will help you get started faster."
                            type="info"
                            showIcon
                            className="mb-4"
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
                                className="border rounded-lg"
                                locale={{
                                    emptyText: (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No label projects match your current filters"
                                        />
                                    ),
                                }}
                            />
                        </Spin>
                    </Card>

                    <Card
                        hoverable
                        className="shadow-md rounded-lg text-center cursor-pointer"
                        onClick={showModal}
                    >
                        <Space direction="vertical" size="medium" className="w-full py-6">
                            <CloudUploadOutlined className="text-5xl text-blue-500" />
                            <div>
                                <Title level={4}>Create a New Label Project</Title>
                                <Text type="secondary">
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
            >
                <div className="text-center py-8">
                    <Spin size="large" />
                    <Paragraph className="mt-4 text-gray-600">
                        Hệ thống đang export nhãn và chuẩn bị dữ liệu.
                        <br />
                        Quá trình này có thể mất vài phút, vui lòng không đóng cửa sổ này.
                    </Paragraph>
                </div>
            </Modal>
        </div>
    )
}

export default UploadData