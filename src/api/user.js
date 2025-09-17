import axios from 'src/api/axios';
import { API_URL } from 'src/constants/api';

export const getMe = () => axios.get(API_URL.me);


