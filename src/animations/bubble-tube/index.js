import Animation from '../../core/Animation.js';

export default class BubbleTubeAnimation extends Animation {
    constructor() {
        super();
        this.bubbles = [];
        this.maxBubbles = 25;
        this.time = 0;
        this.colorPhase = 0;
        this.backgroundColors = [
            { r: 30, g: 60, b: 120 },   // Deep blue
            { r: 80, g: 40, b: 120 },   // Purple
            { r: 40, g: 90, b: 90 }     // Teal green
        ];
        this.currentColorIndex = 0;
        this.nextColorIndex = 1;
        this.colorTransition = 0;
        this.tubeWidth = 200; // Width of the central column
    }

    get metadata() {
        return {
            title: 'Bubble Tube',
            description: 'Sensory bubble column with gentle color transitions',
            author: 'Sistema',
            date: '2025-07-26'
        };
    }

    init(canvas) {
        super.init(canvas);
        this.createInitialBubbles();
    }

    createInitialBubbles() {
        this.bubbles = [];
        // Create initial bubbles distributed throughout the tube
        for (let i = 0; i < this.maxBubbles; i++) {
            this.createBubble(true);
        }
    }

    createBubble(initial = false) {
        const centerX = this.canvas.width / 2;
        const tubeHalfWidth = this.tubeWidth / 2;
        
        // Random position within the tube width
        const xOffset = (Math.random() - 0.5) * (this.tubeWidth * 0.8);
        
        const bubble = {
            x: centerX + xOffset,
            y: initial ? Math.random() * this.canvas.height : this.canvas.height + 20,
            radius: 8 + Math.random() * 25, // Varying sizes
            speed: 0.5 + Math.random() * 1.5, // Different speeds
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            wobbleAmount: 10 + Math.random() * 20,
            phase: Math.random() * Math.PI * 2,
            opacity: 0.3 + Math.random() * 0.4,
            glowIntensity: 0.5 + Math.random() * 0.5
        };
        
        this.bubbles.push(bubble);
    }

    resize() {
        super.resize();
        // Adjust bubble positions proportionally
        const centerX = this.canvas.width / 2;
        this.bubbles.forEach(bubble => {
            const relativeX = bubble.x - centerX;
            bubble.x = centerX + relativeX;
        });
    }

    update() {
        this.time += 0.01;
        
        // Update color transition
        this.colorTransition += 0.002; // Slow color changes
        if (this.colorTransition >= 1) {
            this.colorTransition = 0;
            this.currentColorIndex = this.nextColorIndex;
            this.nextColorIndex = (this.nextColorIndex + 1) % this.backgroundColors.length;
        }
        
        // Update bubbles
        this.bubbles.forEach((bubble, index) => {
            // Rise vertically
            bubble.y -= bubble.speed;
            
            // Gentle horizontal wobble
            const wobble = Math.sin(this.time * bubble.wobbleSpeed + bubble.phase) * bubble.wobbleAmount;
            bubble.x += wobble * 0.02;
            
            // Keep bubbles within tube bounds
            const centerX = this.canvas.width / 2;
            const maxOffset = this.tubeWidth / 2 - bubble.radius;
            const currentOffset = bubble.x - centerX;
            if (Math.abs(currentOffset) > maxOffset) {
                bubble.x = centerX + Math.sign(currentOffset) * maxOffset;
            }
            
            // Remove bubbles that have left the screen
            if (bubble.y + bubble.radius < 0) {
                this.bubbles.splice(index, 1);
                this.createBubble(); // Create a new bubble at the bottom
            }
            
            // Pulsing glow effect
            bubble.glowIntensity = 0.5 + Math.sin(this.time * 0.5 + bubble.phase) * 0.3;
        });
    }

    draw() {
        // Clear canvas
        this.clear();
        
        // Draw background with color transition
        const currentColor = this.backgroundColors[this.currentColorIndex];
        const nextColor = this.backgroundColors[this.nextColorIndex];
        
        const r = Math.floor(currentColor.r + (nextColor.r - currentColor.r) * this.colorTransition);
        const g = Math.floor(currentColor.g + (nextColor.g - currentColor.g) * this.colorTransition);
        const b = Math.floor(currentColor.b + (nextColor.b - currentColor.b) * this.colorTransition);
        
        // Create gradient background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, `rgb(${r * 0.3}, ${g * 0.3}, ${b * 0.3})`);
        bgGradient.addColorStop(0.5, `rgb(${r * 0.5}, ${g * 0.5}, ${b * 0.5})`);
        bgGradient.addColorStop(1, `rgb(${r * 0.3}, ${g * 0.3}, ${b * 0.3})`);
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw central tube effect with subtle glow
        const centerX = this.canvas.width / 2;
        const tubeGradient = this.ctx.createLinearGradient(
            centerX - this.tubeWidth / 2, 0, 
            centerX + this.tubeWidth / 2, 0
        );
        tubeGradient.addColorStop(0, `rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, 0.2)`);
        tubeGradient.addColorStop(0.1, `rgba(${r * 0.8}, ${g * 0.8}, ${b * 0.8}, 0.3)`);
        tubeGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`);
        tubeGradient.addColorStop(0.9, `rgba(${r * 0.8}, ${g * 0.8}, ${b * 0.8}, 0.3)`);
        tubeGradient.addColorStop(1, `rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, 0.2)`);
        
        this.ctx.fillStyle = tubeGradient;
        this.ctx.fillRect(centerX - this.tubeWidth / 2, 0, this.tubeWidth, this.canvas.height);
        
        // Draw bubbles with glow effects
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        this.bubbles.forEach(bubble => {
            // Draw bubble glow
            const glowGradient = this.ctx.createRadialGradient(
                bubble.x, bubble.y, 0,
                bubble.x, bubble.y, bubble.radius * 2
            );
            glowGradient.addColorStop(0, `rgba(200, 220, 255, ${bubble.opacity * bubble.glowIntensity})`);
            glowGradient.addColorStop(0.4, `rgba(150, 200, 255, ${bubble.opacity * bubble.glowIntensity * 0.5})`);
            glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw bubble itself
            const bubbleGradient = this.ctx.createRadialGradient(
                bubble.x - bubble.radius * 0.3, 
                bubble.y - bubble.radius * 0.3, 
                0,
                bubble.x, bubble.y, bubble.radius
            );
            bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.8})`);
            bubbleGradient.addColorStop(0.3, `rgba(200, 230, 255, ${bubble.opacity * 0.6})`);
            bubbleGradient.addColorStop(0.7, `rgba(150, 200, 255, ${bubble.opacity * 0.3})`);
            bubbleGradient.addColorStop(1, `rgba(100, 150, 255, ${bubble.opacity * 0.1})`);
            
            this.ctx.fillStyle = bubbleGradient;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw bubble highlight
            this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(
                bubble.x - bubble.radius * 0.3, 
                bubble.y - bubble.radius * 0.3, 
                bubble.radius * 0.2, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        this.ctx.restore();
        
        // Add subtle vertical light streaks
        this.ctx.globalCompositeOperation = 'overlay';
        const lightGradient = this.ctx.createLinearGradient(
            centerX - this.tubeWidth / 2, 0,
            centerX + this.tubeWidth / 2, 0
        );
        lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = lightGradient;
        this.ctx.fillRect(centerX - this.tubeWidth / 2, 0, this.tubeWidth, this.canvas.height);
        
        this.ctx.globalCompositeOperation = 'source-over';
    }
}