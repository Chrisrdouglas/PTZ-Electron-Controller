module.exports = class Button{
    
    constructor(label){
        this.label = label;
        this.value = 0;
        this.state = 0; // 0 for off, 1 for held. being pressed makes it fire a callback
        this.lastDownTime = Date.now();
        this.lastUpTime = Date.now();

        this.onDownCallback = []; //fires anytime the button goes from 0 to not 1
        this.onUpCallback = []; //fires anytime the button value goes from not 1 to 0
        this.pressCallback = []; //callback for a quick press action
        this.holdCallback = []; //callback for a hold action


        this.type = "Button";
        const PRESSCONDITION = 30; //time in ms that a button needs to be lifted for it to be considered pressed
        // in adition to that, it's the time in ms that the difference between the down time and up time that says if a button is being held
    }

    /**
     * Checks to see what the state of the button is. 0 for off, 1 for held.
     * @returns The state of the button being pressed.
     */
    getState(){
        if (value == 0){
            return 0;
        }
        else{
            var deltaT = this.lastDownTime - this.lastUpTime;
            //check if pressed
            if (delta > PRESSCONDITION){

            }
        }
        return 0;
    }

/**
 * Let this button know if it's actually a trigger. Might need to make a seperate trigger class later.
 * @param {boolean} i indicator determining if this button is actually a trigger
 */
    setTrigger(i){
        if(i){
            this.type = "Trigger";
        }
        else{
            this.type = "Button";
        }

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

    pushPressCallback(callback){
        this.pressCallback.push(callback);
    }
    
    popPressCallback(){
        return this.pressCallback.shift();
    }

    pushHoldCallback(callback){
        this.holdCallback.push(callback);
    }

    popHoldCallback(){
        return this.holdCallback.pop();
    }

    pushOnDownCallback(callback){
        this.onDownCallback.push(callback);
    }

    popOnDownCallback(){
       return this.onDownCallback.shift();
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
    setValue(value){
        if (this.value != value){
            this.value = value;
            if (value == 0){
                this.lastUpTime = Date.now();
                var deltaT = this.lastUpTime - this.lastDownTime;
                if(this.pressCallback && (this.lastDownTime - this.lastUpTime) < PRESSCONDITION){ //if pressed for less than 30 ms
                    this.pressCallback(this);
                }
            }
            else{
                this.lastDownTime = Date.now();
                //start watching to see if button is being held for longer than 30 ms
                //if it is then fire the holdCallback
            }
        }
    }
}