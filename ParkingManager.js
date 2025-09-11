// ParkingManager.js - Main business logic coordinator
import { VehicleService } from './VehicleService.js';
import { CalculatorService } from './CalculatorService.js';
import { FormHandler } from './FormHandler.js';
import { VehicleRenderer } from './VehicleRenderer.js';

export class ParkingManager {
    constructor(storageService, notificationService, printService, monthlyReportService) {
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.printService = printService;
        this.monthlyReportService = monthlyReportService;
        
        this.activeVehicles = this.storageService.getActiveVehicles();
        this.vehicleHistory = this.storageService.getVehicleHistory();
        
        this.vehicleService = new VehicleService();
        this.calculatorService = new CalculatorService();
        this.formHandler = new FormHandler(this);
        this.vehicleRenderer = new VehicleRenderer(this.calculatorService);
        
        this.init();
    }

    init() {
        this.formHandler.bindEvents();
        this.renderActiveVehicles();
        this.renderHistory();
    }

    registerEntry() {
        const vehicleData = this.formHandler.getFormData();
        
        if (this.vehicleService.vehicleExists(this.activeVehicles, vehicleData.plate)) {
            this.notificationService.show('Ya existe un vehículo activo con esa placa', 'error');
            return;
        }

        const vehicle = this.vehicleService.createVehicle(vehicleData);
        this.activeVehicles.push(vehicle);
        this.saveData();
        this.renderActiveVehicles();
        this.formHandler.clearForm();
        this.notificationService.show('Vehículo registrado exitosamente', 'success');
    }

    exitVehicle(vehicleId) {
        const vehicle = this.vehicleService.findVehicle(this.activeVehicles, vehicleId);
        if (!vehicle) return;

        const cost = this.calculatorService.calculateCost(vehicle);
        const updatedVehicle = this.vehicleService.moveToHistory(vehicle, cost);
        
        this.vehicleHistory.unshift(updatedVehicle);
        this.activeVehicles = this.activeVehicles.filter(v => v.id !== vehicleId);
        
        this.saveData();
        this.renderActiveVehicles();
        this.renderHistory();
        
        this.notificationService.show(`Vehículo ${vehicle.plate} ha salido. Total: $${cost.toLocaleString()}`, 'success');
    }

    renderActiveVehicles() {
        this.vehicleRenderer.renderActiveVehicles(this.activeVehicles, 'activeVehicles');
    }

    renderHistory() {
        this.vehicleRenderer.renderHistory(this.vehicleHistory, 'historyVehicles');
    }

    saveData() {
        this.storageService.saveActiveVehicles(this.activeVehicles);
        this.storageService.saveVehicleHistory(this.vehicleHistory);
    }

    printReport(type = 'all') {
        this.printService.printReport(type, this.vehicleHistory);
    }

    generateMonthlyReport() {
        this.monthlyReportService.generateReport(this.vehicleHistory);
    }

    handleVehicleTypeChange(vehicleType) {
        this.formHandler.handleVehicleTypeChange(vehicleType);
    }

    handlePaymentTypeChange(paymentType) {
        this.formHandler.handlePaymentTypeChange(paymentType);
    }

    getVehicleTypeLabel(type) {
        return this.vehicleService.getVehicleTypeLabel(type);
    }
}