function setup() {
    var httpBody = new XMLHttpRequest();
    var port = null;
    var parser = null;
    const SerialPort = require('serialport');
    const Readline = require('@serialport/parser-readline');
    httpBody.onreadystatechange = () => {
        if (httpBody.readyState == 4) {
            if (httpBody.status == 200) {
                document.getElementById('controller').innerHTML = httpBody.responseText;
                const Driver = require('./controller.js');
                controllerDriver = new Driver();
                port = new SerialPort('com3');
                parser = port.pipe(new Readline({ delimiter: '\n' }));
                parser.on('data', (e) => { controllerDriver.update(e); });
            }
        }
    }
    httpBody.open('GET', '../../controllers/TeensyNunchuck/controller.svg');
    httpBody.send();


    /*const SerialPort = require('serialport');
    const Readline = require('@serialport/parser-readline');

    port = new SerialPort('com3');
    parser = this.port.pipe(new Readline({ delimiter: '\n' }));
    parser.on('data', (e) => { controllerDriver.update(e); });*/

}


module.exports = { setup };