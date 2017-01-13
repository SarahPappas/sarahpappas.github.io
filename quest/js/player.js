/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Sarah Pappas
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function Player() {
	EventEmitter.call(this);

	// Setup camera.
	// Diffrent types of cameras, parameters field of view, aspect ration, near 
	// and far clipping plane.
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 80);

	// Set camera position.
	// Moves up camera postion because otherwise it would be placed at 0, 0, 0 
	// - in them middle of the plane.
	this.camera.position.y = 2;

	// Setup movement.
	// Set the distance you will move in a frame.
	this._speed = .5; 
	
	// This is the degree of rotation per frame.
	this._rotationSpeed = 1;

	// Setup key controls.
	// The default is false.
	this._isUpArrowActive = false;
	this._isDownArrowActive = false;
	this._isLeftArrowActive = false;
	this._isRightArrowActive = false;

	// Setup hit detection radius.
	this._hitDetectionRadius = 20;

	document.addEventListener("keydown", this._keydown.bind(this));
	document.addEventListener("keyup", this._keyup.bind(this));
}

Player.prototype = {
	/**
	 * @param {string} arrowKey - up, down, left, or right.
	 */
	update: function (pillarPositions, treasurePosition) {
		// Arrow controls
		if (this._isUpArrowActive && !this._isDownArrowActive) {
			this._walk(this._speed);
		}
		if (this._isDownArrowActive && !this._isUpArrowActive) {
			this._walk(-this._speed);
		}
		if (this._isRightArrowActive && !this._isLeftArrowActive) {
			this._rotate(-this._rotationSpeed);
		}
		if (this._isLeftArrowActive && !this._isRightArrowActive) {
			this._rotate(this._rotationSpeed);
		}

		// Hit detection for pillars.
		for (var i = 0; i < pillarPositions.length; i++) {
			if (this._isPointInsideCircle(pillarPositions[i], this.camera.position)) {
				this.emit("pillarEncountered", i);
			} 	
		}

		// Hit detection for treasure.
		if(this._isPointInsideCircle(treasurePosition, this.camera.position)) {
			this.emit("treasureEncountered", treasurePosition);
		}
	},
	_getDirectionVector: function () {
		return this.camera.getWorldDirection().clone().normalize();
	},
	/**
	 * @param {number} distance - The distance to move. Should be positive
	 * Can be positive to move forward or negative to move backward.
	 */
	_walk: function (distance) {
		var directionVector = this._getDirectionVector();
		this.camera.position.x = this.camera.position.x + directionVector.x * distance;
		this.camera.position.z = this.camera.position.z + directionVector.z * distance;
	},
	/**
	 * @param {number} rotation in degrees - The number of degrees to rotate. 
	 * Can be positive to rotate right or negative to rotate left.
	 */
	_rotate: function (degrees) {
		this.camera.rotation.y += (degrees * (Math.PI / 180));
	},
	_keydown: function (e) {
		if (e.keyCode == KeyCodes.UP_ARROW_KEY_CODE) {
			this._isUpArrowActive = true;
		} else if (e.keyCode == KeyCodes.DOWN_ARROW_KEY_CODE) {
			this._isDownArrowActive = true;
		} else if (e.keyCode == KeyCodes.RIGHT_ARROW_KEY_CODE) {
			this._isRightArrowActive = true;
		} else if (e.keyCode == KeyCodes.LEFT_ARROW_KEY_CODE) {
			this._isLeftArrowActive = true;
		}
	},
	_keyup: function (e) {
		if (e.keyCode == KeyCodes.UP_ARROW_KEY_CODE) {
			this._isUpArrowActive = false;
		} else if (e.keyCode == KeyCodes.DOWN_ARROW_KEY_CODE) {
			this._isDownArrowActive = false;
		} else if (e.keyCode == KeyCodes.RIGHT_ARROW_KEY_CODE) {
			this._isRightArrowActive = false;
		} else if (e.keyCode == KeyCodes.LEFT_ARROW_KEY_CODE) {
			this._isLeftArrowActive = false;
		}
	},
	/**
	 * @param {Array} - array of (x, y, z) for a cone.
	 */
	_isPointInsideCircle: function (circleCenter, point) {
		var dx = point.x - circleCenter.x;
		var dz = point.z - circleCenter.z;
  		var distance = Math.sqrt((dx) * (dx) + (dz) * (dz));
  		return distance <  this._hitDetectionRadius;
	},
};

// Add EventEmitter properties to Player.
_.assign(Player.prototype, EventEmitter.prototype);
