window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 300,
    runSpeed: 0.3,
    fireRate: 20, 
    obstacles: [
        { x: -2, z: -50, hp: 5 }, { x: 2, z: -50, hp: 5 },
        { x: 0, z: -120, hp: 10 },
        { x: -3, z: -200, hp: 15 }, { x: 3, z: -200, hp: 15 }
    ]
});
