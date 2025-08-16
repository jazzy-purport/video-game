class ResponseProcessor {
    constructor() {
        this.actionPatterns = {
            bodyLanguage: /\*(.*?)\*/g,
            emotional: /\[(.*?)\]/g,
            emphasis: /\*\*(.*?)\*\*/g
        };
    }

    processResponse(rawResponse, character) {
        const parsedResponse = this.parseEmotionFormat(rawResponse.content);
        
        const processed = {
            originalContent: rawResponse.content,
            cleanedContent: this.cleanResponse(parsedResponse.message),
            emotion: parsedResponse.emotion,
            message: parsedResponse.message,
            context: parsedResponse.context,
            state: parsedResponse.state,
            actions: this.extractActions(parsedResponse.message),
            emotions: this.extractEmotions(parsedResponse.message),
            character: character,
            timestamp: Date.now(),
            metadata: {
                model: rawResponse.model,
                finishReason: rawResponse.finishReason,
                usage: rawResponse.usage
            }
        };

        return processed;
    }

    parseEmotionFormat(content) {
        // Parse the emotion: "emotion", message: "message", context: "context", state: "state" format
        const emotionMatch = content.match(/emotion:\s*["']?(angry|scared|normal)["']?/i);
        const messageMatch = content.match(/message:\s*["']?(.*?)["']?(?=\s*context:|$)/is);
        const contextMatch = content.match(/context:\s*["']?(.*?)["']?(?=\s*state:|$)/is);
        const stateMatch = content.match(/state:\s*["']?(CONTINUE|END)["']?/i);
        
        let emotion = 'normal'; // default
        let message = content; // fallback to original content
        let context = ''; // default empty context
        let state = 'CONTINUE'; // default continue
        
        if (emotionMatch) {
            emotion = emotionMatch[1].toLowerCase();
        }
        
        if (messageMatch) {
            message = messageMatch[1].trim();
        } else {
            // If no proper format found, try to extract just the message part
            const lines = content.split('\n');
            const messageLine = lines.find(line => line.toLowerCase().includes('message:'));
            if (messageLine) {
                message = messageLine.replace(/message:\s*["']?/i, '').replace(/["']?$/, '').trim();
            }
        }
        
        if (contextMatch) {
            context = contextMatch[1].trim();
        } else {
            // Try to find context line if format is less strict
            const lines = content.split('\n');
            const contextLine = lines.find(line => line.toLowerCase().includes('context:'));
            if (contextLine) {
                context = contextLine.replace(/context:\s*["']?/i, '').replace(/["']?$/, '').trim();
            }
        }
        
        if (stateMatch) {
            state = stateMatch[1].toUpperCase();
        } else {
            // Try to find state line if format is less strict
            const lines = content.split('\n');
            const stateLine = lines.find(line => line.toLowerCase().includes('state:'));
            if (stateLine) {
                state = stateLine.replace(/state:\s*["']?/i, '').replace(/["']?$/, '').trim().toUpperCase();
            }
        }
        
        // Validate emotion
        if (!['angry', 'scared', 'normal'].includes(emotion)) {
            emotion = 'normal';
        }
        
        // Validate state
        if (!['CONTINUE', 'END'].includes(state)) {
            state = 'CONTINUE';
        }
        
        return {
            emotion: emotion,
            message: message,
            context: context,
            state: state
        };
    }

    cleanResponse(content) {
        // Remove excessive whitespace and normalize formatting
        let cleaned = content.trim();
        
        // Remove duplicate spaces
        cleaned = cleaned.replace(/\s+/g, ' ');
        
        // Ensure proper sentence spacing
        cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
        
        return cleaned;
    }

    extractActions(content) {
        const actions = [];
        let match;

        // Extract body language and actions marked with *action*
        const actionRegex = /\*(.*?)\*/g;
        while ((match = actionRegex.exec(content)) !== null) {
            actions.push({
                type: 'body_language',
                description: match[1].trim(),
                position: match.index
            });
        }

        // Extract emotional indicators marked with [emotion]
        const emotionRegex = /\[(.*?)\]/g;
        while ((match = emotionRegex.exec(content)) !== null) {
            actions.push({
                type: 'emotion',
                description: match[1].trim(),
                position: match.index
            });
        }

        return actions.sort((a, b) => a.position - b.position);
    }

    extractEmotions(content) {
        const emotions = [];
        
        // Common emotional indicators in text
        const emotionalWords = {
            nervous: ['nervous', 'anxious', 'fidget', 'uncomfortable', 'tense'],
            angry: ['angry', 'furious', 'irritated', 'snaps', 'glares'],
            sad: ['sad', 'tears', 'sorrow', 'melancholy', 'weeps'],
            suspicious: ['suspicious', 'wary', 'doubtful', 'skeptical'],
            defensive: ['defensive', 'protest', 'deny', 'refuses'],
            confident: ['confident', 'assured', 'certain', 'determined'],
            confused: ['confused', 'puzzled', 'bewildered', 'uncertain']
        };

        const contentLower = content.toLowerCase();
        
        Object.entries(emotionalWords).forEach(([emotion, words]) => {
            words.forEach(word => {
                if (contentLower.includes(word)) {
                    emotions.push({
                        emotion: emotion,
                        trigger: word,
                        confidence: this.calculateEmotionConfidence(word, contentLower)
                    });
                }
            });
        });

        // Remove duplicates and sort by confidence
        const uniqueEmotions = emotions.filter((emotion, index, self) => 
            index === self.findIndex(e => e.emotion === emotion.emotion)
        ).sort((a, b) => b.confidence - a.confidence);

        return uniqueEmotions;
    }

    calculateEmotionConfidence(word, content) {
        // Simple confidence based on word context and frequency
        const wordCount = (content.match(new RegExp(word, 'g')) || []).length;
        const contextBonus = this.hasEmotionalContext(word, content) ? 0.2 : 0;
        
        return Math.min(0.5 + (wordCount * 0.2) + contextBonus, 1.0);
    }

    hasEmotionalContext(word, content) {
        const emotionalContextWords = [
            'very', 'extremely', 'quite', 'rather', 'somewhat', 
            'clearly', 'obviously', 'suddenly', 'visibly'
        ];
        
        return emotionalContextWords.some(contextWord => 
            content.includes(`${contextWord} ${word}`) || 
            content.includes(`${word} ${contextWord}`)
        );
    }

    // Extract potential key testimony or contradictions
    analyzeForKeyContent(content, character) {
        const keyContent = {
            hasTimeReference: this.containsTimeReference(content),
            hasLocationReference: this.containsLocationReference(content),
            hasPersonReference: this.containsPersonReference(content),
            suspiciousLanguage: this.detectSuspiciousLanguage(content),
            contradictionMarkers: this.detectContradictionMarkers(content)
        };

        return keyContent;
    }

    containsTimeReference(content) {
        const timePatterns = [
            /\d{1,2}:\d{2}/g, // time format
            /\d{1,2}\s*(am|pm)/gi, // 8 PM format
            /around|about|approximately/gi,
            /before|after|during/gi,
            /evening|morning|afternoon|night/gi
        ];

        return timePatterns.some(pattern => pattern.test(content));
    }

    containsLocationReference(content) {
        const locationPatterns = [
            /office|room|gallery|hallway/gi,
            /upstairs|downstairs|outside/gi,
            /near|by|at|in|behind/gi
        ];

        return locationPatterns.some(pattern => pattern.test(content));
    }

    containsPersonReference(content) {
        const personPatterns = [
            /saw|seen|noticed|observed/gi,
            /with|talking|speaking/gi,
            /he|she|they.*was|were/gi
        ];

        return personPatterns.some(pattern => pattern.test(content));
    }

    detectSuspiciousLanguage(content) {
        const suspiciousPatterns = [
            /i don't remember/gi,
            /i think|maybe|possibly/gi,
            /not sure|uncertain/gi,
            /why would you ask/gi,
            /that's irrelevant/gi
        ];

        return suspiciousPatterns.filter(pattern => pattern.test(content)).length;
    }

    detectContradictionMarkers(content) {
        const contradictionPatterns = [
            /actually|well actually/gi,
            /i mean|what i meant/gi,
            /let me clarify/gi,
            /correction|correct that/gi
        ];

        return contradictionPatterns.filter(pattern => pattern.test(content)).length;
    }

    // Format response for display
    formatForDisplay(processedResponse) {
        let formatted = processedResponse.cleanedContent;

        // Apply formatting for actions and emotions
        processedResponse.actions.forEach(action => {
            if (action.type === 'body_language') {
                // Keep body language in italics
                formatted = formatted.replace(
                    `*${action.description}*`, 
                    `<em>*${action.description}*</em>`
                );
            }
        });

        return formatted;
    }

    getResponseSummary(processedResponse) {
        return {
            characterName: processedResponse.character.name,
            wordCount: processedResponse.cleanedContent.split(' ').length,
            actionCount: processedResponse.actions.length,
            primaryEmotions: processedResponse.emotions.slice(0, 2),
            timestamp: processedResponse.timestamp
        };
    }
}