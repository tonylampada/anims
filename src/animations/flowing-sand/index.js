import Animation from '../../core/Animation.js';

export default class FlowingSandAnimation extends Animation {
    constructor() {
        super();
        this.particles = [];
        this.particleCount = 5000;
        this.gravity = 0.3;
        this.friction = 0.96;
        this.grid = null;
        this.cellSize = 2;
        this.sandColors = [
            '#D2B48C', // Tan
            '#DEB887', // Burlywood
            '#F4A460', // Sandy brown
            '#BC9A6A', // Camel
            '#C19A6B', // Desert sand
            '#EDC9AF', // Desert
            '#D2691E', // Chocolate
            '#CD853F'  // Peru
        ];
        this.spawnRate = 20;
        this.windForce = 0;
        this.windTime = 0;
    }

    get metadata() {
        return {
            title: 'Flowing Sand',
            description: 'Meditative sand flowing and forming natural patterns',
            author: 'Sistema',
            date: new Date().toISOString()
        };
    }

    init(canvas) {
        super.init(canvas);
        this.initGrid();
        this.particles = [];
    }

    initGrid() {
        const cols = Math.ceil(this.canvas.width / this.cellSize);
        const rows = Math.ceil(this.canvas.height / this.cellSize);
        this.grid = Array(rows).fill(null).map(() => Array(cols).fill(false));
    }

    resize() {
        super.resize();
        this.initGrid();
    }

    createParticle(x, y) {
        return {
            x: x || Math.random() * this.canvas.width,
            y: y || 0,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.5,
            radius: 1,
            color: this.sandColors[Math.floor(Math.random() * this.sandColors.length)],
            settled: false,
            life: 1
        };
    }

    update() {
        // Spawn new particles
        for (let i = 0; i < this.spawnRate; i++) {
            if (this.particles.length < this.particleCount) {
                const spawnX = this.canvas.width / 2 + (Math.random() - 0.5) * 100;
                this.particles.push(this.createParticle(spawnX, -10));
            }
        }

        // Update wind
        this.windTime += 0.01;
        this.windForce = Math.sin(this.windTime) * 0.1;

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.settled) {
                // Apply gravity
                particle.vy += this.gravity;
                
                // Apply wind
                particle.vx += this.windForce;
                
                // Apply friction
                particle.vx *= this.friction;
                particle.vy *= this.friction;
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Check grid collision
                const gridX = Math.floor(particle.x / this.cellSize);
                const gridY = Math.floor(particle.y / this.cellSize);
                
                // Bottom boundary
                if (particle.y >= this.canvas.height - 2) {
                    particle.y = this.canvas.height - 2;
                    particle.settled = true;
                    particle.vx = 0;
                    particle.vy = 0;
                    if (gridY >= 0 && gridY < this.grid.length && gridX >= 0 && gridX < this.grid[0].length) {
                        this.grid[gridY][gridX] = true;
                    }
                }
                // Check collision with settled particles
                else if (gridY >= 0 && gridY < this.grid.length - 1) {
                    let collision = false;
                    
                    // Check below
                    if (gridX >= 0 && gridX < this.grid[0].length && this.grid[gridY + 1][gridX]) {
                        collision = true;
                    }
                    
                    if (collision) {
                        // Try to slide left or right
                        const slideDirection = Math.random() > 0.5 ? 1 : -1;
                        let canSlide = false;
                        
                        // Check if can slide
                        const slideX = gridX + slideDirection;
                        if (slideX >= 0 && slideX < this.grid[0].length && 
                            gridY + 1 < this.grid.length &&
                            !this.grid[gridY + 1][slideX]) {
                            particle.x += slideDirection * this.cellSize;
                            particle.vx = slideDirection * 0.5;
                            canSlide = true;
                        } else {
                            // Try other direction
                            const otherSlideX = gridX - slideDirection;
                            if (otherSlideX >= 0 && otherSlideX < this.grid[0].length && 
                                gridY + 1 < this.grid.length &&
                                !this.grid[gridY + 1][otherSlideX]) {
                                particle.x -= slideDirection * this.cellSize;
                                particle.vx = -slideDirection * 0.5;
                                canSlide = true;
                            }
                        }
                        
                        if (!canSlide) {
                            // Settle the particle
                            particle.settled = true;
                            particle.vx = 0;
                            particle.vy = 0;
                            if (gridX >= 0 && gridX < this.grid[0].length) {
                                this.grid[gridY][gridX] = true;
                            }
                        }
                    }
                }
                
                // Side boundaries
                if (particle.x <= 0 || particle.x >= this.canvas.width) {
                    particle.vx *= -0.5;
                    particle.x = Math.max(0, Math.min(this.canvas.width - 1, particle.x));
                }
            } else {
                // Slowly fade settled particles
                particle.life *= 0.999;
                
                // Remove very old particles to maintain performance
                if (particle.life < 0.3 && Math.random() < 0.01) {
                    const gridX = Math.floor(particle.x / this.cellSize);
                    const gridY = Math.floor(particle.y / this.cellSize);
                    if (gridY >= 0 && gridY < this.grid.length && gridX >= 0 && gridX < this.grid[0].length) {
                        this.grid[gridY][gridX] = false;
                    }
                    this.particles.splice(i, 1);
                }
            }
        }

        // Occasionally create avalanches
        if (Math.random() < 0.001) {
            this.createAvalanche();
        }
    }

    createAvalanche() {
        const startX = Math.floor(Math.random() * this.grid[0].length);
        const startY = Math.floor(this.grid.length * 0.3);
        
        for (let y = startY; y < this.grid.length; y++) {
            for (let x = Math.max(0, startX - 5); x < Math.min(this.grid[0].length, startX + 5); x++) {
                if (this.grid[y][x]) {
                    this.grid[y][x] = false;
                    // Find the corresponding particle and unsettle it
                    for (const particle of this.particles) {
                        const px = Math.floor(particle.x / this.cellSize);
                        const py = Math.floor(particle.y / this.cellSize);
                        if (px === x && py === y && particle.settled) {
                            particle.settled = false;
                            particle.vx = (Math.random() - 0.5) * 2;
                            particle.vy = Math.random() * 2;
                            break;
                        }
                    }
                }
            }
        }
    }

    draw() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.5, '#F0E68C'); // Khaki
        gradient.addColorStop(1, '#DEB887'); // Burlywood
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            
            // Draw particle with slight glow for settled sand
            if (particle.settled) {
                this.ctx.shadowBlur = 1;
                this.ctx.shadowColor = particle.color;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Draw dune highlights
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = '#FFFFFF';
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[0].length; x++) {
                if (this.grid[y][x] && y > 0 && x > 0 && !this.grid[y - 1][x - 1]) {
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
        this.ctx.globalAlpha = 1;
        
        // Draw wind indicator
        if (Math.abs(this.windForce) > 0.05) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.abs(this.windForce) * 2;
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            const windY = 50;
            for (let i = 0; i < 5; i++) {
                const x = this.canvas.width * (i / 5) + this.windTime * 50;
                const waveX = x % this.canvas.width;
                this.ctx.moveTo(waveX, windY);
                this.ctx.lineTo(waveX + this.windForce * 100, windY + 10);
            }
            
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
}