module.exports = class Adapter{

    /**
     *
     *
     */
    constructor(config){
        const Driver = require('./driver.js');
        this.cameraProperties = require('./CameraProperties.json');
        this.cameraName = "AW-HN40";
        this.cameraDriver = new Driver(config);
        this.activationFunction = null;
        this.controller = null;
        this.buttonCommands = config.controllers[config.controllerName][this.cameraName];
        this.controllerDriver = null;
        this.panTiltCache = [0,0]; //temp hack so we can do use this tomorrow
    }

    setControllerDriver(cd){
        this.controllerDriver = cd;
    }


    processCommands(){
        //console.log('processCommands')
        //no op
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


    runFunction(commandName, controllerElement){
        var type = controllerElement.getType();
        if (type == 'Trigger'){
            var value = controllerElement.getValue();
            value = this.step(value, {numSteps: 10, shift:.5});
            this.cameraDriver[commandName](value);
            console.log(commandName + ': ' + controllerElement.getLabel() + '-> ' + value);
        }
        if (type == 'Button'){
            var value = controllerElement.getValue();
            console.log(commandName + ': ' + controllerElement.getLabel() + '-> ' + value);
        }
        else if (type == 'Joystick'){
            var value = controllerElement.getValueNormalized(0, 1);
            console.log(value)
            console.log(controllerElement.getRawValue())
            value[0] = this.step(value[0], {numSteps: 4, shift:.5});
            value[1] = this.step(value[1], {numSteps: 4, shift:.5});
            if (value[0] != this.panTiltCache[0] || value[1] != this.panTiltCache[1]){
                this.cameraDriver[commandName](value[0],value[1]);}
            console.log(commandName + ': ' + controllerElement.getLabel() + '-> (' + value[0] + ', ' + value[1] + ')');
        }
        else if (type == 'Joystick Axis'){
            var value = controllerElement.getNormalizedValue(0,1);
            value = this.step(value, {numSteps: 10, shift:.5});
            console.log(commandName + ': ' + controllerElement.getLabel() + '-> ' + value);
        }
    }

    setController(controller){
        this.controller = controller;

        //setup buttons
        //command is the function that we want to run on the camera
        console.log(this.buttonCommands)
        for(var command in this.buttonCommands){
            console.log(command)
            var cmdString = this.buttonCommands[command].split('+');
            for(var cmd in cmdString){
                cmdString[cmd] = cmdString[cmd].trim();
            }
            //this.runFunction(command, this.controller.getByLabel(cmdString[cmdString.length -1]))
            if (cmdString.length == 1){
                var callbackGenerator = (c) => {return (e)=> {this.runFunction(c, e);};}
                //this is a native command for that controller's button/joystick/axis/trigger
                var element = this.controller.getByLabel(cmdString[0]);
                console.log(cmdString[0]);

                if (element.getType() == 'Button'){
                    element.pushPressCallback(callbackGenerator(this.cameraProperties[command].functionName));
                    console.log(element)
                }
                //var element = this.controller.getByLabel(cmdString[0]);
                else if (element.getType() == 'Trigger'){
                    var callbackGenerator = (c) => {return (e)=> {this.runFunction(c, e);};}
                    element.pushChangeCallback(callbackGenerator(this.cameraProperties[command].functionName));
                    console.log(element)
                }
                else if (element.getType() == 'Joystick'){
                    var callbackGenerator = (c) => {return (e)=> {this.runFunction(c, e);};}
                    element.pushChangeCallback(callbackGenerator(this.cameraProperties[command].functionName));
                    console.log(element)

                }
            }
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
    * Uses the Math.floor function. Increasing the step size increases the sensitivity.
    * A shift of .5 is recommended.
    * @param {float} x 
    * @param {object} functionParams function paramaters defined in ./configure.json
    * @param {int} functionParams.numSteps Step size that should be some even number. Defaults to 100
    * @param {float} functionParams.shift shifts function to the left or right. For example: +5 will shift function to the left. Defaults to 0.
    * @returns floor(x*steps + shift)/steps
    */
    step(x, functionParams){
        var numSteps = 10;
        var shift = .5;
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