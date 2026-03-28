window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 600,
    runSpeed: 0.35,
    startAmmo: 30,
    gates: [
        { text: '+20', op: 'add', val: 20, x: -2.5, z: -80 },
        { text: '-10', op: 'sub', val: 10, x: 2.5,  z: -80 },
        { text: 'x2',  op: 'mul', val: 2,  x: -2.5, z: -180 },
        { text: '÷2',  op: 'div', val: 2,  x: 2.5,  z: -180 },
        { text: '+40', op: 'add', val: 40, x: -2.5, z: -350 },
        { text: '-30', op: 'sub', val: 30, x: 2.5,  z: -350 }
    ],
    enemies: [
        { hp: 30, x: 0, z: -250 } 
    ],
    boss: { hp: 180, z: -550 }
});
