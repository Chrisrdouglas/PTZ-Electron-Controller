function setup(cameraAdapter) {
    //var gp = null;
    var controllerDriver = null;
    //console.log(cameraAdapter)

    var gpInterval = setInterval(() => {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        var gp = null;
        //itter over gamepads because they can produce a set of null gamepads for whatever reason
        for( var gamepad in gamepads){
            if (!gamepads[gamepad]){ // if this one is null then move on 
                continue;
            }
            //we found a gamepad now make sure it's the right type
            if (gamepads[gamepad].id  == 'Xbox 360 Controller (XInput STANDARD GAMEPAD)'){
                gp = gamepads[gamepad];
                break; // we found it so break out of loop early
            }
        }
        //if gp is null then do nothing otherwise give updated gp info to controller driver
        if(gp && controllerDriver) {controllerDriver.update(gp);}
    }, 10);


    var httpBody = new XMLHttpRequest();
    httpBody.onreadystatechange = () => {
        if (httpBody.readyState == 4) {
            if (httpBody.status == 200) {
                document.getElementById('controller').innerHTML = httpBody.responseText;
                const Driver = require('./controllerDriver.js');
                controllerDriver = new Driver(cameraAdapter);
                controllerDriver.setControllerListener(gpInterval);
            }
        }
    }
    httpBody.open('GET', '../../controllers/XBoxOne/controller.svg');
    httpBody.send();

}


module.exports = { setup };