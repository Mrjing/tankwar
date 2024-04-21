class Tank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.direction = 'up'; // 默认方向
        this.bullets = []; // 存储发射的子弹
        this.image = new Image();
        this.image.src = 'I.png'; // 替换为玩家坦克图片的路径
        
    }

    move(direction) {
        this.direction = direction; // 更新坦克的方向
        switch (direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }
    }

    shoot() {
        // 根据坦克的方向和位置发射子弹
        let bulletX = this.x + 25; // 假设坦克宽度为50
        let bulletY = this.y + 25; // 假设坦克高度为50
        let bullet = new Bullet(bulletX, bulletY, this.direction);
        this.bullets.push(bullet);
    }

    draw(context) {
        context.save(); // 保存当前画布的状态
        context.translate(this.x + 25, this.y + 25); // 将画布原点移动到坦克的中心
    
        // 根据坦克的方向旋转画布
        switch (this.direction) {
            case 'up':
                context.rotate(0);
                break;
            case 'down':
                context.rotate(Math.PI);
                break;
            case 'left':
                context.rotate(-Math.PI / 2);
                break;
            case 'right':
                context.rotate(Math.PI / 2);
                break;
        }
    
        // 绘制坦克图片
        context.drawImage(this.image, -25, -25, 50, 50); // 假设坦克图片大小为50x50像素
    
        context.restore(); // 恢复画布到之前的状态
        this.bullets.forEach(bullet => bullet.draw(context));
    }
    update() {
        this.bullets.forEach(bullet => bullet.move()); // 更新所有子弹的位置
    }
}

class EnemyTank extends Tank {
    constructor(x, y) {
        super(x, y);
        this.image.src = 'enemy.png'; // 替换为敌人坦克图片的路径
        this.speed = 2;
        this.moveDirection = 'up'; // 初始移动方向
        this.moveTimer = 0; // 移动方向改变的计时器
        this.moveInterval = 100; // 移动方向改变的间隔（以游戏循环的次数计）
    }

    // 检测并避免边界
    checkAndAvoidBoundaries() {
        const margin = 20; // 边界阈值
        const directions = ['up', 'down', 'left', 'right'];
        if (this.x < margin) {
            this.moveDirection = 'right';
        } else if (this.x > canvas.width - 50 - margin) { // 假设坦克宽度为50
            this.moveDirection = 'left';
        } else if (this.y < margin) {
            this.moveDirection = 'down';
        } else if (this.y > canvas.height - 50 - margin) { // 假设坦克高度为50
            this.moveDirection = 'up';
        } else {
            // 如果不接近边界，随机选择一个方向
            if (this.moveTimer > this.moveInterval) {
                this.moveDirection = directions[Math.floor(Math.random() * directions.length)];
                this.moveTimer = 0;
            }
        }
    }

    randomMove() {
        this.moveTimer++;
        this.checkAndAvoidBoundaries(); // 在移动前检查边界
        this.move(this.moveDirection);
    }

    autoShoot() {
        if (Math.random() < 0.1) {
            this.shoot();
        }
    }
}

class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.speed = 10; // 子弹的速度可以根据需要调整
        this.direction = direction;
    }

    move() {
        switch (this.direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }
    }

    draw(context) {
        context.fillStyle = 'red'; // 子弹颜色
        context.beginPath();
        context.arc(this.x, this.y, 5, 0, Math.PI * 2, true); // 绘制圆形子弹
        context.fill();
    }
}

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const tank = new Tank(375, 275); // 初始位置
// 创建敌人坦克实例
const enemyTank = new EnemyTank(100, 100); // 初始位置可以根据需要调整
var gameMusic = new Audio('start.wav');

// 设置音乐循环播放
gameMusic.loop = true;


function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + 50 &&
           obj1.x + 50 > obj2.x &&
           obj1.y < obj2.y + 50 &&
           obj1.y + 50 > obj2.y;
}

function gameLoop() {
    context.fillStyle = 'black'; // 设置为黑色背景
    context.fillRect(0, 0, canvas.width, canvas.height); // 填充整个画布为黑色
    tank.update(); // 更新坦克状态，包括子弹位置
    tank.draw(context); // 绘制坦克

    // 更新敌人坦克状态
    enemyTank.randomMove();
    enemyTank.autoShoot();
    enemyTank.update();
    enemyTank.draw(context);

    // 检测玩家的子弹是否命中敌人坦克
    tank.bullets.forEach((bullet, index) => {
        if (checkCollision(bullet, enemyTank)) {
            alert("游戏通过！");
            tank.bullets.splice(index, 1); // 移除命中的子弹
            // 这里可以添加重置游戏或者结束游戏的逻辑
        }
    });
    
    // 检测敌人的子弹是否命中玩家坦克
    enemyTank.bullets.forEach((bullet, index) => {
        if (checkCollision(bullet, tank)) {
            alert("游戏失败！");
            enemyTank.bullets.splice(index, 1); // 移除命中的子弹
            // 这里可以添加重置游戏或者结束游戏的逻辑
        }
    });
    requestAnimationFrame(gameLoop); // 循环调用
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            tank.move(event.key.replace('Arrow', '').toLowerCase());
            break;
        case ' ': // 按空格键发射子弹
            tank.shoot();
            break;
    }
});

gameLoop(); // 开始游戏循环
// 开始播放音乐
gameMusic.play();