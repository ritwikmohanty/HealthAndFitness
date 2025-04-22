/**
 * Dashboard page script
 * Handles the main dashboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    ChartManager.init();
    
    // Load and display user data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update water tracker
    updateWaterTracker();
    
    // Display achievements
    displayAchievements();
    
    // Initialize charts
    initializeCharts();
});

/**
 * Loads and displays dashboard data
 */
function loadDashboardData() {
    // Load user profile
    const userProfile = DataStore.getUserProfile();
    
    // Update steps data
    const dailySteps = DataStore.getDailySteps();
    document.getElementById('dailySteps').textContent = formatNumber(dailySteps);
    const stepsPercentage = Math.min(Math.round((dailySteps / userProfile.dailyStepGoal) * 100), 100);
    document.getElementById('stepsProgressBar').style.width = `${stepsPercentage}%`;
    document.getElementById('stepsProgressBar').setAttribute('aria-valuenow', stepsPercentage);
    document.getElementById('stepsGoal').textContent = `Goal: ${formatNumber(userProfile.dailyStepGoal)}`;
    
    // Update calories data
    const caloriesConsumed = DataStore.getTotalCaloriesConsumed();
    document.getElementById('caloriesConsumed').textContent = formatNumber(caloriesConsumed);
    const consumedPercentage = Math.min(Math.round((caloriesConsumed / userProfile.dailyCalorieGoal) * 100), 100);
    document.getElementById('consumedProgressBar').style.width = `${consumedPercentage}%`;
    document.getElementById('consumedProgressBar').setAttribute('aria-valuenow', consumedPercentage);
    document.getElementById('caloriesGoal').textContent = `Goal: ${formatNumber(userProfile.dailyCalorieGoal)}`;
    
    // Update burned calories
    const caloriesBurned = DataStore.getTotalCaloriesBurned();
    document.getElementById('caloriesBurned').textContent = formatNumber(caloriesBurned);
    const burnedPercentage = Math.min(Math.round((caloriesBurned / userProfile.dailyCalorieBurnGoal) * 100), 100);
    document.getElementById('burnedProgressBar').style.width = `${burnedPercentage}%`;
    document.getElementById('burnedProgressBar').setAttribute('aria-valuenow', burnedPercentage);
    
    // Update net calories
    const netCalories = DataStore.getNetCalories();
    document.getElementById('netCalories').textContent = formatNumber(netCalories);
    updateCalorieStatus(netCalories);
}

/**
 * Updates the calorie status badge
 * @param {number} netCalories - Net calories for the day
 */
function updateCalorieStatus(netCalories) {
    const statusBadge = document.getElementById('calorieStatusBadge');
    let status, badgeClass;
    
    if (netCalories < -500) {
        status = 'Deficit (High)';
        badgeClass = 'bg-danger';
    } else if (netCalories < 0) {
        status = 'Deficit (Good)';
        badgeClass = 'bg-success';
    } else if (netCalories < 500) {
        status = 'Maintenance';
        badgeClass = 'bg-info';
    } else {
        status = 'Surplus';
        badgeClass = 'bg-warning';
    }
    
    statusBadge.textContent = status;
    statusBadge.className = `badge ${badgeClass} mt-2`;
}

/**
 * Updates the water tracker display
 */
function updateWaterTracker() {
    const waterTracker = document.getElementById('waterTracker');
    const waterStats = document.getElementById('waterStats');
    const userProfile = DataStore.getUserProfile();
    const waterIntake = DataStore.getDailyWaterIntake();
    
    // Clear existing glasses
    waterTracker.innerHTML = '';
    
    // Create water glasses
    for (let i = 0; i < userProfile.dailyWaterGoal; i++) {
        const glassElement = document.createElement('div');
        glassElement.className = `water-glass ${i < waterIntake ? 'filled' : ''}`;
        glassElement.setAttribute('data-index', i);
        glassElement.innerHTML = '<i class="fas fa-tint"></i>';
        waterTracker.appendChild(glassElement);
    }
    
    // Update water stats text
    waterStats.textContent = `${waterIntake}/${userProfile.dailyWaterGoal} glasses`;
    
    // Add click event to glasses
    const glasses = waterTracker.querySelectorAll('.water-glass');
    glasses.forEach(glass => {
        glass.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const newIntake = index + 1;
            DataStore.saveWaterIntake(newIntake);
            updateWaterTracker();
        });
    });
}

/**
 * Displays user achievements on the dashboard
 */
function displayAchievements() {
    const achievementsContainer = document.getElementById('achievements');
    const noAchievements = document.getElementById('noAchievements');
    const userProfile = DataStore.getUserProfile();
    const achievements = userProfile.achievements || [];
    
    // Check if there are any achievements
    if (achievements.length === 0) {
        noAchievements.style.display = 'block';
        return;
    }
    
    // Hide the no achievements message
    noAchievements.style.display = 'none';
    
    // Display the latest 3 achievements
    const recentAchievements = achievements.slice(-3).reverse();
    recentAchievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement mb-2';
        achievementElement.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="me-3">
                    <i class="fas fa-${achievement.icon} fa-2x text-warning"></i>
                </div>
                <div>
                    <h6 class="mb-0">${achievement.title}</h6>
                    <p class="text-muted small mb-0">${achievement.description}</p>
                    <small class="text-muted">${formatDate(achievement.date)} • ${achievement.points} points</small>
                </div>
            </div>
        `;
        achievementsContainer.appendChild(achievementElement);
    });
}

/**
 * Initialize dashboard charts
 */
function initializeCharts() {
    // Weekly trend chart
    const weeklyTrendChart = ChartManager.createWeeklyTrendChart('weeklyTrendChart', 'calories');
    
    // Workout distribution chart
    const workoutDistribution = ChartManager.createWorkoutDistributionChart('workoutDistribution');
    
    // Add event listener for trend chart type change
    document.getElementById('trendChartType').addEventListener('change', function() {
        const chartType = this.value;
        weeklyTrendChart.destroy();
        ChartManager.createWeeklyTrendChart('weeklyTrendChart', chartType);
    });
}

/**
 * Set up all event listeners for the dashboard
 */
function setupEventListeners() {
    // Log steps button
    document.getElementById('logStepsBtn').addEventListener('click', function() {
        const stepsModal = new bootstrap.Modal(document.getElementById('logStepsModal'));
        stepsModal.show();
    });
    
    // Save steps button in modal
    document.getElementById('saveStepsBtn').addEventListener('click', function() {
        const stepsInput = document.getElementById('stepsInput');
        const steps = parseInt(stepsInput.value);
        
        if (isNaN(steps) || steps < 0) {
            alert('Please enter a valid number of steps.');
            return;
        }
        
        DataStore.saveSteps(steps);
        loadDashboardData();
        
        // Close modal
        const stepsModal = bootstrap.Modal.getInstance(document.getElementById('logStepsModal'));
        stepsModal.hide();
        
        // Reset input
        stepsInput.value = '';
        
        // Show feedback
        showToast('Steps logged successfully!', 'success');
        
        // Refresh charts
        initializeCharts();
    });
    
    // Log meal button
    document.getElementById('logMealBtn').addEventListener('click', function() {
        const mealModal = new bootstrap.Modal(document.getElementById('logMealModal'));
        
        // Reset form
        document.getElementById('mealSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('selectedFoodInfo').classList.add('d-none');
        document.getElementById('saveMealBtn').disabled = true;
        
        mealModal.show();
    });
    
    // Meal search
    document.getElementById('mealSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const searchResults = document.getElementById('searchResults');
        
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        // Search in food database
        const results = FOOD_DATABASE.filter(food => 
            food.name.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
        
        // Display results
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="text-muted my-2">No foods found. Try a different search.</p>';
        } else {
            results.forEach(food => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <span>${food.name}</span>
                        <span class="text-muted">${food.calories} cal</span>
                    </div>
                `;
                resultItem.addEventListener('click', function() {
                    selectFood(food);
                });
                searchResults.appendChild(resultItem);
            });
        }
    });
    
    // Save meal button
    document.getElementById('saveMealBtn').addEventListener('click', function() {
        const foodName = document.getElementById('foodName').value;
        const calories = parseInt(document.getElementById('calories').value);
        const protein = parseFloat(document.getElementById('protein').value);
        const carbs = parseFloat(document.getElementById('carbs').value);
        const fat = parseFloat(document.getElementById('fat').value);
        const servingSize = parseFloat(document.getElementById('servingSize').value);
        const mealType = document.getElementById('mealType').value;
        
        const foodItem = {
            name: foodName,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            servingSize: servingSize,
            mealType: mealType
        };
        
        DataStore.saveFood(foodItem);
        loadDashboardData();
        
        // Close modal
        const mealModal = bootstrap.Modal.getInstance(document.getElementById('logMealModal'));
        mealModal.hide();
        
        // Show feedback
        showToast(`${foodName} added to your food log!`, 'success');
        
        // Refresh charts
        initializeCharts();
    });
    
    // Log workout button
    document.getElementById('logWorkoutBtn').addEventListener('click', function() {
        const workoutModal = new bootstrap.Modal(document.getElementById('logWorkoutModal'));
        
        // Populate workout types
        const workoutTypeSelect = document.getElementById('workoutType');
        workoutTypeSelect.innerHTML = '<option value="">Select workout...</option>';
        
        WORKOUT_DATABASE.forEach(category => {
            category.exercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.name;
                option.textContent = exercise.name;
                option.dataset.category = category.category;
                option.dataset.metsLow = exercise.metsLow;
                option.dataset.metsHigh = exercise.metsHigh;
                workoutTypeSelect.appendChild(option);
            });
        });
        
        // Reset duration and intensity
        document.getElementById('duration').value = 30;
        document.getElementById('intensity').value = 'medium';
        
        // Calculate initial calories
        calculateCaloriesBurned();
        
        workoutModal.show();
    });
    
    // Workout type change
    document.getElementById('workoutType').addEventListener('change', calculateCaloriesBurned);
    document.getElementById('duration').addEventListener('input', calculateCaloriesBurned);
    document.getElementById('intensity').addEventListener('change', calculateCaloriesBurned);
    
    // Save workout button
    document.getElementById('saveWorkoutBtn').addEventListener('click', function() {
        const workoutType = document.getElementById('workoutType').value;
        const duration = parseInt(document.getElementById('duration').value);
        const intensity = document.getElementById('intensity').value;
        const caloriesBurned = parseInt(document.getElementById('caloriesBurnedEstimate').value);
        
        if (!workoutType || isNaN(duration) || duration <= 0) {
            alert('Please select a workout type and enter a valid duration.');
            return;
        }
        
        const workoutItem = {
            workoutType: workoutType,
            duration: duration,
            intensity: intensity,
            caloriesBurned: caloriesBurned
        };
        
        DataStore.saveWorkout(workoutItem);
        loadDashboardData();
        
        // Close modal
        const workoutModal = bootstrap.Modal.getInstance(document.getElementById('logWorkoutModal'));
        workoutModal.hide();
        
        // Show feedback
        showToast(`${workoutType} workout logged successfully!`, 'success');
        
        // Refresh charts
        initializeCharts();
    });
}

/**
 * Select a food item from search results
 * @param {Object} food - Food item to select
 */
function selectFood(food) {
    // Display selected food info
    document.getElementById('selectedFoodInfo').classList.remove('d-none');
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('mealSearch').value = '';
    
    // Fill form with food data
    document.getElementById('foodName').value = food.name;
    document.getElementById('calories').value = food.calories;
    document.getElementById('protein').value = food.protein || 0;
    document.getElementById('carbs').value = food.carbs || 0;
    document.getElementById('fat').value = food.fat || 0;
    
    // Set serving to 1 by default
    document.getElementById('servingSize').value = 1;
    
    // Enable save button
    document.getElementById('saveMealBtn').disabled = false;
    
    // Update values when serving size changes
    document.getElementById('servingSize').addEventListener('input', function() {
        const serving = parseFloat(this.value) || 0;
        document.getElementById('calories').value = Math.round(food.calories * serving);
        document.getElementById('protein').value = (food.protein * serving).toFixed(1);
        document.getElementById('carbs').value = (food.carbs * serving).toFixed(1);
        document.getElementById('fat').value = (food.fat * serving).toFixed(1);
    });
}

/**
 * Calculate calories burned for a workout
 * Uses MET values based on exercise type and intensity
 */
function calculateCaloriesBurned() {
    const workoutTypeSelect = document.getElementById('workoutType');
    const selectedOption = workoutTypeSelect.options[workoutTypeSelect.selectedIndex];
    const duration = parseInt(document.getElementById('duration').value) || 0;
    const intensity = document.getElementById('intensity').value;
    
    if (!selectedOption || selectedOption.value === "") {
        document.getElementById('caloriesBurnedEstimate').value = 0;
        return;
    }
    
    // Get MET value based on intensity
    // MET = Metabolic Equivalent of Task, used to estimate calorie expenditure
    let met = 0;
    if (intensity === 'low') {
        met = parseFloat(selectedOption.dataset.metsLow) || 3;
    } else if (intensity === 'medium') {
        met = (parseFloat(selectedOption.dataset.metsLow) + parseFloat(selectedOption.dataset.metsHigh)) / 2 || 5;
    } else {
        met = parseFloat(selectedOption.dataset.metsHigh) || 7;
    }
    
    // Calculate calories burned
    // Formula: Calories = MET * weight(kg) * duration(hours)
    const userProfile = DataStore.getUserProfile();
    const weight = userProfile.weight || 70; // default to 70kg if not set
    const durationHours = duration / 60;
    const caloriesBurned = Math.round(met * weight * durationHours);
    
    document.getElementById('caloriesBurnedEstimate').value = caloriesBurned;
}
