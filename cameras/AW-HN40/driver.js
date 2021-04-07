module.exports = class Driver {
    /**
     * Constructor for the AW-HN40 Driver class
     * @param {Object} configJson Object containing the configuration stored in ./configure.json
     */
    constructor(configJson) {
        this.commands = require("./commands.json");
        this.config = configJson;
        if (!this.config.maxSpeed) {
            this.config.maxSpeed = 99;
        }
        if (this.config.maxSpeed < 99) {
            this.config.maxSpeed = 99;
        }
    }


    /**
     * Turns auto focus on or off
     * @param {boolean} value True will tell the camera to use auto focus
     * @param {function} callback optional callback
     */
    autoFocus(value, callback) {
        if (value) {
            this.sendCamCommand(this.commands.commands.autoFocus.on, callback);
        }
        else {
            this.sendCamCommand(this.commands.commands.autoFocus.off, callback);
        }
    }

    /**
     * calculates speed setting to pass to the camera
     * @param {float} percentage float between 0 and 1
     * @returns integer speed of camera that is not more than the configured maxSpeed
     */
    calculateSpeedFromPercentage(percentage) {
        var speed = Math.round(percentage * this.config.maxSpeed);
        if (speed <= 0) {
            speed = 1;
        }
        else if (speed >= 100) {
            speed == 99
        }
        return speed
    }

    /**
     * focuses in or out based on a percentage
     * @param {float} percentage A float between 0 and 1 representing a joystick's position along one of the axis
     * @param {function} callback optional callback
     */
    focus(percentage, callback){
        var speed = this.calculateSpeedFromPercentage(percentage);
        speed.padNum(speed, 2);
        this.sendPTZCommand(this.commands.commands.focus+speed, callback)
    }

    /**
     * moves the focal distance in
     * @param {float} percentage float between 0 and 1 representing some trigger's position
     * @param {function} callback optional callback
     */
    focusIn(percentage, callback){
        var speed = this.calculateSpeedFromPercentage(.5 + .5 *percentage);
        speed.padNum(speed, 2);
        this.sendPTZCommand(this.commands.commands.focus+speed, callback)
    }

    /**
     * moves the focal distance out
     * @param {float} percentage float between 0 and 1 representing some trigger's position
     * @param {function} callback optional callback
     */
    focusOut(percentage, callback){
        var speed = this.calculateSpeedFromPercentage(.5 - .5 *percentage);
        speed.padNum(speed, 2);
        this.sendPTZCommand(this.commands.commands.focus+speed, callback)
    }

    /**
     * Gets the current power state from the camera and passes true or false to the callback
     * @param {function} callback Optional callback
     */
    getPowerState(callback) {
        this.sendPTZCommand(this.commands.commands.powerState, (e) => {
            if (e.status == 200 && (e.responseText == "p1" || e.responseText == "p3")) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }

    /**
     * 
     * @returns String containing URL of camera's video feed
     */
    getVideoFeed() {
        return this.commands.cameraVideoFeed.replace('{IP}', this.config.cameraIP);
    }

    /**
     * Converts int to a string and padds it with zeroes
     * @param {int} num Number to give leading zeroes to
     * @param {int} size length of the resulting string
     * @returns String representation of number with leading zeroes
     */
    padNum(num, size) {
        num = num.toString();
        while (num.length < size) {
            num = '0' + num;
        }
        return num;
    }

    /**
     * Makes camera pan and tilt
     * @param {float} xPercent Joystick's X value as a percentage of the maximum
     * @param {float} yPercent Joystick's Y value as a percentage of the maximum
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    panTilt(xPercent, yPercent, callback) {
        var xSpeed = this.calculateSpeedFromPercentage(xPercent);
        xSpeed = this.padNum(xSpeed, 2); //make this into a 0 padded number
        var ySpeed = this.calculateSpeedFromPercentage(yPercent);
        ySpeed = this.padNum(ySpeed, 2);
        //console.log(xPercent)
        //console.log(yPercent)
        var command = this.commands.commands.panTilt + xSpeed + ySpeed;
        this.sendPTZCommand(command, (e) => {
            if (callback) {
                if (e.status == 200 && e.responseText == command) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
        });
    }

    /**
     * Makes camera pan left and right
     * @param {float} percent Joystick's X value as a percentage of the maximum
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    pan(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.pan + speed, callback);
    }

    /**
     * Makes camera pan to the left
     * @param {float} percent Joystick's X value as a percentage of the maximum
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    panLeft(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(.5 - .5 * percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.pan + speed, callback);
    }

    /**
     * Makes camera pan to the right
     * @param {float} percent Joystick's X value as a percentage of the maximum
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    panRight(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(.5 + .5 * percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.pan + speed, callback);
    }

    /**
     * Sends ptz commands to camera
     * @param {string} command command to be executed on camera
     * @param {function} callback optional callback
     */
    sendPTZCommand(command, callback) {
        const http = new XMLHttpRequest();
        var url = (this.commands.ptzCommandURL.replace('{IP}', this.config['cameraIP'])).replace('{Command}', command);
        //'http://' + IP + '/cgi-bin/aw_ptz?cmd=%23O&res=1';
        http.open("GET", url);
        if (callback) {
            http.onreadystatechange = (e) => {
                callback(http);
            }
        }
        http.send();
    }

    /**
 * Sends camera commands to camera
 * @param {string} command command to be executed on camera
 * @param {function=} callback optional callback
 */
    sendCamCommand(command, callback) {
        const http = new XMLHttpRequest();
        var url = (this.commands.cameraCommandURL.replace('{IP}', this.config['cameraIP'])).replace('{Command}', command);
        http.open("GET", url);
        if (callback) {
            http.onreadystatechange = (e) => {
                callback(http);
            }
        }
        http.send();
    }

    /**
     * Turns camera on or off
     * @param {boolean} power True will power on the camera. otherwise camera will power off
     * @param {*} callback Optional callback
     */
    setPower(power, callback) {
        if (power) {
            this.sendPTZCommand(this.commands.commands.powerControls.on, (e) => { this.verifySetPower(true, callback); });
        }
        else {
            this.sendPTZCommand(this.commands.commands.powerControls.off, (e) => { this.verifySetPower(false, callback); });
        }
    }

    /**
     * Makes camera tilt up and down
     * @param {float} percent value between 0 and 1. typically taken from joystick's x or y value
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    tilt(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.tilt + speed, callback);
    }

    /**
     * Makes camera tilt up
     * @param {float} percent value between 0 and 1. typically taken from joystick's x or y value
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    tiltUp(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(.5 + .5 * percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.tilt + speed, callback);
    }

    /**
     * Makes camera tilt down
     * @param {float} percent Joystick's X value as a percentage of the maximum
     * @param {function} callback optional callback function. Will pass true if command completed successfully
     */
    tiltDown(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(.5 - .5 * percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.tilt + speed, callback);
    }

    /**
     * Verification function to ensure that the command completed successfully
     * @param {boolean} onOff boolean indicating if the caller is trying to turn the camera on or off
     * @param {function} callback optional callback
     * @returns function that will return true or false back to the original callback function
     */
    verifySetPower(onOff, callback) {
        return function callbackWrapper(e) {
            if (e.status == 200) {
                if (callback) {
                    if (onOff && (e.responseText == 'p1' || e.responseText == 'p3')) {
                        callback(true);
                    }
                    callback(false);
                }
            }
        }
    }

    /**
     * Takes a value as a percentage of some maximum, converts that into a zoom speed, and then issues the command to the camera
     * @param {float} yPercent Joystick's Y value as a percentage of the maximum
     * @param {function} callback Optional callback
     */
    zoom(yPercent, callback) {
        var ySpeed = this.calculateSpeedFromPercentage(yPercent);
        ySpeed = this.padNum(ySpeed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.zoom + ySpeed, callback);
    }

    /**
     * Takes a value as a percentage of some maximum, converts that into a zoom speed, and then issues the command to the camera
     * @param {float} percent a controller's trigger value
     * @param {function} callback Optional callback
     */
    zoomIn(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(.5 + .5 * percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.zoom + speed, callback);
    }

    /**
     * Takes a value as a percentage of some maximum, converts that into a zoom speed, and then issues the command to the camera
     * @param {float} percent a controller's trigger value
     * @param {function} callback Optional callback
     */
    zoomOut(percent, callback) {
        var speed = this.calculateSpeedFromPercentage(.5 + .5 * percent);
        speed = this.padNum(speed, 2); //make this into a 0 padded number
        this.sendPTZCommand(this.commands.commands.zoom + speed, callback);
    }
};