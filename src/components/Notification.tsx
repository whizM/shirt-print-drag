import React from 'react';

interface NotificationProps {
    message: string;
    type: 'error' | 'success' | 'warning';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const bgColor = {
        error: 'bg-red-100 border-red-400 text-red-700',
        success: 'bg-green-100 border-green-400 text-green-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700'
    }[type];

    return (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded border ${bgColor} z-50`} role="alert">
            <div className="flex items-center">
                <span className="block sm:inline mr-6">{message}</span>
                <button
                    onClick={onClose}
                    className="absolute top-0 bottom-0 right-0 px-4 py-3 bg-transparent"
                >
                    <span className="sr-only">Close</span>
                    <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Notification; 