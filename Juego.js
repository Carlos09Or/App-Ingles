// Vocabulario Inglés-Español por Temas - JavaScript separado


// Variables del juego
let gameStats = {
    correct: 0,
    incorrect: 0,
    totalPlayed: 0,
    currentStreak: 0,
    bestStreak: 0
};

let currentTheme = null;
let currentWord = "";
let usedWords = [];
let wordCounter = 0;
let themeWords = [];
let pendingTranslations = [];
let gameMode = 'themed'; // 'themed' o 'mixed'

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    updateDisplay();
    populateThemeSelectors();
});

// También ejecutar al cargar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

function initializeGame() {
    loadStats();
    updateDisplay();
    populateThemeSelectors();
}

function loadStats() {
    const saved = localStorage.getItem('vocabularyStatsThemed');
    if (saved) {
        gameStats = { ...gameStats, ...JSON.parse(saved) };
    }
}

function saveStats() {
    localStorage.setItem('vocabularyStatsThemed', JSON.stringify(gameStats));
}

function updateDisplay() {
    const totalWords = Object.values(themesDatabase).reduce((sum, theme) => 
        sum + Object.keys(theme.words).length, 0);
    const totalThemes = Object.keys(themesDatabase).length;

    document.getElementById('totalWords').textContent = totalWords;
    document.getElementById('totalThemes').textContent = totalThemes;
    document.getElementById('bestStreak').textContent = gameStats.bestStreak;
    document.getElementById('totalPlayed').textContent = gameStats.totalPlayed;
    document.getElementById('correctAnswers').textContent = gameStats.correct;
    document.getElementById('incorrectAnswers').textContent = gameStats.incorrect;
    
    const accuracy = gameStats.totalPlayed > 0 ? 
        Math.round((gameStats.correct / gameStats.totalPlayed) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    document.getElementById('accuracyBar').style.width = accuracy + '%';
}

function populateThemeSelectors() {
    const themeSelect = document.getElementById('themeSelect');
    const viewThemeSelect = document.getElementById('viewThemeSelect');
    
    // Limpiar selectores
    themeSelect.innerHTML = '<option value="">Selecciona un tema</option>';
    viewThemeSelect.innerHTML = '<option value="all">Todas las palabras</option>';
    
    Object.entries(themesDatabase).forEach(([key, theme]) => {
        const option1 = document.createElement('option');
        option1.value = key;
        option1.textContent = theme.name;
        themeSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = key;
        option2.textContent = theme.name;
        viewThemeSelect.appendChild(option2);
    });
}

function showArea(areaId) {
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    document.getElementById(areaId).classList.add('active');
}

function showMenu() {
    showArea('mainMenu');
    updateDisplay();
}

function showThemes() {
    showArea('themesArea');
    displayThemes();
}

function displayThemes() {
    const themeGrid = document.getElementById('themeGrid');
    themeGrid.innerHTML = '';

    Object.entries(themesDatabase).forEach(([key, theme]) => {
        const themeCard = document.createElement('div');
        themeCard.className = 'theme-card';
        themeCard.setAttribute('data-theme', key);
        themeCard.onclick = () => startThemedGame(key);
        
        const wordCount = Object.keys(theme.words).length;
        
        themeCard.innerHTML = `
            <div class="theme-icon">${theme.icon}</div>
            <div class="theme-name">${theme.name.replace(/^[^\s]+ /, '')}</div>
            <div class="theme-count">${wordCount} palabras</div>
        `;
        
        themeGrid.appendChild(themeCard);
    });
}

function startThemedGame(themeKey) {
    currentTheme = themeKey;
    gameMode = 'themed';
    themeWords = Object.keys(themesDatabase[themeKey].words);
    usedWords = [];
    wordCounter = 0;
    
    document.getElementById('currentThemeDisplay').textContent = themesDatabase[themeKey].name;
    document.getElementById('totalThemeWords').textContent = themeWords.length;
    
    showArea('gameArea');
    nextWord();
}

function startMixedGame() {
    currentTheme = null;
    gameMode = 'mixed';
    themeWords = [];
    usedWords = [];
    wordCounter = 0;
    
    document.getElementById('currentThemeDisplay').textContent = '🎲 Juego Mixto';
    document.getElementById('totalThemeWords').textContent = '∞';
    
    showArea('gameArea');
    nextWord();
}

function showStats() {
    showArea('statsArea');
    updateDisplay();
}

function showAddWord() {
    showArea('addWordArea');
    document.getElementById('englishInput').value = '';
    document.getElementById('spanishInput').value = '';
    document.getElementById('themeSelect').value = '';
    pendingTranslations = [];
    updateTranslationsList();
}

function showWordList() {
    showArea('wordListArea');
    displayWordList();
}

function endGame() {
    showMenu();
}

function getRandomWord() {
    let availableWords;
    
    if (gameMode === 'themed' && currentTheme) {
        availableWords = themeWords.filter(word => !usedWords.slice(-5).includes(word));
        
        if (availableWords.length === 0) {
            usedWords = [];
            availableWords = themeWords;
        }
    } else {
        // Modo mixto - obtener palabras de todos los temas
        const allWords = [];
        Object.values(themesDatabase).forEach(theme => {
            allWords.push(...Object.keys(theme.words));
        });
        
        availableWords = allWords.filter(word => !usedWords.slice(-10).includes(word));
        
        if (availableWords.length === 0) {
            usedWords = [];
            availableWords = allWords;
        }
    }
    
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(word);
    return word;
}

function getWordTranslations(word) {
    for (const theme of Object.values(themesDatabase)) {
        if (theme.words[word]) {
            return theme.words[word];
        }
    }
    return [];
}

function nextWord() {
    currentWord = getRandomWord();
    wordCounter++;
    
    document.getElementById('currentWord').textContent = currentWord.toUpperCase();
    document.getElementById('wordCounter').textContent = wordCounter;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    document.getElementById('feedback').classList.remove('show');
    
    updateStreakDisplay();
}

function updateStreakDisplay() {
    document.getElementById('streakIndicator').textContent = `🔥 Racha: ${gameStats.currentStreak}`;
}

function checkAnswer() {
    const userAnswer = document.getElementById('answerInput').value.trim().toLowerCase();
    const correctAnswers = getWordTranslations(currentWord);
    
    if (!userAnswer) return;
    
    const isCorrect = correctAnswers.some(answer => answer.toLowerCase() === userAnswer);
    
    gameStats.totalPlayed++;
    
    if (isCorrect) {
        gameStats.correct++;
        gameStats.currentStreak++;
        if (gameStats.currentStreak > gameStats.bestStreak) {
            gameStats.bestStreak = gameStats.currentStreak;
        }
        showFeedback(true, '¡Correcto! 🎉');
    } else {
        gameStats.incorrect++;
        gameStats.currentStreak = 0;
        showFeedback(false, `Incorrecto. La respuesta es: ${correctAnswers.join(', ')}`);
    }
    
    saveStats();
    updateStreakDisplay();
    
    setTimeout(() => {
        nextWord();
    }, 2000);
}

function showFeedback(correct, message) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback show ' + (correct ? 'correct' : 'incorrect');
}

function skipWord() {
    const correctAnswers = getWordTranslations(currentWord);
    showFeedback(false, `La respuesta era: ${correctAnswers.join(', ')}`);
    
    setTimeout(() => {
        nextWord();
    }, 2000);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}

function handleTranslationKeyPress(event) {
    if (event.key === 'Enter') {
        addTranslation();
    }
}

function addTranslation() {
    const translation = document.getElementById('spanishInput').value.trim();
    if (translation && !pendingTranslations.includes(translation.toLowerCase())) {
        pendingTranslations.push(translation.toLowerCase());
        document.getElementById('spanishInput').value = '';
        updateTranslationsList();
    }
}

function updateTranslationsList() {
    const list = document.getElementById('translationsList');
    list.innerHTML = '';
    
    pendingTranslations.forEach((translation, index) => {
        const tag = document.createElement('div');
        tag.className = 'translation-tag';
        tag.innerHTML = `
            ${translation}
            <button class="remove-translation" onclick="removeTranslation(${index})">×</button>
        `;
        list.appendChild(tag);
    });
}

function removeTranslation(index) {
    pendingTranslations.splice(index, 1);
    updateTranslationsList();
}

function saveNewWord() {
    const english = document.getElementById('englishInput').value.trim().toLowerCase();
    const selectedTheme = document.getElementById('themeSelect').value;
    
    if (!english || !selectedTheme || pendingTranslations.length === 0) {
        alert('Por favor, completa todos los campos: tema, palabra en inglés y al menos una traducción.');
        return;
    }
    
    if (!themesDatabase[selectedTheme]) {
        alert('El tema seleccionado no existe.');
        return;
    }
    
    themesDatabase[selectedTheme].words[english] = [...pendingTranslations];
    
    showFeedback(true, `Palabra "${english}" agregada al tema ${themesDatabase[selectedTheme].name}!`);
    
    setTimeout(() => {
        showMenu();
    }, 1500);
}

function displayWordList() {
    const wordList = document.getElementById('wordList');
    const selectedTheme = document.getElementById('viewThemeSelect').value;
    wordList.innerHTML = '';
    
    let wordsToShow = [];
    
    if (selectedTheme === 'all') {
        // Mostrar todas las palabras organizadas por tema
        Object.entries(themesDatabase).forEach(([themeKey, theme]) => {
            const themeHeader = document.createElement('div');
            themeHeader.style.cssText = 'font-weight: bold; font-size: 1.2rem; margin: 20px 0 10px 0; color: #667eea; border-bottom: 2px solid #e0e0e0; padding-bottom: 5px;';
            themeHeader.textContent = theme.name;
            wordList.appendChild(themeHeader);
            
            Object.entries(theme.words).forEach(([english, spanish]) => {
                const item = document.createElement('div');
                item.className = 'word-item';
                item.innerHTML = `<strong>${english}</strong> → ${spanish.join(', ')}`;
                wordList.appendChild(item);
            });
        });
    } else {
        // Mostrar palabras de un tema específico
        const theme = themesDatabase[selectedTheme];
        if (theme) {
            const sortedWords = Object.entries(theme.words).sort();
            sortedWords.forEach(([english, spanish], index) => {
                const item = document.createElement('div');
                item.className = 'word-item';
                item.innerHTML = `<strong>${index + 1}. ${english}</strong> → ${spanish.join(', ')}`;
                wordList.appendChild(item);
            });
        }
    }
}

// Inicializar el juego
updateDisplay();
