// VehicleService.js - Handles vehicle operations
export class VehicleService {
    createVehicle(vehicleData) {
        return {
            id: Date.now(),
            plate: vehicleData.plate,
            vehicleType: vehicleData.vehicleType,
            paymentType: vehicleData.paymentType,
            entryTime: new Date().toISOString(),
            company: vehicleData.company || null,
            pintorName: vehicleData.pintorName || null,
            monthlyPrice: vehicleData.monthlyPrice || null,
            personName: vehicleData.personName || null,
            paymentAmount: vehicleData.paymentAmount || null
        };
    }

    vehicleExists(vehicles, plate) {
        return vehicles.some(v => v.plate === plate);
    }

    findVehicle(vehicles, vehicleId) {
        return vehicles.find(v => v.id === vehicleId);
    }

    moveToHistory(vehicle, cost) {
        return {
            ...vehicle,
            exitTime: new Date().toISOString(),
            totalCost: cost,
            paid: true
        };
    }

    getVehicleTypeLabel(type) {
        const labels = {
            carro: 'Carro particular',
            moto: 'Moto',
            buseta: 'Buseta',
            turbo: 'Turbo',
            pintor: 'Pintor/Mecánico'
        };
        return labels[type] || type;
    }
}