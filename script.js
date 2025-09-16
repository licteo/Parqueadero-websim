// Sistema de Gestión de Parqueadero
class ParkingManager {
    constructor() {
        this.activeVehicles = JSON.parse(localStorage.getItem('activeVehicles')) || [];
        this.vehicleHistory = JSON.parse(localStorage.getItem('vehicleHistory')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderActiveVehicles();
        this.renderHistory();
    }

    bindEvents() {
        // Formulario de entrada
        document.getElementById('entryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerEntry();
        });

        // Cambios en selects
        document.getElementById('vehicleType').addEventListener('change', (e) => {
            this.handleVehicleTypeChange(e.target.value);
        });

        document.getElementById('paymentType').addEventListener('change', (e) => {
            this.handlePaymentTypeChange(e.target.value);
        });
    }

    handleVehicleTypeChange(vehicleType) {
        const busetaOptions = document.getElementById('busetaOptions');
        const pintorOptions = document.getElementById('pintorOptions');

        busetaOptions.classList.add('hidden');
        pintorOptions.classList.add('hidden');

        if (vehicleType === 'buseta') {
            busetaOptions.classList.remove('hidden');
        } else if (vehicleType === 'pintor') {
            pintorOptions.classList.remove('hidden');
        }
    }

    handlePaymentTypeChange(paymentType) {
        const monthlyPriceContainer = document.getElementById('monthlyPriceContainer');
        
        if (paymentType === 'mensual') {
            monthlyPriceContainer.classList.remove('hidden');
            document.getElementById('monthlyPrice').required = true;
        } else {
            monthlyPriceContainer.classList.add('hidden');
            document.getElementById('monthlyPrice').required = false;
        }
    }

    registerEntry() {
        const plate = document.getElementById('plate').value.toUpperCase().trim();
        const vehicleType = document.getElementById('vehicleType').value;
        const paymentType = document.getElementById('paymentType').value;
        
        // Validar si ya existe un vehículo con esa placa activo
        if (this.activeVehicles.some(v => v.plate === plate)) {
            this.showNotification('Ya existe un vehículo activo con esa placa', 'error');
            return;
        }

        const vehicle = {
            id: Date.now(),
            plate,
            vehicleType,
            paymentType,
            entryTime: new Date().toISOString(),
            company: vehicleType === 'buseta' ? document.getElementById('busetaCompany').value : null,
            pintorName: vehicleType === 'pintor' ? document.getElementById('pintorName').value : null,
            monthlyPrice: paymentType === 'mensual' ? parseFloat(document.getElementById('monthlyPrice').value) : null
        };

        this.activeVehicles.push(vehicle);
        this.saveData();
        this.renderActiveVehicles();
        this.clearForm();
        this.showNotification('Vehículo registrado exitosamente', 'success');
    }

    calculateCost(vehicle) {
        const dailyRates = {
            carro: 5000,
            moto: 2000,
            buseta: 6000,
            turbo: 8000,
            pintor: 3000
        };

        if (vehicle.paymentType === 'mensual') {
            return vehicle.monthlyPrice || 0;
        }

        // Calcular tiempo transcurrido
        const entryTime = new Date(vehicle.entryTime);
        const currentTime = new Date();
        const hours = Math.ceil((currentTime - entryTime) / (1000 * 60 * 60));
        
        // Mínimo cobrar 1 día
        const days = Math.max(1, Math.ceil(hours / 24));
        const rate = dailyRates[vehicle.vehicleType] || 3000;

        return days * rate;
    }

    exitVehicle(vehicleId) {
        const vehicle = this.activeVehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        const cost = this.calculateCost(vehicle);
        const exitTime = new Date().toISOString();

        // Mover al historial
        const historyVehicle = {
            ...vehicle,
            exitTime,
            totalCost: cost,
            paid: true
        };

        this.vehicleHistory.unshift(historyVehicle);
        this.activeVehicles = this.activeVehicles.filter(v => v.id !== vehicleId);
        
        this.saveData();
        this.renderActiveVehicles();
        this.renderHistory();
        
        this.showNotification(`Vehículo ${vehicle.plate} ha salido. Total: $${cost.toLocaleString()}`, 'success');
    }

    renderActiveVehicles() {
        const container = document.getElementById('activeVehicles');
        
        if (this.activeVehicles.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay vehículos activos</p>';
            return;
        }

        container.innerHTML = this.activeVehicles.map(vehicle => {
            const cost = this.calculateCost(vehicle);
            const entryTime = new Date(vehicle.entryTime);
            const now = new Date();
            const hours = Math.ceil((now - entryTime) / (1000 * 60 * 60));

            return `
                <div class="vehicle-card">
                    <div class="vehicle-info">
                        <div>
                            <div class="vehicle-plate">${vehicle.plate}</div>
                            <div class="vehicle-type">${this.getVehicleTypeLabel(vehicle.vehicleType)}</div>
                        </div>
                    </div>
                    <div class="vehicle-details">
                        <div class="detail-item">
                            <span class="detail-label">Entrada</span>
                            <span class="detail-value">${entryTime.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tiempo</span>
                            <span class="detail-value">${hours} horas</span>
                        </div>
                        ${vehicle.company ? `
                        <div class="detail-item">
                            <span class="detail-label">Empresa</span>
                            <span class="detail-value">${vehicle.company}</span>
                        </div>
                        ` : ''}
                        ${vehicle.pintorName ? `
                        <div class="detail-item">
                            <span class="detail-label">Pintor/Mecánico</span>
                            <span class="detail-value">${vehicle.pintorName}</span>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <span class="detail-label">Tipo de Pago</span>
                            <span class="detail-value">${vehicle.paymentType === 'mensual' ? 'Mensual' : 'Diario'}</span>
                        </div>
                    </div>
                    <div class="total-cost">Total: $${cost.toLocaleString()}</div>
                    <div class="vehicle-actions">
                        <button class="btn btn-success" onclick="parkingManager.exitVehicle(${vehicle.id})">
                            Registrar Salida
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderHistory() {
        const container = document.getElementById('historyVehicles');
        
        if (this.vehicleHistory.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay vehículos en el historial</p>';
            return;
        }

        container.innerHTML = this.vehicleHistory.slice(0, 10).map(vehicle => {
            const entryTime = new Date(vehicle.entryTime);
            const exitTime = new Date(vehicle.exitTime);
            const duration = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));

            return `
                <div class="vehicle-card">
                    <div class="vehicle-info">
                        <div>
                            <div class="vehicle-plate">${vehicle.plate}</div>
                            <div class="vehicle-type">${this.getVehicleTypeLabel(vehicle.vehicleType)}</div>
                        </div>
                    </div>
                    <div class="vehicle-details">
                        <div class="detail-item">
                            <span class="detail-label">Entrada</span>
                            <span class="detail-value">${entryTime.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Salida</span>
                            <span class="detail-value">${exitTime.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Duración</span>
                            <span class="detail-value">${duration} horas</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Costo Total</span>
                            <span class="detail-value">$${vehicle.totalCost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
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

    clearForm() {
        document.getElementById('entryForm').reset();
        document.getElementById('busetaOptions').classList.add('hidden');
        document.getElementById('pintorOptions').classList.add('hidden');
        document.getElementById('monthlyPriceContainer').classList.add('hidden');
    }

    saveData() {
        localStorage.setItem('activeVehicles', JSON.stringify(this.activeVehicles));
        localStorage.setItem('vehicleHistory', JSON.stringify(this.vehicleHistory));
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos para la notificación
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

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    printReport(type = 'all') {
        const vehicles = type === 'all' 
            ? this.vehicleHistory 
            : this.vehicleHistory.filter(v => v.vehicleType === type);

        if (vehicles.length === 0) {
            this.showNotification(`No hay vehículos ${type === 'all' ? 'en el historial' : 'de tipo ' + this.getVehicleTypeLabel(type)} para imprimir`, 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        const title = type === 'all' ? 'Todos los Vehículos' : this.getVehicleTypeLabel(type);
        const currentDate = new Date().toLocaleString('es-CO');

        const tableRows = vehicles.map(vehicle => {
            const entryTime = new Date(vehicle.entryTime);
            const exitTime = new Date(vehicle.exitTime);
            const duration = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));
            
            return `
                <tr>
                    <td>${vehicle.plate}</td>
                    <td>${this.getVehicleTypeLabel(vehicle.vehicleType)}</td>
                    <td>${vehicle.company || vehicle.pintorName || '-'}</td>
                    <td>${vehicle.paymentType === 'mensual' ? 'Mensual' : 'Diario'}</td>
                    <td>${entryTime.toLocaleString('es-CO')}</td>
                    <td>${exitTime.toLocaleString('es-CO')}</td>
                    <td>${duration}h</td>
                    <td>$${vehicle.totalCost.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de ${title}</title>
                <style>
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 20px;
                    }
                    .title {
                        color: #2563eb;
                        font-size: 24px;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        color: #666;
                        font-size: 14px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                        font-size: 12px;
                    }
                    th {
                        background-color: #2563eb;
                        color: white;
                        font-weight: 600;
                    }
                    tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    .summary {
                        margin-top: 30px;
                        padding: 20px;
                        background-color: #f3f4f6;
                        border-radius: 8px;
                    }
                    .summary-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        font-weight: 500;
                    }
                    .total {
                        font-size: 18px;
                        color: #059669;
                        border-top: 2px solid #059669;
                        padding-top: 10px;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">Reporte de ${title}</h1>
                    <p class="subtitle">Generado el ${currentDate}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>Tipo</th>
                            <th>Empresa/Pintor</th>
                            <th>Pago</th>
                            <th>Fecha Entrada</th>
                            <th>Fecha Salida</th>
                            <th>Duración</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="summary">
                    <div class="summary-item">
                        <span>Total de vehículos:</span>
                        <span>${vehicles.length}</span>
                    </div>
                    <div class="summary-item">
                        <span>Total recaudado:</span>
                        <span class="total">$${vehicles.reduce((sum, v) => sum + v.totalCost, 0).toLocaleString()}</span>
                    </div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    }

    generateMonthlyReport() {
        const monthInput = document.getElementById('monthSelect');
        const selectedMonth = monthInput.value;
        
        if (!selectedMonth) {
            this.showNotification('Por favor selecciona un mes', 'error');
            return;
        }

        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Filtrar vehículos del mes seleccionado
        const monthlyVehicles = this.vehicleHistory.filter(vehicle => {
            const entryDate = new Date(vehicle.entryTime);
            return entryDate >= startDate && entryDate <= endDate;
        });

        if (monthlyVehicles.length === 0) {
            this.showNotification('No hay vehículos registrados en este mes', 'info');
            document.getElementById('monthlyReportResults').classList.add('hidden');
            return;
        }

        // Calcular estadísticas por tipo
        const stats = {
            carro: 0,
            moto: 0,
            buseta: 0,
            turbo: 0,
            pintor: 0,
            total: monthlyVehicles.length,
            totalRevenue: 0
        };

        const pintorStats = {};

        monthlyVehicles.forEach(vehicle => {
            stats[vehicle.vehicleType]++;
            stats.totalRevenue += vehicle.totalCost;

            // Estadísticas específicas de pintores
            if (vehicle.vehicleType === 'pintor' && vehicle.pintorName) {
                pintorStats[vehicle.pintorName] = (pintorStats[vehicle.pintorName] || 0) + 1;
            }
        });

        // Mostrar resultados
        const resultsContainer = document.getElementById('monthlySummary');
        resultsContainer.innerHTML = `
            <div class="summary-card">
                <div class="summary-number">${stats.total}</div>
                <div class="summary-label">Total Vehículos</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${stats.carro}</div>
                <div class="summary-label">Carros Particulares</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${stats.moto}</div>
                <div class="summary-label">Motos</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${stats.buseta}</div>
                <div class="summary-label">Busetas</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${stats.turbo}</div>
                <div class="summary-label">Turbos</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${stats.pintor}</div>
                <div class="summary-label">Pintores/Mecánicos</div>
            </div>
            <div class="summary-card summary-card-total">
                <div class="summary-number">$${stats.totalRevenue.toLocaleString()}</div>
                <div class="summary-label">Total Recaudado</div>
            </div>
        `;

        // Mostrar estadísticas de pintores si hay
        if (Object.keys(pintorStats).length > 0) {
            const pintoresHtml = Object.entries(pintorStats)
                .sort((a, b) => b[1] - a[1])
                .map(([nombre, cantidad]) => `
                    <div class="summary-card">
                        <div class="summary-number">${cantidad}</div>
                        <div class="summary-label">${nombre}</div>
                    </div>
                `).join('');

            resultsContainer.innerHTML += `
                <div style="grid-column: 1 / -1; margin-top: 2rem;">
                    <h4 style="color: var(--primary-blue); margin-bottom: 1rem; font-size: 1.2rem;">
                        📈 Pintores/Mecánicos más frecuentes
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${pintoresHtml}
                    </div>
                </div>
            `;
        }

        // Agregar botón de impresión
        resultsContainer.innerHTML += `
            <div style="grid-column: 1 / -1; text-align: center; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="parkingManager.printMonthlyReport('${selectedMonth}')">
                    🖨️ Imprimir Reporte Mensual
                </button>
            </div>
        `;

        document.getElementById('monthlyReportResults').classList.remove('hidden');
    }

    printMonthlyReport(selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const monthlyVehicles = this.vehicleHistory.filter(vehicle => {
            const entryDate = new Date(vehicle.entryTime);
            return entryDate >= startDate && entryDate <= endDate;
        });

        const monthName = new Date(selectedMonth + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

        const printWindow = window.open('', '_blank');
        
        const tableRows = monthlyVehicles.map(vehicle => {
            const entryTime = new Date(vehicle.entryTime);
            const exitTime = new Date(vehicle.exitTime);
            const duration = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));
            const companyOrPintor = vehicle.company || vehicle.pintorName || '-';
            
            return `
                <tr>
                    <td>${vehicle.plate}</td>
                    <td>${this.getVehicleTypeLabel(vehicle.vehicleType)}</td>
                    <td>${companyOrPintor}</td>
                    <td>${vehicle.paymentType === 'mensual' ? 'Mensual' : 'Diario'}</td>
                    <td>${entryTime.toLocaleString('es-CO')}</td>
                    <td>${exitTime.toLocaleString('es-CO')}</td>
                    <td>${duration}h</td>
                    <td>$${vehicle.totalCost.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        // Calcular estadísticas
        const stats = {
            carro: 0, moto: 0, buseta: 0, turbo: 0, pintor: 0, total: monthlyVehicles.length, totalRevenue: 0
        };

        monthlyVehicles.forEach(vehicle => {
            stats[vehicle.vehicleType]++;
            stats.totalRevenue += vehicle.totalCost;
        });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte Mensual - ${monthName}</title>
                <style>
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 20px;
                    }
                    .title {
                        color: #2563eb;
                        font-size: 24px;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        color: #666;
                        font-size: 14px;
                    }
                    .summary-section {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 1rem;
                        margin: 20px 0;
                        padding: 20px;
                        background: #f9fafb;
                        border-radius: 8px;
                    }
                    .summary-item {
                        text-align: center;
                        padding: 10px;
                        background: white;
                        border-radius: 6px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .summary-number {
                        font-size: 24px;
                        font-weight: 700;
                        color: #2563eb;
                    }
                    .summary-label {
                        font-size: 12px;
                        color: #666;
                        margin-top: 4px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                        font-size: 12px;
                    }
                    th {
                        background-color: #2563eb;
                        color: white;
                        font-weight: 600;
                    }
                    tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    .total-section {
                        margin-top: 30px;
                        padding: 20px;
                        background-color: #10b981;
                        color: white;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .total-amount {
                        font-size: 28px;
                        font-weight: 700;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">Reporte Mensual</h1>
                    <p class="title">${monthName}</p>
                    <p class="subtitle">Generado el ${new Date().toLocaleString('es-CO')}</p>
                </div>

                <div class="summary-section">
                    <div class="summary-item">
                        <div class="summary-number">${stats.total}</div>
                        <div class="summary-label">Total Vehículos</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${stats.carro}</div>
                        <div class="summary-label">Carros</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${stats.moto}</div>
                        <div class="summary-label">Motos</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${stats.buseta}</div>
                        <div class="summary-label">Busetas</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${stats.turbo}</div>
                        <div class="summary-label">Turbos</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${stats.pintor}</div>
                        <div class="summary-label">Pintores</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>Tipo</th>
                            <th>Empresa/Pintor</th>
                            <th>Pago</th>
                            <th>Fecha Entrada</th>
                            <th>Fecha Salida</th>
                            <th>Duración</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-amount">Total Recaudado: $${stats.totalRevenue.toLocaleString()}</div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    }
}

// Inicializar la aplicación
const parkingManager = new ParkingManager();

// Agregar animaciones CSS dinámicamente
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