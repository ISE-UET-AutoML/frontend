
import { useEffect } from 'react';
import 'src/assets/css/card.css'

import LabelStudioReact from './LabelStudio';

const labelinConfig =
    `
<View>
  <Image name="image" value="$image"/>
  <Choices name="choice" toName="image">
    <Choice value="Adult content"/>
    <Choice value="Weapons" />
    <Choice value="Violence" />
  </Choices>
</View>
`

const task = {
    id: 1,
    annotations: [],
    data: {
        image: "https://htx-pub.s3.us-east-1.amazonaws.com/examples/images/nick-owuor-astro-nic-visuals-wDifg5xc9Z4-unsplash.jpg"
    }
}

const Labeling = ({ images, pagination, savedLabels, next, updateFields }) => {

    const callbacko = async function (LS, annotation) {
        console.log('update/submit anotion');
        console.log(annotation.serializeAnnotation());
        console.log(LS.annotationStore.selected);
    }

    const onloadAnnotation = function (LS) {
        var c = LS.annotationStore.addAnnotation({
            userGenerate: true
        });
        LS.annotationStore.selectAnnotation(c.id);
    }
    const onSelectAnnotation = function (annotations, prevAnnotations, payload, payloadViewAll) {
        console.log("on selected");
        console.log(annotations);
        console.log(prevAnnotations);
    }
    return (
        <LabelStudioReact
            config={labelinConfig}
            task={task}
            interfaces={[
                'basic', 'controls', 'submit', 'update', 'predictions', 'topbar',
                'predictions:menu', 'annotations:menu', 
                'annotations:current', 'side-column', 'annotations:add-new', 
                'annotations:view-all', 'annotations:delete', 'annotations:tabs',
                 'predictions:tabs', 'instruction', 'ground-truth', 'postpone',
                "panel",
                "update",
                "submit",
                "skip",
                "controls",
                "review",
                "botbar",
                "annotations:tabs",
                "annotations:current",
                "annotations:add-new",
                "annotations:delete",
                'annotations:view-all',
                "predictions:tabs",
                "topbar:prevnext",
            ]}
            user={{
                id: 1,
                pk: 1,
                firstName: "James",
                lastName: "Dean"
            }}
            onSubmitAnnotation={callbacko}
            onLabelStudioLoad={onloadAnnotation}
            onSelectAnnotation={onSelectAnnotation}
        />
    )
};
export default Labeling;
