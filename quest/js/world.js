var GREY = 0xaaaaaa;
var PLANE_SIZE = 1000;

function World(player, hud) {
	// SETUP
	// need 3 things to dispaly anything. A scene a camera and a render
	this.scene = new THREE.Scene();
	// camera in screen is on the player
	this.player = new Player();
	// call the Hud constructor
	this.hud = new Hud(this.player);

	//setup renderer
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.setClearColor(GREY);
	document.body.appendChild(this.renderer.domElement);

	//ADD GROUND PLANE
	this.scene.add(this._setupGround());

	//ADD TREASURE BOX
	this.treasure = this._defaultLoadingTreasure();
	this._setupTreasure();
	this.scene.add(this.treasure);

	//ADD PILLARS
	this.numberOfPillars = 5;
	this.pillarPositions = [];
	this._setupPillars();

	// Forest
	this.numberOfTrees = 20000;
	this._setupForest();
    
	// Add fog
	this.scene.fog = new THREE.Fog(GREY, .0001, 150);

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(0, 50, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

	//Resize Window event listener
	window.addEventListener('resize', this._onWindowResize.bind(this), false);
}


World.prototype = {
	// to render the page, you need a render loop
	// anything you move or change has to run through the render function loop
	render: function() {
		this.hud.render();
		this.player.render(this.pillarPositions, this.treasure.position);
		this.renderer.render(this.scene, this.player.camera);
		// use requestAnimationFrame for loop instead of setInterval because it pauses when user navigates away
		requestAnimationFrame(this.render.bind(this));
	},
	_onWindowResize: function() {
	    this.player.camera.aspect = window.innerWidth / window.innerHeight;
	    this.player.camera.updateProjectionMatrix();
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	_setupGround: function() {
		var groundTexture = THREE.ImageUtils.loadTexture("images/Grass.jpg");
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.repeat.set(100, 100);
		groundTexture.anisotropy= 4;
		var geometryGroundPlane = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 1, 1);
		var materialGroundPlane = new THREE.MeshBasicMaterial({ 
			map: groundTexture, 
			side: THREE.DoubleSide 
		});
		var ground = new THREE.Mesh(geometryGroundPlane, materialGroundPlane);
		ground.rotateX(90 * (Math.PI / 180));
		return ground;
	},
	_defaultLoadingTreasure: function() {
		var treasureGeometry = new THREE.BoxGeometry( 2, 2, 2 );
		var treasureMaterial = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('images/crate.jpg') });
		var treasureCube = new THREE.Mesh(treasureGeometry, treasureMaterial);
		treasureCube.position.x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
		treasureCube.position.y = 1;
		treasureCube.position.z = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
		return treasureCube;
	},
	_setupTreasure: function() {
		var manager = new THREE.LoadingManager();
	    manager.onProgress = function ( item, loaded, total ) {
	        console.log( item, loaded, total );
	    };
	    var loader = new THREE.OBJLoader(manager);
	    loader.load( 'images/treasure_chest.obj', function ( object ) {
	        var texture = THREE.ImageUtils.loadTexture("images/treasure_chest.jpg");
	        texture.wrapS = THREE.RepeatWrapping;
	        texture.wrapT = THREE.RepeatWrapping;
	        var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture});
	        object.children[0].material = material;
	        object.children[0].transparent = true;
	        object.position.set(Math.random() * PLANE_SIZE - PLANE_SIZE / 2, 0, Math.random() * PLANE_SIZE - PLANE_SIZE / 2);
	        this.scene.remove(this.treasure);
	        this.treasure = object;
	        this.scene.add(object)
	    }.bind(this));
	},
	_setupPillars: function() {
		var manager = new THREE.LoadingManager();
	    manager.onProgress = function ( item, loaded, total ) {
	        console.log( item, loaded, total );
	    };
	    var loader = new THREE.OBJLoader(manager);
		loader.load( 'images/pedestal-cheetah.obj', function ( object ) {
        	for (var i = 0; i < this.numberOfPillars; i++) {
        		var newObject = object.clone();
		        var texture = THREE.ImageUtils.loadTexture("images/pedestal3.jpg");
		        var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture});
		        newObject.children[0].material = material;
		        newObject.children[0].transparent = true;
		        newObject.scale.set(20, 20, 20);
				if (i == 0) {
					newObject.position.x = 0;
					newObject.position.y = 0;
					newObject.position.z = 50 - PLANE_SIZE / 2;
				} else {
					newObject.position.x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
					newObject.position.y = 0;
					newObject.position.z = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
				}
				this.pillarPositions.push(newObject.position);
		        console.log(newObject);
		        this.scene.add(newObject)
	    	}
		}.bind(this));
	},
	_setupForest: function() {
		var forestGeometry = new THREE.Geometry();

		    var texture = THREE.ImageUtils.loadTexture("images/aspen-2.png");
		    var treeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, map: texture, side: THREE.DoubleSide});
		    treeMaterial.alphaTest = 0.95;

			var manager = new THREE.LoadingManager();
			manager.onProgress = function (item, loaded, total) {
		        console.log( item, loaded, total );
		    };

		    var loader = new THREE.OBJLoader(manager);
		    loader.load("images/aspen-combined-3.obj", function (treeObject) {
			    for (var i = 0; i < this.numberOfTrees; i++) {
			    	var newTreeObject = treeObject.clone();

			        var newTreeMesh = newTreeObject.children[0];
			        var scale = Math.random() * 10 + 5;
		        	newTreeMesh.scale.set(scale, scale, scale);
			        newTreeMesh.position.x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
			        newTreeMesh.position.y = -0.5;
			        newTreeMesh.position.z = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
			        newTreeMesh.rotation.y = Math.random() * 2 * Math.PI;
			        newTreeMesh.updateMatrix();

			        var geometry = new THREE.Geometry().fromBufferGeometry(newTreeMesh.geometry);
					forestGeometry.merge(geometry, newTreeMesh.matrix);
				}

			   	var forestMesh = new THREE.Mesh(forestGeometry, treeMaterial);
			    this.scene.add(forestMesh);
		    }.bind(this));
	},
	// TODO combine get position of pillar function with get position of treasure function.
	getPositionOfNextPillar: function() {
		return this.pillarPositions[Math.floor(Math.random() * this.pillarPositions.length)];
	},
	getPositionOfTreasure: function(){
		return this.treasure.position;
	}
};


