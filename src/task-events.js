/**
 * Human task functions that call on previously defined components.
 */

// ANIMALS - {0=gopher, 1=butterfly, 2=snake}
var spawn_freq = [10000, 6000, 8000]; // in miliseconds
// Spawns an animal  at predefined coordinate
function spawn_animal(animal, i) {
	var coord = task_animals.getCoord(animal, i);
	if (task_animals.checkComplete(animal) == false) {
		if (animal == 0) {Crafty.e('Gopher').at(coord[0],coord[1]);}
		else if (animal == 1) {Crafty.e('Butterfly').at(coord[0],coord[1]);}
		else if (animal == 2) Crafty.e('Snake').at(coord[0],coord[1]);
	}
}
// Sets up timing of animal spawning
function animal_task(animal) {
	var num_animals = task_animals.num[animal];
	var rand_order = get_perm(num_animals);
	// wait 15 seconds to start task
	setTimeout(function() {
		var a = 0; 
		spawn_animal(animal, perm[a]);
		for (var i = 1; i < num_animals; i++) {
			setTimeout(function() {
				a++;
				spawn_gopher(animal, perm[a]);
			}, spawn_freq[animal]*i);
		}
	}, spawn_freq[animal]);
}

// HIDDEN CHEST
function chest_task() {
	setTimeout(function() {
		update_robot_text('Did you know you can break rocks with your hammer?');
	}, 13000);
};


