// Game
Crafty.scene('Game', function() {
	// background
	Crafty.background('rgb(87, 109, 20)');

	// A 2D array of occupied tiles
	this.occupied = new Array(Game.w());
	for (var i = 0; i < Game.w(); i++) {
		this.occupied[i] = new Array(Game.h());
		for (var j = 0; j < Game.h(); j++) {
			this.occupied[i][j] = false;
		}
	}
	// Add player
	this.player = Crafty.e('Player').at(24, 16).ignoreHits('Solid');
	this.occupied[this.player.atX()][this.player.atY()] = true;

	// Add robot
	this.robot = Crafty.e('Robot').at(1,1);
	// move every 1.5 seconds
	this.robot.delay(this.robot.randomMove, 1500, -1);
	// lose 10% of power every 10 seconds
	this.robot.delay(this.robot.losePower, 10000, -1);
	
	// Add obstacles
	for (var x = 0; x < Game.w(); x++){
		for (var y = 0; y < Game.h(); y++){
			var at_edge = (x == 0 || x == Game.w() - 1 || y == 0 || y == Game.h() - 1);

			if (at_edge) {
				Crafty.e('Tree').at(x,y);
				this.occupied[x][y] = true;
			} else if (Math.random() < 0.01 && !this.occupied[x][y]) {
				Crafty.e('Bush').at(x,y);
				this.occupied[x][y] = true;
			}
		}
	}

	// Add resources
	for (var x = 0; x < Game.w(); x++) {
		for (var y = 0; y < Game.h(); y++) {
			if (Math.random() < 0.01 && !this.occupied[x][y]) {
				Crafty.e('SmallResource').at(x,y);
				this.occupied[x][y] = true;
			} else if (Math.random() < 0.01 && !this.occupied[x][y]) {
				Crafty.e('MedResource').at(x,y);
				this.occupied[x][y] = true;
			} else if (Math.random() < 0.005 && !this.occupied[x][y]) {
				Crafty.e('BigResource').at(x,y);
				this.occupied[x][y] = true;
			}
		}
	}
});


// Loading
Crafty.scene('Loading', function() {
	// Background
	Crafty.background('black');
	Crafty.e('2D, DOM, Color, Text')
		.text('Loading...')
		.attr({ x:0, y:Game.height()/2-24, w:Game.width() })
		.css($text_css);

	// Load sprite map
	var assetsObj = {
		'sprites': {
			'assets/16x16_forest_1.gif': {
				tile: 16,
				tileh: 16,
				map: {
					spr_tree: [0,0],
					spr_bush: [1,0],
				}
			},
			'assets/hunter.png': {
				tile: 16,
				tileh: 18,
				map: {
					spr_player: [0,2],
					spr_player_up: [0,0],
					spr_player_right: [0,1],
					spr_player_down: [0,3]
				}
			},
			'assets/bot.gif': {
				tile: 16, 
				tileh: 18,
				map: {
					spr_bot: [0,0]
				}
			}
		}
	};
	Crafty.load(assetsObj);

	// Start game
	Crafty.scene('Game');
	
});



