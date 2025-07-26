import Animation from '../../core/Animation.js';

export default class KaleidoscopeAnimation extends Animation {
    constructor() {
        super();
        this.time = 0;
        this.segments = 8; // 8-fold symmetry for complexity yet predictability
        this.segmentAngle = (Math.PI * 2) / this.segments;
        this.shapes = [];
        this.maxShapes = 5;
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        
        // Soft pastel colors for therapeutic effect
        this.pastelColors = [
            { r: 255, g: 182, b: 193 }, // Light pink
            { r: 230, g: 230, b: 250 }, // Lavender
            { r: 176, g: 224, b: 230 }, // Powder blue
            { r: 152, g: 251, b: 152 }, // Pale green
            { r: 255, g: 218, b: 185 }, // Peach
            { r: 221, g: 160, b: 221 }, // Plum
            { r: 255, g: 250, b: 205 }, // Lemon chiffon
            { r: 175, g: 238, b: 238 }  // Pale turquoise
        ];
        
        this.colorPhase = 0;
        this.colorTransitionSpeed = 0.0005; // Very slow color transitions
    }

    get metadata() {
        return {
            title: 'Kaleidoscope',
            description: 'Mesmerizing symmetrical patterns in constant transformation',
            author: 'Sistema',
            date: '2025-07-26'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.updateCenter();
        this.initializeShapes();
    }

    updateCenter() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) * 0.9;
    }

    resize() {
        super.resize();
        this.updateCenter();
    }

    initializeShapes() {
        this.shapes = [];
        for (let i = 0; i < this.maxShapes; i++) {
            this.shapes.push({
                // Position in polar coordinates for smoother rotation
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * this.radius * 0.7,
                size: 20 + Math.random() * 40,
                rotationSpeed: 0.001 + Math.random() * 0.002, // Very slow rotation
                orbitSpeed: 0.0005 + Math.random() * 0.001, // Gentle orbital movement
                phase: Math.random() * Math.PI * 2,
                shapeType: Math.floor(Math.random() * 3), // 0: circle, 1: triangle, 2: hexagon
                colorIndex: Math.floor(Math.random() * this.pastelColors.length),
                opacity: 0.3 + Math.random() * 0.4,
                pulseSpeed: 0.002 + Math.random() * 0.003,
                pulseAmount: 0.1 + Math.random() * 0.1
            });
        }
    }

    update() {
        this.time += 0.01;
        this.colorPhase += this.colorTransitionSpeed;

        // Update shapes with gentle, predictable movements
        this.shapes.forEach((shape, index) => {
            // Slow orbital movement
            shape.angle += shape.orbitSpeed;
            
            // Gentle distance pulsing for fractal-like effect
            const pulseFactor = 1 + Math.sin(this.time * shape.pulseSpeed + shape.phase) * shape.pulseAmount;
            shape.currentDistance = shape.distance * pulseFactor;
            
            // Slow size breathing
            shape.currentSize = shape.size * (1 + Math.sin(this.time * 0.001 + index) * 0.1);
            
            // Update rotation
            shape.rotation = (shape.rotation || 0) + shape.rotationSpeed;
        });
    }

    drawShape(ctx, shape, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(shape.rotation || 0);
        
        const size = shape.currentSize || shape.size;
        
        switch (shape.shapeType) {
            case 0: // Circle with gradient
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                const color = this.getInterpolatedColor(shape.colorIndex);
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${shape.opacity})`);
                gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${shape.opacity * 0.5})`);
                gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 1: // Soft triangle
                this.drawSoftPolygon(ctx, 3, size, shape);
                break;
                
            case 2: // Soft hexagon
                this.drawSoftPolygon(ctx, 6, size, shape);
                break;
        }
        
        ctx.restore();
    }

    drawSoftPolygon(ctx, sides, size, shape) {
        const color = this.getInterpolatedColor(shape.colorIndex);
        
        // Draw multiple layers for soft effect
        for (let layer = 0; layer < 3; layer++) {
            const layerSize = size * (1 + layer * 0.2);
            const layerOpacity = shape.opacity * (1 - layer * 0.3);
            
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity})`;
            ctx.beginPath();
            
            for (let i = 0; i <= sides; i++) {
                const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * layerSize;
                const y = Math.sin(angle) * layerSize;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.fill();
        }
    }

    getInterpolatedColor(baseIndex) {
        // Smooth color interpolation between adjacent colors
        const t = (Math.sin(this.colorPhase) + 1) / 2; // Normalize to 0-1
        const color1 = this.pastelColors[baseIndex];
        const color2 = this.pastelColors[(baseIndex + 1) % this.pastelColors.length];
        
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * t),
            g: Math.round(color1.g + (color2.g - color1.g) * t),
            b: Math.round(color1.b + (color2.b - color1.b) * t)
        };
    }

    draw() {
        // Gentle gradient background
        const bgGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.radius
        );
        bgGradient.addColorStop(0, 'rgb(250, 250, 255)'); // Very light blue-white
        bgGradient.addColorStop(1, 'rgb(240, 240, 250)'); // Soft lavender-white
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create clipping mask for circular kaleidoscope
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.clip();
        
        // Draw kaleidoscope segments
        for (let segment = 0; segment < this.segments; segment++) {
            this.ctx.save();
            this.ctx.translate(this.centerX, this.centerY);
            this.ctx.rotate(segment * this.segmentAngle);
            
            // Alternate mirroring for each segment
            if (segment % 2 === 1) {
                this.ctx.scale(-1, 1);
            }
            
            // Create triangular clipping path for this segment
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(this.radius * Math.cos(-this.segmentAngle / 2), this.radius * Math.sin(-this.segmentAngle / 2));
            this.ctx.lineTo(this.radius * Math.cos(this.segmentAngle / 2), this.radius * Math.sin(this.segmentAngle / 2));
            this.ctx.closePath();
            this.ctx.clip();
            
            // Draw shapes in this segment
            this.shapes.forEach(shape => {
                const x = Math.cos(shape.angle) * (shape.currentDistance || shape.distance);
                const y = Math.sin(shape.angle) * (shape.currentDistance || shape.distance);
                
                this.drawShape(this.ctx, shape, x, y);
                
                // Draw recursive smaller versions for fractal effect
                for (let i = 1; i <= 2; i++) {
                    const scaleFactor = 1 / (i + 1);
                    const smallerShape = {
                        ...shape,
                        currentSize: (shape.currentSize || shape.size) * scaleFactor,
                        opacity: shape.opacity * scaleFactor
                    };
                    this.drawShape(this.ctx, smallerShape, x * scaleFactor * 2, y * scaleFactor * 2);
                }
            });
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
        
        // Add subtle center ornament
        const centerGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 30
        );
        centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        centerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Soft vignette effect
        const vignette = this.ctx.createRadialGradient(
            this.centerX, this.centerY, this.radius * 0.7,
            this.centerX, this.centerY, this.radius
        );
        vignette.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vignette.addColorStop(1, 'rgba(240, 240, 250, 0.3)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}