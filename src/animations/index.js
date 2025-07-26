// Registro central de todas as animações
import ParticlesAnimation from './particles/index.js';
import SpaceTunnelAnimation from './space-tunnel/index.js';
import LavaLampAnimation from './lava-lamp/index.js';
import KaleidoscopeAnimation from './kaleidoscope/index.js';
import OceanWavesAnimation from './ocean-waves/index.js';
import AuroraAnimation from './aurora/index.js';
import MandalaAnimation from './mandala/index.js';
import BubbleTubeAnimation from './bubble-tube/index.js';
import SpiralGalaxyAnimation from './spiral-galaxy/index.js';
import FlowingSandAnimation from './flowing-sand/index.js';
import FiberOpticAnimation from './fiber-optic/index.js';
import BreathingCircleAnimation from './breathing-circle/index.js';
import CyberpunkWormholeAnimation from './cyberpunk-wormhole/index.js';

export const animations = [
    ParticlesAnimation,
    SpaceTunnelAnimation,
    LavaLampAnimation,
    KaleidoscopeAnimation,
    OceanWavesAnimation,
    AuroraAnimation,
    MandalaAnimation,
    BubbleTubeAnimation,
    SpiralGalaxyAnimation,
    FlowingSandAnimation,
    FiberOpticAnimation,
    BreathingCircleAnimation,
    CyberpunkWormholeAnimation
];

// Para facilitar adicionar novas animações no futuro
export default animations;