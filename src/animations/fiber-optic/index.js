import Animation from '../../core/Animation.js';

export default class FiberOpticAnimation extends Animation {
    constructor() {
        super();
        this.fibers = [];
        this.fiberCount = 150;
        this.time = 0;
        this.windStrength = 0.3;
        this.windPhase = 0;
        
        // Color palette for fiber tips
        this.colors = [
            { r: 255, g: 100, b: 150 }, // Pink
            { r: 100, g: 255, b: 220 }, // Cyan
            { r: 255, g: 200, b: 100 }, // Golden
            { r: 150, g: 100, b: 255 }, // Purple
            { r: 100, g: 255, b: 150 }, // Green
            { r: 255, g: 150, b: 200 }, // Light pink
        ];
    }

    get metadata() {
        return {
            title: 'Fiber Optic',
            description: 'Gentle fiber optic strands with glowing tips',
            author: 'Sistema',
            date: '2025-07-26'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.createFibers();
    }

    createFibers() {
        this.fibers = [];
        const centerX = this.canvas.width / 2;
        const bottomY = this.canvas.height;
        const spreadRadius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        for (let i = 0; i < this.fiberCount; i++) {
            const angle = (Math.PI * 2 * i) / this.fiberCount + Math.random() * 0.1;
            const distance = Math.random() * spreadRadius;
            const baseX = centerX + Math.cos(angle) * distance;
            
            // Height variation for more natural look
            const heightVariation = 0.4 + Math.random() * 0.4; // 40% to 80% of canvas height
            const fiberHeight = this.canvas.height * heightVariation;
            
            const fiber = {
                baseX: baseX,
                baseY: bottomY,
                segments: [],
                segmentCount: 15,
                length: fiberHeight,
                stiffness: 0.95 + Math.random() * 0.04,
                thickness: 1 + Math.random() * 2,
                swayAmount: 0.5 + Math.random() * 1.5,
                swaySpeed: 0.5 + Math.random() * 0.5,
                swayPhase: Math.random() * Math.PI * 2,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                colorPhase: Math.random() * Math.PI * 2,
                colorSpeed: 0.5 + Math.random() * 1,
                glowIntensity: 0.7 + Math.random() * 0.3
            };
            
            // Initialize segments
            const segmentLength = fiber.length / fiber.segmentCount;
            for (let j = 0; j <= fiber.segmentCount; j++) {
                fiber.segments.push({
                    x: baseX,
                    y: bottomY - j * segmentLength,
                    vx: 0,
                    vy: 0
                });
            }
            
            this.fibers.push(fiber);
        }
    }

    resize() {
        super.resize();
        // Recreate fibers to adapt to new canvas size
        this.createFibers();
    }

    update() {
        this.time += 0.01;
        this.windPhase += 0.02;
        
        // Varying wind strength
        this.windStrength = 0.2 + Math.sin(this.windPhase) * 0.1 + Math.sin(this.windPhase * 3) * 0.05;
        
        this.fibers.forEach(fiber => {
            // Update color phase for smooth color transitions
            fiber.colorPhase += fiber.colorSpeed * 0.01;
            
            // Apply physics to each segment
            for (let i = 1; i <= fiber.segmentCount; i++) {
                const segment = fiber.segments[i];
                const prevSegment = fiber.segments[i - 1];
                
                // Calculate target position based on previous segment
                const angle = Math.atan2(segment.y - prevSegment.y, segment.x - prevSegment.x);
                const segmentLength = fiber.length / fiber.segmentCount;
                const targetX = prevSegment.x + Math.cos(angle) * segmentLength;
                const targetY = prevSegment.y + Math.sin(angle) * segmentLength;
                
                // Apply wind force - stronger at the top
                const heightFactor = i / fiber.segmentCount;
                const windForce = Math.sin(this.time * fiber.swaySpeed + fiber.swayPhase) * 
                                 this.windStrength * fiber.swayAmount * heightFactor;
                
                // Add some turbulence
                const turbulence = Math.sin(this.time * 3 + i * 0.5) * 0.1 * heightFactor;
                
                // Update velocity with spring physics
                segment.vx += (targetX - segment.x) * (1 - fiber.stiffness);
                segment.vx += windForce + turbulence;
                segment.vy += (targetY - segment.y) * (1 - fiber.stiffness);
                
                // Apply damping
                segment.vx *= 0.9;
                segment.vy *= 0.9;
                
                // Update position
                segment.x += segment.vx;
                segment.y += segment.vy;
                
                // Constrain to proper length from previous segment
                const dx = segment.x - prevSegment.x;
                const dy = segment.y - prevSegment.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    const scale = segmentLength / distance;
                    segment.x = prevSegment.x + dx * scale;
                    segment.y = prevSegment.y + dy * scale;
                }
            }
        });
    }

    draw() {
        // Dark background
        this.ctx.fillStyle = 'rgb(5, 5, 15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fibers
        this.fibers.forEach(fiber => {
            // Calculate current color with smooth transition
            const colorPhase = fiber.colorPhase;
            const color1Index = Math.floor(colorPhase / (Math.PI * 2) * this.colors.length) % this.colors.length;
            const color2Index = (color1Index + 1) % this.colors.length;
            const blend = (colorPhase % (Math.PI * 2 / this.colors.length)) / (Math.PI * 2 / this.colors.length);
            
            const color1 = this.colors[color1Index];
            const color2 = this.colors[color2Index];
            
            // Interpolate colors
            const r = color1.r + (color2.r - color1.r) * blend;
            const g = color1.g + (color2.g - color1.g) * blend;
            const b = color1.b + (color2.b - color1.b) * blend;
            
            // Draw fiber strand
            this.ctx.beginPath();
            this.ctx.moveTo(fiber.segments[0].x, fiber.segments[0].y);
            
            for (let i = 1; i <= fiber.segmentCount; i++) {
                const segment = fiber.segments[i];
                const prevSegment = fiber.segments[i - 1];
                
                // Use quadratic curves for smooth lines
                const cpx = (segment.x + prevSegment.x) / 2;
                const cpy = (segment.y + prevSegment.y) / 2;
                this.ctx.quadraticCurveTo(prevSegment.x, prevSegment.y, cpx, cpy);
            }
            
            // Draw the fiber strand with gradient
            const topSegment = fiber.segments[fiber.segmentCount];
            const gradient = this.ctx.createLinearGradient(
                fiber.baseX, fiber.baseY,
                topSegment.x, topSegment.y
            );
            gradient.addColorStop(0, 'rgba(20, 20, 30, 0.5)');
            gradient.addColorStop(0.7, `rgba(${r * 0.3}, ${g * 0.3}, ${b * 0.3}, 0.3)`);
            gradient.addColorStop(1, `rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, 0.8)`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = fiber.thickness;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
            // Draw glowing tip
            const tipSegment = fiber.segments[fiber.segmentCount];
            const glowSize = 8 + Math.sin(this.time * 2 + fiber.swayPhase) * 2;
            
            // Multiple glow layers for better effect
            for (let i = 3; i > 0; i--) {
                const size = glowSize * i;
                const alpha = fiber.glowIntensity / (i * 1.5);
                
                const glowGradient = this.ctx.createRadialGradient(
                    tipSegment.x, tipSegment.y, 0,
                    tipSegment.x, tipSegment.y, size
                );
                glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
                glowGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
                glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(tipSegment.x, tipSegment.y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Bright center dot
            this.ctx.fillStyle = `rgba(255, 255, 255, ${fiber.glowIntensity})`;
            this.ctx.beginPath();
            this.ctx.arc(tipSegment.x, tipSegment.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Add subtle overall glow effect
        this.ctx.globalCompositeOperation = 'screen';
        const centerGlow = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height,
            0,
            this.canvas.width / 2, this.canvas.height,
            this.canvas.height * 0.8
        );
        centerGlow.addColorStop(0, 'rgba(50, 50, 100, 0.1)');
        centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = centerGlow;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.globalCompositeOperation = 'source-over';
    }
}