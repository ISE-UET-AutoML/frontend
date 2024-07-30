
import { useEffect } from 'react';
import 'src/assets/css/card.css'
import './main.css'

import LabelStudioReact from './LabelStudio';

const labelinConfig = `
  <View>
    <Image name="img" value="$image"></Image>
    <RectangleLabels name="tag" toName="img">
      <Label value="Hello"></Label>
      <Label value="World"></Label>
    </RectangleLabels>
  </View>
`

const task = {
    annotations: [],
    predictions: [],
    id: 1,
    data: {
        image: "https://htx-pub.s3.us-east-1.amazonaws.com/examples/images/nick-owuor-astro-nic-visuals-wDifg5xc9Z4-unsplash.jpg"
    }
}

const Labeling = ({ images, pagination, savedLabels, next, updateFields }) => {
    useEffect(() => {
        // const script = document.createElement('script');
        // script.src = "http://127.0.0.1:8080/label-studio-frontend/main.js";
        // script.async = true;

        // document.body.appendChild(script);

        // return () => {
        //     document.body.removeChild(script);
        // }
    }, []);

    return (
       <div>
            <LabelStudioReact
                config={labelinConfig}
                task={task}
                interfaces={[
                    "panel",
                    "update",
                    "controls",
                    "side-column",
                    "annotations:menu",
                    "annotations:add-new",
                    "annotations:delete",
                    "predictions:menu"
                ]}
                user={{
                    id:1,
                    pk: 1,
                    firstName: "James",
                    lastName: "Dean"
                }}
            />

       </div>

    )
};



export default Labeling;
