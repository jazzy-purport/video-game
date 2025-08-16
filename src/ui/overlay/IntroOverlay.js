class IntroOverlay {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
        this.createOverlay();
    }

    createOverlay() {
        // Create main overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = 'intro-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95));
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Courier New', monospace;
            color: #ffffff;
            backdrop-filter: blur(10px);
        `;

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            max-width: 800px;
            padding: 40px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
        `;

        // Create title
        const title = document.createElement('h1');
        title.textContent = 'MURDER AT THE GALLERY';
        title.style.cssText = `
            font-size: 3rem;
            margin: 0 0 30px 0;
            color: #ff4444;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        `;

        // Create case details
        const caseDetails = document.createElement('div');
        caseDetails.style.cssText = `
            font-size: 1.2rem;
            line-height: 1.8;
            margin-bottom: 40px;
            color: #e0e0e0;
        `;

        caseDetails.innerHTML = `
            <p style="margin: 0 0 20px 0; font-size: 1.4rem; color: #ffaa00;">
                <strong>CASE FILE: #2024-0815</strong>
            </p>
            <p style="margin: 0 0 20px 0;">
                <strong>Victoria Sterling</strong>, renowned art gallery owner, was found dead in her private office during the opening night of her latest exhibition.
            </p>
            <p style="margin: 0 0 20px 0;">
                The cause of death: <strong style="color: #ff6666;">Aconitine poisoning</strong> - a deadly toxin extracted from wolfsbane plants. 
                Word of her poisoning has spread, but the specifics of the poisoning agent have not been made public.
            </p>
            <p style="margin: 0 0 20px 0;">
                After extensive investigation, we've narrowed it down to <strong style="color: #66ff66;">three prime suspects</strong> who had means, motive, and opportunity.
            </p>
            <p style="margin: 0 0 0 0; font-style: italic; color: #aaaaaa;">
                Your job, Detective: Find the killer through careful interrogation and expose their lies.
            </p>
        `;

        // Create suspects preview
        const suspectsPreview = document.createElement('div');
        suspectsPreview.style.cssText = `
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            gap: 20px;
        `;

        const suspects = [
            { name: 'Elena Rodriguez', role: 'Personal Assistant', color: '#4CAF50' },
            { name: 'Dr. James Hartwell', role: 'Ex-Husband', color: '#FF9800' },
            { name: 'Marcus Webb', role: 'Business Rival', color: '#F44336' }
        ];

        suspects.forEach(suspect => {
            const suspectCard = document.createElement('div');
            suspectCard.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid ${suspect.color};
                border-radius: 8px;
                padding: 15px;
                flex: 1;
                text-align: center;
            `;
            
            suspectCard.innerHTML = `
                <div style="font-weight: bold; color: ${suspect.color}; margin-bottom: 5px;">${suspect.name}</div>
                <div style="font-size: 0.9rem; color: #cccccc;">${suspect.role}</div>
            `;
            
            suspectsPreview.appendChild(suspectCard);
        });

        // Create start button
        const startButton = document.createElement('button');
        startButton.textContent = 'BEGIN INVESTIGATION';
        startButton.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 1.2rem;
            font-weight: bold;
            padding: 15px 40px;
            background: linear-gradient(135deg, #ff4444, #cc3333);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
        `;

        // Button hover effects
        startButton.addEventListener('mouseenter', () => {
            startButton.style.background = 'linear-gradient(135deg, #ff6666, #ee4444)';
            startButton.style.transform = 'translateY(-2px)';
            startButton.style.boxShadow = '0 6px 20px rgba(255, 68, 68, 0.4)';
        });

        startButton.addEventListener('mouseleave', () => {
            startButton.style.background = 'linear-gradient(135deg, #ff4444, #cc3333)';
            startButton.style.transform = 'translateY(0)';
            startButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.3)';
        });

        startButton.addEventListener('click', () => {
            this.hide();
        });

        // Assemble the overlay
        content.appendChild(title);
        content.appendChild(caseDetails);
        content.appendChild(suspectsPreview);
        content.appendChild(startButton);
        this.overlay.appendChild(content);

        // Add to page
        document.body.appendChild(this.overlay);
        this.isVisible = true;
    }

    show() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.overlay) {
            // Fade out animation
            this.overlay.style.transition = 'opacity 0.5s ease-out';
            this.overlay.style.opacity = '0';
            
            setTimeout(() => {
                this.overlay.style.display = 'none';
                this.isVisible = false;
            }, 500);
        }
    }

    isShowing() {
        return this.isVisible;
    }
}