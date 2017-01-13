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


function Hud(player, planeSize) {
    var MiniMapEl = $("#js-HUD");
    var MiniMap_Height = 150;
    var MiniMap_Width = 150;
    this._miniMapSize = (MiniMap_Width + MiniMap_Height) /2;
    this._hintSphereRadius = 30;
    var hintSphereColor = 0xffffff;

    // This is the porportion of HUD size to plane size * the HUD  near 
    // plane frustum.
    this._downScalePlayerPosition = (this._miniMapSize / planeSize) * .1;

    // Create a new scene and camera for the HUD.
    this._miniMapScene = new THREE.Scene();
    var hudNearPlaneFrustum = 0.1;
    var hudFarPlaneFrustum = this._miniMapSize / 2;
    this._miniMapCamera = new THREE.PerspectiveCamera(75, MiniMap_Width / MiniMap_Height, hudNearPlaneFrustum, hudFarPlaneFrustum);
    this._miniMapCamera.position.z = 10

    // Create new renderer for the HUD.
    this._miniMapRenderer = new THREE.WebGLRenderer();
    this._miniMapRenderer.setSize(MiniMap_Width, MiniMap_Height);

    // Add  the minimap to DOM.
    MiniMapEl.append(this._miniMapRenderer.domElement);

    // Add a sphere, which will represent the players location.
    var sphereGeometry = new THREE.SphereGeometry(.5, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: hintSphereColor });
    this._userSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this._miniMapScene.add(this._userSphere);

    // Sometimes we show a hint to the player as a search area on the HUD.
    this._hintSphere = null;

}

Hud.prototype = {
    update: function (player) {
        // Get new sphere position.
        this._userSphere.position.x = (player.camera.position.x * this._downScalePlayerPosition);
        this._userSphere.position.y = -1*(player.camera.position.z * this._downScalePlayerPosition);
        this._userSphere.position.z = 0;

        // Render the minimap.
        this._miniMapRenderer.render(this._miniMapScene, this._miniMapCamera);
    },
    /**
     * @param {number} location - Draws a circular target area at the next objective's 
     * location.
     */
    addHintSphere: function (location) {
        var diameter = this._hintSphereRadius * 2;
        var pillarPosition = location;
        var sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xf2f28a});
        this._hintSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this._hintSphere.position.x = ((pillarPosition.x - this._hintSphereRadius) + (Math.random() * diameter)) * this._downScalePlayerPosition;
        this._hintSphere.position.y = (-1 * ((pillarPosition.z - this._hintSphereRadius) + (Math.random() * diameter))) * this._downScalePlayerPosition;
        this._hintSphere.name = "SearchArea";
        this._miniMapScene.add(this._hintSphere);
    },
    removeHintSphere: function () {
        if (!this._hintSphere) {
            return;
        }
        var selectedObject = this._miniMapScene.getObjectByName(this._hintSphere.name);
        selectedObject.material.dispose();
        selectedObject.geometry.dispose();
        this._miniMapScene.remove(selectedObject);
    },
};
