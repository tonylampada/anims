// Sistema de Galeria
export default class Gallery {
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
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const animationParam = urlParams.get('animation');
        
        if (animationParam) {
            // Try to find animation by number or name
            const animationNumber = parseInt(animationParam);
            if (!isNaN(animationNumber) && animationNumber > 0 && animationNumber <= this.animations.length) {
                this.loadAnimation(animationNumber - 1); // Convert to 0-based index
            } else {
                // Try to find by name (case insensitive)
                const index = this.animations.findIndex(AnimClass => {
                    const anim = new AnimClass();
                    return anim.metadata.title.toLowerCase().includes(animationParam.toLowerCase());
                });
                if (index !== -1) {
                    this.loadAnimation(index);
                } else {
                    this.loadAnimation(0); // Default to first
                }
            }
        } else {
            this.loadAnimation(0);
        }
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