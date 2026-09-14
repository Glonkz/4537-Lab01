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
    constructor() {
        this.label = document.getElementById("input-label");
        this.input = document.getElementById("btn-count-input");
        this.goBtn = document.getElementById("go-btn");
        this.messageDisplay = document.getElementById("message-display");
        this.container = document.getElementById("button-container");

        this.applyLocalizedStrings();
    }

    applyLocalizedStrings() {
        this.label.textContent = STRINGS.LABEL_PROMPT;
        this.goBtn.textContent = STRINGS.BUTTON_GO;
    }

    getButtonCount() {
        return parseInt(this.input.value, 10);
    }

    setMessage(message) {
        this.messageDisplay.textContent = message;
    }

    clearMessage() {
        this.messageDisplay.textContent = "";
    }

    setControlsDisabled(isDisabled) {
        this.goBtn.disabled = isDisabled;
        this.input.disabled = isDisabled;
    }

    enableRowLayout() {
        this.container.classList.add("row-layout");
    }

    disableRowLayout() {
        this.container.classList.remove("row-layout");
    }

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

    validateInput(count) {
        return Number.isInteger(count) &&
            count >= 3 && count <= 7;
    }

    generateRandomColor() {
        const red = Math.floor(Math.random() * 200 + 40);
        const green = Math.floor(Math.random() * 200 + 40);
        const blue = Math.floor(Math.random() * 200 + 40);
        return `rgb(${red}, ${green}, ${blue})`;
    }

    clearPreviousGame() {
        if (this.pauseTimer) {
            clearTimeout(this.pauseTimer);
            this.pauseTimer = null;
        }
        if (this.scrambleTimer) {
            clearTimeout(this.scrambleTimer);
            this.scrambleTimer = null;
        }

        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].destroy();
        }
        this.buttons = [];
        this.expectedOrder = 1;

        this.ui.clearMessage();
        this.ui.clearContainer();
        this.ui.enableRowLayout();
    }

    handleStart() {
        const count = this.ui.getButtonCount();

        if (!this.validateInput(count)) {
            alert(STRINGS.ERROR_INVALID_RANGE);
            return;
        }

        this.clearPreviousGame();
        this.totalButtons = count;
        this.ui.setControlsDisabled(true);

        for (let i = 1; i <= this.totalButtons; i++) {
            const btn = new MemoryButton(i, this.generateRandomColor(), (b) =>
            {
                this.handleButtonClick(b);
            });

            this.buttons.push(btn);
            this.ui.appendButton(btn);
        }

        // Pausing for n seconds while button is aligned in row.
        this.pauseTimer = setTimeout(() =>
        {
            this.ui.disableRowLayout();
            this.runScramble(1);
        }, this.totalButtons * 1000);
    }

    /**
     * Executes scrambling with 2-second intervals.
     */
    runScramble(currentStep) {
        this.scramblePositions();

        if (currentStep < this.totalButtons)
        {
            this.scrambleTimer = setTimeout(() => {
                this.runScramble(currentStep + 1);
            }, 2000);
        } else
        {
            // Hides numbers, and enables clicks.
            this.scrambleTimer = setTimeout(() => {
                this.prepareMemoryPhase();
            }, 2000);
        }
    }

    /**
     * Measures current window boundaries before moving buttons.
     */
    scramblePositions() {
        const currentWindowWidth = window.innerWidth;
        const currentWindowHeight = window.innerHeight;

        const containerRect = this.ui.container.getBoundingClientRect();
        const containerLeftOffset = containerRect.left;
        const containerTopOffset = containerRect.top;

        for (let i = 0; i < this.buttons.length; i++) {
            const btnElement = this.buttons[i].element;
            const btnWidth = btnElement.offsetWidth;
            const btnHeight = btnElement.offsetHeight;

            const maxCoordX = currentWindowWidth - btnWidth - containerLeftOffset;
            const maxCoordY = currentWindowHeight - btnHeight - containerTopOffset;

            const safeMaxX = Math.max(0, maxCoordX);
            const safeMaxY = Math.max(0, maxCoordY);

            const randomX = Math.floor(Math.random() * safeMaxX);
            const randomY = Math.floor(Math.random() * safeMaxY);

            this.buttons[i].setPosition(randomX, randomY);
        }
    }

    prepareMemoryPhase()
    {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].hideNumber();
            this.buttons[i].enableInteraction();
        }
    }

    handleButtonClick(clickedButton)
    {
        if (clickedButton.orderNumber === this.expectedOrder) {
            clickedButton.revealNumber();
            clickedButton.disableInteraction();
            this.expectedOrder += 1;

            if (this.expectedOrder > this.totalButtons) {
                this.ui.setMessage(STRINGS.MESSAGE_EXCELLENT);
                this.finishGame();
            }
        } else {
            this.ui.setMessage(STRINGS.MESSAGE_WRONG);
            this.revealAll();
            this.finishGame();
        }
    }

    revealAll()
    {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].revealNumber();
            this.buttons[i].disableInteraction();
        }
    }

    finishGame()
    {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].disableInteraction();
        }
        this.ui.setControlsDisabled(false);
    }
}

// Entry point
new MemoryGame();

