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
    Alert,
    ColorPicker
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
    const [selectedImageColumn, setSelectedImageColumn] = useState(null); // State cho cột ảnh
    const [selectedSeriesColumn, setSelectedSeriesColumn] = useState(null); // State cho cột chuỗi
    const [labelColors, setLabelColors] = useState({});
    // watch task type selection
    const selectedTaskType = Form.useWatch('taskType', form);
    const isManualLabelTask = (taskType) =>
        ['SEMANTIC_SEGMENTATION', 'OBJECT_DETECTION'].includes(taskType);

    useEffect(() => {
        if (detectedLabels?.length > 0 && selectedTaskType === 'IMAGE_CLASSIFICATION') {
            console.log('Setting detected labels from folder structure:', detectedLabels);
            setLabels(detectedLabels);
        }
    }, [detectedLabels,selectedTaskType]);

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
            if (options.length === 1 && !isManualLabelTask(selectedTaskType)) {
                setLabels([options[0].value]);
            }
        } else {
            setColumnOptions([]);
        }
    }, [csvMetadata]);

    const handleAddLabel = () => {
        const v = newLabel.trim();
        if (v && !expectedLabels.includes(v)) {
            setLabels(prev => [...prev, v]);
            setLabelColors(prev => ({
                ...prev,
                [v]: '#'+Math.floor(Math.random()*16777215).toString(16) // Màu random
            }));
            setNewLabel('');
        }
    };

    const handleRemoveLabel = labelToRemove => {
        setLabels(prev => prev.filter(l => l !== labelToRemove));
        setLabelColors(prev => {
            const copy = {...prev};
            delete copy[labelToRemove];
            return copy;
        });
    };
    const handleColorChange = (label, color) => {
        setLabelColors(prev => ({
            ...prev,
            [label]: color.toHexString()
        }));
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
                "is_binary_class": is_binary_class,
                "image_column": selectedImageColumn,
                "label_colors": labelColors,
                "series_column": selectedSeriesColumn
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

            {datasetType === 'MULTIMODAL' && (
                <Form.Item label="Image Column" required>
                    <Select
                        placeholder="Select image column"
                        value={selectedImageColumn || undefined}
                        onChange={setSelectedImageColumn}
                    >
                        {columnOptions.map(col => (
                            <Option key={col.value} value={col.value}>
                                {col.label}
                            </Option>
                        ))}
                    </Select>
                    {!selectedImageColumn && (
                        <Alert
                            message="Please select an image column for MULTIMODAL datasets."
                            type="warning"
                            showIcon
                            className="mt-2"
                        />
                    )}
                </Form.Item>
            )}

            {
                datasetType === 'TIME_SERIES' && (
                    <Form.Item label="Series Column" required>
                        <Select
                            placeholder="Select series column"
                            value={selectedSeriesColumn || undefined}
                            onChange={setSelectedSeriesColumn}
                        >
                            {columnOptions.map(col => (
                                <Option key={col.value} value={col.value}>
                                    {col.label}
                                </Option>
                            ))}
                        </Select>
                        {!selectedSeriesColumn && (
                            <Alert
                                message="Please select a series column for TIME_SERIES datasets."
                                type="warning"
                                showIcon
                                className="mt-2"
                            />
                        )}
                    </Form.Item>
                )
            }

            <Form.Item label="Expected Labels" required>
                {!selectedTaskType ? (
                    <Alert message="Please select Task Type first" type="warning" showIcon />
                ) : (columnOptions.length > 0 && !isManualLabelTask(selectedTaskType)) ? (
                    // 1. Dành cho TEXT/TABULAR/MULTIMODAL: Chọn cột từ CSV
                    <Select
                        mode={selectedTaskType.startsWith('MULTILABEL') ? 'multiple' : undefined}
                        placeholder={
                            selectedTaskType.startsWith('MULTILABEL')
                                ? "Select one or more label columns"
                                : "Select a label column"
                        }
                        value={
                            selectedTaskType.startsWith('MULTILABEL')
                                ? expectedLabels
                                : expectedLabels[0] || undefined
                        } // 2. Value là cả mảng
                        onChange={(value) => {
                            const isMultiLabel = selectedTaskType.startsWith('MULTILABEL');
                            setLabels(isMultiLabel ? value : [value]);
                        }} // 3. onChange sẽ nhận về cả mảng
                        optionLabelProp="label" // Hiển thị label đã chọn thay vì value
                    >
                        {columnOptions.map(col => (
                            <Option key={col.value} value={col.value} label={col.value}>
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
                    // 2. Dành cho IMAGE, SEGMENTATION, DETECTION: Nhập/sửa thủ công
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
                                    <div 
                                        key={label} 
                                        className="flex items-center gap-2"
                                    >
                                        <Tag
                                            closable
                                            onClose={() => handleRemoveLabel(label)}
                                            color="blue"
                                        >
                                            {label}
                                        </Tag>
                                        {selectedTaskType === 'SEMANTIC_SEGMENTATION' && (
                                            <ColorPicker
                                                value={labelColors[label] || '#ffffff'}
                                                onChange={(color) => handleColorChange(label, color)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert
                                message="At least one label is required"
                                type="info"
                                showIcon
                                className="mt-2"
                            />
                        )}
                    </>
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
