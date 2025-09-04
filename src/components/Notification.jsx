// Notification.jsx
import { toast } from 'sonner';

export const notifyEvent = (message, type = 'info') => {
    switch (type) {
        case 'success':
            toast.success(message);
            break;
        case 'error':
            toast.error(message);
            break;
        case 'info':
        default:
            toast(message);
    }
};
