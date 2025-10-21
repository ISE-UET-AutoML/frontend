import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Table, Tag, Drawer, Switch, Input, Empty, Space, Tooltip } from 'antd';
import Papa from 'papaparse';

const TextHistoryViewer = forwardRef(({ data }, ref) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [allColumns, setAllColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [filterText, setFilterText] = useState('');

    // Expose a function to the parent component via the ref
    useImperativeHandle(ref, () => ({
        openDrawer() {
            setIsDrawerOpen(true);
        },
        downloadCsv() {
            downloadCsv();
        }
    }));

    useEffect(() => {
        if (data && data.length > 0 && typeof data[0] === 'object') {
            const keys = Object.keys(data[0]).filter((key) => key.toLowerCase() !== 'key');
            setAllColumns(keys);
            setVisibleColumns(keys);
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

    const downloadCsv = () => {
        if (!data || data.length === 0) return;

        const dataToDownload = data.map(row => {
            const downloadRow = {};
            visibleColumns.forEach(col => {
                downloadRow[col] = row[col];
            });
            return downloadRow;
        });

        const csv = Papa.unparse(dataToDownload);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tabular_prediction_history.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tableColumns = useMemo(() => {
        if (!data || data.length === 0) return [];
        const specialColumns = ['class', 'prediction', 'confidence', 'probability'];
        
        const scrollableCols = allColumns
            .filter(key => visibleColumns.includes(key) && !specialColumns.includes(key.toLowerCase()))
            .map((key) => ({
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


        const fixedCols = allColumns
            .filter(key => visibleColumns.includes(key) && specialColumns.includes(key.toLowerCase()))
            .map(key => ({
                title: key.charAt(0).toUpperCase() + key.slice(1),
                dataIndex: key,
                key: key,
                fixed: 'right',
                width: 150,
                render: (text) => {
                    if (key.toLowerCase() === 'class' || key.toLowerCase() === 'prediction') {
                        const color = String(text).toLowerCase().includes('positive') ? 'green' : 'volcano';
                        return <Tag color={color}>{String(text).toUpperCase()}</Tag>;
                    }
                    if (key.toLowerCase() === 'confidence' || key.toLowerCase() === 'probability') {
                        const num = parseFloat(text);
                        return !isNaN(num) ? `${(num * 100).toFixed(2)}%` : text;
                    }
                    return text;
                },
            }));

        return [...scrollableCols, ...fixedCols];
    }, [allColumns, visibleColumns, data]);

    const filteredDrawerColumns = allColumns.filter((col) =>
        col.toLowerCase().includes(filterText.toLowerCase())
    );

    const truncateText = (text) => {
        if (typeof text !== 'string' || !text) return text;
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    };

    const isTextTruncated = (text) => {
        return typeof text === 'string' && text.length > 50;
    };

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

export default TextHistoryViewer;