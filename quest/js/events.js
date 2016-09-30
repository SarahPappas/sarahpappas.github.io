function EventEmitter() {
	// has empty object, eventListeners
	this._eventListeners = {};
}

EventEmitter.prototype = {
	addEventListener: function(eventName, eventListener) {
		// if the eventName property does not yet exist on the eventListener we add it, and we point it at an empty array
		if (!this._eventListeners[eventName]) {
			this._eventListeners[eventName] = [];
		}
		// we push the eventListener function in our new array for that eventName property
		this._eventListeners[eventName].push(eventListener);
	},
	emit: function(eventName, eventObject) {
		var eventListeners = this._eventListeners[eventName];
		// if there are any eventListeners, loop through each listener function and call it with the eventObject as the parameter. The event object is whatever thing the event is passing on.
		eventListeners.forEach(function(listenerFunction) {
			listenerFunction(eventObject);
		})
	}
};

