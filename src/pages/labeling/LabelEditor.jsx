
import { useEffect, useContext, useRef } from 'react';
import '@thanhtlx/label-studio-fe-fix/build/static/css/main.css';
import LabelStudioReact from './LabelStudio'

const LabelEditor = ({ index, image, labels, setCurrentIndex }) => {
    /*
    const choice = labels.map((v, i) => {
        return '<Choice value="' + v + '"/>'
    })
    const labelinConfig = `
        <View>
        <Image name="image" value="$image"/>
        <Choices name="choice" toName="image">
        ${choice.join('\n')}
        </Choices>
        </View>
    `

    const currentTask = {
        id: index,
        annotations: [],
        data: {
            image: image.url
        }
    }

    const callbackSubmit = function (LS, annotation) {
        console.log('update', index);
        console.log(annotation);
        setCurrentIndex(index + 1)
        // forceUpdate()
        // setValue(value + 1)
    }

    const callbackSkip = function (LS, annotation) {
        console.log('skip', index);
        console.log(annotation);
        setCurrentIndex(index + 1)
        // forceUpdate()
    }

    const onloadAnnotation = function (LS) {
        var c = LS.annotationStore.addAnnotation({
            userGenerate: true
        });
        LS.annotationStore.selectAnnotation(c.id);
    }

    return (
        <LabelStudioReact
                config={labelinConfig}
                task={currentTask}
                interfaces={[
                    'controls',
                    'submit', 'update',
                    "edit-history",
                    'topbar',
                    'predictions:menu', 'annotations:menu',
                    // 'annotations:current', 
                    // 'side-column',
                    //  'annotations:add-new', 
                    // 'annotations:view-all', 
                    // 'annotations:delete',
                    //  'annotations:tabs',
                    //  'predictions:tabs', 
                    'instruction',
                    //  'ground-truth', 'postpone',
                    "panel",
                    // "update",
                    // "submit",
                    "skip",
                    // "controls",
                    // "review",
                    // "botbar",
                    // "annotations:tabs",
                    "annotations:current",
                    "annotations:add-new",
                    "annotations:delete",
                    // 'annotations:view-all',
                    "predictions:tabs",
                    // "topbar:prevnext",
                ]}
                user={{
                    id: 1,
                    pk: 1,
                    firstName: "Thanh",
                    lastName: "Vu"
                }}
                onSubmitAnnotation={callbackSubmit}
                onSkipTask={callbackSkip}
                onLabelStudioLoad={onloadAnnotation}
            />
        
    );*/
    return <div></div>
}

export default LabelEditor;