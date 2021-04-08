module.exports = class Driver {

    constructor() {
        this.cButton = document.getElementById('cButton');
        this.zButton = document.getElementById('zButton');
        this.stick = document.getElementById('stick');
        this.cameraDriver = null;
        this.activationFunction = null;
        try { this.config = require('./controllerConfig'); }
        catch (e) { this.config = null; }
        this.stickCoords = [50, 50];
    }

    /**
     * Updates the display and executes commands attached to each button
     * @param {Object} gp state of the controller
     */
    update(gp) {
        gp = JSON.parse(gp);
        var stickXNormalized = 2*(gp.Joystick.X)/(255) - 1;
        var newCX = this.stickCoords[0] + 17*stickXNormalized;
        this.stick.setAttribute('cx', newCX);

        var stickYNormalized = 2*(gp.Joystick.Y)/(255) - 1;
        var newCY = this.stickCoords[1] - 17*stickYNormalized;
        this.stick.setAttribute('cy', newCY);

        if(gp.Buttons.includes('C') && !this.cButton.classList.contains('buttonPressed')){
            this.cButton.classList.add('buttonPressed');
        }
        else if(!gp.Buttons.includes('C') && this.cButton.classList.contains('buttonPressed')){
            this.cButton.classList.remove('buttonPressed');
        }

        if(gp.Buttons.includes('Z') && !this.zButton.classList.contains('buttonPressed')){
            this.zButton.classList.add('buttonPressed');
        }
        else if(!gp.Buttons.includes('Z') && this.zButton.classList.contains('buttonPressed')){
            this.zButton.classList.remove('buttonPressed');
        }
        //process commands attached to buttons
        this.processCommands(gp);
    }

    /**
     * fetches contoller's configuration file. This file contains the mappings between the buttons and the functions
     * that a camera has.
     */
    updateConfig() {
        try {
            this.config = require('./controllerConfig');
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
     * This is the function where commands are processed. To be filled in later
     * @param {gamepad} gp gamepad object that is given to us every 100 ms
     */
    processCommands(gp) {

    }



};