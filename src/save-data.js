/**
 * Saves relevant information after each episode is completed.  
 * 
 * MDP      [startTime, endTime, startState, action, stateProgression, reward, taskNum, dist, rawReceptivity, availability]
 *              startTime = time request sent
 *              endTime = time request ended
 *              startState = starting state, indicates request type
 *              stateProgression = progression of states in episode
 *              reward = reward received for action + response
 *              taskNum = 
 *              dist = distance between robot and human
 *              rawReceptvitiy = raw receptivity value, ignoring threshold for 'low' vs 'high'
 *              availability = availability at time of request
 *
 * saveHInfo            Saves general information at time request is sent. 
 * calculateReward      Calculates the reward based on current request information.
 * updateQ              Updates Q-table based on state and action, saved at terminal state.
 */

// MDP values
var MDP = []; // starting_state [1:16], action [1:4], h_responded [true, false], reward 
for (var i = 0; i < 50; i++) {MDP[i] = new Array(10);}
MDP[0][0] = recep_threshold;
var n_episodes = 1; // number of rows
var n_save = 10; // number of columns

// Current episode information
var curr_episode = '';

/**
 * saveHInfo - Saves general information at time request is sent. 
 * 
 * @param {str}     time            The time of request.
 * @param {int}     task            The enumerated task.
 * @param {doubl}   dist            Distance between human and robot. 
 **/
function saveHInfo(time, task, dist) {
    curr_episode = new Array(n_save);

    curr_episode[0] = time;
    curr_episode[6] = task;
    curr_episode[7] = dist;
    var receptivity_raw = receptivity_list.r_sum;
    curr_episode[8] = receptivity_raw;
    var availability = receptivity_list.availability;
    curr_episode[9] = availability;
}; 

/**
 * calculateReward - Calculates the reward based on current request information.
 **/
function calculateReward() {
    // curr request information
    var request = request_list.curr_req;
    var action = request.doAction; // action enumerated = j
    var urgency = request.urgency;
    var received_resp = request.responded;
    var duration = request.duration;
    var effort = request.effort;
    var receptivity = request.receptivity;

    var r = 0.0;
    if (action == 0) {  // no action
        r = -1 * (0.5*(urgency-1) + neg_state);
    } else { // some action
        var rR = (0.85*urgency*received_resp) - (0.25*urgency + neg_state);
        var rH = (0.25*duration*effort*received_resp + (action/3)) / (receptivity*urgency);
        r = rR - rH;
    }
    return r;
};

/**
 * updateQ - Updates Q-table based on state and action, saved at terminal state.
 * 
 * @param {str}     time            The time request is completed.
 **/
function updateQ(time) {
    // curr episode
    var episode = state_list.currEpisode; // state enumerated = i
    var states = episode.progression; 
    var start_state = episode.startState;
    var neg_state = episode.negState;
    var curr_state = state_list.list.slice(-1)[0];
    
    // calculate reward
    var r = calculateReward();
    
    // only save data if terminal state
    if (curr_state == 19) {
        // index Q table
        var state = start_state-1; // -1 to account for indices starting at 0
        var action = request_list.curr_req.doAction;
        // update Q table
        Q_table[state][action] += r; 
        n_table[state][action] += 1;

        // add to episode information 
        curr_episode[1] = time;
        curr_episode[2] = start_state;
        curr_episode[3] = action;
        curr_episode[4] = states.toString();
        curr_episode[5] = r;

        if (n_episodes > 1) {
            // prevent double entries
            if (curr_episode[0] != MDP[n_episodes-1][0]) {
                // add to MDP
                Crafty.log('episode reward = '+r);
                for (var i = 0; i < n_save; i++) {
                    MDP[n_episodes][i] = curr_episode[i];
                }
                n_episodes += 1;
            }
        } else {
            // add to MDP
            Crafty.log('episode reward = '+r);
            for (var i = 0; i < n_save; i++) {
                MDP[n_episodes][i] = curr_episode[i];
            }
            n_episodes += 1;
        }
    }
};

