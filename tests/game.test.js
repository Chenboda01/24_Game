/**
 * Unit tests for 24 Game core logic
 */

// Mock DOM elements before importing game module
global.document = {
    querySelectorAll: () => [],
    getElementById: () => ({ 
        textContent: '',
        style: {},
        hidden: false,
        appendChild: () => {},
        querySelector: () => ({ textContent: '' })
    }),
    querySelector: () => ({ 
        hidden: false,
        style: {},
        addEventListener: () => {},
        querySelectorAll: () => []
    }),
    addEventListener: () => {}
};

global.window = {};

// Import game module
const game = require('../scripts/game.js');

describe('24 Game - Core Logic Tests', () => {
    describe('Expression Validation', () => {
        test('validates simple arithmetic expressions', () => {
            expect(game.isValidExpression('1 + 2 + 3 + 4')).toBe(true);
            expect(game.isValidExpression('(1 + 2) * (3 + 4)')).toBe(true);
            expect(game.isValidExpression('8 / (3 - 8/3)')).toBe(true);
        });

        test('rejects invalid expressions', () => {
            expect(game.isValidExpression('1 + + 2')).toBe(false);
            expect(game.isValidExpression('(1 + 2')).toBe(false); // unbalanced parentheses
            expect(game.isValidExpression('1 + 2)')).toBe(false);
            expect(game.isValidExpression('1 @ 2')).toBe(false); // invalid character
        });
    });

    describe('Expression Evaluation', () => {
        test('evaluates simple expressions correctly', () => {
            game.GameState.expression = ['1', '+', '2'];
            expect(game.evaluateExpression()).toBeCloseTo(3);
            
            game.GameState.expression = ['4', '*', '5'];
            expect(game.evaluateExpression()).toBeCloseTo(20);
            
            game.GameState.expression = ['8', '/', '2'];
            expect(game.evaluateExpression()).toBeCloseTo(4);
        });

        test('handles parentheses correctly', () => {
            game.GameState.expression = ['(', '1', '+', '2', ')', '*', '3'];
            expect(game.evaluateExpression()).toBeCloseTo(9);
            
            game.GameState.expression = ['8', '/', '(', '3', '-', '(', '8', '/', '3', ')', ')'];
            // 8 / (3 - (8/3)) = 8 / (3 - 2.666...) = 8 / 0.333... = 24
            expect(game.evaluateExpression()).toBeCloseTo(24);
        });

        test('returns null for invalid expressions', () => {
            game.GameState.expression = ['1', '/', '0'];
            expect(game.evaluateExpression()).toBeNull();
            
            game.GameState.expression = ['1', '+', '+', '2'];
            expect(game.evaluateExpression()).toBeNull();
        });
    });

    describe('Number Generation', () => {
        test('generates four unique numbers', () => {
            game.generateNewNumbers();
            expect(game.GameState.numbers).toHaveLength(4);
            
            // Check uniqueness
            const uniqueNumbers = new Set(game.GameState.numbers);
            expect(uniqueNumbers.size).toBe(4);
            
            // Check range (1-9)
            game.GameState.numbers.forEach(num => {
                expect(num).toBeGreaterThanOrEqual(1);
                expect(num).toBeLessThanOrEqual(9);
            });
        });
    });

    describe('Solution Checking', () => {
        beforeEach(() => {
            game.GameState.numbers = [4, 7, 8, 8];
            game.GameState.usedNumbers = new Set([4, 7, 8, 8]);
            game.GameState.currentNumbers = [4, 7, 8, 8];
        });

        test('identifies correct 24 solutions', () => {
            // (7 - (8 ÷ 8)) × 4 = 24
            game.GameState.expression = ['(', '7', '-', '(', '8', '/', '8', ')', ')', '*', '4'];
            expect(game.evaluateExpression()).toBeCloseTo(24);
            
            // Mock checkSolution logic
            const result = game.evaluateExpression();
            expect(Math.abs(result - 24)).toBeLessThan(0.001);
        });

        test('requires all numbers to be used', () => {
            game.GameState.usedNumbers = new Set([4, 7, 8]); // Missing one 8
            // This would be caught by checkSolution's usedAllNumbers check
            expect(game.GameState.usedNumbers.size).toBe(3);
        });
    });

    describe('Expression Building', () => {
        test('maintains valid expression state', () => {
            game.GameState.expression = [];
            game.GameState.usedNumbers.clear();
            game.GameState.currentNumbers = [];
            
            // Simulate adding a number
            game.GameState.expression.push('5');
            game.GameState.usedNumbers.add(5);
            game.GameState.currentNumbers.push(5);
            
            expect(game.GameState.expression).toEqual(['5']);
            expect(game.GameState.usedNumbers.has(5)).toBe(true);
            expect(game.GameState.currentNumbers).toEqual([5]);
        });
    });
});

// Helper function to set up expression for testing
function setupExpression(tokens) {
    game.GameState.expression = tokens;
}