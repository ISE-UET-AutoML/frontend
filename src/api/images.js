import { API_URL, API_BASE_URL } from 'src/constants/api';
import instance from './axios';


const updateLabel = (imageId,oldLabelId, newLabelId) => {
    const data = {
        'imageId':imageId,
        'oldLabelId':oldLabelId,
         'newLabelId':newLabelId
    }
    return instance.post(API_URL.update_label,data);
};



export {updateLabel };
