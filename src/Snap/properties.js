Snap.prototype.has = function(prop, my) {
    return my ? this._myProps.hasOwnProperty(prop) : this._props.hasOwnProperty(prop);
};

Snap.prototype.set = function(prop, value, immediate) {
    if (this.debug) {
        console.log("snap %s setting %s to %s \n", this.id, prop, _.isObject(value) ? JSON.stringify(value) : value);
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

/**
 * combines complex data with existing property value
 *
 * @param prop {string}
 * @param value {various}
 * @param combiner {function} optional == reduces old and new values to gether
 * @returns {self}
 */
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

/**
 * this method instantly erases all traces of a property from the snap.
 * if propogate, recurses to children.
 * @param prop {string}
 * @param propogate {boolean}
 * @param silent {boolean}  -- suppress update alerts
 */
Snap.prototype.clearProp = function(prop, propogate, silent) {

    var snaps = [this];

    while (snaps.length) {
        var snap = snaps.shift();
        if (snap.has(prop)) {
            var oldValue = snap.get(prop);
            delete snap._props[prop];

            if (snap._pendingChanges.hasOwnProperty(prop)) {
                delete snap._pendingChanges[prop];
            }
            if (snap._myProps.hasOwnProperty(prop)) {
                delete snap._myProps[prop];
            }

            if (!silent) {
                snap.propChangeTerminal.dispatch(prop,
                    SNAPS.DELETE,
                    oldValue,
                    false,
                    null,
                    null);
            }
        }

        if (propogate) {
            var children = snap.nodeChildren();
            if (children.length) {
                snaps.push.apply(snaps, children)
            }
        }
    }
    return this;
};
