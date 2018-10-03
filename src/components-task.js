/**
 * Defines the Crafty 'Task' component.
 */

Crafty.c('Task', {
	_initial: 0, // initial quantity of task related resource
	_filler: 0, // tracks how much time for filler task (no task)
	init: function() {
		this.requires('2D, DOM, Grid, Text')
			.attr( { w:230, h:200 })
			.textFont({ size: '16px' })
			.bind('CompletedTask', this.completedTask)
			.bind('UpdateTask', this.updateTask)
			.bind('UpdateFrame', this.checkTask) 
	},
	// updates task information if there is a task
	updateTask: function() {
		if (task_list.getCurr() === undefined) {
			task_list.addRandTask();
			Crafty.log(task_list.curr, task_list.list);
		}
		// get task requirements
		var met = task_list.getMet();
		var resource = met[0];
		// records current quantity
		if (resource == 'eggs') {_initial = gv.resources.eggs;}
		else if (resource == 'wheat') {_initial = gv.resources.wheat;}
		else if (resource == 'wool') {_initial = gv.resources.wool;}
		else if (resource == 'milk') {_initial = gv.resources.milk;}
		else if (resource == 'bread') {
			_initial = gv.resources.bread;
			Crafty.trigger('StartOven');
			// give 130 seconds to complete task
			setTimeout(function() {
				eval("Crafty.trigger('StopOven');");
				// only trigger next task if still on muffin task
				var met = task_list.getMet();
				if (met[0] == 'bread') {eval("Crafty.trigger('CompletedTask');");}
			}, 130000);
		}
		else if (resource == 'muffin') {
			_initial = gv.resources.muffin;
			Crafty.trigger('StartOven');
			// give 130 seconds to complete task
			setTimeout(function() {
				eval("Crafty.trigger('StopOven');");
				// only trigger next task if still on muffin task
				var met = task_list.getMet();
				if (met[0] == 'muffin') {eval("Crafty.trigger('CompletedTask');");}
			}, 130000);
		}
		else if (resource == 'thread') {_initial = gv.resources.thread;}
		else if (resource == 'berries') {_initial = gv.resources.berries;}
		// update task text
		this.text(task_list.getText());
		// set player moment to break
		gv.player.moment = 'break';
		// set start time 
		task_list.setStart();
		// sets events in motion
		task_list.runCommand();	
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
			this._filler += 1;
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
		receptivity_list.updateState(gv.player.interacting, gv.player.difficulty, gv.player.moment, gv.robot.status);
		// receptivity_list.printState();
		// check if task is complete if not gopher, snake, or butterfly task
		if (resource != '') {
			if (quantity <= curr_quant || this._filler >= 3000) {this.completedTask();}
		}
	},
	// task completed
	completedTask: function() {
		// set end time
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