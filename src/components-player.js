// PLAYER COMPONENT

Crafty.c('Player', {
	_movement: [], // tracks 5 most recent moves 
	_back: 1.2, // 1.6 keeps player from moving through solid objects
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
			.fourway(60) // 80
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
				// if (e.key == Crafty.keys.V) {this.pullRobot();}
				if (e.key == 49) {this.reset();}
				// if (e.key == Crafty.keys.SPACE) {Crafty.trigger('HideRequest');}
			})
			.bind('UpdateFrame', function() {
				if (Crafty.s('Keyboard').isKeyDown('V')) {this.pullRobot();}
			})
			// triggered events
			.bind('SetSpeed', this.setSpeed)
			.bind('GetLocation', this.getLoc)
	},
	// resets location if off screen
	reset: function() {
		gv.score -= 5;
		this.at(30,16);
	},
	// changes speed of player pushing robot depending on robot speed
	setSpeed: function() {
		if (gv.robot.status == 2) {this._back = 1.6;}
		else if (gv.robot.status == 1) {this._back = 1.8;}
	},
	// returns this.x and this.y
	getLoc: function() {
		gv.player.loc[0] = this._x/gv.tile_sz;
		gv.player.loc[1] = this._y/gv.tile_sz;
	},
	// action triggered by hitting object and pressed 'X'
	action: function() {
		// check if robot is alerting, prioritize responding to alert
		if (gv.robot.is_alerting) {
			var dist = dist_robot_player();
			if (dist <= 2) {
				// if robot is alerting person and player nearby, trigger show response			
				if (gv.robot.is_alerting == true) {
					Crafty.trigger('ShowRequest');
				// if bucket is full
				} else if (gv.tools.bucket == 1) {
					Crafty.trigger('Water');
					Crafty.trigger('EmptyBucket');
					// if request is to give water to robot, trigger completed
					if (request_list.getNumber() == 3) {terminal_state();}
					if (request_list.getNumber() == 5 && gv.robot.switch_task == 'yes') {
						terminal_state();
						gv.robot.switch_task = 'no';
					}
				// if seed bag full, set robot task to plant
				} else if (gv.tools.seed_bag == 1) {
					Crafty.trigger('Plant');
					Crafty.trigger('EmptySeedBag');
					// if request is to give seeds to robot, trigger completed
					if (request_list.getNumber() == 3) {terminal_state();}
					if (request_list.getNumber() == 5 && gv.robot.switch_task == 'yes') {
						terminal_state();
						gv.robot.switch_task = 'no';
					}
				}
			}
			
		} else {
			// check for everything else
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
				var task_text = task_list.getText();
				if (task_text.includes('shears') || task_text.includes('hammer')){
					gv.player.moment = 'middle';
				}
			} else if ((hitDatas = this.hit('GroundTools'))) {
				Crafty.trigger('SwitchLgTools');
				// update player moment if in need scythe or shovel in task
				var task_text = task_list.getText();
				if (task_text.includes('scythe') || task_text.includes('shovel')){
					gv.player.moment = 'middle';
				}
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
				if (chest.revealed == 0 && gv.tools.lgtools == 1) {
					Crafty.trigger('DigChest');
				// if chest is revealed, try to open chest
				} else if (chest.revealed == 1) {
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
					// destroy wheat
					hitDatas[0].obj.destroy();
					if (x > 1 && x < 15 && y > 1 && y < 16) {
						var x = Math.round(this.x/gv.tile_sz);
						var y = Math.round(this.y/gv.tile_sz);
						gv.field.wheat[y-2][x-2] = '';
					}
				} else {sounds.play_low();}
			} else if ((hitDatas = this.hit('Oven'))) {
				// if oven on
				if (gv.tools.oven_on == true) {
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
				} else {sounds.play_low();}
			} else if ((hitDatas = this.hit('SpinningWheel'))) { 
				// check if have enough resources to make thread
				if (gv.resources.wool >= gv.recipes.thread.wool && gv.resources.berries >= gv.recipes.thread.berries) {
					Crafty.trigger('MakeThread');
				} else {sounds.play_low();}		

			} else {
				// default
				sounds.play_low();
				setTimeout(function() {
					Crafty.trigger('EmptyBucket');
					Crafty.trigger('EmptySeedBag');
				}, 200);
			}
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
	// pulls robot
	pullRobot: function() {
		// stop movement
		var request_num = request_list.getNumber();
		if ((gv.robot.part.loc_x != -1 || request_num == 4 || request_num == 7) && gv.player.interacting == true){
			Crafty.trigger('StopMove');
		}
		// check if lost part
		if (gv.robot.part.loc_x != -1 && gv.player.interacting == true){
			var xx = gv.robot.part.loc_x - (this.x/gv.tile_sz);
			var yy = gv.robot.part.loc_y - (this.y/gv.tile_sz);
			var dist = Math.sqrt(Math.pow(xx,2)+Math.pow(yy,2));

			if (dist <= 1) {
				alert('Found it!');
				terminal_state();
				gv.robot.part.loc_x = -1;
				gv.robot.part.loc_y = -1;
			}
			if (dist < 2) {sounds.play_radar_high();}
			else if (dist < 4) {sounds.play_radar_med();}
			else if (dist < 8) {sounds.play_radar_low();}
		}
		// slow down player and trigger robot movement
		var dist = dist_robot_player(); // distance between robot and human
		if (dist <= 2) {
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
	},
	// pushes robot
	pushRobot: function() {	
		// stop movement
		var request_num = request_list.getNumber();
		if ((gv.robot.part.loc_x != -1 || request_num == 4 || request_num == 7) && gv.player.interacting == true){
			Crafty.trigger('StopMove');
		}
		// check if over lost part 
		if (gv.robot.part.loc_x != -1 && gv.player.interacting == true){
			var xx = gv.robot.part.loc_x - (this.x/gv.tile_sz);
			var yy = gv.robot.part.loc_y - (this.y/gv.tile_sz);
			var dist = Math.sqrt(Math.pow(xx,2)+Math.pow(yy,2));

			if (dist <= 1) {
				alert('Found it!');
				terminal_state();
				gv.robot.part.loc_x = -1;
				gv.robot.part.loc_y = -1;
			}
			if (dist < 2) {sounds.play_radar_high();}
			else if (dist < 4) {sounds.play_radar_med();}
			else if (dist < 8) {sounds.play_radar_low();}
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
