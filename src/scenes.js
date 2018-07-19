// Game
Crafty.scene('Game', function() {
	// background
	Crafty.background('rgb(47, 130, 52)');

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
	this.robot = Crafty.e('Robot').at(5,10);
	// move every 1.5 seconds
	this.robot.delay(this.robot.randomMove, 1500, -1);
	// lose 10% of power every 10 seconds
	this.robot.delay(this.robot.losePower, 10000, -1);

	// Add animals
	this.sheep = Crafty.e('Sheep').at(21,3);
	this.sheep.delay(this.sheep.randomMove, 3000, -1);

	this.cow = Crafty.e('Cow').at(32,4);
	this.cow.delay(this.cow.randomMove, 2000, -1);

	this.chicken1 = Crafty.e('Chicken').at(46,6);
	this.chicken1.delay(this.chicken1.randomMove, 1000, -1).delay(this.chicken1.layEgg, 20000, -1);
	this.chicken2 = Crafty.e('Chicken').at(38,22);
	this.chicken2.delay(this.chicken2.randomMove, 1000, -1).delay(this.chicken1.layEgg, 15000, -1);
	
	// Add scenery
	for (var x = 0; x < Game.w(); x++){
		for (var y = 0; y < Game.h(); y++){
			var at_edge = ((x == 0 && y < Game.h()-6) || (x == Game.w() - 1 && y < Game.h()-6) || y == 0 || y == Game.h() - 6);
			var field_s = Game.w()/3

			// trees at edge
			if (at_edge) {
				Crafty.e('Tree').at(x,y);
				this.occupied[x][y] = true;

			// growing field
			} else if (x < field_s && y <= field_s) {
				if (x == 1) {
					if (y == 1){
						Crafty.e('Soil1').at(x,y);
					} else if (y == field_s){
						Crafty.e('Soil7').at(x,y);
					} else {
						Crafty.e('Soil4').at(x,y);
					}
				} else if (x == field_s-1) {
					if (y == 1){
						Crafty.e('Soil3').at(x,y);
					} else if (y == field_s) {
						Crafty.e('Soil9').at(x,y);
					} else {
						Crafty.e('Soil6').at(x,y);
					}
				} else if (y == 1) { 
					Crafty.e('Soil2').at(x,y);
				} else if (y == field_s) {
					Crafty.e('Soil8').at(x,y);
				} else {
					Crafty.e('Soil5').at(x,y);
				}

			// animal pens
			} else if (y == 1) {
				if (x == field_s+8) {
					Crafty.e('Fence8').at(x,y);
				} else if (x == field_s+20) {
					Crafty.e('Fence9').at(x,y);
				} else if (x == field_s) {
					Crafty.e('Fence7').at(x,y);
				} else if (x > field_s && x < field_s+20) {
					Crafty.e('Fence2').at(x,y);
				}
			} else if (y == (Game.h()/5)+5) {
				if (x == field_s+8) {
					Crafty.e('Fence11').at(x,y);
				} else if (x == field_s+20) {
					Crafty.e('Fence12').at(x,y);
				} else if (x == field_s) {
					Crafty.e('Fence10').at(x,y);
				} else if (x > field_s && x < field_s+20) {
					if (x < field_s+3 || x == field_s+10 || x == field_s+11) {
					} else{
						Crafty.e('Fence2').at(x,y);
					}
					
				}
			} else if (x == field_s || x == field_s+8 || x == field_s+20) {
				if (y > 1 && y < (Game.h()/5)+5) {
					Crafty.e('Fence4').at(x,y);
				}

			// grass
			} else if (Math.random() < 0.05 && !this.occupied[x][y]) {
				Crafty.e('Grass').at(x,y);
			// eggs
			} else if (Math.random() < 0.01 && !this.occupied[x][y]) {
				Crafty.e('Egg').at(x,y);
			} 

			// blank space at bottom
			if (y > Game.h()-6) {
				Crafty.e('Blank').at(x,y);
			}
		}
	}

	// Add machinery
	this.well = Crafty.e('Well').at(1,Game.h()-7.8);

	// Add score information
	this.bucket = Crafty.e('Bucket').at(20,Game.h()-3);
	this.egg = Crafty.e('Egg').at(23,Game.h()-3).attr({ w:48, h:48 });

	Crafty.addEvent(this.bucket, Crafty.stage.elem, this.player.KeyDown, this.bucket.fill);


	// Add score
	// this.score = Crafty.e('Score')
	// this.power = Crafty.e('Power')


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
			},
			'assets/health-bar.png': {
				tile: 202,
				tileh: 30,
				map: {
					spr_full: [0,0],
					spr_75: [0,1],
					spr_50: [0,2],
					spr_25: [0,3],
					spr_none: [0,4]
				}
			},
			'assets/farm/plowed_soil.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_soil1: [0,2],
					spr_soil2: [1,2],
					spr_soil3: [2,2],
					spr_soil4: [0,3],
					spr_soil5: [1,3],
					spr_soil6: [2,3],
					spr_soil7: [0,4],
					spr_soil8: [1,4],
					spr_soil9: [2,4]
				}
			},
			'assets/farm/grass1.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_grass: [0,0]
				}
			},
			'assets/farm/egg.png': {
				tile: 32, 
				tileh: 32,
				map: {
					spr_egg: [0,0]
				}
			},
			'assets/farm/fence.png': {
				tile: 32, 
				tileh: 32,
				map: {
					spr_fence1: [0,0],
					spr_fence2: [1,0],
					spr_fence3: [2,0],
					spr_fence4: [0,1],
					spr_fence5: [1,1],
					spr_fence6: [2,1],
					spr_fence7: [0,2],
					spr_fence8: [1,2],
					spr_fence9: [2,2],
					spr_fence10: [0,4],
					spr_fence11: [1,4],
					spr_fence12: [2,4]
				}
			},
			'assets/farm/animals/sheep_all.png': {
				tile: 129,
				tileh: 128,
				map: {
					spr_sheep5: [0,1]
				}
			},
			'assets/farm/animals/cow_all4.png': {
				tile: 96,
				tileh: 95,
				map: {
					spr_cow13: [0,3]
				}
			},
			'assets/farm/animals/chicken_all.png': {
				tile: 96,
				tileh: 96,
				map: {
					spr_chicken9: [0,2]
				}
			},
			'assets/well.png': {
				tile: 59,
				tileh: 49,
				map: {
					spr_well: [0,0]
				}
			},
			'assets/bucket.png': {
				tile: 105,
				tileh: 120,
				map: {
					spr_bucket: [0,0]
				}
			},
			'assets/bucket-empty.png': {
				tile: 105,
				tileh: 120,
				map: {
					spr_bucket_empty: [0,0]
				}
			},
			'assets/farm/tilesets/wheat.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_wheat1: [0,5],
					spr_wheat2: [1,5],
					spr_wheat3: [2,5],
					spr_wheat4: [2,0]
				}
			}
		}

	};
	Crafty.load(assetsObj);

	// Start game
	Crafty.scene('Game');
});



