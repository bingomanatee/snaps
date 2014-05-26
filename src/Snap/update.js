Snap.prototype.update = function (broadcast) {
    if (this.updated) {
        this.updated.dispatch(broadcast);
    }
};

var changeSet = 0;
Snap.prototype.updateChanges = function () {
    if (this.simple){
        return;
    }
    _.extend(this._props, this._pendingChanges);
    var pending = this.pending();
    if (pending){
        ++changeSet;
        for (var p in pending){
            if (this._changeSignals.hasOwnProperty(p)){
                this._changeSignals[p].dispatch(
                    pending[p].pending,
                    pending[p].old,
                    pending[p].new,
                    changeSet,
                    pending);
            }
        }
    }

    this.lastChanges = pending;
    this._pendingChanges = {};
};

Snap.prototype.updatePhysics = function () {
    var changes = {};
};

Snap.prototype.cleanupDeleted = function () {
    SNAPS.cleanObj(this._props);
    SNAPS.cleanObj(this._myProps);
};

Snap.prototype.initUpdated = function () {

    this.updated = new signals.Signal();

    /**
     * disable unneeded handlers
     */
    this.updated.add(function (broadcast) {
        if (!this.active) {
            return false;
        }
        doBlendsBinding.active = (this.blendCount > 0);
        //  doUpdatePhysicsBinding.active = (this.physicsCount > 0);
        doUpdateObserversBinding.active = (this.observers.length);
        doBroadcastChangesBinding.active = !!broadcast;
    }.bind(this));

    var doBlendsBinding = this.updated.add(this.updateBlends.bind(this));
    // var doUpdatePhysicsBinding = this.updated.add(this.updatePhysics.bind(this));
    var doUpdateObserversBinding = this.updated.add(this.updateObservers.bind(this));
    var doChangesBinding = this.updated.add(this.updateChanges.bind(this));
    var doBroadcastChangesBinding = this.updated.add(this.broadcastToChildren.bind(this));
    var doCleanupBinding = this.updated.add(this.cleanupDeleted.bind(this));

}