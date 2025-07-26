import Animation from '../../core/Animation.js';

export default class BreathingCircleAnimation extends Animation {
    constructor() {
        super();
        this.breathPhase = 'inhale'; // 'inhale', 'hold', 'exhale'
        this.phaseProgress = 0;
        this.totalCycleTime = 0;
        
        // 4-7-8 breathing pattern timings (in seconds)
        this.timings = {
            inhale: 4,
            hold: 7,
            exhale: 8
        };
        
        // Visual parameters
        this.centerX = 0;
        this.centerY = 0;
        this.baseRadius = 60;
        this.maxRadius = 180;
        this.currentRadius = this.baseRadius;
        
        // Concentric circles for depth
        this.circles = [
            { radiusMultiplier: 1, opacity: 0.8 },
            { radiusMultiplier: 1.3, opacity: 0.5 },
            { radiusMultiplier: 1.6, opacity: 0.3 },
            { radiusMultiplier: 2.0, opacity: 0.15 }
        ];
        
        // Color gradients for each phase
        this.phaseColors = {
            inhale: {
                start: { r: 100, g: 149, b: 237 }, // Soft blue
                end: { r: 147, g: 112, b: 219 }    // Lavender
            },
            hold: {
                start: { r: 147, g: 112, b: 219 }, // Lavender
                end: { r: 180, g: 140, b: 255 }    // Light purple
            },
            exhale: {
                start: { r: 180, g: 140, b: 255 }, // Light purple
                end: { r: 100, g: 149, b: 237 }    // Back to soft blue
            }
        };
        
        // Text prompts
        this.prompts = {
            inhale: 'Breathe In',
            hold: 'Hold',
            exhale: 'Breathe Out'
        };
        
        // Animation timing
        this.lastTime = performance.now();
        this.particleAngle = 0;
    }

    get metadata() {
        return {
            title: 'Breathing Circle',
            description: 'Visual breathing guide for relaxation and mindfulness',
            author: 'Sistema',
            date: '2025-07-26'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.updateRadius();
    }

    resize() {
        super.resize();
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.updateRadius();
    }

    updateRadius() {
        // Adjust base and max radius based on canvas size
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.baseRadius = minDimension * 0.15;
        this.maxRadius = minDimension * 0.35;
    }

    update() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Update phase progress
        const phaseDuration = this.timings[this.breathPhase];
        this.phaseProgress += deltaTime / phaseDuration;
        
        // Update particle rotation
        this.particleAngle += deltaTime * 0.5;
        
        // Check for phase transition
        if (this.phaseProgress >= 1) {
            this.phaseProgress = 0;
            this.transitionToNextPhase();
        }
        
        // Update circle radius based on phase
        this.updateCircleRadius();
        
        // Update total cycle time
        this.totalCycleTime += deltaTime;
    }

    transitionToNextPhase() {
        switch (this.breathPhase) {
            case 'inhale':
                this.breathPhase = 'hold';
                break;
            case 'hold':
                this.breathPhase = 'exhale';
                break;
            case 'exhale':
                this.breathPhase = 'inhale';
                break;
        }
    }

    updateCircleRadius() {
        switch (this.breathPhase) {
            case 'inhale':
                // Smooth expansion using easeInOutQuad
                const inhaleProgress = this.easeInOutQuad(this.phaseProgress);
                this.currentRadius = this.baseRadius + (this.maxRadius - this.baseRadius) * inhaleProgress;
                break;
                
            case 'hold':
                // Keep at maximum radius
                this.currentRadius = this.maxRadius;
                break;
                
            case 'exhale':
                // Smooth contraction using easeInOutQuad
                const exhaleProgress = this.easeInOutQuad(this.phaseProgress);
                this.currentRadius = this.maxRadius - (this.maxRadius - this.baseRadius) * exhaleProgress;
                break;
        }
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    draw() {
        // Clear canvas with soft dark background
        const bgGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height)
        );
        bgGradient.addColorStop(0, 'rgb(15, 15, 30)');
        bgGradient.addColorStop(1, 'rgb(10, 10, 20)');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw subtle particle effects
        this.drawParticles();
        
        // Draw concentric circles with gradients
        this.drawConcentricCircles();
        
        // Draw main breathing circle
        this.drawMainCircle();
        
        // Draw breathing guide text
        this.drawBreathingText();
        
        // Draw progress indicator
        this.drawProgressIndicator();
    }

    drawParticles() {
        const particleCount = 12;
        const particleRadius = 3;
        const orbitRadius = this.currentRadius + 40;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + this.particleAngle;
            const x = this.centerX + Math.cos(angle) * orbitRadius;
            const y = this.centerY + Math.sin(angle) * orbitRadius;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particleRadius);
            gradient.addColorStop(0, 'rgba(200, 200, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, particleRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    drawConcentricCircles() {
        const colors = this.phaseColors[this.breathPhase];
        
        // Draw circles from outside to inside for proper layering
        for (let i = this.circles.length - 1; i >= 0; i--) {
            const circle = this.circles[i];
            const radius = this.currentRadius * circle.radiusMultiplier;
            
            const gradient = this.ctx.createRadialGradient(
                this.centerX, this.centerY, radius * 0.7,
                this.centerX, this.centerY, radius
            );
            
            // Interpolate colors based on phase progress
            const color = this.interpolateColor(colors.start, colors.end, this.phaseProgress);
            
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${circle.opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawMainCircle() {
        const colors = this.phaseColors[this.breathPhase];
        const color = this.interpolateColor(colors.start, colors.end, this.phaseProgress);
        
        // Main circle with gradient
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.currentRadius
        );
        
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`);
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.currentRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add subtle glow effect
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
        this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawBreathingText() {
        // Main instruction text
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText(this.prompts[this.breathPhase], this.centerX, this.centerY);
        
        // Phase duration text
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const remainingTime = Math.ceil(this.timings[this.breathPhase] * (1 - this.phaseProgress));
        this.ctx.fillText(`${remainingTime}s`, this.centerX, this.centerY + 30);
        
        // Breathing pattern reminder at the top
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillText('4-7-8 Breathing Pattern', this.centerX, 30);
    }

    drawProgressIndicator() {
        const indicatorRadius = this.maxRadius + 30;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (this.phaseProgress * Math.PI * 2);
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, indicatorRadius, startAngle, endAngle);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Phase indicators
        const phaseAngles = {
            inhale: 0,
            hold: (4 / 19) * Math.PI * 2,
            exhale: ((4 + 7) / 19) * Math.PI * 2
        };
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        Object.values(phaseAngles).forEach(angle => {
            const x = this.centerX + Math.cos(angle - Math.PI / 2) * indicatorRadius;
            const y = this.centerY + Math.sin(angle - Math.PI / 2) * indicatorRadius;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    interpolateColor(color1, color2, t) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * t),
            g: Math.round(color1.g + (color2.g - color1.g) * t),
            b: Math.round(color1.b + (color2.b - color1.b) * t)
        };
    }
}