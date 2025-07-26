import Animation from '../../core/Animation.js';

export default class SpiralGalaxyAnimation extends Animation {
    constructor() {
        super();
        this.particles = [];
        this.centerX = 0;
        this.centerY = 0;
        this.time = 0;
        
        // Galaxy parameters
        this.numArms = 5;
        this.armSpread = 0.5;
        this.rotationSpeed = 0.001;
        this.particleCount = 3000;
        this.centralMass = 50000;
    }

    get metadata() {
        return {
            title: 'Spiral Galaxy',
            description: 'Dynamic spiral galaxy with particles falling into the center',
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
        const maxRadius = Math.min(this.centerX, this.centerY) * 0.9;
        
        for (let i = 0; i < this.particleCount; i++) {
            // Distribute particles in spiral arms
            const armIndex = Math.floor(Math.random() * this.numArms);
            const armAngle = (armIndex * 2 * Math.PI) / this.numArms;
            
            // Distance from center with bias towards outer regions
            const distance = Math.sqrt(Math.random()) * maxRadius;
            
            // Add spread to the arm
            const spread = (Math.random() - 0.5) * this.armSpread;
            const angle = armAngle + distance * 0.01 + spread;
            
            // Initial position
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // Calculate orbital velocity for stable orbit
            const orbitalVelocity = Math.sqrt(this.centralMass / (distance + 1));
            const velocityAngle = angle + Math.PI / 2; // Perpendicular to radius
            
            // Add some randomness to velocity for variety
            const velocityVariation = 0.8 + Math.random() * 0.4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(velocityAngle) * orbitalVelocity * velocityVariation,
                vy: Math.sin(velocityAngle) * orbitalVelocity * velocityVariation,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                color: this.getParticleColor(distance, maxRadius),
                trail: []
            });
        }
        
        // Add central core particles
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const orbitalVelocity = Math.sqrt(this.centralMass / (distance + 10));
            const velocityAngle = angle + Math.PI / 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(velocityAngle) * orbitalVelocity,
                vy: Math.sin(velocityAngle) * orbitalVelocity,
                size: Math.random() * 1.5 + 0.5,
                brightness: 1,
                color: '#ffffff',
                trail: []
            });
        }
    }

    getParticleColor(distance, maxRadius) {
        const ratio = distance / maxRadius;
        
        if (ratio < 0.3) {
            // Inner region - white/yellow
            return ['#ffffff', '#fffacd', '#ffffe0'][Math.floor(Math.random() * 3)];
        } else if (ratio < 0.6) {
            // Mid region - blue/white
            return ['#ffffff', '#e6e6fa', '#b0c4de', '#87ceeb'][Math.floor(Math.random() * 4)];
        } else {
            // Outer region - blue/purple
            return ['#6495ed', '#7b68ee', '#9370db', '#8a2be2'][Math.floor(Math.random() * 4)];
        }
    }

    resize() {
        super.resize();
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    update() {
        this.time++;
        
        this.particles.forEach(particle => {
            // Calculate distance from center
            const dx = particle.x;
            const dy = particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.1) {
                // Gravitational acceleration towards center
                const force = this.centralMass / (distance * distance);
                const ax = -(dx / distance) * force;
                const ay = -(dy / distance) * force;
                
                // Update velocity
                particle.vx += ax * 0.01;
                particle.vy += ay * 0.01;
                
                // Add some drag for spiral effect
                particle.vx *= 0.999;
                particle.vy *= 0.999;
            }
            
            // Update position
            particle.x += particle.vx * 0.1;
            particle.y += particle.vy * 0.1;
            
            // Store trail positions
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > 10) {
                particle.trail.shift();
            }
            
            // Respawn particles that fall into the center or go too far
            if (distance < 5 || distance > Math.min(this.centerX, this.centerY)) {
                // Respawn at outer edge
                const armIndex = Math.floor(Math.random() * this.numArms);
                const armAngle = (armIndex * 2 * Math.PI) / this.numArms;
                const maxRadius = Math.min(this.centerX, this.centerY) * 0.9;
                const newDistance = maxRadius * (0.7 + Math.random() * 0.3);
                const spread = (Math.random() - 0.5) * this.armSpread;
                const angle = armAngle + newDistance * 0.01 + spread;
                
                particle.x = Math.cos(angle) * newDistance;
                particle.y = Math.sin(angle) * newDistance;
                
                const orbitalVelocity = Math.sqrt(this.centralMass / newDistance);
                const velocityAngle = angle + Math.PI / 2;
                particle.vx = Math.cos(velocityAngle) * orbitalVelocity * (0.8 + Math.random() * 0.4);
                particle.vy = Math.sin(velocityAngle) * orbitalVelocity * (0.8 + Math.random() * 0.4);
                particle.trail = [];
            }
        });
    }

    draw() {
        // Dark space background
        this.ctx.fillStyle = 'rgba(0, 8, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        
        // Draw central black hole/bright core
        this.drawCore();
        
        // Draw particles
        this.particles.forEach(particle => {
            // Draw trail
            if (particle.trail.length > 1) {
                this.ctx.strokeStyle = particle.color;
                this.ctx.globalAlpha = particle.brightness * 0.3;
                this.ctx.lineWidth = particle.size * 0.5;
                this.ctx.beginPath();
                particle.trail.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
            }
            
            // Draw particle
            this.ctx.globalAlpha = particle.brightness;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    drawCore() {
        // Multiple layers for depth
        const layers = [
            { radius: 50, color: 'rgba(50, 0, 100, 0.5)' },
            { radius: 30, color: 'rgba(100, 50, 200, 0.7)' },
            { radius: 20, color: 'rgba(200, 150, 255, 0.9)' },
            { radius: 10, color: 'rgba(255, 255, 255, 1)' }
        ];
        
        layers.forEach(layer => {
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, layer.radius);
            gradient.addColorStop(0, layer.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, layer.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Bright center
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
}