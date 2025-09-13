// script.js - Main application entry point (refactored)
// This file now serves as the main coordinator that imports and initializes all modules

// Import all modules using dynamic imports or include them via script tags
// For now, we'll use a simple module loader pattern

(function() {
    'use strict';

    // Module loader pattern for browser compatibility
    window.ParkingSystem = window.ParkingSystem || {};

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Add notification styles
            addNotificationStyles();

            // Create global parking manager
            window.parkingManager = new ParkingManager();
            window.parkingManager.init();

            console.log('✅ Sistema de Parqueadero iniciado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            alert('Error al inicializar la aplicación: ' + error.message);
        }
    });

    // Helper function to add notification styles
    function addNotificationStyles() {
        var style = document.createElement('style');
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

    // removed function StorageService() {}
    // removed function CalculatorService() {}
    // removed function NotificationService() {}
    // removed function VehicleService() {}
    // removed function VehicleRenderer() {}
    // removed function FormHandler() {}
    // removed function PrintService() {}
    // removed function MonthlyReportService() {}
    // removed function ParkingManager() {}

})();