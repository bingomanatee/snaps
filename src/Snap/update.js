/**
 * reports on pending changes.
 *
 * @param keys {[{String}]} -- optional -- a list of changes to look for
 * @returns {{Object} || false}
 */
Snap.prototype.pending = function (keys) {
    if (this.simple) {
        return false;
    }
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

/**
 * will check to see if specific fields have changes
 * if field names passed as arguments
 *
 * @returns {*}
 */
Snap.prototype.hasPendingChanges = function () {
    if (arguments.length) {
        for (var i = 0; i < arguments.length; ++i) {
            if (this._pendingChanges.hasOwnProperty(arguments[i])) {
                return true;
            }
        }
        return false;
    }

    return check.not.emptyObject(this._pendingChanges);
};

/**
 * loads the pending changes into the Snap
 * @param broadcast {boolean} if true, will also update the Snap's children.
 * @param edition {int} the current update cycle; if called in a Space.update cycle will be provided
 */
Snap.prototype.update = function (broadcast, edition) {

    var localUpdate = false;
    if (!edition) {
        localUpdate = true;
        if (this.space.isUpdating()) {
            console.log('attempt to restart a space\'s update cycle');
            return;
        } else {
            edition = this.space.startEdition(this.id);
        }
    }

    this.dispatch('updated', broadcast, edition);

    if (localUpdate) {
        this.space.endEdition(edition);
    }

    return this;
};

/**
 * the method which actually copies pendingChanges into the current property definitions.
 * If any changeReceptors are waiting for notices, it broacasts to them.
 * @type {number}
 */
var changeSet = 0;
_updateProperties = function () {
    if (this.simple) {
        return;
    }
    _.extend(this._props, this._pendingChanges);
    var pending = this.pending();
    if (pending) {
        ++changeSet;
        for (var p in pending) {
            if (this.changeReceptors.hasOwnProperty(p)) {
                //@TODO: changeReceptors should be Termianl
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
    SNAPS.cleanObj(this._props);
    SNAPS.cleanObj(this._myProps);
};

_updatePhysics = function () {
    var changes = {};
};

Snap.prototype.initUpdated = function () {
    this.listen('updated', function (broadcast, edition) {
        if (!this.active) {
            return false;
        }
        if (this.blendCount > 0) {
            this.terminal.receptor.updateBlends.dispatch(broadcast, edition);
            this.terminal.receptor.updateProperties.dispatch('blends');
        }
        if (this.physicsCount > 0) {
            this.terminal.receptor.updatePhysics.dispatch(broadcast, edition);
        }

        if (this.observers.length) {
            this.terminal.receptor.updateObservers.dispatch(broadcast, edition);
        }

        if (check.not.emptyObject(this._pendingChanges)) {
            this.terminal.receptor.updateProperties.dispatch(broadcast, edition);
        }

        if (broadcast) {
            var children = this.nodeChildren();
            for (var c = 0; c < children.length; ++c) {
                children[c].update(broadcast, edition);
            }
        }
    }, this);

    this.listen('updateBlends', this.updateBlends, this);
    this.listen('updatePhysics', _updatePhysics, this);
    this.listen('updateObservers', this.updateObservers, this);
    this.listen('updateProperties', _updateProperties, this);

};
