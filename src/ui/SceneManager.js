class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.characterLoader = null;
        this.currentlyRenderedCharacter = null;
        this.speechBubble3D = null;
        this.isFullyInitialized = false;
        
        this.init();
        this.createInterrogationRoom();
        this.initializeCharacters();
        this.initializeSpeechBubble();
        this.animate();
        
        // Mark as fully initialized
        this.isFullyInitialized = true;
        console.log('SceneManager fully initialized');
    }

    createCeilingLights(roomWidth, roomDepth, roomHeight) {
        // Add diffuse ambient lighting for darker atmosphere
        const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.15); // Cooler, dimmer ambient light
        this.scene.add(ambientLight);

        // Add a subtle directional light for more diffuse lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
        directionalLight.position.set(2, roomHeight - 1, 2);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = false; // Disable shadows for more diffuse effect
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
    }

    setupMouseCameraControl() {
        // Camera movement parameters
        this.cameraControl = {
            basePosition: { x: 0, y: 1.3, z: 2 }, // Lowered from y: 1.6 to y: 1.3
            baseTarget: { x: 0, y: 1.2, z: 0 },
            maxMovement: { x: 0.3, y: 0.2, z: 0.1 }, // Maximum offset from base position
            mouseSensitivity: 0.001,
            smoothing: 0.1,
            currentOffset: { x: 0, y: 0, z: 0 },
            targetOffset: { x: 0, y: 0, z: 0 },
            mouse: { x: 0, y: 0 }
        };

        // Set initial camera position
        this.camera.position.set(
            this.cameraControl.basePosition.x,
            this.cameraControl.basePosition.y,
            this.cameraControl.basePosition.z
        );
        this.camera.lookAt(
            this.cameraControl.baseTarget.x,
            this.cameraControl.baseTarget.y,
            this.cameraControl.baseTarget.z
        );

        // Mouse move listener
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        }, false);

        // Reset camera when mouse leaves the canvas
        this.renderer.domElement.addEventListener('mouseleave', () => {
            this.cameraControl.targetOffset = { x: 0, y: 0, z: 0 };
        }, false);
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        // Normalize mouse coordinates to -1 to 1
        this.cameraControl.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.cameraControl.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Calculate target camera offset based on mouse position
        this.cameraControl.targetOffset.x = this.cameraControl.mouse.x * this.cameraControl.maxMovement.x;
        this.cameraControl.targetOffset.y = this.cameraControl.mouse.y * this.cameraControl.maxMovement.y;
        this.cameraControl.targetOffset.z = this.cameraControl.mouse.x * this.cameraControl.maxMovement.z;
    }

    updateCameraPosition() {
        // Smoothly interpolate current offset towards target offset
        this.cameraControl.currentOffset.x += (this.cameraControl.targetOffset.x - this.cameraControl.currentOffset.x) * this.cameraControl.smoothing;
        this.cameraControl.currentOffset.y += (this.cameraControl.targetOffset.y - this.cameraControl.currentOffset.y) * this.cameraControl.smoothing;
        this.cameraControl.currentOffset.z += (this.cameraControl.targetOffset.z - this.cameraControl.currentOffset.z) * this.cameraControl.smoothing;

        // Apply offset to base position
        this.camera.position.set(
            this.cameraControl.basePosition.x + this.cameraControl.currentOffset.x,
            this.cameraControl.basePosition.y + this.cameraControl.currentOffset.y,
            this.cameraControl.basePosition.z + this.cameraControl.currentOffset.z
        );

        // Update camera target with slight offset for more natural movement
        const targetOffset = {
            x: this.cameraControl.currentOffset.x * 0.3,
            y: this.cameraControl.currentOffset.y * 0.3,
            z: 0
        };

        this.camera.lookAt(
            this.cameraControl.baseTarget.x + targetOffset.x,
            this.cameraControl.baseTarget.y + targetOffset.y,
            this.cameraControl.baseTarget.z + targetOffset.z
        );
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 3);
        this.camera.lookAt(0, 1.2, 0);

        // Create renderer with enhanced anti-aliasing
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Support high DPI displays
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);

        // Set up limited camera movement based on mouse
        this.setupMouseCameraControl();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    createInterrogationRoom() {
        // Room dimensions
        const roomWidth = 6;
        const roomDepth = 8;
        const roomHeight = 3;

        // Materials
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x9e9e9e,  // Gray cinderblock color
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
        
        // Create cinderblock texture effect with bump mapping
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create cinderblock pattern
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw block lines
        ctx.strokeStyle = '#7a7a7a';
        ctx.lineWidth = 2;
        
        // Horizontal lines
        for (let y = 0; y < 256; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y);
            ctx.stroke();
        }
        
        // Vertical lines (offset every other row)
        for (let y = 0; y < 256; y += 64) {
            for (let x = 0; x < 256; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 32);
                ctx.stroke();
            }
            for (let x = 32; x < 256; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, y + 32);
                ctx.lineTo(x, y + 64);
                ctx.stroke();
            }
        }
        
        const cinderblockTexture = new THREE.CanvasTexture(canvas);
        cinderblockTexture.wrapS = THREE.RepeatWrapping;
        cinderblockTexture.wrapT = THREE.RepeatWrapping;
        cinderblockTexture.repeat.set(2, 2);
        
        wallMaterial.map = cinderblockTexture;
        
        // Create concrete texture for floor
        const concreteCanvas = document.createElement('canvas');
        concreteCanvas.width = 256;
        concreteCanvas.height = 256;
        const concreteCtx = concreteCanvas.getContext('2d');
        
        // Create concrete base color
        concreteCtx.fillStyle = '#8a8a8a';
        concreteCtx.fillRect(0, 0, 256, 256);
        
        // Add concrete texture variation
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.3;
            concreteCtx.fillStyle = `rgba(${Math.random() > 0.5 ? 120 : 100}, ${Math.random() > 0.5 ? 120 : 100}, ${Math.random() > 0.5 ? 120 : 100}, ${opacity})`;
            concreteCtx.fillRect(x, y, size, size);
        }
        
        const concreteTexture = new THREE.CanvasTexture(concreteCanvas);
        concreteTexture.wrapS = THREE.RepeatWrapping;
        concreteTexture.wrapT = THREE.RepeatWrapping;
        concreteTexture.repeat.set(4, 4);
        
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8a8a8a,  // Concrete floor
            roughness: 0.9,
            metalness: 0.0,
            map: concreteTexture
        });

        const ceilingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf5f5f5,  // Off-white ceiling
            roughness: 0.7,
            metalness: 0.0
        });
        
        // One-way mirror material
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,  // Dark tinted mirror
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = roomHeight;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);

        // Add office-style fluorescent lights
        this.createCeilingLights(roomWidth, roomDepth, roomHeight);

        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.z = -roomDepth / 2;
        backWall.position.y = roomHeight / 2;
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // Front wall (behind camera)
        const frontWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
        const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
        frontWall.position.z = roomDepth / 2;
        frontWall.position.y = roomHeight / 2;
        frontWall.rotation.y = Math.PI;
        frontWall.receiveShadow = true;
        this.scene.add(frontWall);

        // Left wall with one-way mirror
        const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.x = -roomWidth / 2;
        leftWall.position.y = roomHeight / 2;
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // One-way mirror on left wall
        const mirrorWidth = 1.5;
        const mirrorHeight = 1.0;
        const mirrorGeometry = new THREE.PlaneGeometry(mirrorWidth, mirrorHeight);
        const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        mirror.position.x = -roomWidth / 2 + 0.01; // Slightly in front of wall
        mirror.position.y = 1.5; // Eye level height
        mirror.position.z = -1; // Positioned to observe suspect
        mirror.rotation.y = Math.PI / 2;
        this.scene.add(mirror);

        // Right wall
        const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.x = roomWidth / 2;
        rightWall.position.y = roomHeight / 2;
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);

        // Create table
        this.createTable();

        // Add lighting
        this.setupLighting();
    }

    createTable() {
        // Table dimensions
        const tableWidth = 2;
        const tableDepth = 1;
        const tableHeight = 0.75;
        const tableThickness = 0.05;
        const legWidth = 0.05;

        // Table material
        const tableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.3,
            metalness: 0.8
        });

        // Table top
        const tableTopGeometry = new THREE.BoxGeometry(tableWidth, tableThickness, tableDepth);
        const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
        tableTop.position.y = tableHeight;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        this.scene.add(tableTop);

        // Table legs
        const legGeometry = new THREE.BoxGeometry(legWidth, tableHeight, legWidth);
        
        // Front left leg
        const leg1 = new THREE.Mesh(legGeometry, tableMaterial);
        leg1.position.set(-tableWidth/2 + legWidth/2, tableHeight/2, tableDepth/2 - legWidth/2);
        leg1.castShadow = true;
        this.scene.add(leg1);

        // Front right leg
        const leg2 = new THREE.Mesh(legGeometry, tableMaterial);
        leg2.position.set(tableWidth/2 - legWidth/2, tableHeight/2, tableDepth/2 - legWidth/2);
        leg2.castShadow = true;
        this.scene.add(leg2);

        // Back left leg
        const leg3 = new THREE.Mesh(legGeometry, tableMaterial);
        leg3.position.set(-tableWidth/2 + legWidth/2, tableHeight/2, -tableDepth/2 + legWidth/2);
        leg3.castShadow = true;
        this.scene.add(leg3);

        // Back right leg
        const leg4 = new THREE.Mesh(legGeometry, tableMaterial);
        leg4.position.set(tableWidth/2 - legWidth/2, tableHeight/2, -tableDepth/2 + legWidth/2);
        leg4.castShadow = true;
        this.scene.add(leg4);
    }

    initializeCharacters() {
        // Characters will be set by GameEngine after it loads them
        this.characterLoader = null;
    }

    setCharacterLoader(characterLoader) {
        this.characterLoader = characterLoader;
        
        // Add all characters to scene and hide them initially
        this.characterLoader.getAllCharacters().forEach(character => {
            character.addToScene(this.scene);
            character.hide();
        });
        
        console.log('Characters added to scene:', this.characterLoader.getCharacterIds());
    }

    initializeSpeechBubble() {
        // Store camera reference in scene for speech bubble
        this.scene.userData.camera = this.camera;
        
        // Create 3D speech bubble
        this.speechBubble3D = new SpeechBubble3D(this.scene);
    }

    renderCharacter(characterId) {
        // Hide currently rendered character
        if (this.currentlyRenderedCharacter) {
            this.currentlyRenderedCharacter.hide();
        }
        
        // Show new character
        const character = this.characterLoader.getCharacter(characterId);
        if (character) {
            character.show();
            this.currentlyRenderedCharacter = character;
            console.log(`Rendering character: ${character.getName()}`);
        } else {
            console.error(`Cannot render character: ${characterId} not found`);
        }
    }

    getCurrentlyRenderedCharacter() {
        return this.currentlyRenderedCharacter;
    }

    getAvailableCharacters() {
        return this.characterLoader.getCharacterIds();
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main overhead light (harsh interrogation light)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(0, 2.5, 0);
        mainLight.target.position.set(0, 0, 0);
        mainLight.castShadow = true;
        mainLight.shadow.camera.left = -2;
        mainLight.shadow.camera.right = 2;
        mainLight.shadow.camera.top = 2;
        mainLight.shadow.camera.bottom = -2;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 5;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        this.scene.add(mainLight.target);

        // Secondary light for softer shadows
        const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.3);
        secondaryLight.position.set(2, 2, 2);
        this.scene.add(secondaryLight);

        // Back light to separate suspect from background
        const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
        backLight.position.set(0, 2, -3);
        this.scene.add(backLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Maintain high DPI support
    }


    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update camera position based on mouse
        this.updateCameraPosition();
        
        // Update speech bubble to face camera
        if (this.speechBubble3D) {
            this.speechBubble3D.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    showSpeechBubble(message) {
        if (!this.speechBubble3D || !this.currentlyRenderedCharacter) return;
        
        // Get character position
        const characterPosition = new THREE.Vector3();
        this.currentlyRenderedCharacter.group.getWorldPosition(characterPosition);
        
        // Show speech bubble
        this.speechBubble3D.show(message, characterPosition);
    }

    hideSpeechBubble() {
        if (this.speechBubble3D) {
            this.speechBubble3D.hide();
        }
    }
}

// Initialize the scene when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Show intro overlay first
    window.introOverlay = new IntroOverlay();
    
    // Initialize game systems
    window.sceneManager = new SceneManager();
    window.gameEngine = new GameEngine();
    
    // Log instructions
    console.log('=== DETECTIVE INTERROGATION GAME ===');
    console.log('Select suspects from the top-right panel');
    console.log('Configure LLM: gameEngine.configureLLM({apiKey: "your-key"})');
    console.log('Ask questions using the dialogue interface');
    console.log('=====================================');
});