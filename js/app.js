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

// Animação Space Tunnel
class SpaceTunnelAnimation extends Animation {
    constructor() {
        super();
        this.tunnelParticles = [];
        this.nebulaParticles = [];
        this.time = 0;
        this.centerX = 0;
        this.centerY = 0;
    }

    get metadata() {
        return {
            title: 'Space Tunnel',
            description: 'Viagem hipnotizante através de um túnel de luz no espaço',
            author: 'Sistema',
            date: '2025-07-25'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.createTunnelParticles();
        this.createNebulaParticles();
    }

    createTunnelParticles() {
        this.tunnelParticles = [];
        const particleCount = 200;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.max(this.canvas.width, this.canvas.height);
            this.tunnelParticles.push({
                angle: angle,
                radius: radius,
                z: Math.random() * 1000,
                speed: 2 + Math.random() * 3,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random()
            });
        }
    }

    createNebulaParticles() {
        this.nebulaParticles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            this.nebulaParticles.push({
                x: this.centerX + (Math.random() - 0.5) * 400,
                y: this.centerY + (Math.random() - 0.5) * 400,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 80 + 20,
                hue: 180 + Math.random() * 60, // Azul para verde
                alpha: Math.random() * 0.3
            });
        }
    }

    resize() {
        super.resize();
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    update() {
        this.time += 0.01;
        
        // Atualizar partículas do túnel
        this.tunnelParticles.forEach(particle => {
            particle.z -= particle.speed;
            
            // Resetar partícula quando sair do campo de visão
            if (particle.z < 1) {
                particle.z = 1000;
                particle.angle = Math.random() * Math.PI * 2;
                particle.radius = Math.random() * Math.max(this.canvas.width, this.canvas.height);
            }
        });
        
        // Atualizar nebulosa
        this.nebulaParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Movimento orgânico
            particle.vx += (Math.random() - 0.5) * 0.02;
            particle.vy += (Math.random() - 0.5) * 0.02;
            
            // Limitar velocidade
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Manter próximo ao centro
            const dx = this.centerX - particle.x;
            const dy = this.centerY - particle.y;
            particle.vx += dx * 0.0001;
            particle.vy += dy * 0.0001;
            
            // Variação suave de transparência
            particle.alpha = 0.15 + Math.sin(this.time + particle.x * 0.01) * 0.1;
        });
    }

    draw() {
        // Fundo escuro com fade
        this.ctx.fillStyle = 'rgba(0, 0, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar nebulosa de fundo
        this.nebulaParticles.forEach(particle => {
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            
            const hue = particle.hue + Math.sin(this.time) * 10;
            gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${particle.alpha})`);
            gradient.addColorStop(0.5, `hsla(${hue}, 70%, 40%, ${particle.alpha * 0.5})`);
            gradient.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                particle.x - particle.size,
                particle.y - particle.size,
                particle.size * 2,
                particle.size * 2
            );
        });
        
        // Desenhar túnel de partículas
        this.tunnelParticles.sort((a, b) => b.z - a.z); // Ordenar por profundidade
        
        this.tunnelParticles.forEach(particle => {
            const perspective = 800 / particle.z;
            const x = this.centerX + Math.cos(particle.angle) * particle.radius * perspective;
            const y = this.centerY + Math.sin(particle.angle) * particle.radius * perspective;
            const size = particle.size * perspective;
            const opacity = Math.min(1, perspective) * particle.brightness;
            
            // Partícula principal
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            const hue = 200 + Math.sin(particle.angle + this.time) * 20;
            this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${opacity})`;
            this.ctx.fill();
            
            // Brilho ao redor
            if (size > 1) {
                const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                glowGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${opacity * 0.5})`);
                glowGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
                this.ctx.fillStyle = glowGradient;
                this.ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
            }
            
            // Trails de luz
            if (particle.z < 500) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                const trailX = this.centerX + Math.cos(particle.angle) * particle.radius * 0.8;
                const trailY = this.centerY + Math.sin(particle.angle) * particle.radius * 0.8;
                this.ctx.lineTo(trailX, trailY);
                this.ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity * 0.3})`;
                this.ctx.lineWidth = size * 0.5;
                this.ctx.stroke();
            }
        });
        
        // Efeito de vinheta
        const vignette = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height) * 0.7
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 20, 0.8)');
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Sistema de Galeria
class AnimationGallery {
    constructor() {
        this.animations = [
            ParticlesAnimation,
            SpaceTunnelAnimation
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