window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 500,  // How far the soldier runs before winning
    runSpeed: 0.4,     // Forward speed
    fireRate: 15,      // Frames between shots
    obstacles: [
        // x is left/right (-5 to 5), z is distance forward (negative numbers)
        { x: -2, z: -50, hp: 5 },
        { x: 2,  z: -50, hp: 5 },
        { x: 0,  z: -100, hp: 10 },
        { x: -3, z: -150, hp: 15 },
        { x: 3,  z: -150, hp: 15 },
        { x: 0,  z: -250, hp: 30 } // Boss block
    ]
});
