window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 400,
    runSpeed: 0.35,
    startAmmo: 20,
    gates: [
        { text: '+15', op: 'add', val: 15, x: -2.5, z: -80 },
        { text: '-10', op: 'sub', val: 10, x: 2.5,  z: -80 },
        { text: '÷2',  op: 'div', val: 2,  x: -2.5, z: -180 },
        { text: 'x2',  op: 'mul', val: 2,  x: 2.5,  z: -180 },
        { text: '+50', op: 'add', val: 50, x: -2.5, z: -280 },
        { text: '-50', op: 'sub', val: 50, x: 2.5,  z: -280 }
    ],
    boss: { hp: 70, z: -480 }
});
