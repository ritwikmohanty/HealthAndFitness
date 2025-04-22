from app import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # ensure password hash field has length of at least 256
    password_hash = db.Column(db.String(256))
    
    # User health metrics
    daily_calorie_goal = db.Column(db.Integer, default=2000)
    daily_step_goal = db.Column(db.Integer, default=10000)
    daily_water_goal = db.Column(db.Integer, default=8)  # glasses
    
    # User stats - these could move to their own tables in a more advanced implementation
    height = db.Column(db.Float)  # in cm
    weight = db.Column(db.Float)  # in kg


class FoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    food_name = db.Column(db.String(128), nullable=False)
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Float)  # in grams
    carbs = db.Column(db.Float)  # in grams
    fat = db.Column(db.Float)  # in grams
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack


class WorkoutLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    workout_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in minutes
    calories_burned = db.Column(db.Integer, nullable=False)
    intensity = db.Column(db.String(20))  # low, medium, high


class WaterLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    glasses = db.Column(db.Integer, nullable=False, default=0)


class StepLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    steps = db.Column(db.Integer, nullable=False, default=0)


class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    challenge_type = db.Column(db.String(50), nullable=False)  # steps, calories, workouts
    goal = db.Column(db.Integer, nullable=False)

