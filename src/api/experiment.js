import { API_BASE_URL } from 'src/constants/api';
import instance from './axios';

const getTrainingHistory = (experimentName) => {
	return instance.get(
		`${API_BASE_URL}/experiments/train-history?experiment_name=${experimentName}`
	);
};

export { getTrainingHistory };
