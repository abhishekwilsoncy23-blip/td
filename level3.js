window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 800,
    runSpeed: 0.4, // Runs slightly faster!
    startAmmo: 40,
    gates: [
        { text: '+30', op: 'add', val: 30, x: -2.5, z: -100 },
        { text: '÷2',  op: 'div', val: 2,  x: 2.5,  z: -100 },
        { text: 'x2',  op: 'mul', val: 2,  x: 2.5,  z: -300 },
        { text: '-20', op: 'sub', val: 20, x: -2.5, z: -300 },
        { text: '+50', op: 'add', val: 50, x: -2.5, z: -550 },
        { text: '÷3',  op: 'div', val: 3,  x: 2.5,  z: -550 }
    ],
    enemies: [
        // Two guards side-by-side forcing you to pick one to kill!
        { hp: 40, x: -2.5, z: -400 },
        { hp: 40, x: 2.5, z: -400 }
    ],
    mines: [
        { x: 0, z: -200 },    // Mine in the middle
        { x: -3, z: -480 },   // Mine on the left
        { x: 3, z: -480 },    // Mine on the right
        { x: 0, z: -650 }     // Mine right before the boss!
    ],
    boss: { hp: 250, z: -750 }
});
