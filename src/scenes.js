/**
 * Constructs the scenes -- Loading, Game, EndGame
 *
 * Loading		Loads the audio and sprite sheets
 * Game 		Adds Crafty components to the scene
 * EndGame		End game screen
 **/


// Loads the audio and sprite sheets
Crafty.scene('Loading', function() {
	// Background
	Crafty.background('white');
	// Crafty.background('url(assets/screen1.png) no-repeat center center');
	// setTimeout(function() {eval("Crafty.background('url(assets/screen2.png) no-repeat center center');");}, 2000);
	// setTimeout(function() {eval("Crafty.background('url(assets/screen3.png) no-repeat center center');");}, 2000);

	Crafty.e('2D, DOM, Color, Text')
		.text("Try to make as much money as possible! Use the arrow keys to move and 'X' to trigger actions.")
		.attr({ x:0, y:Game.height()/2-24, w:Game.width() })
		.css($text_css);

	// Load audio files
	Crafty.audio.add({
		alert_low: ['assets/sounds/low.mp3'],
		alert_med: ['assets/sounds/med.mp3'],
		alert_high: ['assets/sounds/high.mp3'],
		beep_low: ['assets/sounds/beep-low.wav'],
		beep_med: ['assets/sounds/beep-med.wav'],
		beep_high: ['assets/sounds/beep-high.wav'],
		sheep: ['assets/sounds/sheep.wav'],
		cow: ['assets/sounds/cow-moo.mp3'],
		chicken: ['assets/sounds/chicken-clucking.wav'],
		crow: ['assets/sounds/crow.wav'],
		stone: ['assets/sounds/stone-crush2.mp3'],
		whack: ['assets/sounds/whack.wav'],
		well_water: ['assets/sounds/well-water2.wav'],
		water: ['assets/sounds/water.wav'],
		grain: ['assets/sounds/grain2.wav'],
		rustle: ['assets/sounds/rustle.wav'],
		oven: ['assets/sounds/oven-ding.wav'],
		oven25: ['assets/sounds/oven-ding25.wav'],
		ticking: ['assets/sounds/ticking-countdown.wav'],
		cha_ching: ['assets/sounds/cha-ching.wav'],
		correct_beep: ['assets/sounds/correct-beep.wav'],
		robot_error: ['assets/sounds/robot-error.wav']
	});

	// Load sprites (images)
	// 'sprite sheet:' {	
	// 		tile: width of each sprite in sprite sheet,
	// 		tileh: height of each sprite in sprite sheet,
	//		map: specifies location [x,y] of each sprite in sprite sheet
	// }
	var assetsObj = {
		'sprites': {
			'assets/16x16_forest_1.gif': {
				tile: 16, tileh: 16,
				map: { spr_tree: [0,0] }
			},
			'assets/hunter.png': {
				tile: 16, tileh: 18,
				map: { spr_player: [0,2] }
			},
			'assets/bots-alerts.png': {
				tile: 128, tileh: 144,
				map: { 
					spr_bot: [0,0],
					spr_bot_fire: [0,1]
				}
			},
			'assets/health-bar.png': {
				tile: 202, tileh: 30,
				map: {
					spr_health1: [0,0],
					spr_health2: [1,0],
					spr_health3: [2,0],
					spr_health4: [3,0],
					spr_health5: [4,0]
				}
			},
			'assets/farm/plowed_soil.png': {
				tile: 32, tileh: 32,
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
				tile: 32, tileh: 32,
				map: { spr_grass: [0,0] }
			},
			'assets/farm/grass3.png': {
				tile: 32, tileh: 32,
				map: { spr_grass2: [0,0] }
			},
			'assets/farm/egg.png': {
				tile: 32, tileh: 32,
				map: { spr_egg: [0,0] }
			},
			'assets/farm/fence.png': {
				tile: 32, tileh: 32,
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
				tile: 129, tileh: 128,
				map: { spr_sheep5: [0,1] }
			},
			'assets/farm/animals/cow_all4.png': {
				tile: 96, tileh: 95,
				map: { spr_cow13: [0,3] }
			},
			'assets/farm/animals/chicken_all.png': {
				tile: 96, tileh: 96,
				map: { spr_chicken9: [0,2] }
			},
			'assets/farm/animals/snake.png': {
				tile: 32, tileh: 32,
				map: { spr_snake5: [1,1] }
			},
			'assets/farm/animals/gophers.png': {
				tile: 132, tileh: 182,
				map: { spr_gopher_hole: [0,0] }
			},
			'assets/farm/animals/butterflies2.png': {
				tile: 97,
				tileh: 87,
				map: { spr_butterfly: [1,1] }
			},
			'assets/well.png': {
				tile: 59, tileh: 49,
				map: { spr_well: [0,0] }
			},
			'assets/farm/tilesets/wheat.png': {
				tile: 32, tileh: 32,
				map: {
					spr_wheat1: [0,5],
					spr_wheat2: [1,5],
					spr_wheat3: [2,5],
					spr_wheat4: [1,3]
					// spr_wheat4: [1,4]
				}
			},
			'assets/farm/tilesets/tomatos.png': {
				tile: 128, tileh: 96,
				map: {
					spr_tomato1: [0,0],
					spr_tomato2: [0,1],
					spr_tomato3: [0,2],
					spr_tomato4: [0,3],
					spr_tomato5: [0,4]
				}
			},
			'assets/farm/tilesets/potatos.png': {
				tile: 116, tileh: 96,
				map: {
					spr_potato1: [0,0],
					spr_potato2: [0,1],
					spr_potato3: [0,2],
					spr_potato4: [0,3],
					spr_potato5: [0,4]
				}
			},
			'assets/farm/tilesets/wheat-bag.png': {
				tile: 32, tileh: 32,
				map: { spr_wheat: [0,0] }
			},
			'assets/farm/buckets.png': {
				tile: 105, tileh: 120,
				map: {
					spr_bucket_empty: [0,0],
					spr_bucket_full: [1,0]
				}
			},
			'assets/farm/farm-tools.png': {
				tile: 64, tileh: 64,
				map: {
					spr_bag: [0,0],
					spr_shovel: [0,1],
					spr_scythe: [1,1]
				}
			},
			'assets/farm/ui/box-longer.png': {
				tile: 1308, tileh: 302,
				map: { spr_box: [0,0] }
			},
			'assets/farm/ui/box-longer-up.png': {
				tile: 302, tileh: 1308,
				map: { spr_box_up: [0,0] }
			},
			'assets/farm/ui/scroll.png': {
				tile: 1000, tileh: 274,
				map: { spr_scroll: [0,0] }
			},
			'assets/farm/ui/block.png': {
				tile: 96, tileh: 96,
				map: { spr_block: [0,0] }
			},
			'assets/farm/ui/orders.png': {
				tile: 100, tileh: 360,
				map: { spr_orders: [0,0] }
			},
			'assets/farm/ui/order.png': {
				tile: 95, tileh: 35,
				map: { spr_order: [0,0] }
			},
			'assets/farm/tools.png': {
				tile: 32, tileh: 32,
				map: {
					spr_tools1: [1,0],
					spr_tools2: [2,0]
				}
			},
			'assets/seed_bags.png': {
				tile: 105, tileh: 97,
				map: {
					spr_seed_bag_empty: [0,0],
					spr_seed_bag_full: [1,0]
				}
			},
			'assets/farm/barrels.png': {
				tile: 64, tileh: 64,
				map: { spr_barrels: [1,0] }
			},
			'assets/farm/tree-stumps.png': {
				tile: 55, tileh: 60,
				map: {
					spr_stump1: [0,0],
					spr_stump2: [1,0]
				}
			},
			'assets/book.png': {
				tile: 31, tileh: 30,
				map: { spr_book: [0,0] }
			},
			'assets/farm/chests.png': {
				tile: 32, tileh: 32,
				map: {
					spr_chest_closed: [0,0],
					spr_chest_open: [0,1]
				}
			},
			'assets/farm/rocks.png': {
				tile: 32, tileh: 32,
				map: {
					spr_rock: [0,0],
					spr_rocks: [1,0]
				}
			},
			'assets/oven-off.png': {
				tile: 64, tileh: 41,
				map: { spr_oven_off: [0,0], spr_oven: [0,1] }
			},
			'assets/farm/logs.png': {
				tile: 32, tileh: 32,
				map: { spr_logs: [0,0] }
			},
			'assets/spinning-wheels.png': {
				tile: 86, tileh: 85,
				map: { spr_spinning_wheel: [0,0] }
			},
			'assets/wool.png': {
				tile: 25, tileh: 12,
				map: { spr_wool: [0,0] }
			},
			'assets/milk.png': {
				tile: 174, tileh: 323,
				map: { spr_milk: [0,0] }
			},
			'assets/breads.png': {
				tile: 125, tileh: 93,
				map: {
					spr_bread: [0,0],
					spr_ashes: [1,0]
				}
			},
			'assets/muffins.png': {
				tile: 128, tileh: 123,
				map: {
					spr_muffin: [0,0],
					spr_ashes: [1,0]
				}
			},
			'assets/bbushes.png': {
				tile: 256, tileh: 205,
				map: { 
					spr_bbush_empty: [0,0], 
					spr_bbush_full: [1,0] 
				}
			},
			'assets/berries.png': {
				tile: 256, tileh: 151,
				map: { spr_berries: [0,0] }
			},
			'assets/thread-blue.png': {
				tile: 32, tileh: 32,
				map: { spr_thread: [0,0] }
			},
			'assets/charging_stations.png': {
				tile: 480, tileh: 590,
				map: { 
					spr_charging_station: [0,0],
					spr_charging_station_lit: [1,0]
				}
			},
			'assets/screens.png': {
				tile: 244, tileh: 260,
				map: { 
					spr_screen: [0,0],  
					spr_screen_alert: [1,0]
				}
			},
			'assets/explosions/chest-explosion2.png': {
				tile: 35, tileh: 34,
				map: { spr_explosion: [0,0] }
			}
		}

	};
	Crafty.load(assetsObj);

	// Start game
	// setTimeout(function() {eval("Crafty.scene('Game');");}, 2000);
	Crafty.scene('Game');
});

// Adds components to the game 
Crafty.scene('Game', function() {
	// set pause [8] and quit [9] buttons
	Crafty.bind('KeyDown', function(e) {
		if (e.key == 57) {
			Crafty.pause();
			Crafty.scene('EndGame');
		}
		else if (e.key == 56) {Crafty.pause();}
	})

	// background

	Crafty.background('rgb(47, 130, 52)');

	// A 2D array of occupied tiles
	this.occupied = new Array(Game.w());
	for (var i = 0; i < Game.w(); i++) {
		this.occupied[i] = new Array(Game.h());
		for (var j = 0; j < Game.h(); j++) {this.occupied[i][j] = false;}
	}
	// Add player
	this.player = Crafty.e('Player').at(gv.player.loc[0], gv.player.loc[1]);
	// Add robot
	this.robot = Crafty.e('Robot').at(gv.robot.loc[0],gv.robot.loc[0]);
	this.request = Crafty.e('RobotRequest').at(1,2);
	// this.robot.attach(this.request);
	this.screen = Crafty.e('RequestScreen').at(21.5,5.3);

	// Add animals
	this.sheep = Crafty.e('Sheep').at(28,3);
	this.cow = Crafty.e('Cow').at(37,4);
	this.chicken1 = Crafty.e('Chicken').at(51,6);
	this.chicken1.delay(this.chicken1.layEgg, 28000, -1);
	this.chicken2 = Crafty.e('Chicken').at(43,20);
	this.chicken2.delay(this.chicken2.layEgg, 36000, -1);


	var cc = 0;
	var rr = 0;
	var xmin = 5;
	var field_w = 15+xmin;
	var field_h = 17;
	// Add scenery
	for (var x = 0; x < Game.w(); x++){
		for (var y = 0; y < Game.h(); y++){
			var at_edge = ((x == xmin && y < Game.h()-6) || (x == Game.w() - 1 && y < Game.h()-6) || y == 0 || y == Game.h() - 6);
			var field_s = 22;

			if (x < 5) { 
				Crafty.e('Blank').at(x,y);
			} else {
				// trees at edge
				if (at_edge) {
					Crafty.e('Tree').at(x,y);
					this.occupied[x][y] = true;

				// growing field
				} else if (x < field_w+1 && y <= field_h) {
					if (x == xmin+1) {
						if (y == 1){
							Crafty.e('Soil1').at(x,y);
							this.occupied[x][y] = true;
						} else if (y == field_h){
							Crafty.e('Soil7').at(x,y);
							this.occupied[x][y] = true;
						} else {
							Crafty.e('Soil4').at(x,y);
							this.occupied[x][y] = true;
						}
					} else if (x == field_w) {
						if (y == 1){
							Crafty.e('Soil3').at(x,y);
							this.occupied[x][y] = true;
						} else if (y == field_h) {
							Crafty.e('Soil9').at(x,y);
							this.occupied[x][y] = true;
						} else {
							Crafty.e('Soil6').at(x,y);
							this.occupied[x][y] = true;
						}
					} else if (y == 1) { 
						Crafty.e('Soil2').at(x,y);
						this.occupied[x][y] = true;
					} else if (y == field_h) {
						Crafty.e('Soil8').at(x,y);
						this.occupied[x][y] = true;
					} else {
						Crafty.e('Soil5').at(x,y);
						this.occupied[x][y] = true;
						if (y == 2 && (x > 3 && x < 12)) {
							gv.field.wheat[y-2][x-2] = Crafty.e('Wheat4').at(x,y);
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

				// tufts of grass
				} else if (y < Game.h()-6 && Math.random() < 0.05 && !this.occupied[x][y]) {
					if (Math.random() < 0.7) {Crafty.e('Grass').at(x,y);}
					else {
						Crafty.e('Grass2').at(x,y);
						cc+=1;
						// place treasure chest here
						if (cc == 6) {
							this.chest = Crafty.e('Chest').at(x,y);
							this.explosion = Crafty.e('ChestExplosion').at(x,y);
							// sets password and location
							task_chest.chestInitialize(x,y);
						}
					}
				// eggs
				} else if (y < Game.h()-6 && Math.random() < 0.01 && !this.occupied[x][y]) {
					Crafty.e('Egg').at(x,y);
				// rocks
				} else if (y < Game.h()-7 && Math.random() < 0.008 && !this.occupied[x][y] && rr < 4) {
					this.rock = Crafty.e('Rock').at(x,y);
					rr += 1;
					if (rr == 2) {this.rock.hasPin();}
				} 
			}

			// blank space at bottom
			// if (x == 44 || x == 24 || y == 12) {Crafty.e('Blank').at(x,y)}
			if (y > Game.h()-6) {Crafty.e('Blank').at(x,y);}
		}
	}

	// Add machinery
	var scene_b = Game.h()-7.8;
	this.well = Crafty.e('Well').at(1+xmin,scene_b);
	this.bag = Crafty.e('Barrel').at(3+xmin,scene_b+.1);
	this.stump = Crafty.e('Stump').at(5+xmin,scene_b+.3);
	this.grtools = Crafty.e('GroundTools').at(6.5+xmin,scene_b+.2);
	this.book = Crafty.e('Book').at(7.8+xmin,scene_b+.7);
	this.oven = Crafty.e('Oven').at(Game.w()-3.5,1);
	this.wood = Crafty.e('Wood').at(Game.w()-5,1);
	this.spinning_wheel = Crafty.e('SpinningWheel').at(Game.w()-7.5,1);
	this.charging_station = Crafty.e('ChargingStation').at(21.5,3);
	this.bbush = Crafty.e('BerryBush').at(38,16.4);
	this.bbush2 = Crafty.e('BerryBush').at(39,16.7);
	this.bbush3 = Crafty.e('BerryBush').at(37.7,16.8);

	// Add score information
	// Crafty.e('Orders').at(0,0);
	// Crafty.e('2D, Canvas, Text').attr({x:30,y:70}).text('Orders').textFont({ size: '20px' });
	Crafty.e('BoxUp').at(0,0);
	Crafty.e('2D, Canvas, Text').attr({x:30,y:50}).text('Orders').textFont({ size: '22px' });

	var box_b = Game.h()-3.8;
	this.scroll = Crafty.e('Scroll').at(0,Game.h()-5);
	this.score = Crafty.e('Score').at(3,box_b+.2).text('$ 0.00');
	this.time = Crafty.e('Time').at(3.1,box_b+1.4).text('00:00');
	Crafty.e('Energy').at(3.1,box_b+2.6);
	// this.power = Crafty.e('RobotPower').at(8,box_b+1.2);

	// Add lower panels
	for (var x = 0; x < 4; x++) {
		Crafty.e('SqrBlock').at(20+(x*5),Game.h()-5);
	}
	this.box = Crafty.e('Box').at(40,Game.h()-5).attr({ w:435 });

	// Add tools 
	var st = 20.2+1;
	this.bucket = Crafty.e('Bucket').at(st,box_b);
	this.seed_bag = Crafty.e('SeedBag').at(st+5,box_b);
	this.tools = Crafty.e('Tools').at(st+10,box_b);
	this.lg_tools = Crafty.e('LgTools').at(st+15,box_b);

	// Add resources and counts
	// tomatos + potatos
	Crafty.e('Tomato5').at(40.5,box_b-.7).attr({ w:60, h:50 });
	Crafty.e('TomatoLabel').at(41+1.5,box_b).text(0);
	Crafty.e('Potato5').at(40.5,box_b+1.1).attr({ w:60, h:50 });
	Crafty.e('PotatoLabel').at(41+1.5,box_b+2).text(0);
	var st2 = 40+4;
	// wheat + egg 
	Crafty.e('Wheat').at(st2,box_b-.4).attr({ w:30, h:30 });
	Crafty.e('WheatLabel').at(st2+1.5,box_b).text(0);
	Crafty.e('Egg').at(st2,box_b+1.5).attr({ w:30, h:30 });
	Crafty.e('EggLabel').at(st2+1.5,box_b+2).text(0);
	// wool + milk
	Crafty.e('Wool').at(st2+3,box_b-.3).attr({ w:30, h:25 });
	Crafty.e('WoolLabel').at(st2+4.5,box_b).text(0);
	Crafty.e('Milk').at(st2+3.2,box_b+1.5).attr({ w:20, h:40 });
	Crafty.e('MilkLabel').at(st2+4.5,box_b+2).text(0);
	// bread + muffin
	Crafty.e('Bread').at(st2+6,box_b-.4).attr({ w:40, h:30 });
	Crafty.e('BreadLabel').at(st2+8,box_b).text(0);
	Crafty.e('Muffin').at(st2+6.1,box_b+1.5).attr({ w:30, h:30 });
	Crafty.e('MuffinLabel').at(st2+8,box_b+2).text(0);
	// thread + berry
	Crafty.e('Thread').at(st2+9.4,box_b-.5).attr({ w:40, h:40 });
	Crafty.e('ThreadLabel').at(st2+11.2,box_b).text(0);
	Crafty.e('Berries').at(st2+9.4,box_b+1.8).attr({ w:30, h:20 });
	Crafty.e('BerryLabel').at(st2+11.2,box_b+2).text(0);

	// HUMAN TASKS
	this.currTask = Crafty.e('Task').at(7,box_b+.2).text('').trigger('UpdateTask');

	// End game - 40 min = 2400000, 30 min = 1800000, 20 min = 1200000
	setTimeout(function() {eval("Crafty.scene('EndGame');");}, 2000000); 
});

// End game screen
Crafty.scene('EndGame', function() {
	// Get final score
	var score = gv.score;

	// Background
	Crafty.background('white');
	Crafty.e('2D, DOM, Color, Text')
		.text('Congrats, you made '+score.toFixed(2)+' dollars!')
		.attr({ x:0, y:Game.height()/2-24, w:Game.width() })
		.css($text_css);

	// Write information to files
	// PARTICIPANT DATA
	mdp_line = JSON.stringify(MDP);
	h_line = JSON.stringify(HAvailability);
	console.log(mdp_line);
	$.ajax({
		url: 'savedata.php',
		method: 'POST',
		data: {
			mdp_data: mdp_line,
			h_data: h_line
		},
		success: function (response) {
			console.log('Done participant');
		}, 
		error: function (jqXhr, textStatus, errorThrown ){
			console.log( errorThrown);
		}
	});

	// QTABLE
	Q_line = JSON.stringify(Q_table);
	// console.log(Q_line);
	$.ajax({
	    url: 'saveQtable.php',
	    method: 'POST',
	    data: {data: Q_line},
	    success: function (response) {
	    	console.log('Done q-table');
		}, 
		error: function (jqXhr, textStatus, errorThrown ){
    		console.log( errorThrown );
		}
	});

	// NTABLE
	n_line = JSON.stringify(n_table);
	// console.log(n_line);
	$.ajax({
		url: 'saveNtable.php',
		method: 'POST',
		data: {n_data: n_line},
		success: function (response) {
			console.log('Done n-table');
		}, 
		error: function (jqXhr, textStatus, errorThrown ){
			console.log( errorThrown );
		}
	});
});





