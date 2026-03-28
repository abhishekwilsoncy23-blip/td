// Ensure the array exists
window.GAME_LEVELS = window.GAME_LEVELS || [];

// Push Level 2 Data (Snake Path)
window.GAME_LEVELS.push({
    startingGold: 150,
    path: [
        {x: 0, y: 100}, {x: 700, y: 100}, {x: 700, y: 250}, 
        {x: 100, y: 250}, {x: 100, y: 400}, {x: 750, y: 400}
    ],
    buildNodes: [
        {x: 200, y: 180}, {x: 400, y: 180}, {x: 600, y: 180},
        {x: 200, y: 330}, {x: 400, y: 330}, {x: 600, y: 330}
    ],
    waves: [
        [ { icon: '🕷️', hp: 10, speed: 2.5, reward: 5 }, { icon: '🕷️', hp: 10, speed: 2.5, reward: 5 } ],
        [ { icon: '👹', hp: 100, speed: 1, reward: 30 }, { icon: '👹', hp: 100, speed: 1, reward: 30 } ]
    ]
});
