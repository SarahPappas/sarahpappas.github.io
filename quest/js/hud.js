	var MINIMAPEL = $("#inset");
	var MINIMAP_HEIGHT = 150;
	var MINIMAP_WIDTH = 150;

function Hud(player) {
	this.player = player;
	// create a new scene and camera
	this.miniMapScene = new THREE.Scene();
	this.miniMapCamera = new THREE.PerspectiveCamera(75, MINIMAP_WIDTH / MINIMAP_HEIGHT, .1, 50);
	this.miniMapCamera.position.z = 10
	// create new renderer
	this.miniMapRenderer = new THREE.WebGLRenderer();
	this.miniMapRenderer.setSize(MINIMAP_WIDTH, MINIMAP_HEIGHT);
	// add minimap to DOM
	MINIMAPEL.append(this.miniMapRenderer.domElement);
	// add a sphere
	var sphereGeometry = new THREE.SphereGeometry(.5, 32, 32);
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
	this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	this.miniMapScene.add(this.sphere);
	// need to save sphere so we can access the name later to remove it from the minimap
	this.hintSphere = null;

}

Hud.prototype = {
	render: function() {
		// get new sphere position
		this.sphere.position.x = (this.player.camera.position.x * .015);
		this.sphere.position.y = -1*(this.player.camera.position.z * .015);
		this.sphere.position.z = 0;
		// render minimap
		this.miniMapRenderer.render(this.miniMapScene, this.miniMapCamera);
	},
	addTargetArea: function(location) {
		var radius = 30;
		var diameter = radius * 2;
		var pillarPosition = location;
		var ratio = .015;
		var sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
		var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xf2f28a});
		this.hintSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		this.hintSphere.position.x = ((pillarPosition.x - radius) + (Math.random() * diameter)) * ratio;
		this.hintSphere.position.y = (-1 * ((pillarPosition.z - radius) + (Math.random() * diameter))) * ratio;
		this.hintSphere.name = "TargetArea";
		this.miniMapScene.add(this.hintSphere);
	},
	removeObjectFromScene: function() {
		var selectedObject = this.miniMapScene.getObjectByName(this.hintSphere.name);
		console.log(this.hintSphere);
		this.miniMapScene.remove(selectedObject);
		selectedObject.material.dispose();
        selectedObject.geometry.dispose();
	},

};