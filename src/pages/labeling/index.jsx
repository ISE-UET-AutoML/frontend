import React, { useEffect, useState } from 'react';
import 'src/assets/css/card.css'
import LabelEditor from './LabelEditor';
import { message } from 'antd';
import { render } from 'react-dom';
import ReactDOM from 'react-dom/client';

const Labeling = ({ images, pagination, savedLabels, next, updateFields }) => {
    const labels = ['dog', 'cat', 'horse', 'deer']
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        console.log('effect', currentIndex);
        if (currentIndex < images.length) {
            console.log("update view");
        } else {
            console.log('done increase');
        }
    })
    
    const reuslt = <LabelEditor
        index={currentIndex}
        image={images[currentIndex]}
        labels={labels}
        setCurrentIndex={setCurrentIndex}
        forceUpdate={console.log}
    />

    return reuslt
};
export default Labeling;
