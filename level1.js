window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    startingGold: 100,
    path: [
        {x: 0, y: 250}, {x: 200, y: 250}, {x: 200, y: 100}, 
        {x: 600, y: 100}, {x: 600, y: 400}, {x: 750, y: 400}
    ],
    buildNodes: [
        {x: 100, y: 180}, {x: 270, y: 180}, {x: 400, y: 180}, 
        {x: 270, y: 300}, {x: 520, y: 300}, {x: 680, y: 300}
    ],
    waves: [
        [ { icon: '🧟', hp: 10, speed: 1.5, reward: 5 }, { icon: '🧟', hp: 10, speed: 1.5, reward: 5 } ],
        [ { icon: '🕷️', hp: 6, speed: 2.5, reward: 4 }, { icon: '👹', hp: 50, speed: 0.8, reward: 20 } ]
    ]
});
