// Smart Health Recommendation System - JavaScript

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let theme = localStorage.getItem('theme') || 'light';
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set initial theme
    applyTheme(theme);
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for logged in user
    checkAuthStatus();
    
    // Initialize demo data
    initializeDemoData();
    
    // Setup admin-specific functionality
    setupPatientSearch();
    setupAppointmentFilter();
    
    console.log('Smart Health System initialized');
}

// ===== THEME MANAGEMENT =====
function applyTheme(themeName) {
    if (themeName === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', themeName);
    
    // Update theme icon
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = themeName === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    theme = newTheme;
    applyTheme(newTheme);
}

// ===== PASSWORD TOGGLE =====
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = passwordInput.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ===== AUTHENTICATION =====
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    // Hide login button, show user info and logout
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const adminOnly = document.querySelectorAll('.admin-only');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'flex';
    if (userName) userName.textContent = currentUser.name;
    
    // Show admin section for admin users
    if (currentUser.role === 'admin') {
        adminOnly.forEach(el => el.style.display = 'block');
    }
    
    // Show dashboard
    showSection('dashboard');
}

function login(email, password, role = 'patient') {
    // Simulate authentication
    if (role === 'admin') {
        // Admin credentials
        if (email === 'charan' && password === '1234') {
            currentUser = {
                id: 'admin',
                name: 'Charan Admin',
                email: 'charan@healthsystem.com',
                role: 'admin'
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            showNotification('Admin login successful!', 'success');
            return true;
        }
    } else {
        // Patient login
        const patient = patients.find(p => p.email === email && p.password === password);
        if (patient) {
            currentUser = {
                id: patient.id,
                name: `${patient.firstName} ${patient.lastName}`,
                email: patient.email,
                role: 'patient',
                data: patient
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            showNotification('Login successful!', 'success');
            return true;
        }
    }
    
    showNotification('Invalid credentials', 'error');
    return false;
}

function register(patientData) {
    // Validate passwords match
    if (patientData.password !== patientData.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    // Check if email already exists
    if (patients.find(p => p.email === patientData.email)) {
        showNotification('Email already registered', 'error');
        return false;
    }
    
    // Create new patient
    const newPatient = {
        id: Date.now().toString(),
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        dob: patientData.dob,
        password: patientData.password,
        createdAt: new Date().toISOString(),
        healthData: {
            heartRate: 72,
            bmi: 24.5,
            bloodPressure: '120/80',
            temperature: 98.6
        }
    };
    
    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients));
    
    showNotification('Registration successful! Please login.', 'success');
    closeModal('register-modal');
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Update UI
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const adminOnly = document.querySelectorAll('.admin-only');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    adminOnly.forEach(el => el.style.display = 'none');
    
    // Show login section
    showSection('login-section');
    showNotification('Logged out successfully', 'info');
}

// ===== SECTION MANAGEMENT =====
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Load section-specific data
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'symptoms':
            loadSymptoms();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'admin':
            loadAdminData();
            break;
    }
}

// ===== DASHBOARD FUNCTIONS =====
function loadDashboard() {
    if (!currentUser || currentUser.role !== 'patient') return;
    
    // Load patient health data
    loadPatientHealthData();
    
    // Load recent activities
    loadRecentActivities();
    
    // Load todo tasks
    loadTodoTasks();
    
    // Load personalized recommendations
    loadPersonalizedRecommendations();
    
    // Perform health analysis
    performHealthAnalysis();
}

function loadPatientHealthData() {
    // Get patient's health data or use defaults
    const patientData = currentUser.data?.healthData || {};
    
    // Update health metrics
    updateHealthMetrics({
        heartRate: patientData.heartRate || 72,
        bmi: patientData.bmi || 24.5,
        bloodPressure: patientData.bloodPressure || '120/80',
        temperature: patientData.temperature || 98.6
    });
}

function updateHealthMetrics(healthData) {
    // Update heart rate
    const hrValue = document.getElementById('hr-value');
    const hrStatus = document.getElementById('hr-status');
    if (hrValue) hrValue.innerHTML = `${healthData.heartRate} <span>bpm</span>`;
    if (hrStatus) {
        const hrStatusText = getHeartRateStatus(healthData.heartRate);
        hrStatus.textContent = hrStatusText.text;
        hrStatus.className = `metric-status ${hrStatusText.class}`;
    }
    
    // Update BMI
    const bmiValue = document.getElementById('bmi-value');
    const bmiStatus = document.getElementById('bmi-status');
    if (bmiValue) bmiValue.textContent = healthData.bmi;
    if (bmiStatus) {
        const bmiStatusText = getBMIStatus(healthData.bmi);
        bmiStatus.textContent = bmiStatusText.text;
        bmiStatus.className = `metric-status ${bmiStatusText.class}`;
    }
    
    // Update blood pressure
    const bpValue = document.getElementById('bp-value');
    const bpStatus = document.getElementById('bp-status');
    if (bpValue) bpValue.textContent = healthData.bloodPressure;
    if (bpStatus) {
        const bpStatusText = getBloodPressureStatus(healthData.bloodPressure);
        bpStatus.textContent = bpStatusText.text;
        bpStatus.className = `metric-status ${bpStatusText.class}`;
    }
    
    // Update temperature
    const tempValue = document.getElementById('temp-value');
    const tempStatus = document.getElementById('temp-status');
    if (tempValue) tempValue.innerHTML = `${healthData.temperature}°F`;
    if (tempStatus) {
        const tempStatusText = getTemperatureStatus(healthData.temperature);
        tempStatus.textContent = tempStatusText.text;
        tempStatus.className = `metric-status ${tempStatusText.class}`;
    }
}

function getHeartRateStatus(hr) {
    if (hr < 60) return { text: 'Low', class: 'warning' };
    if (hr > 75) {
        // Trigger heart rate alert for values above 75
        if (currentUser && currentUser.role === 'patient') {
            setTimeout(() => {
                generateHeartRateAlert(hr, currentUser.data?.healthData || {});
            }, 1000);
        }
        return { text: 'High', class: 'danger' };
    }
    return { text: 'Normal', class: 'normal' };
}

function getBMIStatus(bmi) {
    if (bmi < 18.5) return { text: 'Underweight', class: 'warning' };
    if (bmi > 25) return { text: 'Overweight', class: 'warning' };
    if (bmi > 30) return { text: 'Obese', class: 'danger' };
    return { text: 'Healthy', class: 'normal' };
}

function getBloodPressureStatus(bp) {
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic > 140 || diastolic > 90) return { text: 'High', class: 'danger' };
    if (systolic > 120 || diastolic > 80) return { text: 'Elevated', class: 'warning' };
    return { text: 'Normal', class: 'normal' };
}

function getTemperatureStatus(temp) {
    if (temp < 97) return { text: 'Low', class: 'warning' };
    if (temp > 99.5) return { text: 'Fever', class: 'danger' };
    return { text: 'Normal', class: 'normal' };
}

function performHealthAnalysis() {
    const patientData = currentUser.data?.healthData || {};
    const healthScore = calculateHealthScore(patientData);
    
    // Update health score
    const scoreElement = document.getElementById('health-score');
    if (scoreElement) scoreElement.textContent = healthScore;
    
    // Generate analysis items
    const analysisItems = generateAnalysisItems(patientData);
    updateAnalysisDetails(analysisItems);
}

function calculateHealthScore(healthData) {
    let score = 100;
    
    // Heart rate scoring
    const hr = healthData.heartRate || 72;
    if (hr < 60 || hr > 75) score -= 15; // Changed threshold from 100 to 75
    
    // BMI scoring
    const bmi = healthData.bmi || 24.5;
    if (bmi < 18.5 || bmi > 25) score -= 15;
    if (bmi > 30) score -= 10;
    
    // Blood pressure scoring
    const bp = healthData.bloodPressure || '120/80';
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic > 140 || diastolic > 90) score -= 20;
    if (systolic > 120 || diastolic > 80) score -= 10;
    
    // Temperature scoring
    const temp = healthData.temperature || 98.6;
    if (temp > 99.5 || temp < 97) score -= 10;
    
    return Math.max(0, Math.min(100, score));
}

function generateAnalysisItems(healthData) {
    const items = [];
    
    // Heart rate analysis
    const hr = healthData.heartRate || 72;
    if (hr >= 60 && hr <= 75) {
        items.push({
            icon: 'fas fa-check-circle text-success',
            text: 'Heart rate is within normal range'
        });
    } else if (hr > 75) {
        items.push({
            icon: 'fas fa-exclamation-triangle text-danger',
            text: `Heart rate high (${hr} BPM) - immediate attention needed`
        });
    } else {
        items.push({
            icon: 'fas fa-exclamation-triangle text-warning',
            text: `Heart rate low (${hr} BPM) - consult doctor`
        });
    }
    
    // BMI analysis
    const bmi = healthData.bmi || 24.5;
    if (bmi >= 18.5 && bmi <= 25) {
        items.push({
            icon: 'fas fa-check-circle text-success',
            text: 'BMI indicates healthy weight'
        });
    } else {
        items.push({
            icon: 'fas fa-exclamation-triangle text-warning',
            text: `BMI ${bmi < 18.5 ? 'low' : 'high'} - consider diet changes`
        });
    }
    
    // Blood pressure analysis
    const bp = healthData.bloodPressure || '120/80';
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic <= 120 && diastolic <= 80) {
        items.push({
            icon: 'fas fa-check-circle text-success',
            text: 'Blood pressure is normal'
        });
    } else {
        items.push({
            icon: 'fas fa-exclamation-triangle text-warning',
            text: 'Blood pressure elevated - monitor regularly'
        });
    }
    
    // General recommendations
    items.push({
        icon: 'fas fa-info-circle text-info',
        text: 'Consider increasing physical activity'
    });
    
    return items;
}

function updateAnalysisDetails(items) {
    const analysisDetails = document.querySelector('.analysis-details');
    if (!analysisDetails) return;
    
    analysisDetails.innerHTML = items.map(item => `
        <div class="analysis-item">
            <i class="${item.icon}"></i>
            <span>${item.text}</span>
        </div>
    `).join('');
}

function loadRecentActivities() {
    // Get patient activities or create default ones
    const activities = currentUser.data?.activities || getDefaultActivities();
    
    const activitiesList = document.getElementById('recent-activities-list');
    if (!activitiesList) return;
    
    activitiesList.innerHTML = activities.map((activity, index) => `
        <div class="activity-item" data-activity-index="${index}">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
            <div class="activity-actions">
                <button class="activity-delete-btn" onclick="deleteActivity(${index})" title="Delete activity">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteActivity(index) {
    if (!currentUser || currentUser.role !== 'patient') return;
    
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    // Remove activity from array
    if (patient.activities && patient.activities[index]) {
        patient.activities.splice(index, 1);
        
        // Update storage
        localStorage.setItem('patients', JSON.stringify(patients));
        currentUser.data = patient;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Refresh activities display
        loadRecentActivities();
        
        showNotification('Activity deleted successfully', 'success');
    }
}

function deleteAllActivities() {
    if (!currentUser || currentUser.role !== 'patient') return;
    
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    // Clear all activities
    patient.activities = [];
    
    // Update storage
    localStorage.setItem('patients', JSON.stringify(patients));
    currentUser.data = patient;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Refresh activities display
    loadRecentActivities();
    
    showNotification('All activities deleted successfully', 'success');
}

// ===== TODO LIST FUNCTIONS =====
let todoTasks = [];

function loadTodoTasks() {
    // Load tasks from localStorage or create empty array
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
        todoTasks = JSON.parse(savedTasks);
    }
    renderTodoList();
}

function renderTodoList() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    if (todoTasks.length === 0) {
        todoList.innerHTML = '<div class="todo-empty">No health tasks yet. Add your first task above!</div>';
        return;
    }
    
    todoList.innerHTML = todoTasks.map((task, index) => `
        <div class="todo-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="todo-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onchange="toggleTodoTask(${index})">
            <span class="todo-text">${task.text}</span>
            <div class="todo-actions">
                <button class="todo-delete-btn" onclick="deleteTodoTask(${index})" title="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addTodoTask() {
    const input = document.getElementById('todo-input');
    const taskText = input.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todoTasks.unshift(newTask);
    saveTodoTasks();
    renderTodoList();
    
    // Clear input
    input.value = '';
    
    showNotification('Task added successfully!', 'success');
}

function toggleTodoTask(index) {
    todoTasks[index].completed = !todoTasks[index].completed;
    saveTodoTasks();
    renderTodoList();
}

function deleteTodoTask(index) {
    todoTasks.splice(index, 1);
    saveTodoTasks();
    renderTodoList();
    
    showNotification('Task deleted successfully', 'success');
}

function saveTodoTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(todoTasks));
}

function getDefaultActivities() {
    return [
        {
            icon: 'fas fa-heartbeat',
            title: 'Daily Health Check',
            description: 'Recorded vital signs and health metrics',
            time: '2 hours ago'
        },
        {
            icon: 'fas fa-pills',
            title: 'Medication Taken',
            description: 'Vitamin D supplement - 1 tablet',
            time: '5 hours ago'
        },
        {
            icon: 'fas fa-running',
            title: 'Exercise Completed',
            description: '30 minutes morning walk',
            time: '8 hours ago'
        },
        {
            icon: 'fas fa-apple-alt',
            title: 'Meal Logged',
            description: 'Healthy breakfast - 450 calories',
            time: '12 hours ago'
        }
    ];
}

function loadPersonalizedRecommendations() {
    const patientData = currentUser.data?.healthData || {};
    const recommendations = generatePersonalizedRecommendations(patientData);
    
    const recommendationsList = document.getElementById('personalized-recommendations');
    if (!recommendationsList) return;
    
    recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card priority-${rec.priority}">
            <div class="recommendation-icon">
                <i class="${rec.icon}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <button class="btn ${rec.priority === 'high' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="${rec.action}">
                    ${rec.buttonText}
                </button>
            </div>
        </div>
    `).join('');
}

function generatePersonalizedRecommendations(healthData) {
    const recommendations = [];
    
    // High priority recommendations
    if (healthData.bloodPressure) {
        const [systolic, diastolic] = healthData.bloodPressure.split('/').map(Number);
        if (systolic > 140 || diastolic > 90) {
            recommendations.push({
                priority: 'high',
                icon: 'fas fa-exclamation-triangle',
                title: 'High Blood Pressure Detected',
                description: 'Your blood pressure is elevated. Schedule an appointment with your doctor.',
                buttonText: 'Schedule Now',
                action: "scheduleDoctorAppointment()"
            });
        }
    }
    
    // Medium priority recommendations
    const bmi = healthData.bmi || 24.5;
    if (bmi > 25) {
        recommendations.push({
            priority: 'medium',
            icon: 'fas fa-dumbbell',
            title: 'Weight Management',
            description: 'Your BMI is elevated. Consider increasing physical activity and monitoring diet.',
            buttonText: 'View Exercise Plan',
            action: "viewExercisePlan()"
        });
    }
    
    // Low priority recommendations
    recommendations.push({
        priority: 'low',
        icon: 'fas fa-glass-water',
        title: 'Stay Hydrated',
        description: 'Aim for 8 glasses of water daily for optimal health and energy.',
        buttonText: 'Set Reminder',
        action: "setHydrationReminder()"
    });
    
    return recommendations;
}

// ===== HEALTH CHECK FUNCTIONS =====
function toggleHealthCheck() {
    const form = document.getElementById('health-check-form');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

function saveDailyHealthCheck(healthData) {
    if (!currentUser || currentUser.role !== 'patient') {
        showNotification('Please login to save health data', 'error');
        return;
    }
    
    // Update patient's health data
    const patient = patients.find(p => p.id === currentUser.id);
    if (patient) {
        patient.healthData = {
            ...patient.healthData,
            ...healthData,
            lastUpdated: new Date().toISOString()
        };
        
        // Calculate health score
        const healthScore = calculateHealthScore(patient.healthData);
        
        // Add to activities
        const activity = {
            icon: 'fas fa-heartbeat',
            title: 'Daily Health Check',
            description: `Recorded vital signs - HR: ${healthData.heartRate}, BP: ${healthData.bloodPressure}`,
            time: 'Just now'
        };
        
        if (!patient.activities) patient.activities = [];
        patient.activities.unshift(activity);
        
        // Update current user data
        currentUser.data = patient;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('patients', JSON.stringify(patients));
        
        // Check health score and provide recommendations if below 80
        if (healthScore < 80) {
            generateHealthRecommendations(healthScore, patient.healthData);
        }
        
        // Check heart rate and provide alert if above 75
        if (healthData.heartRate && healthData.heartRate > 75) {
            generateHeartRateAlert(healthData.heartRate, patient.healthData);
        }
        
        // Refresh dashboard
        loadDashboard();
        
        showNotification('Health check saved successfully!', 'success');
        
        // Hide form
        toggleHealthCheck();
        
        // Reset form
        document.getElementById('daily-health-form').reset();
    }
}

function generateHeartRateAlert(heartRate, healthData) {
    // Exercise recommendations for high heart rate
    const exerciseRecommendations = [
        {
            name: "Deep Breathing Exercises",
            duration: "5-10 minutes",
            frequency: "Multiple times daily",
            benefit: "Helps lower heart rate and reduce stress"
        },
        {
            name: "Meditation",
            duration: "15 minutes",
            frequency: "Daily",
            benefit: "Calms nervous system and regulates heart rate"
        },
        {
            name: "Gentle Walking",
            duration: "20 minutes",
            frequency: "Daily",
            benefit: "Light cardio to improve heart health"
        },
        {
            name: "Yoga",
            duration: "20 minutes",
            frequency: "3 times per week",
            benefit: "Reduces stress and improves heart rate variability"
        },
        {
            name: "Swimming",
            duration: "30 minutes",
            frequency: "2-3 times per week",
            benefit: "Low-impact exercise for cardiovascular health"
        }
    ];
    
    // Medication/tablet recommendations for high heart rate
    const medicationRecommendations = [
        {
            name: "Beta-Blockers",
            purpose: "Lower heart rate and blood pressure",
            timing: "As prescribed by doctor",
            caution: "Prescription only - consult cardiologist"
        },
        {
            name: "Calcium Channel Blockers",
            purpose: "Relax blood vessels and lower heart rate",
            timing: "As prescribed by doctor",
            caution: "Requires medical supervision"
        },
        {
            name: "Magnesium Supplements",
            purpose: "Support heart rhythm and rate regulation",
            timing: "Daily with evening meal",
            caution: "Check with doctor first if on medications"
        },
        {
            name: "Omega-3 Fatty Acids",
            purpose: "Support overall heart health",
            timing: "Daily with food",
            caution: "May interact with blood thinners"
        },
        {
            name: "Coenzyme Q10",
            purpose: "Support heart function and energy",
            timing: "Daily with meal containing fat",
            caution: "Consult doctor if on heart medications"
        }
    ];
    
    // Create modal with heart rate alert
    const modalHtml = `
        <div id="heart-rate-alert-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-heartbeat text-danger"></i> High Heart Rate Alert: ${heartRate} BPM</h3>
                    <button class="close-btn" onclick="closeModal('heart-rate-alert-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="health-alert">
                        <p><strong>Your heart rate is above the normal range (75+ BPM). Here are recommendations to help manage your heart rate:</strong></p>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4><i class="fas fa-running text-primary"></i> Recommended Exercises</h4>
                        <div class="recommendation-grid">
                            ${exerciseRecommendations.map(exercise => `
                                <div class="recommendation-card">
                                    <h5>${exercise.name}</h5>
                                    <p><strong>Duration:</strong> ${exercise.duration}</p>
                                    <p><strong>Frequency:</strong> ${exercise.frequency}</p>
                                    <p>${exercise.benefit}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4><i class="fas fa-pills text-warning"></i> Recommended Medications</h4>
                        <div class="recommendation-grid">
                            ${medicationRecommendations.map(med => `
                                <div class="recommendation-card">
                                    <h5>${med.name}</h5>
                                    <p><strong>Purpose:</strong> ${med.purpose}</p>
                                    <p><strong>Timing:</strong> ${med.timing}</p>
                                    <p class="text-danger"><small><strong>${med.caution}</strong></small></p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="health-disclaimer">
                        <p><small><strong>Important:</strong> High heart rate may indicate underlying health issues. Please consult with your healthcare provider before starting any new exercise or medication regimen. If you experience chest pain, shortness of breath, or dizziness, seek immediate medical attention.</small></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('heart-rate-alert-modal')">I Understand</button>
                    <button class="btn btn-primary" onclick="scheduleDoctorAppointment()">Schedule Doctor Visit</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function generateHealthRecommendations(healthScore, healthData) {
    const recommendations = [];
    
    // Food recommendations based on health score
    const foodRecommendations = [
        {
            name: "Leafy Greens",
            benefit: "Rich in vitamins and minerals for overall health",
            examples: "Spinach, kale, broccoli"
        },
        {
            name: "Berries",
            benefit: "High in antioxidants to boost immune system",
            examples: "Blueberries, strawberries, raspberries"
        },
        {
            name: "Whole Grains",
            benefit: "Provide sustained energy and fiber",
            examples: "Oats, quinoa, brown rice"
        },
        {
            name: "Lean Proteins",
            benefit: "Support muscle health and recovery",
            examples: "Chicken breast, fish, legumes"
        },
        {
            name: "Nuts and Seeds",
            benefit: "Healthy fats for brain and heart health",
            examples: "Almonds, walnuts, chia seeds"
        }
    ];
    
    // Exercise recommendations
    const exerciseRecommendations = [
        {
            name: "Walking",
            duration: "30 minutes",
            frequency: "Daily",
            benefit: "Improves cardiovascular health and mood"
        },
        {
            name: "Yoga",
            duration: "20 minutes",
            frequency: "3 times per week",
            benefit: "Reduces stress and improves flexibility"
        },
        {
            name: "Swimming",
            duration: "30 minutes",
            frequency: "2-3 times per week",
            benefit: "Low-impact full body workout"
        },
        {
            name: "Cycling",
            duration: "45 minutes",
            frequency: "2 times per week",
            benefit: "Strengthens legs and improves endurance"
        },
        {
            name: "Strength Training",
            duration: "20 minutes",
            frequency: "2 times per week",
            benefit: "Builds muscle and boosts metabolism"
        }
    ];
    
    // Medication/supplement recommendations
    const medicationRecommendations = [
        {
            name: "Multivitamin",
            purpose: "Fill nutritional gaps",
            timing: "Daily with breakfast",
            caution: "Consult doctor before starting"
        },
        {
            name: "Vitamin D",
            purpose: "Bone health and immune support",
            timing: "Daily with meal",
            caution: "Get levels checked first"
        },
        {
            name: "Omega-3",
            purpose: "Heart and brain health",
            timing: "Daily with food",
            caution: "May interact with blood thinners"
        },
        {
            name: "Probiotics",
            purpose: "Digestive health",
            timing: "Daily before breakfast",
            caution: "Start with low dose"
        },
        {
            name: "Magnesium",
            purpose: "Muscle relaxation and sleep",
            timing: "Evening before bed",
            caution: "May cause drowsiness"
        }
    ];
    
    // Create modal with recommendations
    const modalHtml = `
        <div id="health-recommendations-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-heartbeat text-danger"></i> Health Score: ${healthScore}/100</h3>
                    <button class="close-btn" onclick="closeModal('health-recommendations-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="health-alert">
                        <p><strong>Your health score is below 80. Here are personalized recommendations to improve your health:</strong></p>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4><i class="fas fa-utensils text-success"></i> Recommended Foods</h4>
                        <div class="recommendation-grid">
                            ${foodRecommendations.map(food => `
                                <div class="recommendation-card">
                                    <h5>${food.name}</h5>
                                    <p>${food.benefit}</p>
                                    <small><em>Examples: ${food.examples}</em></small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4><i class="fas fa-running text-primary"></i> Recommended Exercises</h4>
                        <div class="recommendation-grid">
                            ${exerciseRecommendations.map(exercise => `
                                <div class="recommendation-card">
                                    <h5>${exercise.name}</h5>
                                    <p><strong>Duration:</strong> ${exercise.duration}</p>
                                    <p><strong>Frequency:</strong> ${exercise.frequency}</p>
                                    <p>${exercise.benefit}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4><i class="fas fa-pills text-warning"></i> Recommended Supplements</h4>
                        <div class="recommendation-grid">
                            ${medicationRecommendations.map(med => `
                                <div class="recommendation-card">
                                    <h5>${med.name}</h5>
                                    <p><strong>Purpose:</strong> ${med.purpose}</p>
                                    <p><strong>Timing:</strong> ${med.timing}</p>
                                    <p class="text-warning"><small><strong>${med.caution}</strong></small></p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="health-disclaimer">
                        <p><small><strong>Important:</strong> These recommendations are general guidelines. Please consult with your healthcare provider before starting any new diet, exercise, or supplement regimen.</small></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal('health-recommendations-modal')">I Understand</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Recommendation action functions
function scheduleDoctorAppointment() {
    showSection('appointments');
    showNotification('Navigate to appointments to schedule with doctor', 'info');
}

function viewExercisePlan() {
    showSection('recommendations');
    showNotification('View exercise recommendations', 'info');
}

function setHydrationReminder() {
    showNotification('Hydration reminder set for every 2 hours', 'success');
}

function refreshDashboard() {
    // Reset health data to normal values
    if (currentUser && currentUser.role === 'patient') {
        const patient = patients.find(p => p.id === currentUser.id);
        if (patient) {
            // Reset to normal health metrics
            patient.healthData = {
                heartRate: 72,
                bmi: 24.5,
                bloodPressure: '120/80',
                temperature: 98.6,
                lastUpdated: new Date().toISOString()
            };
            
            // Update current user data
            currentUser.data = patient;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('patients', JSON.stringify(patients));
            
            // Add refresh activity
            const activity = {
                icon: 'fas fa-sync-alt',
                title: 'Dashboard Refreshed',
                description: 'Health data reset to normal values',
                time: 'Just now'
            };
            
            if (!patient.activities) patient.activities = [];
            patient.activities.unshift(activity);
            
            showNotification('Dashboard refreshed! Health data reset to normal values.', 'success');
        }
    } else {
        showNotification('Dashboard refreshed!', 'success');
    }
    
    // Reload dashboard to show updated data
    loadDashboard();
}

// ===== SYMPTOMS DATABASE =====
const symptomsDatabase = [
    {
        id: 1,
        name: "Headache",
        category: "neurological",
        severity: "mild",
        description: "Pain or discomfort in the head, scalp, or neck",
        commonCauses: ["Stress", "Dehydration", "Lack of sleep", "Eye strain", "Caffeine withdrawal"],
        homeRemedies: ["Rest in quiet room", "Apply cold compress", "Stay hydrated", "Practice relaxation techniques"],
        exercises: ["Neck stretches", "Shoulder rolls", "Deep breathing exercises"],
        foods: ["Ginger tea", "Magnesium-rich foods", "Hydrating fruits", "Dark chocolate"],
        medications: ["Acetaminophen (Tylenol)", "Ibuprofen (Advil)", "Aspirin"],
        whenToSeeDoctor: "If headache is severe, sudden, or accompanied by fever, stiff neck, confusion, or vision changes"
    },
    {
        id: 2,
        name: "Fever",
        category: "general",
        severity: "moderate",
        description: "Elevated body temperature, usually above 100.4°F (38°C)",
        commonCauses: ["Infection", "Inflammation", "Heat exhaustion", "Medication side effects", "Immunizations"],
        homeRemedies: ["Rest and hydration", "Cool compress", "Light clothing", "Lukewarm bath"],
        exercises: ["Gentle stretching", "Deep breathing", "Restorative yoga"],
        foods: ["Clear fluids", "Broth", "Electrolyte drinks", "Fruits with high water content"],
        medications: ["Acetaminophen (Tylenol)", "Ibuprofen (Advil)", "Aspirin"],
        whenToSeeDoctor: "If fever exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe symptoms"
    },
    {
        id: 3,
        name: "Cough",
        category: "respiratory",
        severity: "mild",
        description: "Reflex action that clears your throat of mucus or foreign irritants",
        commonCauses: ["Common cold", "Flu", "Allergies", "Asthma", "Acid reflux", "Environmental irritants"],
        homeRemedies: ["Honey with warm water", "Steam inhalation", "Elevate head while sleeping", "Use humidifier"],
        exercises: ["Breathing exercises", "Chest physiotherapy", "Controlled coughing technique"],
        foods: ["Warm soup", "Honey", "Ginger", "Turmeric milk", "Peppermint tea"],
        medications: ["Dextromethorphan", "Guaifenesin", "Expectorants", "Antihistamines"],
        whenToSeeDoctor: "If cough lasts more than 3 weeks, produces blood, or is accompanied by shortness of breath"
    },
    {
        id: 4,
        name: "Chest Pain",
        category: "cardiovascular",
        severity: "severe",
        description: "Pain or discomfort in the chest area",
        commonCauses: ["Heart attack", "Angina", "Heartburn", "Panic attack", "Muscle strain", "Lung issues"],
        homeRemedies: ["Seek immediate medical attention", "Rest in comfortable position", "Loosen tight clothing"],
        exercises: ["Only after medical clearance", "Cardiac rehabilitation exercises"],
        foods: ["Heart-healthy diet", "Low sodium foods", "Omega-3 rich foods"],
        medications: ["Aspirin (if heart attack suspected)", "Nitroglycerin (if prescribed)"],
        whenToSeeDoctor: "IMMEDIATELY - Chest pain can be life-threatening, especially if accompanied by shortness of breath, sweating, or pain radiating to arm/jaw"
    },
    {
        id: 5,
        name: "Shortness of Breath",
        category: "respiratory",
        severity: "moderate",
        description: "Difficulty breathing or feeling of not getting enough air",
        commonCauses: ["Asthma", "COPD", "Anxiety", "Heart conditions", "Anemia", "Obesity"],
        homeRemedies: ["Sit upright", "Use pursed-lip breathing", "Fresh air", "Avoid triggers"],
        exercises: ["Diaphragmatic breathing", "Pursed-lip breathing", "Controlled breathing exercises"],
        foods: ["Anti-inflammatory foods", "Foods rich in antioxidants", "Magnesium-rich foods"],
        medications: ["Bronchodilators", "Inhalers", "Steroids", "Anti-anxiety medications"],
        whenToSeeDoctor: "If sudden, severe, or accompanied by chest pain, confusion, or bluish lips"
    },
    {
        id: 6,
        name: "Nausea",
        category: "digestive",
        severity: "mild",
        description: "Feeling of sickness with an inclination to vomit",
        commonCauses: ["Food poisoning", "Motion sickness", "Pregnancy", "Medication side effects", "Anxiety"],
        homeRemedies: ["Ginger tea", "Acupressure wristbands", "Fresh air", "Small frequent meals"],
        exercises: ["Gentle walking", "Deep breathing", "Yoga poses"],
        foods: ["Ginger", "Peppermint", "Crackers", "BRAT diet (Bananas, Rice, Applesauce, Toast)"],
        medications: ["Antihistamines", "Antiemetics", "Ginger supplements"],
        whenToSeeDoctor: "If severe, persistent, or accompanied by severe abdominal pain, fever, or dehydration"
    },
    {
        id: 7,
        name: "Fatigue",
        category: "general",
        severity: "mild",
        description: "Feeling of tiredness, weakness, or lack of energy",
        commonCauses: ["Lack of sleep", "Stress", "Poor nutrition", "Medical conditions", "Overexertion"],
        homeRemedies: ["Establish sleep routine", "Manage stress", "Balanced diet", "Regular exercise"],
        exercises: ["Moderate aerobic exercise", "Yoga", "Tai chi", "Strength training"],
        foods: ["Complex carbohydrates", "Protein-rich foods", "Iron-rich foods", "B-vitamin rich foods"],
        medications: ["Iron supplements", "B-complex vitamins", "Vitamin D supplements"],
        whenToSeeDoctor: "If persistent, severe, or accompanied by other concerning symptoms"
    },
    {
        id: 8,
        name: "Dizziness",
        category: "neurological",
        severity: "moderate",
        description: "Feeling lightheaded, unsteady, or faint",
        commonCauses: ["Dehydration", "Low blood sugar", "Inner ear problems", "Anxiety", "Medication side effects"],
        homeRemedies: ["Sit or lie down immediately", "Hydrate", "Eat small meals", "Avoid sudden movements"],
        exercises: ["Balance exercises", "Vestibular rehabilitation", "Tai chi"],
        foods: ["Hydrating fluids", "Small frequent meals", "Foods with complex carbohydrates"],
        medications: ["Antihistamines", "Anti-anxiety medications", "Blood pressure medications"],
        whenToSeeDoctor: "If severe, sudden, or accompanied by chest pain, fainting, or neurological symptoms"
    },
    {
        id: 9,
        name: "Sore Throat",
        category: "respiratory",
        severity: "mild",
        description: "Pain, scratchiness, or irritation of the throat",
        commonCauses: ["Viral infections", "Bacterial infections", "Allergies", "Dry air", "Acid reflux"],
        homeRemedies: ["Salt water gargle", "Honey and warm water", "Humidifier", "Rest voice"],
        exercises: ["Gentle neck stretches", "Breathing exercises"],
        foods: ["Warm soup", "Honey", "Soft foods", "Cold foods like ice cream"],
        medications: ["Pain relievers", "Lozenges", "Antibiotics (if bacterial)"],
        whenToSeeDoctor: "If severe, lasts more than a week, or is accompanied by fever, rash, or difficulty breathing"
    },
    {
        id: 10,
        name: "Back Pain",
        category: "musculoskeletal",
        severity: "moderate",
        description: "Pain in the back area, ranging from mild to severe",
        commonCauses: ["Muscle strain", "Poor posture", "Herniated disc", "Arthritis", "Obesity"],
        homeRemedies: ["Rest", "Ice/heat therapy", "Proper posture", "Gentle stretching"],
        exercises: ["Core strengthening", "Stretching", "Yoga", "Swimming", "Walking"],
        foods: ["Anti-inflammatory foods", "Calcium-rich foods", "Vitamin D rich foods"],
        medications: ["NSAIDs", "Muscle relaxants", "Pain relievers"],
        whenToSeeDoctor: "If severe, persistent, or accompanied by numbness, weakness, or loss of bladder/bowel control"
    },
    {
        id: 11,
        name: "Abdominal Pain",
        category: "digestive",
        severity: "moderate",
        description: "Pain or discomfort in the abdominal area",
        commonCauses: ["Indigestion", "Gas", "Food poisoning", "Appendicitis", "Kidney stones"],
        homeRemedies: ["Rest", "Apply heating pad", "Avoid solid foods temporarily", "Stay hydrated"],
        exercises: ["Gentle walking", "Stretching", "Yoga poses"],
        foods: ["BRAT diet", "Ginger tea", "Peppermint tea", "Probiotic foods"],
        medications: ["Antacids", "Pain relievers", "Anti-spasmodics"],
        whenToSeeDoctor: "If severe, sudden, or accompanied by fever, vomiting, or other concerning symptoms"
    },
    {
        id: 12,
        name: "Joint Pain",
        category: "musculoskeletal",
        severity: "moderate",
        description: "Pain, stiffness, or discomfort in joints",
        commonCauses: ["Arthritis", "Injury", "Overuse", "Infection", "Autoimmune conditions"],
        homeRemedies: ["Rest", "Ice/heat therapy", "Elevation", "Gentle movement"],
        exercises: ["Range of motion exercises", "Low-impact activities", "Swimming", "Tai chi"],
        foods: ["Anti-inflammatory foods", "Omega-3 rich foods", "Calcium-rich foods"],
        medications: ["NSAIDs", "Joint supplements", "Pain relievers"],
        whenToSeeDoctor: "If severe, persistent, or accompanied by swelling, redness, or limited mobility"
    }
];

// ===== SYMPTOMS FUNCTIONS =====
function loadSymptoms() {
    displaySymptoms(symptomsDatabase);
}

function displaySymptoms(symptoms) {
    const resultsContainer = document.getElementById('symptom-results');
    if (!resultsContainer) return;
    
    if (symptoms.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No symptoms found</p>';
        return;
    }
    
    resultsContainer.innerHTML = symptoms.map(symptom => `
        <div class="symptom-card" onclick="showSymptomDetails(${symptom.id})">
            <div class="symptom-header">
                <h4>${symptom.name}</h4>
                <span class="symptom-category">${symptom.category}</span>
                <span class="symptom-severity severity-${symptom.severity}">${symptom.severity}</span>
            </div>
            <div class="symptom-description">
                <p>${symptom.description}</p>
            </div>
        </div>
    `).join('');
}

function searchSymptoms(query) {
    if (!query || query.length < 2) {
        displaySymptoms(symptomsDatabase);
        return;
    }
    
    const filteredSymptoms = symptomsDatabase.filter(symptom => 
        symptom.name.toLowerCase().includes(query.toLowerCase()) ||
        symptom.description.toLowerCase().includes(query.toLowerCase()) ||
        symptom.category.toLowerCase().includes(query.toLowerCase())
    );
    
    displaySymptoms(filteredSymptoms);
}

function filterSymptomsByCategory(category) {
    if (category === 'all') {
        displaySymptoms(symptomsDatabase);
    } else {
        const filteredSymptoms = symptomsDatabase.filter(symptom => symptom.category === category);
        displaySymptoms(filteredSymptoms);
    }
}

function showSymptomDetails(symptomId) {
    const symptom = symptomsDatabase.find(s => s.id === symptomId);
    if (!symptom) return;
    
    const modalHtml = `
        <div id="symptom-details-modal" class="modal active">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>${symptom.name} - Detailed Information</h3>
                    <button class="close-btn" onclick="closeModal('symptom-details-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="symptom-detail-section">
                        <h4><i class="fas fa-info-circle"></i> Overview</h4>
                        <p>${symptom.description}</p>
                        <div class="symptom-meta">
                            <span class="category-badge category-${symptom.category}">${symptom.category}</span>
                            <span class="severity-badge severity-${symptom.severity}">${symptom.severity} severity</span>
                        </div>
                    </div>
                    
                    <div class="symptom-detail-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> Common Causes</h4>
                        <ul>
                            ${symptom.commonCauses.map(cause => `<li>${cause}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="symptom-detail-section">
                        <h4><i class="fas fa-home"></i> Home Remedies</h4>
                        <ul>
                            ${symptom.homeRemedies.map(remedy => `<li>${remedy}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="symptom-detail-section">
                        <h4><i class="fas fa-running"></i> Recommended Exercises</h4>
                        <ul>
                            ${symptom.exercises.map(exercise => `<li>${exercise}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="symptom-detail-section">
                        <h4><i class="fas fa-apple-alt"></i> Recommended Foods</h4>
                        <ul>
                            ${symptom.foods.map(food => `<li>${food}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="symptom-detail-section">
                        <h4><i class="fas fa-pills"></i> Over-the-Counter Medications</h4>
                        <ul>
                            ${symptom.medications.map(medication => `<li>${medication}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="symptom-detail-section warning">
                        <h4><i class="fas fa-hospital"></i> When to See a Doctor</h4>
                        <p><strong>${symptom.whenToSeeDoctor}</strong></p>
                    </div>
                    
                    <div class="symptom-actions">
                        <button class="btn btn-primary" onclick="trackSymptom(${symptom.id})">
                            <i class="fas fa-plus"></i> Track This Symptom
                        </button>
                        <button class="btn btn-outline" onclick="scheduleDoctorVisit('${symptom.name}')">
                            <i class="fas fa-calendar"></i> Schedule Doctor Visit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('symptom-details-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function trackSymptom(symptomId) {
    if (!currentUser || currentUser.role !== 'patient') {
        showNotification('Please login to track symptoms', 'error');
        return;
    }
    
    const symptom = symptomsDatabase.find(s => s.id === symptomId);
    if (!symptom) return;
    
    // Add symptom to patient's health data
    const patient = patients.find(p => p.id === currentUser.id);
    if (patient) {
        if (!patient.symptoms) patient.symptoms = [];
        
        const symptomEntry = {
            symptomId: symptom.id,
            symptomName: symptom.name,
            category: symptom.category,
            severity: symptom.severity,
            trackedAt: new Date().toISOString(),
            notes: ''
        };
        
        patient.symptoms.push(symptomEntry);
        
        // Add to activities
        const activity = {
            icon: 'fas fa-notes-medical',
            title: 'Symptom Tracked',
            description: `${symptom.name} - ${symptom.severity} severity`,
            time: 'Just now'
        };
        
        if (!patient.activities) patient.activities = [];
        patient.activities.unshift(activity);
        
        // Update current user data
        currentUser.data = patient;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('patients', JSON.stringify(patients));
        
        closeModal('symptom-details-modal');
        showNotification(`Symptom "${symptom.name}" tracked successfully!`, 'success');
        
        // Refresh dashboard if on dashboard
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    }
}

function scheduleDoctorVisit(symptomName) {
    closeModal('symptom-details-modal');
    showSection('appointments');
    
    // Pre-fill appointment reason
    setTimeout(() => {
        const reasonField = document.getElementById('appointment-reason');
        if (reasonField) {
            reasonField.value = `Consultation for ${symptomName}`;
        }
        showNotification('Navigate to appointments to schedule doctor visit', 'info');
    }, 500);
}

function getPatientSymptoms() {
    if (!currentUser || currentUser.role !== 'patient') {
        return [];
    }
    
    const patient = patients.find(p => p.id === currentUser.id);
    return patient?.symptoms || [];
}

function analyzeSymptoms() {
    const patientSymptoms = getPatientSymptoms();
    if (patientSymptoms.length === 0) {
        showNotification('No symptoms tracked yet', 'info');
        return;
    }
    
    // Analyze patterns
    const categoryCounts = {};
    const severityCounts = { mild: 0, moderate: 0, severe: 0 };
    
    patientSymptoms.forEach(symptom => {
        categoryCounts[symptom.category] = (categoryCounts[symptom.category] || 0) + 1;
        severityCounts[symptom.severity]++;
    });
    
    // Generate analysis
    const analysis = {
        totalSymptoms: patientSymptoms.length,
        categoryDistribution: categoryCounts,
        severityDistribution: severityCounts,
        mostCommonCategory: Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b),
        recommendations: generateSymptomRecommendations(patientSymptoms)
    };
    
    showSymptomAnalysis(analysis);
}

function generateSymptomRecommendations(symptoms) {
    const recommendations = [];
    
    // Check for severe symptoms
    const severeSymptoms = symptoms.filter(s => s.severity === 'severe');
    if (severeSymptoms.length > 0) {
        recommendations.push({
            priority: 'high',
            message: 'You have tracked severe symptoms. Consider consulting a healthcare provider.',
            action: 'scheduleDoctorVisit'
        });
    }
    
    // Check for recurring symptoms in same category
    const categoryCounts = {};
    symptoms.forEach(s => {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count >= 3) {
            recommendations.push({
                priority: 'medium',
                message: `You have multiple ${category} symptoms. This may indicate an underlying condition.`,
                action: 'viewCategoryInfo'
            });
        }
    });
    
    // General wellness recommendation
    recommendations.push({
        priority: 'low',
        message: 'Continue tracking your symptoms to identify patterns and triggers.',
        action: 'continueTracking'
    });
    
    return recommendations;
}

function showSymptomAnalysis(analysis) {
    const modalHtml = `
        <div id="symptom-analysis-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Symptom Analysis</h3>
                    <button class="close-btn" onclick="closeModal('symptom-analysis-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="analysis-summary">
                        <h4>Summary</h4>
                        <p>You have tracked <strong>${analysis.totalSymptoms}</strong> symptoms.</p>
                        <p>Most common category: <strong>${analysis.mostCommonCategory}</strong></p>
                    </div>
                    
                    <div class="analysis-charts">
                        <div class="chart-section">
                            <h4>Severity Distribution</h4>
                            <div class="severity-chart">
                                <div class="severity-bar">
                                    <span>Mild: ${analysis.severityDistribution.mild}</span>
                                    <div class="bar-container">
                                        <div class="bar mild" style="width: ${(analysis.severityDistribution.mild / analysis.totalSymptoms) * 100}%"></div>
                                    </div>
                                </div>
                                <div class="severity-bar">
                                    <span>Moderate: ${analysis.severityDistribution.moderate}</span>
                                    <div class="bar-container">
                                        <div class="bar moderate" style="width: ${(analysis.severityDistribution.moderate / analysis.totalSymptoms) * 100}%"></div>
                                    </div>
                                </div>
                                <div class="severity-bar">
                                    <span>Severe: ${analysis.severityDistribution.severe}</span>
                                    <div class="bar-container">
                                        <div class="bar severe" style="width: ${(analysis.severityDistribution.severe / analysis.totalSymptoms) * 100}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-section">
                            <h4>Category Distribution</h4>
                            <div class="category-list">
                                ${Object.entries(analysis.categoryDistribution).map(([category, count]) => `
                                    <div class="category-item">
                                        <span>${category}: ${count}</span>
                                        <div class="bar-container">
                                            <div class="bar category" style="width: ${(count / analysis.totalSymptoms) * 100}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="recommendations-section">
                        <h4>Recommendations</h4>
                        ${analysis.recommendations.map(rec => `
                            <div class="recommendation-item priority-${rec.priority}">
                                <p>${rec.message}</p>
                                <button class="btn btn-sm ${rec.priority === 'high' ? 'btn-primary' : 'btn-outline'}" onclick="${rec.action}">
                                    Take Action
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('symptom-analysis-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ===== APPOINTMENTS =====
function loadAppointments() {
    const userAppointments = appointments.filter(apt => apt.patientId === currentUser.id);
    displayAppointments(userAppointments);
}

function displayAppointments(appointments) {
    const appointmentsContainer = document.getElementById('scheduled-appointments');
    if (appointmentsContainer) {
        if (appointments.length === 0) {
            appointmentsContainer.innerHTML = '<p>No upcoming appointments</p>';
        } else {
            appointmentsContainer.innerHTML = appointments.map(apt => `
                <div class="appointment-card" data-appointment-id="${apt.id}">
                    <div class="appointment-header">
                        <div>
                            <div class="appointment-patient">${apt.doctor}</div>
                            <div class="appointment-doctor">Scheduled Appointment</div>
                        </div>
                        <div class="appointment-time">${apt.time}</div>
                    </div>
                    <div class="appointment-details">
                        <div class="appointment-reason">${apt.reason}</div>
                        <div class="appointment-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(apt.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-outline btn-sm">Reschedule</button>
                        <button class="btn btn-secondary btn-sm">Cancel</button>
                        <button class="appointment-delete-btn" onclick="deleteAppointment('${apt.id}')" title="Delete appointment">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function scheduleAppointment(appointmentData) {
    const newAppointment = {
        id: Date.now().toString(),
        patientId: currentUser.id,
        patientName: currentUser.name,
        doctor: appointmentData.doctor,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason,
        createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    showNotification('Appointment scheduled successfully!', 'success');
    loadAppointments();
    
    // Reset form
    document.getElementById('appointment-form').reset();
}

function deleteAppointment(appointmentId) {
    if (!currentUser) return;
    
    // Find and remove appointment
    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex !== -1) {
        const deletedAppointment = appointments[appointmentIndex];
        
        // Check if user owns this appointment
        if (currentUser.role === 'patient' && deletedAppointment.patientId !== currentUser.id) {
            showNotification('You can only delete your own appointments', 'error');
            return;
        }
        
        appointments.splice(appointmentIndex, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification('Appointment deleted successfully', 'success');
        loadAppointments();
    }
}

function saveAppointment() {
    // Prevent default form submission
    event.preventDefault();
    
    // Get form values
    const doctor = document.getElementById('appointment-doctor').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const reason = document.getElementById('appointment-reason').value;
    
    // Validate form
    if (!doctor || !date || !time || !reason) {
        showNotification('Please fill in all appointment details', 'error');
        return;
    }
    
    // Create appointment data
    const appointmentData = {
        doctor: doctor,
        date: date,
        time: time,
        reason: reason
    };
    
    // Check if user is admin or patient
    if (currentUser && currentUser.role === 'admin') {
        // Admin creates appointment for any patient
        const newAppointment = {
            id: Date.now().toString(),
            patientId: 'admin-scheduled',
            patientName: 'Admin Scheduled',
            doctor: appointmentData.doctor,
            date: appointmentData.date,
            time: appointmentData.time,
            reason: appointmentData.reason,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification('Appointment saved successfully!', 'success');
        
        // Reset form
        document.getElementById('appointment-form').reset();
        
        // Refresh admin appointments display
        loadAdminAppointments();
        
    } else {
        // Patient schedules their own appointment
        scheduleAppointment(appointmentData);
    }
}

// ===== RECOMMENDATIONS FUNCTIONS =====
function loadRecommendations() {
    if (!currentUser || currentUser.role !== 'patient') return;
    
    const patient = patients.find(p => p.id === currentUser.id);
    const patientRecommendations = patient?.recommendations || [];
    
    displayRecommendations(patientRecommendations);
}

function displayRecommendations(recommendations) {
    const recommendationsGrid = document.getElementById('recommendations-grid');
    if (!recommendationsGrid) return;
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">No recommendations yet. Generate your daily plan to get started!</p>';
        return;
    }
    
    recommendationsGrid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card ${rec.status}" data-id="${rec.id}">
            <div class="recommendation-header">
                <i class="${rec.icon}"></i>
                <h3>${rec.title}</h3>
                <span class="recommendation-priority priority-${rec.priority}">${rec.priority}</span>
            </div>
            <div class="recommendation-body">
                <p>${rec.description}</p>
                <div class="recommendation-meta">
                    <span class="recommendation-date">${new Date(rec.date).toLocaleDateString()}</span>
                    <span class="recommendation-time">${rec.time}</span>
                </div>
            </div>
            <div class="recommendation-actions">
                <button class="btn btn-sm ${rec.status === 'completed' ? 'btn-secondary' : 'btn-primary'}" onclick="toggleRecommendation('${rec.id}')">
                    ${rec.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
                <button class="btn btn-outline btn-sm" onclick="viewRecommendationDetails('${rec.id}')">
                    Details
                </button>
            </div>
        </div>
    `).join('');
    
    // Update progress
    updateRecommendationProgress();
}

function generateDailyRecommendations() {
    if (!currentUser || currentUser.role !== 'patient') {
        showNotification('Please login to generate recommendations', 'error');
        return;
    }
    
    const date = document.getElementById('plan-date').value || new Date().toISOString().split('T')[0];
    
    const dailyRecommendations = [
        {
            id: Date.now().toString(),
            title: "Morning Cardio",
            description: "Start your day with 20 minutes of light cardio to boost heart health",
            icon: "fas fa-heartbeat",
            category: "cardiovascular",
            priority: "medium",
            date: date,
            time: "07:00",
            status: "pending",
            completed: false
        },
        {
            id: (Date.now() + 1).toString(),
            title: "Healthy Breakfast",
            description: "Eat a balanced breakfast with protein, complex carbs, and fresh fruit",
            icon: "fas fa-apple-alt",
            category: "nutrition",
            priority: "high",
            date: date,
            time: "08:00",
            status: "pending",
            completed: false
        },
        {
            id: (Date.now() + 2).toString(),
            title: "Hydration Goal",
            description: "Drink 8 glasses of water throughout the day",
            icon: "fas fa-tint",
            category: "nutrition",
            priority: "medium",
            date: date,
            time: "09:00",
            status: "pending",
            completed: false
        },
        {
            id: (Date.now() + 3).toString(),
            title: "Evening Walk",
            description: "Take a 30-minute walk to improve circulation and reduce stress",
            icon: "fas fa-walking",
            category: "exercise",
            priority: "medium",
            date: date,
            time: "18:00",
            status: "pending",
            completed: false
        },
        {
            id: (Date.now() + 4).toString(),
            title: "Mindfulness Session",
            description: "Practice 10 minutes of meditation or deep breathing exercises",
            icon: "fas fa-mindfulness",
            category: "mental",
            priority: "low",
            date: date,
            time: "20:00",
            status: "pending",
            completed: false
        },
        {
            id: (Date.now() + 5).toString(),
            title: "Sleep Schedule",
            description: "Maintain consistent sleep schedule for optimal recovery",
            icon: "fas fa-moon",
            category: "sleep",
            priority: "high",
            date: date,
            time: "22:00",
            status: "pending",
            completed: false
        }
    ];
    
    // Save to patient data
    const patient = patients.find(p => p.id === currentUser.id);
    if (patient) {
        const dateKey = date;
        if (!patient.dailyPlans) patient.dailyPlans = {};
        
        patient.dailyPlans[dateKey] = dailyRecommendations;
        patient.activities.push({
            icon: 'fas fa-calendar-check',
            title: 'Daily Plan Generated',
            description: `Generated ${dailyRecommendations.length} recommendations for ${date}`,
            time: 'Just now'
        });
        
        currentUser.data = patient;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('patients', JSON.stringify(patients));
        
        // Show modal
        openModal('daily-plan-modal');
        populateDailyPlan(dailyRecommendations);
        
        showNotification('Daily plan generated successfully!', 'success');
    }
}

function populateDailyPlan(recommendations) {
    const categories = {
        cardiovascular: 'cardiovascular-items',
        nutrition: 'nutrition-items',
        exercise: 'exercise-items',
        sleep: 'sleep-items',
        mental: 'mental-items'
    };
    
    Object.entries(categories).forEach(([category, containerId]) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const categoryRecommendations = recommendations.filter(rec => rec.category === category);
        
        container.innerHTML = categoryRecommendations.map(rec => `
            <div class="plan-item">
                <input type="checkbox" id="plan-${rec.id}" onchange="updatePlanProgress()">
                <label for="plan-${rec.id}">${rec.time} - ${rec.title}</label>
            </div>
        `).join('');
    });
}

function saveDailyPlan() {
    const date = document.getElementById('plan-date').value;
    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    const planItems = document.querySelectorAll('.plan-item input[type="checkbox"]');
    const completedItems = [];
    
    planItems.forEach(item => {
        if (item.checked) {
            completedItems.push(item.id.replace('plan-', ''));
        }
    });
    
    // Update patient data
    if (!patient.dailyPlans) patient.dailyPlans = {};
    const dateKey = date;
    
    if (patient.dailyPlans[dateKey]) {
        patient.dailyPlans[dateKey].forEach(rec => {
            if (completedItems.includes(rec.id)) {
                rec.completed = true;
                rec.completedAt = new Date().toISOString();
            }
        });
    }
    
    // Add to activities
    patient.activities.push({
        icon: 'fas fa-save',
        title: 'Daily Plan Saved',
        description: `Saved ${completedItems.length} completed items for ${date}`,
        time: 'Just now'
    });
    
    currentUser.data = patient;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('patients', JSON.stringify(patients));
    
    closeModal('daily-plan-modal');
    loadRecommendations();
    updateRecommendationProgress();
    
    showNotification('Daily plan saved successfully!', 'success');
}

function clearDailyPlan() {
    const date = document.getElementById('plan-date').value;
    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    if (patient.dailyPlans && patient.dailyPlans[date]) {
        delete patient.dailyPlans[date];
        
        // Add to activities
        patient.activities.push({
            icon: 'fas fa-trash',
            title: 'Daily Plan Cleared',
            description: `Cleared daily plan for ${date}`,
            time: 'Just now'
        });
    }
    
    currentUser.data = patient;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('patients', JSON.stringify(patients));
    
    closeModal('daily-plan-modal');
    loadRecommendations();
    updateRecommendationProgress();
    
    showNotification('Daily plan cleared!', 'info');
}

function toggleRecommendation(recommendationId) {
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    const date = new Date().toISOString().split('T')[0];
    const plan = patient.dailyPlans?.[date];
    if (!plan) return;
    
    const recommendation = plan.find(rec => rec.id === recommendationId);
    if (!recommendation) return;
    
    recommendation.completed = !recommendation.completed;
    recommendation.completedAt = recommendation.completed ? null : new Date().toISOString();
    
    currentUser.data = patient;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('patients', JSON.stringify(patients));
    
    loadRecommendations();
    updateRecommendationProgress();
    
    const status = recommendation.completed ? 'completed' : 'pending';
    showNotification(`Recommendation marked as ${status}!`, 'success');
}

function viewRecommendationDetails(recommendationId) {
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    const date = new Date().toISOString().split('T')[0];
    const plan = patient.dailyPlans?.[date];
    if (!plan) return;
    
    const recommendation = plan.find(rec => rec.id === recommendationId);
    if (!recommendation) return;
    
    const modalHtml = `
        <div id="recommendation-details-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${recommendation.title}</h3>
                    <button class="close-btn" onclick="closeModal('recommendation-details-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="recommendation-detail-section">
                        <h4><i class="fas fa-info-circle"></i> Details</h4>
                        <p>${recommendation.description}</p>
                        <div class="recommendation-meta">
                            <span><strong>Date:</strong> ${recommendation.date}</span>
                            <span><strong>Time:</strong> ${recommendation.time}</span>
                            <span><strong>Category:</strong> ${recommendation.category}</span>
                            <span><strong>Priority:</strong> ${recommendation.priority}</span>
                        </div>
                    </div>
                    <div class="recommendation-detail-section">
                        <h4><i class="fas fa-list-check"></i> Progress</h4>
                        <div class="progress-detail">
                            <p>This recommendation is ${recommendation.completed ? 'completed' : 'pending'}</p>
                            ${recommendation.completedAt ? `<p><strong>Completed:</strong> ${new Date(recommendation.completedAt).toLocaleString()}</p>` : ''}
                        </div>
                    </div>
                    <div class="recommendation-detail-section">
                        <h4><i class="fas fa-lightbulb"></i> Tips</h4>
                        <ul>
                            <li>Set reminders to help you remember</li>
                            <li>Track your progress regularly</li>
                            <li>Adjust based on how you feel</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('recommendation-details-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function updateRecommendationProgress() {
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    const today = new Date().toISOString().split('T')[0];
    const plan = patient.dailyPlans?.[today];
    
    if (!plan) {
        updateProgressStats(0, 0);
        return;
    }
    
    const completedCount = plan.filter(rec => rec.completed).length;
    const totalCount = plan.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    updateProgressStats(completedCount, totalCount);
}

function updateProgressStats(completed, total) {
    const progressFill = document.getElementById('today-progress');
    const progressText = document.getElementById('today-progress-text');
    const completionRate = document.getElementById('completion-rate');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${completed}/${total} completed`;
    }
    
    if (completionRate) {
        completionRate.textContent = `${percentage}%`;
    }
    
    // Update streak
    const streak = calculateStreak();
    const streakElement = document.getElementById('current-streak');
    if (streakElement) {
        streakElement.textContent = streak;
    }
}

function calculateStreak() {
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient || !patient.dailyPlans) return 0;
    
    const dates = Object.keys(patient.dailyPlans).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
        const plan = patient.dailyPlans[date];
        const allCompleted = plan.every(rec => rec.completed);
        
        if (allCompleted) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function filterRecommendations(filter) {
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    let recommendations = patient.recommendations || [];
    
    switch(filter) {
        case 'active':
            recommendations = recommendations.filter(rec => !rec.completed);
            break;
        case 'completed':
            recommendations = recommendations.filter(rec => rec.completed);
            break;
        case 'pending':
            recommendations = recommendations.filter(rec => !rec.completed);
            break;
    }
    
    displayRecommendations(recommendations);
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('plan-date').value = today;
}

function exportHealthReport() {
    if (!currentUser || currentUser.role !== 'patient') {
        showNotification('Please login to export health report', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === currentUser.id);
    if (!patient) return;
    
    const reportData = {
        patient: {
            name: `${patient.firstName} ${patient.lastName}`,
            email: patient.email,
            phone: patient.phone,
            dob: patient.dob
        },
        healthData: patient.healthData || {},
        recommendations: patient.recommendations || [],
        activities: patient.activities || [],
        dailyPlans: patient.dailyPlans || {},
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.name
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `health-report-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Health report exported successfully!', 'success');
}

// ===== FOOD DATABASE =====
const foodDatabase = [
    // A
    { id: 1, name: "Apple", category: "fruits", calories: 52, protein: 0.3, fiber: 2.4, cholesterol: 0, carbs: 14, fat: 0.2, sugar: 10, sodium: 1, icon: "fas fa-apple-alt" },
    { id: 2, name: "Avocado", category: "fruits", calories: 160, protein: 2, fiber: 6.7, cholesterol: 0, carbs: 9, fat: 15, sugar: 0.7, sodium: 7, icon: "fas fa-leaf" },
    { id: 3, name: "Almonds", category: "nuts", calories: 579, protein: 21, fiber: 12.5, cholesterol: 0, carbs: 22, fat: 50, sugar: 4, sodium: 1, icon: "fas fa-seedling" },
    { id: 4, name: "Asparagus", category: "vegetables", calories: 20, protein: 2.2, fiber: 2.1, cholesterol: 0, carbs: 4, fat: 0.1, sugar: 2, sodium: 2, icon: "fas fa-carrot" },
    { id: 5, name: "Apricot", category: "fruits", calories: 48, protein: 1.4, fiber: 2, cholesterol: 0, carbs: 11, fat: 0.4, sugar: 9, sodium: 1, icon: "fas fa-apple-alt" },
    
    // B
    { id: 6, name: "Banana", category: "fruits", calories: 89, protein: 1.1, fiber: 2.6, cholesterol: 0, carbs: 23, fat: 0.3, sugar: 12, sodium: 1, icon: "fas fa-apple-alt" },
    { id: 7, name: "Broccoli", category: "vegetables", calories: 34, protein: 2.8, fiber: 2.6, cholesterol: 0, carbs: 7, fat: 0.4, sugar: 1.5, sodium: 33, icon: "fas fa-carrot" },
    { id: 8, name: "Brown Rice", category: "grains", calories: 111, protein: 2.6, fiber: 1.8, cholesterol: 0, carbs: 23, fat: 0.9, sugar: 0.4, sodium: 5, icon: "fas fa-bread-slice" },
    { id: 9, name: "Beef", category: "proteins", calories: 250, protein: 26, fiber: 0, cholesterol: 75, carbs: 0, fat: 15, sugar: 0, sodium: 60, icon: "fas fa-drumstick-bite" },
    { id: 10, name: "Blueberries", category: "fruits", calories: 57, protein: 0.7, fiber: 2.4, cholesterol: 0, carbs: 14, fat: 0.3, sugar: 10, sodium: 1, icon: "fas fa-apple-alt" },
    
    // C
    { id: 11, name: "Chicken Breast", category: "proteins", calories: 165, protein: 31, fiber: 0, cholesterol: 85, carbs: 0, fat: 3.6, sugar: 0, sodium: 74, icon: "fas fa-drumstick-bite" },
    { id: 12, name: "Carrots", category: "vegetables", calories: 41, protein: 0.9, fiber: 2.8, cholesterol: 0, carbs: 10, fat: 0.2, sugar: 5, sodium: 69, icon: "fas fa-carrot" },
    { id: 13, name: "Cheese", category: "dairy", calories: 402, protein: 25, fiber: 0, cholesterol: 105, carbs: 1.3, fat: 33, sugar: 0.5, sodium: 621, icon: "fas fa-cheese" },
    { id: 14, name: "Chickpeas", category: "proteins", calories: 364, protein: 19, fiber: 17, cholesterol: 0, carbs: 61, fat: 6, sugar: 11, sodium: 724, icon: "fas fa-seedling" },
    { id: 15, name: "Corn", category: "vegetables", calories: 86, protein: 3.4, fiber: 3.2, cholesterol: 0, carbs: 19, fat: 1.4, sugar: 6.3, sodium: 15, icon: "fas fa-corn" },
    
    // D
    { id: 16, name: "Dates", category: "fruits", calories: 282, protein: 2.5, fiber: 8, cholesterol: 0, carbs: 75, fat: 0.4, sugar: 63, sodium: 2, icon: "fas fa-apple-alt" },
    { id: 17, name: "Dark Chocolate", category: "snacks", calories: 546, protein: 4.9, fiber: 11, cholesterol: 0, carbs: 61, fat: 31, sugar: 48, sodium: 24, icon: "fas fa-cookie" },
    { id: 18, name: "Eggs", category: "proteins", calories: 155, protein: 13, fiber: 0, cholesterol: 373, carbs: 1.1, fat: 11, sugar: 1.1, sodium: 124, icon: "fas fa-egg" },
    
    // F
    { id: 19, name: "Fish (Salmon)", category: "proteins", calories: 208, protein: 20, fiber: 0, cholesterol: 55, carbs: 0, fat: 13, sugar: 0, sodium: 59, icon: "fas fa-fish" },
    { id: 20, name: "Flaxseeds", category: "nuts", calories: 534, protein: 18, fiber: 27, cholesterol: 0, carbs: 29, fat: 42, sugar: 1.6, sodium: 30, icon: "fas fa-seedling" },
    { id: 21, name: "Grapes", category: "fruits", calories: 69, protein: 0.7, fiber: 0.9, cholesterol: 0, carbs: 18, fat: 0.2, sugar: 15, sodium: 2, icon: "fas fa-apple-alt" },
    { id: 22, name: "Garlic", category: "vegetables", calories: 149, protein: 6.4, fiber: 2.1, cholesterol: 0, carbs: 33, fat: 0.5, sugar: 1, sodium: 17, icon: "fas fa-carrot" },
    { id: 23, name: "Green Beans", category: "vegetables", calories: 31, protein: 2, fiber: 3.4, cholesterol: 0, carbs: 7, fat: 0.1, sugar: 3.3, sodium: 6, icon: "fas fa-carrot" },
    
    // H
    { id: 24, name: "Honey", category: "beverages", calories: 304, protein: 0.3, fiber: 0, cholesterol: 0, carbs: 82, fat: 0, sugar: 82, sodium: 4, icon: "fas fa-jar" },
    { id: 25, name: "Hazelnuts", category: "nuts", calories: 628, protein: 15, fiber: 9.7, cholesterol: 0, carbs: 17, fat: 61, sugar: 4.3, sodium: 2, icon: "fas fa-seedling" },
    
    // K
    { id: 26, name: "Kale", category: "vegetables", calories: 49, protein: 4.3, fiber: 3.6, cholesterol: 0, carbs: 9, fat: 0.9, sugar: 2.3, sodium: 38, icon: "fas fa-carrot" },
    { id: 27, name: "Kiwi", category: "fruits", calories: 61, protein: 1.1, fiber: 3, cholesterol: 0, carbs: 15, fat: 0.5, sugar: 9, sodium: 3, icon: "fas fa-apple-alt" },
    
    // L
    { id: 28, name: "Lentils", category: "proteins", calories: 116, protein: 9, fiber: 7.9, cholesterol: 0, carbs: 20, fat: 0.4, sugar: 1.8, sodium: 6, icon: "fas fa-seedling" },
    { id: 29, name: "Lettuce", category: "vegetables", calories: 15, protein: 1.4, fiber: 2.9, cholesterol: 0, carbs: 2.9, fat: 0.2, sugar: 0.8, sodium: 28, icon: "fas fa-carrot" },
    { id: 30, name: "Lemon", category: "fruits", calories: 29, protein: 1.1, fiber: 2.8, cholesterol: 0, carbs: 9, fat: 0.3, sugar: 2.5, sodium: 2, icon: "fas fa-apple-alt" },
    
    // M
    { id: 31, name: "Milk", category: "dairy", calories: 42, protein: 3.4, fiber: 0, cholesterol: 5, carbs: 5, fat: 1, sugar: 5, sodium: 44, icon: "fas fa-glass" },
    { id: 32, name: "Mushrooms", category: "vegetables", calories: 22, protein: 3.1, fiber: 1, cholesterol: 0, carbs: 3.3, fat: 0.3, sugar: 1.7, sodium: 5, icon: "fas fa-carrot" },
    { id: 33, name: "Mango", category: "fruits", calories: 60, protein: 0.8, fiber: 1.6, cholesterol: 0, carbs: 15, fat: 0.4, sugar: 14, sodium: 1, icon: "fas fa-apple-alt" },
    
    // O
    { id: 34, name: "Oats", category: "grains", calories: 389, protein: 17, fiber: 10, cholesterol: 0, carbs: 66, fat: 7, sugar: 0.99, sodium: 2, icon: "fas fa-bread-slice" },
    { id: 35, name: "Orange", category: "fruits", calories: 47, protein: 0.9, fiber: 2.4, cholesterol: 0, carbs: 12, fat: 0.1, sugar: 9, sodium: 0, icon: "fas fa-apple-alt" },
    { id: 36, name: "Onion", category: "vegetables", calories: 40, protein: 1.1, fiber: 1.7, cholesterol: 0, carbs: 9, fat: 0.1, sugar: 4.2, sodium: 4, icon: "fas fa-carrot" },
    
    // P
    { id: 37, name: "Peanuts", category: "nuts", calories: 567, protein: 25, fiber: 8.5, cholesterol: 0, carbs: 16, fat: 49, sugar: 4, sodium: 6, icon: "fas fa-seedling" },
    { id: 38, name: "Pineapple", category: "fruits", calories: 50, protein: 0.5, fiber: 1.4, cholesterol: 0, carbs: 13, fat: 0.1, sugar: 10, sodium: 1, icon: "fas fa-apple-alt" },
    { id: 39, name: "Potato", category: "vegetables", calories: 77, protein: 2, fiber: 2.2, cholesterol: 0, carbs: 17, fat: 0.1, sugar: 0.8, sodium: 6, icon: "fas fa-carrot" },
    { id: 40, name: "Pork", category: "proteins", calories: 242, protein: 27, fiber: 0, cholesterol: 80, carbs: 0, fat: 14, sugar: 0, sodium: 62, icon: "fas fa-drumstick-bite" },
    { id: 41, name: "Pumpkin", category: "vegetables", calories: 26, protein: 1, fiber: 0.5, cholesterol: 0, carbs: 7, fat: 0.1, sugar: 2.8, sodium: 1, icon: "fas fa-carrot" },
    
    // Q
    { id: 42, name: "Quinoa", category: "grains", calories: 120, protein: 4.4, fiber: 2.8, cholesterol: 0, carbs: 21, fat: 1.9, sugar: 0.9, sodium: 7, icon: "fas fa-bread-slice" },
    
    // R
    { id: 43, name: "Raspberries", category: "fruits", calories: 52, protein: 1.2, fiber: 6.5, cholesterol: 0, carbs: 12, fat: 0.7, sugar: 4.4, sodium: 1, icon: "fas fa-apple-alt" },
    { id: 44, name: "Rice (White)", category: "grains", calories: 130, protein: 2.7, fiber: 0.4, cholesterol: 0, carbs: 28, fat: 0.3, sugar: 0.1, sodium: 1, icon: "fas fa-bread-slice" },
    { id: 45, name: "Raisins", category: "fruits", calories: 299, protein: 3.1, fiber: 4, cholesterol: 0, carbs: 79, fat: 0.5, sugar: 59, sodium: 11, icon: "fas fa-apple-alt" },
    
    // S
    { id: 46, name: "Spinach", category: "vegetables", calories: 23, protein: 2.9, fiber: 2.2, cholesterol: 0, carbs: 3.6, fat: 0.4, sugar: 0.4, sodium: 79, icon: "fas fa-carrot" },
    { id: 47, name: "Strawberries", category: "fruits", calories: 32, protein: 0.7, fiber: 2, cholesterol: 0, carbs: 8, fat: 0.3, sugar: 4.9, sodium: 1, icon: "fas fa-apple-alt" },
    { id: 48, name: "Sweet Potato", category: "vegetables", calories: 86, protein: 1.6, fiber: 3, cholesterol: 0, carbs: 20, fat: 0.1, sugar: 4.2, sodium: 4, icon: "fas fa-carrot" },
    { id: 49, name: "Soybeans", category: "proteins", calories: 173, protein: 16, fiber: 6, cholesterol: 0, carbs: 10, fat: 9, sugar: 3, sodium: 1, icon: "fas fa-seedling" },
    { id: 50, name: "Salmon", category: "proteins", calories: 208, protein: 20, fiber: 0, cholesterol: 55, carbs: 0, fat: 13, sugar: 0, sodium: 59, icon: "fas fa-fish" },
    
    // T
    { id: 51, name: "Tomato", category: "vegetables", calories: 18, protein: 0.9, fiber: 1.2, cholesterol: 0, carbs: 3.9, fat: 0.2, sugar: 2.6, sodium: 5, icon: "fas fa-carrot" },
    { id: 52, name: "Tuna", category: "proteins", calories: 144, protein: 30, fiber: 0, cholesterol: 50, carbs: 0, fat: 1, sugar: 0, sodium: 37, icon: "fas fa-fish" },
    { id: 53, name: "Turkey", category: "proteins", calories: 189, protein: 29, fiber: 0, cholesterol: 85, carbs: 0, fat: 7, sugar: 0, sodium: 71, icon: "fas fa-drumstick-bite" },
    
    // U
    { id: 54, name: "Urad Dal", category: "proteins", calories: 347, protein: 25, fiber: 18, cholesterol: 0, carbs: 59, fat: 1.6, sugar: 3.3, sodium: 30, icon: "fas fa-seedling" },
    
    // V
    { id: 55, name: "Walnuts", category: "nuts", calories: 654, protein: 15, fiber: 6.7, cholesterol: 0, carbs: 14, fat: 65, sugar: 2.6, sodium: 2, icon: "fas fa-seedling" },
    { id: 56, name: "Watermelon", category: "fruits", calories: 30, protein: 0.6, fiber: 0.4, cholesterol: 0, carbs: 8, fat: 0.2, sugar: 6, sodium: 1, icon: "fas fa-apple-alt" },
    
    // Y
    { id: 57, name: "Yogurt", category: "dairy", calories: 59, protein: 10, fiber: 0, cholesterol: 5, carbs: 3.6, fat: 0.4, sugar: 3.6, sodium: 36, icon: "fas fa-glass" },
    
    // Z
    { id: 58, name: "Zucchini", category: "vegetables", calories: 17, protein: 1.2, fiber: 1, cholesterol: 0, carbs: 3.1, fat: 0.3, sugar: 2.5, sodium: 8, icon: "fas fa-carrot" }
];

let selectedFoods = [];
let currentFoodFilter = 'all';
let currentLetterFilter = 'all';

// ===== FOOD DATABASE FUNCTIONS =====
function loadFoodDatabase() {
    displayFoods(foodDatabase);
    updateResultsCount(foodDatabase.length);
}

function displayFoods(foods) {
    const foodGrid = document.getElementById('food-grid');
    if (!foodGrid) return;
    
    if (foods.length === 0) {
        foodGrid.innerHTML = '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">No foods found matching your criteria.</p>';
        return;
    }
    
    foodGrid.innerHTML = foods.map(food => `
        <div class="food-card" onclick="showFoodDetails(${food.id})">
            <div class="food-header">
                <div class="food-icon">
                    <i class="${food.icon}"></i>
                </div>
                <div class="food-info">
                    <h4 class="food-name">${food.name}</h4>
                    <span class="food-category">${food.category}</span>
                </div>
            </div>
            <div class="nutrition-preview">
                <div class="nutrition-item">
                    <span class="nutrition-label">Calories</span>
                    <span class="nutrition-value ${food.calories > 100 ? 'high' : 'low'}">${food.calories}</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Protein</span>
                    <span class="nutrition-value ${food.protein > 10 ? 'high' : 'low'}">${food.protein}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Fiber</span>
                    <span class="nutrition-value ${food.fiber > 3 ? 'high' : 'low'}">${food.fiber}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Cholesterol</span>
                    <span class="nutrition-value ${food.cholesterol > 50 ? 'high' : 'low'}">${food.cholesterol}mg</span>
                </div>
            </div>
            <div class="food-actions">
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCalculatorDirect(${food.id})">
                    <i class="fas fa-plus"></i> Add
                </button>
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); showFoodDetails(${food.id})">
                    Details
                </button>
            </div>
        </div>
    `).join('');
}

function searchFoods() {
    const searchTerm = document.getElementById('food-search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const nutrientFilter = document.getElementById('nutrient-filter').value;
    
    let filteredFoods = foodDatabase;
    
    // Apply search term
    if (searchTerm) {
        filteredFoods = filteredFoods.filter(food => 
            food.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filteredFoods = filteredFoods.filter(food => food.category === categoryFilter);
    }
    
    // Apply nutrient filter
    if (nutrientFilter !== 'all') {
        filteredFoods = filterByNutrient(filteredFoods, nutrientFilter);
    }
    
    // Apply letter filter
    if (currentLetterFilter !== 'all') {
        filteredFoods = filteredFoods.filter(food => 
            food.name.toLowerCase().startsWith(currentLetterFilter.toLowerCase())
        );
    }
    
    displayFoods(filteredFoods);
    updateResultsCount(filteredFoods.length);
}

function filterByNutrient(foods, filter) {
    switch(filter) {
        case 'high-protein':
            return foods.filter(food => food.protein >= 10);
        case 'low-protein':
            return foods.filter(food => food.protein < 5);
        case 'high-fiber':
            return foods.filter(food => food.fiber >= 5);
        case 'low-fiber':
            return foods.filter(food => food.fiber < 2);
        case 'low-cholesterol':
            return foods.filter(food => food.cholesterol < 10);
        case 'low-calories':
            return foods.filter(food => food.calories < 50);
        case 'high-calories':
            return foods.filter(food => food.calories > 200);
        default:
            return foods;
    }
}

function filterByLetter(letter) {
    currentLetterFilter = letter;
    
    // Update active button
    document.querySelectorAll('.alphabet-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    searchFoods();
}

function clearFoodFilters() {
    document.getElementById('food-search-input').value = '';
    document.getElementById('category-filter').value = 'all';
    document.getElementById('nutrient-filter').value = 'all';
    currentLetterFilter = 'all';
    
    // Reset alphabet buttons
    document.querySelectorAll('.alphabet-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.alphabet-btn[data-letter="all"]').classList.add('active');
    
    loadFoodDatabase();
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${count} foods found`;
    }
}

function showFoodDetails(foodId) {
    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return;
    
    // Update modal content
    document.getElementById('food-modal-title').textContent = food.name;
    document.getElementById('food-name').textContent = food.name;
    document.getElementById('food-category').textContent = food.category;
    document.getElementById('food-serving').textContent = `Serving: 100g`;
    
    // Update nutrition details
    document.getElementById('detail-calories').textContent = `${food.calories} kcal`;
    document.getElementById('detail-protein').textContent = `${food.protein}g`;
    document.getElementById('detail-fiber').textContent = `${food.fiber}g`;
    document.getElementById('detail-cholesterol').textContent = `${food.cholesterol}mg`;
    document.getElementById('detail-carbs').textContent = `${food.carbs}g`;
    document.getElementById('detail-fat').textContent = `${food.fat}g`;
    document.getElementById('detail-sugar').textContent = `${food.sugar}g`;
    document.getElementById('detail-sodium').textContent = `${food.sodium}mg`;
    
    // Reset quantity
    document.getElementById('food-quantity').value = 100;
    
    // Store current food for calculator
    window.currentFood = food;
    
    openModal('food-details-modal');
}

function addToCalculator() {
    const quantity = parseInt(document.getElementById('food-quantity').value) || 100;
    addToCalculatorWithQuantity(window.currentFood.id, quantity);
    closeModal('food-details-modal');
}

function addToCalculatorDirect(foodId) {
    addToCalculatorWithQuantity(foodId, 100);
}

function addToCalculatorWithQuantity(foodId, quantity) {
    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return;
    
    // Check if food already exists
    const existingIndex = selectedFoods.findIndex(f => f.id === foodId);
    if (existingIndex !== -1) {
        // Update quantity
        selectedFoods[existingIndex].quantity += quantity;
    } else {
        // Add new food
        selectedFoods.push({
            ...food,
            quantity: quantity
        });
    }
    
    updateSelectedFoodsList();
    updateNutritionSummary();
    showNotification(`${food.name} added to calculator!`, 'success');
}

function removeFromCalculator(foodId) {
    selectedFoods = selectedFoods.filter(f => f.id !== foodId);
    updateSelectedFoodsList();
    updateNutritionSummary();
}

function updateSelectedFoodsList() {
    const listContainer = document.getElementById('selected-foods-list');
    if (!listContainer) return;
    
    if (selectedFoods.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No foods selected. Add foods from the database to calculate nutrition.</p>';
        return;
    }
    
    listContainer.innerHTML = selectedFoods.map(food => `
        <div class="selected-food-item">
            <div class="selected-food-info">
                <div class="selected-food-name">${food.name}</div>
                <div class="selected-food-quantity">${food.quantity}g</div>
            </div>
            <button class="remove-food-btn" onclick="removeFromCalculator(${food.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function updateNutritionSummary() {
    const totals = calculateNutritionTotals();
    
    // Update nutrition cards
    document.getElementById('total-calories').textContent = totals.calories;
    document.getElementById('total-protein').textContent = `${totals.protein}g`;
    document.getElementById('total-fiber').textContent = `${totals.fiber}g`;
    document.getElementById('total-cholesterol').textContent = `${totals.cholesterol}mg`;
    
    // Update analysis
    updateNutritionAnalysis(totals);
}

function calculateNutritionTotals() {
    const totals = {
        calories: 0,
        protein: 0,
        fiber: 0,
        cholesterol: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
        sodium: 0
    };
    
    selectedFoods.forEach(food => {
        const multiplier = food.quantity / 100;
        totals.calories += Math.round(food.calories * multiplier);
        totals.protein += Math.round(food.protein * multiplier * 10) / 10;
        totals.fiber += Math.round(food.fiber * multiplier * 10) / 10;
        totals.cholesterol += Math.round(food.cholesterol * multiplier);
        totals.carbs += Math.round(food.carbs * multiplier * 10) / 10;
        totals.fat += Math.round(food.fat * multiplier * 10) / 10;
        totals.sugar += Math.round(food.sugar * multiplier * 10) / 10;
        totals.sodium += Math.round(food.sodium * multiplier);
    });
    
    return totals;
}

function updateNutritionAnalysis(totals) {
    const analysisText = document.getElementById('nutrition-analysis-text');
    if (!analysisText) return;
    
    let analysis = [];
    
    // Protein analysis
    if (totals.protein >= 50) {
        analysis.push("✅ High protein content - excellent for muscle building and repair");
    } else if (totals.protein >= 25) {
        analysis.push("✓ Good protein content - supports muscle health");
    } else {
        analysis.push("⚠️ Low protein content - consider adding more protein-rich foods");
    }
    
    // Fiber analysis
    if (totals.fiber >= 25) {
        analysis.push("✅ High fiber content - excellent for digestive health");
    } else if (totals.fiber >= 15) {
        analysis.push("✓ Good fiber content - supports digestive health");
    } else {
        analysis.push("⚠️ Low fiber content - consider adding more fiber-rich foods");
    }
    
    // Cholesterol analysis
    if (totals.cholesterol <= 50) {
        analysis.push("✅ Low cholesterol - heart-healthy choice");
    } else if (totals.cholesterol <= 150) {
        analysis.push("✓ Moderate cholesterol - acceptable levels");
    } else {
        analysis.push("⚠️ High cholesterol - consider reducing high-cholesterol foods");
    }
    
    // Calorie analysis
    if (totals.calories <= 300) {
        analysis.push("✅ Low calorie - great for weight management");
    } else if (totals.calories <= 600) {
        analysis.push("✓ Moderate calorie - balanced meal");
    } else {
        analysis.push("⚠️ High calorie - may be excessive for some dietary goals");
    }
    
    analysisText.innerHTML = analysis.join('<br>');
}

function clearCalculator() {
    selectedFoods = [];
    updateSelectedFoodsList();
    updateNutritionSummary();
    showNotification('Calculator cleared!', 'info');
}

function exportNutritionData() {
    if (selectedFoods.length === 0) {
        showNotification('No foods selected to export', 'error');
        return;
    }
    
    const totals = calculateNutritionTotals();
    const exportData = {
        selectedFoods: selectedFoods.map(food => ({
            name: food.name,
            category: food.category,
            quantity: food.quantity,
            nutrition: {
                calories: Math.round(food.calories * food.quantity / 100),
                protein: Math.round(food.protein * food.quantity / 100 * 10) / 10,
                fiber: Math.round(food.fiber * food.quantity / 100 * 10) / 10,
                cholesterol: Math.round(food.cholesterol * food.quantity / 100),
                carbs: Math.round(food.carbs * food.quantity / 100 * 10) / 10,
                fat: Math.round(food.fat * food.quantity / 100 * 10) / 10,
                sugar: Math.round(food.sugar * food.quantity / 100 * 10) / 10,
                sodium: Math.round(food.sodium * food.quantity / 100)
            }
        })),
        totals: totals,
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.name || 'Guest'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nutrition-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Nutrition data exported successfully!', 'success');
}
function loadAdminData() {
    if (!currentUser || currentUser.role !== 'admin') {
        showSection('login-section');
        showNotification('Admin access required', 'error');
        return;
    }
    
    // Update admin statistics
    updateAdminStats();
    
    // Load patient data
    loadPatientTable();
    
    // Load appointments
    loadAdminAppointments();
    
    showNotification('Admin dashboard loaded', 'success');
}

function updateAdminStats() {
    const totalPatients = patients.length;
    const todayAppointments = appointments.filter(apt => {
        return apt.date === new Date().toISOString().split('T')[0];
    }).length;
    
    // Update DOM
    const totalPatientsEl = document.getElementById('total-patients');
    const todayAppointmentsEl = document.getElementById('today-appointments');
    
    if (totalPatientsEl) totalPatientsEl.textContent = totalPatients;
    if (todayAppointmentsEl) todayAppointmentsEl.textContent = todayAppointments;
}

function loadPatientTable() {
    const tableBody = document.getElementById('patient-table-body');
    if (!tableBody) return;
    
    if (patients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No patients found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.firstName} ${patient.lastName}</td>
            <td>${patient.email}</td>
            <td>${patient.phone || 'N/A'}</td>
            <td>${new Date(patient.createdAt).toLocaleDateString()}</td>
            <td><span class="status-badge active">Active</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editPatient('${patient.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deletePatient('${patient.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadAdminAppointments() {
    const appointmentGrid = document.getElementById('appointment-grid');
    if (!appointmentGrid) return;
    
    if (appointments.length === 0) {
        appointmentGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">No appointments scheduled</p>';
        return;
    }
    
    appointmentGrid.innerHTML = appointments.map(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
        
        return `
            <div class="appointment-card" data-appointment-id="${apt.id}">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-patient">${patientName}</div>
                        <div class="appointment-doctor">${apt.doctor}</div>
                    </div>
                    <div class="appointment-time">${apt.time}</div>
                </div>
                <div class="appointment-details">
                    <div class="appointment-reason">${apt.reason}</div>
                    <div class="appointment-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(apt.date).toLocaleDateString()}
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-outline btn-sm" onclick="rescheduleAppointment('${apt.id}')">Reschedule</button>
                    <button class="appointment-delete-btn" onclick="deleteAdminAppointment('${apt.id}')" title="Delete appointment">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Admin action functions
function refreshAdminData() {
    showNotification('Refreshing admin data...', 'info');
    loadAdminData();
}

function deleteAdminAppointment(appointmentId) {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }
    
    // Find and remove appointment
    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex !== -1) {
        const deletedAppointment = appointments[appointmentIndex];
        
        appointments.splice(appointmentIndex, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification(`Appointment with ${deletedAppointment.patientName || 'patient'} deleted successfully`, 'success');
        loadAdminAppointments();
    }
}

function exportPatientData() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }
    
    const exportData = {
        patients: patients,
        appointments: appointments,
        systemStats: getSystemStatistics(),
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.name
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `admin-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

function getSystemStatistics() {
    return {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        activePatients: patients.filter(p => p.status !== 'inactive').length,
        todayAppointments: appointments.filter(apt => 
            apt.date === new Date().toISOString().split('T')[0]
        ).length,
        averageAge: calculateAverageAge(),
        genderDistribution: getGenderDistribution(),
        appointmentTrends: getAppointmentTrends()
    };
}

function calculateAverageAge() {
    if (patients.length === 0) return 0;
    const totalAge = patients.reduce((sum, patient) => {
        if (patient.dob) {
            const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
            return sum + age;
        }
        return sum;
    }, 0);
    return Math.round(totalAge / patients.length);
}

function getGenderDistribution() {
    const distribution = { male: 0, female: 0, other: 0 };
    patients.forEach(patient => {
        const gender = (patient.gender || 'other').toLowerCase();
        if (distribution[gender] !== undefined) {
            distribution[gender]++;
        } else {
            distribution.other++;
        }
    });
    return distribution;
}

function getAppointmentTrends() {
    const today = new Date();
    const trends = {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        lastMonth: 0
    };
    
    appointments.forEach(apt => {
        const aptDate = new Date(apt.date);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        if (aptDate.toDateString() === today.toDateString()) {
            trends.today++;
        }
        if (aptDate >= weekAgo) {
            trends.thisWeek++;
        }
        if (aptDate >= monthAgo) {
            trends.thisMonth++;
        }
        if (aptDate < monthAgo && aptDate >= new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000)) {
            trends.lastMonth++;
        }
    });
    
    return trends;
}

function addNewPatient() {
    // Create a simple add patient modal
    const modalHtml = `
        <div id="add-patient-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Patient</h3>
                    <button class="close-btn" onclick="closeModal('add-patient-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-patient-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="new-patient-firstname">First Name</label>
                                <input type="text" id="new-patient-firstname" required>
                            </div>
                            <div class="form-group">
                                <label for="new-patient-lastname">Last Name</label>
                                <input type="text" id="new-patient-lastname" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="new-patient-email">Email</label>
                            <input type="email" id="new-patient-email" required>
                        </div>
                        <div class="form-group">
                            <label for="new-patient-phone">Phone</label>
                            <input type="tel" id="new-patient-phone" required>
                        </div>
                        <div class="form-group">
                            <label for="new-patient-dob">Date of Birth</label>
                            <input type="date" id="new-patient-dob" required>
                        </div>
                        <div class="form-group">
                            <label for="new-patient-gender">Gender</label>
                            <select id="new-patient-gender" required>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-patient-password">Temporary Password</label>
                            <input type="password" id="new-patient-password" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Add Patient</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Setup form submission
    const form = document.getElementById('add-patient-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newPatient = {
                id: Date.now().toString(),
                firstName: document.getElementById('new-patient-firstname').value,
                lastName: document.getElementById('new-patient-lastname').value,
                email: document.getElementById('new-patient-email').value,
                phone: document.getElementById('new-patient-phone').value,
                dob: document.getElementById('new-patient-dob').value,
                gender: document.getElementById('new-patient-gender').value,
                password: document.getElementById('new-patient-password').value,
                createdAt: new Date().toISOString(),
                status: 'active',
                healthData: {
                    heartRate: 72,
                    bmi: 24.5,
                    bloodPressure: '120/80',
                    temperature: 98.6
                },
                activities: []
            };
            
            // Check if email already exists
            if (patients.find(p => p.email === newPatient.email)) {
                showNotification('Email already exists', 'error');
                return;
            }
            
            patients.push(newPatient);
            localStorage.setItem('patients', JSON.stringify(patients));
            
            loadPatientTable();
            updateAdminStats();
            closeModal('add-patient-modal');
            showNotification('Patient added successfully!', 'success');
        });
    }
}

function editPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    const modalHtml = `
        <div id="edit-patient-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Patient - ${patient.firstName} ${patient.lastName}</h3>
                    <button class="close-btn" onclick="closeModal('edit-patient-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-patient-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-patient-firstname">First Name</label>
                                <input type="text" id="edit-patient-firstname" value="${patient.firstName}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-patient-lastname">Last Name</label>
                                <input type="text" id="edit-patient-lastname" value="${patient.lastName}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-patient-email">Email</label>
                            <input type="email" id="edit-patient-email" value="${patient.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-patient-phone">Phone</label>
                            <input type="tel" id="edit-patient-phone" value="${patient.phone || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-patient-status">Status</label>
                            <select id="edit-patient-status" required>
                                <option value="active" ${patient.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${patient.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Update Patient</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const form = document.getElementById('edit-patient-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            patient.firstName = document.getElementById('edit-patient-firstname').value;
            patient.lastName = document.getElementById('edit-patient-lastname').value;
            patient.email = document.getElementById('edit-patient-email').value;
            patient.phone = document.getElementById('edit-patient-phone').value;
            patient.status = document.getElementById('edit-patient-status').value;
            patient.updatedAt = new Date().toISOString();
            
            localStorage.setItem('patients', JSON.stringify(patients));
            loadPatientTable();
            closeModal('edit-patient-modal');
            showNotification('Patient updated successfully!', 'success');
        });
    }
}

function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        patients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        loadPatientTable();
        updateAdminStats();
        showNotification('Patient deleted successfully', 'success');
    }
}

function scheduleNewAppointment() {
    const modalHtml = `
        <div id="schedule-appointment-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Schedule New Appointment</h3>
                    <button class="close-btn" onclick="closeModal('schedule-appointment-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="schedule-appointment-form">
                        <div class="form-group">
                            <label for="schedule-patient">Select Patient</label>
                            <select id="schedule-patient" required>
                                <option value="">Choose a patient...</option>
                                ${patients.map(p => `
                                    <option value="${p.id}">${p.firstName} ${p.lastName} - ${p.email}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="schedule-doctor">Doctor</label>
                            <select id="schedule-doctor" required>
                                <option value="">Choose a doctor...</option>
                                <option value="Dr. Sarah Smith">Dr. Sarah Smith - General Physician</option>
                                <option value="Dr. Michael Jones">Dr. Michael Jones - Cardiologist</option>
                                <option value="Dr. Emily Wilson">Dr. Emily Wilson - Neurologist</option>
                                <option value="Dr. James Brown">Dr. James Brown - Pediatrician</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="schedule-date">Date</label>
                                <input type="date" id="schedule-date" required>
                            </div>
                            <div class="form-group">
                                <label for="schedule-time">Time</label>
                                <input type="time" id="schedule-time" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="schedule-reason">Reason for Visit</label>
                            <textarea id="schedule-reason" rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Schedule Appointment</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const form = document.getElementById('schedule-appointment-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newAppointment = {
                id: Date.now().toString(),
                patientId: document.getElementById('schedule-patient').value,
                doctor: document.getElementById('schedule-doctor').value,
                date: document.getElementById('schedule-date').value,
                time: document.getElementById('schedule-time').value,
                reason: document.getElementById('schedule-reason').value,
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };
            
            appointments.push(newAppointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            loadAdminAppointments();
            updateAdminStats();
            closeModal('schedule-appointment-modal');
            showNotification('Appointment scheduled successfully!', 'success');
        });
    }
}

function rescheduleAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const modalHtml = `
        <div id="reschedule-appointment-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reschedule Appointment</h3>
                    <button class="close-btn" onclick="closeModal('reschedule-appointment-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="reschedule-appointment-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="reschedule-date">New Date</label>
                                <input type="date" id="reschedule-date" value="${appointment.date}" required>
                            </div>
                            <div class="form-group">
                                <label for="reschedule-time">New Time</label>
                                <input type="time" id="reschedule-time" value="${appointment.time}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="reschedule-reason">Reason for Rescheduling</label>
                            <textarea id="reschedule-reason" rows="2" placeholder="Optional: reason for rescheduling"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Update Appointment</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const form = document.getElementById('reschedule-appointment-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            appointment.date = document.getElementById('reschedule-date').value;
            appointment.time = document.getElementById('reschedule-time').value;
            appointment.rescheduleReason = document.getElementById('reschedule-reason').value;
            appointment.updatedAt = new Date().toISOString();
            
            localStorage.setItem('appointments', JSON.stringify(appointments));
            loadAdminAppointments();
            closeModal('reschedule-appointment-modal');
            showNotification('Appointment rescheduled successfully!', 'success');
        });
    }
}

function cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
            appointment.status = 'cancelled';
            appointment.cancelledAt = new Date().toISOString();
            
            localStorage.setItem('appointments', JSON.stringify(appointments));
            loadAdminAppointments();
            updateAdminStats();
            showNotification('Appointment cancelled', 'success');
        }
    }
}

function sendBulkNotification() {
    const modalHtml = `
        <div id="bulk-notification-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Send Bulk Notification</h3>
                    <button class="close-btn" onclick="closeModal('bulk-notification-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="bulk-notification-form">
                        <div class="form-group">
                            <label for="notification-recipients">Recipients</label>
                            <select id="notification-recipients" required>
                                <option value="all">All Patients</option>
                                <option value="active">Active Patients Only</option>
                                <option value="recent">Recent Appointments</option>
                                <option value="custom">Custom Email/Phone</option>
                            </select>
                        </div>
                        <div class="form-group" id="custom-recipient-group" style="display: none;">
                            <label for="custom-email">Gmail Address</label>
                            <input type="email" id="custom-email" placeholder="example@gmail.com">
                        </div>
                        <div class="form-group" id="custom-phone-group" style="display: none;">
                            <label for="custom-phone">Mobile Number</label>
                            <input type="tel" id="custom-phone" placeholder="+1234567890">
                        </div>
                        <div class="form-group">
                            <label for="notification-subject">Subject</label>
                            <input type="text" id="notification-subject" placeholder="Enter notification subject" required>
                        </div>
                        <div class="form-group">
                            <label for="notification-message">Message</label>
                            <textarea id="notification-message" rows="4" placeholder="Enter your message here..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="notification-urgent">
                                Mark as urgent
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="send-email" checked>
                                Send via Email
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="send-sms">
                                Send via SMS
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Send Notification</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Handle recipient type change
    const recipientsSelect = document.getElementById('notification-recipients');
    const customEmailGroup = document.getElementById('custom-recipient-group');
    const customPhoneGroup = document.getElementById('custom-phone-group');
    
    recipientsSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customEmailGroup.style.display = 'block';
            customPhoneGroup.style.display = 'block';
        } else {
            customEmailGroup.style.display = 'none';
            customPhoneGroup.style.display = 'none';
        }
    });
    
    const form = document.getElementById('bulk-notification-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const recipients = document.getElementById('notification-recipients').value;
            const subject = document.getElementById('notification-subject').value;
            const message = document.getElementById('notification-message').value;
            const urgent = document.getElementById('notification-urgent').checked;
            const sendEmail = document.getElementById('send-email').checked;
            const sendSMS = document.getElementById('send-sms').checked;
            const customEmail = document.getElementById('custom-email').value;
            const customPhone = document.getElementById('custom-phone').value;
            
            // Prepare notification data
            const notificationData = {
                subject,
                message,
                urgent,
                timestamp: new Date().toISOString()
            };
            
            let recipientCount = 0;
            let emailRecipients = [];
            let smsRecipients = [];
            
            if (recipients === 'custom') {
                // Custom recipient
                if (sendEmail && customEmail) {
                    emailRecipients.push(customEmail);
                    sendEmailNotification(customEmail, subject, message, urgent);
                }
                if (sendSMS && customPhone) {
                    smsRecipients.push(customPhone);
                    sendSMSNotification(customPhone, message, urgent);
                }
                recipientCount = 1;
            } else {
                // Bulk recipients
                let targetPatients = [];
                switch(recipients) {
                    case 'all':
                        targetPatients = patients;
                        break;
                    case 'active':
                        targetPatients = patients.filter(p => p.status === 'active');
                        break;
                    case 'recent':
                        const recentDate = new Date();
                        recentDate.setDate(recentDate.getDate() - 7);
                        const recentPatientIds = [...new Set(appointments
                            .filter(apt => new Date(apt.date) >= recentDate)
                            .map(apt => apt.patientId))];
                        targetPatients = patients.filter(p => recentPatientIds.includes(p.id));
                        break;
                }
                
                // Collect emails and phone numbers
                targetPatients.forEach(patient => {
                    if (sendEmail && patient.email) {
                        emailRecipients.push(patient.email);
                        sendEmailNotification(patient.email, subject, message, urgent);
                    }
                    if (sendSMS && patient.phone) {
                        smsRecipients.push(patient.phone);
                        sendSMSNotification(patient.phone, message, urgent);
                    }
                });
                
                recipientCount = targetPatients.length;
            }
            
            // Store notification record
            const notification = {
                id: Date.now().toString(),
                type: recipients === 'custom' ? 'custom' : 'bulk',
                recipientCount,
                emailRecipients,
                smsRecipients,
                subject,
                message,
                urgent,
                sentBy: currentUser.id,
                sentAt: new Date().toISOString()
            };
            
            // Save to notifications array
            if (!window.notifications) window.notifications = [];
            window.notifications.push(notification);
            localStorage.setItem('notifications', JSON.stringify(window.notifications));
            
            closeModal('bulk-notification-modal');
            showNotification(`Notification sent to ${recipientCount} recipients! (${emailRecipients.length} email, ${smsRecipients.length} SMS)`, 'success');
        });
    }
}

// Email notification function
function sendEmailNotification(email, subject, message, urgent) {
    // In a real implementation, this would use a service like EmailJS, SendGrid, or backend API
    // For demo purposes, we'll simulate the email sending
    
    const emailData = {
        to: email,
        subject: urgent ? `🚨 URGENT: ${subject}` : subject,
        message: message,
        timestamp: new Date().toISOString(),
        type: 'email',
        status: 'sent'
    };
    
    // Simulate email sending
    console.log('Sending email:', emailData);
    
    // Store sent email
    if (!window.sentEmails) window.sentEmails = [];
    window.sentEmails.push(emailData);
    localStorage.setItem('sentEmails', JSON.stringify(window.sentEmails));
    
    // In production, you would use something like:
    // EmailJS.send('service_id', 'template_id', {
    //     to_email: email,
    //     subject: subject,
    //     message: message
    // });
}

// SMS notification function
function sendSMSNotification(phone, message, urgent) {
    // In a real implementation, this would use a service like Twilio, Nexmo, or backend API
    // For demo purposes, we'll simulate the SMS sending
    
    const smsData = {
        to: phone,
        message: urgent ? `🚨 URGENT: ${message}` : message,
        timestamp: new Date().toISOString(),
        type: 'sms',
        status: 'sent'
    };
    
    // Simulate SMS sending
    console.log('Sending SMS:', smsData);
    
    // Store sent SMS
    if (!window.sentSMS) window.sentSMS = [];
    window.sentSMS.push(smsData);
    localStorage.setItem('sentSMS', JSON.stringify(window.sentSMS));
    
    // In production, you would use something like:
    // fetch('/api/send-sms', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         to: phone,
    //         message: message
    //     })
    // });
}

function generateReports() {
    const modalHtml = `
        <div id="generate-reports-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Generate Reports</h3>
                    <button class="close-btn" onclick="closeModal('generate-reports-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="report-options">
                        <div class="report-option">
                            <h4>Patient Reports</h4>
                            <button class="btn btn-outline btn-sm" onclick="generatePatientReport()">Patient List</button>
                            <button class="btn btn-outline btn-sm" onclick="generateHealthReport()">Health Statistics</button>
                        </div>
                        <div class="report-option">
                            <h4>Appointment Reports</h4>
                            <button class="btn btn-outline btn-sm" onclick="generateAppointmentReport()">Appointment Schedule</button>
                            <button class="btn btn-outline btn-sm" onclick="generateRevenueReport()">Revenue Analysis</button>
                        </div>
                        <div class="report-option">
                            <h4>System Reports</h4>
                            <button class="btn btn-outline btn-sm" onclick="generateSystemReport()">System Overview</button>
                            <button class="btn btn-outline btn-sm" onclick="generateActivityReport()">Activity Log</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function generatePatientReport() {
    const reportData = {
        title: 'Patient List Report',
        generatedAt: new Date().toISOString(),
        patients: patients.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            email: p.email,
            phone: p.phone,
            status: p.status,
            registrationDate: p.createdAt,
            age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 'N/A'
        }))
    };
    
    downloadReport(reportData, 'patient-list-report');
    closeModal('generate-reports-modal');
    showNotification('Patient report generated!', 'success');
}

function generateHealthReport() {
    const healthStats = patients.map(p => ({
        patientName: `${p.firstName} ${p.lastName}`,
        healthData: p.healthData || {},
        lastUpdated: p.healthData?.lastUpdated || 'N/A'
    }));
    
    const reportData = {
        title: 'Health Statistics Report',
        generatedAt: new Date().toISOString(),
        summary: {
            totalPatients: patients.length,
            averageBMI: calculateAverageBMI(),
            averageHeartRate: calculateAverageHeartRate(),
            bloodPressureDistribution: getBloodPressureDistribution()
        },
        patientHealthData: healthStats
    };
    
    downloadReport(reportData, 'health-statistics-report');
    closeModal('generate-reports-modal');
    showNotification('Health report generated!', 'success');
}

function generateAppointmentReport() {
    const reportData = {
        title: 'Appointment Schedule Report',
        generatedAt: new Date().toISOString(),
        appointments: appointments,
        summary: {
            total: appointments.length,
            today: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length,
            thisWeek: appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return aptDate >= weekAgo;
            }).length
        }
    };
    
    downloadReport(reportData, 'appointment-schedule-report');
    closeModal('generate-reports-modal');
    showNotification('Appointment report generated!', 'success');
}

function generateRevenueReport() {
    const revenueData = appointments.map(apt => ({
        date: apt.date,
        doctor: apt.doctor,
        estimatedRevenue: Math.floor(Math.random() * 200) + 50 // Simulated revenue
    }));
    
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.estimatedRevenue, 0);
    
    const reportData = {
        title: 'Revenue Analysis Report',
        generatedAt: new Date().toISOString(),
        summary: {
            totalRevenue: totalRevenue,
            averagePerAppointment: Math.round(totalRevenue / appointments.length),
            totalAppointments: appointments.length
        },
        revenueBreakdown: revenueData
    };
    
    downloadReport(reportData, 'revenue-analysis-report');
    closeModal('generate-reports-modal');
    showNotification('Revenue report generated!', 'success');
}

function generateSystemReport() {
    const reportData = {
        title: 'System Overview Report',
        generatedAt: new Date().toISOString(),
        systemStats: getSystemStatistics(),
        patients: patients.length,
        appointments: appointments.length,
        systemHealth: {
            status: 'Optimal',
            uptime: '99.9%',
            lastBackup: new Date().toISOString()
        }
    };
    
    downloadReport(reportData, 'system-overview-report');
    closeModal('generate-reports-modal');
    showNotification('System report generated!', 'success');
}

function generateActivityReport() {
    const activities = [];
    patients.forEach(patient => {
        if (patient.activities) {
            patient.activities.forEach(activity => {
                activities.push({
                    patientName: `${patient.firstName} ${patient.lastName}`,
                    ...activity
                });
            });
        }
    });
    
    const reportData = {
        title: 'Activity Log Report',
        generatedAt: new Date().toISOString(),
        totalActivities: activities.length,
        activities: activities.sort((a, b) => new Date(b.time) - new Date(a.time))
    };
    
    downloadReport(reportData, 'activity-log-report');
    closeModal('generate-reports-modal');
    showNotification('Activity report generated!', 'success');
}

function downloadReport(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
}

function calculateAverageBMI() {
    const validBMI = patients
        .map(p => p.healthData?.bmi)
        .filter(bmi => bmi && !isNaN(bmi));
    
    if (validBMI.length === 0) return 0;
    return (validBMI.reduce((sum, bmi) => sum + bmi, 0) / validBMI.length).toFixed(1);
}

function calculateAverageHeartRate() {
    const validHR = patients
        .map(p => p.healthData?.heartRate)
        .filter(hr => hr && !isNaN(hr));
    
    if (validHR.length === 0) return 0;
    return Math.round(validHR.reduce((sum, hr) => sum + hr, 0) / validHR.length);
}

function getBloodPressureDistribution() {
    const distribution = { normal: 0, elevated: 0, high: 0 };
    patients.forEach(patient => {
        const bp = patient.healthData?.bloodPressure;
        if (bp) {
            const [systolic, diastolic] = bp.split('/').map(Number);
            if (systolic > 140 || diastolic > 90) {
                distribution.high++;
            } else if (systolic > 120 || diastolic > 80) {
                distribution.elevated++;
            } else {
                distribution.normal++;
            }
        }
    });
    return distribution;
}

function manageSystem() {
    const modalHtml = `
        <div id="system-settings-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>System Settings</h3>
                    <button class="close-btn" onclick="closeModal('system-settings-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h4>System Configuration</h4>
                        <div class="setting-item">
                            <label>System Name</label>
                            <input type="text" value="Smart Health System" readonly>
                        </div>
                        <div class="setting-item">
                            <label>Admin Email</label>
                            <input type="email" value="${currentUser.email}" readonly>
                        </div>
                        <div class="setting-item">
                            <label>System Version</label>
                            <input type="text" value="v2.0.1" readonly>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>Data Management</h4>
                        <button class="btn btn-outline" onclick="backupData()">Backup All Data</button>
                        <button class="btn btn-outline" onclick="clearCache()">Clear Cache</button>
                        <button class="btn btn-danger" onclick="resetSystem()">Reset System (Dangerous)</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function backupData() {
    const backupData = {
        patients: patients,
        appointments: appointments,
        systemSettings: {
            backupDate: new Date().toISOString(),
            version: '2.0.1'
        }
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `system-backup-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
    
    showNotification('System backup created!', 'success');
}

function clearCache() {
    if (confirm('Clear all cached data? This will not delete patient records.')) {
        localStorage.removeItem('tempData');
        showNotification('Cache cleared successfully!', 'success');
    }
}

function resetSystem() {
    if (confirm('⚠️ DANGER: This will delete ALL patient data and appointments. This cannot be undone. Are you absolutely sure?')) {
        if (confirm('Final confirmation: This will permanently delete all data. Type "RESET" to confirm:')) {
            const confirmation = prompt('Type "RESET" to confirm system reset:');
            if (confirmation === 'RESET') {
                localStorage.clear();
                patients = [];
                appointments = [];
                currentUser = null;
                showNotification('System reset completed. Refreshing page...', 'info');
                setTimeout(() => location.reload(), 2000);
            }
        }
    }
}

function viewLogs() {
    const logs = [
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'Admin dashboard accessed', user: currentUser.name },
        { timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'INFO', message: 'Patient data exported', user: currentUser.name },
        { timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'WARNING', message: 'High server load detected', user: 'System' },
        { timestamp: new Date(Date.now() - 10800000).toISOString(), level: 'INFO', message: 'Daily backup completed', user: 'System' },
        { timestamp: new Date(Date.now() - 14400000).toISOString(), level: 'ERROR', message: 'Failed to send email notification', user: 'System' }
    ];
    
    const modalHtml = `
        <div id="system-logs-modal" class="modal active">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>System Logs</h3>
                    <button class="close-btn" onclick="closeModal('system-logs-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="log-controls">
                        <select id="log-level-filter">
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                        <button class="btn btn-outline btn-sm" onclick="refreshLogs()">Refresh</button>
                    </div>
                    <div class="log-container">
                        ${logs.map(log => `
                            <div class="log-entry log-${log.level.toLowerCase()}">
                                <span class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
                                <span class="log-level">[${log.level}]</span>
                                <span class="log-user">${log.user}:</span>
                                <span class="log-message">${log.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function refreshLogs() {
    showNotification('Logs refreshed!', 'info');
    viewLogs(); // Re-open logs modal with fresh data
}

// Search functionality
function setupPatientSearch() {
    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredPatients = patients.filter(patient => 
                patient.firstName.toLowerCase().includes(searchTerm) ||
                patient.lastName.toLowerCase().includes(searchTerm) ||
                patient.email.toLowerCase().includes(searchTerm)
            );
            
            // Temporarily update table with filtered results
            const originalPatients = patients;
            patients = filteredPatients;
            loadPatientTable();
            patients = originalPatients;
        });
    }
}

// Filter functionality
function setupAppointmentFilter() {
    const filterSelect = document.getElementById('appointment-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const filterValue = e.target.value;
            let filteredAppointments = appointments;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch(filterValue) {
                case 'today':
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    filteredAppointments = appointments.filter(apt => {
                        const aptDate = new Date(apt.date);
                        return aptDate >= today && aptDate < tomorrow;
                    });
                    break;
                case 'week':
                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    filteredAppointments = appointments.filter(apt => {
                        const aptDate = new Date(apt.date);
                        return aptDate >= today && aptDate < nextWeek;
                    });
                    break;
                case 'month':
                    const nextMonth = new Date(today);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    filteredAppointments = appointments.filter(apt => {
                        const aptDate = new Date(apt.date);
                        return aptDate >= today && aptDate < nextMonth;
                    });
                    break;
            }
            
            // Temporarily update appointments with filtered results
            const originalAppointments = appointments;
            appointments = filteredAppointments;
            loadAdminAppointments();
            appointments = originalAppointments;
        });
    }
}

// ===== MODALS =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== DEMO DATA =====
function initializeDemoData() {
    // Add demo patients if none exist
    if (patients.length === 0) {
        const demoPatients = [
            {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                dob: '1990-01-01',
                password: 'password123',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                phone: '+0987654321',
                dob: '1985-05-15',
                password: 'password123',
                createdAt: new Date().toISOString()
            }
        ];
        
        patients = demoPatients;
        localStorage.setItem('patients', JSON.stringify(patients));
    }
    
    // Add demo appointments if none exist
    if (appointments.length === 0) {
        const demoAppointments = [
            {
                id: '1',
                patientId: '1',
                doctor: 'Dr. Sarah Smith - General Physician',
                date: '2024-01-15',
                time: '10:00',
                reason: 'Annual check-up',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                patientId: '1',
                doctor: 'Dr. Michael Jones - Cardiologist',
                date: '2024-01-20',
                time: '14:30',
                reason: 'Heart consultation',
                createdAt: new Date().toISOString()
            }
        ];
        
        appointments = demoAppointments;
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });
    
    // Login/Logout buttons
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showSection('login-section'));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding form
            const tabType = this.getAttribute('data-tab');
            const patientForm = document.getElementById('patient-login-form');
            const adminForm = document.getElementById('admin-login-form');
            
            if (tabType === 'patient') {
                patientForm.classList.add('active');
                adminForm.classList.remove('active');
            } else {
                patientForm.classList.remove('active');
                adminForm.classList.add('active');
            }
        });
    });
    
    // Patient login form
    const patientLoginForm = document.getElementById('patient-login-form');
    if (patientLoginForm) {
        patientLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('patient-email').value;
            const password = document.getElementById('patient-password').value;
            login(email, password, 'patient');
        });
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            login(username, password, 'admin');
        });
    }
    
    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const patientData = {
                firstName: document.getElementById('reg-firstname').value,
                lastName: document.getElementById('reg-lastname').value,
                email: document.getElementById('reg-email').value,
                phone: document.getElementById('reg-phone').value,
                dob: document.getElementById('reg-dob').value,
                password: document.getElementById('reg-password').value,
                confirmPassword: document.getElementById('reg-confirm-password').value
            };
            
            register(patientData);
        });
    }
    
    // Show registration modal
    const showRegisterBtn = document.getElementById('show-register');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('register-modal');
        });
    }
    
    // Appointment form
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const appointmentData = {
                doctor: document.getElementById('appointment-doctor').value,
                date: document.getElementById('appointment-date').value,
                time: document.getElementById('appointment-time').value,
                reason: document.getElementById('appointment-reason').value
            };
            
            scheduleAppointment(appointmentData);
        });
    }
    
    // Todo list input
    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodoTask();
            }
        });
    }
    const dailyHealthForm = document.getElementById('daily-health-form');
    if (dailyHealthForm) {
        dailyHealthForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const healthData = {
                heartRate: parseInt(document.getElementById('heart-rate').value),
                bmi: parseFloat(document.getElementById('bmi').value),
                bloodPressure: `${document.getElementById('blood-pressure-systolic').value}/${document.getElementById('blood-pressure-diastolic').value}`,
                temperature: parseFloat(document.getElementById('temperature').value),
                weight: parseFloat(document.getElementById('weight').value),
                notes: document.getElementById('health-notes').value
            };
            
            saveDailyHealthCheck(healthData);
        });
    }
    
    // Symptom search
    const symptomSearch = document.getElementById('symptom-search');
    if (symptomSearch) {
        symptomSearch.addEventListener('input', function(e) {
            const query = e.target.value;
            if (query.length > 2) {
                searchSymptoms(query);
            }
        });
    }
    
    // Category filters
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterSymptomsByCategory(category);
        });
    });

    // Symptom search
    const symptomSearchInput = document.getElementById('symptom-search');
    if (symptomSearchInput) {
        symptomSearchInput.addEventListener('input', function(e) {
            const query = e.target.value;
            searchSymptoms(query);
        });
    }

    // Food search
    const foodSearchInput = document.getElementById('food-search-input');
    if (foodSearchInput) {
        foodSearchInput.addEventListener('input', searchFoods);
    }
    
    // Food filters
    const categoryFilter = document.getElementById('category-filter');
    const nutrientFilter = document.getElementById('nutrient-filter');
    if (categoryFilter) categoryFilter.addEventListener('change', searchFoods);
    if (nutrientFilter) nutrientFilter.addEventListener('change', searchFoods);
    
    // Recommendation filter
    const recommendationFilter = document.getElementById('recommendation-filter');
    if (recommendationFilter) {
        recommendationFilter.addEventListener('change', function(e) {
            filterRecommendations(e.target.value);
        });
    }
    
    // Add symptom analysis button to dashboard
    const analysisBtn = document.getElementById('analyze-symptoms-btn');
    if (analysisBtn) {
        analysisBtn.addEventListener('click', analyzeSymptoms);
    }

    // ... (rest of the code remains the same)

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Export functions for global access
window.SmartHealthSystem = {
    login,
    register,
    logout,
    calculateBMI,
    searchSymptoms,
    selectSymptom,
    toggleTheme,
    openModal,
    closeModal,
    showNotification,
    refreshDashboard,
    exportHealthReport,
    toggleMobileMenu,
    editProfile,
    viewHealthHistory,
    exportData,
    showProfileModal,
    // Dashboard functions
    toggleHealthCheck,
    saveDailyHealthCheck,
    scheduleDoctorAppointment,
    viewExercisePlan,
    setHydrationReminder,
    // Symptom functions
    loadSymptoms,
    searchSymptoms,
    filterSymptomsByCategory,
    showSymptomDetails,
    trackSymptom,
    analyzeSymptoms,
    // Recommendation functions
    loadRecommendations,
    generateDailyRecommendations,
    saveDailyPlan,
    clearDailyPlan,
    toggleRecommendation,
    viewRecommendationDetails,
    filterRecommendations,
    setTodayDate,
    // Food database functions
    loadFoodDatabase,
    searchFoods,
    filterByLetter,
    clearFoodFilters,
    showFoodDetails,
    addToCalculator,
    addToCalculatorDirect,
    removeFromCalculator,
    clearCalculator,
    exportNutritionData,
    // Admin functions
    refreshAdminData,
    exportPatientData,
    addNewPatient,
    editPatient,
    deletePatient,
    scheduleNewAppointment,
    rescheduleAppointment,
    cancelAppointment,
    sendBulkNotification,
    sendEmailNotification,
    sendSMSNotification,
    generateReports,
    manageSystem,
    viewLogs
};

// Make additional functions available globally
window.login = login;
window.register = register;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.showSection = showSection;
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.refreshDashboard = refreshDashboard;
window.deleteActivity = deleteActivity;
window.deleteAllActivities = deleteAllActivities;
window.loadTodoTasks = loadTodoTasks;
window.addTodoTask = addTodoTask;
window.toggleTodoTask = toggleTodoTask;
window.deleteTodoTask = deleteTodoTask;
window.exportHealthReport = exportHealthReport;
window.toggleMobileMenu = toggleMobileMenu;
window.editProfile = editProfile;
window.viewHealthHistory = viewHealthHistory;
window.exportData = exportData;
window.showProfileModal = showProfileModal;
// Dashboard functions
window.toggleHealthCheck = toggleHealthCheck;
window.saveDailyHealthCheck = saveDailyHealthCheck;
window.generateHealthRecommendations = generateHealthRecommendations;
window.generateHeartRateAlert = generateHeartRateAlert;
window.scheduleDoctorAppointment = scheduleDoctorAppointment;
window.viewExercisePlan = viewExercisePlan;
window.setHydrationReminder = setHydrationReminder;
window.deleteAppointment = deleteAppointment;
// Symptom functions
window.loadSymptoms = loadSymptoms;
window.searchSymptoms = searchSymptoms;
window.filterSymptomsByCategory = filterSymptomsByCategory;
window.showSymptomDetails = showSymptomDetails;
window.trackSymptom = trackSymptom;
window.analyzeSymptoms = analyzeSymptoms;
// Recommendation functions
window.loadRecommendations = loadRecommendations;
window.generateDailyRecommendations = generateDailyRecommendations;
window.saveDailyPlan = saveDailyPlan;
window.clearDailyPlan = clearDailyPlan;
window.toggleRecommendation = toggleRecommendation;
window.viewRecommendationDetails = viewRecommendationDetails;
window.filterRecommendations = filterRecommendations;
window.setTodayDate = setTodayDate;
// Food database functions
window.loadFoodDatabase = loadFoodDatabase;
window.searchFoods = searchFoods;
window.filterByLetter = filterByLetter;
window.clearFoodFilters = clearFoodFilters;
window.showFoodDetails = showFoodDetails;
window.addToCalculator = addToCalculator;
window.addToCalculatorDirect = addToCalculatorDirect;
window.removeFromCalculator = removeFromCalculator;
window.clearCalculator = clearCalculator;
window.exportNutritionData = exportNutritionData;
// Admin functions
window.refreshAdminData = refreshAdminData;
window.exportPatientData = exportPatientData;
window.addNewPatient = addNewPatient;
window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.scheduleNewAppointment = scheduleNewAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.cancelAppointment = cancelAppointment;
window.deleteAdminAppointment = deleteAdminAppointment;
window.sendBulkNotification = sendBulkNotification;
window.saveAppointment = saveAppointment;
window.sendEmailNotification = sendEmailNotification;
window.sendSMSNotification = sendSMSNotification;
window.generateReports = generateReports;
window.manageSystem = manageSystem;
window.viewLogs = viewLogs;
window.showNotification = showNotification;
window.refreshDashboard = refreshDashboard;
window.scheduleAppointment = scheduleAppointment;
