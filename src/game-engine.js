/**
 * Contains game engine that controls the selection of robot requests. 
 * 
 * state_list       Stores history of states visited.
 */

// tracks requests that have been sent
var request_list = {
    sent: [], // list of request objects sent
    currReq: '', // current request object

    // choose which request to send
    selectRequest: function() {
    	return getRandomInt(1, 15);
    }, 
    // save new currReq and update state information
    addRequest: function() {
    	// select new request
    	var requestNum = this.selectRequest();
    	// update current request
        this.currReq = newRequest(requestNum); 
        this.currReq.setReceptivity(receptivity_list.getReceptivity());
        // update state information
        state_list.updateCurrState(this.currReq.receptivity, this.currReq.urgency, this.currReq.duration, this.currReq.effort);        
    },
    // indicates most recent request received a response
    receivedResponse: function() {this.currReq.setResponded();},
    // alert for request is over
    endRequest: function(h_responded, r_status) { 
        if (r_status == 2) { 
            if (h_responded == true) {request_list.updateCurrState(0,17,0,0);} // person is interacting
            else {request_list.updateCurrState(0,19,0,0);} // completed task, fully operational
        } 
        else {request_list.updateCurrState(0,18,0,0);} // robot not fully operational
    },

    // getters
    getNumber: function() {return this.currReq.number;},
    getAction: function() {
        // grab current request information
        var state_curr = this.curr_state-1; // -1 indexing
        var doAction = -1;
        epsilon = Math.min(1, 1/(0.075*n_trials)); // exploration rate, >= 0.2
        // do a random action if no best option
        if (epsilon == 1 || (Q_table[state_curr][0]==Q_table[state_curr][1]) && (Q_table[state_curr][1]==Q_table[state_curr][2]) && (Q_table[state_curr][2]==Q_table[state_curr][3])) {
            var doAction = Math.floor(Math.random() * 4);
        } else {
            // find the highest Q value action
            var maxAction = 0;
            for (var j = 1; j < actions; j++) {
                if (Q_table[state_curr][j]/n_table[state_curr][j] > Q_table[state_curr][maxAction]/n_table[state_curr][maxAction]) {
                    maxAction = j;
                }
            }
            // determine whether to explore or optimize
            var rand = Math.random();
            // explore
            if (rand < epsilon) { 
                var non_maxAction = [];
                for (j = 0; j < actions; j++) { // determine options
                    if (j != maxAction) {
                        non_maxAction.push(j);
                    }
                }
                // choose random from non max actions
                var exploreAction = Math.floor(Math.random() * 3);
                doAction = exploreAction;
            // go with best action
            } else {
                doAction = maxAction;
            }      
        }
        // update request object action
        this.currReq.setDoAction(doAction);
        this.sent.push(this.currReq);
        // indicate request is sent, updates receptivity
        receptivity_list.setRequest(this.currReq.number, doAction);
        // return action to perform
        n_trials += 1;
        return doAction;
    }
};
    
    