/**
 * 24 Game - Core Game Logic
 * Implements the mathematical puzzle solver with DOM interaction
 */

// Game state management
const GameState = {
    numbers: [],
    usedNumbers: new Set(),
    expression: [],
    isSolved: false,
    startTime: null,
    timerInterval: null,
    gamesPlayed: 0,
    gamesSolved: 0,
    currentNumbers: []
};

// DOM Elements
const DOM = {
    numberCards: document.querySelectorAll('.number-card'),
    operationButtons: document.querySelectorAll('.operation-btn'),
    expressionDisplay: document.getElementById('expression-display'),
    resultValue: document.getElementById('result-value'),
    checkButton: document.getElementById('check-btn'),
    newGameButton: document.getElementById('new-game-btn'),
    clearButton: document.getElementById('clear-btn'),
    backspaceButton: document.getElementById('backspace-btn'),
    feedbackMessage: document.getElementById('feedback-message'),
    feedbackSection: document.querySelector('.feedback'),
    gamesPlayedElement: document.getElementById('games-played'),
    gamesSolvedElement: document.getElementById('games-solved'),
    timerElement: document.getElementById('timer')
};

/**
 * Initialize the game
 */
function initGame() {
    generateNewNumbers();
    setupEventListeners();
    updateStatistics();
    startTimer();
}

/**
 * Generate four random numbers between 1 and 9
 */
function generateNewNumbers() {
    GameState.numbers = [];
    GameState.usedNumbers.clear();
    GameState.expression = [];
    GameState.isSolved = false;
    GameState.currentNumbers = [];
    
    while (GameState.numbers.length < 4) {
        const num = Math.floor(Math.random() * 9) + 1;
        if (!GameState.numbers.includes(num)) {
            GameState.numbers.push(num);
        }
    }
    
    DOM.numberCards.forEach((card, index) => {
        const valueElement = card.querySelector('.number-card__value');
        valueElement.textContent = GameState.numbers[index];
        card.dataset.number = GameState.numbers[index];
        card.classList.remove('number-card--used', 'number-card--selected');
        card.style.opacity = '1';
        card.style.cursor = 'pointer';
    });
    
    updateExpressionDisplay();
    updateResultValue();
    hideFeedback();
    
    if (GameState.gamesPlayed > 0) {
        GameState.gamesPlayed++;
        updateStatistics();
    } else {
        GameState.gamesPlayed = 1;
    }
    
    resetTimer();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Number card clicks
    DOM.numberCards.forEach(card => {
        card.addEventListener('click', () => handleNumberClick(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNumberClick(card);
            }
        });
    });
    
    // Operation button clicks
    DOM.operationButtons.forEach(button => {
        button.addEventListener('click', () => handleOperationClick(button));
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOperationClick(button);
            }
        });
    });
    
    // Control buttons
    DOM.checkButton.addEventListener('click', checkSolution);
    DOM.newGameButton.addEventListener('click', generateNewNumbers);
    DOM.clearButton.addEventListener('click', clearExpression);
    DOM.backspaceButton.addEventListener('click', backspace);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle number card click
 */
function handleNumberClick(card) {
    if (GameState.isSolved) return;
    
    const number = parseInt(card.dataset.number);
    const cardIndex = Array.from(DOM.numberCards).indexOf(card);
    
    // Check if number is already used
    if (GameState.usedNumbers.has(number)) {
        showFeedback('This number has already been used! Each number can only be used once.', 'warning');
        return;
    }
    
    // Add to expression
    GameState.expression.push(number.toString());
    GameState.usedNumbers.add(number);
    GameState.currentNumbers.push(number);
    
    // Visual feedback
    card.classList.add('number-card--used');
    card.classList.add('number-card--selected');
    setTimeout(() => card.classList.remove('number-card--selected'), 300);
    
    updateExpressionDisplay();
    updateResultValue();
    hideFeedback();
}

/**
 * Handle operation button click
 */
function handleOperationClick(button) {
    if (GameState.isSolved) return;
    
    const operation = button.dataset.operation;
    
    // Validate expression rules
    if (GameState.expression.length === 0 && !['(', '-'].includes(operation)) {
        showFeedback('Expression must start with a number or opening parenthesis.', 'warning');
        return;
    }
    
    // Check for consecutive operators
    const lastToken = GameState.expression[GameState.expression.length - 1];
    if (lastToken && '+-*/'.includes(lastToken) && '+-*/'.includes(operation)) {
        showFeedback('Cannot have consecutive operators.', 'warning');
        return;
    }
    
    // Parenthesis validation
    if (operation === '(') {
        // Opening parenthesis can follow operator, number, or be at start
        if (lastToken && !'+-*/('.includes(lastToken)) {
            showFeedback('Opening parenthesis must follow an operator or another parenthesis.', 'warning');
            return;
        }
    }
    
    if (operation === ')') {
        // Count parentheses
        const openCount = GameState.expression.filter(token => token === '(').length;
        const closeCount = GameState.expression.filter(token => token === ')').length;
        if (closeCount >= openCount) {
            showFeedback('No matching opening parenthesis.', 'warning');
            return;
        }
        // Closing parenthesis must follow number or closing parenthesis
        if (!lastToken || ('+-*/('.includes(lastToken) && lastToken !== ')')) {
            showFeedback('Closing parenthesis must follow a number or another closing parenthesis.', 'warning');
            return;
        }
    }
    
    GameState.expression.push(operation);
    updateExpressionDisplay();
    updateResultValue();
    hideFeedback();
}

/**
 * Update the expression display
 */
function updateExpressionDisplay() {
    DOM.expressionDisplay.innerHTML = '';
    
    if (GameState.expression.length === 0) {
        DOM.expressionDisplay.textContent = 'Click numbers and operations to build expression';
        return;
    }
    
    GameState.expression.forEach(token => {
        const tokenElement = document.createElement('span');
        tokenElement.className = 'expression-token';
        tokenElement.textContent = token;
        
        if (/^\d+$/.test(token)) {
            tokenElement.classList.add('expression-token--number');
        } else if ('+-*/'.includes(token)) {
            tokenElement.classList.add('expression-token--operator');
        } else if (token === '(' || token === ')') {
            tokenElement.classList.add('expression-token--parenthesis');
        }
        
        DOM.expressionDisplay.appendChild(tokenElement);
    });
}

/**
 * Safely evaluate the current expression
 */
function evaluateExpression() {
    if (GameState.expression.length === 0) return null;
    
    try {
        // Convert expression array to string
        let expressionStr = GameState.expression.join(' ');
        
        // Replace multiplication and division symbols
        expressionStr = expressionStr.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Validate expression syntax
        if (!isValidExpression(expressionStr)) {
            return null;
        }
        
        // Use Function constructor for safer evaluation than eval
        // Note: Still has security implications with user input, but we control the input
        const result = new Function('return ' + expressionStr)();
        
        // Check for division by zero
        if (!isFinite(result)) {
            return null;
        }
        
        return result;
    } catch (error) {
        console.error('Expression evaluation error:', error);
        return null;
    }
}

/**
 * Validate expression syntax
 */
function isValidExpression(expr) {
    // Basic validation: balanced parentheses, valid characters
    const parenStack = [];
    const validChars = /^[0-9+\-*/().\s]+$/;
    
    if (!validChars.test(expr)) return false;
    
    for (let char of expr) {
        if (char === '(') parenStack.push('(');
        if (char === ')') {
            if (parenStack.length === 0) return false;
            parenStack.pop();
        }
    }
    
    return parenStack.length === 0;
}

/**
 * Update the result value display
 */
function updateResultValue() {
    const result = evaluateExpression();
    
    if (result === null) {
        DOM.resultValue.textContent = '-';
        DOM.resultValue.style.color = '';
    } else {
        DOM.resultValue.textContent = result.toFixed(2).replace(/\.00$/, '');
        
        // Color code based on proximity to 24
        const diff = Math.abs(result - 24);
        if (diff < 0.001) {
            DOM.resultValue.style.color = 'var(--color-success)';
        } else if (diff <= 5) {
            DOM.resultValue.style.color = 'var(--color-warning)';
        } else {
            DOM.resultValue.style.color = 'var(--color-danger)';
        }
    }
}

/**
 * Check if the current expression equals 24
 */
function checkSolution() {
    if (GameState.isSolved) return;
    
    const result = evaluateExpression();
    
    if (result === null) {
        showFeedback('Invalid expression. Please check your calculation.', 'warning');
        return;
    }
    
    // Check if all numbers are used
    const usedAllNumbers = GameState.usedNumbers.size === 4;
    if (!usedAllNumbers) {
        showFeedback('You must use all four numbers exactly once.', 'warning');
        return;
    }
    
    // Check if expression equals 24 (with floating point tolerance)
    const isCorrect = Math.abs(result - 24) < 0.001;
    
    if (isCorrect) {
        GameState.isSolved = true;
        GameState.gamesSolved++;
        showFeedback('🎉 Congratulations! You solved it! The expression equals 24.', 'success');
        updateStatistics();
        stopTimer();
    } else {
        showFeedback(`The expression equals ${result.toFixed(2)}. Keep trying!`, 'info');
    }
}

/**
 * Clear the entire expression
 */
function clearExpression() {
    GameState.expression = [];
    GameState.usedNumbers.clear();
    GameState.currentNumbers = [];
    
    DOM.numberCards.forEach(card => {
        card.classList.remove('number-card--used');
        card.style.opacity = '1';
        card.style.cursor = 'pointer';
    });
    
    updateExpressionDisplay();
    updateResultValue();
    hideFeedback();
}

/**
 * Remove the last token from the expression
 */
function backspace() {
    if (GameState.expression.length === 0) return;
    
    const lastToken = GameState.expression.pop();
    
    // If it was a number, remove it from usedNumbers
    if (/^\d+$/.test(lastToken)) {
        const number = parseInt(lastToken);
        GameState.usedNumbers.delete(number);
        
        // Find and update the corresponding number card
        DOM.numberCards.forEach(card => {
            if (parseInt(card.dataset.number) === number && card.classList.contains('number-card--used')) {
                card.classList.remove('number-card--used');
                card.style.opacity = '1';
                card.style.cursor = 'pointer';
            }
        });
        
        // Remove from current numbers
        const index = GameState.currentNumbers.indexOf(number);
        if (index > -1) {
            GameState.currentNumbers.splice(index, 1);
        }
    }
    
    // If it was a closing parenthesis, we might need to handle opening parenthesis?
    // For simplicity, we'll just remove it
    
    updateExpressionDisplay();
    updateResultValue();
    hideFeedback();
}

/**
 * Show feedback message
 */
function showFeedback(message, type = 'info') {
    DOM.feedbackMessage.textContent = message;
    DOM.feedbackSection.hidden = false;
    
    // Set border color based on type
    const colors = {
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-primary)',
        error: 'var(--color-danger)'
    };
    
    DOM.feedbackSection.style.borderLeftColor = colors[type] || colors.info;
}

/**
 * Hide feedback message
 */
function hideFeedback() {
    DOM.feedbackSection.hidden = true;
}

/**
 * Update statistics display
 */
function updateStatistics() {
    DOM.gamesPlayedElement.textContent = GameState.gamesPlayed;
    DOM.gamesSolvedElement.textContent = GameState.gamesSolved;
}

/**
 * Timer functions
 */
function startTimer() {
    GameState.startTime = Date.now();
    GameState.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!GameState.startTime) return;
    
    const elapsed = Math.floor((Date.now() - GameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    
    DOM.timerElement.textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
        GameState.timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    startTimer();
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Don't trigger if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            // Simulate clicking the corresponding number card if available
            const number = parseInt(event.key);
            const card = Array.from(DOM.numberCards).find(c => 
                parseInt(c.dataset.number) === number && !c.classList.contains('number-card--used')
            );
            if (card) handleNumberClick(card);
            break;
            
        case '+':
        case '-':
        case '*':
        case '/':
        case '(':
        case ')':
            const opButton = Array.from(DOM.operationButtons).find(b => 
                b.dataset.operation === event.key
            );
            if (opButton) handleOperationClick(opButton);
            break;
            
        case 'Enter':
            event.preventDefault();
            checkSolution();
            break;
            
        case 'Escape':
            clearExpression();
            break;
            
        case 'Backspace':
            event.preventDefault();
            backspace();
            break;
            
        case 'n':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                generateNewNumbers();
            }
            break;
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        evaluateExpression,
        isValidExpression,
        generateNewNumbers,
        checkSolution
    };
}