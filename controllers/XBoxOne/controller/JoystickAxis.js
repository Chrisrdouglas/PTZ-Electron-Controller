module.exports = class JoystickAxis {

    constructor(label, deadzone, range, axis, invert) {
        this.label = label;
        this.deadzone = deadzone;
        this.lastChangeTime = Date.now();
        this.value = 0;
        this.range = range; //(low, high)
        this.axis = axis;
        this.callback = null;
        //if invert is provided and is true then -1
        if (invert) { this.invert = -1; }
        else { this.invert = 1; }

    }

    setCallback(callback){
        this.callback = callback;
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
        if (Math.abs(this.getNormalizedValue(-1, 1)) > deadzone) {
            return this.invert * this.value;
        }
        return 0.0;
    }

    getNormalizedValue(low, high) { //normalizes value between low and high
        return this.invert * (high - low) * (this.value - range[0]) / (range[1] - range[0]) + low;
    }

    setValue(value) {
        this.value = value;
        if(this.callback){
            this.callback(this);
        }
    }

    activeState() {
        if (Math.abs(this.value) > deadzone) {
            return true;
        }
        return false;
    }
}