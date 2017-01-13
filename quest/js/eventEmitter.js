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
 
function EventEmitter() {
    // Object whose keys are event names and values are arrays of event listener functions.
    this._eventListeners = {};
}

EventEmitter.prototype = {
    addEventListener: function (eventName, eventListener) {
        // If this we're registering the first event listener for this event 
        // name, create an array to hold event listeners.
        if (!this._eventListeners[eventName]) {
            this._eventListeners[eventName] = [];
        }

        // Add the event listener to the array for the event name.
        this._eventListeners[eventName].push(eventListener);
    },
    emit: function (eventName, eventObject) {
        var eventListeners = this._eventListeners[eventName];
        // If there are any eventListeners, loop through each listener function 
        // and call it with the eventObject as the parameter.
        eventListeners.forEach(function (listenerFunction) {
            listenerFunction(eventObject);
        })
    }
};

