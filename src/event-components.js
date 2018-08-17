// Human task specific events
// generate permutation
function get_perm(len) {
	// generate ordered list
	var ordered = [];
	var used
	for (var i = 0; i < len; i++) {
		ordered.push(i);
	}
	// create permutation list
	var permutation = [];
	var size = len;
	while (size > 0) {
		var index = Math.floor(Math.random() * (size));
		permutation.push(ordered[index]);
		ordered.splice(index, 1);
		size -= 1;
	}
	return permutation;
};

// GOPHERS
function spawn_gopher(i) {
	var coord = task_funcs.gopherCoord(i);
	if (task_funcs.gopherComplete() == false){
		Crafty.e('Gopher').at(coord[0],coord[1]);
	}
};
function gopher_task() {
	// get number of gophers
	var num_gophers = task_funcs.gopher.num;
	// create permutation so order is unknown
	var perm = get_perm(num_gophers);
	// spawn gophers
	var a = 0;
	spawn_gopher(perm[a]);
	for (var i = 1; i < num_gophers; i++) {
		setTimeout(function () {
			a++;
			spawn_gopher(perm[a]);
		}, 10000*i);
	}
};
// BUTTERLIES
function spawn_butterfly(i) {
	var coord = task_funcs.butterflyCoord(i);
	var dir = task_funcs.butterflyDir(i);
	Crafty.e('Butterfly').at(coord[0],coord[1]).setDir(dir);
}
function butterfly_task() {
	// get number of butterflies
	var num_butterflies = task_funcs.butterfly.num;
	// create permutation so order is unknown
	var perm = get_perm(num_butterflies);
	// spawn butterflies
	var a = 0;
	spawn_butterfly(a);
	for (var i = 1; i < num_butterflies; i++) {
		setTimeout(function() {
			a++;
			spawn_butterfly(a);
		}, 8000*i);
	}
};
// SNAKES
function spawn_snake(i) {
	var coord = task_funcs.snakeCoord(i);
	var dir = task_funcs.snakeDir(i);
	Crafty.e('Snake').at(coord[0],coord[1]).setDir(dir);
};
function snake_task() {
	// get number of snakes
	var num_snakes = task_funcs.snake.num;
	// create permutation so order is unknown
	var perm = get_perm(num_snakes);
	// spawn snakes
	var a = 0;
	spawn_snake(a);
	for (var i = 1; i < num_snakes; i++) {
		setTimeout(function() {
			a++;
			spawn_snake(a);
		}, 9000*i);
	}
};
// HIDDEN CHEST
function chest_task() {
	var coord = task_funcs.chestGetLocation();
	// setTimeout(function() {
	// 	update_robot_text('The chest is located at ['+coord[0]+', '+coord[1]+']');
	// }, 23000);
	setTimeout(function() {
		update_robot_text('Did you know you can break rocks with your hammer?');
	}, 33000);
};


