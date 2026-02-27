// src/components/ToastContainer.tsx

export const ToastContainer = ({ notifications, onDismiss, position }) => {
    if (notifications.length === 0) {
        return null;
    }

    const getIconClass = (type) => {
        switch (type) {
            case "success":
                return "glyphicon-ok-circle";
            case "error":
                return "glyphicon-remove-circle";
            case "warning":
                return "glyphicon-warning-sign";
            default:
                return "glyphicon-info-sign";
        }
    };

    return (
        <div className={`aggrid-toast-container ${position}`}>
            {notifications.map((toast) => (
                <div key={toast.id} className={`aggrid-toast toast-${toast.type}`}>
                    <i className={`aggrid-toast-icon glyphicon ${getIconClass(toast.type)}`} />
                    <div className="aggrid-toast-content">
                        <div className="aggrid-toast-message">{toast.message}</div>
                    </div>
                    <button
                        className="aggrid-toast-close"
                        onClick={() => onDismiss(toast.id)}
                        title="Dismiss"
                    >
                        <i className="glyphicon glyphicon-remove" />
                    </button>
                </div>
            ))}
        </div>
    );
};
