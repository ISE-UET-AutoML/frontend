import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const chat = (message) => {
	return instance.post(API_URL.chatbot(), {message: message})
}

export {
    chat,
}