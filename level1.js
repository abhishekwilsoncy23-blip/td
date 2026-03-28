// Define the path for this level (X, Y coordinates)
const levelPath = [
    {x: 0, y: 250}, {x: 200, y: 250}, {x: 200, y: 100}, 
    {x: 500, y: 100}, {x: 500, y: 400}, {x: 800, y: 400}
];

// Define waves: {type, health, speed, goldReward, count}
const levelWaves = [
    { icon: '🧟', hp: 10, speed: 1, reward: 5, count: 5 },
    { icon: '🕷️', hp: 5, speed: 2, reward: 3, count: 10 },
    { icon: '👹', hp: 50, speed: 0.5, reward: 20, count: 1 }
];

// Start the engine with this data
initLevel(levelPath, levelWaves);
