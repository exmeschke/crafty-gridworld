// Human task specific events

function spawn_gopher(loc) {
	var options = [ [44,10], [32,20] ];
	var coord = options[loc];
	Crafty.e('Gopher').at(coord[0],coord[1]);
};

function spawn_snake(loc) {
	// var path1 = [ [44,10], [32,20] ];
	// var coord = options[loc];
	// Crafty.e('Gopher').at(coord[0],coord[1]);
};