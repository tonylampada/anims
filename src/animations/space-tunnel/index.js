import Animation from '../../core/Animation.js';

export default class SpaceTunnelAnimation extends Animation {
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