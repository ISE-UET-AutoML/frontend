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
import * as datasetAPI from 'src/api/dataset'

const { Option } = Select
const { TextArea } = Input

export default function CreateLabelProjectModal({ visible, onCancel, onCreate }) {
    const [form] = Form.useForm()
    const [datasets, setDatasets] = useState([])
    const [labels, setLabels] = useState([])
    const [newLabel, setNewLabel] = useState('')
    const [loading, setLoading] = useState(false)

    const projectTypes = [
        { value: 'text_classification', label: 'Text Classification' },
        { value: 'named_entity_recognition', label: 'Named Entity Recognition' },
        { value: 'text_summarization', label: 'Text Summarization' },
        { value: 'image_classification', label: 'Image Classification' },
        { value: 'object_detection', label: 'Object Detection' },
        { value: 'sentiment_analysis', label: 'Sentiment Analysis' }
    ]

    useEffect(() => {
        if (visible) {
            fetchDatasets()
        }
    }, [visible])

    const fetchDatasets = async () => {
        try {
            const response = await datasetAPI.getDatasets()
            setDatasets(response.data)
        } catch (error) {
            console.error('Error fetching datasets:', error)
        }
    }

    const handleAddLabel = () => {
        if (newLabel.trim() && !labels.includes(newLabel.trim())) {
            setLabels([...labels, newLabel.trim()])
            setNewLabel('')
        }
    }

    const handleRemoveLabel = (labelToRemove) => {
        setLabels(labels.filter(label => label !== labelToRemove))
    }

    const handleSubmit = async (values) => {
        try {
            setLoading(true)
            const formData = {
                ...values,
                labels: labels
            }
            await onCreate(formData)
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
        onCancel()
    }

    return (
        <Modal
            title="Create New Label Project"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
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

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <TextArea
                        placeholder="Enter project description"
                        rows={3}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Project Type"
                    rules={[{ required: true, message: 'Please select project type' }]}
                >
                    <Select placeholder="Select project type">
                        {projectTypes.map(type => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="datasetId"
                    label="Dataset"
                    rules={[{ required: true, message: 'Please select a dataset' }]}
                >
                    <Select
                        placeholder="Select dataset to label"
                        showSearch
                        optionFilterProp="children"
                    >
                        {datasets.map(dataset => (
                            <Option key={dataset._id} value={dataset._id}>
                                {dataset.name} ({dataset.totalRecords} items)
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Labels"
                    required
                >
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter label name"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
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

                        {labels.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {labels.map(label => (
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
                        )}

                        {labels.length === 0 && (
                            <Alert
                                message="Please add at least one label for your project"
                                type="info"
                                showIcon
                                className="text-sm"
                            />
                        )}
                    </div>
                </Form.Item>

                <Divider />

                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={labels.length === 0}
                        >
                            Create Project
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}