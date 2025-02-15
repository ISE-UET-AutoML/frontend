import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/chat`

const chat = (message, step) => {
	return instance.post(`${URL}`, {message: message, step: step})
}

export {
    chat,
}