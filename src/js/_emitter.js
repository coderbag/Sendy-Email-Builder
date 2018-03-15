'use strict';

// Custom events emitter
// Used to hook different events and actions inside of Email Builder
function Emitter() {
    this.events = {};
}

Emitter.prototype.on = function (type, listener) {
    this.events[type] = this.events[type] || [];
    this.events[type].push(listener);

}

Emitter.prototype.emit = function (type, atts = null) {
    if (this.events[type]) {
        this.events[type].forEach(function (listener) {
            listener(atts);
        });
    }
}


// Export ContentEditor object
module.exports = new Emitter();