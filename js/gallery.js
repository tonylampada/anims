// Sistema de galeria para carregar e gerenciar animações

class Gallery {
    constructor() {
        this.animations = [
            { name: 'particles', path: '/anims/animations/particles/index.js' }
        ];
        this.currentIndex = 0;
        this.currentAnimation = null;
        this.canvas = document.getElementById('animation-canvas');
        
        this.init();
    }
    
    async init() {
        // Elementos do DOM
        this.titleEl = document.getElementById('animation-title');
        this.descriptionEl = document.getElementById('animation-description');
        this.counterEl = document.getElementById('animation-counter');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        // Event listeners
        this.prevBtn.addEventListener('click', () => this.previous());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Carregar primeira animação
        await this.loadAnimation(0);
    }
    
    async loadAnimation(index) {
        // Parar animação atual
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        
        try {
            // Carregar módulo da animação
            const animationData = this.animations[index];
            const module = await import(animationData.path);
            const AnimationClass = module.default;
            
            // Criar instância da animação
            this.currentAnimation = new AnimationClass();
            this.currentAnimation.init(this.canvas);
            this.currentAnimation.start();
            
            // Atualizar informações
            const metadata = this.currentAnimation.metadata;
            this.titleEl.textContent = metadata.title;
            this.descriptionEl.textContent = metadata.description;
            
            // Atualizar navegação
            this.currentIndex = index;
            this.updateNavigation();
            
        } catch (error) {
            console.error('Erro ao carregar animação:', error);
            this.titleEl.textContent = 'Erro ao carregar';
            this.descriptionEl.textContent = 'Não foi possível carregar a animação.';
        }
    }
    
    updateNavigation() {
        // Atualizar contador
        this.counterEl.textContent = `${this.currentIndex + 1} / ${this.animations.length}`;
        
        // Habilitar/desabilitar botões
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.animations.length - 1;
    }
    
    previous() {
        if (this.currentIndex > 0) {
            this.loadAnimation(this.currentIndex - 1);
        }
    }
    
    next() {
        if (this.currentIndex < this.animations.length - 1) {
            this.loadAnimation(this.currentIndex + 1);
        }
    }
}

// Inicializar galeria quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});