import React, { useState, useEffect } from 'react'
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Space,
    Tag,
    Divider,
    Alert
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getDatasets } from 'src/api/dataset'
import { TASK_TYPES } from 'src/constants/types'

const { Option } = Select
const { TextArea } = Input

export default function CreateLabelProjectModal({ visible, onCancel, onCreate }) {
    const [form] = Form.useForm()
    const [datasets, setDatasets] = useState([])
    const [expectedLabels, setLabels] = useState([])
    const [newLabel, setNewLabel] = useState('')
    const [loading, setLoading] = useState(false)
    const [columnOptions, setColumnOptions] = useState([])

    const taskType = Form.useWatch('taskType', form)
    const selectedDatasetId = Form.useWatch('datasetId', form)

    useEffect(() => {
        form.setFieldsValue({ datasetId: undefined })
    }, [taskType, form])

    useEffect(() => {
        if (visible) {
            fetchDatasets()
            setLabels([])
            setNewLabel('')
            setColumnOptions([])
        }
    }, [visible])

    const fetchDatasets = async () => {
        try {
            const response = await getDatasets()
            setDatasets(response.data)
        } catch (error) {
            console.error('Error fetching datasets:', error)
        }
    }

    useEffect(() => {
        const selectedDataset = datasets.find(ds => ds.id === selectedDatasetId)
        setLabels([])
        setColumnOptions([])

        if (!selectedDataset) return

        if (selectedDataset.dataType === 'IMAGE' && selectedDataset.detectedLabels?.length > 0) {
            setLabels(selectedDataset.detectedLabels)
        }

        if (
            (selectedDataset.dataType === 'TEXT' || selectedDataset.dataType === 'TABULAR') &&
            selectedDataset.metaData?.columns
        ) {
            const columns = selectedDataset.metaData.columns
            const options = Object.entries(columns).map(([key, val]) => ({
                value: key,
                label: `${key} (${val.uniqueClassCount} classes)`,
                uniqueClassCount: val.uniqueClassCount
            }))
            setColumnOptions(options)
        }
    }, [selectedDatasetId, datasets])

    const handleAddLabel = () => {
        const v = newLabel.trim()
        if (v && !expectedLabels.includes(v)) {
            setLabels(prev => [...prev, v])
            setNewLabel('')
        }
    }

    const handleRemoveLabel = labelToRemove => {
        setLabels(prev => prev.filter(l => l !== labelToRemove))
    }

    const handleSubmit = async values => {
        setLoading(true)
        try {
            const selectedLabel = expectedLabels[0];
            const column = columnOptions.find(opt => opt.value === selectedLabel);
            const uniqueClassCount = column?.uniqueClassCount ?? 0;
            const is_binary_class = uniqueClassCount === 2;
            const payload = {
                ...values,
                expectedLabels,
                meta_data: {
                    is_binary_class
                }
            }

            console.log('payload', payload)
            await onCreate(payload)
            handleCancel()
        } catch (error) {
            console.error('Error creating project:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        setLabels([])
        setNewLabel('')
        setColumnOptions([])
        onCancel()
    }

    const projectTypes = Object.entries(TASK_TYPES).map(([key, cfg]) => ({
        value: key,
        label: cfg.type
    }))

    return (
        <Modal
            title="Create New Label Project"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="name"
                    label="Project Name"
                    rules={[
                        { required: true, message: 'Please enter project name' },
                        { min: 3, message: 'Project name must be at least 3 characters' }
                    ]}
                >
                    <Input placeholder="Enter project name" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <TextArea rows={3} maxLength={500} showCount />
                </Form.Item>

                <Form.Item
                    name="taskType"
                    label="Task Type"
                    rules={[{ required: true, message: 'Please select task type' }]}
                >
                    <Select placeholder="Select task type">
                        {projectTypes.map(pt => (
                            <Option key={pt.value} value={pt.value}>{pt.label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.taskType !== curr.taskType}>
                    {({ getFieldValue }) => {
                        const selectedType = getFieldValue('taskType')
                        const requiredDataType = selectedType ? TASK_TYPES[selectedType]?.dataType : null
                        const filtered = datasets.filter(ds => ds.dataType === requiredDataType)

                        const getStatusColor = status => {
                            switch (status) {
                                case 'COMPLETED': return 'green'
                                case 'PROCESSING': return 'blue'
                                case 'FAILED': return 'red'
                                default: return 'default'
                            }
                        }

                        return (
                            <Form.Item
                                name="datasetId"
                                label="Dataset"
                                rules={[{ required: true, message: 'Please select a dataset' }]}
                            >
                                <Select
                                    placeholder={requiredDataType
                                        ? `Select a ${requiredDataType.toLowerCase()} dataset`
                                        : 'Please select project type first'}
                                    showSearch
                                    optionFilterProp="label"
                                    disabled={!requiredDataType}
                                >
                                    {filtered.map(ds => (
                                        <Option
                                            key={ds.id}
                                            value={ds.id}
                                            disabled={ds.processingStatus !== 'COMPLETED'}
                                            label={`${ds.title} (${ds.quantity} items)`}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{ds.title} ({ds.quantity} items)</span>
                                                <Tag color={getStatusColor(ds.processingStatus)}>{ds.processingStatus}</Tag>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )
                    }}
                </Form.Item>

                {/* Expected Labels */}
                <Form.Item label="Expected Labels" required>
                    {columnOptions.length > 0 ? (
                        <Select
                            placeholder="Select label column"
                            value={expectedLabels[0] || undefined}
                            onChange={v => setLabels([v])}
                        >
                            {columnOptions.map(col => (
                                <Option key={col.value} value={col.value}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{col.value}</span>
                                        <i style={{ fontSize: '0.8em', color: '#999' }}>
                                            {col.label.match(/\(([^)]+)\)/)?.[1]}
                                        </i>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        <>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter label name"
                                    value={newLabel}
                                    onChange={e => setNewLabel(e.target.value)}
                                    onPressEnter={handleAddLabel}
                                />
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddLabel}
                                    disabled={!newLabel.trim()}
                                >
                                    Add
                                </Button>
                            </div>

                            {expectedLabels.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {expectedLabels.map(label => (
                                        <Tag
                                            key={label}
                                            closable
                                            onClose={() => handleRemoveLabel(label)}
                                            color="blue"
                                        >
                                            {label}
                                        </Tag>
                                    ))}
                                </div>
                            ) : (
                                <Alert
                                    message={
                                        <ul>
                                            <li>At least one expected label is required to create a project.</li>
                                        </ul>
                                    }
                                    type="info"
                                    showIcon
                                    className="text-sm mt-2"
                                />
                            )}
                        </>
                    )}
                </Form.Item>

                <Divider />

                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={expectedLabels.length === 0}
                        >
                            Create Project
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
