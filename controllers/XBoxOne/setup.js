function setup(cameraAdapter) {
    var gp = null;
    var controllerDriver = undefined;
    var httpBody = new XMLHttpRequest();
    httpBody.onreadystatechange = () => {
        if (httpBody.readyState == 4) {
            if (httpBody.status == 200) {
                document.getElementById('controller').innerHTML = httpBody.responseText;
                const Driver = require('./controller.js');
                controllerDriver = new Driver(cameraAdapter);
            }
        }
    }
    httpBody.open('GET', '../../controllers/XBoxOne/controller.svg');
    httpBody.send();

    window.addEventListener("gamepadconnected", function (e) {
        gp = navigator.getGamepads()[e.gamepad.index];
        setInterval(() => {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            if (!gamepads) {
                return;
            }
            gp = gamepads[0];
            controllerDriver.update(gp);
        }, 130);
    });

}


module.exports = { setup };