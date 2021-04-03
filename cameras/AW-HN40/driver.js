const commands = require("./commands.json");
var config = null;
//var lastCommandTime = Date.now(); // need to wait 130 ms before sending another command. fix later


/**
 * Turns auto focus on or off
 * @param {boolean} value True will tell the camera to use auto focus
 * @param {function} callback optional callback
 */
function autoFocus(value, callback){
    if(value){
        sendCommand(commands.autoFocus.on, callback);
    }
    else{
        sendCommand(commands.autoFocus.off, callback);
    }
}

/**
 * calculates speed setting to pass to the camera
 * @param {float} percentage float between 0 and 1
 * @returns integer speed of camera that is not more than the configured maxSpeed
 */
function calculateSpeedFromPercentage(percentage){
    speed = Math.round(percentage * config.maxSpeed);
    if (speed <= 0){
        speed = 1;
    }
    else if (speed >= 100){
        speed == 99
    }
    return speed
}

/**
 * Gets the current power state from the camera
 * @param {function} callback Optional callback
 */
 function getPowerState(callback){
    sendCommand(commands.commands.powerState, callback);
}

/**
 * 
 * @returns String containing URL of camera's video feed
 */
function getVideoFeed(){
    return commands.cameraVideoFeed.replace('{IP}', config.cameraIP);
}

/**
 * Converts int to a string and padds it with zeroes
 * @param {int} num Number to give leading zeroes to
 * @param {int} size length of the resulting string
 * @returns String representation of number with leading zeroes
 */
function padNum(num, size){

    num = num.toString();
    while(num.length < size){
        console.log(num)
        num = '0' + num;
    }
    return num;
}

/**
 * Makes camera pan and tilt
 * @param {float} xPercent Joystick's X value as a percentage of the maximum
 * @param {float} yPercent Joystick's Y value as a percentage of the maximum
 * @param {function} callback optional callback function
 */
function panTilt(xPercent, yPercent, callback){
    xSpeed = calculateSpeedFromPercentage(xPercent);
    xSpeed = padNum(xSpeed, 2); //make this into a 0 padded number
    ySpeed = calculateSpeedFromPercentage(yPercent);
    ySpeed = padNum(ySpeed,2);
    sendCommand(commands.commands.panTilt+xSpeed+ySpeed, callback);
}

/**
 * Sends commands to camera
 * @param {string} command command to be executed on camera
 * @param {function=} callback optional callback
 */
 function sendCommand(command, callback){
    const http = new XMLHttpRequest();
    var url = (commands['cameraCommandURL'].replace('{IP}', config['cameraIP'])).replace('{Command}', command);
    //'http://' + IP + '/cgi-bin/aw_ptz?cmd=%23O&res=1';
    http.open("GET", url);
    http.send();
    if (!callback){
        http.http.onreadystatechange = (e) => {
            callback(e);
        }
    }
}

/**
 * Used to set the camera's IP and limit the speed at which it pans, tilts, and zooms
 * @param {object} configJson Configuration pulled from configure.json
 * @param {string} configJson.cameraIP IP address of the camera
 * @param {int} configJson.maxSpeed limits the speed to be between 0 and this value. If undefined then 100% of the movement speed is available
 */
 function setConfig(configJson){
    config = configJson;
    if(configJson.maxSpeed == undefined){
        config.maxSpeed = 99;
    }
    if(config.maxSpeed < 99){
        config.maxSpeed = 99;
    }
}

/**
 * Turns camera on or off
 * @param {boolean} power True will power on the camera. otherwise camera will power off
 * @param {*} callback Optional callback
 */
function setPower(power, callback){
    if(power){
        sendCommand(commands.commands.powerControls.on, callback);
    }
    else{
        sendCommand(commands.commands.powerControls.off, callback);
    }
}

/**
 * Takes a value as a percentage of some maximum, converts that into a zoom speed, and then issues the command to the camera
 * @param {float} yPercent Joystick's Y value as a percentage of the maximum
 * @param {*} callback Optional callback
 */
function zoom(yPercent, callback){
    ySpeed = calculateSpeedFromPercentage(yPercent);
    ySpeed = padNum(ySpeed, 2); //make this into a 0 padded number
    sendCommand(commands.commands.zoom+ySpeed, callback);
}
