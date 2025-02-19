import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/chat`

const chat = (message)  => {
	return instance.post(`${URL}`, {message: message})
}

const clearHistory = () => {
    return instance.post(`${URL}/clear`)
}

const getHistory = () => {
    return instance.post(`${URL}/getHistory`)
}

export {
    chat,
    clearHistory,
    getHistory
}