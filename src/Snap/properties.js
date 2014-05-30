Snap.prototype.has = function(prop, my) {
    return my ? this._myProps.hasOwnProperty(prop) : this._props.hasOwnProperty(prop);
};

Snap.prototype.set = function(prop, value, immediate) {
    if (this.debug){
        console.log('snap %s setting %s to %s', this.id, prop, _.isObject(value) ? JSON.stringify(value) : value);
    }
    if (this.simple) {
        this._props[prop] = value;
        return this;
    }
    this.retireOtherBlends(prop);
    this._myProps[prop] = value;

    if (this.space.editionStarted > this.space.editionCompleted) {
        this.internalUpdate(prop, value);
    } else if (immediate) {
        this._props[prop] = value;
    } else {
        this._pendingChanges[prop] = value;
    }

    var ch = this.nodeChildren();
    for (var c = 0; c < ch.length; ++c) {
        ch[c].inherit(prop, value, immediate);
    }
    return this;
};

Snap.prototype.get = function(prop, pending) {
    if (pending && (!this.simple)) {
        if (this._pendingChanges.hasOwnProperty(prop)) {
            return this._pendingChanges[prop];
        }
    }
    return this._props[prop];
};

Snap.prototype.internalUpdate = function(prop) {
    var isNew = !this._props.hasOwnProperty(prop);
    var oldValue = this._props[prop];
    var value;
    if (arguments.length > 1) {
        value = arguments[1];
    } else if (this._pendingChanges.hasOwnProperty(prop)) {
        value = this._pendingChanges[prop];
    } else {
        return;
    }
    this._props[prop] = value;
    delete this._pendingChanges[prop];

    this.propChangeTerminal.dispatch(prop,
        value,
        oldValue,
        isNew,
        null,
        null);

    this._props[prop] = value;
};

Snap.prototype.inherit = function(prop, value, immediate) {
    if (this._myProps.hasOwnProperty(prop)) {
        return;
    }

    if (this.space.editionStarted > this.space.editionCompleted) {
        this.internalUpdate(prop, value);

    } else if (immediate) {
        this._props[prop] = value;
    } else {
        this._pendingChanges[prop] = value;
    }

    var ch = this.nodeChildren();
    for (var c = 0; c < ch.length; ++c) {
        ch[c].inherit(prop, value, immediate);
    }
    return this;
};

Snap.prototype.del = function(prop) {
    this.set(prop, SNAPS.DELETE);
    return this;
};

Snap.prototype.setAndUpdate = function(prop, value) {
    this.set(prop, value);
    if (!this.simple) {
        this.update(true);
    }
    return this;
};

Snap.prototype.merge = function(prop, value, combiner) {
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

    return this.set(prop, value);
};
/**
 * returns a copy fo the current state of the Snaps' properties.
 *
 * @returns {Object}
 */
Snap.prototype.state = function() {
    return _.clone(this._props);
};
