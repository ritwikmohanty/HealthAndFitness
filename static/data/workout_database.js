/**
 * Workout database with exercise types and MET values
 * MET (Metabolic Equivalent of Task) is used to calculate calories burned
 * Higher MET values indicate more intense activities
 */

const WORKOUT_DATABASE = [
    {
        category: "Cardio",
        exercises: [
            {
                name: "Running",
                bodyParts: ["legs", "core", "cardio"],
                metsLow: 8.0,
                metsHigh: 14.0
            },
            {
                name: "Cycling",
                bodyParts: ["legs", "cardio"],
                metsLow: 6.0,
                metsHigh: 12.0
            },
            {
                name: "Swimming",
                bodyParts: ["fullbody", "cardio"],
                metsLow: 6.0,
                metsHigh: 10.0
            },
            {
                name: "Elliptical",
                bodyParts: ["legs", "arms", "cardio"],
                metsLow: 5.0,
                metsHigh: 9.0
            },
            {
                name: "Jump Rope",
                bodyParts: ["legs", "cardio"],
                metsLow: 8.0,
                metsHigh: 12.0
            },
            {
                name: "Stair Climber",
                bodyParts: ["legs", "cardio"],
                metsLow: 6.0,
                metsHigh: 9.0
            },
            {
                name: "Rowing",
                bodyParts: ["back", "arms", "core", "cardio"],
                metsLow: 6.0,
                metsHigh: 10.0
            },
            {
                name: "Walking",
                bodyParts: ["legs", "cardio"],
                metsLow: 3.0,
                metsHigh: 5.0
            },
            {
                name: "Hiking",
                bodyParts: ["legs", "core", "cardio"],
                metsLow: 5.0,
                metsHigh: 7.0
            },
            {
                name: "Dancing",
                bodyParts: ["fullbody", "cardio"],
                metsLow: 4.5,
                metsHigh: 8.0
            },
            {
                name: "HIIT",
                bodyParts: ["fullbody", "cardio"],
                metsLow: 8.0,
                metsHigh: 15.0
            }
        ]
    },
    {
        category: "Strength",
        exercises: [
            {
                name: "Weightlifting",
                bodyParts: ["arms", "chest", "back", "legs"],
                metsLow: 3.5,
                metsHigh: 6.0
            },
            {
                name: "Bench Press",
                bodyParts: ["chest", "arms"],
                metsLow: 3.5,
                metsHigh: 6.0
            },
            {
                name: "Deadlift",
                bodyParts: ["back", "legs", "core"],
                metsLow: 4.0,
                metsHigh: 7.0
            },
            {
                name: "Squat",
                bodyParts: ["legs", "core"],
                metsLow: 4.0,
                metsHigh: 7.0
            },
            {
                name: "Lunges",
                bodyParts: ["legs"],
                metsLow: 3.5,
                metsHigh: 6.0
            },
            {
                name: "Pull-ups",
                bodyParts: ["back", "arms"],
                metsLow: 4.0,
                metsHigh: 6.5
            },
            {
                name: "Push-ups",
                bodyParts: ["chest", "arms", "core"],
                metsLow: 3.5,
                metsHigh: 6.0
            },
            {
                name: "Shoulder Press",
                bodyParts: ["shoulders", "arms"],
                metsLow: 3.5,
                metsHigh: 6.0
            },
            {
                name: "Bicep Curls",
                bodyParts: ["arms"],
                metsLow: 3.0,
                metsHigh: 5.0
            },
            {
                name: "Tricep Extensions",
                bodyParts: ["arms"],
                metsLow: 3.0,
                metsHigh: 5.0
            },
            {
                name: "Leg Press",
                bodyParts: ["legs"],
                metsLow: 3.5,
                metsHigh: 6.0
            },
            {
                name: "Plank",
                bodyParts: ["core"],
                metsLow: 3.0,
                metsHigh: 4.5
            },
            {
                name: "Crunches",
                bodyParts: ["core"],
                metsLow: 3.0,
                metsHigh: 4.5
            },
            {
                name: "Circuit Training",
                bodyParts: ["fullbody"],
                metsLow: 5.0,
                metsHigh: 8.0
            },
            {
                name: "Kettlebell Swings",
                bodyParts: ["fullbody", "core"],
                metsLow: 5.0,
                metsHigh: 8.0
            },
            {
                name: "Dumbbell Rows",
                bodyParts: ["back", "arms"],
                metsLow: 3.5,
                metsHigh: 6.0
            }
        ]
    },
    {
        category: "Flexibility",
        exercises: [
            {
                name: "Yoga",
                bodyParts: ["fullbody", "flexibility"],
                metsLow: 2.5,
                metsHigh: 5.0
            },
            {
                name: "Pilates",
                bodyParts: ["core", "flexibility"],
                metsLow: 3.0,
                metsHigh: 5.5
            },
            {
                name: "Stretching",
                bodyParts: ["fullbody", "flexibility"],
                metsLow: 2.0,
                metsHigh: 3.0
            },
            {
                name: "Tai Chi",
                bodyParts: ["fullbody", "flexibility"],
                metsLow: 2.5,
                metsHigh: 4.0
            },
            {
                name: "Barre",
                bodyParts: ["legs", "core", "flexibility"],
                metsLow: 3.0,
                metsHigh: 5.0
            },
            {
                name: "Balance Training",
                bodyParts: ["core", "flexibility"],
                metsLow: 2.5,
                metsHigh: 4.0
            },
            {
                name: "Foam Rolling",
                bodyParts: ["fullbody", "flexibility"],
                metsLow: 1.5,
                metsHigh: 2.5
            }
        ]
    },
    {
        category: "Sports",
        exercises: [
            {
                name: "Basketball",
                bodyParts: ["fullbody", "cardio"],
                metsLow: 6.0,
                metsHigh: 10.0
            },
            {
                name: "Soccer",
                bodyParts: ["legs", "cardio"],
                metsLow: 7.0,
                metsHigh: 11.0
            },
            {
                name: "Tennis",
                bodyParts: ["fullbody", "cardio"],
                metsLow: 6.0,
                metsHigh: 9.0
            },
            {
                name: "Volleyball",
                bodyParts: ["fullbody"],
                metsLow: 5.0,
                metsHigh: 8.0
            },
            {
                name: "Golf",
                bodyParts: ["core", "arms"],
                metsLow: 3.5,
                metsHigh: 5.0
            },
            {
                name: "Rock Climbing",
                bodyParts: ["fullbody", "arms", "back"],
                metsLow: 6.0,
                metsHigh: 9.0
            },
            {
                name: "Martial Arts",
                bodyParts: ["fullbody"],
                metsLow: 6.0,
                metsHigh: 10.0
            },
            {
                name: "Boxing",
                bodyParts: ["arms", "core", "cardio"],
                metsLow: 7.0,
                metsHigh: 12.0
            }
        ]
    },
    {
        category: "Other Activities",
        exercises: [
            {
                name: "Gardening",
                bodyParts: ["fullbody"],
                metsLow: 2.5,
                metsHigh: 4.5
            },
            {
                name: "House Cleaning",
                bodyParts: ["fullbody"],
                metsLow: 2.5,
                metsHigh: 4.0
            },
            {
                name: "Lawn Mowing",
                bodyParts: ["fullbody"],
                metsLow: 4.0,
                metsHigh: 6.0
            },
            {
                name: "Snow Shoveling",
                bodyParts: ["fullbody"],
                metsLow: 5.0,
                metsHigh: 8.0
            },
            {
                name: "Moving Furniture",
                bodyParts: ["fullbody"],
                metsLow: 4.0,
                metsHigh: 7.0
            },
            {
                name: "Playing with Kids",
                bodyParts: ["fullbody"],
                metsLow: 3.0,
                metsHigh: 5.5
            }
        ]
    }
];
