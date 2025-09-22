const storage = window.localStorage;
if (!storage.getItem('dob')) {
    window.location.href = "set-archetype.html";
}

document.addEventListener('DOMContentLoaded', async function () {
    const profileImage = document.getElementById('profileImage');
    const chapterTitle = document.getElementById('chapterTitle');
    const quoteDisplay = document.getElementById('quoteDisplay');
    const timeRemaining = document.getElementById('remaining');
    const timePassed = document.getElementById('passed');
    const locationSymbol = document.getElementById('locationSymbol');
    const mainSymbol = document.getElementById('mainSymbol');
    const refreshQuoteBtn = document.getElementById('refreshQuoteBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const fabToggle = document.getElementById('fabToggle');
    const fabContainer = document.querySelector('.fab-container');
    const notesLayer = document.getElementById('notesLayer');
    const clearNotesBtn = document.getElementById('clearNotesBtn');
    const notesModeToggle = document.getElementById('notesModeToggle');
    const themeBtn = document.getElementById('themeBtn');

    function updateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('time-display').textContent = now.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', dateOptions);
    }
    updateTime();
    setInterval(updateTime, 1000);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <button class="modal-close" id="modalClose" aria-label="Close">Close</button>
            <h3 id="modalTitle" class="modal-title"></h3>
            <div id="modalBody" class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    const modalTitle = overlay.querySelector('#modalTitle');
    const modalBody = overlay.querySelector('#modalBody');
    const modalClose = overlay.querySelector('#modalClose');

    const archetypeColors = {
        'garden': '#4ade80', 'forest': '#059669', 'mountain': '#6b7280', 'sea': '#0ea5e9',
        'desert': '#f59e0b', 'river': '#06b6d4', 'island': '#fbbf24', 'castle': '#dc2626',
        'cave': '#374151', 'labyrinth': '#7c3aed', 'crossroads': '#f97316', 'house': '#84cc16',
        'battlefield': '#dc2626', 'fire': '#dc2626', 'wind': '#e0e7ff', 'water': '#0ea5e9', 'underworld': '#121212',
        'sword': '#6b7280', 'torch': '#fbbf24', 'tree': '#059669', 'sun': '#f59e0b', 'moon': '#8b5cf6', 'graveyard': '#313833'
    };

    function generateArchetypeGradient(location, symbol) {
        const locationColor = archetypeColors[location] || '#f0f4f8';
        const symbolColor = archetypeColors[symbol] || '#e2e8f0';
        return `linear-gradient(135deg, ${locationColor} 0%, ${symbolColor} 100%)`;
    }

    function calculateTime(dobString) {
        const dob = new Date(dobString);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
            age--;
        }
        const currentAgeBirthday = new Date(dob.getFullYear() + age, dob.getMonth(), dob.getDate());
        const nextAgeBirthday = new Date(dob.getFullYear() + age + 1, dob.getMonth(), dob.getDate());
        const passedTimeMs = now.getTime() - currentAgeBirthday.getTime();
        const remainingTimeMs = nextAgeBirthday.getTime() - now.getTime();
        return {
            passed: {
                days: Math.floor(passedTimeMs / 86400000),
                hours: Math.floor((passedTimeMs % 86400000) / 3600000),
                minutes: Math.floor((passedTimeMs % 3600000) / 60000),
                seconds: Math.floor((passedTimeMs % 60000) / 1000)
            },
            remaining: {
                days: Math.floor(remainingTimeMs / 86400000),
                hours: Math.floor((remainingTimeMs % 86400000) / 3600000),
                minutes: Math.floor((remainingTimeMs % 3600000) / 60000),
                seconds: Math.floor((remainingTimeMs % 60000) / 1000)
            },
            age
        };
    }
    
    function updateDateTimeColor() {
        const datetimeContainer = document.getElementById('datetime-container');
        const style = window.getComputedStyle(document.body);
        const bg = style.backgroundImage;
        let topColor;
        if (bg.startsWith('linear-gradient')) {
            const matches = bg.match(/rgb\([^)]+\)/g);
            topColor = matches ? matches[0] : style.backgroundColor;
        } else {
            topColor = style.backgroundColor;
        }

        if (!topColor || topColor === 'transparent' || topColor.includes('rgba(0, 0, 0, 0)')) {
            datetimeContainer.style.color = '#ffffff';
            return;
        }
        const [r, g, b] = topColor.match(/\d+/g).map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        datetimeContainer.style.color = luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    function getArchetypeImagePath(archetypeType, value) {
        const map = {
            location: {
                'garden': 'garden-tree-svgrepo-com.svg', 'forest': 'forest-svgrepo-com.svg', 'mountain': 'mountain-svgrepo-com.svg',
                'sea': 'sea-waves-svgrepo-com.svg', 'desert': 'desert-svgrepo-com.svg', 'river': 'river-svgrepo-com.svg',
                'island': 'island-svgrepo-com.svg', 'castle': 'castle-svgrepo-com.svg', 'cave': 'cave-nature-svgrepo-com.svg',
                'labyrinth': 'labyrinth-maze-svgrepo-com.svg', 'crossroads': 'crossroads-svgrepo-com.svg', 'house': 'house-svgrepo-com.svg',
                'battlefield': 'minefield-svgrepo-com.svg', 'graveyard': 'cemetery-gravestone-graveyard-svgrepo-com.svg', 'underworld': 'death-grim-reaper-svgrepo-com.svg'
            },
            symbol: {
                'fire': 'fire-svgrepo-com.svg', 'wind': 'wind-energy-svgrepo-com.svg', 'water': 'water-fee-svgrepo-com.svg',
                'sword': 'sword-svgrepo-com.svg', 'torch': 'coyl.png', 'tree': 'tree-decidious-svgrepo-com.svg',
                'sun': 'sun-svgrepo-com.svg', 'moon': 'moon-stars-svgrepo-com.svg'
            }
        };
        return `../assets/${map[archetypeType][value] || 'coyl.png'}`;
    }

    async function loadAndDisplayData() {
        const dob = storage.getItem('dob');
        const chapterName = storage.getItem('chapterName');
        const location = storage.getItem('location');
        const symbol = storage.getItem('symbol');
        const avatar = storage.getItem('avatar');
        await fetchNewQuote();
        const container = document.querySelector('.container');
        const theme = getTheme();
        if (!theme.containerFrom || !theme.containerTo) {
            container.style.background = generateArchetypeGradient(location, symbol);
        }
        updateDateTimeColor();
        locationSymbol.src = getArchetypeImagePath('location', location);
        mainSymbol.src = getArchetypeImagePath('symbol', symbol);
        profileImage.src = (avatar && avatar !== 'null') ? avatar : 'assets/coyl.png';
        const { passed, remaining, age } = calculateTime(dob);
        timeRemaining.textContent = `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`;
        timePassed.textContent = `${passed.days}d ${passed.hours}h ${passed.minutes}m ${passed.seconds}s`;
        chapterTitle.textContent = `Chapter ${age}: ${chapterName}`;
        locationSymbol.addEventListener('click', () => openInfoModal(location, locationInfo[location]));
        mainSymbol.addEventListener('click', () => openInfoModal(symbol, symbolInfo[symbol]));
    }

    const symbolInfo = {
        'fire': "The archetype of Fire represents the primal, untamed energy of transformation, passion, and purification. It is a dual force, capable of both creation and destruction. On one hand, it is the spark of life, the warmth of the hearth, the courage in the heart, and the divine inspiration that fuels creativity and ambition. It symbolizes the alchemical process of burning away the old to make way for the new. On the other hand, unchecked fire becomes rage, destruction, and chaos. To choose this symbol is to align with a period of intense change, to embrace a passionate drive, and to find the courage to let go of what no longer serves you, trusting that from the ashes, something new and vital will be born.",
        'wind': "The archetype of Wind symbolizes the unseen forces of intellect, change, and the spirit. It is the breath of life, the messenger of new ideas, and the power that sweeps away stagnation. Unlike other elements, the Wind is intangible; it can be felt but not held, representing the power of thought, intuition, and communication. It encourages a life of adaptability, curiosity, and the freedom that comes from releasing rigid attachments. To align with this symbol is to trust in the journey, even when the path is not visible, and to listen to the subtle whispers of inspiration that guide you toward your true purpose. The Wind teaches that the most powerful forces are often those we cannot see.",
        'water': "The archetype of Water represents the deep, flowing currents of the emotional realm, intuition, and the unconscious mind. It is the symbol of adaptability, healing, and the mysteries that lie beneath the surface of awareness. Water takes the shape of its container, teaching the wisdom of yielding and flowing around obstacles rather than confronting them with force. It also holds the power to cleanse and purify, offering emotional release and renewal. To choose this symbol is to honor your feelings, to dive into the depths of your own soul, and to trust the intuitive guidance that arises from your inner wellspring. Water reminds us that true strength is often found in gentleness and that persistent flow can change the hardest of landscapes.",
        'sword': "The archetype of the Sword is a powerful symbol of truth, clarity, and the incisive power of the intellect. It represents the ability to cut through illusion, ambiguity, and confusion to arrive at a core understanding. Wielding the Sword requires integrity and discernment; it is the tool of justice, order, and decisive action. It symbolizes the courage to make difficult choices and to defend one's principles. However, the Sword is also a symbol of conflict and separation, a tool that can wound as well as protect. To choose this symbol is to embrace a time of critical thinking, to seek truth with honesty, and to act with precision, while always remembering the responsibility that comes with such power.",
        'torch': "The archetype of the Torch represents enlightenment, knowledge, and the quest for truth in the midst of darkness. It is a beacon of hope, a symbol of the individual's power to illuminate the unknown for themselves and for others. To carry the Torch is to be a seeker of wisdom, a student of life, and a guide who shares their light without diminishing their own flame. It symbolizes consciousness breaking through the unconscious, awareness dispelling fear, and the courage to explore uncharted territories, both in the world and within the self. This archetype encourages you to trust your inner guidance and to be a source of inspiration and clarity in times of uncertainty.",
        'tree': "The archetype of the Tree is a universal symbol of life, growth, and interconnectedness. With its roots deep in the earth and its branches reaching for the sky, it represents the bridge between the material and spiritual worlds, the conscious and the unconscious. The Tree teaches the lessons of patience, resilience, and the natural cycles of life, death, and rebirth. It is a reminder that strength comes from a solid, grounded foundation, and that true growth is a slow, organic, and seasonal process. To align with this symbol is to honor your roots, to nurture your personal development, and to recognize that, like a tree, you are part of a vast and interconnected ecosystem, providing shelter and sustenance to others through your very being.",
        'sun': "The archetype of the Sun is the ultimate symbol of consciousness, vitality, and the radiant power of the self. It is the source of light, warmth, and life, representing clarity, optimism, and the masculine principle of action and expression. To embody the Sun is to embrace your own creative energy, to act with confidence and generosity, and to shine your unique gifts into the world without reservation. The Sun teaches the importance of visibility, courage, and living with an open heart. It is a reminder to rise each day with renewed purpose, to take center stage in your own life, and to be a source of warmth and illumination for all those around you.",
        'moon': "The archetype of the Moon represents the inner world, the realm of intuition, dreams, and the sacred feminine. It is a symbol of the cyclical nature of life, the ebb and flow of emotions, and the wisdom that can be found in darkness, mystery, and reflection. Unlike the Sun's direct light, the Moon's radiance is reflected, symbolizing the power of receptivity, introspection, and the subtle guidance of the unconscious. To align with the Moon is to trust your instincts, to honor your need for solitude and rest, and to pay attention to the hidden currents that move beneath the surface of your conscious life. It teaches that there is a time for every phase, and that even in the dark, a gentle light is always present to guide you."
    };
    
    const locationInfo = {
        'garden': "The Garden is a symbol of cultivation, creativity, and the ordered beauty of nature. It represents a part of your life where you are actively nurturing growth, whether it's a project, a relationship, or your own personal development. It is a place of patience and mindful effort, where you must tend to the soil, pull the weeds of negative habits, and provide the right conditions for your intentions to blossom. The Garden teaches the laws of cause and effect and the deep satisfaction of seeing your labor bear fruit. It is a space of peace, abundance, and connection to the life-giving cycles of the earth.",
        'forest': "The Forest is the realm of the unknown, the unconscious, and the wild, untamed aspects of your own nature. To enter the Forest is to leave the clear, sunlit path and venture into a world of mystery, instinct, and hidden truths. It represents a journey of self-discovery where you must learn to navigate without familiar landmarks, relying instead on your intuition and inner senses. The Forest is home to both shadow and light, danger and sanctuary. It symbolizes a time of testing and initiation, where confronting your fears can lead to profound wisdom and a deeper connection to your primal self.",
        'mountain': "The Mountain is a powerful archetype of challenge, aspiration, and the arduous journey toward a higher perspective. It represents a significant goal or obstacle in your life that requires endurance, determination, and unwavering focus to overcome. The climb is steep and difficult, symbolizing the personal and spiritual trials one must face to achieve mastery and self-knowledge. The summit, once reached, offers unparalleled clarity, a vision of the world from a transcendent viewpoint. The Mountain teaches that the greatest rewards are earned through effort and that the perspective gained from the struggle is as valuable as reaching the peak itself.",
        'sea': "The Sea is the archetype of the collective unconscious, the vast and deep expanse of emotion, and the source of all life's possibilities. Its surface can be calm and reflective or turbulent and stormy, symbolizing the ever-changing nature of our emotional states. To journey into the Sea is to explore the depths of your own soul, to confront the powerful currents of feeling, and to surrender to forces greater than yourself. It represents a connection to the universal mysteries of life, intuition, and the creative chaos from which all things emerge. The Sea teaches the wisdom of adaptability and the courage to navigate the profound and often unpredictable waters of your inner world.",
        'desert': "The Desert is an archetype of purification, solitude, and spiritual testing. It is a landscape stripped bare of all non-essentials, a place where the distractions of the world fall away, leaving you alone with your own thoughts and your soul. A journey through the Desert represents a period of trial and introspection, a quest for vision and clarity. It is in this emptiness that one often finds a deeper connection to the self and to the divine. The Desert teaches the lessons of endurance, resilience, and the discovery of the inner resources needed to survive and thrive. It is a place where a single drop of water, a single sign of life, holds profound meaning.",
        'river': "The River is a symbol of the flow of time, life's journey, and the constant process of change. It is always moving, never the same from one moment to the next, teaching the lesson of impermanence and the importance of letting go. The River can be a gentle, meandering path or a powerful, raging torrent, representing the different paces and intensities of our life experiences. To be in the River is to be in the current of life, learning when to steer, when to surrender to the flow, and how to navigate the obstacles that appear along the way. It symbolizes the journey from source to sea, from individual consciousness back to the universal whole.",
        'island': "The Island is an archetype of solitude, isolation, and self-reliance. It represents a state of being separate from the collective, a place where you can discover what is truly yours, away from the influences of the outside world. This can be a place of lonely exile or a sanctuary for profound self-discovery and inner work. The Island forces you to confront your own resources, your own company, and your own essence. It is a symbol of unique identity and the challenges and gifts of individuality. The journey to or from the Island often represents a significant transition in your relationship with yourself and with the community.",
        'castle': "The Castle is a powerful symbol of structure, protection, and the sovereign self. It represents the fortress you have built around your values, your beliefs, and your identity. Its walls define what you let in and what you keep out, symbolizing your personal boundaries. The Castle is a place of order, authority, and the management of your inner kingdom. However, it can also become a prison if its walls are too high, isolating you from connection and new experiences. This archetype invites you to examine the structures in your life, to ensure they are protecting a living, thriving kingdom rather than an empty, isolated keep.",
        'cave': "The Cave is an archetype of introspection, incubation, and the descent into the inner self. It is a sanctuary from the outer world, a place of darkness and quiet where seeds of new life can germinate. Entering the Cave symbolizes a journey inward to confront hidden aspects of your psyche, to find refuge, or to undergo a process of transformation. It is the womb of the earth, a place of potential and rebirth. The wisdom found in the Cave is not of the sunlit world; it is an intuitive, primal knowing that emerges from the depths. This archetype marks a time for retreat, reflection, and waiting for the right moment to emerge, renewed and transformed.",
        'labyrinth': "The Labyrinth is an archetype of the complex and winding journey to the center of the self. Unlike a maze, it has no dead ends; there is only one path, and as long as you stay on it, you will reach the goal. The journey, however, is long and circuitous, filled with twists and turns that can feel confusing and disorienting. The Labyrinth symbolizes a spiritual pilgrimage, a meditative process that requires patience, trust, and focus. It teaches that the path to wisdom is not always direct and that every turn has a purpose. Reaching the center represents a profound integration and a coming home to your true nature.",
        'crossroads': "The Crossroads is a potent symbol of choice, destiny, and a pivotal turning point in life's journey. It is a place where paths intersect, and a decision must be made that will alter the course of your future. Standing at the Crossroads represents a moment of significant uncertainty and opportunity, where you must weigh your options, consult your inner wisdom, and commit to a new direction. It is a threshold space, a moment suspended between the past and the future, charged with the power of potential. This archetype signifies that you are at a critical juncture and that the choice you make will be a defining moment in your story.",
        'house': "The House is a powerful archetype representing the self, the psyche, and one's place in the world. Each room can symbolize different aspects of your personality, memories, and potentials—the attic for higher thought, the basement for the unconscious. It is a symbol of belonging, security, and personal identity. The condition of the House reflects your inner state. Is it well-maintained or in disrepair? Are there hidden rooms yet to be discovered? This archetype invites you to explore your own inner architecture, to care for your foundations, and to make your soul a true home—a place of comfort, strength, and authentic being.",
        'battlefield': "The Battlefield is an archetype of conflict, struggle, and the clash of opposing forces. It represents a state of internal or external turmoil where values are tested, and courage is required. This is not just a place of violence, but a crucible for transformation, where you must confront your adversaries—be they inner demons or outer challenges—with discipline and resolve. The Battlefield forces a clarification of what is worth fighting for. It teaches the hard lessons of strategy, sacrifice, and the wisdom to know when to stand your ground and when to seek peace. Victory on the Battlefield leads to a stronger, more resilient sense of self.",
        'graveyard': "The archetype of the Graveyard symbolizes the crucial act of endings, boundaries, and respectful closure. It is a sacred space where the past is laid to rest, marking a clear threshold between what was and what is now. This archetype embodies finality, reverence for completed chapters, and the courage to close doors with dignity. It is not merely a symbol of loss, but of a well-managed life where psychological tidiness is maintained by ritualizing closure, honoring memories without being haunted by them, and preventing old wounds from bleeding into the present. The Graveyard teaches that true freedom and peace come from decisively ending what is over, allowing you to fully inhabit your present life with calm resilience.",
        'underworld': "The archetype of the Underworld represents the deepest realm of the unconscious, a symbolic place of death, mystery, and profound transformation. It is the territory of the shadow self, where repressed fears, forgotten memories, and hidden potentials reside. The journey into the Underworld is a metaphorical descent to confront these powerful, often uncomfortable, aspects of the psyche. In mythology, heroes enter this realm to gain wisdom, retrieve lost souls, or face their ultimate trial, emerging forever changed. Psychologically, this archetype signifies a period of deep introspection and integration, a necessary death of the old self to allow for a powerful and authentic rebirth. It is a source of renewal that can only be found by courageously facing the darkness within."
    };

    function openInfoModal(title, text) {
        modalTitle.textContent = title.charAt(0).toUpperCase() + title.slice(1);
        modalBody.textContent = text || 'No additional information available.';
        overlay.classList.add('open');
    }

    function closeInfoModal() {
        overlay.classList.remove('open');
    }

    modalClose.addEventListener('click', closeInfoModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeInfoModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeInfoModal(); });

    const THEME_KEY = 'themeSettings';
    function getTheme() {
        try { return JSON.parse(storage.getItem(THEME_KEY) || '{}'); }
        catch (_) { return {}; }
    }
    function setTheme(obj) {
        storage.setItem(THEME_KEY, JSON.stringify(obj || {}));
    }
    function applyTheme() {
        const t = getTheme();
        if (t.bodyFrom && t.bodyTo) {
            document.body.style.background = `linear-gradient(to bottom, ${t.bodyFrom} 0%, ${t.bodyTo} 100%)`;
        }
        if (t.containerFrom && t.containerTo) {
            document.querySelector('.container').style.background = `linear-gradient(135deg, ${t.containerFrom} 0%, ${t.containerTo} 100%)`;
        }
        
        const containerTextColor = t.containerTextColor || '#0f0f0f';
        document.documentElement.style.setProperty('--container-text-color', containerTextColor);

        const hex = containerTextColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        document.documentElement.style.setProperty('--icon-filter', luminance < 0.5 ? 'brightness(0) invert(1)' : 'none');

        document.documentElement.style.setProperty('--fab-bg-color', t.fabBg || '#111827');
        document.documentElement.style.setProperty('--fab-text-color', t.fabColor || '#ffffff');
        document.documentElement.style.setProperty('--fab-main-bg-color', t.fabMainBg || 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e5e7eb 60%, #d1d5db 100%)');
        document.documentElement.style.setProperty('--modal-text-color', t.modalTextColor || '#0f0f0f');
        document.documentElement.style.setProperty('--modal-bg-color', t.modalBg || 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)');
        document.documentElement.style.setProperty('--sticky-font-size', (t.noteFontSize || 0.9) + 'rem');
        
        let styleSheet = document.getElementById('custom-styles');
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = 'custom-styles';
            document.head.appendChild(styleSheet);
        }
        let styles = '';
        if (t.noteBg) styles += `.sticky-note { background-color: ${t.noteBg} !important; }`;
        if (t.noteText) styles += `.sticky-text, .sticky-title { color: ${t.noteText} !important; }`;
        styleSheet.textContent = styles;
        updateDateTimeColor();
    }
    
    function rgbToHex(rgb) {
        if (!rgb || !rgb.match(/\d+/g)) return '#000000';
        return '#' + rgb.match(/\d+/g).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function openThemeModal() {
        const t = getTheme();
        const computedBody = window.getComputedStyle(document.body);
        const computedContainer = window.getComputedStyle(document.querySelector('.container'));
        const bodyColors = computedBody.backgroundImage.match(/rgb\([^)]+\)/g) || [];
        const containerColors = computedContainer.backgroundImage.match(/rgb\([^)]+\)/g) || [];
        const computedFab = window.getComputedStyle(document.querySelector('.fab-action'));
        const computedFabMain = window.getComputedStyle(document.querySelector('.fab-main'));
        const computedModal = window.getComputedStyle(document.querySelector('.modal'));
        const computedModalText = window.getComputedStyle(document.querySelector('.modal-body'));
        const computedContainerText = window.getComputedStyle(document.documentElement).getPropertyValue('--container-text-color');

        const currentTheme = {
            bodyFrom: bodyColors.length > 0 ? rgbToHex(bodyColors[0]) : t.bodyFrom || '#3b3b3b',
            bodyTo: bodyColors.length > 1 ? rgbToHex(bodyColors[1]) : t.bodyTo || '#000000',
            containerFrom: containerColors.length > 0 ? rgbToHex(containerColors[0]) : t.containerFrom || '#f0f4f8',
            containerTo: containerColors.length > 1 ? rgbToHex(containerColors[1]) : t.containerTo || '#e2e8f0',
            noteBg: t.noteBg || '#ffffff',
            noteText: t.noteText || '#111827',
            noteFontSize: t.noteFontSize || 0.9,
            fabBg: rgbToHex(computedFab.backgroundColor),
            fabColor: rgbToHex(computedFab.color),
            fabMainBg: computedFabMain.backgroundImage.startsWith('radial-gradient') ? '#ffffff' : rgbToHex(computedFabMain.backgroundColor),
            modalTextColor: rgbToHex(computedModalText.color),
            modalBg: computedModal.backgroundImage.startsWith('linear-gradient') ? '#ffffff' : rgbToHex(computedModal.backgroundColor),
            containerTextColor: t.containerTextColor || computedContainerText.trim()
        };

        modalTitle.textContent = 'Theme & Colors';
        modalBody.innerHTML = `
            <div class="theme-grid">
                <div class="theme-row"><span>Body From (Top)</span><input id="bodyFrom" type="color" value="${currentTheme.bodyFrom}"></div>
                <div class="theme-row"><span>Body To (Bottom)</span><input id="bodyTo" type="color" value="${currentTheme.bodyTo}"></div>
                <div class="theme-row"><span>Container From</span><input id="containerFrom" type="color" value="${currentTheme.containerFrom}"></div>
                <div class="theme-row"><span>Container To</span><input id="containerTo" type="color" value="${currentTheme.containerTo}"></div>
                <div class="theme-row"><span>Container Text & Border</span><input id="containerTextColor" type="color" value="${currentTheme.containerTextColor}"></div>
                <div class="theme-row"><span>Note Background</span><input id="noteBg" type="color" value="${currentTheme.noteBg}"></div>
                <div class="theme-row"><span>Note Text</span><input id="noteText" type="color" value="${currentTheme.noteText}"></div>
                <div class="theme-row"><span>FAB Main BG</span><input id="fabMainBg" type="color" value="${currentTheme.fabMainBg}"></div>
                <div class="theme-row"><span>FAB Actions BG</span><input id="fabBg" type="color" value="${currentTheme.fabBg}"></div>
                <div class="theme-row"><span>FAB Text</span><input id="fabColor" type="color" value="${currentTheme.fabColor}"></div>
                <div class="theme-row"><span>Description BG</span><input id="modalBg" type="color" value="${currentTheme.modalBg}"></div>
                <div class="theme-row"><span>Description Text</span><input id="modalTextColor" type="color" value="${currentTheme.modalTextColor}"></div>
            </div>
            <div class="theme-row" style="grid-column: 1 / -1; margin-top: 0.75rem;">
                <span class="theme-label">Note Font Size</span>
                <input id="noteFontSize" type="range" min="0.7" max="1.5" step="0.1" value="${currentTheme.noteFontSize}">
                <span id="noteFontSizeValue">${currentTheme.noteFontSize}rem</span>
            </div>
            <div class="theme-actions">
                <button id="themeSave" class="theme-button">Save</button>
                <button id="themeReset" class="theme-button">Reset</button>
            </div>`;
        overlay.classList.add('open');
        
        const noteFontSizeSlider = document.getElementById('noteFontSize');
        const noteFontSizeValue = document.getElementById('noteFontSizeValue');
        noteFontSizeSlider.addEventListener('input', () => {
            noteFontSizeValue.textContent = noteFontSizeSlider.value + 'rem';
        });

        document.getElementById('themeSave').addEventListener('click', () => {
            setTheme({
                bodyFrom: document.getElementById('bodyFrom').value,
                bodyTo: document.getElementById('bodyTo').value,
                containerFrom: document.getElementById('containerFrom').value,
                containerTo: document.getElementById('containerTo').value,
                noteBg: document.getElementById('noteBg').value,
                noteText: document.getElementById('noteText').value,
                noteFontSize: document.getElementById('noteFontSize').value,
                fabBg: document.getElementById('fabBg').value,
                fabColor: document.getElementById('fabColor').value,
                fabMainBg: document.getElementById('fabMainBg').value,
                modalTextColor: document.getElementById('modalTextColor').value,
                modalBg: document.getElementById('modalBg').value,
                containerTextColor: document.getElementById('containerTextColor').value
            });
            applyTheme();
            closeInfoModal();
        });
        document.getElementById('themeReset').addEventListener('click', () => {
            storage.removeItem(THEME_KEY);
            window.location.reload();
        });
    }

    themeBtn.addEventListener('click', openThemeModal);
    
    const NOTES_KEY = 'stickyNotes';
    const NOTES_MODE_KEY = 'stickyNotesMode';
    function getNotesMode() {
        return storage.getItem(NOTES_MODE_KEY) === 'true';
    }
    function setNotesMode(enabled) {
        storage.setItem(NOTES_MODE_KEY, String(enabled));
        updateNotesModeUI();
    }
    function updateNotesModeUI() {
        const enabled = getNotesMode();
        notesModeToggle.classList.toggle('active', enabled);
        notesModeToggle.setAttribute('aria-pressed', String(enabled));
        document.body.style.cursor = (enabled && !window.matchMedia('(max-width: 640px)').matches) ? 'crosshair' : '';
    }
    function readNotes() {
        try { return JSON.parse(storage.getItem(NOTES_KEY) || '[]'); }
        catch (_) { return []; }
    }
    function writeNotes(notes) {
        storage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
    function createNoteElement(note) {
        const el = document.createElement('div');
        el.className = 'sticky-note';
        el.style.left = note.x + 'px';
        el.style.top = note.y + 'px';
        el.style.width = (note.width || 200) + 'px';
        el.style.height = (note.height || 200) + 'px';
        el.dataset.id = note.id;
        el.innerHTML = `
            <div class="sticky-header">
                <div class="sticky-title">${note.title || 'Note'}</div>
                <button class="sticky-delete" aria-label="Delete note">&times;</button>
            </div>
            <textarea class="sticky-text" placeholder="Write here...">${note.text || ''}</textarea>
        `;

        el.querySelector('.sticky-delete').addEventListener('click', (ev) => {
            ev.stopPropagation();
            writeNotes(readNotes().filter(n => n.id !== note.id));
            el.remove();
        });

        const textarea = el.querySelector('.sticky-text');
        let saveTimer;
        textarea.addEventListener('input', () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const notes = readNotes();
                const currentNote = notes.find(n => n.id === note.id);
                if (currentNote) {
                    currentNote.text = textarea.value;
                    writeNotes(notes);
                }
            }, 300);
        });

        let resizeTimer;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const notes = readNotes();
                const currentNote = notes.find(n => n.id === note.id);
                if (currentNote) {
                    currentNote.width = el.offsetWidth;
                    currentNote.height = el.offsetHeight;
                    writeNotes(notes);
                }
            }, 100);
        });
        resizeObserver.observe(el);

        const header = el.querySelector('.sticky-header');
        let dragging = false, startX = 0, startY = 0, originLeft = 0, originTop = 0;
        header.addEventListener('mousedown', (e) => {
            dragging = true; startX = e.clientX; startY = e.clientY;
            originLeft = el.offsetLeft; originTop = el.offsetTop;
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            let newLeft = originLeft + (e.clientX - startX);
            let newTop = originTop + (e.clientY - startY);
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - el.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - el.offsetHeight));
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            const notes = readNotes();
            const currentNote = notes.find(n => n.id === note.id);
            if (currentNote) {
                currentNote.x = el.offsetLeft;
                currentNote.y = el.offsetTop;
                writeNotes(notes);
            }
        });
        return el;
    }
    function renderNotes() {
        notesLayer.innerHTML = '';
        readNotes().forEach(n => notesLayer.appendChild(createNoteElement(n)));
    }
    function createNoteAt(x, y) {
        const noteWidth = 200, noteHeight = 200;
        const note = {
            id: 'note_' + Date.now(),
            x: Math.round(Math.max(0, Math.min(x - (noteWidth / 2), window.innerWidth - noteWidth))),
            y: Math.round(Math.max(0, Math.min(y - (noteHeight / 2), window.innerHeight - noteHeight))),
            width: noteWidth, height: noteHeight, text: '', title: 'Note'
        };
        const notes = readNotes();
        notes.push(note);
        writeNotes(notes);
        notesLayer.appendChild(createNoteElement(note));
    }
    document.addEventListener('click', (e) => {
        if (getNotesMode() && !e.target.closest('.sticky-note, .fab-container, .fab-left-container, .modal-overlay, a, button, input')) {
            createNoteAt(e.clientX, e.clientY);
        }
    });
    clearNotesBtn.addEventListener('click', () => {
        if (confirm('Clear all sticky notes? This cannot be undone.')) {
            writeNotes([]);
            renderNotes();
        }
    });
    notesModeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setNotesMode(!getNotesMode());
    });
    updateNotesModeUI();
    
    async function fetchNewQuote() {
        try {
            const response = await fetch('https://stoic-quotes.com/api/quote');
            if (response.ok) {
                const quoteData = await response.json();
                quoteDisplay.textContent = `"${quoteData.text}" - ${quoteData.author}`;
            } else {
                quoteDisplay.textContent = `"Your journey unfolds. Embrace the present."`;
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            quoteDisplay.textContent = `"Your journey unfolds. Embrace the present."`;
        }
    }
    refreshQuoteBtn.addEventListener('click', fetchNewQuote);

    function exportAllLocalStorage() {
        const data = { __metadata: { app: 'coyl', version: 1, exportedAt: new Date().toISOString() } };
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            try { data[key] = storage.getItem(key); }
            catch (e) { console.warn(`Could not export key: ${key}`); }
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        a.download = `coyl-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    function handleImportedData(parsed) {
        if (!parsed || typeof parsed !== 'object') {
            return alert('Invalid file format.');
        }
        if (!('dob' in parsed) && (!parsed.__metadata || parsed.__metadata.app !== 'coyl')) {
            if (!confirm('File does not look like a Coyl backup. Import anyway?')) return;
        }
        Object.keys(parsed).forEach(key => {
            if (key !== '__metadata') {
                storage.setItem(key, typeof parsed[key] === 'string' ? parsed[key] : JSON.stringify(parsed[key]));
            }
        });
        alert('Data imported successfully. Reloading...');
        window.location.reload();
    }
    exportBtn.addEventListener('click', exportAllLocalStorage);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try { handleImportedData(JSON.parse(evt.target.result)); }
            catch (err) { alert('Failed to parse JSON file.'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    function closeFab() {
        fabContainer.classList.remove('open');
        fabToggle.setAttribute('aria-expanded', 'false');
    }
    fabToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        fabContainer.classList.toggle('open');
        fabToggle.setAttribute('aria-expanded', fabContainer.classList.contains('open'));
    });
    document.addEventListener('click', (e) => { if (!fabContainer.contains(e.target)) closeFab(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFab(); });

    // Initial Load
    await loadAndDisplayData();
    renderNotes();
    applyTheme();

    setInterval(() => {
        const dob = storage.getItem('dob');
        if (dob) {
            const { passed, remaining } = calculateTime(dob);
            timeRemaining.textContent = `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`;
            timePassed.textContent = `${passed.days}d ${passed.hours}h ${passed.minutes}m ${passed.seconds}s`;
        }
    }, 1000);
    setInterval(fetchNewQuote, 86400000);
});