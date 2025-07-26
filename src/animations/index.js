// Registro central de todas as animações
import ParticlesAnimation from './particles/index.js';
import SpaceTunnelAnimation from './space-tunnel/index.js';
import LavaLampAnimation from './lava-lamp/index.js';
import KaleidoscopeAnimation from './kaleidoscope/index.js';
import OceanWavesAnimation from './ocean-waves/index.js';
import AuroraAnimation from './aurora/index.js';

export const animations = [
    ParticlesAnimation,
    SpaceTunnelAnimation,
    LavaLampAnimation,
    KaleidoscopeAnimation,
    OceanWavesAnimation,
    AuroraAnimation
];

// Para facilitar adicionar novas animações no futuro
export default animations;