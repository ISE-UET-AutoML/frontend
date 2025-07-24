// CreateLabelProjectForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Space,
    Tag,
    Divider,
    Alert
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getDatasets } from 'src/api/dataset';
import { TASK_TYPES } from 'src/constants/types';
import { DATASET_TASK_MAPPING, TASK_TYPE_INFO } from 'src/constants/dataset_task_mapping';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateLabelProjectForm({
    onSubmit,
    onCancel,
    onBack,
    initialValues = {},
    loading,
    detectedLabels = [],
    csvMetadata = null,
    datasetType // IMAGE | TEXT | TABULAR | MULTIMODAL
}) {
    const [form] = Form.useForm();
    const [expectedLabels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [columnOptions, setColumnOptions] = useState([]);

    // watch task type selection
    const selectedTaskType = Form.useWatch('taskType', form);

    useEffect(() => {
        if (detectedLabels?.length > 0) {
            console.log('Setting detected labels from folder structure:', detectedLabels);
            setLabels(detectedLabels);
        }
    }, [detectedLabels]);

    useEffect(() => {
        // Xử lý cho dataset loại TEXT/TABULAR/MULTIMODAL với CSV
        if (csvMetadata?.columns) {
            console.log('Setting columns from CSV:', csvMetadata.columns);
            const options = Object.entries(csvMetadata.columns).map(([key, val]) => ({
                value: key,
                label: `${key} (${val.unique_class_count ?? 0} classes)`,
                uniqueClassCount: val.unique_class_count ?? 0,
            }));
            setColumnOptions(options);
            
            // Tự động chọn column nếu chỉ có 1
            if (options.length === 1) {
                setLabels([options[0].value]);
            }
        }
    }, [csvMetadata]);

    const handleAddLabel = () => {
        const v = newLabel.trim();
        if (v && !expectedLabels.includes(v)) {
            setLabels(prev => [...prev, v]);
            setNewLabel('');
        }
    };

    const handleRemoveLabel = labelToRemove => {
        setLabels(prev => prev.filter(l => l !== labelToRemove));
    };

    const handleSubmit = (values) => {
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
        };
        onSubmit(payload);
    };

    // Lọc task types dựa vào dataset type
    const getAvailableTaskTypes = () => {
        const dataType = datasetType;
        if (!dataType) {
            return [];
        }
        
        const availableTypes = DATASET_TASK_MAPPING[dataType] || [];
        
        const taskTypes = availableTypes.map(typeKey => ({
            key: typeKey,
            ...TASK_TYPE_INFO[typeKey]
        }));
        
        return taskTypes;
    };

    // Log initial values
    useEffect(() => {
        // Recalculate when datasetType changes
        getAvailableTaskTypes();
    }, [datasetType]);

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ ...initialValues }}
            onFinish={handleSubmit}
        >
            <Form.Item 
                name="name" 
                label="Project Name" 
                rules={[{ required: true, message: 'Enter project name' }]}
            >
                <Input 
                    placeholder="Enter project name" 
                    disabled 
                    style={{ color: 'rgba(0, 0, 0, 0.88)' }}
                />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <TextArea rows={3} maxLength={500} showCount />
            </Form.Item>

            <Form.Item 
                name="taskType" 
                label="Task Type" 
                rules={[{ required: true }]}
            >
                <Select 
                    placeholder="Select task type"
                    onChange={() => {
                        // Reset labels when task type changes
                        setLabels([]);
                    }}
                    style={{ width: '100%' }}
                    allowClear
                >
                    {/* Placeholder option */}
                    {datasetType && (
                        <Option key="__placeholder" value="" disabled>
                            -- No option selected --
                        </Option>
                    )}
                    {datasetType && getAvailableTaskTypes().map(task => (
                        <Option key={task.key} value={task.key}>
                            {task.displayName}
                            <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>
                                ({task.description})
                            </span>
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Expected Labels" required>
                {!selectedTaskType ? (
                    <Alert message="Please select Task Type first" type="warning" showIcon />
                ) : columnOptions.length > 0 ? (
                    // UI cho TEXT/TABULAR/MULTIMODAL datasets với CSV columns
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
                                        {`${col.uniqueClassCount} classes`}
                                    </i>
                                </div>
                            </Option>
                        ))}
                    </Select>
                ) : (
                    // UI cho IMAGE datasets hoặc manual input
                    <>
                        {detectedLabels.length > 0 ? (
                            // Hiển thị detected labels dưới dạng tags có thể click
                            <div className="flex flex-wrap gap-2">
                                {detectedLabels.map(label => (
                                    <Tag
                                        key={label}
                                        color={expectedLabels.includes(label) ? 'blue' : 'default'}
                                        onClick={() => {
                                            if (expectedLabels.includes(label)) {
                                                setLabels(prev => prev.filter(l => l !== label));
                                            } else {
                                                setLabels(prev => [...prev, label]);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {label}
                                    </Tag>
                                ))}
                            </div>
                        ) : (
                            // Manual input nếu không có detected labels
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
                        )}
                        
                        {expectedLabels.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {expectedLabels.map(label => (
                                    <Tag
                                        key={label}
                                        closable
                                        color="blue"
                                        onClose={() => handleRemoveLabel(label)}
                                    >
                                        {label}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {expectedLabels.length === 0 && (
                    <Alert
                        message="At least one label is required"
                        type="info"
                        showIcon
                        className="mt-2"
                    />
                )}
            </Form.Item>

            <Divider />

            <Form.Item>
                <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Button onClick={onBack}>Back</Button>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={expectedLabels.length === 0}>
                        Create
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}
