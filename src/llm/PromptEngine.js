class PromptEngine {
    constructor() {
        this.basePrompts = {
            system: `You are roleplaying as a character in a murder mystery interrogation game. 
You must stay completely in character and respond as they would based on their personality, background, and current emotional state.

IMPORTANT RULES:
- Stay in character at all times
- Be consistent with previous statements
- Show personality through speech patterns and reactions
- Include subtle emotional cues and body language
- Keep responses conversational and natural
- Don't break character or mention you're an AI
- Respond to the specific question asked

RESPONSE FORMAT:
You must format your response EXACTLY like this:
emotion: "angry" OR "scared" OR "normal"
message: "Your character's spoken dialogue only - no stage directions or actions"
context: "Brief summary of conversation state, attitude, and key points discussed"
state: "CONTINUE" OR "END"

Available emotions:
- "angry": Use when defensive, frustrated, or confrontational
- "scared": Use when nervous, anxious, or intimidated  
- "normal": Use for calm, neutral, or cooperative responses

Context field requirements:
- Summarize the current conversation state in 1-2 sentences (what has been asked, what has been revealed, the chronology)
- Include the suspect's current attitude/demeanor
- Note any key topics discussed or revelations made
- Keep it under 150 words

State field requirements:
- Use "CONTINUE" for normal conversation
- Use "END" ONLY when the character confesses to the crime
- END should only be used if:
  * Your character is the culprit (role: "culprit")
  * AND you've been confronted with strong evidence or contradictions
  * AND your character breaks down and admits guilt
- Innocent characters should NEVER use "END"`,

            characterIntroduction: `You are {characterName}, a {occupation} involved in the murder investigation of Victoria Sterling.

Your role in this case: {role}
Your relationship to the victim: {relationship}
Your alibi: {alibi}

Your personality traits:
{personalityTraits}

Your current emotional state: {emotionalState}`
        };
    }

    generatePrompt(character, question, conversationHistory = [], gameContext = {}) {
        console.log('PromptEngine.generatePrompt called with character:', character?.name);
        
        const characterPrompt = this.buildCharacterPrompt(character);
        const contextPrompt = this.buildContextPrompt(character, conversationHistory, gameContext);
        const questionPrompt = this.buildQuestionPrompt(question);
        
        return `${this.basePrompts.system}

${characterPrompt}

${contextPrompt}

${questionPrompt}

Respond in character as ${character.name}. Put spoken dialogue in the message field only. Body language and emotional reactions should be reflected through the emotion field and context summary, not in the dialogue itself.`;
    }

    buildCharacterPrompt(character) {
        console.log('Building character prompt for:', character);
        console.log('Character keys:', Object.keys(character));
        
        const personality = character.personality;
        const background = character.background;
        const knowledgeProfile = character.knowledgeProfile;
        
        console.log('Knowledge profile extracted:', knowledgeProfile);
        
        let personalityTraits = '';
        Object.entries(personality).forEach(([trait, value]) => {
            if (typeof value === 'number') {
                const intensity = value > 0.7 ? 'very' : value > 0.4 ? 'somewhat' : 'slightly';
                personalityTraits += `- ${intensity} ${trait}\n`;
            } else if (Array.isArray(value)) {
                personalityTraits += `- ${trait}: ${value.join(', ')}\n`;
            } else {
                personalityTraits += `- ${trait}: ${value}\n`;
            }
        });

        // Determine emotional state based on personality and role
        const emotionalState = this.determineEmotionalState(character);

        let prompt = this.basePrompts.characterIntroduction
            .replace('{characterName}', character.name)
            .replace('{occupation}', background.occupation)
            .replace('{role}', character.role)
            .replace('{relationship}', background.relationship)
            .replace('{alibi}', background.alibi)
            .replace('{personalityTraits}', personalityTraits)
            .replace('{emotionalState}', emotionalState);

        // Add knowledge profile information
        console.log('Knowledge profile keys:', Object.keys(knowledgeProfile));
        if (Object.keys(knowledgeProfile).length > 0) {
            console.log('Adding knowledge profile to prompt');
            const knowledgeSection = this.buildKnowledgeSection(knowledgeProfile, character.role);
            console.log('Knowledge section:', knowledgeSection);
            prompt += '\n\nYOUR KNOWLEDGE AND WHAT YOU CAN REVEAL:\n';
            prompt += knowledgeSection;
        } else {
            console.log('No knowledge profile found for character');
        }

        return prompt;
    }

    buildKnowledgeSection(knowledgeProfile, characterRole) {
        let knowledgeSection = '';

        // Add general knowledge that all characters know
        if (knowledgeProfile.generalKnowledge) {
            knowledgeSection += 'GENERAL KNOWLEDGE (known by everyone):\n';
            Object.entries(knowledgeProfile.generalKnowledge).forEach(([key, value]) => {
                knowledgeSection += `- ${value}\n`;
            });
            knowledgeSection += '\n';
        }

        // Handle different knowledge structures based on character role
        if (characterRole === 'culprit') {
            // For culprit, show lies vs hidden truths
            if (knowledgeProfile.lies) {
                knowledgeSection += 'WHAT YOU CLAIM (LIES):\n';
                Object.entries(knowledgeProfile.lies).forEach(([key, value]) => {
                    knowledgeSection += `- ${value}\n`;
                });
                knowledgeSection += '\n';
            }

            if (knowledgeProfile.hiddenTruths) {
                knowledgeSection += 'WHAT YOU HIDE (only reveal under extreme pressure):\n';
                Object.entries(knowledgeProfile.hiddenTruths).forEach(([key, value]) => {
                    knowledgeSection += `- ${value}\n`;
                });
                knowledgeSection += '\n';
            }

            if (knowledgeProfile.deflectionTactics) {
                knowledgeSection += 'HOW YOU DEFLECT SUSPICION:\n';
                Object.entries(knowledgeProfile.deflectionTactics).forEach(([suspect, tactics]) => {
                    knowledgeSection += `About ${suspect}:\n`;
                    Object.entries(tactics).forEach(([key, value]) => {
                        knowledgeSection += `  - ${value}\n`;
                    });
                });
                knowledgeSection += '\n';
            }
        } else {
            // For innocent/red herring characters, show what they know
            if (knowledgeProfile.aboutSelf) {
                knowledgeSection += 'ABOUT YOURSELF:\n';
                Object.entries(knowledgeProfile.aboutSelf).forEach(([key, value]) => {
                    knowledgeSection += `- ${value}\n`;
                });
                knowledgeSection += '\n';
            }
        }

        // Common sections for all characters
        if (knowledgeProfile.aboutVictim) {
            knowledgeSection += 'ABOUT THE VICTIM:\n';
            Object.entries(knowledgeProfile.aboutVictim).forEach(([key, value]) => {
                knowledgeSection += `- ${value}\n`;
            });
            knowledgeSection += '\n';
        }

        if (knowledgeProfile.aboutOthers) {
            knowledgeSection += 'ABOUT OTHER SUSPECTS:\n';
            Object.entries(knowledgeProfile.aboutOthers).forEach(([suspect, observations]) => {
                knowledgeSection += `About ${suspect}:\n`;
                Object.entries(observations).forEach(([key, value]) => {
                    knowledgeSection += `  - ${value}\n`;
                });
            });
            knowledgeSection += '\n';
        }

        if (knowledgeProfile.timeline) {
            knowledgeSection += 'TIMELINE & OBSERVATIONS:\n';
            Object.entries(knowledgeProfile.timeline).forEach(([key, value]) => {
                knowledgeSection += `- ${value}\n`;
            });
            knowledgeSection += '\n';
        }

        knowledgeSection += 'IMPORTANT: Only reveal information naturally when asked relevant questions. Don\'t volunteer everything at once. If a user requests information that isn\'t in the knowledge provided for the character, say idk. DO NOT CONFESS if not presented with evidence.\n';

        return knowledgeSection;
    }

    buildContextPrompt(character, conversationHistory, gameContext) {
        let contextPrompt = '';

        if (gameContext.totalQuestions > 10) {
            contextPrompt += '\nYou are getting tired from the long interrogation. Show signs of fatigue or irritation.\n';
        }

        if (gameContext.pressureLevel && gameContext.pressureLevel > 0.5) {
            contextPrompt += '\nYou feel under pressure. The detective seems suspicious of you.\n';
        }

        // Add confession pressure for culprits
        if (character.role === 'culprit' && conversationHistory.length > 6) {
            const contradictions = this.detectContradictions(conversationHistory);
            const evidence = this.detectEvidenceConfrontation(conversationHistory);
            
            //if (contradictions > 1 || evidence) {
                contextPrompt += '\nIMPORTANT: You are feeling the weight of evidence against you. If confronted with strong contradictions or evidence in the message, go ahead and confess.\n';
            //}
        }

        return contextPrompt;
    }

    buildPreviousContextPrompt(conversationHistory) {
        // Find the most recent context from previous responses
        const recentResponses = conversationHistory
            .filter(msg => msg.type === 'character' && msg.context)
            .slice(-2); // Get last 2 context entries
        
        if (recentResponses.length === 0) {
            return '';
        }

        let contextPrompt = '\nPREVIOUS CONVERSATION CONTEXT:\n';
        
        if (recentResponses.length >= 2) {
            contextPrompt += `Earlier: ${recentResponses[0].context}\n`;
            contextPrompt += `Recent: ${recentResponses[1].context}\n`;
        } else {
            contextPrompt += `Previous: ${recentResponses[0].context}\n`;
        }
        
        contextPrompt += '\nMaintain consistency with this established context and your character\'s previous attitude.\n';
        
        return contextPrompt;
    }

    buildQuestionPrompt(question) {
        return `\nCURRENT QUESTION FROM DETECTIVE: "${question}"

Your response:`;
    }

    determineEmotionalState(character) {
        const personality = character.personality;
        const role = character.role;

        if (role === 'culprit') {
            if (personality.nervousness > 0.5) {
                return 'nervous and defensive, trying to appear calm';
            }
            return 'carefully controlled, but with underlying tension';
        }

        if (role === 'innocent') {
            if (personality.helpfulness > 0.7) {
                return 'cooperative and eager to help';
            }
            return 'concerned but willing to assist';
        }

        if (role === 'redHerring') {
            if (personality.aggressiveness > 0.5) {
                return 'frustrated and somewhat hostile';
            }
            return 'defensive but trying to clear their name';
        }

        return 'cautious and uncertain';
    }

    // Generate prompts for specific testimony triggers
    generateTestimonyPrompt(character, question, testimonyData) {
        const basePrompt = this.generatePrompt(character, question);
        
        if (testimonyData && this.shouldTriggerTestimony(question, testimonyData)) {
            return basePrompt + `\n\nIMPORTANT: When responding to this question, naturally work in this key information: "${testimonyData.response}"`;
        }

        return basePrompt;
    }

    shouldTriggerTestimony(question, testimonyData) {
        if (!testimonyData.triggerKeywords) return false;
        
        const questionLower = question.toLowerCase();
        return testimonyData.triggerKeywords.some(keyword => 
            questionLower.includes(keyword.toLowerCase())
        );
    }

    // Adjust prompt based on character's current stress level
    adjustForStressLevel(prompt, stressLevel) {
        if (stressLevel > 0.8) {
            return prompt + '\n\nYou are very stressed and may slip up or contradict yourself slightly.';
        } else if (stressLevel > 0.5) {
            return prompt + '\n\nYou are feeling pressured and becoming more defensive.';
        }
        
        return prompt;
    }

    // Detect contradictions in conversation history
    detectContradictions(conversationHistory) {
        let contradictionCount = 0;
        const userQuestions = conversationHistory.filter(msg => msg.type === 'user');
        
        // Look for contradiction keywords in questions
        const contradictionKeywords = [
            'you said', 'earlier you', 'but you told me', 'contradicts', 'inconsistent',
            'lies', 'lying', 'false', 'truth', 'evidence shows', 'witnesses saw'
        ];
        
        userQuestions.forEach(question => {
            const content = question.content.toLowerCase();
            contradictionKeywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    contradictionCount++;
                }
            });
        });
        
        return contradictionCount;
    }

    // Detect evidence confrontation
    detectEvidenceConfrontation(conversationHistory) {
        const userQuestions = conversationHistory.filter(msg => msg.type === 'user');
        const evidenceKeywords = [
            'evidence', 'proof', 'witness', 'saw you', 'camera', 'fingerprints',
            'dna', 'motive', 'opportunity', 'caught', 'alibi'
        ];
        
        return userQuestions.some(question => {
            const content = question.content.toLowerCase();
            return evidenceKeywords.some(keyword => content.includes(keyword));
        });
    }
}