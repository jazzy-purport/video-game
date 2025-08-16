class CharacterLoader {
    constructor() {
        this.characters = new Map();
        this.currentCase = null;
    }

    async loadCase(caseName) {
        try {
            const response = await fetch(`src/cases/${caseName}/characters.json`);
            const charactersData = await response.json();
            
            this.currentCase = caseName;
            this.characters.clear();
            
            // Create Character instances from the data
            charactersData.characters.forEach(characterData => {
                const character = new Character(characterData);
                this.characters.set(characterData.id, character);
            });
            
            return true;
        } catch (error) {
            console.error(`Failed to load case ${caseName}:`, error);
            return false;
        }
    }

    getCharacter(characterId) {
        return this.characters.get(characterId);
    }

    getAllCharacters() {
        return Array.from(this.characters.values());
    }

    getCharacterIds() {
        return Array.from(this.characters.keys());
    }

    hasCharacter(characterId) {
        return this.characters.has(characterId);
    }

    getCurrentCase() {
        return this.currentCase;
    }

    // Load character definitions synchronously for development
    loadCaseSync(caseName, charactersData = null) {
        try {
            // If charactersData is provided, use it directly (fallback)
            if (charactersData) {
                this.currentCase = caseName;
                this.characters.clear();
                
                charactersData.characters.forEach(characterData => {
                    const character = new Character(characterData);
                    this.characters.set(characterData.id, character);
                });
                
                return true;
            }
            
            // Try to load from file using synchronous XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `src/cases/${caseName}/characters.json`, false); // false = synchronous
            xhr.send();
            
            if (xhr.status === 200) {
                const fileCharactersData = JSON.parse(xhr.responseText);
                
                this.currentCase = caseName;
                this.characters.clear();
                
                fileCharactersData.characters.forEach(characterData => {
                    const character = new Character(characterData);
                    this.characters.set(characterData.id, character);
                });
                
                console.log('Characters loaded from JSON file successfully');
                return true;
            } else {
                console.error(`Failed to load case ${caseName}: HTTP ${xhr.status}`);
                return false;
            }
        } catch (error) {
            console.error(`Failed to load case ${caseName}:`, error);
            return false;
        }
    }
}