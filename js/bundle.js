(function () {
    'use strict';

    // Sistema de Galeria
    class Gallery {
        constructor(animations) {
            this.animations = animations;
            this.currentIndex = 0;
            this.currentAnimation = null;
            this.canvas = document.getElementById('animation-canvas');
            
            this.titleEl = document.getElementById('animation-title');
            this.descriptionEl = document.getElementById('animation-description');
            this.counterEl = document.getElementById('animation-counter');
            this.prevBtn = document.getElementById('prev-btn');
            this.nextBtn = document.getElementById('next-btn');
            
            this.init();
        }
        
        init() {
            this.prevBtn.addEventListener('click', () => this.previousAnimation());
            this.nextBtn.addEventListener('click', () => this.nextAnimation());
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.previousAnimation();
                if (e.key === 'ArrowRight') this.nextAnimation();
            });
            
            this.loadAnimation(0);
        }
        
        loadAnimation(index) {
            if (this.currentAnimation) {
                this.currentAnimation.stop();
            }
            
            if (index < 0 || index >= this.animations.length) return;
            
            this.currentIndex = index;
            const AnimationClass = this.animations[index];
            
            this.currentAnimation = new AnimationClass();
            this.currentAnimation.init(this.canvas);
            
            const metadata = this.currentAnimation.metadata;
            this.titleEl.textContent = metadata.title;
            this.descriptionEl.textContent = metadata.description;
            this.counterEl.textContent = `${index + 1} / ${this.animations.length}`;
            
            this.prevBtn.disabled = index === 0;
            this.nextBtn.disabled = index === this.animations.length - 1;
            
            this.currentAnimation.start();
        }
        
        previousAnimation() {
            if (this.currentIndex > 0) {
                this.loadAnimation(this.currentIndex - 1);
            }
        }
        
        nextAnimation() {
            if (this.currentIndex < this.animations.length - 1) {
                this.loadAnimation(this.currentIndex + 1);
            }
        }
    }

    // Classe base para todas as animações
    class Animation {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.animationId = null;
            this.isRunning = false;
        }

        get metadata() {
            return {
                title: 'Animação Base',
                description: 'Descrição da animação',
                author: 'Autor',
                date: new Date().toISOString()
            };
        }

        init(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.resize();
            
            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            if (this.canvas) {
                this.canvas.width = this.canvas.offsetWidth;
                this.canvas.height = this.canvas.offsetHeight;
            }
        }

        start() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.animate();
            }
        }

        stop() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        animate() {
            if (!this.isRunning) return;
            
            this.update();
            this.draw();
            
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        update() {}
        draw() {}

        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    class ParticlesAnimation extends Animation {
        constructor() {
            super();
            this.particles = [];
            this.particleCount = 150;
            this.mouseX = 0;
            this.mouseY = 0;
        }

        get metadata() {
            return {
                title: 'Partículas Interativas',
                description: 'Partículas que reagem ao movimento do mouse',
                author: 'Sistema',
                date: '2025-07-25'
            };
        }

        init(canvas) {
            super.init(canvas);
            
            this.createParticles();
            
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            });
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    radius: Math.random() * 3 + 1,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`
                });
            }
        }

        resize() {
            super.resize();
            this.createParticles();
        }

        update() {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                const dx = this.mouseX - particle.x;
                const dy = this.mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx -= (dx / distance) * force * 0.5;
                    particle.vy -= (dy / distance) * force * 0.5;
                }
                
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                
                if (particle.x < 0 || particle.x > this.canvas.width) {
                    particle.vx = -particle.vx;
                    particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
                }
                
                if (particle.y < 0 || particle.y > this.canvas.height) {
                    particle.vy = -particle.vy;
                    particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
                }
            });
        }

        draw() {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
                
                this.particles.forEach(other => {
                    if (particle === other) return;
                    
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 80)})`;
                        this.ctx.stroke();
                    }
                });
            });
        }
    }

    class SpaceTunnelAnimation extends Animation {
        constructor() {
            super();
            this.tunnelParticles = [];
            this.nebulaParticles = [];
            this.time = 0;
            this.centerX = 0;
            this.centerY = 0;
        }

        get metadata() {
            return {
                title: 'Space Tunnel',
                description: 'Viagem hipnotizante através de um túnel de luz no espaço',
                author: 'Sistema',
                date: '2025-07-25'
            };
        }

        init(canvas) {
            super.init(canvas);
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
            this.createTunnelParticles();
            this.createNebulaParticles();
        }

        createTunnelParticles() {
            this.tunnelParticles = [];
            const particleCount = 200;
            
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * Math.max(this.canvas.width, this.canvas.height);
                this.tunnelParticles.push({
                    angle: angle,
                    radius: radius,
                    z: Math.random() * 1000,
                    speed: 2 + Math.random() * 3,
                    size: Math.random() * 2 + 0.5,
                    brightness: Math.random()
                });
            }
        }

        createNebulaParticles() {
            this.nebulaParticles = [];
            const particleCount = 100;
            
            for (let i = 0; i < particleCount; i++) {
                this.nebulaParticles.push({
                    x: this.centerX + (Math.random() - 0.5) * 400,
                    y: this.centerY + (Math.random() - 0.5) * 400,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 80 + 20,
                    hue: 180 + Math.random() * 60, // Azul para verde
                    alpha: Math.random() * 0.3
                });
            }
        }

        resize() {
            super.resize();
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
        }

        update() {
            this.time += 0.01;
            
            // Atualizar partículas do túnel
            this.tunnelParticles.forEach(particle => {
                particle.z -= particle.speed;
                
                // Resetar partícula quando sair do campo de visão
                if (particle.z < 1) {
                    particle.z = 1000;
                    particle.angle = Math.random() * Math.PI * 2;
                    particle.radius = Math.random() * Math.max(this.canvas.width, this.canvas.height);
                }
            });
            
            // Atualizar nebulosa
            this.nebulaParticles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Movimento orgânico
                particle.vx += (Math.random() - 0.5) * 0.02;
                particle.vy += (Math.random() - 0.5) * 0.02;
                
                // Limitar velocidade
                particle.vx *= 0.99;
                particle.vy *= 0.99;
                
                // Manter próximo ao centro
                const dx = this.centerX - particle.x;
                const dy = this.centerY - particle.y;
                particle.vx += dx * 0.0001;
                particle.vy += dy * 0.0001;
                
                // Variação suave de transparência
                particle.alpha = 0.15 + Math.sin(this.time + particle.x * 0.01) * 0.1;
            });
        }

        draw() {
            // Fundo escuro com fade
            this.ctx.fillStyle = 'rgba(0, 0, 10, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Desenhar nebulosa de fundo
            this.nebulaParticles.forEach(particle => {
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                
                const hue = particle.hue + Math.sin(this.time) * 10;
                gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${particle.alpha})`);
                gradient.addColorStop(0.5, `hsla(${hue}, 70%, 40%, ${particle.alpha * 0.5})`);
                gradient.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(
                    particle.x - particle.size,
                    particle.y - particle.size,
                    particle.size * 2,
                    particle.size * 2
                );
            });
            
            // Desenhar túnel de partículas
            this.tunnelParticles.sort((a, b) => b.z - a.z); // Ordenar por profundidade
            
            this.tunnelParticles.forEach(particle => {
                const perspective = 800 / particle.z;
                const x = this.centerX + Math.cos(particle.angle) * particle.radius * perspective;
                const y = this.centerY + Math.sin(particle.angle) * particle.radius * perspective;
                const size = particle.size * perspective;
                const opacity = Math.min(1, perspective) * particle.brightness;
                
                // Partícula principal
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                const hue = 200 + Math.sin(particle.angle + this.time) * 20;
                this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${opacity})`;
                this.ctx.fill();
                
                // Brilho ao redor
                if (size > 1) {
                    const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                    glowGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${opacity * 0.5})`);
                    glowGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
                }
                
                // Trails de luz
                if (particle.z < 500) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    const trailX = this.centerX + Math.cos(particle.angle) * particle.radius * 0.8;
                    const trailY = this.centerY + Math.sin(particle.angle) * particle.radius * 0.8;
                    this.ctx.lineTo(trailX, trailY);
                    this.ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity * 0.3})`;
                    this.ctx.lineWidth = size * 0.5;
                    this.ctx.stroke();
                }
            });
            
            // Efeito de vinheta
            const vignette = this.ctx.createRadialGradient(
                this.centerX, this.centerY, 0,
                this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height) * 0.7
            );
            vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignette.addColorStop(1, 'rgba(0, 0, 20, 0.8)');
            this.ctx.fillStyle = vignette;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    class LavaLampAnimation extends Animation {
        constructor() {
            super();
            this.blobs = [];
            this.blobCount = 6;
            this.time = 0;
            this.colors = [
                { r: 100, g: 149, b: 237 }, // Cornflower blue
                { r: 147, g: 112, b: 219 }, // Medium purple
                { r: 102, g: 205, b: 170 }, // Medium aquamarine
                { r: 123, g: 104, b: 238 }, // Medium slate blue
                { r: 72, g: 209, b: 204 },  // Medium turquoise
                { r: 138, g: 43, b: 226 }   // Blue violet
            ];
        }

        get metadata() {
            return {
                title: 'Lava Lamp',
                description: 'Calming floating blobs with organic movement',
                author: 'Sistema',
                date: '2025-07-26'
            };
        }

        init(canvas) {
            super.init(canvas);
            this.createBlobs();
        }

        createBlobs() {
            this.blobs = [];
            for (let i = 0; i < this.blobCount; i++) {
                const colorIndex = i % this.colors.length;
                const color = this.colors[colorIndex];
                
                this.blobs.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height + Math.random() * 200,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: -0.5 - Math.random() * 0.5,
                    radius: 40 + Math.random() * 60,
                    baseRadius: 40 + Math.random() * 60,
                    wobbleSpeed: 0.01 + Math.random() * 0.02,
                    wobbleAmount: 0.1 + Math.random() * 0.1,
                    phase: Math.random() * Math.PI * 2,
                    color: color,
                    opacity: 0.6 + Math.random() * 0.2
                });
            }
        }

        resize() {
            super.resize();
            // Ajusta posições dos blobs proporcionalmente
            this.blobs.forEach(blob => {
                blob.x = blob.x * (this.canvas.width / (this.canvas.width || 1));
                blob.y = blob.y * (this.canvas.height / (this.canvas.height || 1));
            });
        }

        update() {
            this.time += 0.01;
            
            this.blobs.forEach((blob, index) => {
                // Movimento vertical suave
                blob.y += blob.vy;
                blob.x += blob.vx;
                
                // Movimento lateral sinusoidal suave
                blob.x += Math.sin(this.time + blob.phase) * 0.3;
                
                // Variação do raio para efeito orgânico
                blob.radius = blob.baseRadius * (1 + Math.sin(this.time * blob.wobbleSpeed + blob.phase) * blob.wobbleAmount);
                
                // Quando o blob sai do topo, reposiciona na parte inferior
                if (blob.y + blob.radius < 0) {
                    blob.y = this.canvas.height + blob.radius;
                    blob.x = Math.random() * this.canvas.width;
                    blob.vx = (Math.random() - 0.5) * 0.3;
                }
                
                // Mantém blobs dentro dos limites horizontais com movimento suave
                if (blob.x - blob.radius < 0 || blob.x + blob.radius > this.canvas.width) {
                    blob.vx *= -0.8;
                    blob.x = Math.max(blob.radius, Math.min(this.canvas.width - blob.radius, blob.x));
                }
                
                // Interação entre blobs (fusão e separação suaves)
                this.blobs.forEach((otherBlob, otherIndex) => {
                    if (index === otherIndex) return;
                    
                    const dx = blob.x - otherBlob.x;
                    const dy = blob.y - otherBlob.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = blob.radius + otherBlob.radius;
                    
                    if (distance < minDistance && distance > 0) {
                        // Repulsão suave quando muito próximos
                        const force = (minDistance - distance) / minDistance * 0.02;
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        
                        blob.vx += fx;
                        blob.vy += fy;
                        otherBlob.vx -= fx;
                        otherBlob.vy -= fy;
                    }
                });
                
                // Limita velocidades para manter movimento calmo
                blob.vx = Math.max(-0.5, Math.min(0.5, blob.vx));
                blob.vy = Math.max(-1, Math.min(-0.3, blob.vy));
                
                // Aplica fricção para movimento mais suave
                blob.vx *= 0.98;
            });
        }

        draw() {
            // Fundo com gradiente suave
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, 'rgb(20, 20, 40)');
            gradient.addColorStop(1, 'rgb(40, 20, 60)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Configurar composição para fusão suave
            this.ctx.globalCompositeOperation = 'screen';
            
            // Desenhar blobs com efeito metaball
            this.blobs.forEach(blob => {
                // Criar gradiente radial para cada blob
                const gradient = this.ctx.createRadialGradient(
                    blob.x, blob.y, 0,
                    blob.x, blob.y, blob.radius
                );
                
                const color = blob.color;
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${blob.opacity})`);
                gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${blob.opacity * 0.5})`);
                gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
                
                // Desenhar blob com múltiplas camadas para efeito suave
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(blob.x, blob.y, blob.radius * (1 + i * 0.1), 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            });
            
            // Resetar modo de composição
            this.ctx.globalCompositeOperation = 'source-over';
            
            // Adicionar brilho sutil
            this.ctx.globalCompositeOperation = 'overlay';
            const glowGradient = this.ctx.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, 0,
                this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }

    class KaleidoscopeAnimation extends Animation {
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

    class OceanWavesAnimation extends Animation {
        constructor() {
            super();
            this.time = 0;
            this.waves = [];
            this.particles = []; // Para efeito de espuma
            
            // Configurações das ondas
            this.waveConfigs = [
                // Ondas de fundo (mais lentas e maiores)
                { amplitude: 40, frequency: 0.008, speed: 0.3, yOffset: 0.7, opacity: 0.3 },
                { amplitude: 35, frequency: 0.01, speed: 0.4, yOffset: 0.65, opacity: 0.4 },
                // Ondas médias
                { amplitude: 30, frequency: 0.012, speed: 0.5, yOffset: 0.6, opacity: 0.5 },
                { amplitude: 25, frequency: 0.015, speed: 0.6, yOffset: 0.55, opacity: 0.6 },
                // Ondas de frente (mais rápidas e menores)
                { amplitude: 20, frequency: 0.02, speed: 0.8, yOffset: 0.5, opacity: 0.7 },
                { amplitude: 15, frequency: 0.025, speed: 1.0, yOffset: 0.45, opacity: 0.8 }
            ];
        }

        get metadata() {
            return {
                title: 'Ocean Waves',
                description: 'Soothing ocean waves in perpetual motion',
                author: 'Sistema',
                date: '2025-07-26'
            };
        }

        init(canvas) {
            super.init(canvas);
            this.createWaves();
        }

        createWaves() {
            this.waves = this.waveConfigs.map(config => ({
                ...config,
                phase: Math.random() * Math.PI * 2,
                points: []
            }));
        }

        resize() {
            super.resize();
            // Recalcula pontos das ondas quando a tela é redimensionada
            this.updateWavePoints();
        }

        updateWavePoints() {
            const width = this.canvas.width;
            const segments = Math.floor(width / 5) + 1; // Pontos a cada 5 pixels

            this.waves.forEach(wave => {
                wave.points = [];
                for (let i = 0; i <= segments; i++) {
                    const x = (i / segments) * width;
                    wave.points.push({ x });
                }
            });
        }

        createFoamParticle(x, y) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y - Math.random() * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 1,
                size: Math.random() * 3 + 1,
                life: 1,
                decay: 0.02 + Math.random() * 0.02
            });
        }

        update() {
            this.time += 0.016; // ~60fps

            // Atualiza pontos das ondas
            if (this.waves[0].points.length === 0) {
                this.updateWavePoints();
            }

            // Calcula posição Y de cada ponto da onda
            this.waves.forEach((wave, waveIndex) => {
                wave.points.forEach((point, i) => {
                    const x = point.x;
                    const baseY = this.canvas.height * wave.yOffset;
                    
                    // Múltiplas ondas senoidais sobrepostas para movimento mais natural
                    const y1 = Math.sin((x * wave.frequency) + (this.time * wave.speed) + wave.phase) * wave.amplitude;
                    const y2 = Math.sin((x * wave.frequency * 1.5) + (this.time * wave.speed * 0.8) + wave.phase + Math.PI/4) * (wave.amplitude * 0.3);
                    const y3 = Math.sin((x * wave.frequency * 0.5) + (this.time * wave.speed * 1.2) + wave.phase - Math.PI/3) * (wave.amplitude * 0.2);
                    
                    point.y = baseY + y1 + y2 + y3;

                    // Criar partículas de espuma nas cristas das ondas frontais
                    if (waveIndex >= 4 && Math.random() < 0.001) {
                        const prevPoint = wave.points[i - 1];
                        if (prevPoint && point.y < prevPoint.y && point.y < wave.points[i + 1]?.y) {
                            this.createFoamParticle(x, point.y);
                        }
                    }
                });
            });

            // Atualiza partículas de espuma
            this.particles = this.particles.filter(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravidade
                particle.life -= particle.decay;
                particle.size *= 0.98;

                return particle.life > 0 && particle.y < this.canvas.height;
            });
        }

        draw() {
            // Gradiente de fundo do céu/oceano
            const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            bgGradient.addColorStop(0, '#0a1929'); // Azul muito escuro (quase preto)
            bgGradient.addColorStop(0.3, '#173a5e'); // Azul escuro
            bgGradient.addColorStop(0.6, '#1e5090'); // Azul médio
            bgGradient.addColorStop(0.8, '#2a69ac'); // Azul mais claro
            bgGradient.addColorStop(1, '#3584c7'); // Azul claro

            this.ctx.fillStyle = bgGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Desenha as ondas (de trás para frente)
            this.waves.forEach((wave, index) => {
                this.ctx.beginPath();
                
                // Começa do canto inferior esquerdo
                this.ctx.moveTo(0, this.canvas.height);
                
                // Desenha a linha da onda
                wave.points.forEach((point, i) => {
                    if (i === 0) {
                        this.ctx.lineTo(point.x, point.y);
                    } else {
                        // Usa curvas de Bézier para suavizar
                        const prevPoint = wave.points[i - 1];
                        const cpx = (prevPoint.x + point.x) / 2;
                        const cpy = (prevPoint.y + point.y) / 2;
                        this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
                    }
                });
                
                // Último ponto
                const lastPoint = wave.points[wave.points.length - 1];
                this.ctx.lineTo(lastPoint.x, lastPoint.y);
                
                // Completa o caminho
                this.ctx.lineTo(this.canvas.width, this.canvas.height);
                this.ctx.closePath();

                // Gradiente para cada onda
                const waveGradient = this.ctx.createLinearGradient(0, this.canvas.height * wave.yOffset - wave.amplitude, 0, this.canvas.height);
                
                if (index < 2) {
                    // Ondas de fundo - tons mais escuros
                    waveGradient.addColorStop(0, `rgba(30, 80, 144, ${wave.opacity * 0.8})`);
                    waveGradient.addColorStop(0.5, `rgba(35, 100, 170, ${wave.opacity})`);
                    waveGradient.addColorStop(1, `rgba(25, 70, 130, ${wave.opacity})`);
                } else if (index < 4) {
                    // Ondas médias
                    waveGradient.addColorStop(0, `rgba(53, 132, 199, ${wave.opacity * 0.8})`);
                    waveGradient.addColorStop(0.5, `rgba(58, 145, 215, ${wave.opacity})`);
                    waveGradient.addColorStop(1, `rgba(42, 105, 175, ${wave.opacity})`);
                } else {
                    // Ondas frontais - tons mais claros e vibrantes
                    waveGradient.addColorStop(0, `rgba(74, 158, 226, ${wave.opacity * 0.8})`);
                    waveGradient.addColorStop(0.3, `rgba(84, 172, 240, ${wave.opacity})`);
                    waveGradient.addColorStop(1, `rgba(64, 140, 210, ${wave.opacity})`);
                }

                this.ctx.fillStyle = waveGradient;
                this.ctx.fill();

                // Linha superior da onda com brilho sutil
                if (index >= 3) {
                    this.ctx.beginPath();
                    wave.points.forEach((point, i) => {
                        if (i === 0) {
                            this.ctx.moveTo(point.x, point.y);
                        } else {
                            const prevPoint = wave.points[i - 1];
                            const cpx = (prevPoint.x + point.x) / 2;
                            const cpy = (prevPoint.y + point.y) / 2;
                            this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
                        }
                    });
                    
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity * 0.2})`;
                    this.ctx.lineWidth = 1 + (index - 3) * 0.5;
                    this.ctx.stroke();
                }
            });

            // Desenha partículas de espuma
            this.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.life * 0.8})`;
                this.ctx.fill();
            });

            // Adiciona reflexo de luz suave
            const lightGradient = this.ctx.createRadialGradient(
                this.canvas.width * 0.3, 0,
                0,
                this.canvas.width * 0.3, 0,
                this.canvas.height * 0.8
            );
            lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
            lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = lightGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    class AuroraAnimation extends Animation {
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

    // Registro central de todas as animações

    const animations = [
        ParticlesAnimation,
        SpaceTunnelAnimation,
        LavaLampAnimation,
        KaleidoscopeAnimation,
        OceanWavesAnimation,
        AuroraAnimation
    ];

    // Ponto de entrada da aplicação

    // Inicializar quando o DOM estiver pronto
    window.addEventListener('DOMContentLoaded', () => {
        new Gallery(animations);
    });

})();
