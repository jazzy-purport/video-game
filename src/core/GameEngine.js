class GameEngine {
    constructor() {
        this.stateManager = null;
        this.sceneManager = null;
        this.dialogueManager = null;
        this.characterSelector = null;
        this.llm = null;
        this.promptEngine = null;
        this.responseProcessor = null;
        this.questionProcessor = null;
        
        this.characterLoader = null;
        this.currentCharacterId = null;
        this.isInitialized = false;
        this.isProcessing = false;
        
        this.init().catch(error => {
            console.error('Failed to initialize Game Engine:', error);
        });
    }

    async init() {
        try {
            // Initialize core systems
            this.stateManager = new StateManager();
            this.llm = new LLMInterface();
            this.promptEngine = new PromptEngine();
            this.responseProcessor = new ResponseProcessor();
            this.questionProcessor = new QuestionProcessor();
            
            // Wait for environment to load
            await this.llm.loadEnvironment();
            
            // Load characters from JS module
            this.characterLoader = new CharacterLoader();
            
            // Use character data from global variable (loaded by characters.js)
            if (typeof window.galleryMurderCharacters !== 'undefined') {
                const loaded = this.characterLoader.loadCaseSync('gallery-murder', window.galleryMurderCharacters);
                if (!loaded) {
                    throw new Error('Failed to load characters from module data');
                }
            } else {
                throw new Error('Character data not loaded - make sure characters.js is included before GameEngine.js');
            }
            
            console.log('Characters loaded:', this.characterLoader.getCharacterIds());
            
            // Initialize dialogue manager
            this.dialogueManager = new DialogueManager(this);
            
            // Initialize character selector
            this.characterSelector = new CharacterSelector(this);
            
            // Wait for scene manager to be ready
            this.waitForSceneManager();
            
            console.log('Game Engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Game Engine:', error);
        }
    }

    waitForSceneManager() {
        // Wait for the global sceneManager to be available and fully initialized
        const checkSceneManager = () => {
            if (window.sceneManager && window.sceneManager.isFullyInitialized) {
                this.sceneManager = window.sceneManager;
                this.finalizeInitialization();
            } else {
                setTimeout(checkSceneManager, 50);
            }
        };
        
        checkSceneManager();
    }

    finalizeInitialization() {
        // Pass character data to scene manager for rendering
        this.sceneManager.setCharacterLoader(this.characterLoader);
        
        this.isInitialized = true;
        
        // Show instructions
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        console.log('=== DETECTIVE INTERROGATION GAME ===');
        console.log('Controls:');
        console.log('- Click suspects in top-right list to select');
        console.log('- Type questions in the dialogue box');
        console.log('- Configure LLM: gameEngine.configureLLM({apiKey: "your-key"})');
        console.log('=====================================');
        
        // Don't show status message since dialogue panel is hidden
    }

    handleCharacterSwitch(characterId) {
        const character = this.characterLoader.getCharacter(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return;
        }

        // Update current character state
        this.currentCharacterId = characterId;
        
        // Update state manager
        this.stateManager.setCurrentCharacter(characterId);
        
        // Tell scene manager to render this character
        this.sceneManager.renderCharacter(characterId);
        
        // Update dialogue manager
        this.dialogueManager.updateCharacterName(character.getName());
        
        // Update character selector
        if (this.characterSelector) {
            this.characterSelector.onCharacterSwitched(characterId);
        }
        
        // Load conversation history for this character
        const history = this.stateManager.getConversationHistory(characterId);
        this.dialogueManager.loadConversationHistory(history);
        
        console.log(`Switched to interrogating: ${character.getName()}`);
    }

    async askQuestion(question) {
        if (!this.isInitialized) {
            throw new Error('Game engine not fully initialized');
        }

        if (this.isProcessing) {
            throw new Error('Already processing a question');
        }

        const currentCharacter = this.getCurrentCharacter();
        if (!currentCharacter) {
            this.dialogueManager.showStatus('Please select a suspect first before asking questions.', 'warning');
            return false;
        }

        this.isProcessing = true;

        try {
            // Process and validate question
            const processedQuestion = this.questionProcessor.processQuestion(question);
            
            // Check if question is valid
            if (!processedQuestion.isValid) {
                const errorMessage = this.questionProcessor.formatErrors(processedQuestion);
                this.dialogueManager.showStatus(errorMessage, 'error');
                this.isProcessing = false; // Reset processing state before returning
                return false; // Return false to indicate validation failure
            }
            
            // Show warnings if any (but continue processing)
            if (processedQuestion.warnings.length > 0) {
                const warningMessage = processedQuestion.warnings.join('. ');
                this.dialogueManager.showStatus(warningMessage, 'warning');
            }
            
            // Display user question
            this.dialogueManager.displayMessage(processedQuestion.cleaned, 'user');
            
            // Save user message to history
            this.stateManager.addMessage(
                currentCharacter.getId(), 
                'user', 
                processedQuestion.cleaned
            );

            // Generate response
            const response = await this.generateCharacterResponse(
                currentCharacter, 
                processedQuestion.cleaned
            );

            // Apply emotion to character
            if (response.emotion && currentCharacter.setEmotion) {
                currentCharacter.setEmotion(response.emotion, true);
            }

            // Check for victory condition
            if (response.state === 'END') {
                this.handleVictoryCondition(currentCharacter, response);
                return; // Stop processing here
            }

            // Display character response
            this.dialogueManager.displayMessage(response.cleanedContent, 'character');
            
            // Save character response to history with context
            this.stateManager.addMessage(
                currentCharacter.getId(), 
                'character', 
                response.cleanedContent,
                response.timestamp,
                response.context
            );

        } catch (error) {
            console.error('Error processing question:', error);
            this.dialogueManager.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async generateCharacterResponse(character, question) {
        const conversationHistory = this.stateManager.getConversationHistory(character.getId());
        const gameContext = {
            totalQuestions: this.stateManager.getTotalQuestions(),
            gameDuration: this.stateManager.getGameDuration()
        };

        // Generate prompt
        const prompt = this.promptEngine.generatePrompt(
            character.definition, 
            question, 
            conversationHistory, 
            gameContext
        );

        // Debug: Log the full prompt being sent to LLM
        console.log('=== LLM PROMPT DEBUG ===');
        console.log('Character:', character.getName());
        console.log('Question:', question);
        console.log('Conversation History Length:', conversationHistory.length);
        console.log('Full Prompt:');
        console.log('---');
        console.log(prompt);
        console.log('---');
        console.log('=== END LLM PROMPT ===');

        // Get LLM response
        let rawResponse;
        console.log('LLM configured?', this.llm.isConfigured());
        
        if (this.llm.isConfigured()) {
            console.log('Making real API call to OpenAI');
            rawResponse = await this.llm.sendMessage(prompt, {
                characterName: character.getName(),
                temperature: this.getCharacterTemperature(character)
            });
        } else {
            console.log('Using mock response (no API key)');
            // Use mock response for development
            rawResponse = await this.llm.mockResponse(prompt, {
                characterName: character.getName()
            });
        }

        // Process response
        const processedResponse = this.responseProcessor.processResponse(rawResponse, character);
        
        // Debug: Log the LLM response and processed data
        console.log('=== LLM RESPONSE DEBUG ===');
        console.log('Raw Response:', rawResponse.content);
        console.log('Processed Data:');
        console.log('- Emotion:', processedResponse.emotion);
        console.log('- Message:', processedResponse.message);
        console.log('- Context:', processedResponse.context);
        console.log('- State:', processedResponse.state);
        console.log('=== END LLM RESPONSE ===');
        
        return processedResponse;
    }

    getCharacterTemperature(character) {
        // Adjust LLM temperature based on character traits
        const personality = character.definition.personality || {};
        
        if (character.definition.role === 'culprit') {
            return 0.8; // More varied responses for nervousness
        }
        
        if (personality.nervousness > 0.5) {
            return 0.9; // Higher variability for nervous characters
        }
        
        return 0.7; // Default temperature
    }

    getCurrentCharacter() {
        if (!this.currentCharacterId || !this.characterLoader) return null;
        return this.characterLoader.getCharacter(this.currentCharacterId);
    }

    getCurrentCharacterId() {
        return this.currentCharacterId;
    }

    switchCharacter(characterId) {
        this.handleCharacterSwitch(characterId);
    }

    handleVictoryCondition(character, response) {
        console.log('🎉 VICTORY! Suspect has confessed!');
        
        // Display the confession
        this.dialogueManager.displayMessage(response.cleanedContent, 'character');
        
        // Save the confession to history
        this.stateManager.addMessage(
            character.getId(), 
            'character', 
            response.cleanedContent,
            response.timestamp,
            response.context
        );
        
        // Disable further input
        this.isProcessing = true;
        
        // Show victory overlay after speech bubble has time to display
        setTimeout(() => {
            this.showVictoryOverlay(character);
        }, 10000);
    }

    showVictoryOverlay(character) {
        // Create victory overlay if it doesn't exist
        if (!window.victoryOverlay) {
            window.victoryOverlay = new VictoryOverlay();
        }
        
        // Get game stats
        const gameStats = this.getGameStats();
        
        // Show the victory overlay
        window.victoryOverlay.show(character, gameStats);
        
        // Also log to console
        const victoryMessage = `
=== CASE CLOSED ===

Detective, you've successfully solved the murder of Victoria Sterling!

CULPRIT: ${character.getName()}
ROLE: ${character.role}

Your skillful interrogation and evidence presentation led to a full confession.
The case is now closed and justice will be served.

Excellent detective work!
        `;
        
        console.log(victoryMessage);
    }

    // Character data access methods for UI components
    getAllCharacters() {
        return this.characterLoader ? this.characterLoader.getAllCharacters() : [];
    }

    getCharacterIds() {
        return this.characterLoader ? this.characterLoader.getCharacterIds() : [];
    }

    getCharacter(characterId) {
        return this.characterLoader ? this.characterLoader.getCharacter(characterId) : null;
    }

    // Configuration methods
    configureLLM(config) {
        this.llm.configure(config);
        const status = config.apiKey ? 'LLM configured with API key' : 'LLM configuration updated';
        this.dialogueManager.showStatus(status, 'success');
        console.log('LLM configured:', this.llm.getConfiguration());
    }

    // Game state methods
    saveGame() {
        this.stateManager.saveGameState();
        this.dialogueManager.showStatus('Game saved', 'success');
    }

    loadGame() {
        const loaded = this.stateManager.loadGameState();
        if (loaded) {
            // Refresh conversation display
            const currentCharacter = this.getCurrentCharacter();
            if (currentCharacter) {
                const history = this.stateManager.getConversationHistory(currentCharacter.getId());
                this.dialogueManager.loadConversationHistory(history);
            }
            this.dialogueManager.showStatus('Game loaded', 'success');
        } else {
            this.dialogueManager.showStatus('No saved game found', 'warning');
        }
    }

    resetGame() {
        this.stateManager.resetGame();
        this.dialogueManager.clearConversation();
        this.dialogueManager.showStatus('Game reset', 'info');
    }

    // Utility methods
    getGameStats() {
        return this.stateManager.getGameStats();
    }


    // Debug methods
    enableDebugMode() {
        window.gameEngine = this;
        console.log('Debug mode enabled. Access game engine via window.gameEngine');
    }

    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            isProcessing: this.isProcessing,
            currentCharacter: this.getCurrentCharacter()?.getName(),
            llmConfigured: this.llm.isConfigured(),
            gameStats: this.getGameStats()
        };
    }
}