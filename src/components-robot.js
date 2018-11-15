// ROBOT COMPONENT

Crafty.c('Robot', {
	_curr_state: 0, // current state of mdp [1:19]
	_power: 100,
	_battery_life: 2000, // how often lose power in ms
	_is_charging: false, // stops moving if true
	_movement: [], // records last 5 moves
	_do_move: 1500, // how often moves, depends on status
	_speed: [0, 2400, 1200], // different speeds, depends on status
	_task: 0, // [-1:none, 0:plant, 1:water]
	_is_alerting: false, // currently blinking, beeping, or both
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, SpriteAnimation, spr_bot, Tween, Delay, Text')
			.attr({ w: gv.tile_sz+2, h: gv.tile_sz+2, z:2 })
			// delay events
			.delay(this.randomMove, this._do_move, -1)
			.delay(this.losePower, this._battery_life, -1)
			// request specific
			.delay(this.alertFire, 900000, -1) // 15 minutes = 900000
			.delay(this.alertPlants, 420000, -1) // 7 minutes = 420000
			.delay(this.alertNotification, 124000, -1) // 2 minutes, 4 sec = 124000
			.delay(this.alertCognitive, 681000, -1) // 11 minutes, 21 sec = 681000
			.delay(this.alertLowPower, 540000, -1) // 9 minutes = 540000
			// on hit events
			.onHit('Solid', this.turnAround)
			.onHit('ChargingStation', this.recharge)
			// animations
			.reel('AnimateLow', gv.robot.alerts.freq[0], [ [1,0], [0,0] ])
			.reel('AnimateMed', gv.robot.alerts.freq[1], [ [2,0], [0,0] ])
			.reel('AnimateHigh', gv.robot.alerts.freq[2], [ [3,0], [0,0] ])
			.reel('AnimateFire', 1000, [ [1,1], [2,1], [3,1] ])
			// binded events
			.bind('UpdateFrame', this.recordState)
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
			.bind('StopMove', this.stopMove)
			.bind('GetLocation', this.getLoc)
			.bind('ResetLoc', this.setLoc)
			.bind('KeyDown', function(e) {
				if (e.key == 49) {
					Crafty.log('reset');
					this.reset();
				}
			})
	},
	char: function() {return 'robot';},
	// resets location if off screen
	reset: function() {
		this.cancelDelay(this.randomMove);
		this.cancelTween();
		Crafty.trigger('ResetLoc');
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 100); 
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 200); 
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 300); 
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 400);
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 500); 
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 600);
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 700); 
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 800);
		setTimeout(function(){Crafty.trigger('ResetLoc');}, 900); 
		set_robot_speed(2);
	},
	// continues to update robot state information
	recordState: function() {
		dist_robot_player();
		this._curr_state = request_list.curr_state;
	},
	// returns this.x and this.y
	getLoc: function() {
		gv.robot.loc[0] = this._x/gv.tile_sz;
		gv.robot.loc[1] = this._y/gv.tile_sz;
	},
	setLoc: function() {this.at(5,10);}, 
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
		if (this._x <= gv.xmin+1) {
			Crafty.log('right');
			this.moveRight();
		} else if (this._y <= 1) {
			Crafty.log('down');
			this.moveDown();
		} else {
			var movement = this.lastMovement();
			if (movement == 'up') {this.moveDown();}
			else if (movement == 'down') {this.moveUp();}
			else if (movement == 'right') {this.moveLeft();}
			else {this.moveRight();}
		}
	},
	stopMove: function() {this.cancelDelay(this.randomMove);},
	// does random movement
	randomMove: function() {
		// check if on fire
		if (gv.robot.fire != -1) {gv.score -= 0.15;}
		// if not broken
		if (gv.robot.status != 0) {
			Crafty.trigger('LightOff');
			// complete task
			if (this.x/gv.tile_sz < 15 && this.y/gv.tile_sz < 15 && this.x/gv.tile_sz > 5 && this.y/gv.tile_sz > 1) {
				this.tendPlants();
			}
		
			// random move
			if (gv.robot.direction == '') {
				if (this.x/gv.tile_sz < 6) {this.moveRight();}
				else if (this.y/gv.tile_sz < 2) {this.moveDown();}
				else if (this.y/gv.tile_sz > 15) {this.moveUp();}
				else if (this.x/gv.tile_sz > 16) {this.moveLeft();}
				else {
					if (gv.robot.status != 0 && this._is_charging == false) {
						var ra = Math.random()
						if (ra < 0.25) {this.moveUp();}
						else if (ra < 0.50) {this.moveDown();}
						else if (ra < 0.75) {this.moveLeft();}
						else {this.moveRight();}
					} else if (gv.robot.status == 0) {
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
		if (this._y > 30) {
			this._is_charging = false;
			this.tween({ x: this.x, y: this.y-gv.tile_sz }, this._speed[gv.robot.status])
			this._movement.push('up');
			if (this._movement.length > 5) {this._movement.shift();}
		}
	},
	moveDown: function() {
		this._is_charging = false;
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, this._speed[gv.robot.status])
		this._movement.push('down');
		if (this._movement.length > 5) {this._movement.shift();}
	},
	moveLeft: function() {
		if (this._x > 150) {
			this._is_charging = false;
			this.tween({ x: this.x-gv.tile_sz, y: this.y }, this._speed[gv.robot.status])
			this._movement.push('left');
			if (this._movement.length > 5) {this._movement.shift();}
		}
	}, 
	moveRight: function() {
		this._is_charging = false;
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, this._speed[gv.robot.status])
		this._movement.push('right');
		if (this._movement.length > 5) {this._movement.shift();}
	},
	// -1 robot power 
	losePower: function() {
		// if fully charged and request is low battery
		if (this._power == 100) {
			var request_num = request_list.getNumber();
			if ((request_num == 4 || request_num == 7) && this._curr_state != 19) {
				set_robot_speed(2);
				terminal_state();
			}
		}

		if (this._is_charging == false) {
			if (this._power > 0) {this._power -= 1;}
			else {this._power = 0;}
		}
	},
	// adds to robot power
	recharge: function() {
		Crafty.trigger('LightOn');
		if (this._power < 100) {
			this._power += .1;
			this._is_charging = true;
		} else {
			this._power = 100;
			this._is_charging = false;
			set_robot_speed(2);
			this.moveLeft();
			Crafty.trigger('LightOff');
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

		if (x > gv.xmin && x < gv.xmin+16 && y > 1 && y < gv.ymax) {
			if (gv.field.seed[y-2][x-2] == '' && gv.field.wheat[y-2][x-2] == ''){
				// insert seeds
				gv.field.seed[y-2][x-2] = Crafty.e('Wheat2').at(x, y);
			}
		}
	},
	water: function() {
		// if robot not on fire
		if (gv.robot.fire == -1) {
			this._task = 1;

			var x = Math.round(this.x/gv.tile_sz);
			var y = Math.round(this.y/gv.tile_sz);

			if (x > gv.xmin && x < gv.xmin+16 && y > 1 && y < gv.ymax) {
				if (gv.field.seed[y-2][x-2] != '') { // if seeds in location
					// destroy seeds
					gv.field.seed[y-2][x-2].destroy(); 
					gv.field.seed[y-2][x-2] = '';
					// insert wheat
					gv.field.wheat[y-2][x-2] = Crafty.e('Wheat4').at(x, y);
				}
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

		if (x > gv.xmin && x < gv.xmin+16 && y > 1 && y < gv.ymax) {
			if (gv.field.seed[y-2][x-2] != '') {
				var seeds = gv.field.seed[y-2][x-2];
				if (seeds != undefined) {
					seeds.destroy();
					gv.field.seed[y-2][x-2] = '';
				}
			}

			if (gv.field.wheat[y-2][x-2] != '') {
				var wheat = gv.field.wheat[y-2][x-2];
				if (wheat != undefined) {
					wheat.destroy();
					gv.field.wheat[y-2][x-2] = '';
				}
			}
		}
	},
	// ALERTS
	// flashing light
	lowAlert: function() {
		gv.robot.is_alerting = true;
		this.animate('AnimateLow', -1);
		robot_alert_sound(0);
		this.delay(this.stopAlert, gv.robot.alerts.stop);
	},
	// beeping
	medAlert: function() {
		gv.robot.is_alerting = true;
		this.animate('AnimateMed', -1);
		robot_alert_sound(1);
		this.delay(this.stopAlert, gv.robot.alerts.stop);
	},
	// flashing light + beeping
	highAlert: function() {
		gv.robot.is_alerting = true;
		this.animate('AnimateHigh', -1);
		robot_alert_sound(2);
		this.delay(this.stopAlert, gv.robot.alerts.stop);
	},
	stopAlert: function() {
		gv.robot.is_alerting = false;
		if (gv.robot.fire == -1) {
			this.pauseAnimation();
			this.sprite('spr_bot');
		}
		// update state
		if (this._curr_state != 19) {
			var request_num = request_list.getNumber();
			if (gv.player.interacting == false) { 
				if (request_num == 6 || request_num == 7) { 
					not_operational(); // ignored = 18
				} else if (request_num == 4 || request_num == 8) {} // nothing
				else {terminal_state();} // ignored = 19 
			} else { // reponded = 17
				request_list.endRequest(gv.player.interacting, gv.robot.status);
			}
		}
	},
	// REQUESTS
	alertNotification: function() {
		Crafty.log('alert - notification');
		if (this._is_charging == false && gv.robot.status == 2 && gv.robot.is_alerting == false && this._curr_state == 19) {
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
				// easy physical task
				if (this._task == 1) {request_num = 8;} // switch to planting
				else if (this._task == 0) {request_num = 9;} // switch to watering
				// timeout if request not complete
				var req_num = request_list.start_state;
				setTimeout(function() {
					Crafty.log('timeout');
					request_timeout(req_num);
				}, 70000);
			}
			// trigger
			request_list.addRequest(request_num);
			set_request(100);
		}
	},
	alertLowPower: function() {
		Crafty.log('alert - low power');
		if (this._is_charging == false && gv.robot.status == 2 && gv.robot.is_alerting == false && this._curr_state == 19) {
			this._power = 20;
			request_list.addRequest(10);
			set_request(100);
			// transition to very low power state
			this.delay(this.veryLowPower,  75000); // 1.25 minutes later
			// timeout if request not complete
			var req_num = request_list.start_state;
			setTimeout(function() {
				Crafty.log('timeout');
				request_timeout(req_num);
			}, 100000);
		}
	},
	alertPlants: function() {
		Crafty.log('alert - plants');
		if (this._is_charging == false && gv.robot.status == 2 && gv.robot.is_alerting == false && this._curr_state == 19) {
			// trigger
			request_list.addRequest(11);
			set_request(100);
			// timeout if request not complete
			var req_num = request_list.start_state;
			setTimeout(function() {
				Crafty.log('timeout');
				request_timeout(req_num);
			}, 100000);
		}
	},
	alertCognitive: function() {
		Crafty.log('alert - cognitive');
		if (this._is_charging == false && gv.robot.status == 2 && gv.robot.is_alerting == false && this._curr_state == 19) {
			var rand = Math.random();
			var time = 0;
			if (rand < 0.5) { // missing part request
				request_list.addRequest(12);
				set_request(100);
				// location of missing part
				gv.robot.part.loc_x = Math.floor(Math.random() * (16 - 2)) + 2;
				gv.robot.part.loc_y = Math.floor(Math.random() * (15 - 2)) + 2;
				time = 160000;
			} else { // software update task
				request_list.addRequest(13);
				set_request(100);
				time = 70000;
			}
			// timeout if request not complete
			var req_num = request_list.start_state;
			setTimeout(function() {
				gv.robot.part.loc_x = -1;
				gv.robot.part.loc_y = -1;
				Crafty.log('timeout');
				request_timeout(req_num);
			}, time);
		}
	},
	veryLowPower: function() {
		Crafty.log('alert - very low power');
		if (this._power < 90 && this._is_charging == false) {
			this._power = 0;
			request_list.addRequest(14);
			set_request(100);
			// after alert, not operational if ignored
			setTimeout(function() {
				Crafty.log(this._is_charging, gv.player.interacting);
				if (this._is_charging == false && gv.player.interacting == false) {not_operational(0);} 
			}, gv.robot.alerts.stop);
			// timeout if request accepted but not completed
			var req_num = request_list.start_state;
			setTimeout(function() {
				Crafty.log('timeout');
				request_timeout(req_num);
			}, 100000);
		}
	},
	alertFire: function() {
		Crafty.log('alert - fire');
		if (this._is_charging == false && gv.robot.status == 2 && gv.robot.is_alerting == false && this._curr_state == 19) {
			request_list.addRequest(15);
			set_request(100);
			// request specific 
			this.delay(this.onFire, gv.robot.alerts.stop);
		}
	},
	onFire: function() {
		gv.robot.fire = 0;
		this.animate('AnimateFire', -1);
		// put out fire eventually
		if (gv.player.interacting == false) {this.delay(this.noFire, 30000);}
		else {this.delay(this.noFire, 80000);}
	},
	// default
	noFire: function() {
		this.pauseAnimation();
		this.sprite('spr_bot');
		gv.robot.fire = -1;

		// no response
		if (gv.player.interacting == false) {
			not_operational();
		// timeout if request not complete
		} else {
			var req_num = request_list.start_state;
			Crafty.log('timeout');
			request_timeout(req_num);
		}
	},
	// put out
	offFire: function(put_out) { 
		this.pauseAnimation();
		this.sprite('spr_bot');
		gv.robot.fire = -1;
		// timeout if request not complete
		var req_num = request_list.start_state;
		setTimeout(function() {
			Crafty.log('timeout');
			request_timeout(req_num);
		}, 30000);
	}
});
