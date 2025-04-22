 # FitTracker – Health & Fitness Web App

FitTracker is a comprehensive health and fitness tracking web application built for a college mini project. It helps users monitor their workouts, nutrition, water intake, and more—all in one place. The app is built using **HTML**, **CSS**, and **JavaScript** (no React or frontend frameworks), with a focus on clean UI and interactive features.

---

## Features

- **Dashboard Overview**  
  View daily stats: steps, calories burned, calories consumed, net calories, and water intake.

- **Workout Tracker**  
  - Log workouts with type, duration, intensity, and calories burned.
  - View workout history and streaks.
  - Get workout suggestions by body part.
  - Generate a personalized weekly workout plan.

- **Nutrition Tracker**  
  - Log meals and track calories, protein, carbs, and fat.
  - Search foods from a built-in database or add custom foods.
  - Visualize macro breakdowns and nutrition history.
  - Track daily water intake.

- **Challenges & Community**  
  - Join fitness challenges.
  - Compete with friends and view leaderboards.
  - Earn achievements for milestones.

- **Achievements System**  
  Earn badges and points for reaching fitness goals (steps, workouts, water streaks, etc.).

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Charts:** Chart.js (via CDN)
- **Icons:** Font Awesome (via CDN)
- **Styling:** Bootstrap (via CDN, dark theme)
- **Backend (optional):** Flask + SQLite (for persistent storage, can run as a static app with localStorage)

---

## Folder Structure

```
HealthAndFitnessApp/
│
├── app.py                       # Flask backend (optional)
├── html/
│   ├── layout.html              # Main layout template
│   ├── index.html               # Landing page
│   ├── dashboard.html           # Dashboard page
│   ├── workouts.html            # Workouts page
│   └── ...                      # Other HTML templates
│
├── static/
│   ├── css/
│   │   └── styles.css           # Custom styles
│   ├── js/
│   │   ├── data.js              # Data management (localStorage)
│   │   ├── dashboard.js         # Dashboard logic
│   │   ├── workouts.js          # Workouts logic
│   │   ├── calories.js          # Nutrition logic
│   │   ├── challenges.js        # Challenges logic
│   │   └── charts.js            # Chart rendering
│   └── data/
│       ├── food_database.js     # Food items database
│       └── workout_database.js  # Workout/exercise database
│
└── README.md                    # Project documentation
```

---

## How to Run

1. **Static Mode (No Backend):**
   - Open index.html in your browser.
   - All data is stored in your browser's localStorage.

2. **With Flask Backend (Optional):**
   - Install Python and Flask.
   - Run `python app.py`.
   - Visit `http://localhost:5000` in your browser.

---

## Screenshots

> _Add screenshots of the dashboard, workout tracker, and nutrition tracker here for better presentation._

---

## Customization

- **Add More Foods/Exercises:**  
  Edit food_database.js and workout_database.js.

- **Change Goals:**  
  Update default goals in data.js or allow users to set them in the UI.

---

## Credits

- **Bootstrap** for responsive design.
- **Font Awesome** for icons.
- **Chart.js** for charts.
- Developed by [Your Name] for [Your College]'s Mini Project.

---

## License

This project is for educational purposes only.

---

**Note:**  
No external frontend frameworks (like React, Angular, Vue) are used. All logic is written in vanilla JavaScript for learning and demonstration purposes.

---

**Happy Tracking!**  
💪🥗🚰

---

For any issues or suggestions, please contact ritwikmohanty3900@gmail.com.

