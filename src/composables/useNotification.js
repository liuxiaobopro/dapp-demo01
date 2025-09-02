import { ref } from 'vue'

export function useNotification() {
    const notification = ref({
        show: false,
        message: '',
        type: 'success'
    })

    const showNotification = (message, isError = false) => {
        notification.value = {
            show: true,
            message,
            type: isError ? 'error' : 'success'
        }
    }

    const hideNotification = () => {
        notification.value.show = false
    }

    return {
        notification,
        showNotification,
        hideNotification
    }
}
