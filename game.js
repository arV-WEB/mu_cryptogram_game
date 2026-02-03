// Global Variables
let currentPlayer = null;
let gameState = {
    lives: 5,
    score: 0,
    level: 1,
    correctAnswers: 0,
    totalNeeded: 10,
    gameYear: '2020',
    gameDifficulty: 'medium',
    gameOver: false
};

// DOM Elements
const playerImage = document.getElementById('player-image');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const livesElement = document.getElementById('lives');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const correctCountElement = document.getElementById('correct-count');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const feedbackMessage = document.getElementById('feedback-message');
const correctAnswerElement = document.getElementById('correct-answer');
const gameOverModal = document.getElementById('game-over-modal');
const levelUpModal = document.getElementById('level-up-modal');
const hintBtn = document.getElementById('hint-btn');
const restartBtn = document.getElementById('restart-btn');
const continueBtn = document.getElementById('continue-btn');

// Base64 Fallback Image (SVG MU Player)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI0RBQjFDMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NVSBQbGF5ZXI8L3RleHQ+PC9zdmc+';

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    console.log('Game initializing...');
    loadGameState();
    getNewQuestion();
    setupEventListeners();
});

// Load Game State from Server
async function loadGameState() {
    try {
        const response = await fetch('/api/game_state');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        gameState.lives = data.lives || 5;
        gameState.score = data.score || 0;
        gameState.level = data.level || 1;
        gameState.correctAnswers = data.correctAnswers || 0;
        gameState.totalNeeded = data.totalNeeded || 10;
        gameState.gameYear = data.gameYear || '2020';
        gameState.gameDifficulty = data.gameDifficulty || 'medium';
        gameState.gameOver = data.game_over || false;
        
        updateUI();
        
        // Jika game over, tampilkan modal
        if (gameState.gameOver || gameState.lives <= 0) {
            setTimeout(() => {
                showGameOver();
            }, 500);
        }
    } catch (error) {
        console.error('Error loading game state:', error);
    }
}

// Get New Question
async function getNewQuestion() {
    try {
        console.log('Fetching new question...');
        
        const response = await fetch('/api/get_question');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.error) {
            console.error('Error from server:', data.error);
            showFeedback(data.error, 'error');
            
            // Jika error karena game over
            if (data.error.includes('Game over') || data.error.includes('selesai')) {
                gameState.gameOver = true;
                showGameOver();
                return;
            }
            
            // Use fallback
            playerImage.src = FALLBACK_IMAGE;
            playerImage.alt = 'Error loading player';
            
            // Update game state
            updateGameStateFromData(data);
            return;
        }
        
        // Update game state from server
        updateGameStateFromData(data);
        
        // TAMPILKAN GAMBAR
        if (data.image) {
            loadPlayerImage(data.image, data.player_name || 'Pemain Manchester United');
        } else {
            console.warn('No image data from API');
            playerImage.src = FALLBACK_IMAGE;
            playerImage.alt = 'Tidak ada gambar';
        }
        
        // Set image error handler
        playerImage.onerror = function() {
            console.error('Direct image load error:', this.src);
            this.src = FALLBACK_IMAGE;
            this.alt = 'Gagal memuat gambar';
        };
        
        // Update hints if available
        if (data.player_position) {
            const positionHint = document.getElementById('position-hint');
            if (positionHint) positionHint.textContent = `Posisi: ${data.player_position}`;
        }
        if (data.player_nationality) {
            const nationalityHint = document.getElementById('nationality-hint');
            if (nationalityHint) nationalityHint.textContent = `Kebangsaan: ${data.player_nationality}`;
        }
        
        // Update tahun dan kesulitan di overlay
        updateYearAndDifficulty(data.year, data.difficulty);
        
        // Update UI
        updateUI();
        
        // Clear input and feedback
        answerInput.value = '';
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
        correctAnswerElement.textContent = '';
        correctAnswerElement.style.display = 'none';
        
        // Enable input
        answerInput.disabled = false;
        submitBtn.disabled = false;
        
        // Focus on input
        answerInput.focus();
        
    } catch (error) {
        console.error('Error getting question:', error);
        
        // Use fallback on error
        playerImage.src = FALLBACK_IMAGE;
        playerImage.alt = 'Error loading image';
        
        showFeedback('Error memuat pertanyaan. Coba lagi.', 'error');
    }
}

// Helper function to load player image
function loadPlayerImage(imageName, playerName) {
    if (!imageName) {
        playerImage.src = FALLBACK_IMAGE;
        playerImage.alt = playerName;
        return;
    }
    
    const imageUrl = `/static/IMAGE/${imageName}`;
    console.log('Loading image from:', imageUrl);
    
    // Set image source
    playerImage.src = imageUrl;
    playerImage.alt = playerName;
    
    // Test if image loads
    const imgTest = new Image();
    imgTest.onload = function() {
        console.log('Image loaded successfully:', imageUrl);
        playerImage.classList.add('loaded');
    };
    imgTest.onerror = function() {
        console.error('Image failed to load:', imageUrl);
        playerImage.src = FALLBACK_IMAGE;
        playerImage.alt = 'Gambar tidak ditemukan';
    };
    imgTest.src = imageUrl;
}

// Helper function to update game state from API data
function updateGameStateFromData(data) {
    if (data.lives !== undefined) gameState.lives = Math.max(0, data.lives);
    if (data.score !== undefined) gameState.score = data.score;
    if (data.level !== undefined) gameState.level = data.level;
    if (data.correctAnswers !== undefined) gameState.correctAnswers = data.correctAnswers;
    if (data.totalNeeded !== undefined) gameState.totalNeeded = data.totalNeeded;
    if (data.year) gameState.gameYear = data.year;
    if (data.difficulty) gameState.gameDifficulty = data.difficulty;
    if (data.game_over !== undefined) gameState.gameOver = data.game_over;
}

// Update tahun dan kesulitan di UI
function updateYearAndDifficulty(year, difficulty) {
    // Update overlay pada gambar
    const yearDisplay = document.getElementById('year-display');
    const difficultyDisplay = document.getElementById('difficulty-display');
    
    if (yearDisplay) yearDisplay.textContent = `Tahun: ${year || '2020'}`;
    if (difficultyDisplay) {
        const difficultyMap = { 
            'easy': 'Mudah', 
            'medium': 'Sedang', 
            'hard': 'Sulit' 
        };
        difficultyDisplay.textContent = `Kesulitan: ${difficultyMap[difficulty] || 'Sedang'}`;
    }
    
    // Update footer
    const gameYearElement = document.getElementById('game-year');
    const gameDifficultyElement = document.getElementById('game-difficulty');
    
    if (gameYearElement) gameYearElement.textContent = year || '2020';
    if (gameDifficultyElement) {
        const difficultyMap = { 
            'easy': 'Mudah', 
            'medium': 'Sedang', 
            'hard': 'Sulit' 
        };
        gameDifficultyElement.textContent = difficultyMap[difficulty] || 'Sedang';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Submit answer on button click
    submitBtn.addEventListener('click', checkAnswer);
    
    // Submit answer on Enter key
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Auto-uppercase input
    answerInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
    
    // Hint button
    if (hintBtn) {
        hintBtn.addEventListener('click', showHint);
    }
    
    // Restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Continue button
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            levelUpModal.style.display = 'none';
            getNewQuestion();
        });
    }
}

// Check Answer - PERBAIKAN UTAMA DI SINI
async function checkAnswer() {
    // Jika game over, jangan proses
    if (gameState.gameOver || gameState.lives <= 0) {
        showFeedback('Game sudah selesai. Silakan restart.', 'error');
        showGameOver();
        return;
    }
    
    const answer = answerInput.value.trim();
    
    if (!answer) {
        showFeedback('Masukkan kode enkripsi!', 'error');
        answerInput.focus();
        return;
    }
    
    // Validate format (5 characters)
    if (answer.length !== 5) {
        showFeedback('Kode harus 5 karakter!', 'error');
        answerInput.classList.add('shake');
        setTimeout(() => answerInput.classList.remove('shake'), 500);
        return;
    }
    
    console.log(`Submitting answer: ${answer}`);
    
    // Disable input saat memproses
    answerInput.disabled = true;
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answer: answer })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Check answer result:', result);
        
        if (result.error) {
            showFeedback(result.error, 'error');
            // Re-enable input
            answerInput.disabled = false;
            submitBtn.disabled = false;
            return;
        }
        
        if (result.correct) {
            // Correct answer
            showFeedback(`Benar! ${result.player_name || ''} (+10 poin)`, 'success');
            answerInput.classList.add('pulse');
            
            // Update game state
            updateGameStateFromData(result);
            updateUI();
            
            if (result.level_up) {
                setTimeout(() => {
                    showLevelUp();
                }, 1000);
            } else {
                setTimeout(() => {
                    getNewQuestion();
                }, 1500);
            }
        } else {
            // Wrong answer - PERBAIKAN DI SINI
            showFeedback('Salah! -1 nyawa', 'error');
            
            // Tampilkan jawaban yang benar dengan benar
            if (correctAnswerElement) {
                // Gunakan correct_answer dari result, jika tidak ada gunakan player_name
                const correctAnswer = result.correct_answer || result.player_name || 'Tidak diketahui';
                correctAnswerElement.textContent = `Jawaban yang benar: ${correctAnswer}`;
                correctAnswerElement.style.display = 'block';
                correctAnswerElement.classList.add('show');
            }
            
            // PERBAIKAN: Kurangi nyawa secara lokal jika server tidak mengirim
            if (result.lives === undefined) {
                gameState.lives -= 1;
                if (gameState.lives < 0) gameState.lives = 0;
            }
            
            // Update game state dari server
            updateGameStateFromData(result);
            updateUI();
            
            console.log(`Lives after wrong answer: ${gameState.lives}`);
            
            // Cek apakah game over
            if (result.game_over || gameState.lives <= 0) {
                gameState.gameOver = true;
                setTimeout(() => {
                    showGameOver();
                }, 2000);
            } else {
                setTimeout(() => {
                    getNewQuestion();
                }, 3000);
            }
        }
        
    } catch (error) {
        console.error('Error checking answer:', error);
        showFeedback('Error memeriksa jawaban', 'error');
        
        // Re-enable input
        answerInput.disabled = false;
        submitBtn.disabled = false;
    }
}

// Show Feedback Message
function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    
    if (type === 'success') {
        feedbackMessage.classList.add('correct');
    } else if (type === 'error') {
        feedbackMessage.classList.add('incorrect');
    } else if (type === 'info') {
        feedbackMessage.classList.add('info');
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
    }, 3000);
}

// Show Hint
function showHint() {
    const hints = [
        "Perhatikan warna seragam dan ciri fisik pemain",
        "Ingat posisi pemain untuk 2 karakter pertama",
        "Cari inisial dari nama belakang pemain",
        "Digit terakhir dari nomor punggung adalah karakter ke-5"
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    showFeedback(`Petunjuk: ${randomHint}`, 'info');
}

// Update UI
function updateUI() {
    // Pastikan nyawa tidak minus
    gameState.lives = Math.max(0, gameState.lives);
    
    console.log(`Updating UI - Lives: ${gameState.lives}, Score: ${gameState.score}`);
    
    // Update stats
    if (livesElement) {
        livesElement.textContent = gameState.lives;
        // Tambah efek visual jika nyawa berkurang
        if (gameState.lives < 5) {
            livesElement.classList.add('pulse-red');
            setTimeout(() => livesElement.classList.remove('pulse-red'), 1000);
        }
    }
    
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (levelElement) levelElement.textContent = gameState.level;
    if (correctCountElement) correctCountElement.textContent = gameState.correctAnswers;
    
    // Update progress bar
    const progressPercentage = Math.min(100, (gameState.correctAnswers / gameState.totalNeeded) * 100);
    if (progressBar) progressBar.style.width = `${progressPercentage}%`;
    if (progressText) progressText.textContent = `${gameState.correctAnswers}/${gameState.totalNeeded}`;
    
    // Update difficulty display
    updateDifficultyDisplay();
}

// Update Difficulty Display
function updateDifficultyDisplay() {
    const difficultyMap = {
        'easy': 'Mudah',
        'medium': 'Sedang',
        'hard': 'Sulit'
    };
    
    const difficultyElements = document.querySelectorAll('#game-difficulty, #difficulty-display');
    difficultyElements.forEach(el => {
        if (el) {
            el.textContent = difficultyMap[gameState.gameDifficulty] || 'Sedang';
        }
    });
}

// Show Game Over Modal
function showGameOver() {
    const finalLevel = document.getElementById('final-level');
    const finalScore = document.getElementById('final-score');
    
    if (finalLevel) finalLevel.textContent = gameState.level;
    if (finalScore) finalScore.textContent = gameState.score;
    if (gameOverModal) {
        gameOverModal.style.display = 'flex';
        
        // Disable input saat game over
        answerInput.disabled = true;
        submitBtn.disabled = true;
    }
}

// Show Level Up Modal
function showLevelUp() {
    const newLevel = document.getElementById('new-level');
    if (newLevel) newLevel.textContent = gameState.level + 1;
    if (levelUpModal) levelUpModal.style.display = 'flex';
}

// Restart Game
async function restartGame() {
    try {
        const response = await fetch('/api/reset_game', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'reset' || data.reset) {
            // Tutup modal game over
            if (gameOverModal) gameOverModal.style.display = 'none';
            
            // Reset state lokal
            gameState = {
                lives: 5,
                score: 0,
                level: 1,
                correctAnswers: 0,
                totalNeeded: 10,
                gameYear: '2020',
                gameDifficulty: 'easy',
                gameOver: false
            };
            
            // Update UI
            updateUI();
            
            // Enable input
            answerInput.disabled = false;
            submitBtn.disabled = false;
            
            // Clear input dan feedback
            answerInput.value = '';
            feedbackMessage.textContent = '';
            correctAnswerElement.textContent = '';
            correctAnswerElement.style.display = 'none';
            
            // Load new question
            await getNewQuestion();
            
            showFeedback('Game dimulai ulang!', 'success');
        }
    } catch (error) {
        console.error('Error restarting game:', error);
        showFeedback('Gagal restart game', 'error');
        
        // Tetap restart secara lokal meski server error
        if (gameOverModal) gameOverModal.style.display = 'none';
        gameState = {
            lives: 5,
            score: 0,
            level: 1,
            correctAnswers: 0,
            totalNeeded: 10,
            gameYear: '2020',
            gameDifficulty: 'easy',
            gameOver: false
        };
        updateUI();
        answerInput.disabled = false;
        submitBtn.disabled = false;
        answerInput.value = '';
        feedbackMessage.textContent = '';
        correctAnswerElement.textContent = '';
        getNewQuestion();
    }
}

// Format input automatically
answerInput.addEventListener('input', function() {
    let value = this.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5);
    }
    this.value = value;
});

// Tambahkan CSS untuk efek visual
const style = document.createElement('style');
style.textContent = `
    .pulse-red {
        animation: pulseRed 0.5s ease-in-out;
        color: #ff0000 !important;
        font-weight: bold;
    }
    
    @keyframes pulseRed {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .loaded {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    #correct-answer {
        background-color: #f8f9fa;
        border: 2px solid #28a745;
        border-radius: 5px;
        padding: 10px;
        margin-top: 10px;
        font-weight: bold;
        color: #28a745;
        display: none;
    }
    
    #correct-answer.show {
        display: block;
        animation: fadeIn 0.5s ease-out;
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .pulse {
        animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);