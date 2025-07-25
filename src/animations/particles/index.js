import Animation from '../../core/Animation.js';

export default class ParticlesAnimation extends Animation {
    constructor() {
        super();
        this.particles = [];
        this.particleCount = 150;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    get metadata() {
        return {
            title: 'Partículas Interativas',
            description: 'Partículas que reagem ao movimento do mouse',
            author: 'Sistema',
            date: '2025-07-25'
        };
    }

    init(canvas) {
        super.init(canvas);
        
        this.createParticles();
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }

    resize() {
        super.resize();
        this.createParticles();
    }

    update() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.5;
                particle.vy -= (dy / distance) * force * 0.5;
            }
            
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx = -particle.vx;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy = -particle.vy;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
        });
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            this.particles.forEach(other => {
                if (particle === other) return;
                
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 80)})`;
                    this.ctx.stroke();
                }
            });
        });
    }
}