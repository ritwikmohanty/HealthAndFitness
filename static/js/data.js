/**
 * Data management and storage module
 * Handles saving and retrieving data from localStorage
 */

// Data store object
const DataStore = {
    // User profile and settings
    getUserProfile() {
        const defaultProfile = {
            name: 'User',
            dailyCalorieGoal: 2000,
            dailyStepGoal: 10000,
            dailyWaterGoal: 8,
            weeklyWorkoutGoal: 5,
            weeklyMinutesGoal: 150,
            dailyCalorieBurnGoal: 500,
            height: 170, // cm
            weight: 70, // kg
            points: 0,
            achievements: []
        };
        
        const profile = JSON.parse(localStorage.getItem('userProfile')) || defaultProfile;
        return profile;
    },
    
    saveUserProfile(profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
    },
    
    // Steps tracking
    getStepLogs() {
        return JSON.parse(localStorage.getItem('stepLogs')) || [];
    },
    
    getDailySteps(date = getCurrentDateString()) {
        const logs = this.getStepLogs();
        const dayLog = logs.find(log => log.date === date);
        return dayLog ? dayLog.steps : 0;
    },
    
    saveSteps(steps, date = getCurrentDateString()) {
        const logs = this.getStepLogs();
        const existingLogIndex = logs.findIndex(log => log.date === date);
        
        if (existingLogIndex >= 0) {
            logs[existingLogIndex].steps = steps;
        } else {
            logs.push({
                id: generateId(),
                date: date,
                steps: steps
            });
        }
        
        localStorage.setItem('stepLogs', JSON.stringify(logs));
        this.checkAchievements();
    },
    
    // Calories tracking - Food
    getFoodLogs() {
        return JSON.parse(localStorage.getItem('foodLogs')) || [];
    },
    
    getDailyFoodLogs(date = getCurrentDateString()) {
        const logs = this.getFoodLogs();
        return logs.filter(log => log.date === date);
    },
    
    getTotalCaloriesConsumed(date = getCurrentDateString()) {
        const dayLogs = this.getDailyFoodLogs(date);
        return dayLogs.reduce((sum, log) => sum + log.calories, 0);
    },
    
    getMacroTotals(date = getCurrentDateString()) {
        const dayLogs = this.getDailyFoodLogs(date);
        let totals = {
            protein: 0,
            carbs: 0,
            fat: 0
        };
        
        dayLogs.forEach(log => {
            totals.protein += log.protein || 0;
            totals.carbs += log.carbs || 0;
            totals.fat += log.fat || 0;
        });
        
        return totals;
    },
    
    saveFood(foodItem, date = getCurrentDateString()) {
        const logs = this.getFoodLogs();
        
        const newFoodLog = {
            id: generateId(),
            date: date,
            name: foodItem.name,
            calories: foodItem.calories,
            protein: foodItem.protein || 0,
            carbs: foodItem.carbs || 0,
            fat: foodItem.fat || 0,
            mealType: foodItem.mealType || 'snack',
            servingSize: foodItem.servingSize || 1
        };
        
        logs.push(newFoodLog);
        localStorage.setItem('foodLogs', JSON.stringify(logs));
        this.checkAchievements();
    },
    
    deleteFood(foodId) {
        const logs = this.getFoodLogs();
        const updatedLogs = logs.filter(log => log.id !== foodId);
        localStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
    },
    
    // Water tracking
    getWaterLogs() {
        return JSON.parse(localStorage.getItem('waterLogs')) || [];
    },
    
    getDailyWaterIntake(date = getCurrentDateString()) {
        const logs = this.getWaterLogs();
        const dayLog = logs.find(log => log.date === date);
        return dayLog ? dayLog.glasses : 0;
    },
    
    saveWaterIntake(glasses, date = getCurrentDateString()) {
        const logs = this.getWaterLogs();
        const existingLogIndex = logs.findIndex(log => log.date === date);
        
        if (existingLogIndex >= 0) {
            logs[existingLogIndex].glasses = glasses;
        } else {
            logs.push({
                id: generateId(),
                date: date,
                glasses: glasses
            });
        }
        
        localStorage.setItem('waterLogs', JSON.stringify(logs));
        this.checkAchievements();
    },
    
    // Workout tracking
    getWorkoutLogs() {
        return JSON.parse(localStorage.getItem('workoutLogs')) || [];
    },
    
    getDailyWorkouts(date = getCurrentDateString()) {
        const logs = this.getWorkoutLogs();
        return logs.filter(log => log.date === date);
    },
    
    getWeeklyWorkouts() {
        const logs = this.getWorkoutLogs();
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return logs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= oneWeekAgo && logDate <= today;
        });
    },
    
    getTotalCaloriesBurned(date = getCurrentDateString()) {
        const dayLogs = this.getDailyWorkouts(date);
        return dayLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
    },
    
    getWeeklyCaloriesBurned() {
        const weekLogs = this.getWeeklyWorkouts();
        return weekLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
    },
    
    getWeeklyWorkoutMinutes() {
        const weekLogs = this.getWeeklyWorkouts();
        return weekLogs.reduce((sum, log) => sum + log.duration, 0);
    },
    
    saveWorkout(workout, date = getCurrentDateString()) {
        const logs = this.getWorkoutLogs();
        
        const newWorkoutLog = {
            id: generateId(),
            date: date,
            workoutType: workout.workoutType,
            duration: workout.duration,
            caloriesBurned: workout.caloriesBurned,
            intensity: workout.intensity || 'medium',
            notes: workout.notes || ''
        };
        
        logs.push(newWorkoutLog);
        localStorage.setItem('workoutLogs', JSON.stringify(logs));
        this.checkAchievements();
    },
    
    deleteWorkout(workoutId) {
        const logs = this.getWorkoutLogs();
        const updatedLogs = logs.filter(log => log.id !== workoutId);
        localStorage.setItem('workoutLogs', JSON.stringify(updatedLogs));
    },
    
    // Custom foods database
    getCustomFoods() {
        return JSON.parse(localStorage.getItem('customFoods')) || [];
    },
    
    saveCustomFood(food) {
        const foods = this.getCustomFoods();
        
        const newFood = {
            id: generateId(),
            name: food.name,
            calories: food.calories,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0,
            servingSize: food.servingSize || 1,
            servingUnit: food.servingUnit || 'serving'
        };
        
        foods.push(newFood);
        localStorage.setItem('customFoods', JSON.stringify(foods));
    },
    
    // Challenge management
    getChallenges() {
        return JSON.parse(localStorage.getItem('challenges')) || [];
    },
    
    getActiveUserChallenges() {
        const challenges = this.getChallenges();
        const today = getCurrentDateString();
        
        return challenges.filter(challenge => 
            challenge.participants && 
            challenge.participants.includes('user') && 
            challenge.startDate <= today && 
            challenge.endDate >= today
        );
    },
    
    saveChallenge(challenge) {
        const challenges = this.getChallenges();
        
        // Add current user as participant
        if (!challenge.participants) {
            challenge.participants = ['user'];
        }
        
        // Add a unique ID if not present
        if (!challenge.id) {
            challenge.id = generateId();
        }
        
        challenges.push(challenge);
        localStorage.setItem('challenges', JSON.stringify(challenges));
    },
    
    joinChallenge(challengeId) {
        try {
            const challenges = this.getChallenges();
            const challengeIndex = challenges.findIndex(c => c.id === challengeId);
            
            if (challengeIndex >= 0) {
                if (!challenges[challengeIndex].participants) {
                    challenges[challengeIndex].participants = [];
                }
                
                if (!challenges[challengeIndex].participants.includes('user')) {
                    challenges[challengeIndex].participants.push('user');
                    localStorage.setItem('challenges', JSON.stringify(challenges));
                    console.log(`Successfully joined challenge: ${challenges[challengeIndex].name}`);
                    return true;
                } else {
                    console.log('Already joined this challenge');
                }
            } else {
                console.error(`Challenge not found with ID: ${challengeId}`);
            }
        } catch (error) {
            console.error('Error joining challenge:', error);
        }
        
        return false;
    },
    
    // Friend management
    getFriends() {
        return JSON.parse(localStorage.getItem('friends')) || [];
    },
    
    addFriend(name) {
        const friends = this.getFriends();
        
        // Check if friend already exists
        if (friends.some(friend => friend.name.toLowerCase() === name.toLowerCase())) {
            return false;
        }
        
        friends.push({
            id: generateId(),
            name: name,
            stats: {
                steps: Math.floor(Math.random() * 12000),
                calories: Math.floor(Math.random() * 600),
                workouts: Math.floor(Math.random() * 5)
            }
        });
        
        localStorage.setItem('friends', JSON.stringify(friends));
        return true;
    },
    
    // Workout plans
    getWorkoutPlan() {
        return JSON.parse(localStorage.getItem('workoutPlan')) || null;
    },
    
    saveWorkoutPlan(plan) {
        localStorage.setItem('workoutPlan', JSON.stringify(plan));
    },
    
    // Achievements system
    checkAchievements() {
        const profile = this.getUserProfile();
        let achievements = profile.achievements || [];
        const dailySteps = this.getDailySteps();
        const totalSteps = this.getStepLogs().reduce((sum, log) => sum + log.steps, 0);
        const workoutCount = this.getWorkoutLogs().length;
        const waterStreak = this.calculateWaterStreak();
        
        // Check for step achievements
        if (dailySteps >= 10000 && !achievements.some(a => a.id === 'steps-10k')) {
            achievements.push({
                id: 'steps-10k',
                title: '10K Steps',
                description: 'Walked 10,000 steps in a single day',
                date: getCurrentDateString(),
                icon: 'shoe-prints',
                points: 50
            });
            profile.points += 50;
        }
        
        if (totalSteps >= 100000 && !achievements.some(a => a.id === 'steps-100k')) {
            achievements.push({
                id: 'steps-100k',
                title: 'Step Master',
                description: 'Reached 100,000 total steps',
                date: getCurrentDateString(),
                icon: 'walking',
                points: 100
            });
            profile.points += 100;
        }
        
        // Check for workout achievements
        if (workoutCount >= 10 && !achievements.some(a => a.id === 'workout-10')) {
            achievements.push({
                id: 'workout-10',
                title: 'Workout Warrior',
                description: 'Completed 10 workouts',
                date: getCurrentDateString(),
                icon: 'dumbbell',
                points: 75
            });
            profile.points += 75;
        }
        
        // Check for water streak achievements
        if (waterStreak >= 7 && !achievements.some(a => a.id === 'water-streak-7')) {
            achievements.push({
                id: 'water-streak-7',
                title: 'Hydration Hero',
                description: 'Met water goal for 7 days in a row',
                date: getCurrentDateString(),
                icon: 'tint',
                points: 80
            });
            profile.points += 80;
        }
        
        // Save updated profile
        profile.achievements = achievements;
        this.saveUserProfile(profile);
    },
    
    // Helper functions
    calculateWaterStreak() {
        const logs = this.getWaterLogs();
        const goal = this.getUserProfile().dailyWaterGoal;
        let streak = 0;
        
        // Sort logs by date (newest first)
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Check for continuous days meeting the goal
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].glasses >= goal) {
                streak++;
                
                // Check if the date is consecutive to the previous date
                if (i > 0) {
                    const currentDate = new Date(logs[i].date);
                    const prevDate = new Date(logs[i-1].date);
                    const diffDays = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays !== 1) {
                        break;
                    }
                }
            } else {
                break;
            }
        }
        
        return streak;
    },
    
    // Net calorie calculation
    getNetCalories(date = getCurrentDateString()) {
        const caloriesConsumed = this.getTotalCaloriesConsumed(date);
        const caloriesBurned = this.getTotalCaloriesBurned(date);
        // Add BMR calories burned - simplified calculation
        const bmr = 1500; // Base metabolic rate - simplified
        return caloriesConsumed - caloriesBurned - bmr;
    }
};
