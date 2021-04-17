const Controller = require("./controller/Controller");
module.exports = class Driver {

    constructor(cameraAdapter) {
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

        
        //cameraDriver
        this.cameraAdapter = cameraAdapter;
        try { this.cameraAdapter.setControllerDriver(this) }
        catch (e) { console.log('This Camera Driver does not have a setControllerDriver function') }
        
        // global configuration file
        try { this.config = require('../../configure.json'); }
        catch (e) { this.config = null; }

        
        //maps the button indexes from gamepad to the button names
        try { this.mappings = require('./mappings.json') }
        catch (e) { console.log('mappings.json is missing') }

        //
        //console.log(this.cameraAdapter)
        //console.log(this.config)
        //console.log(this.config.controllers[this.mappings.controllerName][this.cameraAdapter.getCameraName()])
        
        //x and y coords for where the centers of the joystick circles should be
        this.leftStickCoords = [122, 100];
        this.rightStickCoords = [304, 173];

        //raw controller data
        this.controller = new Controller(this.mappings);

        this.cameraAdapter.setController(this.controller);
    }

    setControllerListener(intervalListener){
        this.interval = intervalListener;
    }

    stopController(){
        clearInterval(this.interval);
    }

    /**
     * Updates the display and executes commands attached to each button
     * @param {gamepad} gp state of the controller
     */
    update(gp) {
        
        this.controller.update(gp);
        // update display on application and collect information about the buttons into an object
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

        //update display for the triggers
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

        /*try{
            if (this.cameraAdapter.getSubscribed()){
                this.cameraAdapter.updateControllerState(this.controller);
            }
        }
        catch (e){
            console.log(e);
        }*/


        //process commands attached to buttons
        this.processCommands();
    }

    /**
     * fetches contoller's configuration file. This file contains the mappings between the buttons and the functions
     * that a camera has.
     */
    updateConfig() {
        try {
            this.config = require('../../configure.json');
            this.updateActivationFunction();
        }
        catch (e) { this.config = null; }
    }

    /**
     * get the activation function for the joysticks and triggers. an activation function is needed because the sticks
     * too sensitive on their own.
     */
    updateActivationFunction() {
        if (this.config.activationFunction) {
            var speedFunctions = require('../../../helpers/speedFunctions')
            this.activationFunction = (new speedFunctions()).getSpeedFunctionByName(this.config.activationFunction);
        }
    }

    /**
     * This is the function where commands are processed. This will account for
     * controller deadzone and 
     * @param {gamepad} gp gamepad object that is given to us every 130 ms
     */
    processCommands() {

        //https://www.gamedev.net/blogs/entry/2250186-designing-a-robust-input-handling-system-for-games/
        this.cameraAdapter.processCommands();
    }



};