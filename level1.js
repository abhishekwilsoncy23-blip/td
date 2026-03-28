window.GAME_LEVELS = window.GAME_LEVELS || [];

window.GAME_LEVELS.push({
    trackLength: 400,
    runSpeed: 0.35,
    startAmmo: 20, // Starting bullets
    gates: [
        // Choice 1: Left is +15, Right is -10
        { text: '+15', op: 'add', val: 15, x: -2.5, z: -80, color: 'rgba(0, 255, 0, 0.4)' },
        { text: '-10', op: 'sub', val: 10, x: 2.5,  z: -80, color: 'rgba(255, 0, 0, 0.4)' },
        
        // Choice 2: Left is /2, Right is x2
        { text: '÷2', op: 'div', val: 2, x: -2.5, z: -180, color: 'rgba(255, 0, 0, 0.4)' },
        { text: 'x2', op: 'mul', val: 2, x: 2.5,  z: -180, color: 'rgba(0, 255, 0, 0.4)' },

        // Choice 3
        { text: '+50', op: 'add', val: 50, x: -2.5, z: -280, color: 'rgba(0, 255, 0, 0.4)' },
        { text: '-50', op: 'sub', val: 50, x: 2.5,  z: -280, color: 'rgba(255, 0, 0, 0.4)' }
    ],
    boss: {
        hp: 120,    // You need 120 bullets to kill him!
        z: -380     // Placed at the very end
    }
});
