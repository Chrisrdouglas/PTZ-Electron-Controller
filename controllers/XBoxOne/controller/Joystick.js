const JoystickAxis = require("./JoystickAxis");

module.exports = class Joystick {
    /**
     * Constructs a joystick object.
     * @param {String} label name of the corresponding element on the controller
     * @param {flaot[]} deadzone list of two numbers that represent how much of the joystick is ignored
     * @param {float[]} range list of two numbers that says what the min and max values for the axes are in that order
     * @param {float[]} axes list of two numbers that says what the index of this axis is on the gamepad object
     * @param {boolean[]} inverts list of two bools that says if this axis needs to be inverted or not
     */
    constructor(label, deadzone, ranges, axes, inverts) {
        this.label = label;
        this.type = "Joystick"
        //if no deadzone given then set it to 10% for both axes
        if (!deadzone) { deadzone = [.1, .1]; }
        this.X = new JoystickAxis(label+',X', deadzone[0], ranges[0], axes[0], inverts[0]);
        this.Y = new JoystickAxis(label+',Y', deadzone[1], ranges[1], axes[1], inverts[1]);
        this.lastChangeTime = Date.now();
        this.high = 1;
        this.low = -1;
        this.callback = [];
        this.onChangeCallback = [];
    }

    getLabel() {
        return this.label;
    }

    getType(){
        return this.type;
    }

    getValue() {
        return [this.X.getValue(), this.Y.getValue()];
    }

    getRawValue(){
        return [this.X.getRawValue(), this.Y.getRawValue()];
    }

    getAxis(label){
        return this[label];
    }

    fireChangeCallback(){
        if(this.onChangeCallback.length > 0 && this.onChangeCallback[this.onChangeCallback.length - 1])
        {
            this.onChangeCallback[this.onChangeCallback.length - 1](this);
        }
    }

    pushChangeCallback(callback){
        this.onChangeCallback.push(callback);
    }
    
    popChangeCallback(){
        return this.onChangeCallback.shift();
    }

    /**
     * Gets the axes values and returns it as a list but normalizes the values between low and high.
     * If no low or high are provided then uses the default values of -1 and 1. those defaults can be
     * changed with the setNormalizationRange function.
     * @param {float} low the high value in the range that you want the controller value normalized
     * @param {float} high the high value in the range that you want the controller value normalized
     * @returns list of normalized values between low and high
     */
    getValueNormalized(low, high) { //good for if you want to normalize your values between 0 and 1 or 0 and 255
        if (!low && !high) {
            return [this.X.getNormalizedValue(this.low, this.high), this.Y.getNormalizedValue(this.low, this.high)]
        }
        return [this.X.getNormalizedValue(low, high), this.Y.getNormalizedValue(low, high)]

    }
    /**
     * takes a float and sets that as the deadzone for the joystick on the X axis.
     * @param {float} deadzone float value that is greater than the min value but lower than the max value of the axis
     */
    setXDeadzone(deadzone) {
        this.X.setDeadzone(deadzone);
    }

    /**
     * takes a float and sets that as the deadzone for the joystick on the X axis.
     * @param {float} deadzone float value that is greater than the min value but lower than the max value of the axis
     */
    setYDeadzone(deadzone) {
        this.Y.setDeadzone(deadzone);
    }

    /**
     * Overrides the defaults of -1 and 1 for the low and high values when computing the normalized value of the joysticks
     * @param {float} low the low value on the normalization range
     * @param {float} high the high value on the normalization range
     */
    setNormalizationRange(low, high) {
        this.low = low;
        this.high = high;
    }

    /**
     * Takes the raw joystick values and passes it to the respective Joystick Axis. The Axes will fire callbacks if they have them.
     * If the axes do not have callbacks then the this joystick can fire the callback on the top of the stack
     * @param {float} x the raw value of the joystick's x value
     * @param {float} y the raw value of the joystick's y value
     */
    update(x, y) {
        if (this.X.setValue(x) || this.Y.setValue(y)){
            this.fireChangeCallback();
        }
        //if this has callbacks and the children axes do not have callbacks then fire this one
        if (this.callback.length > 0 && !this.X.hasCallbacks() && !this.Y.hasCallbacks()) {
            this.callback[this.callback.length - 1](this); //fires callback on top of the stack
        }
    }

    /**
     * pushes a callback onto the stack. There's only room for two callbacks.
     * @param {function} callback callback function to be pushed onto the stack
     * @returns true if there was room and it was pushed. otherwise false.
     */
    pushCallback(callback) {
        if (this.callback.length < 2) {
            this.callback.push(callback);
            return true;
        }
        return false;
    }

    /**
     * Checks the stack for callbacks and pops the top most one
     * @returns the callback that was on top of the stack. if no callback then null
     */
    popCallback() {
        if (this.callback.length) { // length > 0
            return this.callback.pop();
        }
        return null;
    }

    /**
     * pushes a callback onto a specific axis' stack. There's only room for two callbacks.
     * @param {string} axis label of the axis that is getting a callback
     * @param {function} callback callback function to be pushed onto the stack
     * @returns true if there was room and it was pushed. otherwise false.
     */
    pushCallbackAxis(axis, callback) {
        return this[axis].pushCallback(callback);
    }

    /**
     * Checks the stack for callbacks and pops the top most one
     * @returns the callback that was on top of the stack. if no callback then null
     */
    popCallbackAxis(axis) {
        return this[axis].popCallback();
    }
}