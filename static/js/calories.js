/**
 * Calories tracking page script
 * Handles nutrition tracking, food logging, and macro calculations
 */

// Charts for the nutrition page
let macroChart;
let nutritionHistoryChart;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    ChartManager.init();
    
    // Load nutrition data
    loadNutritionData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update water tracker
    updateWaterTracker();
    
    // Initialize charts
    initializeCharts();
    
    // Generate meal suggestions
    generateMealSuggestions();
});

/**
 * Loads and displays nutrition data
 */
function loadNutritionData() {
    // Load user profile
    const userProfile = DataStore.getUserProfile();
    
    // Update calories data
    const caloriesConsumed = DataStore.getTotalCaloriesConsumed();
    document.getElementById('caloriesConsumed').textContent = formatNumber(caloriesConsumed);
    document.getElementById('caloriesGoal').textContent = formatNumber(userProfile.dailyCalorieGoal);
    
    const caloriesPercentage = Math.min(Math.round((caloriesConsumed / userProfile.dailyCalorieGoal) * 100), 100);
    document.getElementById('caloriesProgressBar').style.width = `${caloriesPercentage}%`;
    document.getElementById('caloriesProgressBar').setAttribute('aria-valuenow', caloriesPercentage);
    
    // Update macros
    const macros = DataStore.getMacroTotals();
    document.getElementById('carbsTotal').textContent = `${Math.round(macros.carbs)}g`;
    document.getElementById('proteinTotal').textContent = `${Math.round(macros.protein)}g`;
    document.getElementById('fatTotal').textContent = `${Math.round(macros.fat)}g`;
    
    // Calculate and update macro percentages
    const totalGrams = macros.carbs + macros.protein + macros.fat;
    if (totalGrams > 0) {
        const carbsPercentage = Math.round((macros.carbs / totalGrams) * 100);
        const proteinPercentage = Math.round((macros.protein / totalGrams) * 100);
        const fatPercentage = Math.round((macros.fat / totalGrams) * 100);
        
        document.getElementById('carbsPercentage').textContent = `${carbsPercentage}%`;
        document.getElementById('proteinPercentage').textContent = `${proteinPercentage}%`;
        document.getElementById('fatPercentage').textContent = `${fatPercentage}%`;
    } else {
        document.getElementById('carbsPercentage').textContent = '0%';
        document.getElementById('proteinPercentage').textContent = '0%';
        document.getElementById('fatPercentage').textContent = '0%';
    }
    
    // Update meal log
    updateMealLog();
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
            
            // Update history chart if displayed
            if (nutritionHistoryChart && document.getElementById('historyChartType').value === 'water') {
                nutritionHistoryChart.destroy();
                nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', 'water');
            }
        });
    });
}

/**
 * Initialize nutrition page charts
 */
function initializeCharts() {
    // Macro breakdown chart
    macroChart = ChartManager.createMacroChart('macroChart');
    
    // Nutrition history chart
    nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', 'calories');
    
    // Add event listener for history chart type change
    document.getElementById('historyChartType').addEventListener('change', function() {
        const chartType = this.value;
        nutritionHistoryChart.destroy();
        nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', chartType);
    });
}

/**
 * Updates the meal log display
 * @param {string} filterType - Optional filter for meal type
 */
function updateMealLog(filterType = 'all') {
    const mealLog = document.getElementById('mealLog');
    const noMealsMessage = document.getElementById('noMealsMessage');
    const foodLogs = DataStore.getDailyFoodLogs();
    
    // Clear existing log
    mealLog.innerHTML = '';
    
    // Filter by meal type if specified
    let filteredLogs = foodLogs;
    if (filterType !== 'all') {
        filteredLogs = foodLogs.filter(log => log.mealType === filterType);
    }
    
    // Check if there are meals logged
    if (filteredLogs.length === 0) {
        noMealsMessage.style.display = 'block';
        return;
    }
    
    // Hide no meals message
    noMealsMessage.style.display = 'none';
    
    // Group by meal type
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // If filtering by type, only show that type
    const typesToShow = filterType === 'all' ? mealTypes : [filterType];
    
    typesToShow.forEach(type => {
        const mealItems = filteredLogs.filter(log => log.mealType === type);
        
        if (mealItems.length > 0) {
            // Create meal type section
            const mealTypeSection = document.createElement('div');
            mealTypeSection.className = 'mb-3';
            mealTypeSection.innerHTML = `
                <h6 class="text-capitalize">${type}</h6>
            `;
            
            // Add meal items
            mealItems.forEach(meal => {
                const mealItem = document.createElement('div');
                mealItem.className = `meal-item p-2 ${type}`;
                mealItem.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <div>
                            <p class="mb-0">${meal.name}</p>
                            <small class="text-muted">
                                ${meal.servingSize} serving • P: ${meal.protein}g • C: ${meal.carbs}g • F: ${meal.fat}g
                            </small>
                        </div>
                        <div class="text-end">
                            <p class="mb-0">${meal.calories} cal</p>
                            <button class="btn btn-sm btn-link text-danger p-0 delete-food" data-id="${meal.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
                mealTypeSection.appendChild(mealItem);
            });
            
            mealLog.appendChild(mealTypeSection);
        }
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-food').forEach(button => {
        button.addEventListener('click', function() {
            const foodId = this.dataset.id;
            DataStore.deleteFood(foodId);
            loadNutritionData();
            
            // Update charts
            macroChart.destroy();
            macroChart = ChartManager.createMacroChart('macroChart');
            
            nutritionHistoryChart.destroy();
            nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', document.getElementById('historyChartType').value);
            
            // Generate new meal suggestions
            generateMealSuggestions();
            
            // Show feedback
            showToast('Food item deleted', 'success');
        });
    });
}

/**
 * Set up all event listeners for the nutrition page
 */
function setupEventListeners() {
    // Water controls
    document.getElementById('addWaterBtn').addEventListener('click', function() {
        const currentIntake = DataStore.getDailyWaterIntake();
        const userProfile = DataStore.getUserProfile();
        
        if (currentIntake < userProfile.dailyWaterGoal) {
            DataStore.saveWaterIntake(currentIntake + 1);
            updateWaterTracker();
            
            // Update chart if water is selected
            if (document.getElementById('historyChartType').value === 'water') {
                nutritionHistoryChart.destroy();
                nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', 'water');
            }
        }
    });
    
    document.getElementById('resetWaterBtn').addEventListener('click', function() {
        DataStore.saveWaterIntake(0);
        updateWaterTracker();
        
        // Update chart if water is selected
        if (document.getElementById('historyChartType').value === 'water') {
            nutritionHistoryChart.destroy();
            nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', 'water');
        }
    });
    
    // Meal log filters
    document.getElementById('viewAllMeals').addEventListener('click', function() {
        setActiveMealFilter(this);
        updateMealLog('all');
    });
    
    document.getElementById('viewBreakfast').addEventListener('click', function() {
        setActiveMealFilter(this);
        updateMealLog('breakfast');
    });
    
    document.getElementById('viewLunch').addEventListener('click', function() {
        setActiveMealFilter(this);
        updateMealLog('lunch');
    });
    
    document.getElementById('viewDinner').addEventListener('click', function() {
        setActiveMealFilter(this);
        updateMealLog('dinner');
    });
    
    document.getElementById('viewSnacks').addEventListener('click', function() {
        setActiveMealFilter(this);
        updateMealLog('snack');
    });
    
    // Food search
    document.getElementById('foodSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const searchResults = document.getElementById('searchResults');
        
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        // Search in food database and custom foods
        const dbResults = FOOD_DATABASE.filter(food => 
            food.name.toLowerCase().includes(searchTerm)
        ).slice(0, 6);
        
        const customFoods = DataStore.getCustomFoods().filter(food =>
            food.name.toLowerCase().includes(searchTerm)
        ).slice(0, 4);
        
        // Combine results
        const results = [...customFoods, ...dbResults].slice(0, 8);
        
        // Display results
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="text-muted my-2">No foods found. Try a different search or add a custom food.</p>';
        } else {
            results.forEach(food => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <span>${food.name} ${food.id ? '<span class="badge bg-secondary ms-1">Custom</span>' : ''}</span>
                        <span class="text-muted">${food.calories} cal</span>
                    </div>
                    <small class="text-muted">P: ${food.protein}g • C: ${food.carbs}g • F: ${food.fat}g</small>
                `;
                resultItem.addEventListener('click', function() {
                    selectFood(food);
                });
                searchResults.appendChild(resultItem);
            });
        }
    });
    
    // Add food button
    document.getElementById('addFoodBtn').addEventListener('click', function() {
        const foodName = document.getElementById('foodName').value;
        const calories = parseInt(document.getElementById('calories').value);
        const protein = parseFloat(document.getElementById('protein').value);
        const carbs = parseFloat(document.getElementById('carbs').value);
        const fat = parseFloat(document.getElementById('fat').value);
        const servingSize = parseFloat(document.getElementById('servingSize').value);
        const mealType = document.getElementById('mealType').value;
        
        if (!foodName || isNaN(calories) || calories < 0) {
            alert('Please enter valid food information.');
            return;
        }
        
        const foodItem = {
            name: foodName,
            calories: calories,
            protein: protein || 0,
            carbs: carbs || 0,
            fat: fat || 0,
            servingSize: servingSize || 1,
            mealType: mealType
        };
        
        DataStore.saveFood(foodItem);
        
        // Reset form
        document.getElementById('selectedFoodInfo').classList.add('d-none');
        document.getElementById('foodSearch').value = '';
        
        // Reload data and update UI
        loadNutritionData();
        
        // Update charts
        macroChart.destroy();
        macroChart = ChartManager.createMacroChart('macroChart');
        
        nutritionHistoryChart.destroy();
        nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', document.getElementById('historyChartType').value);
        
        // Generate new meal suggestions
        generateMealSuggestions();
        
        // Show feedback
        showToast(`${foodName} added to your food log!`, 'success');
    });
    
    // Custom food button
    document.getElementById('customFoodBtn').addEventListener('click', function() {
        const customFoodModal = new bootstrap.Modal(document.getElementById('customFoodModal'));
        
        // Reset form
        document.getElementById('customFoodForm').reset();
        
        customFoodModal.show();
    });
    
    // Save custom food button
    document.getElementById('saveCustomFoodBtn').addEventListener('click', function() {
        const name = document.getElementById('customFoodName').value;
        const calories = parseInt(document.getElementById('customCalories').value);
        const protein = parseFloat(document.getElementById('customProtein').value);
        const carbs = parseFloat(document.getElementById('customCarbs').value);
        const fat = parseFloat(document.getElementById('customFat').value);
        const servingSize = parseFloat(document.getElementById('customServingSize').value);
        const servingUnit = document.getElementById('customServingUnit').value;
        
        if (!name || isNaN(calories) || calories < 0) {
            alert('Please enter valid food information.');
            return;
        }
        
        const customFood = {
            name: name,
            calories: calories,
            protein: protein || 0,
            carbs: carbs || 0,
            fat: fat || 0,
            servingSize: servingSize || 1,
            servingUnit: servingUnit || 'serving'
        };
        
        // Save custom food
        DataStore.saveCustomFood(customFood);
        
        // Add as a meal directly
        const foodItem = {
            ...customFood,
            mealType: document.getElementById('mealType').value || 'snack'
        };
        
        DataStore.saveFood(foodItem);
        
        // Close modal
        const customFoodModal = bootstrap.Modal.getInstance(document.getElementById('customFoodModal'));
        customFoodModal.hide();
        
        // Reload data and update UI
        loadNutritionData();
        
        // Update charts
        macroChart.destroy();
        macroChart = ChartManager.createMacroChart('macroChart');
        
        nutritionHistoryChart.destroy();
        nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', document.getElementById('historyChartType').value);
        
        // Generate new meal suggestions
        generateMealSuggestions();
        
        // Show feedback
        showToast(`${name} added to your food log and custom foods!`, 'success');
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
    document.getElementById('foodSearch').value = '';
    
    // Fill form with food data
    document.getElementById('foodName').value = food.name;
    
    // Set initial values
    const baseCalories = food.calories;
    const baseProtein = food.protein || 0;
    const baseCarbs = food.carbs || 0;
    const baseFat = food.fat || 0;
    
    document.getElementById('calories').value = baseCalories;
    document.getElementById('protein').value = baseProtein;
    document.getElementById('carbs').value = baseCarbs;
    document.getElementById('fat').value = baseFat;
    
    // Set serving to 1 by default
    document.getElementById('servingSize').value = 1;
    
    // Update values when serving size changes
    document.getElementById('servingSize').addEventListener('input', function() {
        const serving = parseFloat(this.value) || 0;
        document.getElementById('calories').value = Math.round(baseCalories * serving);
        document.getElementById('protein').value = (baseProtein * serving).toFixed(1);
        document.getElementById('carbs').value = (baseCarbs * serving).toFixed(1);
        document.getElementById('fat').value = (baseFat * serving).toFixed(1);
    });
}

/**
 * Sets the active meal filter button
 * @param {HTMLElement} activeButton - Button to set as active
 */
function setActiveMealFilter(activeButton) {
    const filterButtons = document.querySelectorAll('#viewAllMeals, #viewBreakfast, #viewLunch, #viewDinner, #viewSnacks');
    
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    activeButton.classList.add('active');
}

/**
 * Generates meal suggestions based on remaining macros
 */
function generateMealSuggestions() {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    const userProfile = DataStore.getUserProfile();
    const caloriesConsumed = DataStore.getTotalCaloriesConsumed();
    const remainingCalories = userProfile.dailyCalorieGoal - caloriesConsumed;
    
    // Clear existing suggestions
    suggestionsContainer.innerHTML = '';
    
    // If no calories remaining or negative, show message
    if (remainingCalories <= 0) {
        suggestionsContainer.innerHTML = `
            <div class="col-12 text-center py-3">
                <p class="text-muted">You've reached your calorie goal for today!</p>
            </div>
        `;
        return;
    }
    
    // Get current macros
    const macros = DataStore.getMacroTotals();
    const totalGrams = macros.carbs + macros.protein + macros.fat;
    let macroNeeded = 'balanced';
    
    // Determine which macro is needed based on current percentages
    if (totalGrams > 0) {
        const proteinPercentage = (macros.protein / totalGrams) * 100;
        const carbsPercentage = (macros.carbs / totalGrams) * 100;
        const fatPercentage = (macros.fat / totalGrams) * 100;
        
        if (proteinPercentage < 15) {
            macroNeeded = 'protein';
        } else if (carbsPercentage < 40) {
            macroNeeded = 'carbs';
        } else if (fatPercentage < 20) {
            macroNeeded = 'fat';
        }
    }
    
    // Filter foods based on remaining calories and macro needs
    let suggestedFoods = FOOD_DATABASE.filter(food => {
        // Filter by calorie range (25-75% of remaining calories)
        const minCalories = remainingCalories * 0.25;
        const maxCalories = remainingCalories * 0.75;
        
        if (food.calories < minCalories || food.calories > maxCalories) {
            return false;
        }
        
        // Filter by macro need
        if (macroNeeded === 'protein' && food.protein < 10) {
            return false;
        } else if (macroNeeded === 'carbs' && food.carbs < 20) {
            return false;
        } else if (macroNeeded === 'fat' && food.fat < 8) {
            return false;
        }
        
        return true;
    });
    
    // If no foods match, use less strict criteria
    if (suggestedFoods.length < 3) {
        suggestedFoods = FOOD_DATABASE.filter(food => food.calories <= remainingCalories * 0.8);
    }
    
    // Sort by relevance to macro need
    suggestedFoods.sort((a, b) => {
        if (macroNeeded === 'protein') {
            return b.protein / b.calories - a.protein / a.calories;
        } else if (macroNeeded === 'carbs') {
            return b.carbs / b.calories - a.carbs / a.calories;
        } else if (macroNeeded === 'fat') {
            return b.fat / b.calories - a.fat / a.calories;
        }
        return 0;
    });
    
    // Take only first 3 suggestions
    suggestedFoods = suggestedFoods.slice(0, 4);
    
    // If still no foods, show message
    if (suggestedFoods.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="col-12 text-center py-3">
                <p class="text-muted">No specific suggestions available right now.</p>
                <p class="small">You have ${formatNumber(remainingCalories)} calories remaining</p>
            </div>
        `;
        return;
    }
    
    // Display suggestions
    suggestedFoods.forEach(food => {
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-6 mb-3';
        col.innerHTML = `
            <div class="card h-100 suggestion-card">
                <div class="card-body">
                    <h6 class="card-title">${food.name}</h6>
                    <p class="mb-1">${food.calories} calories</p>
                    <div class="small mb-2">
                        <span class="me-2">P: ${food.protein}g</span>
                        <span class="me-2">C: ${food.carbs}g</span>
                        <span>F: ${food.fat}g</span>
                    </div>
                    <button class="btn btn-sm btn-outline-primary add-suggestion" data-food='${JSON.stringify(food)}'>
                        Add to Log
                    </button>
                </div>
            </div>
        `;
        suggestionsContainer.appendChild(col);
    });
    
    // Add "Remaining Calories" card
    const remainingCol = document.createElement('div');
    remainingCol.className = 'col-md-3 col-sm-6 mb-3';
    remainingCol.innerHTML = `
        <div class="card h-100 bg-dark">
            <div class="card-body text-center d-flex flex-column justify-content-center">
                <h5 class="card-title">Remaining</h5>
                <p class="display-4 mb-0">${formatNumber(remainingCalories)}</p>
                <p class="mb-0">calories</p>
            </div>
        </div>
    `;
    suggestionsContainer.appendChild(remainingCol);
    
    // Add event listeners to suggestion buttons
    document.querySelectorAll('.add-suggestion').forEach(button => {
        button.addEventListener('click', function() {
            const food = JSON.parse(this.dataset.food);
            
            // Create food item with default meal type
            const currentHour = new Date().getHours();
            let mealType = 'snack';
            
            if (currentHour >= 5 && currentHour < 11) {
                mealType = 'breakfast';
            } else if (currentHour >= 11 && currentHour < 15) {
                mealType = 'lunch';
            } else if (currentHour >= 17 && currentHour < 21) {
                mealType = 'dinner';
            }
            
            const foodItem = {
                ...food,
                servingSize: 1,
                mealType: mealType
            };
            
            DataStore.saveFood(foodItem);
            
            // Reload data and update UI
            loadNutritionData();
            
            // Update charts
            macroChart.destroy();
            macroChart = ChartManager.createMacroChart('macroChart');
            
            nutritionHistoryChart.destroy();
            nutritionHistoryChart = ChartManager.createNutritionHistoryChart('nutritionHistoryChart', document.getElementById('historyChartType').value);
            
            // Generate new meal suggestions
            generateMealSuggestions();
            
            // Show feedback
            showToast(`${food.name} added to your food log!`, 'success');
        });
    });
}
