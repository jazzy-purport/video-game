class StateManager {
    constructor() {
        this.gameState = {
            currentCharacterId: null,
            currentCase: null,
            conversationHistory: new Map(), // characterId -> array of messages
            gameStartTime: Date.now(),
            totalQuestions: 0
        };
    }

    setCurrentCharacter(characterId) {
        this.gameState.currentCharacterId = characterId;
        
        // Initialize conversation history for this character if it doesn't exist
        if (!this.gameState.conversationHistory.has(characterId)) {
            this.gameState.conversationHistory.set(characterId, []);
        }
    }

    getCurrentCharacter() {
        return this.gameState.currentCharacterId;
    }

    setCurrentCase(caseName) {
        this.gameState.currentCase = caseName;
    }

    getCurrentCase() {
        return this.gameState.currentCase;
    }

    addMessage(characterId, type, content, timestamp = Date.now(), context = null) {
        if (!this.gameState.conversationHistory.has(characterId)) {
            this.gameState.conversationHistory.set(characterId, []);
        }

        const message = {
            type: type, // 'user' or 'character'
            content: content,
            timestamp: timestamp,
            characterId: characterId
        };

        // Add context for character responses
        if (type === 'character' && context) {
            message.context = context;
        }

        this.gameState.conversationHistory.get(characterId).push(message);

        if (type === 'user') {
            this.gameState.totalQuestions++;
        }
    }

    getConversationHistory(characterId = null) {
        const targetCharacterId = characterId || this.gameState.currentCharacterId;
        
        if (!targetCharacterId) {
            return [];
        }

        return this.gameState.conversationHistory.get(targetCharacterId) || [];
    }

    getAllConversations() {
        const allConversations = {};
        
        for (const [characterId, messages] of this.gameState.conversationHistory) {
            allConversations[characterId] = messages;
        }
        
        return allConversations;
    }

    getRecentMessages(characterId = null, count = 5) {
        const history = this.getConversationHistory(characterId);
        return history.slice(-count);
    }

    getTotalQuestions() {
        return this.gameState.totalQuestions;
    }

    getGameDuration() {
        return Date.now() - this.gameState.gameStartTime;
    }

    clearConversation(characterId = null) {
        const targetCharacterId = characterId || this.gameState.currentCharacterId;
        
        if (targetCharacterId && this.gameState.conversationHistory.has(targetCharacterId)) {
            this.gameState.conversationHistory.set(targetCharacterId, []);
        }
    }

    clearAllConversations() {
        this.gameState.conversationHistory.clear();
        this.gameState.totalQuestions = 0;
    }

    // Save/load functionality for persistence
    saveGameState() {
        const saveData = {
            ...this.gameState,
            conversationHistory: Object.fromEntries(this.gameState.conversationHistory)
        };
        
        localStorage.setItem('detectiveGameState', JSON.stringify(saveData));
    }

    loadGameState() {
        try {
            const savedData = localStorage.getItem('detectiveGameState');
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.gameState = {
                    ...parsedData,
                    conversationHistory: new Map(Object.entries(parsedData.conversationHistory || {}))
                };
                
                return true;
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
        
        return false;
    }

    resetGame() {
        this.gameState = {
            currentCharacterId: null,
            currentCase: null,
            conversationHistory: new Map(),
            gameStartTime: Date.now(),
            totalQuestions: 0
        };
    }

    getGameStats() {
        return {
            currentCharacter: this.gameState.currentCharacterId,
            currentCase: this.gameState.currentCase,
            totalQuestions: this.gameState.totalQuestions,
            gameDuration: this.getGameDuration(),
            charactersSpokenTo: Array.from(this.gameState.conversationHistory.keys())
        };
    }
}