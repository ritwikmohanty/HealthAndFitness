/**
 * Food database with nutritional information
 * This database contains common food items with their calorie and macro information
 * Used for food logging and calorie tracking
 */

const FOOD_DATABASE = [
    // Fruits
    {
        name: "Apple",
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3
    },
    {
        name: "Banana",
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4
    },
    {
        name: "Orange",
        calories: 62,
        protein: 1.2,
        carbs: 15.4,
        fat: 0.2
    },
    {
        name: "Strawberries (1 cup)",
        calories: 49,
        protein: 1,
        carbs: 11.7,
        fat: 0.5
    },
    {
        name: "Blueberries (1 cup)",
        calories: 84,
        protein: 1.1,
        carbs: 21.4,
        fat: 0.5
    },
    {
        name: "Avocado (1/2)",
        calories: 161,
        protein: 2,
        carbs: 8.5,
        fat: 14.7
    },
    
    // Vegetables
    {
        name: "Broccoli (1 cup)",
        calories: 55,
        protein: 3.7,
        carbs: 11.2,
        fat: 0.6
    },
    {
        name: "Spinach (1 cup)",
        calories: 7,
        protein: 0.9,
        carbs: 1.1,
        fat: 0.1
    },
    {
        name: "Carrots (1 cup)",
        calories: 52,
        protein: 1.2,
        carbs: 12.3,
        fat: 0.3
    },
    {
        name: "Sweet Potato (medium)",
        calories: 103,
        protein: 2.3,
        carbs: 24,
        fat: 0.2
    },
    {
        name: "Kale (1 cup)",
        calories: 33,
        protein: 2.9,
        carbs: 6.7,
        fat: 0.5
    },
    
    // Proteins
    {
        name: "Chicken Breast (4 oz)",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6
    },
    {
        name: "Salmon (4 oz)",
        calories: 233,
        protein: 25,
        carbs: 0,
        fat: 15
    },
    {
        name: "Egg (large)",
        calories: 72,
        protein: 6.3,
        carbs: 0.4,
        fat: 5
    },
    {
        name: "Tofu (1/2 cup)",
        calories: 94,
        protein: 10,
        carbs: 2,
        fat: 6
    },
    {
        name: "Ground Beef, 90% lean (4 oz)",
        calories: 199,
        protein: 23,
        carbs: 0,
        fat: 11
    },
    {
        name: "Tuna (1 can, in water)",
        calories: 121,
        protein: 27,
        carbs: 0,
        fat: 1
    },
    {
        name: "Turkey Breast (4 oz)",
        calories: 130,
        protein: 30,
        carbs: 0,
        fat: 1
    },
    
    // Dairy & Alternatives
    {
        name: "Greek Yogurt (1 cup)",
        calories: 146,
        protein: 23,
        carbs: 9,
        fat: 0.5
    },
    {
        name: "Milk, 2% (1 cup)",
        calories: 122,
        protein: 8,
        carbs: 11.7,
        fat: 4.8
    },
    {
        name: "Cheddar Cheese (1 oz)",
        calories: 113,
        protein: 7,
        carbs: 0.4,
        fat: 9
    },
    {
        name: "Almond Milk (1 cup)",
        calories: 39,
        protein: 1.5,
        carbs: 3.4,
        fat: 2.8
    },
    {
        name: "Cottage Cheese (1/2 cup)",
        calories: 111,
        protein: 12.5,
        carbs: 4.5,
        fat: 5
    },
    
    // Grains
    {
        name: "Brown Rice (1 cup, cooked)",
        calories: 216,
        protein: 5,
        carbs: 45,
        fat: 1.8
    },
    {
        name: "Quinoa (1 cup, cooked)",
        calories: 222,
        protein: 8,
        carbs: 39,
        fat: 3.6
    },
    {
        name: "Whole Wheat Bread (1 slice)",
        calories: 81,
        protein: 4,
        carbs: 13.8,
        fat: 1.1
    },
    {
        name: "Oatmeal (1 cup, cooked)",
        calories: 158,
        protein: 6,
        carbs: 27,
        fat: 3.2
    },
    {
        name: "Pasta (1 cup, cooked)",
        calories: 221,
        protein: 8,
        carbs: 43,
        fat: 1.3
    },
    
    // Legumes
    {
        name: "Black Beans (1/2 cup)",
        calories: 114,
        protein: 7.6,
        carbs: 20.4,
        fat: 0.5
    },
    {
        name: "Lentils (1/2 cup, cooked)",
        calories: 115,
        protein: 9,
        carbs: 20,
        fat: 0.4
    },
    {
        name: "Chickpeas (1/2 cup)",
        calories: 143,
        protein: 7.3,
        carbs: 24.5,
        fat: 2.1
    },
    {
        name: "Peanut Butter (2 tbsp)",
        calories: 188,
        protein: 8,
        carbs: 6,
        fat: 16
    },
    
    // Nuts & Seeds
    {
        name: "Almonds (1 oz)",
        calories: 164,
        protein: 6,
        carbs: 6,
        fat: 14
    },
    {
        name: "Walnuts (1 oz)",
        calories: 185,
        protein: 4.3,
        carbs: 3.9,
        fat: 18.5
    },
    {
        name: "Chia Seeds (1 tbsp)",
        calories: 58,
        protein: 2,
        carbs: 5.1,
        fat: 3.7
    },
    {
        name: "Flax Seeds (1 tbsp)",
        calories: 55,
        protein: 1.9,
        carbs: 3,
        fat: 4.3
    },
    
    // Snacks & Treats
    {
        name: "Dark Chocolate (1 oz)",
        calories: 155,
        protein: 2.2,
        carbs: 13,
        fat: 12
    },
    {
        name: "Protein Bar",
        calories: 200,
        protein: 20,
        carbs: 20,
        fat: 5
    },
    {
        name: "Hummus (2 tbsp)",
        calories: 70,
        protein: 2,
        carbs: 4,
        fat: 5
    },
    {
        name: "Trail Mix (1/4 cup)",
        calories: 173,
        protein: 5,
        carbs: 15,
        fat: 11
    },
    {
        name: "Popcorn (3 cups, air-popped)",
        calories: 93,
        protein: 3,
        carbs: 19,
        fat: 1
    },
    
    // Beverages
    {
        name: "Coffee (black)",
        calories: 2,
        protein: 0.3,
        carbs: 0,
        fat: 0
    },
    {
        name: "Orange Juice (1 cup)",
        calories: 110,
        protein: 2,
        carbs: 26,
        fat: 0.5
    },
    {
        name: "Green Tea",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    },
    {
        name: "Smoothie (fruit)",
        calories: 150,
        protein: 2.5,
        carbs: 34,
        fat: 0.8
    },
    {
        name: "Protein Shake",
        calories: 170,
        protein: 25,
        carbs: 9,
        fat: 2.5
    },
    
    // Common Meals
    {
        name: "Grilled Chicken Salad",
        calories: 350,
        protein: 35,
        carbs: 20,
        fat: 14
    },
    {
        name: "Tuna Sandwich",
        calories: 330,
        protein: 28,
        carbs: 33,
        fat: 9
    },
    {
        name: "Vegetable Stir Fry",
        calories: 275,
        protein: 15,
        carbs: 30,
        fat: 12
    },
    {
        name: "Omelette (2 eggs)",
        calories: 220,
        protein: 14,
        carbs: 2,
        fat: 16
    },
    {
        name: "Beef Burrito",
        calories: 580,
        protein: 26,
        carbs: 68,
        fat: 22
    },
    {
        name: "Spaghetti with Tomato Sauce",
        calories: 390,
        protein: 12,
        carbs: 78,
        fat: 4
    },
    {
        name: "Caesar Salad",
        calories: 290,
        protein: 8,
        carbs: 10,
        fat: 24
    },
    {
        name: "Turkey Sandwich",
        calories: 320,
        protein: 25,
        carbs: 40,
        fat: 7
    },
    {
        name: "Vegetable Soup (1 cup)",
        calories: 120,
        protein: 4,
        carbs: 18,
        fat: 3.5
    },
    {
        name: "Baked Salmon with Vegetables",
        calories: 400,
        protein: 35,
        carbs: 15,
        fat: 20
    }
];
