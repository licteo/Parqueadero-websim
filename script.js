// Main entry point - imports and system initialization
import { ParkingManager } from './modules/ParkingManager.js';
import { StorageService } from './modules/StorageService.js';
import { NotificationService } from './modules/NotificationService.js';
import { PrintService } from './modules/PrintService.js';
import { MonthlyReportService } from './modules/MonthlyReportService.js';

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    try {
        const storageService = new StorageService();
        const notificationService = new NotificationService();
        const printService = new PrintService();
        const monthlyReportService = new MonthlyReportService(storageService);
        
        const parkingManager = new ParkingManager(
            storageService,
            notificationService,
            printService,
            monthlyReportService
        );
        
        window.parkingManager = parkingManager;
        
        // Add notification styles
        addNotificationStyles();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error al inicializar la aplicación');
    }
}

function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        }
        .notification-error {
            background: #ef4444;
        }
        .notification-success {
            background: #10b981;
        }
        .notification-info {
            background: #3b82f6;
        }
    `;
    document.head.appendChild(style);
}

// Global functions for HTML onclick handlers
window.printReport = function(type) {
    if (window.parkingManager) {
        window.parkingManager.printReport(type);
    }
};

window.generateMonthlyReport = function() {
    if (window.parkingManager) {
        window.parkingManager.generateMonthlyReport();
    }
};

window.printMonthlyReport = function(month) {
    if (window.parkingManager) {
        window.parkingManager.printMonthlyReport(month);
    }
};