import Animation from '../../core/Animation.js';

export default class LavaLampAnimation extends Animation {
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