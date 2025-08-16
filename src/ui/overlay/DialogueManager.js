class DialogueManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = {};
        this.isInitialized = false;
        
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        // Create dialogue container
        const dialogueContainer = document.createElement('div');
        dialogueContainer.id = 'dialogue-container';
        dialogueContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            max-width: 600px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            color: white;
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: none;
            transition: opacity 0.3s ease;
        `;

        // Create character name display
        const characterName = document.createElement('div');
        characterName.id = 'character-name';
        characterName.style.cssText = `
            font-size: 14px;
            color: #888;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        characterName.textContent = 'INTERROGATING: Nobody';


        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        // Create question input
        const questionInput = document.createElement('input');
        questionInput.id = 'question-input';
        questionInput.type = 'text';
        questionInput.placeholder = 'Ask a question...';
        questionInput.style.cssText = `
            flex: 1;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            color: white;
            font-family: inherit;
            font-size: 14px;
        `;

        // Create ask button
        const askButton = document.createElement('button');
        askButton.id = 'ask-button';
        askButton.textContent = 'ASK';
        askButton.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            border-radius: 5px;
            color: white;
            font-family: inherit;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        `;

        // Create status display
        const statusDisplay = document.createElement('div');
        statusDisplay.id = 'status-display';
        statusDisplay.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-top: 10px;
            min-height: 20px;
        `;

        // Assemble UI
        inputContainer.appendChild(questionInput);
        inputContainer.appendChild(askButton);
        
        dialogueContainer.appendChild(characterName);
        dialogueContainer.appendChild(inputContainer);
        dialogueContainer.appendChild(statusDisplay);

        document.body.appendChild(dialogueContainer);

        // Store element references
        this.elements = {
            container: dialogueContainer,
            characterName: characterName,
            questionInput: questionInput,
            askButton: askButton,
            statusDisplay: statusDisplay
        };

        this.isInitialized = true;
    }

    bindEvents() {
        if (!this.isInitialized) return;

        // Ask button click
        this.elements.askButton.addEventListener('click', () => {
            this.handleQuestionSubmit();
        });

        // Enter key in input
        this.elements.questionInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleQuestionSubmit();
            }
        });

        // Button hover effects
        this.elements.askButton.addEventListener('mouseenter', () => {
            this.elements.askButton.style.background = '#45a049';
        });

        this.elements.askButton.addEventListener('mouseleave', () => {
            this.elements.askButton.style.background = '#4CAF50';
        });

        // Input focus effects
        this.elements.questionInput.addEventListener('focus', () => {
            this.elements.questionInput.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });

        this.elements.questionInput.addEventListener('blur', () => {
            this.elements.questionInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
    }

    async handleQuestionSubmit() {
        const question = this.elements.questionInput.value.trim();
        
        if (!question) {
            this.showStatus('Please enter a question', 'error');
            return;
        }

        // Disable input while processing
        this.setInputState(false);
        this.showStatus('Processing question...', 'info');

        try {
            // Submit question to game engine
            const success = await this.gameEngine.askQuestion(question);
            
            // Only clear input and status if question was processed successfully
            if (success !== false) {
                this.elements.questionInput.value = '';
                this.showStatus('', '');
            }
            
        } catch (error) {
            console.error('Error submitting question:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.setInputState(true);
        }
    }

    setInputState(enabled) {
        this.elements.questionInput.disabled = !enabled;
        this.elements.askButton.disabled = !enabled;
        
        if (enabled) {
            this.elements.askButton.style.background = '#4CAF50';
            this.elements.askButton.textContent = 'ASK';
        } else {
            this.elements.askButton.style.background = '#666';
            this.elements.askButton.textContent = 'WAIT...';
        }
    }

    displayMessage(message, type = 'character') {
        // Show 3D speech bubble for character responses
        if (type === 'character') {
            this.show3DSpeechBubble(message);
        }
        // User messages no longer displayed in UI - only 3D speech bubbles for characters
    }


    formatCharacterMessage(message) {
        let formatted = this.escapeHtml(message);
        
        // Format body language/actions in italics
        formatted = formatted.replace(/\*(.*?)\*/g, '<em style="color: #aaa;">*$1*</em>');
        
        // Format emotional indicators
        formatted = formatted.replace(/\[(.*?)\]/g, '<span style="color: #ffa500;">[${1}]</span>');
        
        return formatted;
    }

    updateCharacterName(characterName) {
        console.log('DialogueManager.updateCharacterName called with:', characterName);
        if (this.elements.characterName) {
            this.elements.characterName.textContent = `INTERROGATING: ${characterName.toUpperCase()}`;
        }
        
        // Show dialogue panel when character is selected
        this.showDialoguePanel();
        
        // Hide 3D speech bubble when switching characters
        this.hide3DSpeechBubble();
    }

    showDialoguePanel() {
        console.log('DialogueManager.showDialoguePanel called');
        console.log('Elements available:', !!this.elements.container);
        if (this.elements.container) {
            console.log('Setting display block and opacity 1');
            this.elements.container.style.display = 'block';
            this.elements.container.style.opacity = '1';
        }
    }

    hideDialoguePanel() {
        if (this.elements.container) {
            this.elements.container.style.opacity = '0';
            setTimeout(() => {
                this.elements.container.style.display = 'none';
            }, 300);
        }
    }

    show3DSpeechBubble(message) {
        // Use scene manager's 3D speech bubble
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.showSpeechBubble(message);
        }
    }

    hide3DSpeechBubble() {
        // Hide scene manager's 3D speech bubble
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.hideSpeechBubble();
        }
    }

    getCurrentCharacterName() {
        const currentCharacter = this.gameEngine.getCurrentCharacter();
        return currentCharacter ? currentCharacter.getName() : 'Unknown';
    }

    showStatus(message, type = 'info') {
        if (!this.elements.statusDisplay) return;

        let color = '#888';
        if (type === 'error') color = '#ff6b6b';
        if (type === 'success') color = '#4CAF50';
        if (type === 'warning') color = '#ffa500';

        this.elements.statusDisplay.style.color = color;
        
        // Handle multi-line messages
        if (message.includes('\n')) {
            this.elements.statusDisplay.innerHTML = message
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('<br>');
        } else {
            this.elements.statusDisplay.textContent = message;
        }

        // Auto-clear status after a few seconds
        if (message && type !== 'error') {
            setTimeout(() => {
                if (this.elements.statusDisplay.innerHTML === message || this.elements.statusDisplay.textContent === message) {
                    this.elements.statusDisplay.textContent = '';
                }
            }, 3000);
        }
    }

    loadConversationHistory(history) {
        // Conversation history no longer displayed in UI
        // History is maintained in state for context but not shown
    }

    clearConversation() {
        // No conversation display to clear
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    show() {
        if (this.elements.container) {
            this.elements.container.style.display = 'block';
        }
    }

    hide() {
        if (this.elements.container) {
            this.elements.container.style.display = 'none';
        }
    }

    focusInput() {
        if (this.elements.questionInput) {
            this.elements.questionInput.focus();
        }
    }
}