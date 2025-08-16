class QuestionProcessor {
    constructor() {
        this.minQuestionLength = 3;
        this.maxQuestionLength = 500;
        this.bannedWords = ['fuck', 'shit', 'damn']; // Basic profanity filter
        this.questionPatterns = {
            question: /\?$/,
            statement: /[.!]$/,
            incomplete: /[^.!?]$/
        };
    }

    processQuestion(input) {
        const processed = {
            original: input,
            cleaned: this.cleanInput(input),
            isValid: false,
            errors: [],
            warnings: [],
            type: this.determineQuestionType(input),
            suggestions: []
        };

        // Run validation
        this.validateInput(processed);
        
        // Add suggestions if needed
        this.addSuggestions(processed);

        return processed;
    }

    cleanInput(input) {
        if (!input) return '';
        
        // Trim whitespace
        let cleaned = input.trim();
        
        // Remove excessive whitespace
        cleaned = cleaned.replace(/\s+/g, ' ');
        
        // Ensure proper capitalization
        if (cleaned.length > 0) {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        
        // Add question mark if it looks like a question but doesn't have one
        if (this.looksLikeQuestion(cleaned) && !cleaned.endsWith('?')) {
            cleaned += '?';
        }
        
        return cleaned;
    }

    validateInput(processed) {
        const input = processed.cleaned;
        
        // Check if empty
        if (!input || input.length === 0) {
            processed.errors.push('Question cannot be empty');
            return;
        }

        // Check length
        if (input.length < this.minQuestionLength) {
            processed.errors.push(`Question too short (minimum ${this.minQuestionLength} characters)`);
        }
        
        if (input.length > this.maxQuestionLength) {
            processed.errors.push(`Question too long (maximum ${this.maxQuestionLength} characters)`);
        }

        // Check for profanity
        const profanityFound = this.checkProfanity(input);
        if (profanityFound.length > 0) {
            processed.errors.push(`Please keep questions professional (found: ${profanityFound.join(', ')})`);
        }

        // Check for potentially problematic content
        this.checkContent(processed);

        // Mark as valid if no errors
        processed.isValid = processed.errors.length === 0;
    }

    checkProfanity(input) {
        const inputLower = input.toLowerCase();
        return this.bannedWords.filter(word => inputLower.includes(word));
    }

    checkContent(processed) {
        const input = processed.cleaned.toLowerCase();
        
        // Check for non-investigative content
        const inappropriatePatterns = [
            { pattern: /what.*time.*is.*it/i, message: 'Focus on the investigation rather than asking about time' },
            { pattern: /how.*are.*you/i, message: 'This is an interrogation, focus on case-related questions' },
            { pattern: /nice.*weather/i, message: 'Stay focused on the murder investigation' }
        ];

        inappropriatePatterns.forEach(({ pattern, message }) => {
            if (pattern.test(input)) {
                processed.warnings.push(message);
            }
        });

        // Check for good investigative patterns
        const goodPatterns = [
            /where.*were.*you/i,
            /what.*did.*you.*see/i,
            /who.*was.*with/i,
            /when.*did.*you/i,
            /how.*do.*you.*know/i,
            /why.*would/i,
            /can.*you.*explain/i,
            /tell.*me.*about/i
        ];

        const hasGoodPattern = goodPatterns.some(pattern => pattern.test(input));
        if (!hasGoodPattern && processed.warnings.length === 0) {
            processed.warnings.push('Consider asking more specific investigative questions');
        }
    }

    determineQuestionType(input) {
        const inputLower = input.toLowerCase();
        
        if (inputLower.startsWith('where')) return 'location';
        if (inputLower.startsWith('when')) return 'time';
        if (inputLower.startsWith('who')) return 'person';
        if (inputLower.startsWith('what')) return 'description';
        if (inputLower.startsWith('why')) return 'motive';
        if (inputLower.startsWith('how')) return 'method';
        if (inputLower.startsWith('did you') || inputLower.startsWith('have you')) return 'confirmation';
        if (inputLower.startsWith('can you') || inputLower.startsWith('could you')) return 'request';
        if (inputLower.startsWith('tell me')) return 'narrative';
        
        return 'general';
    }

    looksLikeQuestion(input) {
        const questionWords = ['what', 'where', 'when', 'who', 'why', 'how', 'did', 'do', 'does', 'can', 'could', 'would', 'will', 'is', 'are'];
        const firstWord = input.split(' ')[0]?.toLowerCase();
        
        return questionWords.includes(firstWord);
    }

    addSuggestions(processed) {
        if (processed.isValid) return;

        // Suggest improvements based on errors
        if (processed.errors.some(e => e.includes('too short'))) {
            processed.suggestions.push('Try asking a more detailed question about the suspect\'s whereabouts or actions');
        }

        if (processed.errors.some(e => e.includes('too long'))) {
            processed.suggestions.push('Break this into multiple shorter questions');
        }

        // Suggest better question types
        if (processed.type === 'general') {
            processed.suggestions.push('Try starting with: "Where were you...", "What did you see...", or "Who was with you..."');
        }
    }

    // Get sample questions for help
    getSampleQuestions() {
        return [
            "Where were you between 8:30 and 9:15 PM?",
            "What did you see in Victoria's office?",
            "Who was with you during the gallery opening?",
            "When did you last speak to Victoria?",
            "How well did you know the victim?",
            "Why were you in that area of the gallery?",
            "Can you explain the argument witnesses heard?",
            "Tell me about your relationship with Victoria.",
            "Did you notice anything unusual that evening?",
            "What time did you arrive at the gallery?"
        ];
    }

    // Format error messages for display
    formatErrors(processed) {
        let message = '';
        
        if (processed.errors.length > 0) {
            message += 'Errors:\n' + processed.errors.map(e => `• ${e}`).join('\n');
        }
        
        if (processed.warnings.length > 0) {
            if (message) message += '\n\n';
            message += 'Suggestions:\n' + processed.warnings.map(w => `• ${w}`).join('\n');
        }
        
        if (processed.suggestions.length > 0) {
            if (message) message += '\n\n';
            message += 'Tips:\n' + processed.suggestions.map(s => `• ${s}`).join('\n');
        }
        
        return message;
    }
}