// components/LabelStudio.js
import { useEffect } from 'react';
import { useRef } from 'react';



const LabelStudioReact = (props) => {
    const labelStudioContainerRef = useRef();
    const labelStudioRef = useRef();

    useEffect(() => {
        if (labelStudioContainerRef.current) {
            labelStudioRef.current = new LabelStudio(
                labelStudioContainerRef.current,
                props
            );
        }
    }, []);

    return (
        <div
            id="label-studio"
            ref={function (el) {
                labelStudioContainerRef.current = el
            }}
        />
    );
}