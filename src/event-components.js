// Human task specific events
// GOPHERS
function spawn_gopher(i) {
	var coord = task_funcs.gopherCoord(i);
	if (task_funcs.gopherComplete() == false){
		Crafty.e('Gopher').at(coord[0],coord[1]);
	}
}
function gopher_task() {
	var a = 0;
	spawn_gopher(a);
	for (var i = 1; i < 6; i++) {
		setTimeout(function () {
			a++;
			spawn_gopher(a);
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
	var a = 0;
	spawn_butterfly(a);
	for (var i = 1; i < 8; i++) {
		setTimeout(function() {
			a++;
			spawn_butterfly(a);
		}, 5000*i);
	}
}

// SNAKES
function spawn_snake() {
	Crafty.e('Snake').at(coord[0],coord[1]).setDir('up');
};
function snake_task() {

}

// HIDDEN CHEST


// Robot requests
// 