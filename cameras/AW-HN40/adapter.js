module.exports = class Adapter{

    /**
     *
     *
     */
    constructor(config){
        const Driver = require('./driver.js');
        this.cameraName = "AW-HN40";
        this.cameraDriver = new Driver(config);
        this.activationFunction = null;
        this.controller = null;
        this.buttonCommands = config.controllers[config.controllerName][this.cameraName];

    }


    processCommands(){
        console.log('processCommands')
    }

    /**
     * 
     * @returns String with this camera's name
     */
    getCameraName(){
        return this.cameraName;
    }

    /**
     * function to give index.html the controls granted by this adapter
     */
    setControls(){
        var cameraControls = document.getElementById('cameraControlls');
        cameraControls.innerHTML ='<button class="controlPannelButton PowerButton PowerButtonOff" id="powerButton" onclick="cameraAdapter.cameraPowerChange()" onmouseover="cameraAdapter.cameraPowerState()"><b>POWER</b></button>'
    }

    setController(controller){
        this.controller = controller;

        //setup buttons
        for(var i = 0; i < this.buttonCommands.length; i++){
            console.log(this.buttonCommands[i])
        }

    }

    /**
     * function invoked by cameraPowerState. If camera gets turned on by anything
     * this will update the power button in the camera control pannel in index.html
     * and pass the video feed url to the cameraFeed element.
     * @param {boolean} e 
     */
    updateDisplayPower(e) {
        var powerButton = document.getElementById('powerButton');
        var img = document.getElementById('cameraFeed');
        if (e && powerButton.classList.contains('PowerButtonOff')) {
            powerButton.classList.replace('PowerButtonOff', 'PowerButtonOn');
            powerButton.value = 'on';
            img.src = this.cameraDriver.getVideoFeed();
        }
        else if (!e && powerButton.classList.contains('PowerButtonOn')) {
            powerButton.classList.replace('PowerButtonOn', 'PowerButtonOff');
            powerButton.value = 'off';
            //set image src to some default in the future
        }
    }

    /**
     * invoked by the power button in the camera control element in index.html.
     * will ask the user if they're sure they want to power off the camera before
     * changing the power state
     */
    cameraPowerChange() {
        var powerButton = document.getElementById('powerButton');
        if (powerButton.value == 'on') {
            //confirm that we want to turn camera off
            var r = confirm('Are you sure that you\'d like to turn off this camera?');
            if (r) {
                this.cameraDriver.setPower(false, null);
            }
        }
        else {
            this.cameraDriver.setPower(true, null);
        }
    }


    /**
     * function to be ran during setup. it invokes the updateDisplayPower function with
     * the value taken from the camera driver's getPowerState function.
     */
    cameraPowerState() {
        this.cameraDriver.getPowerState((e) => {this.updateDisplayPower(e);});
    }

    /**
     * executes commands on the camera by doing a lookup of the button's associated command and executing it on the camera driver
     * @param {string} command string with the name of command that needs to be executed
     * @param {object[]} value
     */
    executeCommand(command, value){
    }

    /**
    * Uses the Math.floor function. Increasing the step size increases the sensitivity.
    * A shift of .5 is recommended.
    * @param {float} x 
    * @param {object} functionParams function paramaters defined in ./configure.json
    * @param {int} functionParams.numSteps Step size. Defaults to 100
    * @param {float} functionParams.shift shifts function to the left or right. For example: +5 will shift function to the left. Defaults to 0.
    * @returns floor(x*steps + shift)/steps
    */
    step(x, functionParams){
        var numSteps = 100;
        var shift = 0;
        if (functionParams.numSteps){ numSteps = functionParams.numSteps;}
        if (functionParams.shift){ shift = functionParams.shift;}
        return Math.floor(x*numSteps+shift)/numSteps;
    }

    /**
     * Required setup function that initializes the app's video feed, and starts
     * any event listeners that might be required.
     */
    setup(){
        //load up the controls that this adapter wants
        this.setControls();
        //start monitoring the power state
        setInterval(() => {this.cameraPowerState();}, 1000);
    }

};