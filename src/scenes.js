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
	this.chicken2 = Crafty.e('Chicken').at(38,20);
	this.chicken2.delay(this.chicken2.randomMove, 1000, -1).delay(this.chicken1.layEgg, 15000, -1);

	var cc = 0;
	var rr = 0;
	// Add scenery
	for (var x = 0; x < Game.w(); x++){
		for (var y = 0; y < Game.h(); y++){
			var at_edge = ((x == 0 && y < Game.h()-6) || (x == Game.w() - 1 && y < Game.h()-6) || y == 0 || y == Game.h() - 6);
			var field_s = (Game.w()/3)-2;

			// trees at edge
			if (at_edge) {
				Crafty.e('Tree').at(x,y);
				this.occupied[x][y] = true;

			// growing field
			} else if (x < field_s && y <= field_s) {
				if (x == 1) {
					if (y == 1){
						Crafty.e('Soil1').at(x,y);
						this.occupied[x][y] = true;
					} else if (y == field_s){
						Crafty.e('Soil7').at(x,y);
						this.occupied[x][y] = true;
					} else {
						Crafty.e('Soil4').at(x,y);
						this.occupied[x][y] = true;
					}
				} else if (x == field_s-1) {
					if (y == 1){
						Crafty.e('Soil3').at(x,y);
						this.occupied[x][y] = true;
					} else if (y == field_s) {
						Crafty.e('Soil9').at(x,y);
						this.occupied[x][y] = true;
					} else {
						Crafty.e('Soil6').at(x,y);
						this.occupied[x][y] = true;
					}
				} else if (y == 1) { 
					Crafty.e('Soil2').at(x,y);
					this.occupied[x][y] = true;
				} else if (y == field_s) {
					Crafty.e('Soil8').at(x,y);
					this.occupied[x][y] = true;
				} else {
					Crafty.e('Soil5').at(x,y);
					this.occupied[x][y] = true;
					if (y == 2 && (x > 3 && x < 12)) {
						Crafty.e('Wheat4').at(x,y);
					}
				}

			// animal pens
			var a = 3;
			var b = 10;
			var c = 21;
			} else if (y == 1) {
				if (x == field_s) {
					// Crafty.e('Fence8').at(x,y);
				} else if (x == field_s+c) {
					Crafty.e('Fence9').at(x,y);
					this.occupied[x][y] = true;
				} else if (x == field_s+a) {
					Crafty.e('Fence7').at(x,y);
					this.occupied[x][y] = true;
				} else if (x > field_s+a && x < field_s+c) {
					Crafty.e('Fence2').at(x,y);
					this.occupied[x][y] = true;
				}
			} else if (y == (Game.h()/5)+5) {
				if (x == field_s+b) {
					Crafty.e('Fence11').at(x,y);
					this.occupied[x][y] = true;
				} else if (x == field_s+c) {
					Crafty.e('Fence12').at(x,y);
					this.occupied[x][y] = true;
				} else if (x == field_s+a) {
					Crafty.e('Fence10').at(x,y);
					this.occupied[x][y] = true;
				} else if (x > field_s+a && x < field_s+c) {
					if (x < field_s+6 || x == field_s+12 || x == field_s+13) {
					} else{
						Crafty.e('Fence2').at(x,y);
						this.occupied[x][y] = true;
					}
					
				}
			} else if (x == field_s+a || x == field_s+b || x == field_s+c) {
				if (y > 1 && y < (Game.h()/5)+5) {
					Crafty.e('Fence4').at(x,y);
					this.occupied[x][y] = true;
				}

			// grass
			} else if (y < Game.h()-6 && Math.random() < 0.05 && !this.occupied[x][y]) {
				Crafty.e('Grass').at(x,y);
				cc+=1;
				// place treasure chest here
				if (cc == 30) {
					this.chest = Crafty.e('Chest').at(x,y);
					Crafty.log(x+y);
				}
			// eggs
			} else if (y < Game.h()-6 && Math.random() < 0.01 && !this.occupied[x][y]) {
				Crafty.e('Egg').at(x,y);
			// rocks
			} else if (y < Game.h()-7 && Math.random() < 0.005 && !this.occupied[x][y] && rr < 4) {
				this.rock = Crafty.e('Rock').at(x,y);
				rr += 1;
				if (rr == 2) {
					this.rock.hasPin();
				}
			} 

			// blank space at bottom
			if (y > Game.h()-6) {
				Crafty.e('Blank').at(x,y);
			}
		}
	}

	// Add machinery
	var scene_b = Game.h()-7.8;
	this.well = Crafty.e('Well').at(1,scene_b);
	this.bag = Crafty.e('Barrel').at(3,scene_b+.1);
	this.stump = Crafty.e('Stump').at(5,scene_b+.3);
	this.grtools = Crafty.e('GroundTools').at(6.5,scene_b+.2);
	this.book = Crafty.e('Book').at(7.8,scene_b+.7);
	this.oven = Crafty.e('Oven').at(Game.w()-3.5,1);
	// Crafty.e('Bread').at(Game.w()-2.8, 1.8);
	this.spinning_wheel = Crafty.e('SpinningWheel').at(Game.w()-5.5,1);
	// Crafty.e('Thread').at(Game.w()-5, 1.8);
	this.charging_station = Crafty.e('ChargingStation').at(16,3);
	this.bbush = Crafty.e('BerryBush').at(Game.w()-3,22);

	// Add score information
	var box_b = Game.h()-3.8;
	this.scroll = Crafty.e('Scroll').at(0,Game.h()-5);
	this.score = Crafty.e('Score').at(3,box_b+1).text('$    0.00');
	this.currTask = Crafty.e('Task').at(7,box_b+1).text('').trigger('UpdateTask');
	// this.power = Crafty.e('RobotPower').at(8,box_b+1.2);

	for (var x = 0; x < 4; x++) {
		Crafty.e('SqrBlock').at(19+(x*5),Game.h()-5);
	}
	this.box = Crafty.e('Box').at(39,Game.h()-5).attr({ w:360 });

	var st = 20.2;
	this.bucket = Crafty.e('Bucket').at(st,box_b);
	this.seed_bag = Crafty.e('SeedBag').at(st+5,box_b);
	this.tools = Crafty.e('Tools').at(st+10,box_b);
	this.lg_tools = Crafty.e('LgTools').at(st+15,box_b);

	var st2 = 40;
	this.egg = Crafty.e('Egg').at(st2,box_b-.5).attr({ w:30, h:30 });
	Crafty.e('EggLabel').at(st2+1.5,box_b).text(0);
	this.berry = Crafty.e('Wheat').at(st2,box_b+1.7).attr({ w:30, h:30 });
	Crafty.e('WheatLabel').at(st2+1.5,box_b+2).text(0);
	this.wool = Crafty.e('Wool').at(st2+3,box_b-.3).attr({ w:30, h:25 });
	Crafty.e('WoolLabel').at(st2+4.5,box_b).text(0);
	this.milk = Crafty.e('Milk').at(st2+3.2,box_b+1.5).attr({ w:20, h:40 });
	Crafty.e('MilkLabel').at(st2+4.5,box_b+2).text(0);
	this.bread = Crafty.e('Bread').at(st2+6,box_b-.4).attr({ w:40, h:30 });
	Crafty.e('BreadLabel').at(st2+8,box_b).text(0);
	this.muffin = Crafty.e('Muffin').at(st2+6.1,box_b+1.5).attr({ w:30, h:30 });
	Crafty.e('MuffinLabel').at(st2+8,box_b+2).text(0);
	this.thread = Crafty.e('Thread').at(st2+9.2,box_b-.5).attr({ w:40, h:40 });
	Crafty.e('ThreadLabel').at(st2+11,box_b).text(0);
	// this.berry = Crafty.e('Berries').at(st2,box_b+1.7).attr({ w:30, h:20 });
	// Crafty.e('BerryLabel').at(st2+1.5,box_b+2).text(0);
	

	// TUTORIAL


	// GAME

});


// Loading
Crafty.scene('Loading', function() {
	// Background
	Crafty.background('black');
	Crafty.e('2D, DOM, Color, Text')
		.text('Loading...')
		.attr({ x:0, y:Game.height()/2-24, w:Game.width() })
		.css($text_css);

	// Load audio
	Crafty.audio.add({
		alert_low: ['assets/sounds/low.mp3'],
		alert_med: ['assets/sounds/med.mp3'],
		alert_high: ['assets/sounds/high.mp3'],
		sheep: ['assets/sounds/sheep.wav'],
		cow: ['assets/sounds/cow.mp3'],
		chicken: ['assets/sounds/chicken.wav'],
		stone: ['assets/sounds/stone-crush2.mp3'],
		radar_low: ['assets/sounds/radar-low.wav'],
		radar_med: ['assets/sounds/radar-med.wav'],
		radar_high: ['assets/sounds/radar-high.wav']
	});

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
				map: { spr_player: [0,2] }
			},
			'assets/bot.gif': {
				tile: 16, 
				tileh: 18,
				map: { spr_bot: [0,0] }
			},
			'assets/health-bar.png': {
				tile: 202,
				tileh: 30,
				map: {
					spr_health1: [0,0],
					spr_health2: [1,0],
					spr_health3: [2,0],
					spr_health4: [3,0],
					spr_health5: [4,0]
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
				map: { spr_grass: [0,0] }
			},
			'assets/farm/egg.png': {
				tile: 32, 
				tileh: 32,
				map: { spr_egg: [0,0] }
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
				map: { spr_sheep5: [0,1] }
			},
			'assets/farm/animals/cow_all4.png': {
				tile: 96,
				tileh: 95,
				map: { spr_cow13: [0,3] }
			},
			'assets/farm/animals/chicken_all.png': {
				tile: 96,
				tileh: 96,
				map: { spr_chicken9: [0,2] }
			},
			'assets/farm/animals/snake.png': {
				tile: 32,
				tileh: 32,
				map: { spr_snake5: [1,1] }
			},
			'assets/well.png': {
				tile: 59,
				tileh: 49,
				map: { spr_well: [0,0] }
			},
			'assets/farm/tilesets/wheat.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_wheat1: [0,5],
					spr_wheat2: [1,5],
					spr_wheat3: [2,5],
					spr_wheat4: [1,3]
					// spr_wheat4: [1,4]
				}
			},
			'assets/farm/tilesets/wheat-bag.png': {
				tile: 32,
				tileh: 32,
				map: { spr_wheat: [0,0] }
			},
			'assets/farm/buckets.png': {
				tile: 105, 
				tileh: 120,
				map: {
					spr_bucket_empty: [0,0],
					spr_bucket_full: [1,0]
				}
			},
			'assets/farm/farm-tools.png': {
				tile: 64,
				tileh: 64,
				map: {
					spr_bag: [0,0],
					spr_shovel: [0,1],
					spr_scythe: [1,1]
				}
			},
			'assets/farm/ui/box-long.png': {
				tile: 1225,
				tileh: 314,
				map: { spr_box: [0,0] }
			},
			'assets/farm/ui/scroll.png': {
				tile: 1000,
				tileh: 274,
				map: { spr_scroll: [0,0] }
			},
			'assets/farm/ui/block.png': {
				tile: 96,
				tileh: 96,
				map: { spr_block: [0,0] }
			},
			'assets/farm/tools.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_tools1: [1,0],
					spr_tools2: [2,0]
				}
			},
			'assets/seed_bags.png': {
				tile: 105,
				tileh: 97,
				map: {
					spr_seed_bag_empty: [0,0],
					spr_seed_bag_full: [1,0]
				}
			},
			'assets/farm/barrels.png': {
				tile: 64,
				tileh: 64,
				map: { spr_barrels: [1,0] }
			},
			'assets/farm/tree-stumps.png': {
				tile: 55,
				tileh: 60,
				map: {
					spr_stump1: [0,0],
					spr_stump2: [1,0]
				}
			},
			'assets/book.png': {
				tile: 31,
				tileh: 30,
				map: { spr_book: [0,0] }
			},
			'assets/farm/chests.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_chest_closed: [0,0],
					spr_chest_open: [0,1]
				}
			},
			'assets/farm/rocks.png': {
				tile: 32,
				tileh: 32,
				map: {
					spr_rock: [0,0],
					spr_rocks: [1,0]
				}
			},
			'assets/ovenn.png': {
				tile: 64,
				tileh: 41,
				map: { spr_oven: [0,0] }
			},
			'assets/spinning-wheels.png': {
				tile: 86,
				tileh: 85,
				map: { spr_spinning_wheel: [0,0] }
			},
			'assets/wool.png': {
				tile: 25,
				tileh: 12,
				map: { spr_wool: [0,0] }
			},
			'assets/milk.png': {
				tile: 174,
				tileh: 323,
				map: { spr_milk: [0,0] }
			},
			'assets/breads.png': {
				tile: 125,
				tileh: 93,
				map: {
					spr_bread: [0,0],
					spr_ashes: [1,0]
				}
			},
			'assets/muffins.png': {
				tile: 128,
				tileh: 123,
				map: {
					spr_muffin: [0,0],
					spr_ashes: [1,0]
				}
			},
			'assets/bbushes.png': {
				tile: 256,
				tileh: 205,
				map: { 
					spr_bbush_empty: [0,0], 
					spr_bbush_full: [1,0] 
				}
			},
			'assets/berries.png': {
				tile: 256,
				tileh: 151,
				map: { spr_berries: [0,0] }
			},
			'assets/thread-blue.png': {
				tile: 32,
				tileh: 32,
				map: { spr_thread: [0,0] }
			},
			'assets/charging-station.png': {
				tile: 610,
				tileh: 750,
				map: { spr_charging_station: [0,0] }
			}
		}

	};
	Crafty.load(assetsObj);

	// Start game
	Crafty.scene('Game');
});



