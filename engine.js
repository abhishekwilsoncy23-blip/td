const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gold = 100;
let baseHealth = 10;
let enemies = [];
let towers = [];
let projectiles = [];
let currentPath = [];
let currentWaves = [];
let frame = 0;

function initLevel(path, waves) {
    currentPath = path;
    currentWaves = waves;
    gameLoop();
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
            document.getElementById('baseHealth').innerText = baseHealth;
            return true; // Remove enemy
        }
        let dx = target.x - this.x;
        let dy = target.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < this.speed) this.pathIndex++;
        else {
            this.x += (dx/dist) * this.speed;
            this.y += (dy/dist) * this.speed;
        }
        return false;
    }
    draw() {
        ctx.font = "30px Arial";
        ctx.fillText(this.icon, this.x - 15, this.y + 10);
        // Health bar (CoC style)
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 25, 30, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - 15, this.y - 25, (this.hp/this.maxHp) * 30, 5);
    }
}

class Tower {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.range = 150;
        this.cooldown = 0;
    }
    draw() {
        ctx.font = "40px Arial";
        ctx.fillText('🏹', this.x - 20, this.y + 15);
    }
    fire() {
        if (this.cooldown > 0) { this.cooldown--; return; }
        let target = enemies.find(e => Math.hypot(e.x - this.x, e.y - this.y) < this.range);
        if (target) {
            projectiles.push({x: this.x, y: this.y, target: target, speed: 5});
            this.cooldown = 30; // Shooting speed
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gold >= 30) {
        const rect = canvas.getBoundingClientRect();
        towers.push(new Tower(e.clientX - rect.left, e.clientY - rect.top));
        gold -= 30;
        document.getElementById('gold').innerText = gold;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Path
    ctx.strokeStyle = '#d4a373'; ctx.lineWidth = 40; ctx.beginPath();
    currentPath.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Spawn Logic
    if (frame % 100 === 0 && currentWaves.length > 0) {
        enemies.push(new Enemy(currentWaves[0]));
    }

    // Update Projectiles & Damage
    projectiles.forEach((p, i) => {
        let dx = p.target.x - p.x;
        let dy = p.target.y - p.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        p.x += (dx/dist) * p.speed;
        p.y += (dy/dist) * p.speed;
        ctx.fillText('📌', p.x, p.y); // Arrow
        if (dist < 10) {
            p.target.hp -= 2; // DAMAGE
            projectiles.splice(i, 1);
        }
    });

    enemies = enemies.filter(e => {
        if (e.hp <= 0) { gold += e.reward; document.getElementById('gold').innerText = gold; return false; }
        return !e.update();
    });

    enemies.forEach(e => e.draw());
    towers.forEach(t => { t.draw(); t.fire(); });

    frame++;
    if (baseHealth > 0) requestAnimationFrame(gameLoop);
    else alert("Game Over! Castle Destroyed.");
}
