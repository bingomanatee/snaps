/**
 * A Snap ("Synapse") is a collection of properties, related to other Snaps through relationships.
 *
 * @param space {SNAPS.Space} a collection of snaps
 * @param id {int} the place in the space array that the snap exists in
 * @constructor
 */

function Snap(space, id) {
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.id = SNAPS.assert.int(id, 'id must be a number');

    /**
     * _props are the public properties of the snap. Do not access this directly -- use get and set.
     * @type {Object}
     */

    this._props = {};

    /**
     * _myProps are properties whose value has been set at this snap -- as distinct
     * from properties that are inherited.
     * @type {Object}
     */
    this._myProps = {};

    /**
     * properties that have been changed through set()
     * @type {{}}
     */
    this._pendingChanges = {};

    /**
     * Observers are hooks that should run when a given property changes.
     * @type {Array}
     */
    this.observers = [];

    /**
     * rels (relationships) are collections of pointers to other Snaps.
     * Some of these include classic 'parent', 'child' relationships --
     * others can be any sort of internal relationships you may want.
     *
     * @type {Array}
     */
    this.rels = [];

    this.active = true;

    this.blendCount = 0;
}

Snap.prototype.$TYPE = 'SNAP';

Snap.prototype.state = function () {
    return _.clone(this._props);
};

Snap.prototype.getRels = function (relType) {
    return _.reduce(this.rels, function (list, rel) {
        if (rel.relType == relType) {
            list.push(rel);
        }
        return list;
    }, []);
};

Snap.prototype.rel = function (relType, toId, meta) {
    var rel = new SNAPS.Rel({
        space: this.space,
        relType: relType,
        from: this,
        to: toId,
        order: this.getRels(relType).length
    }, meta);
    this.rels.push(rel);
    return rel;
};

/**
 * gets a subset of relationships;
 * can filter by relType (if string),
 * toId (if number), or functionally.
 * Any number of filters can be passed; if none are, all rels are returned;
 * @returns {Array}
 */
Snap.prototype.getRels = function () {
    if (!arguments.length) {
        return this.rels.slice();
    }

    var i;
    var out;
    var rels = this.rels;

    for (var a = 0; a < arguments.length; ++a) {
        out = [];
        var filter = arguments[a];
        if (_.isString(filter)) {
            for (i = 0; i < rels.length; ++i) {
                if (rels[i].relType == filter) {
                    out.push(rels[i]);
                }
            }
        } else if (_.isNumber(filter)) {
            for (i = 0; i < rels.length; ++i) {
                if (rels[i].toId == filter) {
                    out.push(rels[i]);
                }
            }
        } else if (_.isFunction(filter)) {
            out = _.filter(rels, filter);
        }
        rels = out;
    }

    return out;
};

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

Snap.prototype.removeRel = function (rel) {

}

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
    if (pending){
        if (this._pendingChanges.hasOwnProperty(prop)){
            return this._pendingChanges[prop];
        }
    }
    return this._props[prop];
};

/**
 * check one or more properties for changes; enact handler when changes happen
 *
 * @param field
 * @param rule
 * @param meta
 */
Snap.prototype.watch = function (field, handler, meta) {
    var o = new SNAPS.Observer({target: this, watching: field}, handler, meta);
    this.observers.push(o);
    return o;
};

/**
 * as above -- only complete freedom of observation
 * @param props
 * @param rule
 * @param meta
 */
Snap.prototype.observe = function (props, handler, meta) {
    if (!props.target) {
        props.target = this;
    }
    var o = new SNAPS.Observer(props, handler, meta);
    this.observers.push(o);
    return o;
};

Snap.prototype.removeObserver = function (obs) {
    this.observers = _.reject(this.observers, function (o) {
        return o.id == obs.id;
    });
    obs.deactivate();
};

/**
 * adds (and creates if necessary) a child snap.
 *
 * @param snap {Snap}
 * @returns {*}
 */
Snap.prototype.addChild = function (snap) {
    if (snap) {
        snap.unparent();
    } else {
        snap = this.space.snap();
    }
    snap.rel('parent', this);
    this.rel('child', snap);
    return snap;
};

Snap.prototype.children = function () {
    var out = [];
    for (var i = 0; i < this.rels.length; ++i) {
        if (this.rels[i].relType == 'child') {
            out.push(this.rels[i].toSnap());
        }
    }
    return out;
};

Snap.prototype.unparent = function () {
    var parentRels = this.getRels('parent');
    for (var i = 0; i < parentRels.length; ++i) {
        var parent = parentRels[i].toSnap();
        parent.adoptChildren(this);
        parent.cleanseRels();
    }

};

Snap.prototype.adoptChildren = function (snap) {

    var childRels = this.getRels(snap.id, 'child');
    for (var p = 0; p < childRels.length; ++p) {
        childRels[p].active = false;
    }

    var snapchildRels = snap.getRels('child');

    for (var s = 0; s < snapchildRels.length; ++s) {
        this.addChild(snapchildRels[s].toSnap());
        snapchildRels[s].active = false;
    }
    snap.cleanseRels();
};

Snap.prototype.cleanseRels = function () {
    this.rels = _.filter(this.rels, function (r) {
        return r.active;
    });
};

Snap.prototype.remove = function () {
    this.active = false;
    this.unparent();
    this._myProps = null;
    this._pendingChanges = null;
    this.rels = null;
};

Snap.prototype.removeRel = function (rel) {
    this.rels = _.reject(this.rels, function (r) {
        return r.id == rel.id;
    });
    rel.active = false;
};

Snap.prototype.addOutput = function (handler) {
    if (!this.output) {
        this.output = new signals.Signal();
    }

    this.output.add(handler);
};

Snap.prototype.pending = function (keys) {
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

Snap.prototype.broadcast = function (target, message, prop, value) {
    for (var i = 0; i < this.rels.length; ++i) {
        var rel = this.rels[i];
        if (rel.relType == target) {
            rel.broadcast(this.id, message, prop, value);
        }
    }
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

//@#TODO: replace with signals API
Snap.prototype.hear = function (message, prop, value) {
    switch (message) {
        case 'inherit':
            if (this._myProps.hasOwnProperty(prop)) {
                return;
            }
            this._pendingChanges[prop] = value;

            this.broadcast('child', 'inherit', prop, value);
            break;

        case 'update':
            if (prop) {
                if (this.hasUpdates(prop)) {
                    this.updateProp(prop, true);
                }
            } else {
                if (this.hasUpdates()) {
                    this.update(true);
                }
            }
    }
};

Snap.prototype.family = function () {
    var out = {id: this.id};

    out.children = _.map(this.children(),
        function (child) {
            return child.family();
        });

    return out;
};

Snap.prototype.blend = function (prop, endValue, time, blend) {
    debugger;
    var valueSnap = this.space.snap();
    valueSnap.set('prop', prop);
    var startValue = this.has(prop) ? parseFloat(this.get(prop)) || 0 : 0;
    valueSnap.set('startValue', startValue)
    .set('endValue', endValue)
    .set('startTime', this.space.time)
    .set('endTime', this.space.time + Math.max(parseInt(time), 1))
    .set('blend', blend);
    this.rel('blend', valueSnap, {prop: prop});
    this.blendCount++;
}

/** ordinarily SNAPS is a class that is only created through a space factory.
 * This backend accessor is created to access Snap only for testing purposes
 *
 */
SNAPS.Snap = function (why) {
    if (why == 'TESTING') {
        return Snap;
    }
};

