import React, { useState, useRef, useEffect } from 'react';
import { Card, Tag, Button, Empty, Row, Col, Typography, Slider, List, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getClassColor = (className) => {
    const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
    let hash = 0;
    if (className) {
        for (let i = 0; i < className.length; i++) {
            hash = className.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    return colors[(hash % colors.length + colors.length) % colors.length];
};

const ObjectDetectionHistoryViewer = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [minConfidence, setMinConfidence] = useState(0.3); 
    const [imageSize, setImageSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
    const imgRef = useRef(null);
    
    useEffect(() => {
        const handleResize = () => {
            if (imgRef.current) {
                const { clientWidth, clientHeight, naturalWidth, naturalHeight } = imgRef.current;
                setImageSize({ width: clientWidth, height: clientHeight, naturalWidth, naturalHeight });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onImgLoad = ({ target }) => {
        setImageSize({
            width: target.clientWidth,
            height: target.clientHeight,
            naturalWidth: target.naturalWidth,
            naturalHeight: target.naturalHeight
        });
    };

    if (!data || data.length === 0) {
        return <Empty description="No data available." />;
    }

    const currentItem = data[currentIndex] || {};
    const visibleDetections = (currentItem.detections || []).filter(d => d.confidence >= minConfidence);

    const scaleX = imageSize.naturalWidth ? imageSize.width / imageSize.naturalWidth : 1;
    const scaleY = imageSize.naturalHeight ? imageSize.height / imageSize.naturalHeight : 1;

    return (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column' }}>
            {/* Header: Navigation & Filters */}
            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg shadow-sm">
                <Space>
                    <Button 
                        icon={<LeftOutlined />} 
                        onClick={() => setCurrentIndex(p => p - 1)} 
                        disabled={currentIndex === 0}
                    />
                    <Text strong>Image {currentIndex + 1} / {data.length}</Text>
                    <Button 
                        icon={<RightOutlined />} 
                        onClick={() => setCurrentIndex(p => p + 1)} 
                        disabled={currentIndex === data.length - 1}
                    />
                </Space>
                
                <div style={{ width: 300, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>Confidence &gt; {minConfidence}</Text>
                    <Slider 
                        min={0} max={1} step={0.01} 
                        value={minConfidence} 
                        onChange={setMinConfidence} 
                        style={{ flex: 1 }} 
                    />
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {/* Image & Bounding Boxes Area */}
                <Col xs={24} lg={16}>
                    <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                            ref={imgRef}
                            src={currentItem.imageUrl}
                            alt="Prediction"
                            onLoad={onImgLoad}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        
                        {/* Render Bounding Boxes */}
                        {visibleDetections.map((det, idx) => {
                            const [x_min, y_min, x_max, y_max] = det.bbox;
                            
                            const left = Math.max(0, x_min) * scaleX;
                            const top = Math.max(0, y_min) * scaleY;
                            const width = (Math.min(x_max, imageSize.naturalWidth) - Math.max(0, x_min)) * scaleX;
                            const height = (Math.min(y_max, imageSize.naturalHeight) - Math.max(0, y_min)) * scaleY;

                            const color = getClassColor(det.class);

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'absolute',
                                        left: left,
                                        top: top,
                                        width: width,
                                        height: height,
                                        border: `2px solid ${color}`,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: -24, 
                                        left: -2, 
                                        background: color, 
                                        color: '#fff', 
                                        padding: '0 4px', 
                                        fontSize: '12px',
                                        borderRadius: '2px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {det.class} ({(det.confidence * 100).toFixed(0)}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Col>

                {/* Info & List Side */}
                <Col xs={24} lg={8}>
                    <Card title="Detections List" styles={{ body: { padding: 0 } }} style={{ height: '100%', maxHeight: '600px', overflowY: 'auto' }}>
                        <List
                            dataSource={visibleDetections}
                            renderItem={(item) => (
                                <List.Item style={{ padding: '10px 15px' }}>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Tag color={getClassColor(item.class)}>{item.class}</Tag>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Conf: {(item.confidence * 100).toFixed(2)}%
                                                </Text>
                                            </Space>
                                        }
                                        description={
                                            <Text code style={{ fontSize: '10px' }}>
                                                Box: [{item.bbox.map(n => Math.round(n)).join(', ')}]
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ObjectDetectionHistoryViewer;