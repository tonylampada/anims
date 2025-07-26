import Animation from '../../core/Animation.js';

export default class SpiralGalaxyAnimation extends Animation {
    constructor() {
        super();
        this.stars = [];
        this.dust = [];
        this.centerX = 0;
        this.centerY = 0;
        this.time = 0;
        
        // Galaxy parameters
        this.numArms = 2;
        this.armWindTightness = 0.5;
        this.starCount = 5000;
        this.dustCount = 1000;
        this.galaxyRadius = 300;
        this.coreRadius = 50;
        this.rotationFactor = 0.0002;
    }

    get metadata() {
        return {
            title: 'Spiral Galaxy',
            description: 'Realistic spiral galaxy with differential rotation',
            author: 'Sistema',
            date: new Date().toISOString()
        };
    }

    init(canvas) {
        super.init(canvas);
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.galaxyRadius = Math.min(this.centerX, this.centerY) * 0.8;
        this.coreRadius = this.galaxyRadius * 0.15;
        this.createGalaxy();
    }

    createGalaxy() {
        this.stars = [];
        this.dust = [];
        
        // Create core stars (bulge)
        for (let i = 0; i < this.starCount * 0.3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.randomGaussian() * this.coreRadius;
            const z = this.randomGaussian() * 20; // vertical distribution
            
            this.stars.push({
                angle: angle,
                radius: Math.abs(radius),
                z: z,
                brightness: 0.5 + Math.random() * 0.5,
                size: Math.random() * 1.5 + 0.5,
                color: this.getCoreStarColor(),
                twinkle: Math.random() * Math.PI * 2
            });
        }
        
        // Create spiral arm stars
        for (let arm = 0; arm < this.numArms; arm++) {
            const armAngle = (arm * 2 * Math.PI) / this.numArms;
            
            for (let i = 0; i < (this.starCount * 0.7) / this.numArms; i++) {
                // Position along the arm
                const t = Math.random();
                const radius = t * this.galaxyRadius;
                
                // Logarithmic spiral
                const theta = armAngle + this.armWindTightness * Math.log(radius / 20 + 1);
                
                // Add spread to create arm width
                const spread = this.randomGaussian() * (20 + radius * 0.1);
                const perpAngle = theta + Math.PI / 2;
                const offsetX = Math.cos(perpAngle) * spread;
                const offsetY = Math.sin(perpAngle) * spread;
                
                // Convert to polar coordinates
                const x = Math.cos(theta) * radius + offsetX;
                const y = Math.sin(theta) * radius + offsetY;
                const finalRadius = Math.sqrt(x * x + y * y);
                const finalAngle = Math.atan2(y, x);
                
                // Vertical distribution (thinner disk at edges)
                const z = this.randomGaussian() * (5 + 10 * (1 - t));
                
                this.stars.push({
                    angle: finalAngle,
                    radius: finalRadius,
                    z: z,
                    brightness: 0.3 + Math.random() * 0.7,
                    size: Math.random() * 2 + 0.5,
                    color: this.getArmStarColor(t),
                    twinkle: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Create dust lanes
        for (let arm = 0; arm < this.numArms; arm++) {
            const armAngle = (arm * 2 * Math.PI) / this.numArms;
            
            for (let i = 0; i < this.dustCount / this.numArms; i++) {
                const t = 0.2 + Math.random() * 0.7; // Dust mainly in middle regions
                const radius = t * this.galaxyRadius;
                const theta = armAngle + this.armWindTightness * Math.log(radius / 20 + 1) - 0.2; // Slightly leading edge
                
                const spread = this.randomGaussian() * 30;
                const perpAngle = theta + Math.PI / 2;
                const offsetX = Math.cos(perpAngle) * spread;
                const offsetY = Math.sin(perpAngle) * spread;
                
                const x = Math.cos(theta) * radius + offsetX;
                const y = Math.sin(theta) * radius + offsetY;
                const finalRadius = Math.sqrt(x * x + y * y);
                const finalAngle = Math.atan2(y, x);
                
                this.dust.push({
                    angle: finalAngle,
                    radius: finalRadius,
                    size: 20 + Math.random() * 40,
                    opacity: 0.02 + Math.random() * 0.03
                });
            }
        }
    }

    randomGaussian() {
        // Box-Muller transform for gaussian distribution
        const u = 1 - Math.random();
        const v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    getCoreStarColor() {
        const colors = [
            '#ffffcc', // Yellowish
            '#ffeeaa', // Yellow-white
            '#ffddbb', // Orange-white
            '#ffffff'  // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getArmStarColor(position) {
        if (position < 0.3) {
            // Inner arms - yellower stars
            return ['#ffffcc', '#ffeeaa', '#ffffff'][Math.floor(Math.random() * 3)];
        } else if (position < 0.7) {
            // Middle - mixed population
            return ['#ffffff', '#eeeeff', '#ddddff', '#ffeeaa'][Math.floor(Math.random() * 4)];
        } else {
            // Outer arms - bluer, younger stars
            return ['#ddddff', '#ccccff', '#bbbbff', '#aaaaff'][Math.floor(Math.random() * 4)];
        }
    }

    resize() {
        super.resize();
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.galaxyRadius = Math.min(this.centerX, this.centerY) * 0.8;
        this.coreRadius = this.galaxyRadius * 0.15;
        this.createGalaxy();
    }

    update() {
        this.time++;
        
        // Update star twinkle
        this.stars.forEach(star => {
            star.twinkle += 0.05;
        });
    }

    draw() {
        // Black space background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sort by z-order (back to front)
        const allObjects = [...this.stars];
        allObjects.sort((a, b) => (a.z || 0) - (b.z || 0));
        
        // Draw dust first (behind stars)
        this.dust.forEach(cloud => {
            const rotation = this.time * this.rotationFactor / (1 + cloud.radius / this.galaxyRadius);
            const x = this.centerX + Math.cos(cloud.angle + rotation) * cloud.radius;
            const y = this.centerY + Math.sin(cloud.angle + rotation) * cloud.radius;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, cloud.size);
            gradient.addColorStop(0, `rgba(50, 30, 20, ${cloud.opacity})`);
            gradient.addColorStop(1, 'rgba(50, 30, 20, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - cloud.size, y - cloud.size, cloud.size * 2, cloud.size * 2);
        });
        
        // Draw galaxy glow
        const galaxyGlow = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.galaxyRadius
        );
        galaxyGlow.addColorStop(0, 'rgba(255, 240, 200, 0.05)');
        galaxyGlow.addColorStop(0.1, 'rgba(255, 230, 180, 0.03)');
        galaxyGlow.addColorStop(0.3, 'rgba(200, 180, 255, 0.02)');
        galaxyGlow.addColorStop(0.6, 'rgba(150, 150, 255, 0.01)');
        galaxyGlow.addColorStop(1, 'rgba(100, 100, 200, 0)');
        
        this.ctx.fillStyle = galaxyGlow;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        allObjects.forEach(star => {
            // Differential rotation - inner stars rotate faster
            const rotationSpeed = this.rotationFactor / (1 + star.radius / this.galaxyRadius * 2);
            const rotation = this.time * rotationSpeed;
            
            const x = this.centerX + Math.cos(star.angle + rotation) * star.radius;
            const y = this.centerY + Math.sin(star.angle + rotation) * star.radius;
            
            // Foreshortening based on z position
            const perspective = 1 - Math.abs(star.z) / 100;
            const adjustedY = y + star.z * perspective * 0.3;
            
            // Twinkle effect
            const twinkle = 0.7 + Math.sin(star.twinkle) * 0.3;
            const brightness = star.brightness * twinkle * perspective;
            
            // Draw star
            this.ctx.globalAlpha = brightness;
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(x, adjustedY, star.size * perspective, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow for bright stars
            if (star.size > 1 && brightness > 0.5) {
                const gradient = this.ctx.createRadialGradient(x, adjustedY, 0, x, adjustedY, star.size * 3);
                gradient.addColorStop(0, `${star.color}88`);
                gradient.addColorStop(1, `${star.color}00`);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - star.size * 3, adjustedY - star.size * 3, star.size * 6, star.size * 6);
            }
        });
        
        this.ctx.globalAlpha = 1;
        
        // Draw bright galactic core
        const coreGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.coreRadius
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 230, 0.3)');
        coreGradient.addColorStop(0.2, 'rgba(255, 245, 200, 0.1)');
        coreGradient.addColorStop(0.5, 'rgba(255, 230, 180, 0.05)');
        coreGradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.coreRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}