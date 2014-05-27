
/**
 * reports on pending changes.
 *
 * @param keys {[{String}]} -- optional -- a list of changes to look for
 * @returns {{Object} || false}
 */
Snap.prototype.pending = function (keys) {
    if (this.simple) return false;
    var found = false;
    if (!keys) {
        keys = _.keys(this._pendingChanges);
    }
    var out = {};
    for (var i = 0; i < keys.length; ++i) {
        var k = keys[i];
        if (this._pendingChanges.hasOwnProperty(k)) {
            if (this._myProps.hasOwnProperty(k)) {
                out[k] = {old: this._myProps[k], pending: this._pendingChanges[k], new: false};
            } else {
                out[k] = {old: null, pending: this._pendingChanges[k], new: true};
            }
            found = true;
        }
    }
    return found ? out : false;
};

Snap.prototype.hasUpdates = function () {
    if (arguments.length) {
        for (var i = 0; i < arguments.length; ++i) {
            if (this._pendingChanges.hasOwnProperty(arguments[i])) {
                return true;
            }
        }
        return false;
    }

    //@TODO: replace with check.nonemptyObject
    for (var p in this._pendingChanges) {
        return true;
    }
    return false;
};

/**
 * loads the pending changes into the Snap
 * @param broadcast {boolean} if true, will also update the Snap's children.
 */
Snap.prototype.update = function (broadcast) {
    if (this.updated) {
        this.updated.dispatch(broadcast);
    }
};

/**
 * the method which actually copies pendingChanges into the current property definitions.
 * If any changeReceptors are waiting for notices, it broacasts to them.
 * @type {number}
 */
var changeSet = 0;
Snap.prototype.updateProperties = function () {
    if (this.simple){
        return;
    }
    _.extend(this._props, this._pendingChanges);
    var pending = this.pending();
    if (pending){
        ++changeSet;
        for (var p in pending){
            if (this.changeReceptors.hasOwnProperty(p)){
                this.changeReceptors[p].dispatch(
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
        doBroadcastUpdateBinding.active = !!broadcast;
    }.bind(this));

    var doBlendsBinding = this.updated.add(this.updateBlends.bind(this));
    // var doUpdatePhysicsBinding = this.updated.add(this.updatePhysics.bind(this));
    var doUpdateObserversBinding = this.updated.add(this.updateObservers.bind(this));
    var doChangesBinding = this.updated.add(this.updateProperties.bind(this));
    var doCleanupBinding = this.updated.add(this.cleanupDeleted.bind(this));
    var doBroadcastUpdateBinding = this.updated.add(this.broadcastUpdate.bind(this));

};