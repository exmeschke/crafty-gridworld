/**
 * Contains variables pertaining to state of world.
 * 
 * Episode          Contructor function for MDP episode. 
 * state_list       Stores history of states visited.
 */

// Episode - Contructor function for MDP episode. 
function Episode() {
    this.progression = []; // state progression
    this.currState = 19; // [1:19]
    this.startState = -1; // [1:16]
    this.negState = 0; // experienced negative state

    this.addState = function(stateIndex) {
        if (stateIndex <= 16 && this.startState == -1) {this.startState = stateIndex;}
        if (stateIndex == 18) {this.negState = 1;}
        this.progression.push(stateIndex);
    };
};

// Stores history of states visited
var state_list = {
    list: [19], // stores all states
    episodes: [], // stores all episodes

    // Current state variables
    currEpisode: new Episode(), // current episode, pushed to this.episodes once complete

    // updates world state
    updateCurrState: function(receptivity, urgency, duration, effort) {
        var curr_state = -1;

        // starting states 1-16
        if (receptivity == 1 || receptivity == 2) {
            if (urgency == 1) { // low urgency
                if (duration == 1 && effort == 1) { // short duration & low effort
                    if (receptivity == 1) {curr_state = 1;} // low receptivity
                    else {curr_state = 2;} // high receptivity
                }
                else if (duration == 2 && effort == 1) { // long duration & low effort
                    if (receptivity == 1) {curr_state = 3;} // low receptivity
                    else {curr_state = 4;} // high receptivity
                }
            }
            else if (urgency == 2) { // med urgency
                if (duration == 1) { // short duration
                    if (effort == 1) { // low effort 
                        if (receptivity == 1) {curr_state = 5;} // low receptivity
                        else {curr_state = 6;} // high receptivity
                    }
                    else if (effort == 2) { // high effort
                        if (receptivity == 1) {curr_state = 7;} // low receptivity
                        else {curr_state = 8;} // high receptivity
                    }
                }
                else if (duration == 2) { // long duration
                    if (effort == 1) { // low effort 
                        if (receptivity == 1) {curr_state = 9;} // low receptivity
                        else {curr_state = 10;} // high receptivity
                    }
                    else if (effort == 2) { // high effort
                        if (receptivity == 1) {curr_state = 11;} // low receptivity
                        else {curr_state = 12;} // high receptivity
                    }
                }
            }
            if (urgency == 3) { // high urgency
                if (duration == 1 && effort == 2) { // short duration & low effort
                    if (receptivity == 1) {curr_state = 13;} // low receptivity
                    else {curr_state = 14;} // high receptivity
                }
                else if (duration == 2 && effort == 2) { // long duration & low effort
                    if (receptivity == 1) {curr_state = 15;} // low receptivity
                    else {curr_state = 16;} // high receptivity
                }
            }            
        // non-starting states 17-19
        } else {
            if (urgency == 17) {curr_state = 17;} // interacting
            else if (urgency == 18) {curr_state = 18;} // out of operation
            else if (urgency == 19) {curr_state = 19;} // terminal state
        }

        // add to state histories
        if (this.list.slice(-1)[0] != curr_state) {
            if (curr_state == 19) { // terminal state
                this.episodes.push(this.currEpisode); // save episode
                this.currEpisode = new Episode();
            }
            this.list.push(curr_state);
            this.currEpisode.addState(curr_state); 
            Crafty.log('states: '+this.list);
        }
    }
};
