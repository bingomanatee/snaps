(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('signals'));
    }
    else if(typeof define === 'function' && define.amd) {
        define('SNAPS', ['_', 'signals'], factory);
    }
    else {
        root['SNAPS'] = factory(root._, root.signals);
    }
}(this, function(_, signals) {

var SNAPS = {

    signals: signals

};
/**
 *
 * The assert methods are intended to inforce type integrity; they throw an error if the object does not pass
 * the type filter; otherwise they echo the input. As such they can be used inline during assignment.
 *
 * The alternative use of the filters is by passing a function; if the test fails, the result of the function
 * (which is passed the original arguments) is returned.
 */

SNAPS.assert = {

    $TYPE: function(obj, $type, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('$TYPE', args);
        }

        var objType = SNAPS.assert.prop(obj, '$TYPE');
        if (objType == $type) {
            return obj;
        } else {
            throw 'object does not have a $TYPE ' + $type;
        }
    },

    prop: function(obj, prop, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('prop', args);
        }
        obj = SNAPS.assert.type(obj, 'object');
        prop = SNAPS.assert.type(prop, 'string', 'SNAPS.assert.prop.argument 2 must be a string');
        if (obj && prop){
            if (obj.hasOwnProperty(prop) || (typeof(obj[prop]) != 'undefined')){
                return obj[prop];
            } else {
                throw (message || 'object does not have a property ' + prop);
            }
        }
    },

    _assertCatch: function(name, args){
        var catcher = args.pop();
        try {
            return SNAPS.assert[name].apply(SNAPS.assert, args);
        } catch(err){
            return catcher(args, err, 'type');
        }
    },

    number: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('number', args);
        }
        if (!_.isNumber(item)) {
            throw (message || 'must be a number');
        }
        return item;
    },

    'function': function(item, message){
        if(arguments.length > 1 && typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('function', args);
        }
        if (!_.isFunction(item)) {
            throw (message || 'must be a function');
        }
        return item;
    },

    int: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('number', args);
        }
        if (!_.isNumber(item)) {
            throw (message || 'must be a number');
        }
        if (item % 1){
            throw (message || 'must be an integer');
        }
        return item;
    },

    string: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('string', args);
        }
        if (!_.isString(item)) {
            throw (message || 'must be a string');
        }
        return item;
    },

    object: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('object', args);
        }
        if (!_.isObject(item)) {
            throw (message || 'must be an object');
        }
        return item;
    },

    array: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('array', args);
        }

        if (!_.isArray(item)) {
            throw (message || 'must be an array');
        }
        return item;
    },

    arrayForce: function(item){
        return _.isArray(item) ? item : [item];
    },

    type: function (item, typeName, message) {
        switch (typeName) {
            case 'number':
                return SNAPS.assert.number(item, message);
                break;

            case 'string':
                return SNAPS.assert.string(item, message);
                break;

            case 'object':
                return SNAPS.assert.object(item, message);
                break;

            case 'array':
                return SNAPS.assert.array(item,message);
        }
        return item;
    },

    notempty: function(item, typeName, message){
        var args = _.toArray(arguments);
        if(typeof(arguments[arguments.length -1]) == 'function'){
            return SNAPS.assert._assertCatch('notempty', args);
        }
        switch (typeName) {
            case 'string':
            case 'array':

                    if (item.length < 1) {
                        throw message || 'must be not empty';
                    }

                break;

            case 'number':
                return item != 0;
                break;

            default:
                throw "cannot understand size type " + typeName;
        }
        return item;
    },

    size: function (item, typeName, message, min, max) {
        var args = _.toArray(arguments);
        if(typeof(arguments[arguments.length -1]) == 'function'){
            return SNAPS.assert._assertCatch('size', args);
        }
        if (arguments.length < 4) {
            min = 1;
            max = null;
        }
        switch (typeName) {
            case 'string':
            case 'array':

                if (min != null) {
                    if (item.length < min) {
                        throw message || 'must be at least ' + min;
                    }
                }

                if (max != null) {
                    if (item.length > max) {
                        throw message || 'must be no greater than ' + max;
                    }
                }

                break;

            case 'number':

                if (min != null) {
                    if (item < min) {
                        throw message || 'must be at least ' + min;
                    }
                }

                if (max != null) {
                    if (item > max) {
                        throw message || 'must be no greater than ' + max;
                    }
                }

                break;

            default:

                throw "cannot understand size type " + typeName;
        }
        return item;
    }


};
SNAPS.Rel = function (params, meta) {
    var space = SNAPS.assert.prop(params, 'space');
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');

    var fromId = SNAPS.assert.prop(params, 'from');
    if (!_.isNumber(fromId)) {
        fromId = SNAPS.assert.$TYPE(fromId, 'SNAP').id;
    }
    this.fromId = fromId;

    var toId = SNAPS.assert.prop(params, 'to');
    if (!_.isNumber(toId)) {
        toId = SNAPS.assert.$TYPE(toId, 'SNAP').id;
    }
    this.toId = toId;

    var relType = SNAPS.assert.prop(params, 'relType');
    relType = SNAPS.assert.string(relType, 'relType must be string');
    this.relType = SNAPS.assert.notempty(relType, 'string', 'relType must not be empty');
    this.active = true;
};

SNAPS.Rel.prototype.broadcast = function (fromId, message, property, value) {
    this.toSnap().hear(message, property, value);
};

SNAPS.Rel.prototype.toSnap = function () {
    return this.space.snap(this.toId, true);
};

SNAPS.Rel.prototype.toJSON = function(){
    return {fromId: this.fromId, toId: this.toId, relType: this.relType}
};
/*
 * Observers are called before update occurs
 * if one of the properties they are watching is called.
 * The results of their handler are applied over the updates collection.
 * Thus, earlier observers may trigger later observers.
 *
 * Some observers are triggered by the passage of time --
 * if a startTime and endTime are passed, the observer will only fire within a set time block
 * and will look for init and after methdos in meta to sandwich their calls.
 *
 */

var obsId = 0;
SNAPS.Observer = function (props, handler, meta) {
    this.id = ++obsId;
    props = SNAPS.assert.object(props);
    var target = props.target;
    var space = SNAPS.assert.prop(props, 'space', function () {
        return SNAPS.assert.prop(target, 'space')
    });
    this.space = SNAPS.assert.$TYPE(space, 'SPACE', function () {
        debugger;
    });
    this.target = target;
    this.watching = SNAPS.assert.arrayForce(props.watching);

    if (props.startTime) {
        this.startTime = props.startTime;
        this.endTime = -1;
        if (props.duration) {
            this.endTime = this.startTime + Math.max(1, props.duration);
        } else if (props.endTime) {
            this.endTime = Math.max(this.endTime + 1, props.endTime);
        } else {
            this.endTime = this.startTime + 1;
        }
    } else {
        this.startTime = this.endTime = -1;
    }

    if (this.watching.length) {
        SNAPS.assert.$TYPE(this.target, 'SNAP');
    }

    this.handler = SNAPS.assert.function(handler, function () {
        return _.identity
    });
    this.meta = meta || {};

    this.active = true;
};

SNAPS.Observer.prototype.watchTime = function (startDelay, duration) {
    if (startDelay > 0) {
        this.meta.startTime = this.space.time + startDelay;
        if (duration > 0) {
            this.meta.endTime = this.space.time + startDelay + duration;
        }
    } else if (duration > 0) {
        this.meta.endTime = this.space.time + duration;
    }
};

SNAPS.Observer.prototype.apply = function (target) {
    target = target || this.target;

    if (this.startTime > -1) {
        this.applyTime(target);
    } else if (this.watching.length) {
        var changed = (target).pending(this.watching);
        if (changed) {
            this.handler.call(target, changed)
        }
    } else { // no watching targets
        // always apply
        this.handler.call(target, this)
    }

};

SNAPS.Observer.prototype.remove = function () {
    if (this.target) {
        this.target.removeObserver(this);
    }
};

SNAPS.Observer.prototype.deactivate = function () {
    this.active = false;
};

SNAPS.Observer.prototype.applyTime = function (target) {
    if (this.space.time < this.startTime) {
        if (this.meta.before && !this.meta.beforeCalled) {
            this.meta.before.call(target);
            this.meta.beforeCalled = true;
        }
        // too early
        return;
    }
    if (this.space.time > this.endTime) {
        // too late
        if (this.meta.after) {
            this.meta.after.call(target);
        }
        this.remove();
    } else {
        // active
        if (this.meta.init && (!this.meta.initCalled)) {
            this.meta.init.call(target);
            this.meta.initCalled = true;
        }

        debugger;
        var progress = (this.space.time - this.startTime) / (this.endTime - this.startTime);
        this.handler.call(target, progress);
    }
}
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
}

Snap.prototype.$TYPE = 'SNAP';

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

Snap.prototype.update = function (broadcast) {
    if (!this.active) {
        // shouldn't be possible but just in case
        return;
    }

    var i;

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

    if (this.output){
        this.lastChanges = this.pending();
    } else {
        this.lastChanges = false;
    }

    this._pendingChanges = {};
    if (broadcast) {
        this.broadcast('child', 'update');
    }
};

/**
 * applies an update for a single property; only broacasts if that property has an update.
 *
 * @param property
 * @param broadcast
 */

Snap.prototype.updateProp = function (property, broadcast) {
    if (this._pendingChanges.hasOwnProperty(property)) {
        this._props[property] = this._pendingChanges[property];
        delete(this._pendingChanges[property]);
        if (broadcast) {
            this.broadcast('child', 'update');
        }
    }
};

Snap.prototype.set = function (property, value) {
    this._myProps[property] = value;
    this._pendingChanges[property] = value;
    this.broadcast('child', 'inherit', property, value);
};

Snap.prototype.setAndUpdate = function (property, value) {
    this.set(property, value);
    this.update(true);
};

Snap.prototype.get = function (prop) {
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

Snap.prototype.removeObserver = function(obs){
    this.observers = _.reject(this.observers, function(o){
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

Snap.prototype.addOutput = function(handler){
    if (!this.output){
        this.output = SNAP.signals.Signal();
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

Snap.prototype.broadcast = function (target, message, property, value) {
    for (var i = 0; i < this.rels.length; ++i) {
        var rel = this.rels[i];
        if (rel.relType == target) {
            rel.broadcast(this.id, message, property, value);
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

    for (var p in this._pendingChanges) {
        return true;
    }
    return false;
};

Snap.prototype.hear = function (message, property, value) {
    switch (message) {
        case 'inherit':
            if (this._myProps.hasOwnProperty(property)) {
                return;
            }
            this._pendingChanges[property] = value;

            this.broadcast('child', 'inherit', property, value);
            break;

        case 'update':
            if (property) {
                if (this.hasUpdates(property)) {
                    this.updateProp(property, true);
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

/** ordinarily SNAPS is a class that is only created through a space factory.
 * This backend accessor is created to access Snap only for testing purposes
 *
 */
SNAPS.Snap = function (why) {
    if (why == 'TESTING') {
        return Snap;
    }
};


var Space = function () {
    this.id = 1;
    this.snaps = [];
    this.resetTime();
};

Space.prototype.$TYPE = 'SPACE';

Space.prototype.count = function () {
    return this.snaps.length;
};

Space.prototype.resetTime = function () {
    this.start = new Date().getTime;
};

Space.prototype.snap = function (id, throwIfMissing) {
    if (arguments.length) {
        if (!this.snaps[id] && throwIfMissing) {
            throw 'cannot find snap ' + id;
        }
        return this.snaps[id];
    }
    var snap = new Snap(this, this.snaps.length);
    this.snaps.push(snap);
    return snap;
};

Space.prototype.nextTime = function () {
    this.time = new Date().getTime() - this.start();
};

Space.prototype.update = function (next) {
    if (next) {
        this.nextTime();
    }

    var i;
    var snap;

    var o1 = -1;
    var o2 = -1;

    for (i = 0; i < this.snaps.length; ++i) {
        snap = this.snaps[i];
        if (snap.active) {
            if (snap.output) {
                if (o1 == -1) {
                    o1 = i;
                }
                o2 = i;
            }
            snap.update();
        }
    }

    for (i = o1; i < o2; ++i) {
        snap = this.snaps[i];
        if (snap.active && snap.output) {
            snap.output.dispatch(snap, this, this.time);
        }
    }

};

SNAPS.space = function () {
    return new Space();
};

return SNAPS;

}));
