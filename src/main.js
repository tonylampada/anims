// Ponto de entrada da aplicação
import Gallery from './core/Gallery.js';
import animations from './animations/index.js';

// Inicializar quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
    new Gallery(animations);
});