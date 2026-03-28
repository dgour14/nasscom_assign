class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.resetDisplay = false;
  }

  delete() {
    if (this.currentOperand === '0' || this.resetDisplay) return;
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    if (this.currentOperand === '') this.currentOperand = '0';
  }

  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.resetDisplay) {
      this.currentOperand = number.toString();
      this.resetDisplay = false;
    } else {
      if (this.currentOperand === '0' && number !== '.') {
        this.currentOperand = number.toString();
      } else {
        this.currentOperand = this.currentOperand.toString() + number.toString();
      }
    }
  }

  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    // Handle display of division/multiplication with readable symbols
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.resetDisplay = true;
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        // Internally using standard dash, even if mapped to minus sign visually
        computation = prev - current;
        break;
      case '*':
        computation = prev * current;
        break;
      case '/':
        if (current === 0) {
          computation = "Error"; // Divide by zero
          break;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Limit precision nicely to avoid long trailing decimals from float operations
    if (computation !== "Error") {
      computation = parseFloat(computation.toFixed(10)).toString();
    }
    
    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = '';
    this.resetDisplay = true;
  }

  getDisplayNumber(number) {
    if (number === "Error") return number;
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }
    
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    // Dynamic text resizing based on length
    if (this.currentOperand.length > 11) {
      this.currentOperandTextElement.classList.add('small-text');
    } else {
      this.currentOperandTextElement.classList.remove('small-text');
    }
    
    this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
    
    if (this.operation != null) {
      // Map operation symbols for display
      let displayOp = this.operation;
      if (this.operation === '*') displayOp = '×';
      if (this.operation === '/') displayOp = '÷';
      if (this.operation === '-') displayOp = '−';

      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${displayOp}`;
    } else {
      this.previousOperandTextElement.innerText = '';
    }
  }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Event Listeners for UI buttons
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Read the standard operator from dataset instead of potentially mapped UI text
    calculator.chooseOperation(button.dataset.operation);
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener('click', button => {
  calculator.compute();
  calculator.updateDisplay();
});

allClearButton.addEventListener('click', button => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
  calculator.delete();
  calculator.updateDisplay();
});

// Event Listeners for Keyboard
document.addEventListener('keydown', e => {
  // Prevent default action for specific keys to avoid scrolling/issues
  if (['Enter', 'Escape', 'Backspace'].includes(e.key)) {
    e.preventDefault();
  }

  if (/[0-9\.]/.test(e.key)) {
    calculator.appendNumber(e.key);
    calculator.updateDisplay();
    // Simulate active state for numbers
    const btn = Array.from(numberButtons).find(b => b.innerText === e.key);
    if (btn) simulateButtonActive(btn);
  }

  if (['+', '-', '*', '/'].includes(e.key)) {
    calculator.chooseOperation(e.key);
    calculator.updateDisplay();
    // Simulate active state
    const btn = Array.from(operationButtons).find(b => b.dataset.operation === e.key);
    if (btn) simulateButtonActive(btn);
  }

  if (e.key === 'Enter' || e.key === '=') {
    calculator.compute();
    calculator.updateDisplay();
    simulateButtonActive(equalsButton);
  }

  if (e.key === 'Backspace') {
    calculator.delete();
    calculator.updateDisplay();
    simulateButtonActive(deleteButton);
  }

  if (e.key === 'Escape') {
    calculator.clear();
    calculator.updateDisplay();
    simulateButtonActive(allClearButton);
  }
});

// Helper for keyboard active styles
function simulateButtonActive(buttonElement) {
  buttonElement.style.background = 'var(--btn-active)';
  buttonElement.style.transform = 'translateY(1px)';
  setTimeout(() => {
    buttonElement.style.background = '';
    buttonElement.style.transform = '';
  }, 100);
}
