// Lấy email từ localStorage
export const getEmailFromStorage = () => {
    try {
        const email = localStorage.getItem('email');
        if (!email) {
            console.log('No email found in localStorage');
            return null;
        }
        console.log('Email retrieved from localStorage:', email);
        return email;
    } catch (error) {
        console.error('Error getting email from localStorage:', error);
        return null;
    }
}; 