window.GAME_LEVELS = window.GAME_LEVELS || [];

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Materials & Geometries
const soldierGeo = new THREE.BoxGeometry(1, 2, 1);
const soldierMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 }); // Green Soldier
const bulletGeo = new THREE.SphereGeometry(0.2, 8, 8);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });     // Yellow Bullets
const obstacleGeo = new THREE.BoxGeometry(2, 2, 2);
const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xf44336 });// Red Obstacles
const groundGeo = new THREE.PlaneGeometry(15, 1000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x555555 });  // Dark Gray Road

// Game Objects
let soldier, ground;
let bullets = [];
let obstacles = [];

// Game State
let currentLevelIndex = 0;
let levelData;
let isPlaying = false;
let score = 0;
let frameCount = 0;

// Input State
let isDragging = false;
let previousMousePosition = { x: 0 };

function initScene() {
    // Add Ground
    ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -400; // Stretch forward
    scene.add(ground);

    // Add Soldier
    soldier = new THREE.Mesh(soldierGeo, soldierMat);
    soldier.position.y = 1;
    scene.add(soldier);
}

function loadLevel(index) {
    if (index >= window.GAME_LEVELS.length) {
        alert("You beat all levels!");
        return;
    }
    levelData = window.GAME_LEVELS[index];
    currentLevelIndex = index;
    
    document.getElementById('levelDisplay').innerText = index + 1;
    
    // Reset Soldier
    soldier.position.set(0, 1, 0);
    camera.position.set(0, 4, 5); // Behind and above the soldier
    
    // Clear old objects
    bullets.forEach(b => scene.remove(b.mesh)); bullets = [];
    obstacles.forEach(o => scene.remove(o.mesh)); obstacles = [];

    // Spawn Obstacles
    levelData.obstacles.forEach(obs => {
        let mesh = new THREE.Mesh(obstacleGeo, obstacleMat);
        mesh.position.set(obs.x, 1, obs.z);
        scene.add(mesh);
        obstacles.push({ mesh: mesh, hp: obs.hp, maxHp: obs.hp });
    });
}

// --- CONTROLS (Responsive for PC & Mobile) ---
function onPointerDown(e) { isDragging = true; previousMousePosition.x = e.clientX || e.touches[0].clientX; }
function onPointerUp() { isDragging = false; }
function onPointerMove(e) {
    if (!isDragging || !isPlaying) return;
    let clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    let deltaMoveX = clientX - previousMousePosition.x;
    
    soldier.position.x += deltaMoveX * 0.02; // Steer sensitivity
    
    // Clamp to track width
    if (soldier.position.x > 6) soldier.position.x = 6;
    if (soldier.position.x < -6) soldier.position.x = -6;
    
    previousMousePosition.x = clientX;
}

window.addEventListener('mousedown', onPointerDown);
window.addEventListener('mouseup', onPointerUp);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchstart', onPointerDown);
window.addEventListener('touchend', onPointerUp);
window.addEventListener('touchmove', onPointerMove);

// Handle Window Resize (Crucial for Poki scaling)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- CORE LOGIC ---
window.startGame = function() {
    document.getElementById('intro-screen').style.display = 'none';
    if (!soldier) initScene();
    loadLevel(0);
    isPlaying = true;
    animate();
}

function animate() {
    if (!isPlaying) return;
    requestAnimationFrame(animate);

    // 1. Move Soldier Forward
    soldier.position.z -= levelData.runSpeed;
    
    // Camera follows soldier
    camera.position.z = soldier.position.z + 5;
    camera.position.x = soldier.position.x * 0.5; // Slight camera sway

    // 2. Auto-Shooting
    frameCount++;
    if (frameCount % levelData.fireRate === 0) {
        let bullet = new THREE.Mesh(bulletGeo, bulletMat);
        bullet.position.copy(soldier.position);
        bullet.position.z -= 1; // Spawn slightly in front
        scene.add(bullet);
        bullets.push({ mesh: bullet, speed: 1.0 });
    }

    // 3. Update Bullets & Collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.mesh.position.z -= b.speed;

        // Clean up far away bullets
        if (b.mesh.position.z < soldier.position.z - 40) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            continue;
        }

        // Check Collision with Obstacles (Simple 3D Bounding Box)
        for (let j = obstacles.length - 1; j >= 0; j--) {
            let obs = obstacles[j];
            let dist = b.mesh.position.distanceTo(obs.mesh.position);
            
            if (dist < 1.5) { // Hit!
                obs.hp -= 1;
                scene.remove(b.mesh);
                bullets.splice(i, 1);
                
                // Obstacle destroyed
                if (obs.hp <= 0) {
                    scene.remove(obs.mesh);
                    obstacles.splice(j, 1);
                    score += 10;
                    document.getElementById('scoreDisplay').innerText = score;
                }
                break; // Bullet destroyed, stop checking other obstacles
            }
        }
    }

    // 4. Check Level Win Condition
    if (soldier.position.z < -levelData.trackLength) {
        isPlaying = false;
        setTimeout(() => {
            loadLevel(currentLevelIndex + 1);
            isPlaying = true;
            animate();
        }, 1000);
        return;
    }

    renderer.render(scene, camera);
}
