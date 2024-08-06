
import React, { useEffect, useRef, useContext, useCallback, useState } from 'react';
import 'src/assets/css/card.css'
import { message } from 'antd';
import { render } from 'react-dom';
import ReactDOM from 'react-dom/client';
import { listImages, trainModel } from 'src/api/project';
import { useParams } from 'react-router-dom';
import { useLibrary } from 'src/utils/LibProvider';
import { ImageConfig } from './Config'
/*
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
*/

const INTERFACES = [
    "panel",
    "update",
    "submit",
    "skip",
    "controls",
    "topbar",
    "instruction",
    "side-column",
    "ground-truth",
    "annotations:tabs",
    "annotations:menu",
    "annotations:current",
    "annotations:add-new",
    "annotations:delete",
    'annotations:view-all',
    "predictions:tabs",
    "predictions:menu",
    "edit-history"
]

const Labeling = ({ images, pagination, savedLabels, next, updateFields }) => {

    const LabelStudio = useLibrary("lsf");
    const rootRef = useRef();
    const lsf = useRef(null);
    const [currentIndex, setIndex] = useState(0)

    const labelinConfig = ImageConfig()


    const getTask = (index) => {
        return {
            id: index,
            annotations: [],
            data: {
                image: images[index].url
            }
        }
    }


    const onUpdate = (ls, annotations) => {
        console.log(annotations);
        console.log('annotation', annotations.serializeAnnotation());
        if (currentIndex <= images.length - 1) {
            setIndex(currentIndex + 1)
            console.log(currentIndex);
        }
    }

    const onSubmit = (ls, annotations) => {
        console.log(annotations);
        console.log('smannotation', annotations.serializeAnnotation());
        if (currentIndex <= images.length - 1) {
            setIndex(currentIndex + 1)
            console.log('current index?', currentIndex);
            initLabelStudio(labelinConfig, getTask(currentIndex))
        }
    }



    const onloadAnnotation = function (LS) {
        var c = LS.annotationStore.addAnnotation({
            userGenerate: true
        });
        LS.annotationStore.selectAnnotation(c.id);
    }

    const initLabelStudio = useCallback(
        (config, task) => {
            if (!LabelStudio) return;
            if (!task?.data) return;
            console.info("Initializing LSF preview", { config, task });
            try {
                const lsf = new window.LabelStudio(rootRef.current, {
                    config,
                    task,
                    interfaces: INTERFACES,
                    'onUpdateAnnotation': onUpdate,
                    'onSubmitAnnotation': onSubmit,
                    'onLabelStudioLoad': onloadAnnotation
                });
                return lsf;
            } catch (err) {
                console.error(err);
                return null;
            }
        },
        [LabelStudio],
    );
    useEffect(() => {
        console.log('change no thing?');
    })

    useEffect(() => {
        console.log('effect', currentIndex);
        const task = getTask(currentIndex)

        if (!lsf.current) {
            lsf.current = initLabelStudio(labelinConfig, task);
        }
        console.log('destroying?', lsf.current);
        if (lsf.current && false) {
            console.info("Destroying LSF");
            try {
                lsf.current.destroy();
            } catch (e) { }
            lsf.current = null;
        }
    }, [initLabelStudio, currentIndex]);
    return (
        <div className='label-editor-container' id='label-editor-container'>
            <div id="label-studio" ref={rootRef} />
        </div>
    )

}


export default Labeling;
