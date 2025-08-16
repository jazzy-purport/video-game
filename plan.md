Detective Interrogation Game - Implementation Strategy
Overview
A 3D detective game where players interrogate suspects using natural language, leveraging LLM responses to uncover contradictions in testimony and solve murder mysteries.
System Architecture
Directory Structure
src/
├── core/
│   ├── GameEngine.js          # Main game loop and state management
│   ├── SceneManager.js         # 3D scene orchestration
│   └── AudioManager.js         # Background music and SFX
├── interrogation/
│   ├── InterrogationSystem.js  # Core interrogation logic
│   ├── DialogueManager.js      # UI and conversation flow
│   └── EvidenceTracker.js      # Cross-reference testimony contradictions
├── characters/
│   ├── CharacterFactory.js     # Generate suspects with traits
│   ├── models/                 # 3D character models and animations
│   └── personalities/          # Character behavior definitions
├── llm/
│   ├── LLMInterface.js         # API abstraction layer
│   ├── PromptEngine.js         # Dynamic prompt generation
│   └── ResponseProcessor.js    # Parse and validate LLM outputs
├── cases/
│   ├── CaseManager.js          # Load and manage murder mysteries
│   ├── gallery-murder/         # Individual case data
│   │   ├── suspects.json       # Character definitions
│   │   ├── evidence.json       # Testimony fragments and contradictions
│   │   └── victory-conditions.json
├── ui/
│   ├── InterrogationUI.js      # Question input and response display
│   ├── EvidenceBoard.js        # Visual contradiction tracker
│   └── SuspectSelector.js      # Character switching interface
└── utils/
    ├── ContradictionEngine.js  # Logic for detecting testimony conflicts
    └── GameStateValidator.js   # Ensure game progression integrity
Case Study: The Gallery Opening Murder
Crime Summary
Victoria Sterling, wealthy art collector, found dead in her private office during a gallery opening. Poisoned between 8:30-9:15 PM with rare plant toxin.
Character Design
Elena Rodriguez (The Innocent)

Role: Personal Assistant
Story: Managing event, brought Victoria champagne at 8:25 PM
Key Testimony: Saw Dr. Hartwell leaving Victoria's office area at 8:45 PM, limping
Misdirection: Had access, handled drinks, recent wage dispute with Victoria

Dr. James Hartwell (The Culprit)

Role: Ex-husband, botanist
Story: Claims he never left main gallery, stayed with guests all evening
The Lie: Actually visited Victoria's office between 8:40-8:45 PM
Motive: Victoria threatened to expose his research fraud

Marcus Webb (The Red Herring)

Role: Rival art dealer
Story: Bidding on artwork, had public arguments with Victoria
Key Testimony: Saw Dr. Hartwell heading toward offices at 8:40 PM, noticed his limp
Misdirection: Made threats, financial problems, nervous behavior

Victory Condition
Player must uncover the contradiction between Dr. Hartwell's alibi and the independent testimonies from Elena and Marcus placing him at the crime scene.
Core Data Structures
Character Definition Schema
json{
  "elena_rodriguez": {
    "id": "elena",
    "name": "Elena Rodriguez",
    "role": "innocent",
    "personality": {
      "nervousness": 0.02,
      "helpfulness": 0.8,
      "speech_patterns": ["formal", "detailed"]
    },
    "key_testimony": [
      {
        "trigger_keywords": ["office", "saw", "8:45"],
        "response": "I saw Dr. Hartwell walking quickly from Victoria's office around 8:45 PM...",
        "evidence_type": "witness_placement",
        "contradicts": ["hartwell_alibi"]
      }
    ],
    "model_config": {
      "shirt_color": "0x1a1a2e",
      "skin_tone": "0xfdbcb4",
      "animations": ["nervous_fidget", "helpful_gesture"]
    }
  }
}
Evidence Contradiction Matrix
json{
  "contradictions": {
    "hartwell_location": {
      "claim": "Never left main gallery",
      "conflicting_evidence": [
        {
          "witness": "elena",
          "testimony": "Saw him coming from office at 8:45",
          "confidence": 0.9
        },
        {
          "witness": "marcus", 
          "testimony": "Saw him going toward offices at 8:40",
          "confidence": 0.8
        }
      ],
      "resolution_threshold": 1.5
    }
  }
}
Key Implementation Components
LLM Integration Layer
javascriptclass PromptEngine {
  generateCharacterPrompt(character, question, gameState) {
    return `
      You are ${character.name}, a ${character.role} in a murder investigation.
      
      Character traits: ${character.personality}
      What you know: ${character.knowledge}
      Your alibi: ${character.alibi}
      
      Player asks: "${question}"
      
      Respond in character. If asked about key evidence, reveal: ${character.key_testimony}
      Maintain consistency with previous responses: ${gameState.conversation_history}
    `;
  }
}
Contradiction Detection Engine
javascriptclass ContradictionEngine {
  checkForContradictions(newTestimony, allTestimony) {
    // Cross-reference new testimony against existing evidence matrix
    // Return contradictions found with confidence scores
    // Trigger victory condition if threshold met
  }
  
  buildEvidenceBoard(contradictions) {
    // Generate visual representation of conflicting testimonies
    // Highlight connections between suspect statements
  }
}
Scene Management System
javascriptclass SceneManager {
  switchCharacter(characterId) {
    // Smoothly transition between 3D character models
    // Update lighting/atmosphere based on character personality
    // Load character-specific animations
  }
  
  updateCharacterEmotion(suspicion_level) {
    // Modify character animations based on interrogation pressure
    // Increase nervousness, change posture, etc.
  }
}
Game Flow Architecture
State Management

GameState: Overall progress, unlocked testimonies, solved contradictions
InterrogationState: Current suspect, conversation history, evidence revealed
UIState: Active panels, evidence board highlights, character emotions

Victory Condition System
javascriptclass VictoryConditions {
  checkWinCondition(evidenceBoard) {
    const required = this.case.victory_requirements;
    const discovered = evidenceBoard.getDiscoveredContradictions();
    
    return required.every(req => 
      discovered.some(disc => disc.confidence >= req.threshold)
    );
  }
}
Technical Considerations
Performance Optimization

Character Models: Use instanced geometries for shared components
LLM Calls: Implement caching for repeated questions
3D Rendering: LOD system for character details based on camera distance

Extensibility

Case Format: JSON-driven case definitions for easy authoring
Character System: Modular personality traits and speech patterns
Evidence Engine: Pluggable contradiction detection algorithms

Error Handling

LLM Failures: Fallback to pre-written responses for key testimonies
Contradiction Logic: Graceful degradation if evidence matrix incomplete
Save System: Checkpoint progress before major interrogations

Implementation Phases
Phase 1: Core Foundation

Basic 3D interrogation room scene
Character switching system
Simple dialogue input/output UI
LLM integration with basic prompts

Phase 2: Game Logic

Evidence tracking system
Contradiction detection engine
Victory condition checking
Save/load functionality

Phase 3: Polish & Content

Advanced character animations
Atmospheric effects and audio
Additional murder cases
UI/UX refinements

Phase 4: Advanced Features

Character personality variations
Dynamic difficulty adjustment
Procedural case generation
Multiplayer investigation modes

This architecture ensures clean separation of concerns, easy extensibility for new cases, and robust core interrogation mechanics.