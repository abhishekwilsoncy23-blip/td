// --- GLOBAL SETUP ---
window.GAME_LEVELS = window.GAME_LEVELS || [];
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 10, 150);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Geometries & Materials
const soldierMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xf44336 });
const groundMat = new THREE.MeshStandardMaterial({ color: 0x555555 });

let soldier, ground;
let bullets = [], obstacles = [];
let currentLevelIndex = 0, levelData, score = 0, frameCount = 0;
let isPlaying = false, isPaused = false;

// Controls State
let isDragging = false;
let previousX = 0;

// --- INITIALIZATION ---
function initScene() {
    ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 2000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -800;
    scene.add(ground);

    soldier = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), soldierMat);
    soldier.position.y = 1;
    scene.add(soldier);
}

function loadLevel(index) {
    if (index >= window.GAME_LEVELS.length) {
        alert("🏆 You beat the game!");
        return;
    }
    levelData = window.GAME_LEVELS[index];
    currentLevelIndex = index;
    document.getElementById('levelDisplay').innerText = index + 1;
    document.getElementById('progressBar').style.width = '0%';
    
    soldier.position.set(0, 1, 0);
    camera.position.set(0, 5, 6);
    
    bullets.forEach(b => scene.remove(b.mesh)); bullets = [];
    obstacles.forEach(o => scene.remove(o.mesh)); obstacles = [];

    levelData.obstacles.forEach(obs => {
        let mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), obstacleMat);
        mesh.position.set(obs.x, 1, obs.z);
        scene.add(mesh);
        obstacles.push({ mesh: mesh, hp: obs.hp, maxHp: obs.hp });
    });
}

// --- UI CONTROLS ---
window.startGame = function() {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    
    if (!soldier) initScene();
    loadLevel(0);
    isPlaying = true;
    animate();
}

window.togglePause = function() {
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('pause-screen').classList.remove('hidden');
    } else {
        document.getElementById('pause-screen').classList.add('hidden');
    }
}

// --- INPUT HANDLING (Touch & Mouse) ---
function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

window.addEventListener('pointerdown', (e) => { isDragging = true; previousX = getClientX(e); });
window.addEventListener('pointerup', () => { isDragging = false; });
window.addEventListener('pointermove', (e) => {
    if (!isDragging || !isPlaying || isPaused) return;
    let currentX = getClientX(e);
    let deltaX = currentX - previousX;
    
    soldier.position.x += deltaX * 0.03; // Drag sensitivity
    if (soldier.position.x > 8) soldier.position.x = 8;   // Right bound
    if (soldier.position.x < -8) soldier.position.x = -8; // Left bound
    
    previousX = currentX;
});

// --- POKI SCALING (Responsive Resize) ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GAME LOOP ---
function animate() {
    if (!isPlaying) return;
    requestAnimationFrame(animate);
    
    if (isPaused) {
        renderer.render(scene, camera); // Keep rendering the paused frame
        return;
    }

    // 1. Movement & Camera
    soldier.position.z -= levelData.runSpeed;
    camera.position.z = soldier.position.z + 6;
    camera.position.x = soldier.position.x * 0.5; // Smooth camera sway

    // Update Progress Bar
    let progress = Math.min(100, (Math.abs(soldier.position.z) / levelData.trackLength) * 100);
    document.getElementById('progressBar').style.width = progress + '%';

    // 2. Auto-Shooting
    frameCount++;
    if (frameCount % levelData.fireRate === 0) {
        let bullet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bulletMat);
        bullet.position.copy(soldier.position);
        bullet.position.z -= 1.5;
        scene.add(bullet);
        bullets.push({ mesh: bullet, speed: 1.2 });
    }

    // 3. Update Bullets & Collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.mesh.position.z -= b.speed;

        if (b.mesh.position.z < soldier.position.z - 60) {
            scene.remove(b.mesh); bullets.splice(i, 1); continue;
        }

        for (let j = obstacles.length - 1; j >= 0; j--) {
            let obs = obstacles[j];
            if (b.mesh.position.distanceTo(obs.mesh.position) < 1.5) {
                obs.hp -= 1;
                scene.remove(b.mesh); bullets.splice(i, 1);
                
                if (obs.hp <= 0) {
                    scene.remove(obs.mesh); obstacles.splice(j, 1);
                    score += 10;
                    document.getElementById('scoreDisplay').innerText = score;
                }
                break;
            }
        }
    }

    // 4. Level Completion
    if (soldier.position.z < -levelData.trackLength) {
        isPlaying = false;
        setTimeout(() => {
            loadLevel(currentLevelIndex + 1);
            isPlaying = true;
            animate();
        }, 1500); // Wait 1.5 seconds before starting next level
        return;
    }

    renderer.render(scene, camera);
}
