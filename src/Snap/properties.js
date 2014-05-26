
Snap.prototype.merge = function (prop, value, combiner) {
    if (!this.has(prop)) {
        return this.set(prop, value);
    }

    var oldValue = this.get(prop);
    if (combiner) {
        value = combiner(value, oldValue);
    } else if (_.isArray(prop)) {
        if (_.isArray(oldValue)) {
            value = (oldValue.concat(value));
        }
    } else if (_.isObject(value)) {
        if (_.isObject(oldValue)) {
            _.defaults(value, oldValue);
        }
    } // otherwise, set

    this.set(prop, value);
};

/**
 * applies an update for a single property; only broacasts if that property has an update.
 *
 * @param prop
 * @param broadcast
 */

Snap.prototype.updateProp = function (prop, broadcast) {
    if (this._pendingChanges.hasOwnProperty(prop)) {
        this._props[prop] = this._pendingChanges[prop];
        delete(this._pendingChanges[prop]);
        if (broadcast) {
            this.broadcast('child', 'update');
        }
    }
};

Snap.prototype.has = function (prop) {
    return this._props.hasOwnProperty(prop);
};

Snap.prototype.set = function (prop, value, immediate) {
    if (this.simple){
        this._props[prop] = value;
        return;
    }
    this._myProps[prop] = value;
    this._pendingChanges[prop] = value;
    this.broadcast('child', 'inherit', prop, value);
    return this;
};

Snap.prototype.del = function (prop) {
    this.set(prop, SNAPS.DELETE);
    return this;
};

Snap.prototype.setAndUpdate = function (prop, value) {
    this.set(prop, value);
    this.update(true);
    return this;
};

Snap.prototype.get = function (prop, pending) {
    if (pending) {
        if (this._pendingChanges.hasOwnProperty(prop)) {
            return this._pendingChanges[prop];
        }
    }
    return this._props[prop];
};