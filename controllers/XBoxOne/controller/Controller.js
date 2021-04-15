const Button = require('./Button');
const Joystick = require('./Joystick')
module.exports = class Controller {

    constructor(mappingsJson) {
        this.label = mappingsJson.controllerName;
        this.buttons = []; //triggers are considered buttons
        this.joysticks = [];
        this.triggers = []; //keeping all Trigger indexes in a list will make it easier to itterate over them
        this.comparator = (x, y) => {
            if (x[1] > y[1]) { return -1; }
            if (x[1] < y[1]) { return 1; }
            return 0;
        }
        this.mapLabels = {}

        var buttonIndexes = mappingsJson.buttonIndexes
        for (var i = 0; i < buttonIndexes.length; i++) {
            var label = buttonIndexes[i]

            //object name with index location and type
            this.mapLabels[label] = { type: "Button", index: i }

            var button = new Button(buttonIndexes[i]);
            this.buttons.push(button);
        }


        var joysticks = mappingsJson.Joysticks;
        for (var i = 0; i < joysticks.length; i++) {
            //putting them in variables to make code more readable
            var label = joysticks[i].label;
            var deadzone = joysticks[i].deadzone;
            var ranges = joysticks[i].ranges;
            var axes = joysticks[i].axes;
            var inverts = joysticks[i].inverts;

            //associate object name with index location and type
            this.mapLabels[label] = { type: "Joystick", index: i };

            //this line is what i wanted to make more readable
            var joystick = new Joystick(label, deadzone, ranges, axes, inverts);
            this.joysticks.push(joystick);
        }

        var triggers = mappingsJson.Triggers;
        for (var i = 0; i < triggers.length; i++) {
            var index = triggers[i].buttonIndex;
            var label = triggers[i].label;

            this.mapLabels[label].type = "Trigger";
            this.buttons[this.mapLabels[label].index].setTrigger(true);
            this.triggers.push(triggers[i].buttonIndex);
        }
    }

    /**
     * takes a string representing what it wants to know about which triggers, joysticks, buttons are currently active and have highest values
     * @param {String} stateString 
     * @return Returns a list with the corresponding Joystick elements that match the given pattern. If no match then null
     */
    lookupMaxState(stateString) {
        //so we could try to use regular expressions to deal with this but it would be much easier to split things around the + and .
        var stateElements = stateString.split('+') // J,A+T+B => ['J,A', 'T', 'B']
        for (var i in stateElements) {
            stateElements[i] = stateElements[element].trim(); // ['J,A', 'T', 'B'] => [['J','A'],['T'],['B']]
        }
        // now that they've been broken down into their most basic elements try to see if we can find any meaning from it

        var joystick = null;
        var joystickAxis = null;
        var triggers = null;
        var buttons = null;
        var pop = null;

        for (var i in stateElements) {
            pop = null;
            if (stateElements[i] == 'J') {
                if (!joystick){
                    joystick = this.findActiveJoysticks();
                }
                pop = joystick.shift();
                if(pop){
                    statElements[i] = pop;
                }
                else{
                    return null;
                }
            }
            else if (stateElements[i] == 'J,A') {
                if (!joystickAxis){
                    joystickAxis = this.findActiveJoystickAxis();
                }
                pop = joystickAxis.shift();
                if(pop){
                    statElements[i] = pop;
                }
                else{
                    return null;
                }
            }
            else if (stateElements[i] == 'T') {
                if (!triggers){
                    triggers = this.findActiveTriggers();
                }
                pop = triggers.shift();
                if(pop){
                    statElements[i] = pop;
                }
                else{
                    return null;
                }
            }
            else if (stateElements[i] == 'B'){
                if (!buttons){
                    buttonIndexes = this.findActiveButtons();
                }
                pop = buttons.shift();
                if(pop){
                    statElements[i] = pop;
                }
                else{
                    return null;
                }

            }
            else if (stateElements[i] == 'B?'){ //for when a button is optional
                if (!buttons){
                    buttonIndexes = this.findActiveButtons();
                }
                pop = buttons.shift();
                if(pop){
                    statElements[i] = pop;
                }
            }
            else {return null;} //this case only ever runs if we get a state string with illegal characters
        }

        return stateElements;
    }

    /*getStateFromString(stateString){
        stateElements = stateString.split('+');
        for(var i in stateElements){
            stateElements[i] = stateElements[i].trim().split(',');
            for (var j in stateElements[i]){
                stateElements[i][j] = stateElements[i][j].trim();
            }
        }

        for(var i in stateElements){
            if(stateElements[i].length == 1){
                //either J or T or B
                try{
                    var key = this.mapLabels[stateElements[i][0]];
                    if (key.type == "Joystick"){
                        stateElements[i] = this.joysticks[key.index].getValueNormalized();
                    }
                    else if (key.type == "Trigger"){
                        stateElements[i] = this.joysticks[key.index].getValueNormalized();
                    }
                }
                catch (e) {console.log(e);}
            }
            else if (stateElements[i].length == 2){
                // must be J,A
                try{
                    var joystickIndex = this.mapLables[stateElements[i][0]];
                    var joystick = this.joysticks[joystickIndex].getValueNormalized();
                    if (stateElements[i][1] == 'X' || stateElements[i][1] == 'x') {stateElements[i] = joystick[0];}
                    else if (stateElements[i][1] == 'Y' || stateElements[i][1] == 'y')  {stateElements[i] = joystick[1];}
                    else {throw 'Neither X or Y was given when attempting to read an axis from a Joystick';}
                }
                catch (e){//joystick name not found
                    console.log(e);
                }
            }
            else {return null;}//something had to have gone wrong in this case
        }
    }*/

    setNormalizationRange(low, high){
        for (var i in this.joysticks){
            this.joysticks.setNormalizationRange(low, high);
        }
    }

    findActiveJoystickAxis() {
        var max = 0.0;
        var sticks = [];
        for (var j in this.joysticks) {
            var axis = this.joysticks[j].getValue();
            if (Math.abs(axis[0])) { sticks.push([this.joysticks[j].getLabel() + ',X', Math.abs(axis[0])]); }
            if (Math.abs(axis[1])) { sticks.push([this.joysticks[j].getLabel() + ',Y', Math.abs(axis[1])]); }
        }

        return sticks.sort(this.comparator);
    }

    findActiveJoysticks() {
        var sticks = [];
        for (var j in this.joysticks) {
            var val = Math.max(this.joysticks[j].getValue());
            if (val > 0) { stick.push([this.joysticks[j].getLabel(), this.joysticks[j].getValue()]) }
        }

        return sticks.sort(this.comparator);// (x,y) => x[1] - y[1]
    }

    findActiveTrigger() {
        var triggers = [];
        for (var i in this.triggers) {
            var triggerButton = this.buttons[this.triggers[i]];
            //0 for off, 1 for held
            if (triggerButton.getState()) {
                triggers.push(triggerButton.getLabel(), triggerButton.getHoldTime());
            }
        }

        return triggers.sort(this.comparator);// (x,y) => x[1] - y[1]
    }

    findActiveButtons() { //searches through the real buttons to see which are being held
        var activeButtons = []
        for (var i in this.buttons) {
            var bypass = false;
            for (var j in this.triggers) {
                if (i == this.triggers[j].buttonIndex) {
                    bypass = true;
                    break;
                }
            }
            if (bypass) {
                continue;
            }
            var button = this.buttons[i];
            //0 for off, 1 for held
            if (this.button.getState()) {
                activeButtons.push(button.getLabel(), button.getHoldTime());
            }
        }

        return activeButtons.sort(this.comparator);
    }


    update(gamepad) {

        for(var i = 0; i < gamepad.buttons.length; i++){
            this.buttons[i] = gamepad.buttons[i];
        }
        
        this.joysticks[0].update(gamepad.axes[0], gamepad.axes[1]);
        this.joysticks[1].update(gamepad.axes[2], gamepad.axes[3]);


    }
}