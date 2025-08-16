class CharacterSelector {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.container = null;
        this.characterButtons = [];
        this.currentCharacterId = null;
        
        this.createUI();
        this.updateCharacterList();
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'character-selector';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            color: white;
            backdrop-filter: blur(5px);
            z-index: 1000;
            min-width: 200px;
        `;

        // Create title
        const title = document.createElement('div');
        title.textContent = 'SUSPECTS';
        title.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
        `;

        this.container.appendChild(title);
        document.body.appendChild(this.container);
    }

    updateCharacterList() {
        // Wait for game engine to have characters loaded
        if (!this.gameEngine.characterLoader) {
            setTimeout(() => this.updateCharacterList(), 100);
            return;
        }

        // Clear existing buttons
        this.characterButtons.forEach(button => button.remove());
        this.characterButtons = [];

        // Get all characters from game engine
        const characters = this.gameEngine.getAllCharacters();
        
        characters.forEach((character, index) => {
            const button = this.createCharacterButton(character, index);
            this.characterButtons.push(button);
            this.container.appendChild(button);
        });

        // No initial selection - wait for user to choose
    }

    createCharacterButton(character, index) {
        const button = document.createElement('button');
        button.textContent = character.getName();
        button.setAttribute('data-character-id', character.getId());
        
        button.style.cssText = `
            display: block;
            width: 100%;
            padding: 10px;
            margin-bottom: 5px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            color: white;
            font-family: inherit;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        `;

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('active')) {
                button.style.background = 'rgba(255, 255, 255, 0.2)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });

        // Add click handler
        button.addEventListener('click', () => {
            this.selectCharacter(character.getId());
        });

        // Add keyboard shortcut indicator
        const shortcut = document.createElement('span');
        shortcut.textContent = ` (${index + 1})`;
        shortcut.style.cssText = `
            color: #888;
            font-size: 11px;
        `;
        button.appendChild(shortcut);

        return button;
    }

    selectCharacter(characterId) {
        if (this.currentCharacterId === characterId) return;

        // Switch character in game engine
        this.gameEngine.switchCharacter(characterId);
    }

    setActiveCharacter(characterId) {
        this.currentCharacterId = characterId;

        // Update button states
        this.characterButtons.forEach(button => {
            const buttonCharacterId = button.getAttribute('data-character-id');
            
            if (buttonCharacterId === characterId) {
                button.classList.add('active');
                button.style.background = '#4CAF50';
                button.style.borderColor = '#45a049';
                button.style.color = 'white';
            } else {
                button.classList.remove('active');
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                button.style.color = 'white';
            }
        });
    }

    getCurrentCharacterId() {
        return this.currentCharacterId;
    }

    // Handle external character switches (like keyboard shortcuts)
    onCharacterSwitched(characterId) {
        this.setActiveCharacter(characterId);
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}