// Main entry point - imports and initializes the application
import { ParkingManager } from './modules/ParkingManager.js';
import { StorageService } from './modules/StorageService.js';
import { NotificationService } from './modules/NotificationService.js';
import { PrintService } from './modules/PrintService.js';
import { MonthlyReportService } from './modules/MonthlyReportService.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Make parkingManager globally available for HTML onclick handlers
    window.parkingManager = parkingManager;
    
    // Add dynamic styles for notifications
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
    `;
    document.head.appendChild(style);
});