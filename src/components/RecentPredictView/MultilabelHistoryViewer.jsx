import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Table, Tag, Drawer, Switch, Input, Empty, Space, Tooltip } from 'antd';
import Papa from 'papaparse';

const MultilabelHistoryViewer = forwardRef(({ data }, ref) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [allColumns, setAllColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [filterText, setFilterText] = useState('');

    const getPredictedLabels = (prediction) => {
        if (!prediction || !prediction.class || !prediction.label) {
            return [];
        }
        const binaryArray = prediction.class;
        const labels = prediction.label;
        return binaryArray
            .map((value, index) => (value === 1 ? labels[index] : null))
            .filter((label) => label !== null);
    };
    
    useImperativeHandle(ref, () => ({
        openDrawer() {
            setIsDrawerOpen(true);
        },
        downloadCsv() {
            downloadCsv();
        }
    }));

    const downloadCsv = () => {
        if (!data || data.length === 0) return;

        const dataToDownload = data.map(row => {
            const downloadRow = {};
            visibleColumns.forEach(col => {
                if (col === 'Predicted Class') {
                    downloadRow[col] = getPredictedLabels(row).join('; ');
                } else {
                    downloadRow[col] = row[col];
                }
            });
            return downloadRow;
        });

        const csv = Papa.unparse(dataToDownload);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `multilabel_prediction_history.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (data && data.length > 0 && typeof data[0] === 'object') {
            const keys = Object.keys(data[0]).filter(key => 
                key.toLowerCase() !== 'key' && 
                key.toLowerCase() !== 'class' && 
                key.toLowerCase() !== 'label'
            );
            // Thêm cột 'Predicted Class' ảo để quản lý
            setAllColumns([...keys, 'Predicted Class']);
            setVisibleColumns([...keys, 'Predicted Class']);
        } else {
            setAllColumns([]);
            setVisibleColumns([]);
        }
    }, [data]);

    const handleColumnToggle = (columnKey) => {
        setVisibleColumns((prev) =>
            prev.includes(columnKey)
                ? prev.filter((key) => key !== columnKey)
                : [...prev, columnKey]
        );
    };
    const truncateText = (text) => {
        if (typeof text !== 'string' || !text) return text;
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    };

    const isTextTruncated = (text) => {
        return typeof text === 'string' && text.length > 50;
    };

    const tableColumns = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const dataCols = allColumns
            .filter(key => key !== 'Predicted Class' && visibleColumns.includes(key))
            .map(key => ({
                title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                dataIndex: key,
                key: key,
                width: 180,
                render: (text) => {
                    const isTruncated = isTextTruncated(text);
                    
                    return (
                        <Tooltip title={isTruncated ? text : null}>
                            <span style={{ cursor: isTruncated ? 'help' : 'default' }}>
                                {truncateText(text)}
                            </span>
                        </Tooltip>
                    );
                }
            }));

        const predictionCol = {
            title: 'Predicted Class',
            key: 'predictedClass',
            fixed: 'right',
            width: 200,
            render: (record) => { // 'record' là toàn bộ object của một dòng
                const predictedLabels = getPredictedLabels(record);
                if (predictedLabels.length === 0) {
                    return <Tag>No prediction</Tag>;
                }
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {predictedLabels.map((label, idx) => (
                            <Tag key={idx} color="purple">
                                {label}
                            </Tag>
                        ))}
                    </div>
                );
            }
        };

        return visibleColumns.includes('Predicted Class') ? [...dataCols, predictionCol] : dataCols;

    }, [allColumns, visibleColumns, data]);

    const filteredDrawerColumns = allColumns.filter((col) =>
        col.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <>
            {data && data.length > 0 ? (
                <Table
                    columns={tableColumns}
                    dataSource={data}
                    rowKey={(record, index) => record.key ?? index}
                    scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
                    pagination={{ pageSize: 15 }}
                />
            ) : (
                <Empty description="No data to display" />
            )}
            <Drawer
                title="Column Settings"
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
            >
                <Input.Search
                    placeholder="Search column name"
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Space direction="vertical" style={{ width: '100%' }}>
                    {filteredDrawerColumns.map((columnKey) => (
                        <div key={columnKey} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', borderRadius: '4px', background: '#f5f5f5' }}>
                            <span style={{ fontWeight: 500 }}>{columnKey}</span>
                            <Switch
                                checked={visibleColumns.includes(columnKey)}
                                onChange={() => handleColumnToggle(columnKey)}
                            />
                        </div>
                    ))}
                </Space>
            </Drawer>
        </>
    );
});

export default MultilabelHistoryViewer;