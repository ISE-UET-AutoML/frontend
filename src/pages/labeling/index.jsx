
import React, { useEffect, useRef, useContext, useCallback, useState } from 'react';
import 'src/assets/css/card.css'
import LabelEditor from './LabelEditor';
import { message } from 'antd';
import { render } from 'react-dom';
import ReactDOM from 'react-dom/client';
import { listImages, trainModel } from 'src/api/project';
import { useParams } from 'react-router-dom';


const Labeling = ({ images, pagination, savedLabels, next, updateFields }) => {
    const labels = ['dog', 'cat', 'horse', 'deer']
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentImages, setCurrentImages] = useState(images);
    const { id: projectId } = useParams();
    const max_size = pagination['size'] * pagination['total_page']
    const increase = async () => {
        if (currentIndex < currentImages.length - 1) {
            console.log('increase');
            setCurrentIndex(currentIndex + 1)
        } else {
            const current_lenth = currentImages.length
            if (current_lenth < max_size) {
                const page = current_lenth / pagination['size'] + 1
                const { data } = await listImages(projectId, `&page=${page}&size=24`);
                setCurrentImages((currentImages) => [...images, ...data.data.files])
                // setLabels(savedLabels)
                // images = [...images, ...data.data.files]
                // console.log(images.length);
                if (data.data.files.length)
                    setCurrentIndex(currentIndex + 1)
                else
                    setCurrentIndex(0)
            }
        }
    }

    useEffect(() => {
        console.log('effect', currentIndex, currentImages.length);
        if (currentIndex < currentImages.length) {
            // force render 
            // const { value, setValue } = useContext(MyContext);
            // setValue(currentIndex)
            const root = ReactDOM.createRoot(document.getElementById('label-editor-container'));
            root.render(
                <LabelEditor
                    index={currentIndex}
                    image={currentImages[currentIndex]}
                    labels={labels}
                    setCurrentIndex={increase}
                />
            )
            console.log("update view");
        } else {
            console.log('done increase');
        }
    })

    // const reuslt = <LabelEditor
    //     index={currentIndex}
    //     image={images[currentIndex]}
    //     labels={labels}
    //     setCurrentIndex={setCurrentIndex}
    //     forceUpdate={FocusInput}
    // />

    return (
        <div className='label-editor-container' id='label-editor-container' >
            <LabelEditor
                index={currentIndex}
                image={currentImages[currentIndex]}
                labels={labels}
                setCurrentIndex={increase}
            />
        </div>

    )
};
export default Labeling;
