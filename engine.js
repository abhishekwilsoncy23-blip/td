// Initialize the global array so level files can push to it
window.GAME_LEVELS = window.GAME_LEVELS || [];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentLevelIndex = 0;
let gold, baseHealth;
let enemies = [], towers = [], projectiles = [], buildNodes = [];
let currentPath = [], currentWaves = [], enemyQueue = [];
let frame = 0, currentWaveIndex = 0;
let isWaveActive = false;
let isPaused = false;
let gameStarted = false; // Prevents running behind intro
let selectedTowerType = 'archer';

const TOWER_STATS = {
    archer:   { icon: '🏹', cost: 30,  range: 150, cooldown: 30, damage: 3,  projSpeed: 6, projIcon: '📌' },
    catapult: { icon: '🪨', cost: 60,  range: 120, cooldown: 80, damage: 15, projSpeed: 4, projIcon: '🌑' },
    mage:     { icon: '⚡', cost: 100, range: 200, cooldown: 45, damage: 8,  projSpeed: 8, projIcon: '✨' }
};

// --- CORE UI FUNCTIONS ---
window.startGame = function() {
    document.getElementById('intro-screen').style.display = 'none';
    gameStarted = true;
    loadLevel(0);
    requestAnimationFrame(gameLoop);
}

window.togglePause = function() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').innerText = isPaused ? "▶ Resume" : "⏸ Pause";
    document.getElementById('pauseBtn').style.background = isPaused ? "#ff9800" : "#f44336";
}

window.selectTower = function(type) {
    selectedTowerType = type;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`btn-${type}`).classList.add('selected');
}

window.startNextWave = function() {
    if (currentWaveIndex < currentWaves.length && !isWaveActive && !isPaused) {
        enemyQueue = [...currentWaves[currentWaveIndex]];
        isWaveActive = true;
        currentWaveIndex++;
        document.getElementById('waveDisplay').innerText = currentWaveIndex;
        document.getElementById('startWaveBtn').disabled = true;
    }
}

function loadLevel(index) {
    if (index >= window.GAME_LEVELS.length) {
        alert("🏆 All Levels Cleared! You win!");
        return;
    }
    const levelData = window.GAME_LEVELS[index];
    currentLevelIndex = index;
    gold = levelData.startingGold;
    baseHealth = 10;
    currentPath = levelData.path;
    currentWaves = levelData.waves;
    buildNodes = levelData.buildNodes.map(node => ({ ...node, occupied: false }));
    
    enemies = []; towers = []; projectiles = []; enemyQueue = [];
    currentWaveIndex = 0; isWaveActive = false;
    
    document.getElementById('gold').innerText = gold;
    document.getElementById('baseHealth').innerText = baseHealth;
    document.getElementById('levelDisplay').innerText = index + 1;
    document.getElementById('waveDisplay').innerText = 0;
    document.getElementById('startWaveBtn').disabled = false;
}

// --- MOBILE/PC RESPONSIVE CLICKING ---
canvas.addEventListener('click', (e) => {
    if (isPaused || !gameStarted) return;

    // Fixes coordinates regardless of CSS scaling or letterboxing!
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const towerInfo = TOWER_STATS[selectedTowerType];
    let clickedNode = buildNodes.find(n => Math.hypot(n.x - clickX, n.y - clickY) < 25);
    
    if (clickedNode && !clickedNode.occupied && gold >= towerInfo.cost) {
        towers.push({ x: clickedNode.x, y: clickedNode.y, stats: towerInfo, cooldown: 0 });
        gold -= towerInfo.cost;
        clickedNode.occupied = true;
        document.getElementById('gold').innerText = gold;
    }
});

// --- GAME LOOP ---
function gameLoop() {
    if (!gameStarted) return; // Wait for intro to be skipped
    
    if (!isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Path
        ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 45; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        currentPath.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();

        // Draw Nodes & Fortress
        buildNodes.forEach(node => {
            ctx.beginPath(); ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = node.occupied ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.4)';
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        });
        let endPath = currentPath[currentPath.length - 1];
        ctx.font = "60px Arial"; ctx.fillText('🏰', endPath.x - 30, endPath.y + 20);

        // Spawn Logic
        if (isWaveActive && frame % 60 === 0 && enemyQueue.length > 0) {
            let data = enemyQueue.shift();
            enemies.push({ ...data, maxHp: data.hp, pathIndex: 0, x: currentPath[0].x, y: currentPath[0].y });
        }

        // End Wave / Level Logic
        if (isWaveActive && enemyQueue.length === 0 && enemies.length === 0) {
            isWaveActive = false;
            document.getElementById('startWaveBtn').disabled = false;
            if (currentWaveIndex >= currentWaves.length) {
                setTimeout(() => loadLevel(currentLevelIndex + 1), 2000); // Auto load next level
            }
        }

        // Update Projectiles
        projectiles.forEach((p, i) => {
            let dx = p.target.x - p.x, dy = p.target.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            p.x += (dx/dist) * p.speed; p.y += (dy/dist) * p.speed;
            ctx.font = "20px Arial"; ctx.fillText(p.icon, p.x - 10, p.y + 10);
            if (dist < 15) { p.target.hp -= p.damage; projectiles.splice(i, 1); }
        });

        // Update Enemies
        enemies = enemies.filter(e => {
            if (e.hp <= 0) { 
                gold += e.reward; document.getElementById('gold').innerText = gold; return false; 
            }
            let target = currentPath[e.pathIndex + 1];
            if (!target) {
                baseHealth--; document.getElementById('baseHealth').innerText = baseHealth; return false;
            }
            let dx = target.x - e.x, dy = target.y - e.y, dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < e.speed) e.pathIndex++;
            else { e.x += (dx/dist) * e.speed; e.y += (dy/dist) * e.speed; }
            
            ctx.font = "30px Arial"; ctx.fillText(e.icon, e.x - 15, e.y + 10);
            ctx.fillStyle = 'black'; ctx.fillRect(e.x - 16, e.y - 26, 32, 6);
            ctx.fillStyle = e.hp > e.maxHp/2 ? '#4caf50' : '#f44336';
            ctx.fillRect(e.x - 15, e.y - 25, (e.hp/e.maxHp) * 30, 4);
            return true;
        });

        // Update Towers
        towers.forEach(t => {
            ctx.font = "35px Arial"; ctx.fillText(t.stats.icon, t.x - 18, t.y + 12);
            if (t.cooldown > 0) t.cooldown--;
            else {
                let target = enemies.find(e => Math.hypot(e.x - t.x, e.y - t.y) < t.stats.range);
                if (target) {
                    projectiles.push({ x: t.x, y: t.y, target: target, damage: t.stats.damage, speed: t.stats.projSpeed, icon: t.stats.projIcon });
                    t.cooldown = t.stats.cooldown;
                }
            }
        });

        frame++;
    }

    if (baseHealth > 0) requestAnimationFrame(gameLoop);
    else {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = 'red'; ctx.font = "50px Arial"; ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
    }
}
