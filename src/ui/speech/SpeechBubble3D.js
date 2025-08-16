class SpeechBubble3D {
    constructor(scene) {
        this.scene = scene;
        this.group = null;
        this.textTexture = null;
        this.textMaterial = null;
        this.isVisible = false;
        this.animationMixer = null;
        
        this.createBubble();
    }

    createBubble() {
        this.group = new THREE.Group();
        
        // Create bubble background
        this.createBubbleBackground();
        
        // Create text plane
        this.createTextPlane();
        
        // Initially hide the bubble
        this.group.visible = false;
        this.scene.add(this.group);
    }

    createBubbleBackground() {
        // Main bubble shape (rounded rectangle)
        const bubbleGeometry = new THREE.PlaneGeometry(2, 1);
        const bubbleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });
        
        const bubbleMesh = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        this.group.add(bubbleMesh);

        // Create bubble tail (pointer)
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.2, 3);
        const tailMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95
        });
        
        const tailMesh = new THREE.Mesh(tailGeometry, tailMaterial);
        tailMesh.position.set(0.6, -0.6, 0); // Tail on right side of bubble (pointing toward character)
        tailMesh.rotation.z = Math.PI + 0.2; // Angle tail towards character from the right
        this.group.add(tailMesh);

        // Add border (wireframe)
        const borderGeometry = new THREE.PlaneGeometry(2.05, 1.05);
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8,
            wireframe: false,
            side: THREE.DoubleSide
        });
        
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.z = -0.001;
        this.group.add(borderMesh);
    }

    createTextPlane() {
        // Create a canvas for text rendering
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        
        // Create texture from canvas
        this.textTexture = new THREE.CanvasTexture(canvas);
        this.textTexture.minFilter = THREE.LinearFilter;
        this.textTexture.magFilter = THREE.LinearFilter;
        
        // Create material for text
        this.textMaterial = new THREE.MeshBasicMaterial({
            map: this.textTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create text plane
        const textGeometry = new THREE.PlaneGeometry(1.8, 0.9);
        const textMesh = new THREE.Mesh(textGeometry, this.textMaterial);
        textMesh.position.z = 0.001;
        this.group.add(textMesh);
    }

    updateText(message) {
        const canvas = this.textTexture.image;
        const context = canvas.getContext('2d');
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set text properties
        context.fillStyle = '#333333';
        context.font = 'bold 24px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Clean and wrap text
        const cleanText = this.cleanMessageForDisplay(message);
        const lines = this.wrapText(context, cleanText, canvas.width - 40);
        
        // Draw text lines
        const lineHeight = 30;
        const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            context.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });
        
        // Update texture
        this.textTexture.needsUpdate = true;
        
        // Adjust bubble size based on text content
        this.adjustBubbleSize(lines.length);
    }

    cleanMessageForDisplay(message) {
        // Remove HTML tags and format for display
        let cleaned = message.replace(/<[^>]*>/g, '');
        
        // Convert action markers to more readable format
        cleaned = cleaned.replace(/\*(.*?)\*/g, '($1)');
        
        // Limit length
        if (cleaned.length > 200) {
            cleaned = cleaned.substring(0, 197) + '...';
        }
        
        return cleaned;
    }

    wrapText(context, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    adjustBubbleSize(lineCount) {
        const baseHeight = 1;
        const newHeight = Math.max(baseHeight, lineCount * 0.3 + 0.4);
        
        // Update bubble background size
        this.group.children[0].scale.y = newHeight;
        
        // Update border size
        this.group.children[2].scale.y = newHeight * 1.05;
        
        // Update text plane size
        this.group.children[3].scale.y = newHeight * 0.9;
        
        // Adjust tail position
        this.group.children[1].position.y = -newHeight/2 - 0.1;
    }

    show(message, characterPosition) {
        // Split message if it's too long
        const chunks = this.splitMessage(message);
        
        if (chunks.length === 1) {
            // Single bubble
            this.showSingleBubble(chunks[0], characterPosition);
        } else {
            // Multiple bubbles
            this.showMultipleBubbles(chunks, characterPosition);
        }
    }

    splitMessage(message, maxLength = 120) {
        if (message.length <= maxLength) {
            return [message];
        }

        const chunks = [];
        const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        let currentChunk = '';
        
        for (let sentence of sentences) {
            sentence = sentence.trim();
            if (!sentence) continue;
            
            // Add punctuation back
            if (!sentence.match(/[.!?]$/)) {
                sentence += '.';
            }
            
            // If adding this sentence would exceed max length, start new chunk
            if (currentChunk.length + sentence.length + 1 > maxLength && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
            }
        }
        
        // Add remaining chunk
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : [message];
    }

    showSingleBubble(message, characterPosition) {
        // Update text content
        this.updateText(message);
        
        // Position relative to character
        this.group.position.copy(characterPosition);
        this.group.position.y += 2; // Above character's head
        this.group.position.x -= 1.2; // Move to the left side, closer to center
        
        // Make bubble face the camera
        const camera = this.scene.userData.camera;
        if (camera) {
            this.group.lookAt(camera.position);
        }
        
        // Show with animation
        this.group.visible = true;
        this.isVisible = true;
        
        // Animate in
        this.animateIn();
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hide();
        }, 5000);
    }

    showMultipleBubbles(chunks, characterPosition) {
        let currentIndex = 0;
        
        const showNextChunk = () => {
            if (currentIndex >= chunks.length) {
                return;
            }
            
            const chunk = chunks[currentIndex];
            this.updateText(chunk);
            
            // Position relative to character
            this.group.position.copy(characterPosition);
            this.group.position.y += 2; // Above character's head
            this.group.position.x -= 1.2; // Move to the left side, closer to center
            
            // Make bubble face the camera
            const camera = this.scene.userData.camera;
            if (camera) {
                this.group.lookAt(camera.position);
            }
            
            // Show with animation
            this.group.visible = true;
            this.isVisible = true;
            
            // Animate in
            this.animateIn();
            
            currentIndex++;
            
            // Show next chunk after delay
            const displayTime = Math.max(2000, chunk.length * 30); // Minimum 2 seconds, 30ms per character
            setTimeout(() => {
                if (currentIndex < chunks.length) {
                    // Hide current bubble and show next
                    this.animateOut(() => {
                        showNextChunk();
                    });
                } else {
                    // Final bubble - auto-hide after display time
                    setTimeout(() => {
                        this.hide();
                    }, displayTime);
                }
            }, displayTime);
        };
        
        showNextChunk();
    }

    hide() {
        if (!this.isVisible) return;
        
        this.animateOut(() => {
            this.group.visible = false;
            this.isVisible = false;
        });
    }

    animateIn() {
        // Start small and scale up
        this.group.scale.set(0.1, 0.1, 0.1);
        
        // Animate scale to normal size
        const startScale = 0.1;
        const endScale = 1;
        const duration = 300; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            const scale = startScale + (endScale - startScale) * eased;
            
            this.group.scale.set(scale, scale, scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    animateOut(callback) {
        const startScale = 1;
        const endScale = 0.1;
        const duration = 300; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-in)
            const eased = Math.pow(progress, 3);
            const scale = startScale + (endScale - startScale) * eased;
            
            this.group.scale.set(scale, scale, scale);
            
            if (progress >= 1) {
                if (callback) callback();
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    update() {
        if (!this.isVisible) return;
        
        // Make bubble always face the camera
        const camera = this.scene.userData.camera;
        if (camera) {
            this.group.lookAt(camera.position);
        }
    }

    dispose() {
        if (this.textTexture) {
            this.textTexture.dispose();
        }
        if (this.textMaterial) {
            this.textMaterial.dispose();
        }
        if (this.group) {
            this.scene.remove(this.group);
        }
    }
}