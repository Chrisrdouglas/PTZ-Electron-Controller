module.exports = class JoystickAxis {

    constructor(label, deadzone, range, axis, invert) {
        this.label = label;
        this.deadzone = deadzone;
        this.lastChangeTime = Date.now();
        this.value = 0;
        this.range = range; //(low, high)
        this.axis = axis;
        this.callback = [];
        this.type = "Joystick Axis"
        //if invert is provided and is true then -1
        if (invert) { this.invert = -1; }
        else { this.invert = 1; }

    }

    getType(){
        return this.type;
    }

    getLabel(){
        return this.label;
    }

    hasCallbacks(){
        return (this.callback.length > 0)
    }

    /**
     * pushes a callback onto the callback stack
     * @param {function} callback
     * @returns True if it was successfully put on the stack
     */
    pushCallback(callback){
        if (this.callback.length < 2){
            this.callback.push(callback);
            return true;
        }
        return false;
    }

    /**
     * Removes a callback from the callback stack and returns it
     * @returns the callback that has been removed. if there was no callback it just returns null
     */
    popCallback(){
        if (this.callback.length > 0){
            return this.callback.pop();
        }
        return null;
    }


    invertAxis(invert) {
        if (invert) { this.invert = -1; }
        else { this.invert = 1; }
    }

    getRawValue() {
        return this.value;
    }

    getValue() {
        //need to normalize the value between -1 and 1
        //then see if that is beyond the tollerance stored in deadzone
        if (Math.abs(this.getNormalizedValue(-1, 1)) > this.deadzone) {
            return this.invert * this.value;
        }
        return 0.0;
    }

    getNormalizedValue(low, high) { //normalizes value between low and high
        return  ((high - low) * (((this.invert * this.value) - this.range[0]) / (this.range[1] - this.range[0])) + low);
    }

    setValue(value) {
        if(this.value != value){
            this.value = value;
            if(this.callback.length > 0){
                this.callback[this.callback.length -1](this);
            }
            return true;
        }
        return false;
    }

    activeState() {
        if (Math.abs(this.value) > deadzone) {
            return true;
        }
        return false;
    }
}