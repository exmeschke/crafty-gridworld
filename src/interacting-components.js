// PLAYER CHARACTER
Crafty.c('Player', {
	_movement: [], // tracks 5 most recent moves 
	_back: 1.6, // keeps player from moving through solid objects
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Keyboard, Collision, Delay, spr_player, SpriteAnimation')
			.attr({ w:gv.tile_sz, h:gv.tile_sz, z:5 })
			// on hit events
			.onHit('Obstacle', this.stopMovement)
			.onHit('Resource', function() {
				var hitDatas, hitData;
				if ((hitDatas = this.hit('Resource'))) {hitDatas[0].obj.collect();}
			})
			.onHit('Robot', this.pushRobot)
			// animations
			.reel('PlayerMovingUp', 600, [[0,0], [1,0], [2,0]])
			.reel('PlayerMovingRight', 500, [[0,1], [1,1], [2,1]])
			.reel('PlayerMovingDown', 600, [[0,2], [1,2], [2,2]])
			.reel('PlayerMovingLeft', 500, [[0,3], [1,3], [2,3]])
			// movment
			.fourway(80)
			.bind('NewDirection', function(data) {
				var animation_speed = 20;
				if (data.x > 0) {
					this.animate('PlayerMovingRight', animation_speed, -1);
					this._movement.push('right');
				} else if (data.x < 0) {
					this.animate('PlayerMovingLeft', animation_speed, -1);
					this._movement.push('left');
				} else if (data.y > 0) {
					this.animate('PlayerMovingDown', animation_speed, -1);
					this._movement.push('down');
				} else if (data.y < 0) {
					this.animate('PlayerMovingUp', animation_speed, -1);
					this._movement.push('up');
				} else {
					this.pauseAnimation();
				}
				if (this._movement.length > 5) {this._movement.shift();}
			})
			// actions
			.bind('KeyDown', function(e) {
				if (e.key == Crafty.keys.X) {this.action();} 
				if (e.key == Crafty.keys.R) {this.reset();}
				if (e.key == Crafty.keys.SPACE) {Crafty.trigger('HideRequest');}
			})
			// triggered events
			.bind('SetSpeed', this.setSpeed)
	},
	// resets location if off screen
	reset: function() {
		gv.score -= 5;
		this.at(30,16);
	},
	// changes speed of player pushing robot depending on robot speed
	setSpeed: function() {
		if (gv.robot.status == 2) {this._back = 1.6;}
		else if (gv.robot.status == 1) {this._back = 2;}
	},
	// action triggered by hitting object and pressed 'X'
	action: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Well'))) {
			Crafty.trigger('FillBucket');
			// update player moment if in need full water bucket in task
			if (task_list.getText().includes('well')){
				gv.player.moment = 'middle';
			}
		} else if ((hitDatas = this.hit('Barrel'))) {
			Crafty.trigger('FillSeedBag');
		} else if ((hitDatas = this.hit('Stump'))) {
			Crafty.trigger('SwitchTools');
			// update player moment if in need shears or hammer in task
			// var task_text = task+list.getText();
			// if (task_text.includes('shears') || task_text.includes('hammer')){
			// 	gv.player.moment = 'middle';
			// }
		} else if ((hitDatas = this.hit('GroundTools'))) {
			Crafty.trigger('SwitchLgTools');
			// update player moment if in need scythe or shovel in task
			// var task_text = task+list.getText();
			// if (task_text.includes('scythe') || task_text.includes('shovel')){
			// 	gv.player.moment = 'middle';
			// }
		} else if ((hitDatas = this.hit('Book'))) { 
			Crafty.trigger('OpenBook');
		} else if ((hitDatas = this.hit('RequestScreen'))) {
			Crafty.trigger('ReceiveResponse');	
		} else if ((hitDatas = this.hit('BerryBush'))) {
			// if the bush has berries, collect berries
			if (gv.bush == 1) {
				Crafty.trigger('CollectBerries');
			// if the bush is empty and the bucket is full, water the bush
			} else if (gv.bush == 0 && gv.tools.bucket == 1) {
				Crafty.trigger('WaterBush');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Sheep'))) {
			// if the sheep has wool and the holding shears, collect wool
			if (gv.animal.sheep.hasWool == 1 && gv.tools.tools == 0) {
				Crafty.trigger('Sheared');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Cow'))) {
			// if the cow has milk and the bucket is empty, collect milk
			if (gv.animal.cow.hasMilk == 1 && gv.tools.bucket == 0) {
				Crafty.trigger('Milked');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Gopher'))) {
			// if holding hammer, hit gopher
			if (gv.tools.tools == 1) {hitDatas[0].obj.hitGopher();}
			else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Snake'))) {
			// if holding hammer, hit snake
			if (gv.tools.tools == 1) {hitDatas[0].obj.hitSnake();}
			else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Chest'))) {
			// if chest is hidden and holding shovel, reveal the chest
			if (task_funcs.chestGetRevealed() == 0 && gv.tools.lgtools == 1) {
				Crafty.trigger('DigChest');
			// if chest is revealed, try to open chest
			} else if (task_funcs.chestGetRevealed() == 1) {
				Crafty.trigger('OpenChest');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Rock'))) {
			// if holding hammer, break rock
			if (gv.tools.tools == 1) {
				hitDatas[0].obj.break();
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Wheat4'))) {
			// if holding scythe, collect wheat
			if (gv.tools.lgtools == 0) {
				Crafty.trigger('WheatCount');
				hitDatas[0].obj.destroy();
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Oven'))) {
			// ask what to bake
			var bake = prompt('What would you like to bake (bread or muffin)?');
			if (bake == 'bread') {
				// check if have enough resources to make bread
				if (gv.resources.eggs >= gv.recipes.bread.eggs && gv.resources.milk >= gv.recipes.bread.milk && gv.resources.wheat >= gv.recipes.bread.wheat){
					Crafty.trigger('BakeBread');
				} else {sounds.play_low();}
			} else if (bake == 'muffin') {
				// check if have enough resources to make muffin
				if (gv.resources.eggs >= gv.recipes.muffin.eggs && gv.resources.milk >= gv.recipes.muffin.milk && gv.resources.wheat >= gv.recipes.muffin.wheat){
					Crafty.trigger('BakeMuffin');
				} else {sounds.play_low();}	
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('SpinningWheel'))) { 
			// check if have enough resources to make thread
			if (gv.resources.wool >= gv.recipes.thread.wool && gv.resources.berries >= gv.recipes.thread.berries) {
				Crafty.trigger('MakeThread');
			} else {sounds.play_low();}
		} else {
			// default plays tone
			sounds.play_low();
			Crafty.trigger('EmptyBucket');
		}
	},
	// prevents from moving through obstacles
	stopMovement: function() {
		if (this._movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+this._back });
		} else if (this._movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-this._back });
		} else if (this._movement.slice(-1) == 'right') {
			this.attr({ x:this.x-this._back, y:this.y });
		} else {
			this.attr({ x:this.x+this._back, y:this.y });
		}
	}, 
	// pushes robot
	pushRobot: function() {		
		// hands item to robot to trigger robot action
		if (Crafty.s('Keyboard').isKeyDown('X')) {
			// if robot is alerting person, trigger show response
			if (gv.robot.is_alerting == true) {Crafty.trigger('ShowRequest');} 
			// if bucket is full
			else if (gv.tools.bucket == 1) {
				Crafty.trigger('Water');
				Crafty.trigger('EmptyBucket');
				// if request is to give water to robot, trigger completed
				if (request_list.getNumber() == 5) {gv.player.interacting = false;}
			// if seed bag full, set robot task to plant
			} else if (gv.tools.seed_bag == 1) {
				Crafty.trigger('Plant');
				Crafty.trigger('EmptySeedBag');
				// if request is to give seeds to robot, trigger completed
				if (request_list.getNumber() == 5) {gv.player.interacting = false;}
			}
		}
		// check if over lost part 
		if (gv.robot.part.loc_x != -1) {
			var xx = gv.robot.part.loc_x - (this.x/gv.tile_sz);
			var yy = gv.robot.part.loc_y - (this.y/gv.tile_sz);
			var dist = Math.sqrt(Math.pow(xx,2)+Math.pow(yy,2));

			if (dist < 2) {sounds.play_radar_high();}
			else if (dist < 5) {sounds.play_radar_med();}
			else if (dist < 10) {sounds.play_radar_low();}

			if (Math.round(this.x/gv.tile_sz) == gv.robot.part.loc_x && Math.round(this.y/gv.tile_sz) == gv.robot.part.loc_y) {
				alert('Found it!');
				gv.player.interacting = false;
				gv.robot.part.loc_x = -1;
				gv.robot.part.loc_y = -1;
				set_robot_speed(2);
			}
		}
		// slow down player and trigger robot movement
		if (this._movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+this._back-.4 });
			Crafty.trigger('RobotUp');
		} else if (this._movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-this._back+.4 });
			Crafty.trigger('RobotDown');
		} else if (this._movement.slice(-1) == 'right') {
			this.attr({ x:this.x-this._back+.4, y:this.y });
			Crafty.trigger('RobotRight');
		} else {
			this.attr({ x:this.x+this._back-.4, y:this.y });
			Crafty.trigger('RobotLeft');
		}
	}
});


//TASKS
Crafty.c('Task', {
	_initial: 0, // initial quantity of task related resource
	_filler: 0.0, // tracks how much time for filler task (no task)
	init: function() {
		this.requires('2D, DOM, Grid, Text')
			.attr( { w:230, h:200 })
			.textFont({ size: '16px' })
			// .textAlign('center')
			.bind('UpdateQuant', this.updateQuant)
			.bind('CompletedTask', this.completedTask)
			.bind('UpdateTask', this.updateTask)
			.bind('UpdateFrame', this.checkTask)
	},
	// updates task information if there is a task
	updateTask: function() {
		if (typeof task_list.getCurr() != undefined){
			// get task requirements
			var met = task_list.getMet();
			var resource = met[0];
			// records current quantity
			if (resource == 'eggs') {_initial = gv.resources.eggs;}
			else if (resource == 'wheat') {_initial = gv.resources.wheat;}
			else if (resource == 'wool') {_initial = gv.resources.wool;}
			else if (resource == 'milk') {_initial = gv.resources.milk;}
			else if (resource == 'bread') {_initial = gv.resources.bread;}
			else if (resource == 'muffin') {_initial = gv.resources.muffin;}
			else if (resource == 'thread') {_initial = gv.resources.thread;}
			else if (resource == 'berries') {_initial = gv.resources.berries;}
			// update task text
			this.text(task_list.getText());
			// set player moment to break
			gv.player.moment = 'break';
			// set clock
			task_list.setStart();
			// sets events in motion
			task_list.runCommand();	
		}
	},
	// checks task status
	checkTask: function() {
		// get task requirements and current task status
		var met = task_list.getMet();
		var resource = met[0];
		var quantity = met[1];
		var curr_quant = 0;
		// check resource quantity
		if (resource == 'eggs') {curr_quant = gv.resources.eggs-_initial;}
		else if (resource == 'wheat') {curr_quant = gv.resources.wheat-_initial;}
		else if (resource == 'wool') {curr_quant = gv.resources.wool-_initial;}
		else if (resource == 'milk') {curr_quant = gv.resources.milk-_initial;}
		else if (resource == 'bread') {curr_quant = gv.resources.bread-_initial;}
		else if (resource == 'muffin') {curr_quant = gv.resources.muffin-_initial;}
		else if (resource == 'thread') {curr_quant = gv.resources.thread-_initial;}
		else if (resource == 'berries') {curr_quant = gv.resources.berries-_initial;}
		else if (resource == 'none') {
			gv.player.moment = 'break';
			this._filler += 0.005;
		}
		// if started task, update player moment
		if (curr_quant != this._initial) {gv.player.moment = 'middle';}
		// dynamically update quantity needed to complete task
		var txt = task_list.getText();
		var new_txt = '';
		var len = txt.replace(/[0-9]/g, '').length;
		if (txt.length - len == 1) {new_txt = txt.replace(/[0-9]/g, quantity-curr_quant);}
		else if (txt.length - len == 2) {
			var index = txt.search(/\d/);
			new_txt = txt.replace(/[0-9]/g, '');
			var num = quantity-curr_quant;
			new_txt = new_txt.substr(0, index) + num + new_txt.substr(index);
		} else {new_txt = txt;}
		this.text(new_txt);
		// update human state information
		gv.player.difficulty = task_list.getDiff();
		receptivity.updateState(gv.player.interacting, gv.player.difficulty, gv.player.moment);
		// receptivity.printState();
		// check if task is complete if not gopher, snake, or butterfly task
		if (resource != '') {
			if (quantity <= curr_quant || this._filler >= 2) {this.completedTask();}
		}
	},
	// task completed
	completedTask: function() {
		// stop clock
		task_list.setEnd();
		// update current task index
		task_list.nextTask();
		// reset private variables
		this._quant = 0;
		this._filler = 0.0;
		// next task
		this.updateTask();
	}
});

// ROBOT CHARACTER
// sound for robot alert
function robot_alert_sound() {
	sounds.play_med();
	for (var i = 0; i < gv.robot.alert_len; i++) {
	    setTimeout(function() {
	    	// stop alert if player responds
	    	if (gv.robot.is_alerting == false) {return;}
	    	else {sounds.play_med();}
	    }, 1000*i);
	}
};
// sets speed depending on status
function set_robot_speed(status) {
	gv.robot.status = status;
	Crafty.trigger('SetSpeed');
};
// indicates request was sent
function set_request(time) {
	// record that response was sent
	request_list.sentRequest();
	// set trigger for new request
	setTimeout(function() {
		// get information and update text
		var text = request_list.getText();
		update_robot_text(text);
		// initialize action (alert)
		var action = request_list.getAction();
		if (action == 0) {}
		else if (action == 1) {Crafty.trigger('LowAlert');}
		else if (action == 2) {Crafty.trigger('MedAlert');}
		else if (action == 3) {Crafty.trigger('HighAlert');}
		// output to console
		Crafty.log(text, action);
	}, time);
};
Crafty.c('Robot', {
	_power: 100,
	_battery_life: 2000, // how often lose power in ms
	_is_charging: false, // stops moving if true
	_movement: [], // records last 5 moves
	_do_move: 1500, // how often moves, depends on status
	_speed: [0, 2400, 1200], // different speeds, depends on status
	_task: -1, // [-1:none, 0:plant, 1:water]
	_is_alerting: false, // currently blinking, beeping, or both
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, SpriteAnimation, spr_bot, Tween, Delay, Text')
			.attr({ w: gv.tile_sz+2, h: gv.tile_sz+2, z:1 })
			// delay events
			.delay(this.randomMove, this._do_move, -1)
			.delay(this.losePower, this._battery_life, -1)
			// request specific
			.delay(this.alertFire, 900000, -1) // 15 minutes = 900000
			.delay(this.alertPlants, 420000, -1) // 7 minutes = 420000
			.delay(this.alertNotification, 240000) // 4 minutes = 240000
			.delay(this.alertCognitive, 660000, -1) // 11 minutes = 660000
			// on hit events
			.onHit('Solid', this.turnAround)
			.onHit('ChargingStation', this.recharge)
			// animations
			.reel('AnimateLight', 1000, [ [1,0], [0,0] ])
			.reel('AnimateFire', 1000, [ [1,1], [2,1], [3,1] ])
			// binded events
			.bind('RobotUp', this.moveUp)
			.bind('RobotDown', this.moveDown)
			.bind('RobotLeft', this.moveLeft)
			.bind('RobotRight', this.moveRight)
			.bind('Plant', this.plant)
			.bind('Water', this.water)
			.bind('LowAlert', this.lowAlert)
			.bind('MedAlert', this.medAlert)
			.bind('HighAlert', this.highAlert)
			.bind('StopAlert', this.stopAlert)
			.bind('SetSpeed', this.setSpeed)
			.bind('KeyDown', function(e) {if (e.key == Crafty.keys.R) {this.reset();}})
	},
	char: function() {return 'robot';},
	// resets location if off screen
	reset: function() {this.at(5,10);},
	// changes speed depending on status
	setSpeed: function() {
		this.cancelDelay(this.randomMove);
		// not operational
		if (gv.robot.status == 0) {this._do_move = 0;}
		// slow moving
		else if (gv.robot.status == 1) {this._do_move = 3000;}
		// working normally
		else if (gv.robot.status == 2) {this._do_move = 1500;}
		this.delay(this.randomMove, this._do_move, -1);
	},
	lastMovement: function() {return this._movement.slice(-1);},
	// checks last movement and does opposite 
	turnAround: function() {
		var movement = this.lastMovement();
		if (movement == 'up') {this.moveDown();}
		else if (movement == 'down') {this.moveUp();}
		else if (movement == 'right') {this.moveLeft();}
		else {this.moveRight();}
	},
	// does random movement
	randomMove: function() {
		// check if on fire
		if (gv.robot.fire != -1) {gv.score -= 0.25;}
		// if not broken
		if (gv.robot.status != 0) {
			// complete task
			if (this.x/gv.tile_sz < 15 && this.y/gv.tile_sz < 15 && this.x/gv.tile_sz > 1 && this.y/gv.tile_sz > 1) {
				this.tendPlants();
			}
		
			// random move
			if (gv.robot.direction == '') {
				if (this.x/gv.tile_sz < 2) {this.moveRight();}
				else if (this.y/gv.tile_sz < 2) {this.moveDown();}
				else if (this.y/gv.tile_sz > 15) {this.moveUp();}
				else if (this.x/gv.tile_sz > 16) {this.moveLeft();}
				else {
					if (this._power > 0 && this._is_charging == false) {
						var ra = Math.random()
						if (ra < 0.25) {this.moveUp();}
						else if (ra < 0.50) {this.moveDown();}
						else if (ra < 0.75) {this.moveLeft();}
						else {this.moveRight();}
					} else if (this._power == 0) {
						gv.score -= .25;
					}
				}
			// not random
			} else {
				if (gv.robot.direction == 'up') {this.moveUp();}
				else if (gv.robot.direction == 'down') {this.moveDown();}
				else if (gv.robot.direction == 'left') {this.moveLeft();}
				else if (gv.robot.direction == 'right') {this.moveRight();}
				gv.robot.num_moved += 1;
				// reset 
				if (gv.robot.num_moved == 5) {
					gv.robot.direction = '';
					gv.robot.num_moved = 0;
				}
			}
		}
	},
	moveUp: function() {
		this._is_charging = false;
		this.tween({ x: this.x, y: this.y-gv.tile_sz }, this._speed[gv.robot.status])
		this._movement.push('up');
		if (this._movement.length > 5) {this._movement.shift();}
	},
	moveDown: function() {
		this._is_charging = false;
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, this._speed[gv.robot.status])
		this._movement.push('down');
		if (this._movement.length > 5) {this._movement.shift();}
	},
	moveLeft: function() {
		this._is_charging = false;
		this.tween({ x: this.x-gv.tile_sz, y: this.y }, this._speed[gv.robot.status])
		this._movement.push('left');
		if (this._movement.length > 5) {this._movement.shift();}
	}, 
	moveRight: function() {
		this._is_charging = false;
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, this._speed[gv.robot.status])
		this._movement.push('right');
		if (this._movement.length > 5) {this._movement.shift();}
	},
	// -1 robot power 
	losePower: function() {
		// only lose power if robot not alerting and player not interacting
		if (this._is_charging == false && gv.robot.is_alerting == false && gv.player.interacting == false) {
			// check if lose power
			if (this._power > 0) {this._power -= 1;}
			else {this._power = 0;}

			// check if low power
			var power = Math.round(this._power);
			if (power == 5 || power == 6) { // very low power
				gv.robot.is_alerting = true;
				request_list.addRequest(14);
				set_request(500);
			} else if (power == 20 || power == 21) {
				gv.robot.is_alerting = true;
				request_list.addRequest(9);
				set_request(500);
			}
		}
	},
	// adds to robot power
	recharge: function() {
		if (this._power < 100) {
			this._power += .05;
			this._is_charging = true;
		} else {
			this._power = 100;
			this._is_charging = false;
		}
	},
	// ROBOT TASKS
	// either plants or waters
	tendPlants: function() {
		// not on fire
		if (gv.robot.fire == -1) {
			if (this._task == 0) {this.plant();}
			else if (this._task == 1) {this.water();}
		// on fire
		} else {this.burn();}
	},
	plant: function() {
		this._task = 0;

		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		Crafty.e('Wheat2').at(x, y);
		if (gv.field.seed_loc_x.indexOf(x) == -1) {gv.field.seed_loc_x.push(x);}
		if (gv.field.seed_loc_y.indexOf(y) == -1) {gv.field.seed_loc_y.push(y);}
	},
	water: function() {
		// if robot not on fire
		if (gv.robot.fire == -1) {
			this._task = 1;

			var x = Math.round(this.x/gv.tile_sz);
			var y = Math.round(this.y/gv.tile_sz);

			if (gv.field.seed_loc_x.indexOf(x) != -1 && gv.field.seed_loc_y.indexOf(y) != -1) {
				Crafty.e('Wheat4').at(x, y);
				if (gv.field.wheat_loc_x.indexOf(x) == -1) {gv.field.wheat_loc_x.push(x);}
				if (gv.field.wheat_loc_y.indexOf(y) == -1) {gv.field.wheat_loc_y.push(y);}
			}
		// if robot on fire
		} else {
			gv.robot.fire += 1;
			if (gv.robot.fire == 3) {this.offFire();}
		}
	}, 
	// destroys wheat if on fire
	burn: function() {
		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		if (gv.field.wheat_loc_x.indexOf(x) != -1 && gv.field.wheat_loc_y.indexOf(y) != -1) {
			Crafty.e('Soil5').at(x,y);
		}
	},
	// ALERTS
	// flashing light
	lowAlert: function() {
		gv.robot.is_alerting = true;
		this.animate('AnimateLight', -1);
		this.delay(this.stopAlert, gv.robot.alert_len*1000);
	},
	// beeping
	medAlert: function() {
		gv.robot.is_alerting = true;
		robot_alert_sound();
	},
	// flashing light + beeping
	highAlert: function() {
		gv.robot.is_alerting = true;
		this.animate('AnimateLight', -1);
		this.delay(this.stopAlert, gv.robot.alert_len*1000);
		robot_alert_sound();
	},
	stopAlert: function() {
		gv.robot.is_alerting = false;
		if (gv.robot.fire == -1) {
			this.pauseAnimation();
			this.sprite('spr_bot');
		}
	},
	// REQUESTS
	alertNotification: function() {
		if (this._is_charging == false && gv.robot.status != 0) {
			gv.robot.is_alerting = true;
			var request_num = -1;
			var rand = Math.random();
			// short notification
			if (rand < 0.33) {
				rand = Math.random();
				if (rand < 0.25) {request_num = 1;}
				else if (rand < 0.5) {request_num = 2;}
				else if (rand < 0.75) {request_num = 3;}
				else {request_num = 4;}
			// long notification
			} else if (rand < 0.66) {
				rand = Math.random();
				if (rand < 0.33) {request_num = 5;}
				else if (rand < 0.66) {request_num = 6;}
				else {request_num = 7;}
			} else {
				request_num = 8;
			}
			// trigger
			request_list.addRequest(request_num);
			set_request(500);
		}
	},
	alertPlants: function() {
		if (this._is_charging == false && gv.robot.status != 0) {
			gv.robot.is_alerting = true;
			var request_num = -1;
			// switch to planting
			if (this._task == -1 || this._task == 1) {
				request_num = 10;
			// switch to watering
			} else if (this._task == 0) {
				request_num = 11;
			}
			// trigger
			request_list.addRequest(request_num);
			set_request(500);
		}
	},
	alertCognitive: function() {
		gv.robot.is_alerting = true;
		var rand = Math.random();
		if (rand < 0.5) { // missing part request
			request_list.addRequest(12);
			set_request(500);
			// location of missing part
			gv.robot.part.loc_x = Math.floor(Math.random() * (16 - 2)) + 2;
			gv.robot.part.loc_y = Math.floor(Math.random() * (15 - 2)) + 2;
		} else { // software update task
			request_list.addRequest(13);
			set_request(500);
		}
		// moves slowly
		set_robot_speed(1);
	},
	alertFire: function() {
		gv.robot.is_alerting = true;
		request_list.addRequest(15);
		set_request(500);
		// request specific 
		this.delay(this.onFire, gv.robot.alert_len*1000);
	},
	onFire: function() {
		gv.robot.fire = 0;
		this.animate('AnimateFire', -1);
	},
	offFire: function() {
		this.pauseAnimation();
		this.sprite('spr_bot');
		gv.robot.fire = -1;
		// moves slowly
		set_robot_speed(1);
	}
});

// REQUESTS
function update_robot_text(text) {gv.robot.txt = text;};
function hide_robot_text() {Crafty.trigger('HideRequest');};
Crafty.c('RobotRequest', {
	_incomplete_txt: '', // shows text one letter at a time
	init: function() {
		this.requires('2D, DOM, Grid, Color, Text')
			.attr({ w:gv.tile_sz*52, h:gv.tile_sz*13, z:10 })
			.textFont({ size: '20px' })
			.css({ 'font-family':'Courier', 'padding-top':'200px' })
			.textAlign('center')
			.bind('UpdateText', this.updateText)
			.bind('ShowRequest', this.showRequest)
			.bind('HideRequest', this.hideRequest)
			.bind('UpdateFrame', this.waitForResponse)
	},
	updateText: function() {this.text(gv.robot.incomplete_txt);},
	showRequest: function() {
		// indicates player responded
		gv.player.interacting = true;
		request_list.receivedResponse();
		// stops alert
		Crafty.trigger('StopAlert');
		// shows popup
		this.color('#D7E0DA', .98);
		var a = 0;
		for (var i = 0; i <= gv.robot.txt.length; i++) {
			setTimeout(function(i) {
				gv.robot.incomplete_txt = gv.robot.txt.slice(0,a);
				Crafty.trigger('UpdateText');
				a += 1;
			}, 100*i);
		}
		setTimeout(hide_robot_text, (gv.robot.txt.length+40)*100);
	},
	hideRequest: function() {
		this.color("#FFFFFF", 0).text('');
		gv.robot.txt = '';
		// if no response required, player no longer interacting
		var requiresResponse = request_list.getRequiresResponse();
		if (requiresResponse == false) {gv.player.interacting = false;}
	}
});
Crafty.c('RequestScreen', {
	init: function() {
		this.requires('2D, Canvas, Grid, Delay, SpriteAnimation, spr_screen')
			.attr( {w:50, h:42, z:1 })
			.reel('ScreenFlash', 1000, [ [1,0], [0,0] ])
			.bind('ReceiveResponse', this.receiveResponse)
	},
	receiveResponse: function() {
		// collects response
		var resp = prompt('Enter response here: ');
		if (resp == 'up' || resp == 'down' || resp == 'left' || resp == 'right') {
			if (request_list.getNumber() == 3) {
				gv.player.interacting = false;
				sounds.play_correct();
			}
			gv.robot.direction = resp;
		}
		else if (resp == 'X91R23Q7') { // password for high cognitive load request
			if (request_list.getNumber() == 6) {
				gv.player.interacting = false;
				sounds.play_correct();
				set_robot_speed(2);
			}
		}
		else if (resp == 'X5214') { // password to reset robot speed
			if (request_list.getNumber() == 8) {
				gv.player.interacting = false;
				sounds.play_correct();
			}
			set_robot_speed(2);
		}
	}
});

