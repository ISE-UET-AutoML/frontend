import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Layout,
    Typography,
    Table,
    Button,
    Space,
    Badge,
    Statistic,
    Progress,
    Tag,
    Tooltip,
    Drawer,
    Empty,
    Pagination,
    Alert,
    Divider,
    Switch,
    Select,
    Spin,
    Menu,
    Dropdown,
} from 'antd'
import {
    QuestionCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    EyeOutlined,
    TableOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
    DownOutlined, CheckOutlined,
    UploadOutlined
} from '@ant-design/icons'
import Papa from 'papaparse'
const { Title, Text, Paragraph } = Typography
const { Content, Header } = Layout
const { Option } = Select


const TabularPredict = ({ predictResult, uploadedFiles, projectInfo, handleUploadFiles }) => {
    const [csvData, setCsvData] = useState([]);
    const [predictionHistory, setPredictionHistory] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(-1); // -1 khi chưa có file
    const [currentPage, setCurrentPage] = useState(1);
    const [incorrectPredictions, setIncorrectPredictions] = useState([]);
    const [statistics, setStatistics] = useState({
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        totalReviewed: 0,
    });
    const [loading, setLoading] = useState(false);
    const [infoDrawerVisible, setInfoDrawerVisible] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [confidenceFilter, setConfidenceFilter] = useState('all');
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);
    const pageSize = 9;

    // Parse CSV và cập nhật dữ liệu
    useEffect(() => {
        if (uploadedFiles?.length && uploadedFiles[0]?.name.endsWith('.csv')) {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
                Papa.parse(reader.result, {
                    header: true,
                    skipEmptyLines: true,
                    complete: ({ data, meta }) => {
                        const importantColumns = [
                            projectInfo.target_column,
                            'Predicted Class',
                            'Confidence',
                            'Actions',
                        ];
                        const initialVisibleColumns = meta.fields.filter(
                            (field) => importantColumns.includes(field) || meta.fields.indexOf(field) < 3
                        );
                        const initialIncorrect = predictResult
                            .map((result, idx) => (result.confidence < 0.7 ? idx : null))
                            .filter((idx) => idx !== null);

                        // Cập nhật lịch sử
                        setPredictionHistory((prev) => {
                            const existingIndex = prev.findIndex(
                                (item) => item.fileName === uploadedFiles[0].name
                            );
                            const newHistoryItem = {
                                fileName: uploadedFiles[0].name,
                                predictions: predictResult,
                                data,
                                visibleColumns: initialVisibleColumns,
                                incorrectPredictions: initialIncorrect,
                            };

                            let newHistory;
                            if (existingIndex >= 0) {
                                // Cập nhật file hiện có
                                newHistory = [...prev];
                                newHistory[existingIndex] = newHistoryItem;
                            } else {
                                // Thêm file mới
                                newHistory = [...prev, newHistoryItem];
                            }

                            // Cập nhật currentFileIndex
                            setCurrentFileIndex(existingIndex >= 0 ? existingIndex : newHistory.length - 1);

                            return newHistory;
                        });

                        // Cập nhật trạng thái hiện tại
                        setCsvData(data);
                        setVisibleColumns(initialVisibleColumns);
                        setIncorrectPredictions(initialIncorrect);
                        setCurrentPage(1); // Reset trang
                        setConfidenceFilter('all'); // Reset bộ lọc
                        setLoading(false);
                    },
                });
            };
            reader.readAsText(uploadedFiles[0]);
        }
    }, [uploadedFiles, predictResult, projectInfo]);

    // Chuyển đổi giữa các file trong lịch sử
    const handleFileSelect = (index) => {
        if (index >= 0 && index < predictionHistory.length) {
            const selectedItem = predictionHistory[index];
            setCurrentFileIndex(index);
            setCsvData(selectedItem.data);
            setVisibleColumns(selectedItem.visibleColumns);
            setIncorrectPredictions(selectedItem.incorrectPredictions);
            setCurrentPage(1); // Reset trang
            setConfidenceFilter('all'); // Reset bộ lọc
            setLoading(false);
        }
    };

    // Cập nhật thống kê
    useEffect(() => {
        const incorrect = incorrectPredictions.length;
        const total = csvData.length;
        const reviewed = Math.min(currentPage * pageSize, total);

        setStatistics({
            correct: total - incorrect,
            incorrect,
            accuracy: total ? (((total - incorrect) / total) * 100).toFixed(1) : 0,
            totalReviewed: reviewed,
        });
    }, [incorrectPredictions, csvData, currentPage]);

    const handlePredictionToggle = (index) => {
        setIncorrectPredictions((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
        // Cập nhật predictionHistory
        setPredictionHistory((prev) => {
            const newHistory = [...prev];
            if (newHistory[currentFileIndex]) {
                newHistory[currentFileIndex].incorrectPredictions = incorrectPredictions.includes(index)
                    ? incorrectPredictions.filter((i) => i !== index)
                    : [...incorrectPredictions, index];
            }
            return newHistory;
        });
    };

    const showRowDetails = (record, index) => {
        setSelectedRowData({ record, index });
        setInfoDrawerVisible(true);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setUploading(true);
            handleUploadFiles(files).finally(() => {
                setUploading(false);
            });
        }
    };

    const handleColumnVisibilityToggle = (column) => {
        setVisibleColumns((prev) =>
            prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
        );
        // Cập nhật predictionHistory
        setPredictionHistory((prev) => {
            const newHistory = [...prev];
            if (newHistory[currentFileIndex]) {
                newHistory[currentFileIndex].visibleColumns = visibleColumns.includes(column)
                    ? visibleColumns.filter((col) => col !== column)
                    : [...visibleColumns, column];
            }
            return newHistory;
        });
    };

    const getFilteredData = () => {
        if (confidenceFilter === 'all') return csvData;
        return csvData.filter((_, index) => {
            const confidence = predictResult[index]?.confidence || 0;
            if (confidenceFilter === 'high') return confidence >= 0.8;
            if (confidenceFilter === 'medium') return confidence >= 0.5 && confidence < 0.8;
            if (confidenceFilter === 'low') return confidence < 0.5;
            return true;
        });
    };

    const getColumns = () => {
        if (!csvData.length) return [];
        const allColumns = Object.keys(csvData[0]);
        const targetColumn = projectInfo.target_column;

        const baseColumns = allColumns
            .filter((col) => visibleColumns.includes(col))
            .map((col) => ({
                title: col,
                dataIndex: col,
                key: col,
                render: (text) => (col === targetColumn ? <Tag color="blue">{text}</Tag> : <Text>{text}</Text>),
                ellipsis: true,
            }));

        return [
            ...baseColumns,
            {
                title: 'Predicted Class',
                key: 'predictedClass',
                width: 160,
                render: (_, __, index) => {
                    const globalIndex = index + (currentPage - 1) * pageSize;
                    const predicted = predictResult[globalIndex]?.class;
                    const isCorrect = !incorrectPredictions.includes(globalIndex);
                    return <Tag color={isCorrect ? 'green' : 'red'}>{predicted}</Tag>;
                },
            },
            {
                title: 'Confidence',
                key: 'confidence',
                width: 160,
                render: (_, __, index) => {
                    const globalIndex = index + (currentPage - 1) * pageSize;
                    const confidence = predictResult[globalIndex]?.confidence || 0;
                    const color = confidence >= 0.7 ? 'green' : confidence >= 0.5 ? 'orange' : 'red';
                    return (
                        <Progress
                            percent={Math.round(confidence * 100)}
                            size="small"
                            status={confidence >= 0.4 ? 'normal' : 'exception'}
                            strokeColor={color}
                        />
                    );
                },
            },
            {
                title: 'Actions',
                key: 'actions',
                fixed: 'right',
                width: 150,
                render: (_, record, index) => {
                    const globalIndex = index + (currentPage - 1) * pageSize;
                    return (
                        <Space>
                            <Tooltip title={incorrectPredictions.includes(globalIndex) ? 'Mark as correct' : 'Mark as incorrect'}>
                                <Button
                                    type={incorrectPredictions.includes(globalIndex) ? 'default' : 'primary'}
                                    size="small"
                                    icon={incorrectPredictions.includes(globalIndex) ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                    onClick={() => handlePredictionToggle(globalIndex)}
                                    danger={!incorrectPredictions.includes(globalIndex)}
                                >
                                    {incorrectPredictions.includes(globalIndex) ? 'Correct' : 'Incorrect'}
                                </Button>
                            </Tooltip>
                            <Tooltip title="View details">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => showRowDetails(record, globalIndex)}
                                />
                            </Tooltip>
                        </Space>
                    );
                },
            },
        ];
    };

    const columns = getColumns();
    const filteredData = getFilteredData();

    return (
        <Layout className="bg-white">
            <Header className="bg-white p-0 mb-4">
                <Card bordered={false} className="shadow-sm">
                    <div className="flex justify-between items-center">
                        <Space>
                            <Title level={4} style={{ margin: 0 }}>
                                <TableOutlined /> Prediction Review Dashboard
                            </Title>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        {predictionHistory.map((item, index) => (
                                            <Menu.Item key={index} onClick={() => handleFileSelect(index)}>
                                                <FileTextOutlined /> {item.fileName}
                                                {index === currentFileIndex && <CheckOutlined style={{ marginLeft: 8 }} />}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                                trigger={['click']}
                            >
                                <Tag color="blue" icon={<FileTextOutlined />} style={{ cursor: 'pointer' }}>
                                    {predictionHistory[currentFileIndex]?.fileName || 'No file uploaded'} <DownOutlined />
                                </Tag>
                            </Dropdown>
                        </Space>
                        <Space>
                            <Tooltip title="Filter by confidence">
                                <Select
                                    value={confidenceFilter}
                                    style={{ width: 120 }}
                                    onChange={setConfidenceFilter}
                                    dropdownMatchSelectWidth={false}
                                >
                                    <Option value="all">All predictions</Option>
                                    <Option value="high">High confidence</Option>
                                    <Option value="medium">Medium confidence</Option>
                                    <Option value="low">Low confidence</Option>
                                </Select>
                            </Tooltip>
                            <Tooltip title="Configure visible columns">
                                <Button icon={<FilterOutlined />} onClick={() => setInfoDrawerVisible(true)}>
                                    Columns
                                </Button>
                            </Tooltip>
                            <Tooltip title="Upload new file for prediction">
                                <Button icon={<UploadOutlined />} onClick={handleClick} loading={uploading} type="primary">
                                    Upload New File
                                </Button>
                            </Tooltip>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleChange}
                                style={{ display: 'none' }}
                                accept=".csv"
                            />
                        </Space>
                    </div>
                </Card>
            </Header>
            <Content>
                <Card size="small" className="mb-4 border-green-500 bg-green-50 border-dashed">
                    <Space size="large" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Statistic title="Total Predictions" value={csvData.length} prefix={<QuestionCircleOutlined />} />
                        <Statistic
                            title="Correct Predictions"
                            value={statistics.correct}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                        <Statistic
                            title="Incorrect Predictions"
                            value={statistics.incorrect}
                            prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                        />
                        <Statistic title="Accuracy" value={statistics.accuracy} suffix="%" precision={1} />
                    </Space>
                </Card>
                {loading ? (
                    <Card>
                        <div className="flex items-center justify-center p-12">
                            <Spin size="large" tip="Loading prediction data..." />
                        </div>
                    </Card>
                ) : csvData.length > 0 ? (
                    <Card className="shadow-sm [&_.ant-card-body]:p-0">
                        <Table
                            dataSource={filteredData}
                            columns={columns}
                            rowKey={(_, index) => index}
                            pagination={{
                                pageSize,
                                current: currentPage,
                                onChange: setCurrentPage,
                                showSizeChanger: false,
                                showTotal: (total) => `${total} predictions`,
                            }}
                            size="small"
                            scroll={{ x: 'max-content' }}
                            rowClassName={(_, index) =>
                                incorrectPredictions.includes(index + (currentPage - 1) * pageSize) ? 'bg-red-50' : ''
                            }
                        />
                    </Card>
                ) : (
                    <Card>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No prediction data available">
                            <Button type="primary" onClick={handleClick} loading={uploading}>
                                Upload a file to start
                            </Button>
                        </Empty>
                    </Card>
                )}
            </Content>
            <Drawer
                title={selectedRowData ? 'Prediction Details' : 'Column Visibility'}
                placement="right"
                onClose={() => {
                    setInfoDrawerVisible(false);
                    setSelectedRowData(null);
                }}
                open={infoDrawerVisible}
                width={400}
            >
                {selectedRowData ? (
                    <div>
                        <div className="mb-2">
                            <Statistic
                                title="Confidence Score"
                                value={(predictResult[selectedRowData.index]?.confidence * 100).toFixed(1)}
                                suffix="%"
                            />
                        </div>
                        <Divider orientation="left" orientationMargin="0">
                            Data Fields
                        </Divider>
                        {Object.entries(selectedRowData.record).map(([key, value]) => (
                            <div key={key} className="mb-2">
                                <Text strong>{key}: </Text>
                                <Text>
                                    {key === projectInfo.target_column ? <Tag color="blue">{value}</Tag> : value}
                                </Text>
                            </div>
                        ))}
                        <Divider orientation="left" orientationMargin="0">
                            Prediction
                        </Divider>
                        <div className="mb-2">
                            <Text strong>Predicted {projectInfo.target_column}: </Text>
                            <Tag color="purple">{predictResult[selectedRowData.index]?.class}</Tag>
                        </div>
                        <div className="mt-4">
                            <Space>
                                <Button
                                    type={incorrectPredictions.includes(selectedRowData.index) ? 'default' : 'primary'}
                                    danger={!incorrectPredictions.includes(selectedRowData.index)}
                                    icon={
                                        incorrectPredictions.includes(selectedRowData.index) ? (
                                            <CheckCircleOutlined />
                                        ) : (
                                            <CloseCircleOutlined />
                                        )
                                    }
                                    onClick={() => handlePredictionToggle(selectedRowData.index)}
                                >
                                    Mark as {incorrectPredictions.includes(selectedRowData.index) ? 'Correct' : 'Incorrect'}
                                </Button>
                            </Space>
                        </div>
                    </div>
                ) : (
                    <div>
                        <Text>Select which columns to display in the table.</Text>
                        <Divider orientation="left">Available Columns</Divider>
                        {csvData.length > 0 &&
                            Object.keys(csvData[0]).map((column) => (
                                <div key={column} className="mb-2">
                                    <Switch
                                        checked={visibleColumns.includes(column)}
                                        onChange={() => handleColumnVisibilityToggle(column)}
                                        size="small"
                                        className="mr-2"
                                    />
                                    <Text
                                        strong={column === projectInfo.target_column}
                                        type={column === projectInfo.target_column ? 'success' : undefined}
                                    >
                                        {column}
                                    </Text>
                                    {column === projectInfo.target_column && (
                                        <Tag color="blue" className="ml-2">
                                            Target
                                        </Tag>
                                    )}
                                </div>
                            ))}
                        <Divider />
                        <Button type="primary" block onClick={() => setInfoDrawerVisible(false)}>
                            Apply Changes
                        </Button>
                    </div>
                )}
            </Drawer>
        </Layout>
    );
};

export default TabularPredict;