window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 1000,
    runSpeed: 0.4,
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
        { hp: 40, x: -2.5, z: -400 },
        { hp: 40, x: 2.5, z: -400 }
    ],
    mines: [
        { x: 0, z: -200 },    
        { x: -3, z: -480 },   
        { x: 3, z: -480 },    
        { x: 0, z: -650 }     
    ],
    boss: { hp: 250, z: -900 }
});
