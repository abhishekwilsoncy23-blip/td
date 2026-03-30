window.GAME_LEVELS = window.GAME_LEVELS || [];
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 10, 150);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const soldierMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const bossMat = new THREE.MeshStandardMaterial({ color: 0x9c27b0 }); 
const miniEnemyMat = new THREE.MeshStandardMaterial({ color: 0xff9800 }); 
const mineMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const groundMat = new THREE.MeshStandardMaterial({ color: 0x444444 });

let soldier, ground, bossMesh;
let bullets = [], gates = [], miniEnemies = [], mines = [];
let currentLevelIndex = 0, levelData, ammo = 0, frameCount = 0;
let isPlaying = false, isPaused = false, bossHp = 0;
let isDragging = false, previousX = 0;

function createGateTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)'; 
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'white'; ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 128);
    return new THREE.CanvasTexture(canvas);
}

function initScene() {
    ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 2000), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.position.z = -800;
    scene.add(ground);

    soldier = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), soldierMat);
    soldier.position.y = 1;
    scene.add(soldier);
}

function loadLevel(index) {
    if (index >= window.GAME_LEVELS.length) {
        document.getElementById('endMessage').innerText = "You Beat All Levels!";
        document.getElementById('endMessage').style.color = "#4caf50";
        document.getElementById('game-over-screen').classList.remove('hidden');
        return;
    }
    levelData = window.GAME_LEVELS[index];
    currentLevelIndex = index;
    ammo = levelData.startAmmo;
    
    document.getElementById('ammoDisplay').innerText = ammo;
    document.getElementById('levelDisplay').innerText = index + 1;
    document.getElementById('targetHpContainer').classList.add('hidden');
    
    soldier.position.set(0, 1, 0);
    camera.position.set(0, 5, 6);
    
    bullets.forEach(b => scene.remove(b.mesh)); bullets = [];
    gates.forEach(g => scene.remove(g.mesh)); gates = [];
    miniEnemies.forEach(e => scene.remove(e.mesh)); miniEnemies = [];
    mines.forEach(m => scene.remove(m.mesh)); mines = [];
    if (bossMesh) scene.remove(bossMesh);

    levelData.gates.forEach(g => {
        let tex = createGateTexture(g.text);
        let mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        let mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), mat);
        mesh.position.set(g.x, 1.5, g.z);
        scene.add(mesh);
        gates.push({ mesh: mesh, op: g.op, val: g.val, active: true });
    });

    if (levelData.enemies) {
        levelData.enemies.forEach(e => {
            let mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), miniEnemyMat);
            mesh.position.set(e.x, 2, e.z);
            scene.add(mesh);
            miniEnemies.push({ mesh: mesh, hp: e.hp });
        });
    }

    if (levelData.mines) {
        levelData.mines.forEach(m => {
            let mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16), mineMat);
            mesh.position.set(m.x, 0.2, m.z);
            scene.add(mesh);
            mines.push({ mesh: mesh });
        });
    }

    bossHp = levelData.boss.hp;
    bossMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), bossMat);
    bossMesh.position.set(0, 3, levelData.boss.z);
    scene.add(bossMesh);
}

// PERSISTENT STORAGE LOAD
window.startGame = function() {
    let savedLevel = parseInt(localStorage.getItem('mathRunnerCurrentLevel')) || 0;
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    if (!soldier) initScene();
    loadLevel(savedLevel); 
    isPlaying = true;
    animate();
}

window.togglePause = function() {
    isPaused = !isPaused;
    document.getElementById('pause-screen').classList.toggle('hidden', !isPaused);
}

// RESET PROGRESS HELPER
window.resetProgress = function() {
    localStorage.removeItem('mathRunnerCurrentLevel');
    location.reload();
}

function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
window.addEventListener('pointerdown', (e) => { isDragging = true; previousX = getClientX(e); });
window.addEventListener('pointerup', () => { isDragging = false; });
window.addEventListener('pointermove', (e) => {
    if (!isDragging || !isPlaying || isPaused) return;
    soldier.position.x += (getClientX(e) - previousX) * 0.03;
    if (soldier.position.x > 8) soldier.position.x = 8;
    if (soldier.position.x < -8) soldier.position.x = -8;
    previousX = getClientX(e);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function gameOver(won, message = "An Enemy Destroyed You!") {
    isPlaying = false;
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('targetHpContainer').classList.add('hidden');
    
    if (won) {
        // SAVE PROGRESS ON WIN
        localStorage.setItem('mathRunnerCurrentLevel', currentLevelIndex + 1);
        setTimeout(() => { loadLevel(currentLevelIndex + 1); isPlaying = true; animate(); }, 1500);
    } else {
        document.getElementById('endMessage').innerText = message;
        document.getElementById('endMessage').style.color = "#f44336";
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
}

function animate() {
    if (!isPlaying) return;
    requestAnimationFrame(animate);
    if (isPaused) { renderer.render(scene, camera); return; }

    // BOSS ARENA STOP LOGIC
    let stopForBoss = false;
    if (bossHp > 0 && bossMesh && (soldier.position.z - bossMesh.position.z) < 20) {
        stopForBoss = true;
    }

    if (!stopForBoss) {
        soldier.position.z -= levelData.runSpeed;
    }
    
    camera.position.z = soldier.position.z + 6;
    camera.position.x = soldier.position.x * 0.4;

    document.getElementById('progressBar').style.width = Math.min(100, (Math.abs(soldier.position.z) / levelData.trackLength) * 100) + '%';

    // Math Gates
    gates.forEach(g => {
        if (!g.active) return;
        if (soldier.position.z < g.mesh.position.z && soldier.position.z > g.mesh.position.z - 2) {
            if (Math.abs(soldier.position.x - g.mesh.position.x) < 2.5) {
                if (g.op === 'add') ammo += g.val;
                if (g.op === 'sub') ammo -= g.val;
                if (g.op === 'mul') ammo *= g.val;
                if (g.op === 'div') ammo = Math.floor(ammo / g.val);
                
                if (ammo < 0) ammo = 0;
                document.getElementById('ammoDisplay').innerText = ammo;
                scene.remove(g.mesh); g.active = false;
            }
        }
    });

    // Auto Aim
    let activeTarget = null;
    let targetDist = 120; 
    for (let en of miniEnemies) {
        if (en.mesh.position.z < soldier.position.z && soldier.position.z - en.mesh.position.z < targetDist) {
            activeTarget = { mesh: en.mesh, hp: en.hp, isBoss: false };
            break;
        }
    }
    if (!activeTarget && bossHp > 0 && bossMesh && soldier.position.z - bossMesh.position.z < targetDist) {
        activeTarget = { mesh: bossMesh, hp: bossHp, isBoss: true };
    }

    const hpUi = document.getElementById('targetHpContainer');
    if (activeTarget) {
        hpUi.classList.remove('hidden');
        document.getElementById('targetHpDisplay').innerText = activeTarget.hp;
    } else {
        hpUi.classList.add('hidden');
    }

    // SHOOTING (Increased speed to frameCount % 4)
    frameCount++;
    if (activeTarget && frameCount % 4 === 0 && ammo > 0) { 
        ammo--;
        document.getElementById('ammoDisplay').innerText = ammo;
        
        let bullet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bulletMat);
        bullet.position.copy(soldier.position);
        bullet.position.z -= 1.5;
        scene.add(bullet);

        let direction = new THREE.Vector3().subVectors(activeTarget.mesh.position, soldier.position).normalize();
        // Bullets fly faster too (3.0 instead of 2.0)
        bullets.push({ mesh: bullet, velocity: direction.multiplyScalar(3.0) });
    }

    // Bullet Move & Collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.mesh.position.add(b.velocity);
        let bulletHit = false;

        if (b.mesh.position.z < soldier.position.z - 150) {
            scene.remove(b.mesh); bullets.splice(i, 1); continue;
        }

        for (let j = miniEnemies.length - 1; j >= 0; j--) {
            let en = miniEnemies[j];
            if (b.mesh.position.distanceTo(en.mesh.position) < 2.5) {
                en.hp -= 1;
                scene.remove(b.mesh); bullets.splice(i, 1); bulletHit = true;
                
                en.mesh.material.color.setHex(0xffffff);
                setTimeout(() => { if(en.mesh) en.mesh.material.color.setHex(0xff9800); }, 50);

                if (en.hp <= 0) {
                    scene.remove(en.mesh); miniEnemies.splice(j, 1);
                    hpUi.classList.add('hidden');
                }
                break;
            }
        }
        if (bulletHit) continue;

        if (bossHp > 0 && b.mesh.position.distanceTo(bossMesh.position) < 3.5) {
            bossHp -= 1;
            scene.remove(b.mesh); bullets.splice(i, 1);
            
            bossMesh.material.color.setHex(0xffffff);
            setTimeout(() => { if(bossMesh) bossMesh.material.color.setHex(0x9c27b0); }, 50);

            if (bossHp <= 0) {
                scene.remove(bossMesh); bossMesh = null;
                hpUi.classList.add('hidden');
                gameOver(true); // You Win!
            }
        }
    }

    // Death Checks (Mini Enemies & Mines)
    for (let j = 0; j < miniEnemies.length; j++) {
        let en = miniEnemies[j];
        if (soldier.position.z < en.mesh.position.z + 1.5 && soldier.position.z > en.mesh.position.z - 1.5) {
            if (Math.abs(soldier.position.x - en.mesh.position.x) < 2) gameOver(false, "An Enemy Destroyed You!");
        }
    }
    
    for (let j = 0; j < mines.length; j++) {
        let m = mines[j];
        if (soldier.position.z < m.mesh.position.z + 1.5 && soldier.position.z > m.mesh.position.z - 1.5) {
            if (Math.abs(soldier.position.x - m.mesh.position.x) < 2) {
                gameOver(false, "You Stepped on a Mine! 💥");
            }
        }
    }

    // IF STANDING AT BOSS AND OUT OF AMMO = GAME OVER
    if (stopForBoss && ammo === 0 && bullets.length === 0 && bossHp > 0) {
        gameOver(false, "Out of Ammo!");
    }

    renderer.render(scene, camera);
}
