import Animation from '../../core/Animation.js';

export default class SpiralGalaxyAnimation extends Animation {
    constructor() {
        super();
        this.rotation = 0;
        this.stars = [];
        this.nebulaClouds = [];
        this.coreGlow = {
            radius: 80,
            intensity: 1,
            pulsePhase: 0
        };
        this.spiralArms = 5;
        this.starCount = 2000;
        this.nebulaCount = 50;
    }

    get metadata() {
        return {
            title: 'Spiral Galaxy',
            description: 'Majestic spiral galaxy slowly spinning through space',
            author: 'Sistema',
            date: new Date().toISOString()
        };
    }

    init(canvas) {
        super.init(canvas);
        this.createStars();
        this.createNebulaClouds();
    }

    createStars() {
        this.stars = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.8;

        for (let i = 0; i < this.starCount; i++) {
            // Use spiral distribution
            const t = Math.random() * 10; // parameter along spiral
            const armIndex = Math.floor(Math.random() * this.spiralArms);
            const armAngle = (armIndex * 2 * Math.PI) / this.spiralArms;
            
            // Logarithmic spiral equation
            const a = 20; // controls tightness
            const b = 0.3; // controls growth rate
            const r = a * Math.exp(b * t);
            
            // Add some randomness for spread
            const spread = Math.random() * 30 - 15;
            const angle = armAngle + t * 0.5 + (spread / r) * 0.5;
            
            // Convert to cartesian coordinates
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            
            // Only add stars within bounds
            if (r < maxRadius) {
                this.stars.push({
                    x: x,
                    y: y,
                    baseX: r * Math.cos(angle),
                    baseY: r * Math.sin(angle),
                    size: Math.random() * 2 + 0.5,
                    brightness: Math.random(),
                    twinkleSpeed: Math.random() * 0.05 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2,
                    color: this.getStarColor(),
                    inCore: r < 50
                });
            }
        }

        // Add extra stars in the core
        for (let i = 0; i < 500; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 50;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            
            this.stars.push({
                x: x,
                y: y,
                baseX: x - centerX,
                baseY: y - centerY,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: '#ffffff',
                inCore: true
            });
        }
    }

    getStarColor() {
        const colors = [
            '#ffffff', // white
            '#ffe9c4', // yellow-white
            '#ffd2a1', // orange-white
            '#ffcccc', // red-white
            '#ccccff', // blue-white
            '#aaccff'  // bright blue-white
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createNebulaClouds() {
        this.nebulaClouds = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < this.nebulaCount; i++) {
            const armIndex = Math.floor(Math.random() * this.spiralArms);
            const armAngle = (armIndex * 2 * Math.PI) / this.spiralArms;
            const t = Math.random() * 8 + 1;
            
            const a = 30;
            const b = 0.3;
            const r = a * Math.exp(b * t);
            const angle = armAngle + t * 0.5 + (Math.random() - 0.5) * 0.5;
            
            this.nebulaClouds.push({
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                baseX: r * Math.cos(angle),
                baseY: r * Math.sin(angle),
                radius: Math.random() * 60 + 30,
                color: this.getNebulaColor(),
                opacity: Math.random() * 0.3 + 0.1,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }

    getNebulaColor() {
        const colors = [
            'rgba(138, 43, 226, ', // blue violet
            'rgba(75, 0, 130, ',   // indigo
            'rgba(255, 20, 147, ', // deep pink
            'rgba(255, 140, 0, ',  // dark orange
            'rgba(0, 191, 255, ',  // deep sky blue
            'rgba(148, 0, 211, '   // dark violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    resize() {
        super.resize();
        this.createStars();
        this.createNebulaClouds();
    }

    update() {
        // Rotation speed - visible but still majestic
        this.rotation += 0.05; // Much faster for debugging
        
        // Debug: Show rotation value every 60 frames
        if (!this.frameCount) this.frameCount = 0;
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            console.log('Spiral Galaxy rotation:', this.rotation);
        }
        
        // Pulse the core glow
        this.coreGlow.pulsePhase += 0.02;
        this.coreGlow.intensity = 0.8 + Math.sin(this.coreGlow.pulsePhase) * 0.2;
        
        // Update star twinkle
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
        });
    }

    draw() {
        // Dark space background
        this.ctx.fillStyle = '#000814';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Debug: Draw rotation indicator
        this.ctx.save();
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(100, 0);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Debug: Show if update is being called
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Rotation: ${this.rotation.toFixed(2)}`, 10, 30);
        this.ctx.fillText(`Core Pulse: ${this.coreGlow.pulsePhase.toFixed(2)}`, 10, 60);
        
        // Save context for rotation
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);
        
        // Draw nebula clouds
        this.drawNebulae(centerX, centerY);
        
        // Draw galaxy core glow
        this.drawCoreGlow(0, 0);
        
        // Draw stars
        this.drawStars(centerX, centerY);
        
        // Draw bright central core
        this.drawCore(0, 0);
        
        this.ctx.restore();
    }

    drawNebulae(centerX, centerY) {
        this.nebulaClouds.forEach(cloud => {
            const x = cloud.baseX;
            const y = cloud.baseY;
            
            // Create radial gradient for nebula
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, cloud.radius);
            gradient.addColorStop(0, cloud.color + cloud.opacity + ')');
            gradient.addColorStop(0.5, cloud.color + (cloud.opacity * 0.5) + ')');
            gradient.addColorStop(1, cloud.color + '0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, cloud.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawCoreGlow(centerX, centerY) {
        // Multiple layers of glow for depth
        const glowLayers = [
            { radius: 200, opacity: 0.1 },
            { radius: 150, opacity: 0.15 },
            { radius: 100, opacity: 0.2 },
            { radius: 70, opacity: 0.3 }
        ];
        
        glowLayers.forEach(layer => {
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, layer.radius * this.coreGlow.intensity
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${layer.opacity})`);
            gradient.addColorStop(0.3, `rgba(255, 248, 220, ${layer.opacity * 0.8})`);
            gradient.addColorStop(0.6, `rgba(255, 228, 181, ${layer.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, layer.radius * this.coreGlow.intensity, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawStars(centerX, centerY) {
        this.stars.forEach(star => {
            const x = star.baseX;
            const y = star.baseY;
            
            // Calculate twinkle effect
            const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;
            const brightness = star.brightness * twinkle;
            
            // Draw star with glow
            if (star.size > 1.5) {
                // Larger stars get a subtle glow
                const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, star.size * 3);
                glowGradient.addColorStop(0, star.color + brightness + ')');
                glowGradient.addColorStop(1, star.color.replace(')', ', 0)'));
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw the star itself
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = brightness;
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    drawCore(centerX, centerY) {
        // Bright central core
        const coreGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 30
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(0.2, 'rgba(255, 248, 220, 0.9)');
        coreGradient.addColorStop(0.5, 'rgba(255, 228, 181, 0.7)');
        coreGradient.addColorStop(1, 'rgba(255, 200, 150, 0.4)');
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30 * this.coreGlow.intensity, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Extra bright center point
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
}