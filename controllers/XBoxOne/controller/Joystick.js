const JoystickAxis = require("./JoystickAxis");

module.exports = class Joystick {
    /**
     * Constructs a joystick object.
     * @param {String} label name of the corresponding element on the controller
     * @param {flaot[]} deadzone list of two numbers that represent how much of the joystick is ignored
     * @param {float[]} xRange list of two numbers that says what the min and max values for the x axis are in that order
     * @param {*} yRange list of two numbers that says what the min and max values for the y axis are in that order
     */
    constructor(label, deadzone, ranges, axes, inverts) {
        this.label = label;

        //if no deadzone given then set it to 10% for both axes
        if (!deadzone) { deadzone = [.1, .1]; }
        this.X = new JoystickAxis('X', deadzone[0], ranges[0], axes[0], inverts[0]);
        this.Y = new JoystickAxis('Y', deadzone[1], ranges[1], axes[1], inverts[1]);
        this.lastChangeTime = Date.now();
        this.high = 1;
        this.low = -1;
        this.activeCallback;
        this.activeNormalizedCallback;
        this.activeYCallback;
    }

    getLabel(){
        return this.label;
    }

    getValue() {
        return [this.X.getValue(), this.Y.getValue()]
    }

    getValueNormalized() { //good for if you want to normalize your values between 0 and 1 or 0 and 255
        return [this.X.getNormalizedValue(this.low, this.high), this.X.getNormalizedValue(this.low, this.high)]
    }

    setXDeadzone(deadzone) {
        this.X.setDeadzone(deadzone);
    }

    setYDeadzone(deadzone) {
        this.Y.setDeadzone(deadzone);
    }
    
    setNormalizationRange(low, high){
        this.low = low;
        this.high = high;
    }

    update(x, y) {
        this.X.setValue(x);
        this.Y.setValue(y);
        this.updateState();
    }

    setActiveCallback(callback) {
        this.activeCallback = callback
    }

    updateState() {
        if (this.activeCallback) {
            this.activeCallback(this);
        }
    }
}