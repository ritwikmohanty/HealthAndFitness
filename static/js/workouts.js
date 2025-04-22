/**
 * Workouts tracking page script
 * Handles workout logging, tracking, and suggestions
 */

// Charts for the workouts page
let workoutHistoryChart;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    ChartManager.init();
    
    // Load workout data
    loadWorkoutData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initializeCharts();
    
    // Generate workout suggestions
    generateWorkoutSuggestions('all');
    
    // Display workout plan
    displayWorkoutPlan();
    
    // Display current challenge
    displayCurrentChallenge();
});

/**
 * Loads and displays workout data
 */
function loadWorkoutData() {
    // Load user profile
    const userProfile = DataStore.getUserProfile();
    
    // Get current date for workoutDate input
    document.getElementById('workoutDate').value = getCurrentDateString();
    
    // Daily calories burned
    const caloriesBurned = DataStore.getTotalCaloriesBurned();
    document.getElementById('todayCaloriesBurned').textContent = formatNumber(caloriesBurned);
    
    const burnedPercentage = Math.min(Math.round((caloriesBurned / userProfile.dailyCalorieBurnGoal) * 100), 100);
    document.getElementById('caloriesBurnedProgress').style.width = `${burnedPercentage}%`;
    document.getElementById('caloriesBurnedProgress').setAttribute('aria-valuenow', burnedPercentage);
    document.getElementById('caloriesBurnedGoal').textContent = `Goal: ${formatNumber(userProfile.dailyCalorieBurnGoal)}`;
    
    // Weekly workout minutes
    const weeklyMinutes = DataStore.getWeeklyWorkoutMinutes();
    document.getElementById('weeklyWorkoutMinutes').textContent = formatNumber(weeklyMinutes);
    
    const minutesPercentage = Math.min(Math.round((weeklyMinutes / userProfile.weeklyMinutesGoal) * 100), 100);
    document.getElementById('minutesProgress').style.width = `${minutesPercentage}%`;
    document.getElementById('minutesProgress').setAttribute('aria-valuenow', minutesPercentage);
    document.getElementById('weeklyMinutesGoal').textContent = `Goal: ${formatNumber(userProfile.weeklyMinutesGoal)}`;
    
    // Weekly workout count
    const weeklyWorkouts = DataStore.getWeeklyWorkouts().length;
    document.getElementById('weeklyWorkoutCount').textContent = weeklyWorkouts;
    
    const workoutsPercentage = Math.min(Math.round((weeklyWorkouts / userProfile.weeklyWorkoutGoal) * 100), 100);
    document.getElementById('workoutsProgress').style.width = `${workoutsPercentage}%`;
    document.getElementById('workoutsProgress').setAttribute('aria-valuenow', workoutsPercentage);
    document.getElementById('weeklyWorkoutsGoal').textContent = `Goal: ${userProfile.weeklyWorkoutGoal}`;
    
    // Workout streak
    const streak = calculateWorkoutStreak();
    document.getElementById('workoutStreak').textContent = streak;
    
    let streakStatus = 'Not Started';
    let statusClass = 'bg-secondary';
    
    if (streak === 1) {
        streakStatus = 'Just Started';
        statusClass = 'bg-info';
    } else if (streak >= 2 && streak < 7) {
        streakStatus = 'Building';
        statusClass = 'bg-primary';
    } else if (streak >= 7 && streak < 14) {
        streakStatus = 'Strong';
        statusClass = 'bg-success';
    } else if (streak >= 14) {
        streakStatus = 'Impressive!';
        statusClass = 'bg-warning';
    }
    
    document.getElementById('streakStatus').textContent = streakStatus;
    document.getElementById('streakStatus').className = `badge ${statusClass}`;
    
    // Populate workout type options
    populateWorkoutTypes();
    
    // Update workout log
    updateWorkoutLog();
}

/**
 * Initialize workout page charts
 */
function initializeCharts() {
    // Workout history chart
    workoutHistoryChart = ChartManager.createWorkoutHistoryChart('workoutHistoryChart', 'calories');
    
    // Add event listener for history chart type change
    document.getElementById('historyChartType').addEventListener('change', function() {
        const chartType = this.value;
        workoutHistoryChart.destroy();
        workoutHistoryChart = ChartManager.createWorkoutHistoryChart('workoutHistoryChart', chartType);
    });
}

/**
 * Populates workout type options in the form
 */
function populateWorkoutTypes() {
    const workoutTypeSelect = document.getElementById('workoutType');
    workoutTypeSelect.innerHTML = '<option value="">Select workout...</option>';
    
    WORKOUT_DATABASE.forEach(category => {
        // Create optgroup for each category
        const optgroup = document.createElement('optgroup');
        optgroup.label = category.category;
        
        category.exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.name;
            option.textContent = exercise.name;
            option.dataset.category = category.category;
            option.dataset.metsLow = exercise.metsLow;
            option.dataset.metsHigh = exercise.metsHigh;
            optgroup.appendChild(option);
        });
        
        workoutTypeSelect.appendChild(optgroup);
    });
}

/**
 * Updates the workout log display
 * @param {string} filterType - Optional filter for workout type
 */
function updateWorkoutLog(filterType = 'all') {
    const workoutLog = document.getElementById('workoutLog');
    const noWorkoutsMessage = document.getElementById('noWorkoutsMessage');
    const workoutLogs = DataStore.getWorkoutLogs().slice(-10); // Get last 10 workouts
    
    // Clear existing log
    workoutLog.innerHTML = '';
    
    // Filter by workout type category if specified
    let filteredLogs = workoutLogs;
    if (filterType !== 'all') {
        filteredLogs = workoutLogs.filter(log => {
            // Find the workout in the database to get its category
            let category = '';
            
            for (const cat of WORKOUT_DATABASE) {
                const exercise = cat.exercises.find(ex => ex.name === log.workoutType);
                if (exercise) {
                    category = cat.category.toLowerCase();
                    break;
                }
            }
            
            return category === filterType.toLowerCase();
        });
    }
    
    // Check if there are workouts logged
    if (filteredLogs.length === 0) {
        noWorkoutsMessage.style.display = 'block';
        return;
    }
    
    // Hide no workouts message
    noWorkoutsMessage.style.display = 'none';
    
    // Sort by date, newest first
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Group by date
    const groupedLogs = {};
    
    filteredLogs.forEach(log => {
        if (!groupedLogs[log.date]) {
            groupedLogs[log.date] = [];
        }
        groupedLogs[log.date].push(log);
    });
    
    // Display grouped logs
    Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'mb-2 mt-3';
        
        // Format date as "Day, Month Date"
        const formattedDate = new Date(date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        dateHeader.innerHTML = `<h6>${formattedDate}</h6>`;
        workoutLog.appendChild(dateHeader);
        
        // Add workouts for this date
        groupedLogs[date].forEach(workout => {
            // Determine workout category class
            let categoryClass = 'primary';
            for (const cat of WORKOUT_DATABASE) {
                const exercise = cat.exercises.find(ex => ex.name === workout.workoutType);
                if (exercise) {
                    const category = cat.category.toLowerCase();
                    if (category === 'cardio') categoryClass = 'info';
                    else if (category === 'strength') categoryClass = 'danger';
                    else if (category === 'flexibility') categoryClass = 'success';
                    break;
                }
            }
            
            const workoutItem = document.createElement('div');
            workoutItem.className = `workout-item p-2 ${categoryClass}`;
            workoutItem.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <p class="mb-0">${workout.workoutType}</p>
                        <small class="text-muted">
                            ${workout.duration} min • ${capitalizeFirstLetter(workout.intensity)} intensity
                            ${workout.notes ? '• ' + workout.notes : ''}
                        </small>
                    </div>
                    <div class="text-end">
                        <p class="mb-0">${workout.caloriesBurned} cal</p>
                        <button class="btn btn-sm btn-link text-danger p-0 delete-workout" data-id="${workout.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            workoutLog.appendChild(workoutItem);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-workout').forEach(button => {
        button.addEventListener('click', function() {
            const workoutId = this.dataset.id;
            DataStore.deleteWorkout(workoutId);
            loadWorkoutData();
            
            // Update chart
            workoutHistoryChart.destroy();
            workoutHistoryChart = ChartManager.createWorkoutHistoryChart('workoutHistoryChart', document.getElementById('historyChartType').value);
            
            // Show feedback
            showToast('Workout deleted', 'success');
        });
    });
}

/**
 * Set up all event listeners for the workout page
 */
function setupEventListeners() {
    // Workout log filters
    document.getElementById('viewAllWorkouts').addEventListener('click', function() {
        setActiveWorkoutFilter(this);
        updateWorkoutLog('all');
    });
    
    document.getElementById('viewCardio').addEventListener('click', function() {
        setActiveWorkoutFilter(this);
        updateWorkoutLog('cardio');
    });
    
    document.getElementById('viewStrength').addEventListener('click', function() {
        setActiveWorkoutFilter(this);
        updateWorkoutLog('strength');
    });
    
    document.getElementById('viewFlexibility').addEventListener('click', function() {
        setActiveWorkoutFilter(this);
        updateWorkoutLog('flexibility');
    });
    
    // Body part filter for suggestions
    document.getElementById('bodyPartFilter').addEventListener('change', function() {
        const bodyPart = this.value;
        generateWorkoutSuggestions(bodyPart);
    });
    
    // Workout form event listeners
    document.getElementById('workoutType').addEventListener('change', calculateCaloriesBurned);
    document.getElementById('duration').addEventListener('input', calculateCaloriesBurned);
    document.getElementById('intensity').addEventListener('change', calculateCaloriesBurned);
    
    // Log workout button
    document.getElementById('logWorkoutBtn').addEventListener('click', function() {
        const workoutType = document.getElementById('workoutType').value;
        const date = document.getElementById('workoutDate').value || getCurrentDateString();
        const duration = parseInt(document.getElementById('duration').value);
        const intensity = document.getElementById('intensity').value;
        const caloriesBurned = parseInt(document.getElementById('caloriesBurned').value);
        const notes = document.getElementById('notes').value;
        
        if (!workoutType || isNaN(duration) || duration <= 0) {
            alert('Please select a workout type and enter a valid duration.');
            return;
        }
        
        const workoutItem = {
            workoutType: workoutType,
            date: date,
            duration: duration,
            intensity: intensity,
            caloriesBurned: caloriesBurned,
            notes: notes
        };
        
        DataStore.saveWorkout(workoutItem);
        
        // Reset form
        document.getElementById('workoutType').value = '';
        document.getElementById('duration').value = 30;
        document.getElementById('notes').value = '';
        document.getElementById('caloriesBurned').value = '';
        document.getElementById('workoutDate').value = getCurrentDateString();
        
        // Reload data and update UI
        loadWorkoutData();
        
        // Update chart
        workoutHistoryChart.destroy();
        workoutHistoryChart = ChartManager.createWorkoutHistoryChart('workoutHistoryChart', document.getElementById('historyChartType').value);
        
        // Show feedback
        showToast(`${workoutType} workout logged successfully!`, 'success');
    });
    
    // Generate workout plan button
    document.getElementById('generatePlanBtn').addEventListener('click', function() {
        const planModal = new bootstrap.Modal(document.getElementById('workoutPlanModal'));
        planModal.show();
    });
    
    // Create workout plan button
    document.getElementById('createPlanBtn').addEventListener('click', function() {
        // Get form values
        const fitnessGoal = document.querySelector('input[name="fitnessGoal"]:checked').value;
        const workoutDays = document.querySelector('input[name="workoutDays"]:checked').value;
        const workoutDuration = document.querySelector('input[name="workoutDuration"]:checked').value;
        const equipmentGym = document.getElementById('equipmentGym').checked;
        const equipmentHome = document.getElementById('equipmentHome').checked;
        
        // Generate workout plan
        const plan = generateWorkoutPlan(fitnessGoal, workoutDays, workoutDuration, equipmentGym, equipmentHome);
        
        // Save plan
        DataStore.saveWorkoutPlan(plan);
        
        // Display plan
        displayWorkoutPlan();
        
        // Close modal
        const planModal = bootstrap.Modal.getInstance(document.getElementById('workoutPlanModal'));
        planModal.hide();
        
        // Show feedback
        showToast('Workout plan created! Check your weekly schedule.', 'success');
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
        document.getElementById('caloriesBurned').value = 0;
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
    
    document.getElementById('caloriesBurned').value = caloriesBurned;
}

/**
 * Sets the active workout filter button
 * @param {HTMLElement} activeButton - Button to set as active
 */
function setActiveWorkoutFilter(activeButton) {
    const filterButtons = document.querySelectorAll('#viewAllWorkouts, #viewCardio, #viewStrength, #viewFlexibility');
    
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    activeButton.classList.add('active');
}

/**
 * Generates workout suggestions based on body part
 * @param {string} bodyPart - Body part to filter suggestions
 */
function generateWorkoutSuggestions(bodyPart) {
    const suggestionsContainer = document.getElementById('workoutSuggestions');
    
    // Clear existing suggestions
    suggestionsContainer.innerHTML = '';
    
    // Filter exercises by body part
    let filteredExercises = [];
    
    WORKOUT_DATABASE.forEach(category => {
        category.exercises.forEach(exercise => {
            if (bodyPart === 'all' || exercise.bodyParts.includes(bodyPart)) {
                filteredExercises.push({
                    ...exercise,
                    category: category.category
                });
            }
        });
    });
    
    // If no exercises match, show message
    if (filteredExercises.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="text-center py-3">
                <p class="text-muted">No exercises found for this body part.</p>
            </div>
        `;
        return;
    }
    
    // Sort by category
    filteredExercises.sort((a, b) => a.category.localeCompare(b.category));
    
    // Limit to 6 exercises
    filteredExercises = filteredExercises.slice(0, 6);
    
    // Group exercises by category
    const groupedExercises = {};
    filteredExercises.forEach(exercise => {
        if (!groupedExercises[exercise.category]) {
            groupedExercises[exercise.category] = [];
        }
        groupedExercises[exercise.category].push(exercise);
    });
    
    // Display grouped exercises
    Object.keys(groupedExercises).forEach(category => {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'mb-2';
        categoryHeader.innerHTML = `<h6 class="small text-uppercase text-muted">${category}</h6>`;
        suggestionsContainer.appendChild(categoryHeader);
        
        // Create row for exercises
        const row = document.createElement('div');
        row.className = 'row mb-3';
        
        groupedExercises[category].forEach(exercise => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-2';
            
            // Determine category class for the card border
            let categoryClass = 'primary';
            if (category.toLowerCase() === 'cardio') categoryClass = 'info';
            else if (category.toLowerCase() === 'strength') categoryClass = 'danger';
            else if (category.toLowerCase() === 'flexibility') categoryClass = 'success';
            
            col.innerHTML = `
                <div class="card workout-suggestion border-${categoryClass}">
                    <div class="card-body py-2">
                        <h6 class="card-title mb-1">${exercise.name}</h6>
                        <p class="small text-muted mb-2">
                            ${exercise.bodyParts.join(', ')}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="small">
                                <i class="fas fa-fire-alt me-1 text-${categoryClass}"></i>
                                ${Math.round((exercise.metsLow + exercise.metsHigh) / 2 * 70 * 0.5)} cal/30min
                            </span>
                            <button class="btn btn-sm btn-outline-${categoryClass} quick-add-workout" 
                                data-workout='${JSON.stringify({
                                    name: exercise.name,
                                    category: category,
                                    metsLow: exercise.metsLow,
                                    metsHigh: exercise.metsHigh
                                })}'>
                                <i class="fas fa-plus"></i> Log
                            </button>
                        </div>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
        
        suggestionsContainer.appendChild(row);
    });
    
    // Add event listeners to quick add buttons
    document.querySelectorAll('.quick-add-workout').forEach(button => {
        button.addEventListener('click', function() {
            const workout = JSON.parse(this.dataset.workout);
            
            // Pre-select this workout in the form
            const workoutTypeSelect = document.getElementById('workoutType');
            for (let i = 0; i < workoutTypeSelect.options.length; i++) {
                if (workoutTypeSelect.options[i].value === workout.name) {
                    workoutTypeSelect.selectedIndex = i;
                    break;
                }
            }
            
            // Calculate calories and scroll to form
            calculateCaloriesBurned();
            document.getElementById('workoutForm').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/**
 * Calculates the current workout streak
 * @returns {number} Streak count in days
 */
function calculateWorkoutStreak() {
    const logs = DataStore.getWorkoutLogs();
    if (logs.length === 0) return 0;
    
    // Create a set of dates with workouts
    const workoutDates = new Set();
    logs.forEach(log => workoutDates.add(log.date));
    
    // Check if today has a workout
    const today = getCurrentDateString();
    const hasWorkoutToday = workoutDates.has(today);
    
    // Start counting from yesterday
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - (hasWorkoutToday ? 0 : 1));
    
    let streak = hasWorkoutToday ? 1 : 0;
    let previousDate = new Date(currentDate);
    
    // Go backwards through dates
    while (true) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Check if there's a day gap
        const dayDiff = Math.round((previousDate - currentDate) / (1000 * 60 * 60 * 24));
        if (dayDiff !== 1) break;
        
        // Check if there was a workout on this day
        if (workoutDates.has(dateString)) {
            streak++;
            previousDate = new Date(currentDate);
        } else {
            break;
        }
    }
    
    return streak;
}

/**
 * Generates a weekly workout plan based on user preferences
 * @param {string} fitnessGoal - User's fitness goal
 * @param {number} workoutDays - Number of workout days per week
 * @param {number} workoutDuration - Duration of each workout
 * @param {boolean} equipmentGym - Whether gym equipment is available
 * @param {boolean} equipmentHome - Whether home workouts are possible
 * @returns {Object} Generated workout plan
 */
function generateWorkoutPlan(fitnessGoal, workoutDays, workoutDuration, equipmentGym, equipmentHome) {
    const plan = {
        goal: fitnessGoal,
        days: parseInt(workoutDays),
        duration: parseInt(workoutDuration),
        createdAt: getCurrentDateString(),
        schedule: {}
    };
    
    // Default intensity based on goal
    let defaultIntensity = 'medium';
    if (fitnessGoal === 'lose_weight') defaultIntensity = 'high';
    if (fitnessGoal === 'build_muscle') defaultIntensity = 'high';
    if (fitnessGoal === 'improve_endurance') defaultIntensity = 'medium';
    
    // Determine workout focus based on goal
    let cardioFocus = 0.4;
    let strengthFocus = 0.4;
    let flexibilityFocus = 0.2;
    
    if (fitnessGoal === 'lose_weight') {
        cardioFocus = 0.6;
        strengthFocus = 0.3;
        flexibilityFocus = 0.1;
    } else if (fitnessGoal === 'build_muscle') {
        cardioFocus = 0.2;
        strengthFocus = 0.7;
        flexibilityFocus = 0.1;
    } else if (fitnessGoal === 'improve_endurance') {
        cardioFocus = 0.7;
        strengthFocus = 0.2;
        flexibilityFocus = 0.1;
    }
    
    // Get exercises from workout database
    const cardioExercises = [];
    const strengthExercises = [];
    const flexibilityExercises = [];
    
    WORKOUT_DATABASE.forEach(category => {
        category.exercises.forEach(exercise => {
            if (category.category === 'Cardio') {
                cardioExercises.push({...exercise, category: 'Cardio'});
            } else if (category.category === 'Strength') {
                strengthExercises.push({...exercise, category: 'Strength'});
            } else if (category.category === 'Flexibility') {
                flexibilityExercises.push({...exercise, category: 'Flexibility'});
            }
        });
    });
    
    // Shuffle arrays
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    shuffle(cardioExercises);
    shuffle(strengthExercises);
    shuffle(flexibilityExercises);
    
    // Set rest days - default to weekend if enough workout days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const restDays = [];
    
    if (workoutDays <= 5) {
        restDays.push('Saturday', 'Sunday');
    }
    
    if (workoutDays <= 4) {
        restDays.push('Wednesday');
    }
    
    if (workoutDays <= 3) {
        restDays.push('Friday');
    }
    
    // Create schedule
    days.forEach((day, index) => {
        if (restDays.includes(day)) {
            plan.schedule[day] = { isRest: true };
        } else {
            // Calculate workout type focus
            let dayFocus;
            
            // Logic to distribute workout types
            if (index % 3 === 0) {
                dayFocus = 'cardio';
            } else if (index % 3 === 1) {
                dayFocus = 'strength';
            } else {
                dayFocus = 'mixed';
            }
            
            // Adjust based on fitness goal
            if (fitnessGoal === 'lose_weight' && index % 2 === 0) {
                dayFocus = 'cardio';
            } else if (fitnessGoal === 'build_muscle' && index % 2 === 0) {
                dayFocus = 'strength';
            }
            
            // Create workout
            const workout = {
                focus: dayFocus,
                duration: workoutDuration,
                intensity: defaultIntensity,
                exercises: []
            };
            
            // Add exercises based on focus
            if (dayFocus === 'cardio') {
                // 70% cardio, 20% strength, 10% flexibility
                addExercisesToWorkout(workout, cardioExercises, 2, 0.7);
                addExercisesToWorkout(workout, strengthExercises, 1, 0.2);
                addExercisesToWorkout(workout, flexibilityExercises, 1, 0.1);
            } else if (dayFocus === 'strength') {
                // 20% cardio, 70% strength, 10% flexibility
                addExercisesToWorkout(workout, cardioExercises, 1, 0.2);
                addExercisesToWorkout(workout, strengthExercises, 3, 0.7);
                addExercisesToWorkout(workout, flexibilityExercises, 1, 0.1);
            } else {
                // 40% cardio, 40% strength, 20% flexibility
                addExercisesToWorkout(workout, cardioExercises, 1, 0.4);
                addExercisesToWorkout(workout, strengthExercises, 2, 0.4);
                addExercisesToWorkout(workout, flexibilityExercises, 1, 0.2);
            }
            
            plan.schedule[day] = workout;
        }
    });
    
    return plan;
}

/**
 * Adds exercises to a workout plan
 * @param {Object} workout - Workout to add exercises to
 * @param {Array} exercises - Array of exercises to choose from
 * @param {number} count - Number of exercises to add
 * @param {number} timeFraction - Fraction of workout time to allocate
 */
function addExercisesToWorkout(workout, exercises, count, timeFraction) {
    for (let i = 0; i < count && i < exercises.length; i++) {
        const exercise = exercises[i % exercises.length];
        const duration = Math.round(workout.duration * timeFraction / count);
        
        workout.exercises.push({
            name: exercise.name,
            duration: duration,
            category: exercise.category
        });
    }
}

/**
 * Displays the current workout plan
 */
function displayWorkoutPlan() {
    const planContainer = document.getElementById('workoutPlan');
    const noPlanMessage = document.getElementById('noWorkoutPlan');
    const plan = DataStore.getWorkoutPlan();
    
    // Check if there's a plan
    if (!plan) {
        noPlanMessage.style.display = 'block';
        return;
    }
    
    // Hide no plan message
    noPlanMessage.style.display = 'none';
    
    // Clear existing content
    planContainer.innerHTML = '';
    
    // Create header with plan info
    const header = document.createElement('div');
    header.className = 'mb-3';
    header.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">
                <span class="badge bg-primary me-2">${capitalizeFirstLetter(plan.goal.replace('_', ' '))}</span>
                ${plan.days} days/week • ${plan.duration} min sessions
            </h6>
            <button class="btn btn-sm btn-outline-secondary" id="editPlanBtn">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
    `;
    planContainer.appendChild(header);
    
    // Add edit button event listener
    header.querySelector('#editPlanBtn').addEventListener('click', function() {
        const planModal = new bootstrap.Modal(document.getElementById('workoutPlanModal'));
        planModal.show();
    });
    
    // Add each day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
        const dayData = plan.schedule[day];
        if (!dayData) return;
        
        const dayElement = document.createElement('div');
        dayElement.className = 'plan-day mb-2';
        
        if (dayData.isRest) {
            // Rest day
            dayElement.innerHTML = `
                <div class="plan-day-header d-flex justify-content-between">
                    <span>${day}</span>
                    <span class="text-muted">Rest Day</span>
                </div>
                <p class="text-muted small mb-0">
                    Take time to recover and prepare for your next workout.
                </p>
            `;
        } else {
            // Workout day
            let focusText, focusClass;
            
            if (dayData.focus === 'cardio') {
                focusText = 'Cardio Focus';
                focusClass = 'info';
            } else if (dayData.focus === 'strength') {
                focusText = 'Strength Focus';
                focusClass = 'danger';
            } else {
                focusText = 'Mixed Workout';
                focusClass = 'warning';
            }
            
            dayElement.innerHTML = `
                <div class="plan-day-header d-flex justify-content-between">
                    <span>${day}</span>
                    <span class="badge bg-${focusClass}">${focusText}</span>
                </div>
                <div class="small mb-2">
                    <span class="text-muted">${dayData.duration} min • ${capitalizeFirstLetter(dayData.intensity)} intensity</span>
                </div>
            `;
            
            // Add exercises
            const exercisesList = document.createElement('div');
            exercisesList.className = 'small';
            
            dayData.exercises.forEach(exercise => {
                let categoryClass = 'primary';
                if (exercise.category === 'Cardio') categoryClass = 'info';
                else if (exercise.category === 'Strength') categoryClass = 'danger';
                else if (exercise.category === 'Flexibility') categoryClass = 'success';
                
                const exerciseItem = document.createElement('div');
                exerciseItem.className = 'd-flex justify-content-between mb-1';
                exerciseItem.innerHTML = `
                    <span>
                        <i class="fas fa-circle text-${categoryClass} me-1" style="font-size: 8px; vertical-align: middle;"></i>
                        ${exercise.name}
                    </span>
                    <span class="text-muted">${exercise.duration} min</span>
                `;
                exercisesList.appendChild(exerciseItem);
            });
            
            dayElement.appendChild(exercisesList);
            
            // Add "Log this workout" button
            const logButton = document.createElement('div');
            logButton.className = 'mt-2';
            logButton.innerHTML = `
                <button class="btn btn-sm btn-outline-${focusClass} log-planned-workout" data-day="${day}">
                    <i class="fas fa-play me-1"></i> Log this workout
                </button>
            `;
            dayElement.appendChild(logButton);
        }
        
        planContainer.appendChild(dayElement);
    });
    
    // Add event listeners to "Log this workout" buttons
    document.querySelectorAll('.log-planned-workout').forEach(button => {
        button.addEventListener('click', function() {
            const day = this.dataset.day;
            const dayData = plan.schedule[day];
            
            if (!dayData || dayData.isRest) return;
            
            // Calculate total calories burned based on exercises
            let totalCalories = 0;
            let combinedExerciseName = dayData.focus === 'cardio' 
                ? "Cardio Workout" 
                : (dayData.focus === 'strength' ? "Strength Training" : "Mixed Workout");
            
            const workoutItem = {
                workoutType: combinedExerciseName,
                date: getCurrentDateString(),
                duration: dayData.duration,
                intensity: dayData.intensity,
                caloriesBurned: calculatePlanWorkoutCalories(dayData),
                notes: `Planned workout (${dayData.exercises.map(e => e.name).join(', ')})`
            };
            
            DataStore.saveWorkout(workoutItem);
            
            // Reload data and update UI
            loadWorkoutData();
            
            // Update chart
            workoutHistoryChart.destroy();
            workoutHistoryChart = ChartManager.createWorkoutHistoryChart('workoutHistoryChart', document.getElementById('historyChartType').value);
            
            // Show feedback
            showToast(`${combinedExerciseName} logged successfully!`, 'success');
        });
    });
}

/**
 * Calculates calories burned for a planned workout
 * @param {Object} workout - Workout plan data
 * @returns {number} Estimated calories burned
 */
function calculatePlanWorkoutCalories(workout) {
    // Get average MET based on intensity
    let baseMet = 0;
    
    if (workout.intensity === 'low') {
        baseMet = 3;
    } else if (workout.intensity === 'medium') {
        baseMet = 5;
    } else {
        baseMet = 7;
    }
    
    // Adjust MET based on focus
    if (workout.focus === 'cardio') {
        baseMet += 1;
    } else if (workout.focus === 'strength') {
        baseMet += 0.5;
    }
    
    // Calculate calories
    const userProfile = DataStore.getUserProfile();
    const weight = userProfile.weight || 70; // default to 70kg if not set
    const durationHours = workout.duration / 60;
    return Math.round(baseMet * weight * durationHours);
}

/**
 * Displays the current active challenge on the workouts page
 */
function displayCurrentChallenge() {
    const challengeContainer = document.getElementById('currentWorkoutChallenge');
    const noChallengeMessage = document.getElementById('noChallengeMessage');
    
    // Get active challenges related to workouts
    const allChallenges = DataStore.getActiveUserChallenges();
    const workoutChallenges = allChallenges.filter(c => 
        c.challengeType === 'workouts' || 
        c.challengeType === 'minutes' || 
        c.challengeType === 'calories'
    );
    
    if (workoutChallenges.length === 0) {
        noChallengeMessage.style.display = 'block';
        return;
    }
    
    // Hide no challenge message
    noChallengeMessage.style.display = 'none';
    
    // Show the most recent challenge
    const challenge = workoutChallenges[0];
    
    // Calculate progress based on challenge type
    let currentValue = 0;
    let progressPercentage = 0;
    
    if (challenge.challengeType === 'workouts') {
        // Count workouts between start and end date
        currentValue = countWorkoutsBetweenDates(challenge.startDate, challenge.endDate);
        progressPercentage = Math.min(Math.round((currentValue / challenge.goal) * 100), 100);
    } else if (challenge.challengeType === 'minutes') {
        // Sum workout minutes between start and end date
        currentValue = sumWorkoutMinutesBetweenDates(challenge.startDate, challenge.endDate);
        progressPercentage = Math.min(Math.round((currentValue / challenge.goal) * 100), 100);
    } else if (challenge.challengeType === 'calories') {
        // Sum calories burned between start and end date
        currentValue = sumCaloriesBurnedBetweenDates(challenge.startDate, challenge.endDate);
        progressPercentage = Math.min(Math.round((currentValue / challenge.goal) * 100), 100);
    }
    
    // Display challenge
    challengeContainer.innerHTML = `
        <div class="card-title mb-2">${challenge.name}</div>
        <p class="text-muted small mb-2">${challenge.description || 'Workout challenge'}</p>
        <div class="d-flex justify-content-between small mb-1">
            <span>Progress</span>
            <span>${currentValue}/${challenge.goal} ${challenge.challengeType}</span>
        </div>
        <div class="progress mb-3" style="height: 10px;">
            <div class="progress-bar bg-warning" role="progressbar" style="width: ${progressPercentage}%;" 
                aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="small text-muted">
            <i class="fas fa-calendar-alt me-1"></i>
            ${formatDate(challenge.startDate)} - ${formatDate(challenge.endDate)}
        </div>
    `;
}

/**
 * Counts workouts between two dates
 * @param {string} startDate - Start date (inclusive)
 * @param {string} endDate - End date (inclusive)
 * @returns {number} Number of workouts
 */
function countWorkoutsBetweenDates(startDate, endDate) {
    const workouts = DataStore.getWorkoutLogs();
    return workouts.filter(workout => 
        workout.date >= startDate && workout.date <= endDate
    ).length;
}

/**
 * Sums workout minutes between two dates
 * @param {string} startDate - Start date (inclusive)
 * @param {string} endDate - End date (inclusive)
 * @returns {number} Total minutes
 */
function sumWorkoutMinutesBetweenDates(startDate, endDate) {
    const workouts = DataStore.getWorkoutLogs();
    return workouts
        .filter(workout => workout.date >= startDate && workout.date <= endDate)
        .reduce((sum, workout) => sum + workout.duration, 0);
}

/**
 * Sums calories burned between two dates
 * @param {string} startDate - Start date (inclusive)
 * @param {string} endDate - End date (inclusive)
 * @returns {number} Total calories
 */
function sumCaloriesBurnedBetweenDates(startDate, endDate) {
    const workouts = DataStore.getWorkoutLogs();
    return workouts
        .filter(workout => workout.date >= startDate && workout.date <= endDate)
        .reduce((sum, workout) => sum + workout.caloriesBurned, 0);
}
