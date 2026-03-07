import { toast } from 'react-hot-toast';

/**
 * Enhanced toast utility to ensure only ONE toast is visible at a time.
 * Every call overwrites the previous toast using a fixed global ID.
 */
const showToast = {
    success: (msg, options = {}) => {
        return toast.success(msg, {
            id: 'global-singleton-toast',
            ...options
        });
    },
    error: (msg, options = {}) => {
        return toast.error(msg, {
            id: 'global-singleton-toast',
            ...options
        });
    },
    loading: (msg, options = {}) => {
        return toast.loading(msg, {
            id: 'global-singleton-toast',
            ...options
        });
    },
    dismiss: (id) => toast.dismiss(id || 'global-singleton-toast')
};

export default showToast;
