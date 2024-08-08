import { API_URL, API_BASE_URL } from 'src/constants/api';
// import instance from './axios';
import axios from 'axios';

// TODO 
// update label,
// 
const createLabels = (projectID, data) => {
    const options = {
        headers: { 'Content-Type': 'application/json' },
    };
    return axios.put(API_URL.create_label_for_dataset(projectID), data, options);
}

export { createLabels }