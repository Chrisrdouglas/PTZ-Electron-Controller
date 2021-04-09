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
 * 
 * @param {*} path 
 * @returns 
 */
function populateButtonSettings() {
    var controllerName = document.getElementById('controllerName').value;
    var cameraType = document.getElementById('cameraType').value;
    if (!controllerName || controllerName == "Select" || !cameraType || cameraType == "Select") {
        return;
    }

    buttonMappings = document.getElementById('buttonMappings');
    //ugh, i might as well be writing PHP
    var open = '<div class="space"><b>{NAME}:</b>\n<select name="{NAME}" id="{NAME}">\n'
    var stickOpen = '<div class="space"><div id="stick{STICKINDEX}"><b>{NAME}:</b>\n<select name="{NAME}" id="{NAME}" onchange="splitStick(id)">\n'
    var option = '<option value="{OPTION}">{OPTION}</option>\n'
    var close = '</select></div>'
    var stickClose = '</select><div id="{STICKNAME}-X"></div><div id="{STICKNAME}-Y"></div></div></div>'

    //get file from controller
    try { var mappingsFile = require('../../controllers/' + controllerName + '/mappings.json'); }
    catch (e) {
        console.log('Mappings file not found for controller');
        return;
    }

    try { var mappable = require('../../cameras/' + cameraType + '/CameraProperties.json'); }
    catch (e) {
        console.log('Camera properties file not found for camera');
        return;
    }


    console.log(mappable);

    var append = '<h2>Triggers</h2>'
    var trigIndexes = [];

    //itter over triggers
    for (var i = 0; i < mappingsFile.Triggers.length; i++) {
        var newTrigger = open.replaceAll('{NAME}', mappingsFile.Triggers[i].label);
        trigIndexes.push(mappingsFile.Triggers[i].buttonIndex);
        newTrigger += '<option value="Select" selected disabled hidden>Select</option>\n';
        for (var j = 0; j < mappable.Trigger.length; j++) {
            newTrigger += option.replaceAll('{OPTION}', mappable.Trigger[j]);
        }
        newTrigger += close;
        append += newTrigger;
    }

    append += '<h2>Buttons</h2>';
    //itter over buttons
    for (var i = 0; i < mappingsFile.buttonIndexes.length; i++) {
        //This is going to make the ID the joystick's name.
        //For example: an XboxController's left stick is going to now have an ID of 'Left Joystick'
        //when looking it up with document.getElementsById().
        var newJoystick = open.replaceAll('{NAME}', mappingsFile.buttonIndexes[i]);
        newJoystick += '<option value="Select" selected disabled hidden>Select</option>\n';
        for (var j = 0; j < mappable.Button.length; j++) {
            newJoystick += option.replaceAll('{OPTION}', mappable.Button[j]);
        }
        newJoystick += close;
        append += newJoystick;
    }

    append += '<h2>Sticks</h2>'
    //itter over sticks
    for (var i = 0; i < mappingsFile.Joysticks.length; i++) {
        //This is going to make the ID the joystick's name.
        //For example: an XboxController's left stick is going to now have an ID of 'Left Joystick'
        //when looking it up with document.getElementsById().
        var newJoystick = stickOpen.replaceAll('{NAME}', mappingsFile.Joysticks[i].label)
        newJoystick = newJoystick.replaceAll('{STICKINDEX}', i)
        newJoystick += '<option value="Select" selected disabled hidden>Select</option>\n';
        for (var j = 0; j < mappable.Joystick.length; j++) {
            newJoystick += option.replaceAll('{OPTION}', mappable.Joystick[j]);
        }
        newJoystick += stickClose.replaceAll('{STICKNAME}', mappingsFile.Joysticks[i].label);
        append += newJoystick;
    }
    buttonMappings.innerHTML = append;
}

function splitStick(id) {
    var doc = document.getElementById(id);
    var docX = document.getElementById(id + '-X');
    var docY = document.getElementById(id + '-Y');
    var cameraType = document.getElementById('cameraType').value;

    try { var mappable = require('../../cameras/' + cameraType + '/CameraProperties.json'); }
    catch (e) {
        console.log('Camera properties file not found for camera');
        return;
    }

    if (doc.value == 'Split X+Y Function') {
        //generate docX
        var open = '<div class="space"><b>Stick X Function:</b>\n<select name="Stick-X-Function" id="Stick-X-Function">\n<option value="Select" selected disabled hidden>Select</option>\n';
        var option = '<option value="{OPTION}">{OPTION}</option>\n'
        var close = '</select></div>'
        for (var i = 0; i < mappable.PartialStick.length; i++) {
            open += option.replaceAll('{OPTION}', mappable.PartialStick[i]);
        }
        open += close;
        docX.innerHTML = open

        //generate docY
        open = '<div class="space"><b>Stick Y Function:</b>\n<select name="Stick-Y-Function" id="Stick-Y-Function">\n<option value="Select" selected disabled hidden>Select</option>\n'
        for (var i = 0; i < mappable.PartialStick.length; i++) {
            open += option.replaceAll('{OPTION}', mappable.PartialStick[i]);
        }
        open += close;
        docY.innerHTML = open



    }
    else {
        docX.innerHTML = '';
        docY.innerHTML = '';
    }
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

    populateSelect('cameraType', './cameras/');
    populateSelect('controllerName', './controllers/');


    if (configLoaded) {
        cameraIP.value = configFile.cameraIP;
        cameraType.value = configFile.cameraType;
        controllerName.value = configFile.controllerName;

        //populate+load button mappings
        populateButtonSettings();
        var controller = configFile[configFile.controllerName][configFile.cameraType];

        try { var mappable = require('../../cameras/' + configFile.cameraType + '/CameraProperties.json'); }
        catch (e) {
            console.log('Camera properties file not found for camera');
            controller = undefined;
        }

        try { var mappingsFile = require('../../controllers/' + controllerName + '/mappings.json'); }
        catch (e) {
            console.log('Mappings file not found for controller');
            controller = undefined;
        }



        if (controller){

            
        }

    }
    else {
        cameraType.value = "Select";
        controllerName.value = "Select";
    }

    if (configFile.remember) {
        remember.checked = configFile.remember;
    }


}

load();