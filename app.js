// État de la calculatrice
let currentOperand = '0';
let previousOperand = '';
let operator = null;
let shouldResetScreen = false;

// Éléments DOM
const currentOperandEl = document.getElementById('currentOperand');
const previousOperandEl = document.getElementById('previousOperand');
const numberBtns = document.querySelectorAll('[data-number]');
const operatorBtns = document.querySelectorAll('[data-operator]');
const equalsBtn = document.querySelector('[data-action="equals"]');
const clearBtn = document.querySelector('[data-action="clear"]');
const deleteBtn = document.querySelector('[data-action="delete"]');
const percentBtn = document.querySelector('[data-action="percent"]');

// Initialisation
init();

function init() {
    // Événements boutons
    numberBtns.forEach(btn => {
        btn.addEventListener('click', () => appendNumber(btn.dataset.number));
    });

    operatorBtns.forEach(btn => {
        btn.addEventListener('click', () => setOperator(btn.dataset.operator));
    });

    equalsBtn.addEventListener('click', compute);
    clearBtn.addEventListener('click', clear);
    deleteBtn.addEventListener('click', deleteNumber);
    percentBtn.addEventListener('click', applyPercent);

    // Support clavier
    document.addEventListener('keydown', handleKeyboard);
}

// Ajouter un nombre
function appendNumber(number) {
    if (shouldResetScreen) {
        currentOperand = '';
        shouldResetScreen = false;
    }

    // Gérer le point décimal
    if (number === '.' && currentOperand.includes('.')) return;
    
    // Remplacer le 0 initial
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand += number;
    }

    updateDisplay();
}

// Définir l'opérateur
function setOperator(op) {
    if (operator !== null && !shouldResetScreen) {
        compute();
    }

    operator = op;
    previousOperand = currentOperand;
    shouldResetScreen = true;

    // Mettre à jour l'affichage
    updateDisplay();

    // Indiquer visuellement l'opérateur actif
    operatorBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(operatorBtns).find(btn => btn.dataset.operator === op);
    if (activeBtn) activeBtn.classList.add('active');
}

// Calculer le résultat
function compute() {
    if (operator === null || shouldResetScreen) return;

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    let result;
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '−':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            if (current === 0) {
                showError();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    // Arrondir le résultat pour éviter les problèmes de précision
    currentOperand = Math.round(result * 100000000) / 100000000;
    currentOperand = currentOperand.toString();
    
    operator = null;
    previousOperand = '';
    shouldResetScreen = true;

    updateDisplay();
    operatorBtns.forEach(btn => btn.classList.remove('active'));
}

// Appliquer pourcentage
function applyPercent() {
    const current = parseFloat(currentOperand);
    if (isNaN(current)) return;

    currentOperand = (current / 100).toString();
    updateDisplay();
}

// Effacer tout
function clear() {
    currentOperand = '0';
    previousOperand = '';
    operator = null;
    shouldResetScreen = false;
    updateDisplay();
    operatorBtns.forEach(btn => btn.classList.remove('active'));
}

// Supprimer dernier caractère
function deleteNumber() {
    if (shouldResetScreen) return;
    
    currentOperand = currentOperand.slice(0, -1);
    if (currentOperand === '') {
        currentOperand = '0';
    }
    updateDisplay();
}

// Mettre à jour l'affichage
function updateDisplay() {
    currentOperandEl.textContent = formatNumber(currentOperand);
    
    if (operator && previousOperand) {
        previousOperandEl.textContent = `${formatNumber(previousOperand)} ${operator}`;
    } else {
        previousOperandEl.textContent = '';
    }
}

// Formater le nombre
function formatNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
        integerDisplay = '';
    } else {
        integerDisplay = integerDigits.toLocaleString('fr-FR', {
            maximumFractionDigits: 0
        });
    }

    if (decimalDigits != null) {
        return `${integerDisplay}.${decimalDigits}`;
    } else {
        return integerDisplay;
    }
}

// Afficher une erreur
function showError() {
    currentOperandEl.classList.add('error');
    currentOperand = 'Erreur';
    updateDisplay();
    
    setTimeout(() => {
        currentOperandEl.classList.remove('error');
        clear();
    }, 1500);
}

// Gestion du clavier
function handleKeyboard(e) {
    // Nombres et point
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        appendNumber(e.key);
    }
    
    // Opérateurs
    if (e.key === '+') setOperator('+');
    if (e.key === '-') setOperator('−');
    if (e.key === '*') setOperator('×');
    if (e.key === '/') {
        e.preventDefault(); // Empêcher la recherche dans Firefox
        setOperator('÷');
    }
    
    // Égal
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        compute();
    }
    
    // Effacer
    if (e.key === 'Escape') clear();
    if (e.key === 'Backspace') deleteNumber();
    
    // Pourcentage
    if (e.key === '%') applyPercent();
}