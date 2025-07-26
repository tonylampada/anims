// Registro central de todas as animações
import ParticlesAnimation from './particles/index.js';
import SpaceTunnelAnimation from './space-tunnel/index.js';
import LavaLampAnimation from './lava-lamp/index.js';

export const animations = [
    ParticlesAnimation,
    SpaceTunnelAnimation,
    LavaLampAnimation
];

// Para facilitar adicionar novas animações no futuro
export default animations;