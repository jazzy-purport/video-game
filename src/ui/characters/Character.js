class Character {
    constructor(definition) {
        this.definition = definition;
        this.group = null;
        this.isVisible = false;
        this.emotionController = new EmotionController();
        
        this.createCharacterModel();
    }

    createCharacterModel() {
        this.group = new THREE.Group();
        
        // Create materials from definition
        const materials = this.createMaterials();
        
        // Create chair
        this.createChair(materials.chair);
        
        // Create character body
        this.createBody(materials);
        
        // Position the entire character group
        this.group.position.set(0, 0.45, -1.0); // chairSeatHeight, slightly away from table
        
        // Start hidden by default
        this.group.visible = false;
    }

    createMaterials() {
        return {
            skin: new THREE.MeshStandardMaterial({ 
                color: this.definition.appearance.skinTone,
                roughness: 0.4, // Smoother skin
                metalness: 0.0,
                flatShading: false // Ensure smooth shading
            }),
            clothing: new THREE.MeshStandardMaterial({ 
                color: this.definition.appearance.clothingColor,
                roughness: 0.8,
                metalness: 0.0
            }),
            hair: new THREE.MeshStandardMaterial({ 
                color: this.definition.appearance.hairColor,
                roughness: 0.9,
                metalness: 0.0
            }),
            chair: new THREE.MeshStandardMaterial({ 
                color: 0x8b4513,
                roughness: 0.6,
                metalness: 0.1
            }),
            eye: new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                roughness: 0.3,
                metalness: 0.0
            }),
            pupil: new THREE.MeshStandardMaterial({ 
                color: this.definition.appearance.eyeColor,
                roughness: 0.2,
                metalness: 0.0
            }),
            eyebrow: new THREE.MeshStandardMaterial({ 
                color: this.definition.appearance.hairColor,
                roughness: 0.9,
                metalness: 0.0
            }),
            mouth: new THREE.MeshStandardMaterial({ 
                color: 0x8b4513,
                roughness: 0.7,
                metalness: 0.0
            })
        };
    }

    createChair(chairMaterial) {
        const chairSeatHeight = 0.45;
        const chairWidth = 0.5;
        const chairDepth = 0.5;
        const chairBackHeight = 0.5;

        // Chair seat
        const chairSeatGeometry = new THREE.BoxGeometry(chairWidth, 0.05, chairDepth);
        const chairSeat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
        chairSeat.position.set(0, 0, 0);
        chairSeat.castShadow = true;
        chairSeat.receiveShadow = true;
        this.group.add(chairSeat);

        // Chair back
        const chairBackGeometry = new THREE.BoxGeometry(chairWidth, chairBackHeight, 0.05);
        const chairBack = new THREE.Mesh(chairBackGeometry, chairMaterial);
        chairBack.position.set(0, chairBackHeight/2, -0.25);
        chairBack.castShadow = true;
        this.group.add(chairBack);

        // Chair legs
        const chairLegGeometry = new THREE.BoxGeometry(0.03, chairSeatHeight, 0.03);
        const chairLegPositions = [
            [-chairWidth/2 + 0.05, -chairSeatHeight/2, chairDepth/2 - 0.05],
            [chairWidth/2 - 0.05, -chairSeatHeight/2, chairDepth/2 - 0.05],
            [-chairWidth/2 + 0.05, -chairSeatHeight/2, -chairDepth/2 + 0.05],
            [chairWidth/2 - 0.05, -chairSeatHeight/2, -chairDepth/2 + 0.05]
        ];

        chairLegPositions.forEach(pos => {
            const leg = new THREE.Mesh(chairLegGeometry, chairMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
    }

    createBody(materials) {
        // Character group for body parts
        const characterGroup = new THREE.Group();

        // Torso
        const torsoGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.25);
        const torso = new THREE.Mesh(torsoGeometry, materials.clothing);
        torso.position.y = 0.25;
        torso.castShadow = true;
        characterGroup.add(torso);

        // Shoulders
        const shoulderGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, materials.clothing);
        leftShoulder.position.set(-0.25, 0.45, 0);
        leftShoulder.scale.set(1, 0.8, 1);
        characterGroup.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, materials.clothing);
        rightShoulder.position.set(0.25, 0.45, 0);
        rightShoulder.scale.set(1, 0.8, 1);
        characterGroup.add(rightShoulder);

        // Head
        const headGeometry = new THREE.SphereGeometry(this.definition.appearance.headSize || 0.15, 32, 32);
        const head = new THREE.Mesh(headGeometry, materials.skin);
        head.position.y = 0.75;
        head.castShadow = true;
        characterGroup.add(head);

        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.16, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const hair = new THREE.Mesh(hairGeometry, materials.hair);
        hair.position.y = 0.78;
        hair.position.z = -0.02;
        characterGroup.add(hair);

        // Facial features
        this.createFacialFeatures(characterGroup, materials);

        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.1);
        const neck = new THREE.Mesh(neckGeometry, materials.skin);
        neck.position.y = 0.55;
        neck.castShadow = true;
        characterGroup.add(neck);

        // Arms
        this.createArms(characterGroup, materials);

        // Legs
        this.createLegs(characterGroup, materials);

        this.group.add(characterGroup);
    }

    createFacialFeatures(characterGroup, materials) {
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.025, 24, 24); // Increased resolution
        
        const leftEye = new THREE.Mesh(eyeGeometry, materials.eye);
        leftEye.position.set(-0.05, 0.78, 0.13);
        leftEye.scale.set(1, 0.7, 0.5);
        characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, materials.eye);
        rightEye.position.set(0.05, 0.78, 0.13);
        rightEye.scale.set(1, 0.7, 0.5);
        characterGroup.add(rightEye);

        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.01, 16, 16);
        
        const leftPupil = new THREE.Mesh(pupilGeometry, materials.pupil);
        leftPupil.position.set(-0.05, 0.78, 0.14);
        characterGroup.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, materials.pupil);
        rightPupil.position.set(0.05, 0.78, 0.14);
        characterGroup.add(rightPupil);

        // Eyebrows
        const eyebrowGeometry = new THREE.BoxGeometry(0.04, 0.005, 0.01);
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeometry, materials.eyebrow);
        leftEyebrow.position.set(-0.05, 0.82, 0.14);
        leftEyebrow.rotation.z = -0.1;
        characterGroup.add(leftEyebrow);
        
        const rightEyebrow = new THREE.Mesh(eyebrowGeometry, materials.eyebrow);
        rightEyebrow.position.set(0.05, 0.82, 0.14);
        rightEyebrow.rotation.z = 0.1;
        characterGroup.add(rightEyebrow);

        // Nose
        const noseGeometry = new THREE.ConeGeometry(0.015, 0.03, 16); // Increased resolution
        const nose = new THREE.Mesh(noseGeometry, materials.skin);
        nose.position.set(0, 0.75, 0.14);
        nose.rotation.x = Math.PI / 2;
        characterGroup.add(nose);

        // Mouth
        const mouthGeometry = new THREE.BoxGeometry(0.06, 0.01, 0.02);
        const mouth = new THREE.Mesh(mouthGeometry, materials.mouth);
        mouth.position.set(0, 0.7, 0.14);
        characterGroup.add(mouth);

        // Ears
        const earGeometry = new THREE.SphereGeometry(0.025, 24, 24); // Increased resolution
        
        const leftEar = new THREE.Mesh(earGeometry, materials.skin);
        leftEar.position.set(-0.15, 0.75, 0);
        leftEar.scale.set(0.5, 1, 0.8);
        characterGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, materials.skin);
        rightEar.position.set(0.15, 0.75, 0);
        rightEar.scale.set(0.5, 1, 0.8);
        characterGroup.add(rightEar);
    }

    createArms(characterGroup, materials) {
        const armLength = 0.45;
        const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, armLength);
        
        // Arm and hand positions
        const leftShoulderPos = { x: -0.25, y: 0.45, z: 0 };
        const leftHandPos = { x: -0.3, y: 0.05, z: 0.2 };
        const rightShoulderPos = { x: 0.25, y: 0.45, z: 0 };
        const rightHandPos = { x: 0.3, y: 0.05, z: 0.2 };

        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, materials.clothing);
        leftArm.position.set(
            (leftShoulderPos.x + leftHandPos.x) / 2,
            (leftShoulderPos.y + leftHandPos.y) / 2,
            (leftShoulderPos.z + leftHandPos.z) / 2
        );
        leftArm.lookAt(leftHandPos.x, leftHandPos.y, leftHandPos.z);
        leftArm.rotateX(Math.PI / 2);
        leftArm.castShadow = true;
        characterGroup.add(leftArm);

        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, materials.clothing);
        rightArm.position.set(
            (rightShoulderPos.x + rightHandPos.x) / 2,
            (rightShoulderPos.y + rightHandPos.y) / 2,
            (rightShoulderPos.z + rightHandPos.z) / 2
        );
        rightArm.lookAt(rightHandPos.x, rightHandPos.y, rightHandPos.z);
        rightArm.rotateX(Math.PI / 2);
        rightArm.castShadow = true;
        characterGroup.add(rightArm);

        // Hands
        const handGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        
        const leftHand = new THREE.Mesh(handGeometry, materials.skin);
        leftHand.position.set(leftHandPos.x, leftHandPos.y, leftHandPos.z);
        leftHand.castShadow = true;
        characterGroup.add(leftHand);

        const rightHand = new THREE.Mesh(handGeometry, materials.skin);
        rightHand.position.set(rightHandPos.x, rightHandPos.y, rightHandPos.z);
        rightHand.castShadow = true;
        characterGroup.add(rightHand);
    }

    createLegs(characterGroup, materials) {
        const thighLength = 0.35;
        const shinLength = 0.45; // Longer shin to reach from knee to floor
        
        // Thigh geometry (horizontal when sitting)
        const thighGeometry = new THREE.CylinderGeometry(0.05, 0.05, thighLength);
        // Shin geometry (vertical when sitting)
        const shinGeometry = new THREE.CylinderGeometry(0.05, 0.05, shinLength);
        
        // Calculate positions for proper sitting pose
        // Thighs extend horizontally forward from torso
        const leftThighPos = { x: -0.1, y: 0.05, z: 0.175 }; // Forward from body
        const rightThighPos = { x: 0.1, y: 0.05, z: 0.175 };
        
        // Knees at the end of thighs
        const leftKneePos = { x: -0.1, y: 0.05, z: 0.35 }; // At end of thigh
        const rightKneePos = { x: 0.1, y: 0.05, z: 0.35 };
        
        // Shins hang down from knees to feet
        const leftShinPos = { x: -0.1, y: -0.175, z: 0.35 }; // Positioned to reach from knee to floor
        const rightShinPos = { x: 0.1, y: -0.175, z: 0.35 };
        
        // Left thigh (horizontal)
        const leftThigh = new THREE.Mesh(thighGeometry, materials.clothing);
        leftThigh.position.set(leftThighPos.x, leftThighPos.y, leftThighPos.z);
        leftThigh.rotation.x = Math.PI / 2; // Rotate to horizontal
        leftThigh.castShadow = true;
        characterGroup.add(leftThigh);
        
        // Right thigh (horizontal)
        const rightThigh = new THREE.Mesh(thighGeometry, materials.clothing);
        rightThigh.position.set(rightThighPos.x, rightThighPos.y, rightThighPos.z);
        rightThigh.rotation.x = Math.PI / 2; // Rotate to horizontal
        rightThigh.castShadow = true;
        characterGroup.add(rightThigh);
        
        // Knees
        const kneeGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        
        const leftKnee = new THREE.Mesh(kneeGeometry, materials.clothing);
        leftKnee.position.set(leftKneePos.x, leftKneePos.y, leftKneePos.z);
        leftKnee.scale.set(1, 0.8, 1); // Slightly flattened
        leftKnee.castShadow = true;
        characterGroup.add(leftKnee);
        
        const rightKnee = new THREE.Mesh(kneeGeometry, materials.clothing);
        rightKnee.position.set(rightKneePos.x, rightKneePos.y, rightKneePos.z);
        rightKnee.scale.set(1, 0.8, 1); // Slightly flattened
        rightKnee.castShadow = true;
        characterGroup.add(rightKnee);
        
        // Left shin (vertical down from knee)
        const leftShin = new THREE.Mesh(shinGeometry, materials.clothing);
        leftShin.position.set(leftShinPos.x, leftShinPos.y, leftShinPos.z);
        // No rotation needed - already vertical
        leftShin.castShadow = true;
        characterGroup.add(leftShin);
        
        // Right shin (vertical down from knee)
        const rightShin = new THREE.Mesh(shinGeometry, materials.clothing);
        rightShin.position.set(rightShinPos.x, rightShinPos.y, rightShinPos.z);
        // No rotation needed - already vertical
        rightShin.castShadow = true;
        characterGroup.add(rightShin);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(0.08, 0.04, 0.15);
        
        const leftFoot = new THREE.Mesh(footGeometry, materials.clothing);
        leftFoot.position.set(-0.1, 0.02, 0.35); // On the floor (y = 0 + half foot height)
        leftFoot.castShadow = true;
        characterGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, materials.clothing);
        rightFoot.position.set(0.1, 0.02, 0.35); // On the floor (y = 0 + half foot height)
        rightFoot.castShadow = true;
        characterGroup.add(rightFoot);
    }

    show() {
        if (this.group && !this.isVisible) {
            this.group.visible = true;
            this.isVisible = true;
            // Reset to normal emotion when character is shown to ensure clean state
            this.resetEmotion(false);
        }
    }

    hide() {
        if (this.group) {
            this.group.visible = false;
            this.isVisible = false;
        }
    }

    addToScene(scene) {
        if (this.group) {
            scene.add(this.group);
        }
    }

    removeFromScene(scene) {
        if (this.group) {
            scene.remove(this.group);
        }
    }

    getName() {
        return this.definition.name;
    }

    getId() {
        return this.definition.id;
    }

    setEmotion(emotion, smooth = true) {
        if (this.emotionController) {
            this.emotionController.applyEmotion(this, emotion, smooth);
        }
    }

    getCurrentEmotion() {
        return this.emotionController ? this.emotionController.getCurrentEmotion() : 'normal';
    }

    resetEmotion(smooth = true) {
        if (this.emotionController) {
            this.emotionController.resetToNormal(this, smooth);
        }
    }
}