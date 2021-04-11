const fs = require('fs');
const { config } = require('process');

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



    driver.save();
    //if(driver.save()){
    //    var window = remote.getCurrentWindow();
    //    window.close();
    //}

    

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
function load(driver) {
    populateSelect('cameraType', './cameras/');
    populateSelect('controllerName', './controllers/');

    var configLoaded = true;
    try { var configFile = require('../../configure.json'); }
    catch (e) {
        var configFile = {
            cameraIP: undefined,
            cameraType: undefined,
            controllerName: undefined,
            remember: undefined
        };
        configLoaded = false;
    }
    var cameraIP = document.getElementById('cameraIP');
    var remember = document.getElementById('remember');
    var controllerName = document.getElementById('controllerName');
    var cameraType = document.getElementById('cameraType');




    if (configLoaded) {
        cameraIP.value = configFile.cameraIP;
        cameraType.value = configFile.cameraType;
        controllerName.value = configFile.controllerName;

        // after the basic configuration data is loaded we want to load the
        // controller image and button mappings if they're present
        driver.deviceChanged('controller');
    }
    else {
        cameraType.value = "Select";
        controllerName.value = "Select";
    }

    if (configFile.remember) {
        remember.checked = configFile.remember;
    }


}

load(driver);