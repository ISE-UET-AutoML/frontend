// components/LabelStudio.js
import { useEffect, useRef } from 'react';
import LabelStudio from '@thanhtlx/label-studio-fe-fix';
import '@thanhtlx/label-studio-fe-fix/build/static/css/main.css';

const LabelStudioReact = (props) => {
    const labelStudioContainerRef = useRef();
    const labelStudioRef = useRef();

    useEffect(() => {
        if (labelStudioContainerRef.current) {
            const editor = new LabelStudio(
                labelStudioContainerRef.current,
                props
            );
            editor.on("updateAnnotation", props.callbacko)
            labelStudioRef.current = editor

        }
    }, []);

    return (
        <div
            // id="label-studio"
            ref={function (el) {
                labelStudioContainerRef.current = el
            }}
        />
    );
}

export default LabelStudioReact;