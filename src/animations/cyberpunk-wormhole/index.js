import Animation from '../../core/Animation.js';

export default class CyberpunkWormhole extends Animation {
    constructor(canvas) {
        super(canvas);
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.time = 0;
        
        // Wormhole parameters
        this.segments = 32; // Number of rings
        this.sides = 24; // Sides per ring
        this.segmentDepth = 15; // Depth between segments
        this.maxRadius = Math.min(this.width, this.height) * 0.45;
        
        // Color palette - cyberpunk blues, purples, and greens
        this.colors = [
            '#00ffff', // Cyan
            '#ff00ff', // Magenta
            '#00ff00', // Neon green
            '#8a2be2', // Blue violet
            '#4169e1', // Royal blue
            '#9370db', // Medium purple
            '#32cd32', // Lime green
            '#1e90ff', // Dodger blue
        ];
        
        // Grid lines for cyberpunk effect
        this.gridLines = [];
        this.generateGridLines();
    }
    
    generateGridLines() {
        // Generate radial grid lines that will travel through the wormhole
        for (let i = 0; i < 12; i++) {
            this.gridLines.push({
                angle: (Math.PI * 2 * i) / 12,
                offset: Math.random() * this.segmentDepth,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime * 0.001;
        
        // Update grid lines
        this.gridLines.forEach(line => {
            line.offset += line.speed;
            if (line.offset > this.segmentDepth) {
                line.offset = 0;
            }
        });
    }
    
    draw(ctx) {
        // Clear with dark background for trailing effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // On first frame, ensure we have a clean black background
        if (this.time < 0.1) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        
        // Draw wormhole segments from back to front
        for (let seg = this.segments; seg >= 0; seg--) {
            const segmentRatio = seg / this.segments;
            const z = seg * this.segmentDepth;
            const perspective = 300 / (300 + z);
            const radius = this.maxRadius * perspective;
            
            // Oscillating distortion for organic feel
            const distortion = Math.sin(this.time * 2 + seg * 0.3) * 0.1;
            
            // Draw the ring
            ctx.beginPath();
            for (let i = 0; i <= this.sides; i++) {
                const angle = (Math.PI * 2 * i) / this.sides + this.time * 0.5;
                const wobble = Math.sin(angle * 3 + this.time * 3 + seg * 0.2) * radius * distortion;
                const x = Math.cos(angle) * (radius + wobble);
                const y = Math.sin(angle) * (radius + wobble);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            // Color based on depth with gradient effect
            const colorIndex = Math.floor((seg / this.segments) * this.colors.length + this.time) % this.colors.length;
            const color = this.colors[colorIndex];
            const alpha = perspective;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 3 * perspective;
            ctx.globalAlpha = alpha;
            
            // Add glow effect
            ctx.shadowBlur = 30 * perspective;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        // Draw grid lines through the wormhole
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        this.gridLines.forEach(line => {
            ctx.beginPath();
            
            for (let seg = 0; seg <= this.segments; seg++) {
                const z = seg * this.segmentDepth - line.offset;
                if (z < 0) continue;
                
                const perspective = 300 / (300 + z);
                const radius = this.maxRadius * perspective * 0.9;
                
                const x = Math.cos(line.angle) * radius;
                const y = Math.sin(line.angle) * radius;
                
                if (seg === 0 || z < 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        });
        
        // Draw entrance glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.maxRadius);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Add some particles for extra effect
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            const particleTime = (this.time * 2 + i * 0.7) % 1;
            const z = particleTime * this.segments * this.segmentDepth;
            const perspective = 300 / (300 + z);
            const angle = i * Math.PI * 2 / particleCount + this.time;
            const radius = this.maxRadius * perspective * (0.2 + particleTime * 0.6);
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, 3 * perspective, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${1 - particleTime})`;
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    get metadata() {
        return {
            title: 'Cyberpunk Wormhole',
            description: 'Travel through a futuristic wormhole with neon blue, purple, and green colors'
        };
    }
}