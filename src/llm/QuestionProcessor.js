class QuestionProcessor {
    constructor() {
        this.minQuestionLength = 3;
        this.maxQuestionLength = 500;
    }

    processQuestion(input) {
        const processed = {
            original: input,
            cleaned: this.cleanInput(input),
            isValid: false,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // Run validation
        this.validateInput(processed);
        
        // Add suggestions if needed
        this.addSuggestions(processed);

        console.log('QuestionProcessor result:', {
            cleaned: processed.cleaned,
            isValid: processed.isValid,
            errors: processed.errors
        });

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


        // Mark as valid if no errors
        processed.isValid = processed.errors.length === 0;
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