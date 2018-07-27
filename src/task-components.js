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
		setInterval(function () {
			a++;
			spawn_gopher(a);
		}, 2000*i);
	}
};


function spawn_snakes(loc) {
	// var path1 = [ [44,10], [32,20] ];
	// var coord = options[loc];
	// Crafty.e('Gopher').at(coord[0],coord[1]);
};

