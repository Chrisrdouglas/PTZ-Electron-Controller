module.exports = class Button{
    
    constructor(label){
        this.label = label;
        this.value = 0;
        this.state = 0; // 0 for off, 1 for held. being pressed makes it fire a callback
        this.lastDownTime = Date.now();
        this.lastUpTime = Date.now();
        this.lastHoldReleaseTime = Date.now();

        this.onDownCallback = []; //fires anytime the button goes from 0 to not 1
        this.onUpCallback = []; //fires anytime the button value goes from not 1 to 0
        this.onPressCallback = []; //callback for a quick press action
        this.onHoldCallback = []; //callback for a hold action
        this.onHoldReleaseCallback = [];

        this.holdWatch = null;
        this.type = "Trigger";
        this.PRESSCONDITION = 500; //time in ms that a button needs to be lifted for it to be considered pressed
        // in adition to that, it's the time in ms that the difference between the down time and up time that says if a button is being held
    }

    getLabel(){
        return this.label;
    }

    /**
     * Checks to see what the state of the button is. 0 for off, 1 for held.
     * @returns The state of the button being pressed.
     */
    getState(){
        return this.state;
    }

    /**
     * Returns a value between 0 and 1. A standard button will return 0 or 1 but triggers
     * are considered buttons as well and will return a value between 0 and 1 inclusive.
     * @returns The raw value of the button.
     */
    getValue(){
        return this.value;
    }

    getHoldTime(){
        return Date.now() - this.lastDownTime;
    }

    firePressCallback(){
        if(this.onPressCallback.length > 0 && this.onPressCallback[0])
        {
            this.onPressCallback[0](this);
        }
    }

    pushPressCallback(callback){
        this.pressCallback.push(callback);
    }
    
    popPressCallback(){
        return this.pressCallback.shift();
    }

    fireHoldCallback(){
        if(this.onHoldCallback.length > 0 && this.onHoldCallback[0])
        {
            this.onHoldCallback[0](this);
        }
    }

    pushHoldCallback(callback){
        this.holdCallback.push(callback);
    }

    popHoldCallback(){
        return this.holdCallback.pop();
    }

    fireHoldReleaseCallback(){
        this.lastHoldReleaseTime = Date.now();
        if(this.onHoldReleaseCallback.length > 0 && this.onHoldReleaseCallback[0])
        {
            this.onHoldReleaseCallback[0](this);
        }
    }

    pushHoldReleaseCallback(callback){
        this.holdReleaseCallback.push(callback);
    }

    popHoldReleaseCallback(){
        return this.holdReleaseCallback.pop();
    }

    fireOnDownCallback(){
        if(this.onDownCallback.length > 0 && this.onDownCallback[0])
        {
            this.onDownCallback[0](this);
        }

    }

    pushOnDownCallback(callback){
        this.onDownCallback.push(callback);
    }

    popOnDownCallback(){
       return this.onDownCallback.shift();
    }

    fireOnUpCallback(){
        if(this.onUpCallback.length > 0 && this.onUpCallback[0])
        {
            this.onUpCallback[0](this);
        }
    }

    pushOnUpCallback(callback){
        this.onUpCallback.push(callback);
    }

    popOnUpCallback(){
        return this.onUpCallback.shift();
    }

    /**
     * updates this button's value.
     * @param {float} value The value of the button or trigger being pressed
     */
    update(value){
        if(this.value == 0 && value > 0){
            //going from unpressed to pressed
            this.fireOnDownCallback();
        }
        else if (this.value > 0 && value == 0){
            this.fireOnUpCallback();
        }
        if (this.value != value){
            this.value = value;
            if (value == 0){
                //if the button is wating to see if it's being held then stop that timer
                if(this.holdWatch){
                    clearTimeout(this.holdWatch);
                    this.holdWatch = null;
                }
                //if the button is in the held state then transition it to the unheld state
                if(this.state == 1){
                    this.state = 0;
                    this.fireHoldReleaseCallback();
                }
                this.lastUpTime = Date.now();
                var deltaT = this.lastUpTime - this.lastDownTime
                if(deltaT < this.PRESSCONDITION && (Date.now() - this.lastHoldReleaseTime) > 15){
                    this.firePressCallback();
                }
            }
            else{
                this.lastDownTime = Date.now();
                //start watching to see if button is being held for longer than 30 ms
                //if it's already in the held state then we dont want to start another timer
                if(!this.holdWatch && this.state != 1){
                    this.holdWatch = setTimeout( () => {
                        this.state = 1;
                        this.fireHoldCallback();
                        this.holdWatch = null;
                        }, this.PRESSCONDITION);
                }
                
                //if it is then fire the holdCallback
            }
        }
    }
}