
Snap.prototype.update = function (broadcast) {
    if (!this.active) {
        // shouldn't be possible but just in case
        return;
    }

    if (this.blendCount > 0) {
        this.updateBlends();
    }

    if (this.hasUpdates()) {
        for (i = 0; i < this.observers.length; ++i) {
            this.observers[i].apply();
        }
    } else { // do any time based transitions
        for (i = 0; i < this.observers.length; ++i) {
            if (this.observers[i].startTime > -1) {
                this.observers[i].apply();
            }
        }
    }

    _.extend(this._props, this._pendingChanges);

    this.lastChanges = this.output ? this.pending() : false;

    this._pendingChanges = {};
    if (broadcast) {
        this.broadcast('child', 'update');
    }

    SNAPS.cleanObj(this._props);
    SNAPS.cleanObj(this._myProps);

};