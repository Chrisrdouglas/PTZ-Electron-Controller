module.exports = class Driver {

    constructor(sticks) {
        this.buttons = [document.getElementById('aButton'),
        document.getElementById('bButton'),
        document.getElementById('xButton'),
        document.getElementById('yButton'),
        document.getElementById('leftBumper'),
        document.getElementById('rightBumper'),
        document.getElementById('leftTrigger'),
        document.getElementById('rightTrigger'),
        document.getElementById('selectButton'),
        document.getElementById('startButton'),
        document.getElementById('leftStick'),
        document.getElementById('rightStick'),
        document.getElementById('dPadUp'),
        document.getElementById('dPadDown'),
        document.getElementById('dPadLeft'),
        document.getElementById('dPadRight'),
        document.getElementById('xBoxButton')
        ];
        this.sticks = [document.getElementById('leftStick'),
        document.getElementById('rightStick')];
        
        this.activationFunction = null;
        try { this.config = require('./controllerConfig'); }
        catch (e) { this.config = null; }
        this.leftStickCoords = [122, 100];
        this.rightStickCoords = [304, 173];
        this.rightStickCoords
    }

    /**
     * Updates the display and executes commands attached to each button
     * @param {gamepad} gp state of the controller
     */
    update(gp) {

        // update display on application
        for (var i = 0; i < 6; i++) {
            var displayButton = this.buttons[i]; //didn't need to make a seperate var but it
            var buttonState = gp.buttons[i];     // makes the code more readable for me
            if (buttonState.pressed) {
                displayButton.classList.add('buttonPressed');
            }
            else {
                if (displayButton.classList.contains('buttonPressed')) {
                    displayButton.classList.remove('buttonPressed');
                }
            }
        }

        //handle triggers which are "buttons" for whatever reason
        for (var i = 6; i < 8; i++) {
            var displayButton = this.buttons[i];
            var buttonState = gp.buttons[i];
            displayButton.setAttribute('fill-opacity', Math.floor(buttonState.value * 100) + '%');
        }

        //go back to handling REAL buttons
        for (var i = 8; i < this.buttons.length; i++) {
            var displayButton = this.buttons[i];
            var buttonState = gp.buttons[i];
            if (buttonState.pressed) {
                displayButton.classList.add('buttonPressed');
            }
            else {
                if (displayButton.classList.contains('buttonPressed')) {
                    displayButton.classList.remove('buttonPressed');
                }
            }
        }


        //update sticks on display
        //using hacky math. update when you actually derive the real formula
        this.sticks[0].setAttribute('cx', this.leftStickCoords[0] + 17 * gp.axes[0]);
        this.sticks[0].setAttribute('cy', this.leftStickCoords[1] + 17 * gp.axes[1]);

        this.sticks[1].setAttribute('cx', this.rightStickCoords[0] + 17 * gp.axes[2]);
        this.sticks[1].setAttribute('cy', this.rightStickCoords[1] + 17 * gp.axes[3]);


        //process commands attached to buttons
        this.processCommands(gp);
    }

    updateConfig() {
        try {
            this.config = require('./controllerConfig');
            this.updateActivationFunction();
        }
        catch (e) { this.config = null; }
    }

    updateActivationFunction() {
        if (this.config.activationFunction) {
            var speedFunctions = require('../../../helpers/speedFunctions')
            this.activationFunction = (new speedFunctions()).getSpeedFunctionByName(this.config.activationFunction);
        }

    }

    /**
     * this is the function where commands are processed
     * @param {gamepad} gp gamepad object that is given to us every 100 ms
     */
    processCommands(gp) {
        if (this.config) {
            for (var i = 0; i < gp.buttons; i++) {

            }

        }
    }



};