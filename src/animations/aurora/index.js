import Animation from '../../core/Animation.js';

export default class AuroraAnimation extends Animation {
    constructor() {
        super();
        this.time = 0;
        this.auroras = [];
        this.stars = [];
        
        // Aurora configurations
        this.auroraConfigs = [
            {
                baseY: 0.2,
                amplitude: 80,
                frequency: 0.003,
                speed: 0.15,
                thickness: 120,
                colors: [
                    { r: 0, g: 255, b: 100, opacity: 0.15 },
                    { r: 0, g: 200, b: 150, opacity: 0.2 },
                    { r: 50, g: 255, b: 200, opacity: 0.1 }
                ]
            },
            {
                baseY: 0.35,
                amplitude: 60,
                frequency: 0.004,
                speed: 0.2,
                thickness: 100,
                colors: [
                    { r: 100, g: 100, b: 255, opacity: 0.12 },
                    { r: 150, g: 50, b: 255, opacity: 0.15 },
                    { r: 200, g: 100, b: 255, opacity: 0.08 }
                ]
            },
            {
                baseY: 0.15,
                amplitude: 100,
                frequency: 0.002,
                speed: 0.1,
                thickness: 150,
                colors: [
                    { r: 0, g: 255, b: 150, opacity: 0.1 },
                    { r: 100, g: 255, b: 100, opacity: 0.12 },
                    { r: 50, g: 200, b: 255, opacity: 0.08 }
                ]
            }
        ];
    }

    get metadata() {
        return {
            title: 'Aurora',
            description: 'Dancing northern lights across the night sky',
            author: 'Sistema',
            date: '2025-07-26'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.createStars();
        this.createAuroras();
    }

    createStars() {
        const numStars = Math.floor(this.canvas.width * this.canvas.height / 5000);
        this.stars = [];
        
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    createAuroras() {
        this.auroras = this.auroraConfigs.map(config => ({
            ...config,
            phase: Math.random() * Math.PI * 2,
            ribbons: config.colors.map((color, index) => ({
                color,
                phaseOffset: index * 0.3,
                amplitudeModifier: 1 - (index * 0.2),
                thicknessModifier: 1 - (index * 0.1)
            }))
        }));
    }

    resize() {
        super.resize();
        this.createStars();
    }

    update() {
        this.time += 0.016;

        // Update star twinkle
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
        });

        // Update aurora waves
        this.auroras.forEach(aurora => {
            aurora.currentPhase = aurora.phase + this.time * aurora.speed;
        });
    }

    drawStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            const brightness = star.brightness * twinkle;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
            this.ctx.fill();
            
            // Add glow for brighter stars
            if (star.size > 1) {
                const gradient = this.ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, star.size * 3
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.3})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(
                    star.x - star.size * 3,
                    star.y - star.size * 3,
                    star.size * 6,
                    star.size * 6
                );
            }
        });
    }

    drawAurora(aurora) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const segments = Math.floor(width / 10) + 1;

        aurora.ribbons.forEach((ribbon, ribbonIndex) => {
            const { color, phaseOffset, amplitudeModifier, thicknessModifier } = ribbon;
            
            // Create gradient for this ribbon
            const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            gradient.addColorStop(0.1, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity * 0.5})`);
            gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity})`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity * 0.8})`);
            gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

            // Draw the aurora ribbon
            this.ctx.beginPath();
            
            for (let i = 0; i <= segments; i++) {
                const x = (i / segments) * width;
                const baseY = height * aurora.baseY;
                
                // Multiple wave functions for natural movement
                const wave1 = Math.sin(x * aurora.frequency + aurora.currentPhase + phaseOffset) * aurora.amplitude * amplitudeModifier;
                const wave2 = Math.sin(x * aurora.frequency * 1.7 + aurora.currentPhase * 0.7 + phaseOffset + Math.PI/3) * aurora.amplitude * 0.3 * amplitudeModifier;
                const wave3 = Math.sin(x * aurora.frequency * 0.5 + aurora.currentPhase * 1.3 + phaseOffset - Math.PI/4) * aurora.amplitude * 0.2 * amplitudeModifier;
                
                const y = baseY + wave1 + wave2 + wave3;
                
                // Vary thickness along the ribbon
                const thicknessVariation = Math.sin(x * aurora.frequency * 2 + aurora.currentPhase) * 0.3 + 0.7;
                const thickness = aurora.thickness * thicknessModifier * thicknessVariation;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y - thickness / 2);
                } else {
                    const prevX = ((i - 1) / segments) * width;
                    const cpx = (prevX + x) / 2;
                    const cpy = y - thickness / 2;
                    this.ctx.quadraticCurveTo(prevX, cpy, cpx, cpy);
                }
            }
            
            // Draw back down for the thickness
            for (let i = segments; i >= 0; i--) {
                const x = (i / segments) * width;
                const baseY = height * aurora.baseY;
                
                const wave1 = Math.sin(x * aurora.frequency + aurora.currentPhase + phaseOffset) * aurora.amplitude * amplitudeModifier;
                const wave2 = Math.sin(x * aurora.frequency * 1.7 + aurora.currentPhase * 0.7 + phaseOffset + Math.PI/3) * aurora.amplitude * 0.3 * amplitudeModifier;
                const wave3 = Math.sin(x * aurora.frequency * 0.5 + aurora.currentPhase * 1.3 + phaseOffset - Math.PI/4) * aurora.amplitude * 0.2 * amplitudeModifier;
                
                const y = baseY + wave1 + wave2 + wave3;
                const thicknessVariation = Math.sin(x * aurora.frequency * 2 + aurora.currentPhase) * 0.3 + 0.7;
                const thickness = aurora.thickness * thicknessModifier * thicknessVariation;
                
                if (i === segments) {
                    this.ctx.lineTo(x, y + thickness / 2);
                } else {
                    const nextX = ((i + 1) / segments) * width;
                    const cpx = (nextX + x) / 2;
                    const cpy = y + thickness / 2;
                    this.ctx.quadraticCurveTo(nextX, cpy, cpx, cpy);
                }
            }
            
            this.ctx.closePath();
            
            // Apply gradient with composite operation for luminous effect
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Add extra glow layer
            this.ctx.filter = 'blur(20px)';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fill();
            this.ctx.filter = 'none';
            
            this.ctx.restore();
        });
    }

    draw() {
        // Dark night sky background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#000814');
        bgGradient.addColorStop(0.5, '#001d3d');
        bgGradient.addColorStop(1, '#003566');
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw auroras
        this.auroras.forEach(aurora => {
            this.drawAurora(aurora);
        });
        
        // Add subtle overall glow
        const glowGradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height * 0.3, 0,
            this.canvas.width / 2, this.canvas.height * 0.3, this.canvas.width * 0.7
        );
        glowGradient.addColorStop(0, 'rgba(100, 255, 200, 0.05)');
        glowGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.02)');
        glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}