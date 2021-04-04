module.exports = class SpeedFunctions{
    constructor() {}

    getSpeedFunctionByName(speedFunctionName){
        if(speedFunctionName){
            switch (speedFunctionName){
                case "linear":
                    return (x, m, b) => {this.linear(x, m, b);};
                case "step":
                    return (x, numSteps) => {this.step(x, numSteps);};
                case "quadratic":
                    return (x, a, b, c) => {this.quadratic(x, a, b, c);};
                default:
                    return (x) => {this.default(x);};
            }
        }
        return (x) => {this.default(x);}; // could just use linear with (x, 1, 0)
    }

    /**
     * 
     * @param {float} x A value for x 
     * @returns x
     */
    default(x){
        return x;
    }

    /**
     * Your standard
     * @param {float} x percentage
     * @param {object} functionParams function paramaters defined in ./configure.json
     * @param {float} c scale
     * @param {float} b y-intercept
     * @returns float, f(x) = m*x+b
     */
    linear(x, functionParams){
        var m = 1;
        var b = 0;
        if (functionParams.m){ m = functionParams.m;}
        if (functionParams.b){ b = functionParams.b;}
        return m*x+b;
    }

    /**
     * Uses the Math.floor function. Increasing the step size increases the sensitivity.
     * A shift of .5 is recommended.
     * @param {float} x 
     * @param {object} functionParams function paramaters defined in ./configure.json
     * @param {int} functionParams.numSteps Step size. Defaults to 100
     * @param {float} functionParams.shift shifts function to the left or right. For example: +5 will shift function to the left. Defaults to 0.
     * @returns floor(x*steps + shift)/steps
     */
    step(x, functionParams){
        var numSteps = 100;
        var shift = 0;
        if (functionParams.numSteps){ numSteps = functionParams.numSteps;}
        if (functionParams.shift){ shift = functionParams.shift;}
        return Math.floor(x*numSteps+shift)/numSteps;
    }

    /**
     * 
     * @param {float} x percentage of controller maximum
     * @param {object} functionParams function paramaters defined in ./configure.json
     * @param {float} functionParams.a scale for x^2 term. Defaults to 1
     * @param {float} functionParams.b scale for x term. Defaults to 1
     * @param {float} functionParams.c y-intercept. Defaults to 0
     */
    quadratic(x, functionParams){
        var a = 1.0;
        var b = 1.0;
        var c = 0.0
        if (functionParams.a) {a = functionParams.a;}
        if (functionParams.b) {b = functionParams.b;}
        if (functionParams.c) {c = functionParams.c;}
        return a*x*x + b*x + c;
    }

};