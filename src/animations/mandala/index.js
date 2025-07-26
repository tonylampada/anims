import Animation from '../../core/Animation.js';

export default class MandalaAnimation extends Animation {
    constructor() {
        super();
        this.time = 0;
        this.layers = [];
        this.centerX = 0;
        this.centerY = 0;
        this.baseRadius = 0;
        
        // Soft pastel colors
        this.colors = [
            '#FFB6C1', // Light Pink
            '#E6E6FA', // Lavender
            '#98FB98', // Mint
            '#FFDAB9', // Peach
            '#F0E68C', // Khaki
            '#DDA0DD', // Plum
            '#B0E0E6', // Powder Blue
            '#FFE4E1'  // Misty Rose
        ];
        
        this.initializeLayers();
    }

    get metadata() {
        return {
            title: 'Mandala',
            description: 'Hypnotic circular patterns in harmonious motion',
            author: 'Sistema',
            date: '2025-07-26'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.updateCenter();
    }

    resize() {
        super.resize();
        this.updateCenter();
    }

    updateCenter() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.4;
    }

    initializeLayers() {
        // Create multiple layers with different properties
        this.layers = [
            {
                petals: 8,
                rotationSpeed: 0.01,
                pulseSpeed: 0.02,
                pulseAmount: 0.1,
                radiusRatio: 0.3,
                colorIndex: 0,
                phase: 0
            },
            {
                petals: 12,
                rotationSpeed: -0.008,
                pulseSpeed: 0.015,
                pulseAmount: 0.15,
                radiusRatio: 0.5,
                colorIndex: 1,
                phase: Math.PI / 6
            },
            {
                petals: 16,
                rotationSpeed: 0.006,
                pulseSpeed: 0.025,
                pulseAmount: 0.08,
                radiusRatio: 0.7,
                colorIndex: 2,
                phase: Math.PI / 8
            },
            {
                petals: 24,
                rotationSpeed: -0.004,
                pulseSpeed: 0.018,
                pulseAmount: 0.12,
                radiusRatio: 0.9,
                colorIndex: 3,
                phase: Math.PI / 12
            },
            {
                petals: 6,
                rotationSpeed: 0.012,
                pulseSpeed: 0.03,
                pulseAmount: 0.2,
                radiusRatio: 0.2,
                colorIndex: 4,
                phase: 0
            }
        ];
    }

    update() {
        this.time += 0.01;
    }

    draw() {
        // Create fade effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw each layer from outer to inner
        const sortedLayers = [...this.layers].sort((a, b) => b.radiusRatio - a.radiusRatio);
        
        sortedLayers.forEach((layer, index) => {
            this.drawLayer(layer, index);
        });
        
        // Draw center circle
        this.drawCenterCircle();
    }

    drawLayer(layer, index) {
        const rotation = this.time * layer.rotationSpeed + layer.phase;
        const pulse = 1 + Math.sin(this.time * layer.pulseSpeed) * layer.pulseAmount;
        const radius = this.baseRadius * layer.radiusRatio * pulse;
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(rotation);
        
        // Draw petals
        for (let i = 0; i < layer.petals; i++) {
            const angle = (Math.PI * 2 / layer.petals) * i;
            this.drawPetal(angle, radius, layer, index);
        }
        
        // Draw connecting circles
        for (let i = 0; i < layer.petals; i++) {
            const angle = (Math.PI * 2 / layer.petals) * i;
            this.drawConnectingCircle(angle, radius, layer);
        }
        
        this.ctx.restore();
    }

    drawPetal(angle, radius, layer, layerIndex) {
        const petalSize = radius * 0.3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle + Math.PI / 2);
        
        // Create gradient for petal
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, petalSize);
        const color = this.colors[(layer.colorIndex + layerIndex) % this.colors.length];
        gradient.addColorStop(0, this.hexToRgba(color, 0.8));
        gradient.addColorStop(0.5, this.hexToRgba(color, 0.4));
        gradient.addColorStop(1, this.hexToRgba(color, 0.1));
        
        // Draw petal shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        
        // Create curved petal shape
        const controlX = petalSize * 0.6;
        const controlY = petalSize * 0.8;
        
        this.ctx.bezierCurveTo(
            -controlX, -controlY,
            -controlX, controlY,
            0, petalSize
        );
        
        this.ctx.bezierCurveTo(
            controlX, controlY,
            controlX, -controlY,
            0, 0
        );
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add decorative line
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, petalSize * 0.7);
        this.ctx.strokeStyle = this.hexToRgba(color, 0.3);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawConnectingCircle(angle, radius, layer) {
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const circleRadius = radius * 0.05;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
        
        const color = this.colors[layer.colorIndex % this.colors.length];
        this.ctx.fillStyle = this.hexToRgba(color, 0.6);
        this.ctx.fill();
        
        // Add glow effect
        const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, circleRadius * 2);
        glowGradient.addColorStop(0, this.hexToRgba(color, 0.3));
        glowGradient.addColorStop(1, this.hexToRgba(color, 0));
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, circleRadius * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();
    }

    drawCenterCircle() {
        const pulse = 1 + Math.sin(this.time * 0.04) * 0.1;
        const centerRadius = this.baseRadius * 0.08 * pulse;
        
        // Create radial gradient for center
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, centerRadius
        );
        
        gradient.addColorStop(0, this.hexToRgba('#FFFFFF', 0.9));
        gradient.addColorStop(0.5, this.hexToRgba('#FFB6C1', 0.6));
        gradient.addColorStop(1, this.hexToRgba('#E6E6FA', 0.3));
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, centerRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add inner ring
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, centerRadius * 0.7, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.hexToRgba('#DDA0DD', 0.5);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add outer glow
        const glowGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, centerRadius,
            this.centerX, this.centerY, centerRadius * 2
        );
        glowGradient.addColorStop(0, this.hexToRgba('#FFFFFF', 0.2));
        glowGradient.addColorStop(1, this.hexToRgba('#FFFFFF', 0));
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, centerRadius * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}