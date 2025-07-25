// Classe base para todas as animações
class Animation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
    }

    get metadata() {
        return {
            title: 'Animação Base',
            description: 'Descrição da animação',
            author: 'Autor',
            date: new Date().toISOString()
        };
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (this.canvas) {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    update() {}
    draw() {}

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Animação de Partículas
class ParticlesAnimation extends Animation {
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

// Sistema de Galeria
class AnimationGallery {
    constructor() {
        this.animations = [
            ParticlesAnimation
        ];
        this.currentIndex = 0;
        this.currentAnimation = null;
        this.canvas = document.getElementById('animation-canvas');
        
        this.titleEl = document.getElementById('animation-title');
        this.descriptionEl = document.getElementById('animation-description');
        this.counterEl = document.getElementById('animation-counter');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        this.init();
    }
    
    init() {
        this.prevBtn.addEventListener('click', () => this.previousAnimation());
        this.nextBtn.addEventListener('click', () => this.nextAnimation());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousAnimation();
            if (e.key === 'ArrowRight') this.nextAnimation();
        });
        
        this.loadAnimation(0);
    }
    
    loadAnimation(index) {
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        
        if (index < 0 || index >= this.animations.length) return;
        
        this.currentIndex = index;
        const AnimationClass = this.animations[index];
        
        this.currentAnimation = new AnimationClass();
        this.currentAnimation.init(this.canvas);
        
        const metadata = this.currentAnimation.metadata;
        this.titleEl.textContent = metadata.title;
        this.descriptionEl.textContent = metadata.description;
        this.counterEl.textContent = `${index + 1} / ${this.animations.length}`;
        
        this.prevBtn.disabled = index === 0;
        this.nextBtn.disabled = index === this.animations.length - 1;
        
        this.currentAnimation.start();
    }
    
    previousAnimation() {
        if (this.currentIndex > 0) {
            this.loadAnimation(this.currentIndex - 1);
        }
    }
    
    nextAnimation() {
        if (this.currentIndex < this.animations.length - 1) {
            this.loadAnimation(this.currentIndex + 1);
        }
    }
}

// Inicializar quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
    new AnimationGallery();
});