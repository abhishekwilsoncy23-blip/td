const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State Variables
let currentLevelIndex = 0;
let gold, baseHealth;
let enemies = [], towers = [], projectiles = [], buildNodes = [];
let currentPath = [], currentWaves = [], enemyQueue = [];
let frame = 0, currentWaveIndex = 0;
let isWaveActive = false;
let selectedTowerType = 'archer'; // Default weapon

// UI Elements
const uiGold = document.getElementById('gold');
const uiHealth = document.getElementById('baseHealth');
const uiWave = document.getElementById('waveDisplay');
const uiMaxWaves = document.getElementById('maxWaves');
const uiLevel = document.getElementById('levelDisplay');
const btnStartWave = document.getElementById('startWaveBtn');
const uiMessage = document.getElementById('message');

function loadLevel(index) {
    if (index >= GAME_LEVELS.length) {
        alert("🏆 You beat all levels! You are the ultimate defender!");
        return;
    }
    const levelData = GAME_LEVELS[index];
    currentLevelIndex = index;
    gold = levelData.startingGold;
    baseHealth = 10;
    currentPath = levelData.path;
    currentWaves = levelData.waves;
    buildNodes = levelData.buildNodes.map(node => ({ ...node, occupied: false }));
    
    enemies = []; towers = []; projectiles = []; enemyQueue = [];
    currentWaveIndex = 0;
    isWaveActive = false;
    
    updateUI();
    uiLevel.innerText = index + 1;
    uiMaxWaves.innerText = currentWaves.length;
    btnStartWave.innerText = "Start Wave";
    btnStartWave.disabled = false;
    uiMessage.innerText = "Build defenses and start the wave!";
}

function updateUI() {
    uiGold.innerText = gold;
    uiHealth.innerText = baseHealth;
    uiWave.innerText = currentWaveIndex;
}

// Select tower from Shop
window.selectTower = function(type) {
    selectedTowerType = type;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`btn-${type}`).classList.add('selected');
}

// Start Wave Manager
window.startNextWave = function() {
    if (currentWaveIndex < currentWaves.length && !isWaveActive) {
        // Load the next wave array into the queue
        enemyQueue = [...currentWaves[currentWaveIndex]];
        isWaveActive = true;
        currentWaveIndex++;
        updateUI();
        btnStartWave.disabled = true;
        uiMessage.innerText = `Wave ${currentWaveIndex} incoming!`;
    }
}

class Enemy {
    constructor(data) {
        this.icon = data.icon;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.speed = data.speed;
        this.reward = data.reward;
        this.pathIndex = 0;
        this.x = currentPath[0].x;
        this.y = currentPath[0].y;
    }
    update() {
        let target = currentPath[this.pathIndex + 1];
        if (!target) {
            baseHealth--;
            updateUI();
            return true; // Reached fortress
        }
        let dx = target.x - this.x;
        let dy = target.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < this.speed) this.pathIndex++;
        else {
            this.x += (dx/dist) * this.speed;
            this.y += (dy/dist) * this.speed;
        }
        return false; // Still walking
    }
    draw() {
        ctx.font = "30px Arial";
        ctx.fillText(this.icon, this.x - 15, this.y + 10);
        // Health bar
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - 16, this.y - 26, 32, 6);
        ctx.fillStyle = this.hp > this.maxHp/2 ? '#4caf50' : '#f44336';
        ctx.fillRect(this.x - 15, this.y - 25, (this.hp/this.maxHp) * 30, 4);
    }
}

class Tower {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.stats = TOWER_STATS[type];
        this.cooldown = 0;
    }
    draw() {
        ctx.font = "35px Arial";
        ctx.fillText(this.stats.icon, this.x - 18, this.y + 12);
    }
    fire() {
        if (this.cooldown > 0) { this.cooldown--; return; }
        // Find first enemy in range
        let target = enemies.find(e => Math.hypot(e.x - this.x, e.y - this.y) < this.stats.range);
        if (target) {
            projectiles.push({
                x: this.x, y: this.y, 
                target: target, 
                damage: this.stats.damage,
                speed: this.stats.projSpeed,
                icon: this.stats.projIcon
            });
            this.cooldown = this.stats.cooldown;
        }
    }
}

// Deploy Troops (Towers) on Build Nodes
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const towerInfo = TOWER_STATS[selectedTowerType];

    // Check if clicked near a build node
    let clickedNode = buildNodes.find(n => Math.hypot(n.x - clickX, n.y - clickY) < 25);
    
    if (clickedNode) {
        if (clickedNode.occupied) {
            uiMessage.innerText = "Spot already occupied!";
        } else if (gold >= towerInfo.cost) {
            towers.push(new Tower(clickedNode.x, clickedNode.y, selectedTowerType));
            gold -= towerInfo.cost;
            clickedNode.occupied = true;
            updateUI();
            uiMessage.innerText = `${towerInfo.icon} Deployed!`;
        } else {
            uiMessage.innerText = "Not enough gold!";
        }
    }
});

function drawScenery() {
    // Draw Dirt Path
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 45; 
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    currentPath.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Draw Build Nodes
    buildNodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = node.occupied ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw Fortress at the very end of the path
    let endPath = currentPath[currentPath.length - 1];
    ctx.font = "60px Arial";
    ctx.fillText('🏰', endPath.x - 30, endPath.y + 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawScenery();

    // Wave Spawning Logic
    if (isWaveActive && frame % 60 === 0 && enemyQueue.length > 0) {
        enemies.push(new Enemy(enemyQueue.shift()));
    }

    // Check if wave is cleared
    if (isWaveActive && enemyQueue.length === 0 && enemies.length === 0) {
        isWaveActive = false;
        if (currentWaveIndex >= currentWaves.length) {
            uiMessage.innerText = "Level Cleared! Loading next...";
            setTimeout(() => loadLevel(currentLevelIndex + 1), 3000);
        } else {
            btnStartWave.disabled = false;
            btnStartWave.innerText = "Start Next Wave";
            uiMessage.innerText = "Wave cleared! Prepare for the next.";
        }
    }

    // Update Projectiles
    projectiles.forEach((p, i) => {
        let dx = p.target.x - p.x;
        let dy = p.target.y - p.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        p.x += (dx/dist) * p.speed;
        p.y += (dy/dist) * p.speed;
        
        ctx.font = "20px Arial";
        ctx.fillText(p.icon, p.x - 10, p.y + 10);
        
        if (dist < 15) { // Hit
            p.target.hp -= p.damage;
            projectiles.splice(i, 1);
        }
    });

    // Update Enemies
    enemies = enemies.filter(e => {
        if (e.hp <= 0) { 
            gold += e.reward; 
            updateUI(); 
            return false; // Enemy dies
        }
        return !e.update();
    });

    // Draw entities
    enemies.forEach(e => e.draw());
    towers.forEach(t => { t.draw(); t.fire(); });

    frame++;

    if (baseHealth > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = "50px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
    }
}

// Boot up Game
loadLevel(0);
requestAnimationFrame(gameLoop);
