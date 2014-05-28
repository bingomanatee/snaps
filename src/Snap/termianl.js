Snap.prototype.listen = function () {
    if (this.simple) {
        throw "Simple Snaps do not receive messages";
    }

    var args = _.toArray(arguments);

    this.terminal.listen.apply(this.terminal, args);

    return this;
};

Snap.prototype.dispatch = function (message) {
    if (this.simple) {
        throw new Error('attempt to dispatch ' + message + ' to a simple snap');
    }
    var args = _.toArray(arguments);
    this.terminal.dispatch.apply(this.terminal, args);
};