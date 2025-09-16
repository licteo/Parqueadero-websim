// NotificationService.js - Handles user notifications
export class NotificationService {
    show(message, type = 'info') {
        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease-out',
            background: type === 'error' ? 'var(--error)' : 'var(--success)'
        });

        return notification;
    }
}

