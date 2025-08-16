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




}