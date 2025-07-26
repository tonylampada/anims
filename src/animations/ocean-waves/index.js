import Animation from '../../core/Animation.js';

export default class OceanWavesAnimation extends Animation {
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