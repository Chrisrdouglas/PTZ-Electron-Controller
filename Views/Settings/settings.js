const fs = require('fs');

/**
 * Validates that information is present and saves the configuration file to configure.json
 * @returns nothing
 */
function save() {
    const electron = require('electron')
    const remote = electron.remote
    docCameraIP = document.getElementById('cameraIP');
    docRemember = document.getElementById('remember');
    docControllers = document.getElementById('controllerName');
    docCameraType = document.getElementById('cameraType');

    // leaving this as a text box to give people the ability to input a domain name.
    // someone could insert a json string and have it saved to the configuration file
    if (docCameraIP.value.length == 0) {
        alert("Insert Address of Camera");
        return;
    }
    if (docCameraType.value == "Select") {
        alert("Select a supported camera");
        return;
    }
    if (docControllers.value == "Select") {
        alert("Select a supported controller")
        return;
    }

    //make json object
    var config = {
        cameraIP: docCameraIP.value,
        cameraType: docCameraType.value,
        controllerName: docControllers.value,
        remember: docRemember.checked
    }

    //write
    try { fs.writeFileSync('./configure.json', JSON.stringify(config), 'utf-8'); }
    catch (e) {
        console.log(e);
        return;
    }

    var window = remote.getCurrentWindow();
    window.close();

}

/**
 * Populates one of the select tags with the names of folders from the path variable
 * @param {string} id A <select> tag's ID
 * @param {string} path path to a folder
 */
function populateSelect(id, path) {
    var itemList = getDirectories(path);
    var select = document.getElementById(id);
    var format = "<option value=\"{Name}\">{Name}</option>\n";
    var newInnerHTML = "<option value=\"Select\" selected disabled hidden>Select</option>\n";
    for (var i = 0; i < itemList.length; i++) {
        newInnerHTML += format.replaceAll('{Name}', itemList[i]);
    }
    select.innerHTML = newInnerHTML;
}

/**
 * Takes a path and produces a list of directory names in that path
 * @param {string} path a string to a path on the file system
 * @returns list of directory names in a given path
 */
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}


/**
 * Loads the most recently used settings
 */
function load() {
    try { var configFile = require('../../configure.json'); }
    catch (e) {
        var configFile = {
            cameraIP: undefined,
            cameraType: undefined,
            controllerName: undefined,
            remember: undefined
        };
    }
    var cameraIP = document.getElementById('cameraIP');
    var remember = document.getElementById('remember');
    var controllerName = document.getElementById('controllerName');
    var cameraType = document.getElementById('cameraType');

    populateSelect('cameraType', './cameras/');
    populateSelect('controllerName', './controllers/');


    if (configFile.cameraIP) {
        cameraIP.value = configFile.cameraIP;
    }
    if (configFile.cameraType) {
        cameraType.value = configFile.cameraType;
    }
    else {
        cameraType.value = "Select";
    }
    if (configFile.controllerName) {
        controllerName.value = configFile.controllerName;
    }
    else {
        controllerName.value = "Select";
    }
    if (configFile.remember) {
        remember.checked = configFile.remember;
    }
}

load();