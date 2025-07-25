// Registro central de todas as animações
import ParticlesAnimation from './particles/index.js';
import SpaceTunnelAnimation from './space-tunnel/index.js';

export const animations = [
    ParticlesAnimation,
    SpaceTunnelAnimation
];

// Para facilitar adicionar novas animações no futuro
export default animations;