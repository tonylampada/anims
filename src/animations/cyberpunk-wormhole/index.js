import Animation from '../../core/Animation.js';

export default class CyberpunkWormhole extends Animation {
    constructor() {
        super();
        this.time = 0;
        this.speed = 0.02;
        
        // Tunnel structure
        this.tunnelSegments = [];
        this.segmentCount = 50;
        this.segmentSpacing = 20;
        this.tunnelRadius = 200;
        
        // Colors for cyberpunk theme
        this.colors = [
            '#00ffff', // Cyan
            '#ff00ff', // Magenta
            '#00ff00', // Neon green
            '#8a2be2', // Blue violet
            '#4169e1', // Royal blue
            '#9370db', // Medium purple
        ];
    }
    
    init(canvas) {
        super.init(canvas);
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.tunnelRadius = Math.min(this.canvas.width, this.canvas.height) * 0.25;
        this.generateTunnel();
    }
    
    resize() {
        super.resize();
        if (this.canvas) {
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
            this.tunnelRadius = Math.min(this.canvas.width, this.canvas.height) * 0.25;
        }
    }
    
    generateTunnel() {
        this.tunnelSegments = [];
        for (let i = 0; i < this.segmentCount; i++) {
            this.tunnelSegments.push({
                z: i * this.segmentSpacing,
                rotation: Math.random() * Math.PI * 2,
                colorIndex: Math.floor(Math.random() * this.colors.length)
            });
        }
    }
    
    update() {
        this.time += this.speed;
        
        // Move segments towards viewer
        this.tunnelSegments.forEach(segment => {
            segment.z -= this.speed * 100;
            
            // Reset segment when it passes the viewer (much closer now)
            if (segment.z < -500) {
                segment.z = (this.segmentCount - 1) * this.segmentSpacing;
                segment.rotation = Math.random() * Math.PI * 2;
                segment.colorIndex = Math.floor(Math.random() * this.colors.length);
            }
        });
        
        // Sort segments by z distance for proper rendering
        this.tunnelSegments.sort((a, b) => b.z - a.z);
    }
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const ctx = this.ctx;
        
        // Clear canvas with black
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        
        // Draw tunnel segments from back to front
        this.tunnelSegments.forEach(segment => {
            const perspective = 400 / (400 + segment.z);
            const radius = this.tunnelRadius * perspective;
            
            // Skip segments too far away
            if (perspective <= 0) return;
            
            // Don't draw if segment is too large (off screen)
            if (radius > Math.max(this.canvas.width, this.canvas.height)) return;
            
            // Number of sides for the tunnel (octagon)
            const sides = 8;
            
            // Draw the tunnel segment
            ctx.beginPath();
            
            for (let i = 0; i <= sides; i++) {
                const angle = (i / sides) * Math.PI * 2 + segment.rotation + this.time * 0.5;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            // Set color with transparency based on distance
            const color = this.colors[segment.colorIndex];
            ctx.strokeStyle = color;
            ctx.lineWidth = 3 * perspective;
            ctx.globalAlpha = perspective * 0.8;
            
            // Add glow effect
            ctx.shadowBlur = 20 * perspective;
            ctx.shadowColor = color;
            ctx.stroke();
            
            // Draw connecting lines to next segment for tunnel walls
            const nextSegmentIndex = this.tunnelSegments.findIndex(s => s.z > segment.z);
            if (nextSegmentIndex !== -1) {
                const nextSegment = this.tunnelSegments[nextSegmentIndex];
                const nextPerspective = 400 / (400 + nextSegment.z);
                const nextRadius = this.tunnelRadius * nextPerspective;
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 1 * perspective;
                ctx.globalAlpha = perspective * 0.3;
                
                // Draw lines connecting the segments
                for (let i = 0; i < sides; i++) {
                    const angle1 = (i / sides) * Math.PI * 2 + segment.rotation + this.time * 0.5;
                    const angle2 = (i / sides) * Math.PI * 2 + nextSegment.rotation + this.time * 0.5;
                    
                    const x1 = Math.cos(angle1) * radius;
                    const y1 = Math.sin(angle1) * radius;
                    const x2 = Math.cos(angle2) * nextRadius;
                    const y2 = Math.sin(angle2) * nextRadius;
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        });
        
        // Draw center vortex effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.tunnelRadius * 0.5);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width, this.canvas.height);
        
        // Add motion blur effect
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'black';
        ctx.fillRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width, this.canvas.height);
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    get metadata() {
        return {
            title: 'Cyberpunk Wormhole',
            description: 'Travel through a futuristic wormhole with neon blue, purple, and green colors'
        };
    }
}