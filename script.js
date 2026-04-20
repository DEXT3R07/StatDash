// Global chart instances
let barChartInstance = null;
let pieChartInstance = null;

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'manual') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('manual-tab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('upload-tab').classList.add('active');
    }
}

// Add new input row
function addRow() {
    const container = document.getElementById('input-rows');
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
        <input type="text" placeholder="Category name" class="category-input">
        <input type="number" placeholder="Value" class="value-input">
        <button class="remove-btn" onclick="removeRow(this)">×</button>
    `;
    container.appendChild(row);
}

// Remove input row
function removeRow(btn) {
    const rows = document.querySelectorAll('.input-row');
    if (rows.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('Keep at least one row!');
    }
}

// Collect data from inputs
function collectData() {
    const rows = document.querySelectorAll('.input-row');
    const data = [];
    
    rows.forEach(row => {
        const category = row.querySelector('.category-input').value.trim();
        const value = parseFloat(row.querySelector('.value-input').value);
        
        if (category && !isNaN(value) && value >= 0) {
            data.push({ category, value });
        }
    });
    
    return data;
}

// Calculate statistics
function calculateStats(data) {
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const topCategory = data.reduce((prev, current) => 
        prev.value > current.value ? prev : current
    );
    
    return { total, avg, max, min, topCategory };
}

// Update statistics display
function updateStats(stats) {
    if (!stats) {
        document.getElementById('statTotal').textContent = '-';
        document.getElementById('statAvg').textContent = '-';
        document.getElementById('statMax').textContent = '-';
        document.getElementById('statMin').textContent = '-';
        document.getElementById('statTop').textContent = '-';
        return;
    }
    
    document.getElementById('statTotal').textContent = stats.total.toLocaleString();
    document.getElementById('statAvg').textContent = stats.avg.toFixed(2);
    document.getElementById('statMax').textContent = stats.max.toLocaleString();
    document.getElementById('statMin').textContent = stats.min.toLocaleString();
    document.getElementById('statTop').textContent = `${stats.topCategory.category} (${stats.topCategory.value})`;
}

// Generate colors for charts
function generateColors(count) {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', 
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#30cfd0', '#330867'
    ];
    return colors.slice(0, count);
}

// Create or update charts
function createCharts(data) {
    if (data.length === 0) {
        alert('Please enter valid data first!');
        return;
    }
    
    const labels = data.map(d => d.category);
    const values = data.map(d => d.value);
    const colors = generateColors(data.length);
    
    // Destroy existing charts
    if (barChartInstance) barChartInstance.destroy();
    if (pieChartInstance) pieChartInstance.destroy();
    
    // Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Values',
                data: values,
                backgroundColor: colors,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Pie Chart
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChartInstance = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
    
    // Update stats
    const stats = calculateStats(data);
    updateStats(stats);
}

// Main generate function
function generateCharts() {
    const data = collectData();
    if (data.length === 0) {
        alert('Please enter at least one valid data entry!');
        return;
    }
    createCharts(data);
}

// Handle CSV upload
function processUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file first!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

// Parse CSV data
function parseCSV(text) {
    const lines = text.split(/\r\n|\n/);
    const data = [];
    
    lines.forEach(line => {
        if (line.trim()) {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const category = parts[0].trim();
                const value = parseFloat(parts[1]);
                if (category && !isNaN(value)) {
                    data.push({ category, value });
                }
            }
        }
    });
    
    if (data.length > 0) {
        // Populate manual input with CSV data
        const container = document.getElementById('input-rows');
        container.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('div');
            row.className = 'input-row';
            row.innerHTML = `
                <input type="text" value="${item.category}" class="category-input">
                <input type="number" value="${item.value}" class="value-input">
                <button class="remove-btn" onclick="removeRow(this)">×</button>
            `;
            container.appendChild(row);
        });
        
        // Switch to manual tab and generate
        switchTab('manual');
        createCharts(data);
        alert(`Loaded ${data.length} entries from CSV!`);
    } else {
        alert('No valid data found in CSV!');
    }
}

// Reset everything
function resetAll() {
    // Clear inputs
    const container = document.getElementById('input-rows');
    container.innerHTML = `
        <div class="input-row">
            <input type="text" placeholder="e.g., Rent" class="category-input">
            <input type="number" placeholder="e.g., 1200" class="value-input">
            <button class="remove-btn" onclick="removeRow(this)">×</button>
        </div>
    `;
    
    // Clear charts
    if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
    }
    if (pieChartInstance) {
        pieChartInstance.destroy();
        pieChartInstance = null;
    }
    
    // Clear stats
    updateStats(null);
    
    // Clear file input
    document.getElementById('csvFile').value = '';
}

// File drop handling
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.querySelector('.drop-zone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#667eea';
        dropZone.style.background = '#f0f4ff';
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ddd';
        dropZone.style.background = '#fafafa';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        dropZone.style.background = '#fafafa';
        
        const files = e.dataTransfer.files;
        if (files.length) {
            document.getElementById('csvFile').files = files;
            dropZone.querySelector('p').textContent = `Selected: ${files[0].name}`;
        }
    });
    
    // File selection change
    document.getElementById('csvFile').addEventListener('change', function() {
        if (this.files.length) {
            dropZone.querySelector('p').textContent = `Selected: ${this.files[0].name}`;
        }
    });
});