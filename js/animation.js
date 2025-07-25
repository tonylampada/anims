// Classe base para todas as animações
class Animation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
    }

    // Metadados da animação
    get metadata() {
        return {
            title: 'Animação Base',
            description: 'Descrição da animação',
            author: 'Autor',
            date: new Date().toISOString()
        };
    }

    // Inicializa a animação com o canvas
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        // Listener para redimensionamento
        window.addEventListener('resize', () => this.resize());
    }

    // Ajusta o tamanho do canvas
    resize() {
        if (this.canvas) {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }
    }

    // Inicia a animação
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    // Para a animação
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Loop de animação (deve ser sobrescrito)
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Atualiza o estado da animação (deve ser sobrescrito)
    update() {
        // Implementar nas subclasses
    }

    // Desenha a animação (deve ser sobrescrito)
    draw() {
        // Implementar nas subclasses
    }

    // Limpa o canvas
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default Animation;