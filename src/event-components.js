// Human task specific events
// GOPHERS
function spawn_gopher(i) {
	var coord = task_funcs.gopherCoord(i);
	if (task_funcs.gopherComplete() == false){
		Crafty.e('Gopher').at(coord[0],coord[1]);
	}
};
function gopher_task() {
	var a = 0;
	spawn_gopher(a);
	for (var i = 1; i < 7; i++) {
		setTimeout(function () {
			a++;
			spawn_gopher(a);
		}, 8000*i);
	}
};
// BUTTERLIES
function spawn_butterfly(i) {
	var coord = task_funcs.butterflyCoord(i);
	var dir = task_funcs.butterflyDir(i);
	Crafty.e('Butterfly').at(coord[0],coord[1]).setDir(dir);
}
function butterfly_task() {
	var a = 0;
	spawn_butterfly(a);
	for (var i = 1; i < 8; i++) {
		setTimeout(function() {
			a++;
			spawn_butterfly(a);
		}, 5000*i);
	}
};
// SNAKES
function spawn_snake(i) {
	var coord = task_funcs.snakeCoord(i);
	var dir = task_funcs.snakeDir(i);
	Crafty.e('Snake').at(coord[0],coord[1]).setDir(dir);
};
function snake_task() {
	var a = 0;
	spawn_snake(a);
	for (var i = 1; i < 6; i++) {
		setTimeout(function() {
			a++;
			spawn_snake(a);
		}, 8000*i);
	}
};
// HIDDEN CHEST
function chest_task() {
	var coord = task_funcs.chestGetLocation();
	setTimeout(function() {
		update_robot_text('The chest is located at ['+coord[0]+', '+coord[1]+']');
	}, 23000);
	setTimeout(function() {
		update_robot_text('Did you know you can break rocks with your hammer?');
	}, 63000);
};
// BAKING
function wait_bake_bread() {eval("Crafty.e('Bread').at(Game.w()-2.8,1.8).bake();");}
function wait_bake_muffin() {eval("Crafty.e('Muffin').at(Game.w()-2.8,1.8).bake();");}

