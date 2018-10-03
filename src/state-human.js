/**
 * Contains variables pertaining to state of human. 
 * 
 * HReceptivity         Contructor function for receptivity objects. 
 * receptivity_list     Object that tracks human receptivity history.
 */

/**
 * HReceptivity - Contructor function for receptivity objects. 
 * 
 * @param {int}     requestNum      Enumerates requests (urgency, duration, effort):
 *                                      0 = no request
 *                                      1 = low urgency,  short duration,  low effort
 *                                      2 = low urgency,  long duration,   low effort
 *                                      3 = med urgency,  short duration,  low effort
 *                                      4 = med urgency,  short duration,  high effort
 *                                      5 = med urgency,  long duration,   low effort
 *                                      6 = med urgency,  long duration,   high effort
 *                                      7 = high urgency, short duration,  high effort
 *                                      8 = high urgency, long duration,   high effort
 * @param {int}     availability    Availability: 0 = helping robot, 1-4 = degree of availability
 * @param {int}     action          Action saliency: 0 = none, 1 = low, 2 = med, 3 = high
 **/
function HReceptivity (requestNum, availability, action) {
    this.val = (5-availability)/4; // value of human receptivity, time dependent
    this.availability = availability; // availability at time of alert
    this.requestNum = requestNum; // enumerated request number
    this.time_i = new Date().getTime()/1000; // time0
    this.a = action;

    // updates value of receptivity based on amount of time that has passed since request was sent
    this.updateVal = function(time_n) {
        // if no action, then the value of the 
        if (this.a == 0) {this.val = 0;}
        else {
            var time = (time_n - this.time_i)/60;
            this.val = Math.exp(-time/5) * ((5-this.availability)/4);
        }
    };
};

// Tracks history of human receptivity and current state variables. 
var receptivity_list = {
    // Receptivity history
    list: [], // contains list of receptivity objects, one for each request
    r_sum: 0.0, // sum of all receptivity objects, adjusted for time since request 

    // Current human task information
    availability: -1, // [0 = interacting, 1, 2, 3, 4]
    interacting: false, // [true, false]
    difficulty: -1, // task difficulty [0 = no task, 1 = easy, 2 = hard]
    moment: '', // moment of interruption ['break', 'middle']

    // stores new receptivity object when a request is sent
    setRequest: function(action) {
        // add receptivity object to list
        this.list.push(new HReceptivity(this.request_num, this.availability, action));
        // update current receptivity
        this.calcReceptivity();
    },
    // updates current information continuously, based on current human task
    updateState: function(interacting, difficulty, moment, r_status) {
        // save current information
        this.interacting = interacting;
        this.difficulty = difficulty;
        this.moment = moment;

        if (interacting == true) {this.availability = 0;} // already interacting with robot [0]
        else if (interacting == false) {
            if (difficulty == 0) {this.availability = 4;} // no task -- very available [4]
            // low difficulty task
            else if (difficulty == 1) {
                if (moment == 'break') {this.availability = 3;}  // breakpoint -- somewhat available [3]
                else if (moment == 'middle') {this.availability = 2;} // middle -- not very available [2]
            }
            // high difficulty taks
            else if (difficulty == 2) {
                if (moment == 'break') {this.availability = 3;} // breakpoint -- somewhat available [3]
                if (moment == 'middle') {this.availability = 1;} // middle -- unavailable [1]
            }
        }
    },
    // implements receptivity function
    calcReceptivity: function() {
        if (this.list.length != 0) { // if requests have been made
            var time = new Date().getTime()/1000; // get current time
            var r_sum = this.list.slice(-1)[0].val; // most recent receptivity value

            // loop through receptivity objects (one for each request), adjust for time passed, and add to r_sum
            for (var i = 0; i < this.list.length-1; i++) {
                var r_i = this.list[i]; // get receptivity object
                r_i.updateVal(time); // update based on amount of time since initial request
                r_sum += r_i.val; // add receptivity value to sum
            }
            this.r_sum = r_sum; // receptivity value, considering all request objects
        } else {this.r_sum = 0.0;} // if no requests have been made
    },
    // returns receptivity
    getReceptivity: function() {
        if (this.r_sum >= recep_threshold) {return 1;} // low
        else {return 2;} // high
    },
    // returns current availability
    getAvailability: function() {return this.availability;},
    // prints human state information
    printState: function() {Crafty.log(this.availability, this.interacting, this.difficulty, this.moment);}
};  
