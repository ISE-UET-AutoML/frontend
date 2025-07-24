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

const { Option } = Select;
const { TextArea } = Input;

export default function CreateLabelProjectForm({
    onSubmit,
    onCancel,
    onBack,
    initialValues = {},
    loading,
    prefillTaskType,
    detectedLabels = [],
    csvMetadata = null
}) {
    const [form] = Form.useForm();
    const [datasets, setDatasets] = useState([]);
    const [expectedLabels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [columnOptions, setColumnOptions] = useState([]);

    const taskType = Form.useWatch('taskType', form);
    const selectedDatasetId = Form.useWatch('datasetId', form);

    useEffect(() => {
        fetchDatasets();
    }, []);

    useEffect(() => {
        form.setFieldsValue({ datasetId: undefined });
    }, [taskType]);

    const fetchDatasets = async () => {
        try {
            const res = await getDatasets();
            setDatasets(res.data);
        } catch (error) {
            console.error('Error fetching datasets:', error);
        }
    };

    useEffect(() => {
        const selectedDataset = datasets.find(ds => ds.id === selectedDatasetId);
        if (!selectedDataset) return;

        setLabels([]);
        setColumnOptions([]);

        // Xử lý cho dataset loại IMAGE
        if (selectedDataset.dataType === 'IMAGE' && detectedLabels?.length > 0) {
            console.log('Setting detected labels from folder structure:', detectedLabels);
            setLabels(detectedLabels);
        }
        
        // Xử lý cho dataset loại TEXT/TABULAR/MULTIMODAL
        if (
            ['TEXT', 'TABULAR', 'MULTIMODAL'].includes(selectedDataset.dataType) &&
            csvMetadata?.columns
        ) {
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
    }, [selectedDatasetId, datasets, detectedLabels, csvMetadata]);

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

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ ...initialValues, taskType: prefillTaskType }}
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

            <Form.Item name="taskType" label="Task Type" rules={[{ required: true }]}>
                <Select placeholder="Select task type">
                    {Object.entries(TASK_TYPES).map(([key, val]) => (
                        <Option key={key} value={key}>{val.type}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                    const selectedType = getFieldValue('taskType');
                    const requiredDataType = selectedType ? TASK_TYPES[selectedType]?.dataType : null;
                    const filtered = datasets.filter(ds => ds.dataType === requiredDataType);

                    return (
                        <Form.Item name="datasetId" label="Dataset" rules={[{ required: true }]}>
                            <Select placeholder="Select dataset" disabled={!requiredDataType}>
                                {filtered.map(ds => (
                                    <Option key={ds.id} value={ds.id}>
                                        {ds.title} ({ds.quantity} items)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    );
                }}
            </Form.Item>

            <Form.Item label="Expected Labels" required>
                {columnOptions.length > 0 ? (
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
