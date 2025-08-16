class EnvLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
    }

    async loadEnv() {
        if (this.loaded) {
            console.log('Environment already loaded:', this.env);
            return this.env;
        }

        console.log('Loading environment variables...');

        try {
            // Try to load .env file
            const response = await fetch('.env');
            
            if (response.ok) {
                const envText = await response.text();
                console.log('Loaded .env file, parsing...');
                this.parseEnvText(envText);
                this.loaded = true;
                console.log('Environment variables loaded from .env file:', this.env);
            } else {
                console.warn('.env file not found, using default/manual configuration');
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.warn('Could not load .env file:', error.message);
            this.loadFromLocalStorage();
        }

        return this.env;
    }

    parseEnvText(envText) {
        const lines = envText.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
                return;
            }
            
            // Parse KEY=VALUE format
            const equalIndex = line.indexOf('=');
            if (equalIndex > 0) {
                const key = line.substring(0, equalIndex).trim();
                const value = line.substring(equalIndex + 1).trim();
                
                // Remove surrounding quotes if present
                const cleanValue = value.replace(/^["']|["']$/g, '');
                this.env[key] = cleanValue;
            }
        });
    }

    loadFromLocalStorage() {
        // Fallback to localStorage for browser environments
        const apiKey = localStorage.getItem('OPENAI_API_KEY');
        if (apiKey) {
            this.env.OPENAI_API_KEY = apiKey;
            console.log('API key loaded from localStorage');
        }
        this.loaded = true;
    }

    get(key, defaultValue = null) {
        return this.env[key] || defaultValue;
    }

    set(key, value) {
        this.env[key] = value;
        // Also save to localStorage for persistence
        localStorage.setItem(key, value);
    }

    getOpenAIKey() {
        const key = this.get('OPENAI_API_KEY');
        console.log('EnvLoader.getOpenAIKey returning:', key ? `${key.substring(0, 10)}...` : 'null');
        return key;
    }

    setOpenAIKey(apiKey) {
        this.set('OPENAI_API_KEY', apiKey);
    }

    isDebugMode() {
        return this.get('GAME_DEBUG', 'false').toLowerCase() === 'true';
    }
}

// Create global instance
window.envLoader = new EnvLoader();