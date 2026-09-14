/*
 * AI Usage Disclosure:
 * This assignment was developed with the assistance of AI. (Gemini)
 */

import { STRINGS } from "../lang/messages/en/user.js";

/**
 * Encapsulates an individual memory button element,
 *                                          state,
 *                                          and actions.
 */
class MemoryButton {
    constructor(orderNumber,
        color,
        clickHandler) {

        this.orderNumber = orderNumber;
        this.color = color;
        this.clickHandler = clickHandler;
        this.element = this.createButtonElement();
    }

    /* Creates the button, puts the button numbers on it, 
     * sets the color on the button, and sets it initially to disabled.
     * TextContext gets casted to a String.
     */

    createButtonElement() {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("memory-btn");
        btn.style.backgroundColor = this.color;
        btn.textContent = String(this.orderNumber);
        btn.disabled = true;

        btn.addEventListener("click", () => {
            this.clickHandler(this);
        });

        return btn;
    }

    hideNumber() {
        this.element.textContent = "";
    }

    revealNumber() {
        this.element.textContent = String(this.orderNumber);
    }

    enableInteraction() {
        this.element.disabled = false;
        this.element.classList.add("clickable");
    }

    disableInteraction() {
        this.element.disabled = true;
        this.element.classList.remove("clickable");
    }

    // Sets the button positions to the pixels of window.
    setPosition(xPx, yPx) {
        this.element.style.position = "absolute";
        this.element.style.left = `${xPx}px`;
        this.element.style.top = `${yPx}px`;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * Encapsulates elements, layouts, and user interface.
 */
class UIController {
    /*
     * Get the elements from the index.html file.
     * Imports the Strings from user.js file.
    */
    constructor() {
        this.label = document.getElementById("input-label");
        this.input = document.getElementById("btn-count-input");
        this.goBtn = document.getElementById("go-btn");
        this.messageDisplay = document.getElementById("message-display");
        this.container = document.getElementById("button-container");

        // populates imported from STRINGS.
        this.applyLocalizedStrings();
    }

    // The initial start string labels.
    applyLocalizedStrings() {
        this.label.textContent = STRINGS.LABEL_PROMPT;
        this.goBtn.textContent = STRINGS.BUTTON_GO;
    }

    // Converts the input to an integer, 
    // second arg is to set the base to decimal.
    getButtonCount() {
        return parseInt(this.input.value, 10);
    }

    // Sets the message to display.
    setMessage(message) {
        this.messageDisplay.textContent = message;
    }

    // Clears the message display.
    clearMessage() {
        this.messageDisplay.textContent = "";
    }

    setControlsDisabled(isDisabled) {
        this.goBtn.disabled = isDisabled;
        this.input.disabled = isDisabled;
    }

    // The cached ".container" is used and appends the class name "row-layout"
    // to it.
    enableRowLayout() {
        // Makes the buttons line up in a row.
        this.container.classList.add("row-layout");
    }

    // The cached ".container" is used to remove the row-layout.
    disableRowLayout() {
        // Makes the button to move around.
        this.container.classList.remove("row-layout");
    }

    // Appends the button element to the DOM.
    appendButton(buttonInstance) {
        this.container.appendChild(buttonInstance.element);
    }

    clearContainer() {
        this.container.innerHTML = "";
    }
}

/**
 * Game lifecycle, timer scheduling, validation, and boundary enforcement.
 */
class MemoryGame {
    constructor() {
        this.ui = new UIController();
        this.buttons = [];
        this.totalButtons = 0;
        this.expectedOrder = 1;
        this.pauseTimer = null;
        this.scrambleTimer = null;

        this.init();
    }

    init() {
        this.ui.goBtn.addEventListener("click", () =>
            this.handleStart());
    }

    // Validate method that checks if the input is 1. an integers, and 2. it's 
    // equal to or greater than 3 AND less than or equal to 7.
    validateInput(count) {
        return Number.isInteger(count) &&
            count >= 3 && count <= 7;
    }

    /**
     * Generates random number from 40 to 240. (floor for whole number)
     * Generates a random RGB for each three colors, and returns them.
     */
    generateRandomColor() {
        const red = Math.floor(Math.random() * 200 + 40);
        const green = Math.floor(Math.random() * 200 + 40);
        const blue = Math.floor(Math.random() * 200 + 40);
        return `rgb(${red}, ${green}, ${blue})`;
    }

    // Cleans the states before you start another game.
    clearPreviousGame() {
        if (this.pauseTimer) {
            clearTimeout(this.pauseTimer);
            this.pauseTimer = null;
        }
        if (this.scrambleTimer) {
            clearTimeout(this.scrambleTimer);
            this.scrambleTimer = null;
        }

        // Iterates through the button and uses .destroy() method
        // to remove from the DOM.
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].destroy();
        }
        this.buttons = [];
        this.expectedOrder = 1;

        this.ui.clearMessage();
        this.ui.clearContainer();
        this.ui.enableRowLayout();
    }

    /**
     * The start button for the game.
     * 
     * 
     */
    handleStart() {
        const count = this.ui.getButtonCount();

        // Gets the count, if the count is not valid through the 
        // method, then return the String message from user.js.
        if (!this.validateInput(count)) {
            alert(STRINGS.ERROR_INVALID_RANGE);
            return;
        }

        // If count is valid, then clears the states from previous game.
        // Sets the total button for the for loop after.
        // Disables the controls after you press the start button.
        this.clearPreviousGame();
        this.totalButtons = count;
        this.ui.setControlsDisabled(true);

        // If less then or equal to total buttons, then creates a new
        // memory button with the order number, random color, and click handler that 
        // calls the method.
        for (let i = 1; i <= this.totalButtons; i++) {
            const btn = new MemoryButton(i, this.generateRandomColor(), (b) => {
                this.handleButtonClick(b);
            });

            this.buttons.push(btn);
            this.ui.appendButton(btn);
        }

        // Pausing for n seconds while button is aligned in a row.
        this.pauseTimer = setTimeout(() => {
            this.ui.disableRowLayout();
            this.runScramble(1);
        }, this.totalButtons * 1000);
    }

    /**
     * Executes scrambling with 2-second intervals.
     */
    runScramble(currentStep) {
        this.scramblePositions();

        // Takes n seconds to scramble the buttons again. Does it until
        // the loop of totalButtons is met.
        if (currentStep < this.totalButtons) {
            this.scrambleTimer = setTimeout(() => {
                this.runScramble(currentStep + 1);
            }, 2000);
        } else {
            // Hides numbers, and enables clicks. 
            // Takes n seconds to hide numbers.
            this.scrambleTimer = setTimeout(() => {
                this.prepareMemoryPhase();
            }, 2000);
        }
    }

    /**
     * Measures current window boundaries before moving buttons.
     */
    scramblePositions() {
        // Making this so the buttons won't go out of bounds.
        const currentWindowWidth = window.innerWidth;
        const currentWindowHeight = window.innerHeight;

        // This gets the relative sizes of the container.
        const containerRect = this.ui.container.getBoundingClientRect();

        // Gets the left and top from the getBoundingClientRect built-in method.
        const containerLeftOffset = containerRect.left;
        const containerTopOffset = containerRect.top;

        /**
         * For each button, it gets the width and height depending on the 
         * current (i) button.
         */
        for (let i = 0; i < this.buttons.length; i++) {
            const btnElement = this.buttons[i].element;
            const btnWidth = btnElement.offsetWidth;
            const btnHeight = btnElement.offsetHeight;

            // Gets the max coords for buttons to be placed. (Within the window boundaries)
            const maxCoordX = currentWindowWidth - btnWidth - containerLeftOffset;
            const maxCoordY = currentWindowHeight - btnHeight - containerTopOffset;

            // Ensures the coords are not negative. (Else it would be placed outside the window)
            const safeMaxX = Math.max(0, maxCoordX);
            const safeMaxY = Math.max(0, maxCoordY);

            // Random places to place the buttons.
            const randomX = Math.floor(Math.random() * safeMaxX);
            const randomY = Math.floor(Math.random() * safeMaxY);

            // Sets the current button to that random position.
            this.buttons[i].setPosition(randomX, randomY);
        }
    }

    // Allows user to click on buttons and shows them when clicking 
    // from the enableInteraction method.
    prepareMemoryPhase() {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].hideNumber();
            this.buttons[i].enableInteraction();
        }
    }

    // When the button number clicked is equal to the orderNumber, then
    // the revealNumber method is called, and button is disabled. 
    // +1 for the next number that should be next.

    handleButtonClick(clickedButton) {
        if (clickedButton.orderNumber === this.expectedOrder) {
            clickedButton.revealNumber();
            clickedButton.disableInteraction();
            this.expectedOrder += 1;

            // Once the numbers of totalButtons is reached, then the game
            // knows your finished and ends.
            if (this.expectedOrder > this.totalButtons) {
                this.ui.setMessage(STRINGS.MESSAGE_EXCELLENT);
                this.finishGame();
            }
            // If the order is wrong, then it will set the message to let you know 
            // in text, reveal all numbers and finish game.
        } else {
            this.ui.setMessage(STRINGS.MESSAGE_WRONG);
            this.revealAll();
            this.finishGame();
        }
    }

    // Iterates through the buttons to reveal numbers and call disable method.
    revealAll() {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].revealNumber();
            this.buttons[i].disableInteraction();
        }
    }

    // For each button (i), it uses the disableInteraction method to 
    // prevent user from clicking after winning or loosing. 
    finishGame() {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].disableInteraction();
        }
        // After loop, allows user to click on the start button.
        this.ui.setControlsDisabled(false);
    }
}

// Entry point
new MemoryGame();

