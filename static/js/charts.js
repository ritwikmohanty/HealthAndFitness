/**
 * Charts module
 * Handles creation and updating of charts throughout the application
 */

// Chart color palettes for both themes
const chartColorThemes = {
    dark: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0',
        light: '#f8f9fa',
        dark: '#212529',
        gray: '#adb5bd',
        text: '#f8f9fa',
        gridLines: 'rgba(255, 255, 255, 0.1)',
        transparent: 'rgba(0, 0, 0, 0)'
    },
    light: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#20c997',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0',
        light: '#f8f9fa',
        dark: '#212529',
        gray: '#6c757d',
        text: '#212529',
        gridLines: 'rgba(0, 0, 0, 0.1)',
        transparent: 'rgba(0, 0, 0, 0)'
    }
};

// Default to dark theme initially
let chartColors = chartColorThemes.dark;

// Shared chart options for consistent styling
const sharedChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: chartColors.text
            }
        },
        tooltip: {
            backgroundColor: chartColors.dark,
            titleColor: chartColors.text,
            bodyColor: chartColors.text,
            borderColor: chartColors.secondary,
            borderWidth: 1
        }
    },
    scales: {
        x: {
            grid: {
                color: chartColors.gridLines
            },
            ticks: {
                color: chartColors.gray
            }
        },
        y: {
            grid: {
                color: chartColors.gridLines
            },
            ticks: {
                color: chartColors.gray
            },
            beginAtZero: true
        }
    }
};

// Chart manager object
const ChartManager = {
    // Initialize chart defaults
    init() {
        // Set default chart styles
        Chart.defaults.color = chartColors.text;
        Chart.defaults.borderColor = chartColors.gridLines;
        
        // Listen for theme changes
        document.addEventListener('themeChanged', this.handleThemeChange.bind(this));
    },
    
    /**
     * Handle theme changes to update chart colors
     * @param {CustomEvent} event - Theme change event
     */
    handleThemeChange(event) {
        const theme = event.detail.theme;
        chartColors = chartColorThemes[theme];
        
        // Update chart.js defaults
        Chart.defaults.color = chartColors.text;
        Chart.defaults.borderColor = chartColors.gridLines;
        
        // Update existing charts (can be implemented if charts are stored)
        // For demo, just notify console
        console.log(`Theme changed to ${theme}. Recreate charts for full theme support.`);
    },
    
    /**
     * Creates a weekly trend chart
     * @param {string} canvasId - Canvas element ID
     * @param {string} dataType - Data type to display (calories, steps, water)
     */
    createWeeklyTrendChart(canvasId, dataType = 'calories') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        // Get chart data based on dataType
        const { labels, datasets } = this.getWeeklyTrendData(dataType);
        
        return new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                ...sharedChartOptions,
                tension: 0.3
            }
        });
    },
    
    /**
     * Get data for weekly trend chart
     * @param {string} dataType - Data type to get (calories, steps, water)
     */
    getWeeklyTrendData(dataType) {
        // Get dates for the last 7 days
        const dates = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            dates.push(formattedDate);
        }
        
        // Format date labels as day names
        const labels = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        // Create datasets based on dataType
        let datasets = [];
        
        if (dataType === 'calories') {
            // Calories consumed
            const consumedData = dates.map(date => DataStore.getTotalCaloriesConsumed(date));
            
            // Calories burned
            const burnedData = dates.map(date => DataStore.getTotalCaloriesBurned(date));
            
            datasets = [
                {
                    label: 'Calories Consumed',
                    data: consumedData,
                    backgroundColor: chartColors.info,
                    borderColor: chartColors.info,
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Calories Burned',
                    data: burnedData,
                    backgroundColor: chartColors.success,
                    borderColor: chartColors.success,
                    borderWidth: 2,
                    fill: false
                }
            ];
        } else if (dataType === 'steps') {
            // Daily steps
            const stepsData = dates.map(date => DataStore.getDailySteps(date));
            
            datasets = [
                {
                    label: 'Steps',
                    data: stepsData,
                    backgroundColor: chartColors.primary,
                    borderColor: chartColors.primary,
                    borderWidth: 2,
                    fill: false
                }
            ];
        } else if (dataType === 'water') {
            // Water intake
            const waterData = dates.map(date => DataStore.getDailyWaterIntake(date));
            
            datasets = [
                {
                    label: 'Glasses of Water',
                    data: waterData,
                    backgroundColor: chartColors.info,
                    borderColor: chartColors.info,
                    borderWidth: 2,
                    fill: false
                }
            ];
        }
        
        return { labels, datasets };
    },
    
    /**
     * Creates a macro breakdown chart
     * @param {string} canvasId - Canvas element ID
     */
    createMacroChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const macros = DataStore.getMacroTotals();
        
        return new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Carbs', 'Protein', 'Fat'],
                datasets: [{
                    data: [macros.carbs, macros.protein, macros.fat],
                    backgroundColor: [
                        chartColors.primary,
                        chartColors.success,
                        chartColors.warning
                    ],
                    borderColor: chartColors.dark,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: chartColors.light,
                            padding: 10,
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value}g (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    },
    
    /**
     * Creates a workout distribution chart
     * @param {string} canvasId - Canvas element ID
     */
    createWorkoutDistributionChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        // Get workout logs and count types
        const workouts = DataStore.getWorkoutLogs();
        const distribution = {};
        
        workouts.forEach(workout => {
            if (distribution[workout.workoutType]) {
                distribution[workout.workoutType] += workout.duration;
            } else {
                distribution[workout.workoutType] = workout.duration;
            }
        });
        
        // Sort by duration (descending) and take top 5
        const sortedWorkouts = Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const labels = sortedWorkouts.map(item => item[0]);
        const data = sortedWorkouts.map(item => item[1]);
        
        return new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        chartColors.primary,
                        chartColors.success,
                        chartColors.danger,
                        chartColors.warning,
                        chartColors.info
                    ],
                    borderColor: chartColors.dark,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: chartColors.light,
                            padding: 8,
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} minutes`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Creates a nutrition history chart
     * @param {string} canvasId - Canvas element ID
     * @param {string} chartType - Chart type (calories, macros, water)
     */
    createNutritionHistoryChart(canvasId, chartType = 'calories') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        // Get dates for the last 7 days
        const dates = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            dates.push(formattedDate);
        }
        
        // Format date labels as day names
        const labels = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        let chartData = {};
        
        if (chartType === 'calories') {
            const caloriesData = dates.map(date => DataStore.getTotalCaloriesConsumed(date));
            const caloriesGoal = DataStore.getUserProfile().dailyCalorieGoal;
            const goalLine = Array(7).fill(caloriesGoal);
            
            chartData = {
                labels: labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Calories Consumed',
                        data: caloriesData,
                        backgroundColor: chartColors.info,
                        borderColor: chartColors.info,
                        borderWidth: 1
                    },
                    {
                        type: 'line',
                        label: 'Calorie Goal',
                        data: goalLine,
                        borderColor: chartColors.warning,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointBackgroundColor: chartColors.transparent,
                        pointBorderColor: chartColors.transparent,
                        fill: false
                    }
                ]
            };
        } else if (chartType === 'macros') {
            const proteinData = [];
            const carbsData = [];
            const fatData = [];
            
            dates.forEach(date => {
                const macros = DataStore.getMacroTotals(date);
                proteinData.push(macros.protein);
                carbsData.push(macros.carbs);
                fatData.push(macros.fat);
            });
            
            chartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Protein (g)',
                        data: proteinData,
                        backgroundColor: chartColors.success,
                        borderColor: chartColors.success,
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Carbs (g)',
                        data: carbsData,
                        backgroundColor: chartColors.primary,
                        borderColor: chartColors.primary,
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Fat (g)',
                        data: fatData,
                        backgroundColor: chartColors.warning,
                        borderColor: chartColors.warning,
                        borderWidth: 2,
                        fill: false
                    }
                ]
            };
        } else if (chartType === 'water') {
            const waterData = dates.map(date => DataStore.getDailyWaterIntake(date));
            const waterGoal = DataStore.getUserProfile().dailyWaterGoal;
            const goalLine = Array(7).fill(waterGoal);
            
            chartData = {
                labels: labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Glasses of Water',
                        data: waterData,
                        backgroundColor: chartColors.info,
                        borderColor: chartColors.info,
                        borderWidth: 1
                    },
                    {
                        type: 'line',
                        label: 'Water Goal',
                        data: goalLine,
                        borderColor: chartColors.primary,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointBackgroundColor: chartColors.transparent,
                        pointBorderColor: chartColors.transparent,
                        fill: false
                    }
                ]
            };
        }
        
        const chartType2 = chartType === 'macros' ? 'line' : 'bar';
        
        return new Chart(canvas, {
            type: chartType2,
            data: chartData,
            options: {
                ...sharedChartOptions,
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    },
    
    /**
     * Creates a workout history chart
     * @param {string} canvasId - Canvas element ID
     * @param {string} chartType - Chart type (calories, duration, workouts)
     */
    createWorkoutHistoryChart(canvasId, chartType = 'calories') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        // Get dates for the last 14 days
        const dates = [];
        const today = new Date();
        
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            dates.push(formattedDate);
        }
        
        // Format date labels as shorter day names (only show every other day)
        const labels = dates.map((date, index) => {
            const d = new Date(date);
            return index % 2 === 0 ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
        });
        
        let chartData = {};
        
        if (chartType === 'calories') {
            const caloriesData = dates.map(date => DataStore.getTotalCaloriesBurned(date));
            
            chartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Calories Burned',
                        data: caloriesData,
                        backgroundColor: chartColors.success,
                        borderColor: chartColors.success,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            };
        } else if (chartType === 'duration') {
            const durationData = dates.map(date => {
                const workouts = DataStore.getDailyWorkouts(date);
                return workouts.reduce((sum, workout) => sum + workout.duration, 0);
            });
            
            chartData = {
                labels: labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Workout Minutes',
                        data: durationData,
                        backgroundColor: chartColors.primary,
                        borderColor: chartColors.primary,
                        borderWidth: 1
                    }
                ]
            };
        } else if (chartType === 'workouts') {
            // Group workouts by type across all dates
            const workoutTypes = {};
            
            dates.forEach(date => {
                const workouts = DataStore.getDailyWorkouts(date);
                workouts.forEach(workout => {
                    if (!workoutTypes[workout.workoutType]) {
                        workoutTypes[workout.workoutType] = Array(dates.length).fill(0);
                    }
                    
                    const dateIndex = dates.indexOf(date);
                    workoutTypes[workout.workoutType][dateIndex] += 1;
                });
            });
            
            // Create a dataset for each workout type
            const datasets = Object.keys(workoutTypes).map((type, index) => {
                const colors = [
                    chartColors.primary, 
                    chartColors.success, 
                    chartColors.warning, 
                    chartColors.danger, 
                    chartColors.info
                ];
                
                return {
                    label: type,
                    data: workoutTypes[type],
                    backgroundColor: colors[index % colors.length],
                    borderColor: colors[index % colors.length],
                    borderWidth: 2,
                    fill: false
                };
            });
            
            chartData = {
                labels: labels,
                datasets: datasets
            };
        }
        
        return new Chart(canvas, {
            type: chartType === 'duration' ? 'bar' : (chartType === 'workouts' ? 'line' : 'line'),
            data: chartData,
            options: {
                ...sharedChartOptions,
                tension: 0.2,
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }
};
