import Animation from '../../core/Animation.js';

export default class SpiralGalaxyAnimation extends Animation {
    constructor() {
        super();
        this.particles = [];
        this.time = 0;
        this.centerX = 0;
        this.centerY = 0;
    }

    get metadata() {
        return {
            title: 'Spiral Galaxy',
            description: 'Beautiful rotating spiral galaxy',
            author: 'Sistema',
            date: new Date().toISOString()
        };
    }

    init(canvas) {
        super.init(canvas);
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const numArms = 3;
        const particlesPerArm = 500;
        const maxRadius = Math.min(this.centerX, this.centerY) * 0.9;
        
        // Create spiral arms
        for (let arm = 0; arm < numArms; arm++) {
            const armAngle = (arm * 2 * Math.PI) / numArms;
            
            for (let i = 0; i < particlesPerArm; i++) {
                const progress = i / particlesPerArm;
                const radius = progress * maxRadius;
                
                // Spiral equation
                const angle = armAngle + progress * Math.PI * 4; // 2 full rotations
                
                // Add some randomness for natural look
                const spread = (Math.random() - 0.5) * 40 * (1 - progress * 0.5);
                const r = radius + spread;
                
                // Position
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                
                this.particles.push({
                    x: x,
                    y: y,
                    angle: Math.atan2(y, x),
                    radius: Math.sqrt(x * x + y * y),
                    size: Math.random() * 3 + 1,
                    brightness: Math.random() * 0.5 + 0.5,
                    speed: 0.001 + (1 - progress) * 0.002, // Inner particles rotate faster
                    color: this.getStarColor(progress)
                });
            }
        }
        
        // Add central bulge
        for (let i = 0; i < 300; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 50;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            this.particles.push({
                x: x,
                y: y,
                angle: angle,
                radius: r,
                size: Math.random() * 2 + 1,
                brightness: 1,
                speed: 0.003,
                color: '#ffffdd'
            });
        }
        
        // Add background stars
        for (let i = 0; i < 500; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 100 + Math.random() * (maxRadius - 100);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            this.particles.push({
                x: x,
                y: y,
                angle: angle,
                radius: r,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.3 + 0.2,
                speed: 0.0005,
                color: '#ffffff'
            });
        }
    }

    getStarColor(progress) {
        if (progress < 0.3) {
            return '#ffffdd'; // Yellowish center
        } else if (progress < 0.6) {
            return '#ffffff'; // White middle
        } else {
            return '#aaccff'; // Bluish outer
        }
    }

    resize() {
        super.resize();
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.createParticles();
    }

    update() {
        this.time += 1;
        
        // Update particle positions
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
            particle.x = Math.cos(particle.angle) * particle.radius;
            particle.y = Math.sin(particle.angle) * particle.radius;
        });
    }

    draw() {
        // Dark background with subtle blue tint
        this.ctx.fillStyle = '#000511';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw galactic halo
        const haloGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.min(this.centerX, this.centerY) * 0.8
        );
        haloGradient.addColorStop(0, 'rgba(100, 80, 120, 0.1)');
        haloGradient.addColorStop(0.5, 'rgba(60, 40, 100, 0.05)');
        haloGradient.addColorStop(1, 'rgba(20, 10, 50, 0)');
        
        this.ctx.fillStyle = haloGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(particle => {
            const x = this.centerX + particle.x;
            const y = this.centerY + particle.y;
            
            // Glow effect
            if (particle.size > 1.5) {
                const glowGradient = this.ctx.createRadialGradient(
                    x, y, 0,
                    x, y, particle.size * 4
                );
                glowGradient.addColorStop(0, particle.color + '40');
                glowGradient.addColorStop(1, particle.color + '00');
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.fillRect(
                    x - particle.size * 4,
                    y - particle.size * 4,
                    particle.size * 8,
                    particle.size * 8
                );
            }
            
            // Star itself
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.brightness;
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        
        // Bright galactic core
        const coreGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 60
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 240, 0.8)');
        coreGradient.addColorStop(0.2, 'rgba(255, 240, 200, 0.4)');
        coreGradient.addColorStop(0.5, 'rgba(255, 220, 180, 0.2)');
        coreGradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Very bright center
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
}