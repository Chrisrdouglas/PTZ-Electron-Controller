module.exports = class Index {

    constructor() {
        this.config = require('./configure.json');
        this.camConfig = require('./cameras/' + this.config.cameraType + '/commands.json');
        this.x = this.config.lastX;
        this.y = this.config.lastY;
        this.zoomState = false;
        this.camMoveState = false;
        const Driver = require('./cameras/' + this.config.cameraType + '/driver.js');
        this.driver = new Driver(this.config);

        //const electron = require('electron');
        //const {ipcRenderer} = electron;
        const fs = require('fs');
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        this.port = new SerialPort(this.config["controllerComPort"]);
        this.parser = this.port.pipe(new Readline({ delimiter: '\n' }));

        //important references
        this.redDot = document.getElementById('redDot');
        this.zbutton = document.getElementById('ZButton');
        this.cbutton = document.getElementById('CButton');
        this.outsideBox = document.getElementById('outsideBox');
        this.powerButton = document.getElementById('powerButton');
        this.image = document.getElementById('camera');
    }

    setDriver(d) {
        this.driver = d;
    }

    updateDisplayPower(e) {
        if (e && this.powerButton.classList.contains('PowerButtonOff')) {
            this.powerButton.classList.replace('PowerButtonOff', 'PowerButtonOn');
            this.powerButton.value = "on"
            this.image.src = this.driver.getVideoFeed();
        }
        else if (!e && this.powerButton.classList.contains('PowerButtonOn')) {
            this.powerButton.classList.replace('PowerButtonOn', 'PowerButtonOff');
            this.powerButton.value = 'off'
            //set image src to some default in the future
        }
    }


    cameraPowerState() {
        this.driver.getPowerState((e) => {this.updateDisplayPower(e);});
    }

    cameraPowerChange() {
        if (this.powerButton.value == 'on') {
            //confirm that we want to turn camera off
            var r = confirm("Are you sure that you'd like to turn off the camera?");
            if (r) {
                this.driver.setPower(false, null);
            }
            return;
        }
        else {
            this.driver.setPower(true, null);
        }
    }

    updateControllerInfo(controllerState) {
        var obj = JSON.parse(controllerState);
        var xPercent = this.controllerPercentageCalc(obj['Joystick']['X'], this.x);
        var yPercent = this.controllerPercentageCalc(obj['Joystick']['Y'], this.y);

        if (obj['Buttons'].includes('C')) {
            if (this.cbutton.classList.contains('ControllerButtonUnpressed')) {
                this.cbutton.classList.remove('ControllerButtonUnpressed');
                this.cbutton.classList.add('ControllerButtonPressed');
            }
            this.x = obj['Joystick']['X'];
            this.y = obj['Joystick']['Y'];

            //write to config file
            this.config['lastX'] = this.x;
            this.config['lastY'] = this.y;

            try { fs.writeFileSync('./configure.json', JSON.stringify(config), 'utf-8'); }
            catch (e) { console.log(e); }

        }
        else {
            if (this.cbutton.classList.contains('ControllerButtonPressed')) {
                this.cbutton.classList.remove('ControllerButtonPressed');
                this.cbutton.classList.add('ControllerButtonUnpressed');
            }
        }


        if (obj['Buttons'].includes('Z')) {
            if (this.zbutton.classList.contains('ControllerButtonUnpressed')) {
                this.zbutton.classList.remove('ControllerButtonUnpressed');
                this.zbutton.classList.add('ControllerButtonPressed');
            }
            //add code here for zoom
            this.driver.zoom(yPercent);
        }
        else {
            if (this.zbutton.classList.contains('ControllerButtonPressed')) {
                this.zbutton.classList.remove('ControllerButtonPressed');
                this.zbutton.classList.add('ControllerButtonUnpressed');
            }
            if (this.zoomState == true) {
                this.driver.zoom(this.controllerPercentageCalc(y, y));
            }
        }

        //update joystick position on screen
        //console.log(obj['Joystick']['X']);
        var newX = (xPercent * this.outsideBox.clientWidth) - 12.5;
        var newY = (yPercent * this.outsideBox.clientHeight) - 12.5;
        //console.log(newX)
        this.redDot.style.top = (this.outsideBox.clientHeight - 25 - newY) + "px";
        this.redDot.style.left = newX + "px";
        if (obj['Buttons'].length == 0) {
            this.driver.panTilt(xPercent, yPercent);
        }

    }

    controllerPercentageCalc(stick, mean) {
        return stick / (2 * mean);
    }


    startup() {
        this.driver.autoFocus(this.config['defaultAutoFocus']);
        setInterval(() => {this.cameraPowerState();}, 1000);
        this.parser.on('data', (e) => {this.updateControllerInfo(e);});
    }
};