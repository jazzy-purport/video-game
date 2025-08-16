class VictoryOverlay {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
    }

    show(character, gameStats) {
        if (this.overlay) {
            this.overlay.remove();
        }
        
        this.createOverlay(character, gameStats);
    }

    createOverlay(character, gameStats) {
        // Create main overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = 'victory-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0, 100, 0, 0.95), rgba(0, 50, 0, 0.95));
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Courier New', monospace;
            color: #ffffff;
            backdrop-filter: blur(10px);
            animation: fadeIn 1s ease-out;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            max-width: 800px;
            padding: 50px;
            border: 3px solid #4CAF50;
            border-radius: 20px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(5px);
            animation: slideUp 1s ease-out 0.3s both;
        `;

        // Create victory title
        const title = document.createElement('h1');
        title.textContent = 'CASE SOLVED!';
        title.style.cssText = `
            font-size: 3.5rem;
            margin: 0 0 30px 0;
            color: #4CAF50;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
            animation: slideUp 1s ease-out 0.6s both;
        `;

        // Create congratulations message
        const congratsMessage = document.createElement('div');
        congratsMessage.style.cssText = `
            font-size: 1.4rem;
            margin-bottom: 40px;
            color: #ffffff;
            line-height: 1.6;
            animation: slideUp 1s ease-out 0.9s both;
        `;
        congratsMessage.textContent = 'Excellent detective work! You successfully identified the killer.';

        // Create culprit details
        const culpritDetails = document.createElement('div');
        culpritDetails.style.cssText = `
            background: rgba(255, 0, 0, 0.2);
            border: 2px solid #ff6666;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            animation: slideUp 1s ease-out 1.2s both;
        `;

        culpritDetails.innerHTML = `
            <div style="font-size: 1.8rem; color: #ff6666; margin-bottom: 15px; font-weight: bold;">
                CULPRIT IDENTIFIED
            </div>
            <div style="font-size: 1.4rem; color: #ffffff; margin-bottom: 10px;">
                <strong>${character.getName ? character.getName() : character.name}</strong>
            </div>
            <div style="font-size: 1rem; color: #cccccc; margin-bottom: 15px;">
                ${character.definition?.background?.occupation || character.background?.occupation || 'Botanist'} • ${character.definition?.background?.relationship || character.background?.relationship || 'Ex-Husband'}
            </div>
            <div style="font-size: 1rem; color: #ffcccc; font-style: italic;">
                "Victoria caught me stealing documents to cover up my research fraud.<br>
                I poisoned her champagne in desperation."
            </div>
        `;

        // Create game stats
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
            animation: slideUp 1s ease-out 1.5s both;
        `;

        // Calculate time taken
        const timeTaken = this.formatGameTime(gameStats.gameDuration || 0);
        const totalQuestions = gameStats.totalQuestions || 0;

        const stats = [
            { label: 'Time Taken', value: timeTaken, icon: 'T' },
            { label: 'Questions Asked', value: totalQuestions, icon: 'Q' },
            { label: 'Case Difficulty', value: 'EXPERT', icon: 'D' }
        ];

        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            `;
            
            statCard.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 10px;">${stat.icon}</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">${stat.value}</div>
                <div style="font-size: 0.9rem; color: #cccccc;">${stat.label}</div>
            `;
            
            statsContainer.appendChild(statCard);
        });

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'CASE CLOSED';
        closeButton.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 1.2rem;
            font-weight: bold;
            padding: 15px 40px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            animation: slideUp 1s ease-out 1.8s both;
            margin-top: 20px;
        `;

        // Button hover effects
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'linear-gradient(135deg, #66bb6a, #4CAF50)';
            closeButton.style.transform = 'translateY(-2px)';
            closeButton.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            closeButton.style.transform = 'translateY(0)';
            closeButton.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
        });

        closeButton.addEventListener('click', () => {
            this.hide();
        });

        // Assemble the overlay
        content.appendChild(title);
        content.appendChild(congratsMessage);
        content.appendChild(culpritDetails);
        content.appendChild(statsContainer);
        content.appendChild(closeButton);
        this.overlay.appendChild(content);

        // Add to page
        document.body.appendChild(this.overlay);
        this.isVisible = true;
    }

    formatGameTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    hide() {
        if (this.overlay) {
            // Fade out animation
            this.overlay.style.transition = 'opacity 0.5s ease-out';
            this.overlay.style.opacity = '0';
            
            setTimeout(() => {
                if (this.overlay) {
                    this.overlay.remove();
                    this.overlay = null;
                }
                this.isVisible = false;
            }, 500);
        }
    }

    isShowing() {
        return this.isVisible;
    }
}