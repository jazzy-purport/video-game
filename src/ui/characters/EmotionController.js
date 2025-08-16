class EmotionController {
    constructor() {
        this.emotionConfigs = {
            normal: {
                eyebrows: {
                    leftRotation: { z: -0.1 },
                    rightRotation: { z: 0.1 },
                    leftPosition: { y: 0 },
                    rightPosition: { y: 0 }
                }
            },
            angry: {
                eyebrows: {
                    leftRotation: { z: -0.3 },  // More angled down
                    rightRotation: { z: 0.3 },  // More angled down
                    leftPosition: { y: -0.02 }, // Slightly lower
                    rightPosition: { y: -0.02 } // Slightly lower
                }
            },
            scared: {
                eyebrows: {
                    leftRotation: { z: 0.2 },   // Angled up
                    rightRotation: { z: -0.2 }, // Angled up
                    leftPosition: { y: 0.02 },  // Slightly higher
                    rightPosition: { y: 0.02 }  // Slightly higher
                }
            }
        };
        
        this.currentEmotion = 'normal';
        this.isAnimating = false;
    }

    applyEmotion(character, emotion, smooth = true) {
        if (!character || !character.group) {
            console.warn('Character or character group not found for emotion application');
            return;
        }

        if (!this.emotionConfigs[emotion]) {
            console.warn(`Unknown emotion: ${emotion}, defaulting to normal`);
            emotion = 'normal';
        }

        // If already animating, complete current animation instantly first
        if (this.isAnimating) {
            this.isAnimating = false;
        }

        this.currentEmotion = emotion;
        const config = this.emotionConfigs[emotion];

        // Find eyebrow meshes in character group
        const eyebrows = this.findEyebrows(character.group);
        
        if (!eyebrows.left && !eyebrows.right) {
            console.warn('Could not find any eyebrow meshes in character');
            return;
        }

        if (smooth) {
            this.animateEmotion(eyebrows, config);
        } else {
            this.applyEmotionInstantly(eyebrows, config);
        }

        console.log(`Applied emotion: ${emotion} to character`);
    }

    findEyebrows(group) {
        const eyebrows = { left: null, right: null };
        const foundEyebrows = [];
        
        // Recursively search through the group for eyebrow meshes
        group.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.type === 'BoxGeometry') {
                // Check if this looks like an eyebrow based on position and size
                const position = child.position;
                const scale = child.scale;
                
                // Eyebrows should be around y: 0.82, x: ±0.05, z: 0.14 based on Character.js
                // Also check for small box geometry (eyebrows are small)
                const isAtEyebrowHeight = Math.abs(position.y - 0.82) < 0.05;
                const isAtEyebrowDepth = Math.abs(position.z - 0.14) < 0.05;
                const isSmallBox = child.geometry.parameters && 
                                 child.geometry.parameters.width < 0.1 && 
                                 child.geometry.parameters.height < 0.1;
                
                if (isAtEyebrowHeight && isAtEyebrowDepth && isSmallBox) {
                    foundEyebrows.push({
                        mesh: child,
                        position: position.clone(),
                        side: position.x < 0 ? 'left' : 'right'
                    });
                }
            }
        });
        
        // Assign the found eyebrows
        foundEyebrows.forEach(eyebrow => {
            if (eyebrow.side === 'left' && !eyebrows.left) {
                eyebrows.left = eyebrow.mesh;
            } else if (eyebrow.side === 'right' && !eyebrows.right) {
                eyebrows.right = eyebrow.mesh;
            }
        });
        
        // Debug log
        console.log('Found eyebrows:', {
            left: !!eyebrows.left,
            right: !!eyebrows.right,
            totalFound: foundEyebrows.length
        });
        
        return eyebrows;
    }

    applyEmotionInstantly(eyebrows, config) {
        // Define base positions and rotations
        const baseEyebrowY = 0.82;
        const baseLeftRotation = -0.1;
        const baseRightRotation = 0.1;

        // Apply left eyebrow transformation
        if (eyebrows.left) {
            if (config.eyebrows.leftRotation) {
                eyebrows.left.rotation.z = config.eyebrows.leftRotation.z;
            }
            if (config.eyebrows.leftPosition) {
                eyebrows.left.position.y = baseEyebrowY + (config.eyebrows.leftPosition.y || 0);
            }
        }

        // Apply right eyebrow transformation
        if (eyebrows.right) {
            if (config.eyebrows.rightRotation) {
                eyebrows.right.rotation.z = config.eyebrows.rightRotation.z;
            }
            if (config.eyebrows.rightPosition) {
                eyebrows.right.position.y = baseEyebrowY + (config.eyebrows.rightPosition.y || 0);
            }
        }
    }

    animateEmotion(eyebrows, config) {
        this.isAnimating = true;
        
        const duration = 300; // ms
        const startTime = Date.now();
        
        // Store starting values
        const startValues = {
            leftRotation: eyebrows.left ? eyebrows.left.rotation.z : 0,
            rightRotation: eyebrows.right ? eyebrows.right.rotation.z : 0,
            leftPosition: eyebrows.left ? eyebrows.left.position.y : 0.82,
            rightPosition: eyebrows.right ? eyebrows.right.position.y : 0.82
        };

        // Target values
        const baseEyebrowY = 0.82;
        const targetValues = {
            leftRotation: config.eyebrows.leftRotation.z,
            rightRotation: config.eyebrows.rightRotation.z,
            leftPosition: baseEyebrowY + (config.eyebrows.leftPosition.y || 0),
            rightPosition: baseEyebrowY + (config.eyebrows.rightPosition.y || 0)
        };

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Interpolate rotations
            if (eyebrows.left) {
                eyebrows.left.rotation.z = startValues.leftRotation + 
                    (targetValues.leftRotation - startValues.leftRotation) * eased;
                eyebrows.left.position.y = startValues.leftPosition + 
                    (targetValues.leftPosition - startValues.leftPosition) * eased;
            }

            if (eyebrows.right) {
                eyebrows.right.rotation.z = startValues.rightRotation + 
                    (targetValues.rightRotation - startValues.rightRotation) * eased;
                eyebrows.right.position.y = startValues.rightPosition + 
                    (targetValues.rightPosition - startValues.rightPosition) * eased;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        animate();
    }

    getCurrentEmotion() {
        return this.currentEmotion;
    }

    // Reset to normal emotion
    resetToNormal(character, smooth = true) {
        this.applyEmotion(character, 'normal', smooth);
    }

    // Get emotion config for debugging
    getEmotionConfig(emotion) {
        return this.emotionConfigs[emotion] || this.emotionConfigs.normal;
    }

    // Add new emotion configurations
    addEmotionConfig(emotionName, config) {
        this.emotionConfigs[emotionName] = config;
    }
}