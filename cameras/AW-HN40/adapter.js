module.exports = class Adapter{

    /**
     * 
     */
    constructor(config){
        const Driver = require('./driver.js');
        this.cameraDriver = new Driver(config);

    }

    /**
     * function to give index.html the controls granted by this adapter
     */
    getControls(){
        var cameraControls = document.getElementById('cameraControlls');
        cameraControls.innerHTML ='<button class="controlPannelButton PowerButton PowerButtonOff" id="powerButton" onclick="cameraAdapter.cameraPowerChange()" onmouseover="cameraAdapter.cameraPowerState()"><b>POWER</b></button>'
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
     * @param {string} buttonName
     * @param {object[]} value 
     */
    executeCommand(buttonName, value){

    }

    /**
     * Required setup function that initializes the app's video feed, and starts
     * any event listeners that might be required.
     */
    setup(){
        //load up the controls that this adapter wants
        this.getControls();
        //start monitoring the power state
        setInterval(() => {this.cameraPowerState();}, 1000);
        

    }

};