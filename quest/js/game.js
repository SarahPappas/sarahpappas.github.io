function Game(world) {
	// QUESTION would you make these constants??
	this.world = world;
	this.riddleContainerEl = $(".riddleContainer");
	var submitButton = $("#answer-button");
	this.questionEl = $(".riddleContainer .question");
	var startButtonEl = $("#start-button");
	this.correctAnswersNeeded = 3;
	this.riddlesAnsweredCorrectly = 0;

	this.riddleIndex = null;
	this.userInput = "";


	this._exitDisplayRiddle = this._exitDisplayRiddle.bind(this);

	startButtonEl.click(function() {
		$(".instruction-container").css("display", "none");
	})
	
	this.world.player.addEventListener("pillarDetected", function() {
		this.riddleContainerEl.css("display", "initial");
		this._displayRiddle();
	}.bind(this))

	this.world.player.addEventListener("treasureDetected", function() {
		this.riddleContainerEl.css("display", "initial");
		this._congratualateWinner();
	}.bind(this))

	submitButton.click(function(event) {
		var userInputEl = $("input[name='answer']");
		// save user input
		this.userInput = userInputEl.val();
		//clearInput
		userInputEl.val("");
		//Say if you were correct and which direction to head - use question div
		this._interactWithUser();
		//hide the form 
		$(".answer").css("display", "none");
	}.bind(this))

}

Game.prototype = {
	_displayRiddle: function() {
		this.riddleIndex = Math.floor(Math.random() * riddles.length);
		this.questionEl.text(riddles[this.riddleIndex].Question);
		//display answer form
		$(".answer").css("display", "initial");
	},
	_isRiddleCorrect: function() {
		var riddleAnswer = riddles[this.riddleIndex].Answer;
		if (this.userInput.toLowerCase().indexOf(riddleAnswer) == -1) {
			return false;
		} else {
			return true;
		}
	},
	_interactWithUser: function() {
		// TODO: pass sphere instead of hardcode
		if(this.world.hud.hintSphere){
			this.world.hud.removeObjectFromScene();
		}
		//this.correctAnswersNeeded
		if (this._isRiddleCorrect() && this.riddlesAnsweredCorrectly >= this.correctAnswersNeeded) {
			this.questionEl.text("I'm so pleased you are correct! " + " Please see your HUD for the location of the box.");
			this.world.hud.addTargetArea(this.world.getPositionOfTreasure());
		} else if (this._isRiddleCorrect()) {
			this.questionEl.text("I'm so pleased you are correct" + " Please see your HUD for the location of the next pillar.");
			this.riddlesAnsweredCorrectly++;
			this.world.hud.addTargetArea(this.world.getPositionOfNextPillar());
			// display next pillar
		} else {
			this.questionEl.text("Sorry to say, but you will get no help from me");
			// display treasure
		}
		// remove riddle that is already shown
		riddles.splice(this.riddleIndex, 1);
		// on any arrow key down hide the riddles modal
		document.addEventListener("keydown", this._exitDisplayRiddle);
	},
	_exitDisplayRiddle: function(e) {
		if (e.keyCode == UP_ARROW_KEY_CODE || e.keyCode == DOWN_ARROW_KEY_CODE || e.keyCode == RIGHT_ARROW_KEY_CODE || e.keyCode == LEFT_ARROW_KEY_CODE) {
			this.riddleContainerEl.css("display", "none");
			document.removeEventListener("keydown", this._exitDisplayRiddle);
		}
	},
	_congratualateWinner: function() {
		this.questionEl.text("Congratulations!! You're a winner");
	}
};
