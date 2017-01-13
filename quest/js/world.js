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


function World() {
	this._grayColor = 0xaaaaaa;
	this._planeSize = 1000;
	this._timesGroundTextureRepeats = 100;

	// Setup
	// We need 3 things to display anything: A scene, a camera, and a renderer.
	// The camera in this scene is on the player.
	this._scene = new THREE.Scene();
	this.player = new Player();
	this.hud = new Hud(this.player, this._planeSize);

	// Setup renderer
	this._renderer = new THREE.WebGLRenderer();
	this._renderer.setSize(window.innerWidth, window.innerHeight);
	this._renderer.setClearColor(this._grayColor);
	document.body.appendChild(this._renderer.domElement);
	
	//Add ground plane
	this._scene.add(this._setupGround());

	//Add treasure box
	this.treasure = this._defaultLoadingTreasure();
	this._setupTreasure();
	this._scene.add(this.treasure);

	//Add pillars
	var totalPillars = 5;
	this._undiscoveredPillarPositions = [];
	this._setupPillars(totalPillars);

	// Add forest
	this._treeMinimumScale = 5;
	this._treeMaximumScale = 10;
	this._treeVerticalOffset = -0.5;
	var totalTrees = 15000;
	this._setupForest(totalTrees);
    
	// Add fog
	this._scene.fog = new THREE.Fog(this._grayColor, .0001, 150);

    // Add lighting
    var ambientLight = new THREE.AmbientLight(0x404040);
    this._scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(0, 50, 0);
    pointLight.castShadow = true;
    this._scene.add(pointLight);

	// Resize camera aspect ratio when the user resizes the window.
	window.addEventListener('resize', this._onWindowResize.bind(this), false);
}


World.prototype = {
	start: function () {
		this._render();
	},
	getRandomUndiscoveredPillarPosition: function () {
		return this._undiscoveredPillarPositions[Math.floor(Math.random() * this._undiscoveredPillarPositions.length)];
	},
	getTreasurePosition: function () {
		return this.treasure.position;
	},
	discoverPillar: function (index) {
		this._undiscoveredPillarPositions.splice(index, 1);
	},
	// To render the page, you need a render loop.
	_render: function () {
		this.hud.update(this.player);
		this.player.update(this._undiscoveredPillarPositions, this.treasure.position);
		this._renderer.render(this._scene, this.player.camera);

		// Use requestAnimationFrame for loop instead of setInterval because it 
		// pauses when the user navigates away from the page.
		requestAnimationFrame(this._render.bind(this));
	},
	_onWindowResize: function () {
	    this.player.camera.aspect = window.innerWidth / window.innerHeight;
	    this.player.camera.updateProjectionMatrix();
	    this._renderer.setSize(window.innerWidth, window.innerHeight);
	},
	_setupGround: function () {
		var groundTexture = THREE.ImageUtils.loadTexture("images/Grass.jpg");
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.repeat.set(this._timesGroundTextureRepeats, this._timesGroundTextureRepeats);
		// Anisotropy effects the blur of ground tiles.
		groundTexture.anisotropy = 10;
		var geometryGroundPlane = new THREE.PlaneGeometry(this._planeSize, this._planeSize);
		var materialGroundPlane = new THREE.MeshBasicMaterial({ 
			map: groundTexture, 
			side: THREE.DoubleSide 
		});
		var ground = new THREE.Mesh(geometryGroundPlane, materialGroundPlane);
		// We rotate the ground plane so that it stretchs over the z, y axis.
		ground.rotateX(90 * (Math.PI / 180));
		return ground;
	},
	_randomCoordinate: function () {
		return Math.random() * this._planeSize - this._planeSize / 2;
	},
	_setMaterial: function (newObject, texture) {
		var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture});
		newObject.children[0].material = material;
		newObject.children[0].transparent = true;
	},
	_setPostition: function(object, x, y, z) {
		object.position.x = x;
		object.position.y = y;
		object.position.z = z;
	},
	_defaultLoadingTreasure: function () {
		var treasureGeometry = new THREE.BoxGeometry(2, 2, 2);
		var treasureMaterial = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('images/crate.jpg') });
		var treasureCube = new THREE.Mesh(treasureGeometry, treasureMaterial);
		
		this._setPostition(treasureCube, this._randomCoordinate(), 1, this._randomCoordinate());
		
		return treasureCube;
	},
	_setupTreasure: function () {
		var manager = new THREE.LoadingManager();
	    var loader = new THREE.OBJLoader(manager);
	    loader.load('images/treasure_chest.obj', function (object) {
	        var texture = THREE.ImageUtils.loadTexture("images/treasure-chest.jpg");
	        texture.wrapS = THREE.RepeatWrapping;
	        texture.wrapT = THREE.RepeatWrapping;
	        
	        this._setMaterial(object, texture);
	        this._setPostition(object, this._randomCoordinate(), 0, this._randomCoordinate());
	        
	        // We need to remove the default treasure from the scene.
	        this._scene.remove(this.treasure);
	        this.treasure = object;
	        this._scene.add(object)
	    }.bind(this));
	},
	_setupPillars: function (totalPillars) {
		var manager = new THREE.LoadingManager();
	    var loader = new THREE.OBJLoader(manager);

		loader.load('images/pedestal-cheetah.obj', function (model) {
        	for (var i = 0; i < totalPillars; i++) {
        		var newModel = model.clone();
		        var texture = THREE.ImageUtils.loadTexture("images/pillar.jpg");
		        this._setMaterial(newModel, texture);

		        newModel.scale.set(20, 20, 20);

				if (i == 0) {
					// We set the first pillar straight North at the edge of
					// the map to make it easy to find.
					this._setPostition(newModel, 0, 0, 50 - this._planeSize / 2);
				} else {
					// Position the rest of the pillars randomly.
					this._setPostition(newModel, this._randomCoordinate(), 0, this._randomCoordinate());
				}

				this._undiscoveredPillarPositions.push(newModel.position);
		        this._scene.add(newModel)
	    	}
		}.bind(this));
	},
	_randomRotationInRadians: function () {
		// Rotation is in radians.
		return Math.random() * 2 * Math.PI;
	},
	_setupForest: function (totalTrees) {
		var forestGeometry = new THREE.Geometry();

	    var texture = THREE.ImageUtils.loadTexture("images/aspen.png");
	    var treeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, map: texture, side: THREE.DoubleSide});
	    // Empirically chosen threshold for discarding pixels based on alpha value for this texture. This number looks the best.
	    treeMaterial.alphaTest = 0.95;

		var manager = new THREE.LoadingManager();
	    var loader = new THREE.OBJLoader(manager);

	    loader.load("images/aspen-combined-3.obj", function (treeObject) {
		    for (var i = 0; i < totalTrees; i++) {
		    	var newTreeObject = treeObject.clone();

		        var newTreeMesh = newTreeObject.children[0];
		        // Give the trees a random scale.
		        var scale = Math.random() * this._treeMaximumScale + this._treeMinimumScale;
	        	newTreeMesh.scale.set(scale, scale, scale);
	        	this._setPostition(newTreeMesh, this._randomCoordinate(), this._treeVerticalOffset, this._randomCoordinate());
		        newTreeMesh.rotation.y = this._randomRotationInRadians();
		        newTreeMesh.updateMatrix();

		        var geometry = new THREE.Geometry().fromBufferGeometry(newTreeMesh.geometry);
				forestGeometry.merge(geometry, newTreeMesh.matrix);
			}

		   	var forestMesh = new THREE.Mesh(forestGeometry, treeMaterial);
		    this._scene.add(forestMesh);
	    }.bind(this));
	}
};
