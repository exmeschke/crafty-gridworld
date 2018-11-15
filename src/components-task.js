/**
 * Defines the Crafty 'Task' and 'Order' components.
 */

var scrolls = []; // task history
var curr_task_nums = [0,0,0,0,0,0,0,0,0,0]; // task numbers, only one order per resource
Crafty.c('Task', {
	_max: 5,
	_event: '',
	_incomplete: [],
	_complete: [],

	init: function() {
		this.requires('2D, DOM, Grid, Delay, Text')
			.attr( { w:280, h:200 })
			.textFont({ size: '16px' })
			// .bind('UpdateFrame', this.checkComplete)
			.bind('TaskCompleted', this.taskComplete)
			.delay(this.addTask, 5000, -1)// 30000, -1)
	},
	addTask: function() {
		Crafty.log('add task');
		var rand = Math.random();
		// if (rand < 0.6) { // new order 
			if (this._incomplete.length < this._max) { // up to 5 orders 
				var y = 4+(4*this._incomplete.length); // location on screen
				var order = Crafty.e('Order').at(1, y+1.2);
				order.setIndex(this._incomplete.length); // order num
				var scroll = Crafty.e('OrderScroll').at(.5,4+(4*this._incomplete.length)).attr({ z:-10 });

				scrolls.push(scroll); // save all scrolls
				this._incomplete.push(order._task); // incomplete list
				Crafty.log(order._task);

				if (this._event == '') { // change bottom of screen IF no other task
					this.updateHint(order._task.txt); 
				}
			}
		// } else if (rand < 0.8) { // new other task
		// 	if (this._event == '') {
		// 		this._event = task_list.getRandTask('event');
		// 		this.updateHint(this._event.txt);
		// 	}
		// }
	},
	updateHint: function(text) {this.text(text);},
	// check to move from _incomplete to _complete
	checkComplete: function() {
		for (var i = 0; i < this._incomplete.length; i++) {
			if (this._incomplete[i].getComplete() == true) {
				var complete = this._incomplete.splice(i, 1);
				complete.text('');
				this._complete.push(complete);
				scrolls.splice(i, 1);
			} 
		}
	},
	// indicates event task is completed
	taskComplete: function() {
		this._event = '';
	}
});

Crafty.c('OrderScroll', {
	init: function() {this.requires('2D, DOM, Grid, Color, Text, Sprite, spr_order').attr( {w:100, h:80, z:-2 })}
});

Crafty.c('Order', {
	_index: -1,
	_task: '',
	_resource: '', // resource
	_initial: 0, // initial quantity of resource
	_quantity: 0, // final quantity needed of resource

	// initialize order
	init: function() {
		this.requires('2D, DOM, Grid, Color, Text')
			.attr( {w:80, h:40, z:9 })
			.textFont({  size: '16px' })
			.bind('UpdateFrame', this.checkTask) 

		// select task - cannot be same as one of current tasks
		var task = task_list.getRandTask('resource');
		while (curr_task_nums[task.num] == 1) {
			task = task_list.getRandTask('resource');
		}
		this._task = task;
		// construct order
		this._resource = this._task.order;
		if (this._resource == 'eggs') {
			this._initial = gv.resources.eggs;
			this._quantity = getRandomInt(10,20);
		} else if (this._resource == 'wheat') {
			this._initial = gv.resources.wheat;
			this._quantity = getRandomInt(4,8);
		} else if (this._resource == 'tomatos') {
			this._initial = gv.resources.tomatos;
			this._quantity = getRandomInt(4,8);
		} else if (this._resource == 'potatos') {
			this._initial = gv.resources.potatos;
			this._quantity = getRandomInt(4,8);
		} else if (this._resource == 'wool') {
			this._initial = gv.resources.wool;
			this._quantity = getRandomInt(1,4);
		} else if (this._resource == 'milk') {
			this._initial = gv.resources.milk;
			this._quantity = getRandomInt(1,3);
		} else if (this._resource == 'bread') {
			this._initial = gv.resources.bread;
			this._quantity = getRandomInt(1,2);
		} else if (this._resource == 'muffin') {
			this._initial = gv.resources.muffin;
			this._quantity = getRandomInt(1,2);
		} else if (this._resource == 'thread') {
			this._initial = gv.resources.thread;
			this._quantity = getRandomInt(1,3);
		} else if (this._resource == 'berries') {
			this._initial = gv.resources.berries;
			this._quantity = getRandomInt(15,40);
		}
		this.text(this._quantity+' '+this._resource);

		// set start time
		this._task.setStart();
	}, 
	// set index
	setIndex: function(index) {this._index = index;}, 
	// checks status
	checkTask: function() {
		// get task requirements and current task status
		var curr_quant = 0;
		var res = this._resource;
		// check resource quantity
		if (this._resource == 'eggs') {
			curr_quant = gv.resources.eggs-this._initial;
			if (this._quantity-curr_quant == 1) res = 'egg';
			else res = 'eggs';
		} else if (this._resource == 'wheat') {
			curr_quant = gv.resources.wheat-this._initial;
			if (this._quantity-curr_quant == 1) res = 'bushel of wheat';
			else res = 'bushels of wheat';	
		} else if (this._resource == 'tomatos') {
			curr_quant = gv.resources.tomatos-this._initial;
			if (this._quantity-curr_quant == 1) res = 'tomato';
			else res = 'tomatos';
		} else if (this._resource == 'potatos') {
			curr_quant = gv.resources.potatos-this._initial;
			if (this._quantity-curr_quant == 1) res = 'potato';
			else res = 'potatos';
		} else if (this._resource == 'wool') {curr_quant = gv.resources.wool-this._initial;}
		else if (this._resource == 'milk') {curr_quant = gv.resources.milk-this._initial;}
		else if (this._resource == 'bread') {
			curr_quant = gv.resources.bread-this._initial;
			if (this._quantity-curr_quant == 1) res = 'loaf of bread';
			else res = 'loaves of bread';
		} else if (this._resource == 'muffin') {
			curr_quant = gv.resources.muffin-this._initial;
			if (this._quantity-curr_quant == 1) res = 'muffin';
			else res = 'muffins';
		} else if (this._resource == 'thread') {
			curr_quant = gv.resources.thread-this._initial;
			if (this._quantity-curr_quant == 1) res = 'spool of thread';
			else res = 'spools of thread';
		} else if (this._resource == 'berries') {
			curr_quant = gv.resources.berries-this._initial;
			if (this._quantity-curr_quant == 1) res = "berry";
			else res = 'berries';
		}

		// dynamically update quantity needed to complete task
		this.text(this._quantity-curr_quant + ' ' + res);

		// update human state information
		// if (curr_quant != this._initial) {gv.player.moment = 'middle';}
		// gv.player.difficulty = task_list.getDiff();
		// receptivity_list.updateState(gv.player.interacting, gv.player.difficulty, gv.player.moment, gv.robot.status);
		// receptivity_list.printState();

		// check if task is complete
		if (this._quantity == curr_quant) {this.completedTask();}
	},
	// task completed
	completedTask: function() {
		this._task.setEnd();
		task_list.addToCompleted(this._task);
		scrolls[this._index].destroy();
		this.destroy();
	},
	// getters
	getTask: function() {return this._task;},
	getComplete: function() {return this._task.complete;},
	getDuration: function() {return this._task.duration;}
});

