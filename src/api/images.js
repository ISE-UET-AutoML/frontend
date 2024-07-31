import { API_URL, API_BASE_URL } from 'src/constants/api';
import instance from './axios';


const updateLabel = (imageId, oldLabelId, newLabelId) => {
    // const data = {
    //     'imageId': imageId,
    //     'oldLabelId': oldLabelId,
    //     'newLabelId': newLabelId
    // }
    // console.log(data);
    var data = {}
    data['imageId'] = imageId
    data['oldLabelId'] = oldLabelId
    data['newLabelId'] = newLabelId
    const url = API_URL.update_label(imageId)
    console.log(url);
    console.log(data);
    const config_api = {
        method: "post",
        url: url,
        data: data,
    };
    return instance.get(
        url, {
        params: {
            imageId: imageId,
            oldLabelId: oldLabelId,
            newLabelId: newLabelId
        }
    }
    );

};



export { updateLabel };
