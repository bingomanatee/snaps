(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('signals'));
}
else if(typeof define === 'function' && define.amd) {
    define(function(require, exports, module) {
        module.exports = factory(require('lodash'), require('signals'));
    });
} else {
    root['SNAPS'] = factory(root._, root.signals);
}
}(this, function(_, signals) {

    var SNAPS = {
    signals: signals,
    DELETE: {SNAP_DELETE: true}, // an imperitave to remove a value from a collection.
    INVALID_SNAP_ID: {invalid: true},
    cleanObj: function(o) {
        for (var p in o) {
            if (o[p] === SNAPS.DELETE) {
                delete o[p];
            }
        }

    },
    typeAliases: {
        SNAP: ['SNAP']
    },
    isSnap: function(obj) {
        if (typeof(obj) != 'object') {
            return 'non object';
        } else if (!obj.$TYPE) {
            return 'non-$TYPEd object';
        } else if (obj.$TYPE == 'SNAP') {
            return false;
        } else {
            for (var s = 0; s < SNAPS.typeAliases.SNAP.length; ++s) {
                if (obj.$TYPE == SNAPS.typeAliases.SNAP[s]) {
                    return false;
                }
            }
            return 'non-SNAP type object';
        }
    }
}

/**
 * This is a router for signals;
 * as Signal is not designed to filter messages by type
 * the Terminal does this for a suite of signals.
 */

function Terminal (initial, locked) {
    this.receptor = {};
    this.locked = false;
    if (initial) {
        for (var what in initial) {
            var handlers = initial[what];
            if (typeof handlers == 'function') {
                this.listen(what, handlers);
            } else {
                handlers = SNAPS.assert.array(handlers);
                for (var h = 0; h < handlers.length; ++h) {
                    this.listen(what, handlers[h]);
                }
            }
        }
    }
    if (locked) {
        this.locked = locked;
    }
}

Terminal.prototype.profile = function () {
    return {locked: this.locked || [],
        listeners: _.map(this.receptor, function (signal, what) {
            return {
                event: what,
                handlers: signal._bindings.length,
                active: signal.active
            }
        })
    }
};

Terminal.prototype.setActive = function (what, isActive) {
    if (arguments.length < 2) {
        isActive = true;
    }

    if (this.receptor[what]) {
        this.receptor[what].active = isActive;
    }
};

Terminal.prototype.listenOnce = function () {
    var args = _.toArray(arguments);
    var what = SNAPS.assert.notempty(args.shift(), 'string');
    this.checkWhat(what, true);

    if (!this.receptor[what]) {
        this.receptor[what] = new signals.Signal();
    }

    if (check.array(args[0])) {
        this.receptor[what].addOnce.apply(this.receptor[what], args[0]);
    } else {
        this.receptor[what].addOnce.apply(this.receptor[what], args);
    }
};

Terminal.prototype.checkLocks = function (what, doErr) {
    if (this.locked && (this.locked.length)) {
        for (var l = 0; l < this.locked.length; ++l) {
            if (what == this.locked[l]) {
                if (doErr) {
                    throw new Error('attempt to add listener to Terminal with locked listener ' + what);
                } else {
                    return false;
                }
            }
        }
    }
};

Terminal.prototype.checkWhat = function (what, doErr) {
    if (!this.checkLocks(what, doErr)) {
        return 0;
    }
    return this.receptor[what] ? this.receptor[what]._bindings.length : 0;
};

Terminal.prototype.listen = function () {
    var args = _.toArray(arguments);
    var what = SNAPS.assert.notempty(args.shift(), 'string');
    var receptor;
    if (!this.receptor[what]) {
        this.receptor[what] = receptor = new signals.Signal();
    } else {
        this.checkLocks(what, true);
        receptor = this.receptor[what];
    }

    if (check.array(args[0])) {
         SNAPS.assert.fn(args[0][0]);
        receptor.add.apply(receptor, args[0]);
    } else {
         SNAPS.assert.fn(args[0]);
        receptor.add.apply(receptor, args);
    }
};

Terminal.prototype.dispatch = function () {
    var args = _.toArray(arguments);
    var what = SNAPS.assert.notempty(args.shift(), 'string');

    if (this.receptor[what]) {
        if (this.receptor[what].active) {
            if (this.receptor[what]._bindings.length > 0) {
                return this.receptor[what].dispatch.apply(this.receptor[what], args);
            } else {
                return 'no bindings';
            }
        } else {
            return 'inactive signal';
        }
    } else {
        return 'no signal';
    }
};

SNAPS.Terminal = Terminal;


/**
 * taken from node module check-types
 */

!function(n){"use strict";function t(n,r){var e;L.object(n),L.object(r);for(e in r)if(r.hasOwnProperty(e)){if(n.hasOwnProperty(e)===!1||typeof n[e]!=typeof r[e])return!1;if(u(n[e])&&t(n[e],r[e])===!1)return!1}return!0}function r(n,t){return"undefined"==typeof n||null===n?!1:f(t)&&n instanceof t?!0:!1}function e(n){var t;if(u(n)){for(t in n)if(n.hasOwnProperty(t))return!1;return!0}return!1}function u(n){return"object"==typeof n&&null!==n&&o(n)===!1&&a(n)===!1}function i(n,t){return n&&n.length===t}function o(n){return Array.isArray?Array.isArray(n):"[object Array]"===Object.prototype.toString.call(n)}function a(n){return"[object Date]"===Object.prototype.toString.call(n)}function f(n){return"function"==typeof n}function c(n){return m(n)&&/^https?:\/\/.+/.test(n)}function l(n){return m(n)&&/^git\+(ssh|https?):\/\/.+/.test(n)}function b(n){return m(n)&&/\S+@\S+/.test(n)}function m(n){return p(n)&&""!==n}function p(n){return"string"==typeof n}function s(n){return h(n)&&(n%2===1||n%2===-1)}function y(n){return h(n)&&n%2===0}function v(n){return h(n)&&n%1===0}function d(n){return h(n)&&n%1!==0}function g(n){return h(n)&&n>0}function I(n){return h(n)&&0>n}function h(n){return"number"==typeof n&&isNaN(n)===!1&&n!==Number.POSITIVE_INFINITY&&n!==Number.NEGATIVE_INFINITY}function N(n,t){var r,e,i={};L.object(n),L.object(t);for(r in t)t.hasOwnProperty(r)&&(e=t[r],f(e)?i[r]=e(n[r]):u(e)&&(i[r]=N(n[r],e)));return i}function j(n){var t,r;L.object(n);for(t in n)if(n.hasOwnProperty(t)){if(r=n[t],u(r)&&j(r)===!1)return!1;if(r===!1)return!1}return!0}function O(n){var t,r;L.object(n);for(t in n)if(n.hasOwnProperty(t)){if(r=n[t],u(r)&&O(r))return!0;if(r===!0)return!0}return!1}function w(n,t){var r;for(r in t)t.hasOwnProperty(r)&&(n[r]=t[r]);return n}function P(n,t){return function(){var r;if(n.apply(null,arguments)===!1)throw r=arguments[arguments.length-1],new Error(m(r)?r:t)}}function A(n){return function(){return null===arguments[0]||void 0===arguments[0]?!0:n.apply(null,arguments)}}function S(n){return function(){return!n.apply(null,arguments)}}function U(n){return k(n,F)}function k(n,t){var r,e={};for(r in t)t.hasOwnProperty(r)&&(e[r]=n(t[r],T[r]));return e}function E(t){n.check=t}var T,F,R,L,V,Y,_={credit:"TAKEN FROM npm module check-types",homepage:"https://github.com/philbooth/check-types.js"};F={like:t,instance:r,emptyObject:e,object:u,length:i,array:o,date:a,fn:f,webUrl:c,gitUrl:l,email:b,unemptyString:m,string:p,evenNumber:y,oddNumber:s,positiveNumber:g,negativeNumber:I,intNumber:v,floatNumber:d,number:h},T={like:"Invalid type",instance:"Invalid type",emptyObject:"Invalid object",object:"Invalid object",length:"Invalid length",array:"Invalid array",date:"Invalid date",fn:"Invalid function",webUrl:"Invalid URL",gitUrl:"Invalid git URL",email:"Invalid email",unemptyString:"Invalid string",string:"Invalid string",evenNumber:"Invalid number",oddNumber:"Invalid number",positiveNumber:"Invalid number",negativeNumber:"Invalid number",intNumber:"Invalid number",floatNumber:"Invalid number",number:"Invalid number"},R={map:N,every:j,any:O},R=w(R,F),R.credit=_,L=U(P),V=U(A),Y=U(S),L.maybe=k(P,V),L.not=k(P,Y),E(w(R,{verify:L,maybe:V,not:Y}))}(this);

/**
 *
 * This assert library is attened to allow in-context checking of type
 * upon assignment; it will return the input if the type checking passes.
 *
 * If the type checking does NOT pass AND the last argument is a function, that function is called (and its result passed.)
 * If the type checking does NOT pass and the last argument is NOT a function an error is thrown.
 * if message is set, it's set to the error's message value; otherwise an error defined by the check-types API is thrown.
 *
 * Alternatively, the SNAPS.assert.or method always returns a value -- either the input (if it is valid) or the third argument (if it is not).
 *
 */

SNAPS.assert = {

    $TYPE: function (obj, $type, message) {
        if (typeof(arguments[arguments.length - 1]) == 'function') {
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

    prop: function (obj, prop, message) {
        if (typeof(arguments[arguments.length - 1]) == 'function') {
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('prop', args);
        }
        obj = SNAPS.assert.obj(obj);
        prop = SNAPS.assert.string(prop, 'SNAPS.assert.prop.argument 2 must be a string');
        if (obj && prop) {
            if (obj.hasOwnProperty(prop) || (typeof(obj[prop]) != 'undefined')) {
                return obj[prop];
            } else {
                throw (message || 'object does not have a property ' + prop);
            }
        }
    },

    _assertCatch: function (name, args) {
        var catcher = args.pop();
        try {
            return SNAPS.assert[name].apply(SNAPS.assert, args);
        } catch (err) {
            return catcher(args, err, 'type');
        }
    },

    number: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.number(item) ? item : response();
        } else {
            check.verify.number(item, message);
            return item;
        }
    },

    'function': function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.fn(item) ? item : response();
        } else {
            check.verify.fn(item, message);
            return item;
        }
    },

    fn: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.fn(item) ? item : response();
        } else {
            check.verify.fn(item, message);
            return item;
        }
    },

    int: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.intNumber(item, message || 'Invalid integer') ? item : response();
        } else {
            check.verify.intNumber(item, message || 'Invalid integer');
            return item;
        }
    },

    or: function (typeName, item, alt) {

        switch (typeName) {
            case 'number':
                return check.number(item) ? item : alt;
                break;

            case 'array':
                return check.array(item) ? item : alt;

                break;

            case 'function':

                return check.fn(item) ? item : alt;
                break;

            case 'string':
                return check.string(item) ? item : alt;
                break;

            case 'object':
                return check.object(item) ? item : alt;
                break;

            default:
                throw new Error('cannot or type ' + typeName);
        }
    },

    arrayIndex: function (item, array, message) {
        if (typeof array == 'string') {
            message = array;
            array = null;
        }
        check.verify.intNumber(item, message);

        if (item < 0) {
            throw message || 'array index must be >= 0';
        }
        if (array && (item >= array.length)) {
            throw message || 'index not in array';
        }
        return item;
    },

    string: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.string(item, message) ? item : response();
        } else {
            check.verify.string(item, message);
            return item;
        }
    },

    object: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.object(item, message) ? item : response();
        } else {
            check.verify.object(item, message);
            return item;
        }
    },

    obj: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.object(item, message) ? item : response();
        } else {
            check.verify.object(item, message);
            return item;
        }
    },

    array: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.array(item, message) ? item : response();
        } else {
            check.verify.array(item, message);
            return item;
        }
    },

    arrayForce: function (item) {
        return _.isArray(item) ? item : [item];
    },

    /**
     * type is mostly deprecated except for the rare case when
     * the test type is part of a data structure/schema.
     * @returns {*}
     */
    type: function () {
        var args = _.toArray(arguments);
        var typeName = args.shift();
        return SNAPS.assert[typeName].apply(args);
    },

    notempty: function (item, typeName, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;

        var args = _.toArray(arguments);
        if (typeof(arguments[arguments.length - 1]) == 'function') {
            return SNAPS.assert._assertCatch('notempty', args);
        }
        switch (typeName) {
            case 'string':
                if (response) {
                    return check.unemptyString(item, message) ? item : response();
                } else {
                    check.verify.unemptyString(item, message);
                    return item;
                }
                break;
            case 'array':
                if (response) {
                    return check.array(item, message) && item.length ? item : response();
                } else {
                    check.verify.array(item, message);
                    if (!item.length) {
                        throw new Error(message || 'Array length must be > 0');
                    }
                    return item;
                }
                break;

            case 'number':
                if (response) {
                    return check.number(item) && item ? item : response();
                } else {
                    check.verify.number(item, message);
                    if (!item) {
                        throw new Error(message || 'Number must be nonzero');
                    }
                    return item;
                }
                break;

            default:
                throw "cannot understand size type " + typeName;
        }
        return item;
    },

    size: function (item, typeName, min, max, message) {
        var response;

        if (arguments.length > 2 && (typeof(arguments[arguments.length - 1]) == 'function')) {
            var args = _.toArray(arguments);
            response = args.pop();
            message = args[2];
            min = args[3] || null;
            max = args[4] || null;
        }

        switch (typeName) {
            case 'string':
            case 'array':

                if (min != null) {
                    if (item.length < min) {
                        if (response) {
                            return response('too short');
                        }
                        throw new Error(message || 'must be at least ' + min);
                    }
                }

                if (max != null) {
                    if (item.length > max) {
                        if (response) {
                            return response('too long');
                        }
                        throw new Error(message || 'must be no greater than ' + min);
                    }
                }

                break;

            case 'number':

                if (min != null) {
                    if (item < min) {
                        if (response) {
                            return response('too short');
                        }
                        throw new Error(message || 'must be at least ' + min);
                    }
                }

                if (max != null) {
                    if (item > max) {
                        if (response) {
                            return response('too long');
                        }
                        throw new Error(message || 'must be no greater than ' + min);
                    }
                }

                break;

            default:

                throw "cannot understand size type " + typeName;
        }
        return item;
    },

    toId: function (item, iType) {
        if (check.object(item)) {
            if (!item.$TYPE) {
                throw new Error('untyped object passed into toId');
            } else if (item.$TYPE == iType) {
                return item.id;
            } else {
                throw new Error('wrong type passed into toId: ' + item.$TYPE);
            }
        } else if (check.verify.intNumber(item, 'non-object, non-int passed into toId')){
            return item;
        }
    }
};

var linkId = 0;
/**
 *
 * Link (Relationship) collects / connects two or more snaps.
 * It can be used to map one to many snaps, do parent/child relationships, etc.
 *
 * current known types include
 * -- 'node' : first id is parent, second id is child. The option exists for "multiparent" children.
 * -- 'set': all snaps are equal members; order is irrelevant.
 * -- 'semantic': three snaps, id[0] relates to id[2] with id [1] describing relationship
 * -- '1m': the first id relates to all subsequent snaps
 * -- 'graph': the two nodes are linked in a open graph. multiple graphs can exist -- set meta to the name of your graph.
 * -- 'resource': a relationship that is application-specific - the meta property of the link can provide more detail.
 *
 * @param space {SNAPS.Space}
 * @param snaps {[{SNAPS.Snap | id }]}
 * @param linkType {String} see above
 * @param meta {variant} any kind of annotation -- optional.
 * @constructor
 */
SNAPS.Link = function(space, snaps, linkType, meta) {
    this.id = ++linkId;
    this.active = true;
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.linkType = linkType || 'set';
    //@TODO: limit linkType to known types

    if (check.array(snaps)) {
        this.snaps = snaps;
    } else {
        this.snaps = [];

    }
    this.meta = meta;

    this.validate();
    this.link();
};

SNAPS.Link.prototype.link = function() {
    var link = this;
    var space = this.space;

    _.each(this.snaps, function(snap) {
        snap.addLink(link)
    });
};

SNAPS.Link.prototype.get = function(i, id) {
    return id ? this.snaps[i].id : this.snaps[i];
};

SNAPS.Link.prototype.$TYPE = 'LINK';

SNAPS.Link.prototype.validate = function() {
    this.snaps = _.map(this.snaps, function(snap) {
        if (typeof snap == 'object') {
            var err = SNAPS.isSnap(snap);

            if (!err) {
                return snap;
            } else {
                debugger;
                throw err;
            }
        } else if (_.isNumber(snap)) {
            return this.space.get(snap);
        } else {
            console.log('strange link target: %s', snap);
            throw 'WTF???';
        }
    });

    switch (this.linkType) {
        case 'node':
            if (this.snaps.length != 2) {
                throw 'node link must have two snaps';
            }
            this.snaps = this.snaps.slice(0, 2);
            if (this.snaps[1] == this.snaps[0]) {
                throw 'cannot link node to self';
            }
            break;

        case 'resource':
            break;

        case 'graph':
            if (this.snaps.length != 2) {
                throw 'graph link must have two snaps';
            }
            this.snaps = this.snaps.slice(0, 2);
            if (this.snaps[1] == this.snaps[0]) {
                throw 'cannot link graph to self';
            }
            break;

        case 'set':
            this.snaps = _.uniq(this.snaps);
            break;

        case 'semantic':
            this.snaps = this.snaps.slice(0, 3);
            if (this.snaps.length < 3) {
                // add a simple annotative data node
                this.snaps.splice(1, 0, this.space.snap(true));
            }
            break;

        case '1m':
            // ??
            break;
    }
};

SNAPS.Link.prototype.isValid = function(returnMessage) {
    if (!this.active) {
        return returnMessage ? 'inactive' : false;
    }
    var badId = _.find(this.snaps, check.not.object);
    if (badId) {
        return returnMessage ? 'non object snap' : false;
    }

    switch (this.linkType) {
        case 'node':
            for (var i = 0; i < this.snaps.length; ++i) {
                if (!this.space.hasSnap(this.snaps[i])) {
                    return returnMessage ? 'bad id ' + i : false;
                }
            }
            break;

        case 'resource':
            if (this.snaps.length < 2) {
                return returnMessage ? 'too few snaps for node' : false;
            }
            if (!this.space.hasSnap(this.snaps[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.snaps[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case 'graph':
            if (this.snaps.length < 2) {
                return returnMessage ? 'too few snaps for graph' : false;
            }
            if (!this.space.hasSnap(this.snaps[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.snaps[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case 'set':
            for (var i = 0; i < this.snaps.length; ++i) {
                if (!this.space.hasSnap(this.snaps[i])) {
                    return returnMessage ? 'bad id ' + i : false;
                }
            }
            break;

        case 'semantic':
            if (this.snaps.length < 3) {
                return returnMessage ? 'must have 3 snaps for semantic link' : false;
            }
            if (!this.space.hasSnap(this.snaps[2])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.snaps[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.snap(this.snaps[1]).simple) {
                return returnMessage ? 'snap 1 must be simple' : false;
            }
            if (!this.space.hasSnap(this.snaps[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case '1m':
            for (var i = 0; i < this.snaps.length; ++i) {
                if (!this.space.hasSnap(this.snaps[i])) {
                    return returnMessage ? 'bad id ' + i : false;
                }
            }
            break;
    }

    return true;
};

SNAPS.Link.prototype.toJSON = function() {
    return {snaps: _.pluck(this.snaps, 'id')};
};

SNAPS.Link.prototype.destroy = function() {
    this.active = false;
    for (var s = 0; s < this.snaps.length; ++s) {
        this.snaps[s].removeLink(this);
    }
};

/**
 * adds a new member to the collection
 * @returns {*}
 */
SNAPS.Link.prototype.grow = function(snap) {
    this.snaps.push(SPACE.assert.$TYPE(snap, 'SNAP'));
    return this;
};
SNAPS.Link.prototype.hasSnap = function(snap) {
    var id = SNAPS.isSnap(snap) ? snap.id :  snap;

    for (var s = 0; s < this.snaps.length; ++s){
        if (this.snaps[s].id == id) return true;
    }
    return false;
};

SNAPS.Link.prototype.removeSnap = function(snap) {
    var hasSnap = false;
    var id = snap.id;
    for (var s = 0; (!hasSnap) && s < this.snaps.length; ++s){
        if (this.snaps[s].id == id) hasSnap = true;
    }
    if (!hasSnap) return;

    switch (this.linkType) {
        case 'node':
               return this.destroy();
            break;

        case 'resource':
            return this.destroy();
            break;
        case 'semantic':
            return this.destroy();
            break;
    }
    this.snaps = _.reject(this.snaps, function(s) {
        return s.id == id;
    });
};

SNAPS.Link.prototype.identity = function() {
    var out = _.pick(this, 'id', 'active', 'snaps', '$TYPE');
    out.snaps = _.pluck(out.snaps, 'id');
    return out;
};

SNAPS.Link.prototype.impulse = function(impulse) {
    if (impulse.$TYPE != 'IMPULSE') {
        var args = _.toArray(arguments);
        impulse = SNAPS.impulse.apply(SNAPS, args);
        impulse.setOrigin(this);
    }

    if (!impulse.active) {
        return;
    }

    if (impulse.linkFilter) {
        if (!impulse.linkFilter(this)) {
            return;
        }
    }

    /**
     * send the impulse to any snap in this link that have not heard it already.
     * note - the natual flow of semantic and node impulses is always downward;
     * so imuplse.startId skips the known snaps in favor of downstream ones.
     */

    for (var i = impulse.startId; i < this.snaps.length; ++i) {
        var add = true;
        var id = this.snaps[i].id;
        for (var h = 0; add && h < impulse.heard.length; ++h) {
            if (impulse.heard[h] == id) {
                add = false;
            }
        }
        if (add) {
            var receivingSnap = this.get(i);
            if (receivingSnap.active && (!receivingSnap.simple)) {
                receivingSnap.impulse(impulse);
            }
        }
    }

};

/**
 * Impulse sends the same message to a set of snaps' terminals.
 * By default it sends messages down the family tree
 * but it can be trained to follow other link patterns.
 *
 * @param origin {Snap | Link} the sending root of the message; will not receive the message.
 * @param message {string}
 * @param linkType {String} default = 'node';
 * @param props {Object} configures communication pattern of Impulse;
 * @param meta {variant} optional -- content of message.
 */

SNAPS.impulse = function (origin, message, linkType, props, meta) {

    linkType = linkType || 'node';
    var heardSnapIds = [];
    var heardLinkIds = [];
    var linkFilter = props && props.linkFilter ? SNAPS.assert.fn(props.linkFilter) : false;
    var snapFilter = props && props.snapFilter ? SNAPS.assert.fn(props.snapFilter) : false;

    meta = meta || (props && props.meta ? props.meta : false);
    var linkIdStartPlace;
    switch (this.linkType) {
        case 'node':
            linkIdStartPlace = 1;

            break;

        case 'semantic':
            linkIdStartPlace = 2;

            break;
        default:
            linkIdStartPlace = 0;
    }
    var links = [];
    var snaps = [];

    switch (origin.$TYPE) {

        case 'SNAP':
            snaps = [origin];
            heardSnapIds.push(origin.id);
            break;

        case 'LINK':
            links = [origin];
            break;

        default:
            throw 'Impulse received with no valid origin'
    }

    while (snaps.length || links.length) {

        for (var i = 0; i < links.length; ++i) {
            var link = links[i];
            var lHeard = false;
            for (var lh = 0; (!lHeard) && lh < heardLinkIds.length; ++lh) {
                lHeard = (heardLinkIds[lh] == link.id);
            }
            heardLinkIds.push(link.id);

            if (lHeard || (link.linkType !== linkType)) {
                continue;
            }
            if (linkFilter && (!linkFilter(link))) {
                continue;
            }
            for (var l = linkIdStartPlace; l < link.snaps.length; ++l) {
                var linkSnap = link.snaps[l];
                if ((!linkSnap.active) || (linkSnap.simple)) {
                    continue;
                }
                snaps.push(linkSnap);
            }
        }
        links = [];

        snaps = _.uniq(snaps);
        for (var s = 0; s < snaps.length; ++s) {
            var snap = snaps[s];
            var sHeard = false;
            for (var sh = 0; (!sHeard) && sh < heardSnapIds.length; ++sh) {
                sHeard = (heardSnapIds[sh] == snap.id);
            }
            heardSnapIds.push(snap.id);

            if ( !snap.active || snap.simple || (snapFilter && !snapFilter(snap))) {
                continue;
            }
            if (!sHeard) {
                snap.dispatch(message, meta);
            }
            switch (linkType) {
                case 'semantic':
                    for (var sl = 0; sl < snap.links.length; ++sl) {
                        var slink = snap.links[sl];
                        if (slink.snaps[0].id == snap.id) {
                            links.push(slink);
                        }
                    }
                    break;

                case 'node':
                    for (var sl = 0; sl < snap.links.length; ++sl) {
                        var slink = snap.links[sl];
                        if (slink.snaps[0].id == snap.id) {
                            links.push(slink);
                        }
                    }
                    break;

                default:
                    console.log('not set up to send impulse to other networks yet...');
            }
        }
        snaps = [];

    }

};

/*!
* @license TweenJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2011-2013 gskinner.com, inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

/**!
 * SoundJS FlashPlugin also includes swfobject (http://code.google.com/p/swfobject/)
 */

this.createjs=this.createjs||{},function(){"use strict";var a=function(a,b,c){this.initialize(a,b,c)},b=a.prototype;b.type=null,b.target=null,b.currentTarget=null,b.eventPhase=0,b.bubbles=!1,b.cancelable=!1,b.timeStamp=0,b.defaultPrevented=!1,b.propagationStopped=!1,b.immediatePropagationStopped=!1,b.removed=!1,b.initialize=function(a,b,c){this.type=a,this.bubbles=b,this.cancelable=c,this.timeStamp=(new Date).getTime()},b.preventDefault=function(){this.defaultPrevented=!0},b.stopPropagation=function(){this.propagationStopped=!0},b.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},b.remove=function(){this.removed=!0},b.clone=function(){return new a(this.type,this.bubbles,this.cancelable)},b.toString=function(){return"[Event (type="+this.type+")]"},createjs.Event=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(){},b=a.prototype;a.initialize=function(a){a.addEventListener=b.addEventListener,a.on=b.on,a.removeEventListener=a.off=b.removeEventListener,a.removeAllEventListeners=b.removeAllEventListeners,a.hasEventListener=b.hasEventListener,a.dispatchEvent=b.dispatchEvent,a._dispatchEvent=b._dispatchEvent,a.willTrigger=b.willTrigger},b._listeners=null,b._captureListeners=null,b.initialize=function(){},b.addEventListener=function(a,b,c){var d;d=c?this._captureListeners=this._captureListeners||{}:this._listeners=this._listeners||{};var e=d[a];return e&&this.removeEventListener(a,b,c),e=d[a],e?e.push(b):d[a]=[b],b},b.on=function(a,b,c,d,e,f){return b.handleEvent&&(c=c||b,b=b.handleEvent),c=c||this,this.addEventListener(a,function(a){b.call(c,a,e),d&&a.remove()},f)},b.removeEventListener=function(a,b,c){var d=c?this._captureListeners:this._listeners;if(d){var e=d[a];if(e)for(var f=0,g=e.length;g>f;f++)if(e[f]==b){1==g?delete d[a]:e.splice(f,1);break}}},b.off=b.removeEventListener,b.removeAllEventListeners=function(a){a?(this._listeners&&delete this._listeners[a],this._captureListeners&&delete this._captureListeners[a]):this._listeners=this._captureListeners=null},b.dispatchEvent=function(a,b){if("string"==typeof a){var c=this._listeners;if(!c||!c[a])return!1;a=new createjs.Event(a)}if(a.target=b||this,a.bubbles&&this.parent){for(var d=this,e=[d];d.parent;)e.push(d=d.parent);var f,g=e.length;for(f=g-1;f>=0&&!a.propagationStopped;f--)e[f]._dispatchEvent(a,1+(0==f));for(f=1;g>f&&!a.propagationStopped;f++)e[f]._dispatchEvent(a,3)}else this._dispatchEvent(a,2);return a.defaultPrevented},b.hasEventListener=function(a){var b=this._listeners,c=this._captureListeners;return!!(b&&b[a]||c&&c[a])},b.willTrigger=function(a){for(var b=this;b;){if(b.hasEventListener(a))return!0;b=b.parent}return!1},b.toString=function(){return"[EventDispatcher]"},b._dispatchEvent=function(a,b){var c,d=1==b?this._captureListeners:this._listeners;if(a&&d){var e=d[a.type];if(!e||!(c=e.length))return;a.currentTarget=this,a.eventPhase=b,a.removed=!1,e=e.slice();for(var f=0;c>f&&!a.immediatePropagationStopped;f++){var g=e[f];g.handleEvent?g.handleEvent(a):g(a),a.removed&&(this.off(a.type,g,1==b),a.removed=!1)}}},createjs.EventDispatcher=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(a,b,c){this.initialize(a,b,c)},b=a.prototype=new createjs.EventDispatcher;a.NONE=0,a.LOOP=1,a.REVERSE=2,a.IGNORE={},a._tweens=[],a._plugins={},a.get=function(b,c,d,e){return e&&a.removeTweens(b),new a(b,c,d)},a.tick=function(b,c){for(var d=a._tweens.slice(),e=d.length-1;e>=0;e--){var f=d[e];c&&!f.ignoreGlobalPause||f._paused||f.tick(f._useTicks?1:b)}},a.handleEvent=function(a){"tick"==a.type&&this.tick(a.delta,a.paused)},a.removeTweens=function(b){if(b.tweenjs_count){for(var c=a._tweens,d=c.length-1;d>=0;d--)c[d]._target==b&&(c[d]._paused=!0,c.splice(d,1));b.tweenjs_count=0}},a.removeAllTweens=function(){for(var b=a._tweens,c=0,d=b.length;d>c;c++){var e=b[c];e.paused=!0,e.target.tweenjs_count=0}b.length=0},a.hasActiveTweens=function(b){return b?b.tweenjs_count:a._tweens&&!!a._tweens.length},a.installPlugin=function(b,c){var d=b.priority;null==d&&(b.priority=d=0);for(var e=0,f=c.length,g=a._plugins;f>e;e++){var h=c[e];if(g[h]){for(var i=g[h],j=0,k=i.length;k>j&&!(d<i[j].priority);j++);g[h].splice(j,0,b)}else g[h]=[b]}},a._register=function(b,c){var d=b._target,e=a._tweens;if(c)d&&(d.tweenjs_count=d.tweenjs_count?d.tweenjs_count+1:1),e.push(b),!a._inited&&createjs.Ticker&&(createjs.Ticker.addEventListener("tick",a),a._inited=!0);else{d&&d.tweenjs_count--;for(var f=e.length;f--;)if(e[f]==b)return e.splice(f,1),void 0}},b.ignoreGlobalPause=!1,b.loop=!1,b.duration=0,b.pluginData=null,b.target=null,b.position=null,b.passive=!1,b._paused=!1,b._curQueueProps=null,b._initQueueProps=null,b._steps=null,b._actions=null,b._prevPosition=0,b._stepPosition=0,b._prevPos=-1,b._target=null,b._useTicks=!1,b._inited=!1,b.initialize=function(b,c,d){this.target=this._target=b,c&&(this._useTicks=c.useTicks,this.ignoreGlobalPause=c.ignoreGlobalPause,this.loop=c.loop,c.onChange&&this.addEventListener("change",c.onChange),c.override&&a.removeTweens(b)),this.pluginData=d||{},this._curQueueProps={},this._initQueueProps={},this._steps=[],this._actions=[],c&&c.paused?this._paused=!0:a._register(this,!0),c&&null!=c.position&&this.setPosition(c.position,a.NONE)},b.wait=function(a,b){if(null==a||0>=a)return this;var c=this._cloneProps(this._curQueueProps);return this._addStep({d:a,p0:c,e:this._linearEase,p1:c,v:b})},b.to=function(a,b,c){return(isNaN(b)||0>b)&&(b=0),this._addStep({d:b||0,p0:this._cloneProps(this._curQueueProps),e:c,p1:this._cloneProps(this._appendQueueProps(a))})},b.call=function(a,b,c){return this._addAction({f:a,p:b?b:[this],o:c?c:this._target})},b.set=function(a,b){return this._addAction({f:this._set,o:this,p:[a,b?b:this._target]})},b.play=function(a){return a||(a=this),this.call(a.setPaused,[!1],a)},b.pause=function(a){return a||(a=this),this.call(a.setPaused,[!0],a)},b.setPosition=function(a,b){0>a&&(a=0),null==b&&(b=1);var c=a,d=!1;if(c>=this.duration&&(this.loop?c%=this.duration:(c=this.duration,d=!0)),c==this._prevPos)return d;var e=this._prevPos;if(this.position=this._prevPos=c,this._prevPosition=a,this._target)if(d)this._updateTargetProps(null,1);else if(this._steps.length>0){for(var f=0,g=this._steps.length;g>f&&!(this._steps[f].t>c);f++);var h=this._steps[f-1];this._updateTargetProps(h,(this._stepPosition=c-h.t)/h.d)}return 0!=b&&this._actions.length>0&&(this._useTicks?this._runActions(c,c):1==b&&e>c?(e!=this.duration&&this._runActions(e,this.duration),this._runActions(0,c,!0)):this._runActions(e,c)),d&&this.setPaused(!0),this.dispatchEvent("change"),d},b.tick=function(a){this._paused||this.setPosition(this._prevPosition+a)},b.setPaused=function(b){return this._paused=!!b,a._register(this,!b),this},b.w=b.wait,b.t=b.to,b.c=b.call,b.s=b.set,b.toString=function(){return"[Tween]"},b.clone=function(){throw"Tween can not be cloned."},b._updateTargetProps=function(b,c){var d,e,f,g,h,i;if(b||1!=c){if(this.passive=!!b.v,this.passive)return;b.e&&(c=b.e(c,0,1,1)),d=b.p0,e=b.p1}else this.passive=!1,d=e=this._curQueueProps;for(var j in this._initQueueProps){null==(g=d[j])&&(d[j]=g=this._initQueueProps[j]),null==(h=e[j])&&(e[j]=h=g),f=g==h||0==c||1==c||"number"!=typeof g?1==c?h:g:g+(h-g)*c;var k=!1;if(i=a._plugins[j])for(var l=0,m=i.length;m>l;l++){var n=i[l].tween(this,j,f,d,e,c,!!b&&d==e,!b);n==a.IGNORE?k=!0:f=n}k||(this._target[j]=f)}},b._runActions=function(a,b,c){var d=a,e=b,f=-1,g=this._actions.length,h=1;for(a>b&&(d=b,e=a,f=g,g=h=-1);(f+=h)!=g;){var i=this._actions[f],j=i.t;(j==e||j>d&&e>j||c&&j==a)&&i.f.apply(i.o,i.p)}},b._appendQueueProps=function(b){var c,d,e,f,g;for(var h in b)if(void 0===this._initQueueProps[h]){if(d=this._target[h],c=a._plugins[h])for(e=0,f=c.length;f>e;e++)d=c[e].init(this,h,d);this._initQueueProps[h]=this._curQueueProps[h]=void 0===d?null:d}else d=this._curQueueProps[h];for(var h in b){if(d=this._curQueueProps[h],c=a._plugins[h])for(g=g||{},e=0,f=c.length;f>e;e++)c[e].step&&c[e].step(this,h,d,b[h],g);this._curQueueProps[h]=b[h]}return g&&this._appendQueueProps(g),this._curQueueProps},b._cloneProps=function(a){var b={};for(var c in a)b[c]=a[c];return b},b._addStep=function(a){return a.d>0&&(this._steps.push(a),a.t=this.duration,this.duration+=a.d),this},b._addAction=function(a){return a.t=this.duration,this._actions.push(a),this},b._set=function(a,b){for(var c in a)b[c]=a[c]},createjs.Tween=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(a,b,c){this.initialize(a,b,c)},b=a.prototype=new createjs.EventDispatcher;b.ignoreGlobalPause=!1,b.duration=0,b.loop=!1,b.position=null,b._paused=!1,b._tweens=null,b._labels=null,b._labelList=null,b._prevPosition=0,b._prevPos=-1,b._useTicks=!1,b.initialize=function(a,b,c){this._tweens=[],c&&(this._useTicks=c.useTicks,this.loop=c.loop,this.ignoreGlobalPause=c.ignoreGlobalPause,c.onChange&&this.addEventListener("change",c.onChange)),a&&this.addTween.apply(this,a),this.setLabels(b),c&&c.paused?this._paused=!0:createjs.Tween._register(this,!0),c&&null!=c.position&&this.setPosition(c.position,createjs.Tween.NONE)},b.addTween=function(a){var b=arguments.length;if(b>1){for(var c=0;b>c;c++)this.addTween(arguments[c]);return arguments[0]}return 0==b?null:(this.removeTween(a),this._tweens.push(a),a.setPaused(!0),a._paused=!1,a._useTicks=this._useTicks,a.duration>this.duration&&(this.duration=a.duration),this._prevPos>=0&&a.setPosition(this._prevPos,createjs.Tween.NONE),a)},b.removeTween=function(a){var b=arguments.length;if(b>1){for(var c=!0,d=0;b>d;d++)c=c&&this.removeTween(arguments[d]);return c}if(0==b)return!1;for(var e=this._tweens,d=e.length;d--;)if(e[d]==a)return e.splice(d,1),a.duration>=this.duration&&this.updateDuration(),!0;return!1},b.addLabel=function(a,b){this._labels[a]=b;var c=this._labelList;if(c){for(var d=0,e=c.length;e>d&&!(b<c[d].position);d++);c.splice(d,0,{label:a,position:b})}},b.setLabels=function(a){this._labels=a?a:{}},b.getLabels=function(){var a=this._labelList;if(!a){a=this._labelList=[];var b=this._labels;for(var c in b)a.push({label:c,position:b[c]});a.sort(function(a,b){return a.position-b.position})}return a},b.getCurrentLabel=function(){var a=this.getLabels(),b=this.position,c=a.length;if(c){for(var d=0;c>d&&!(b<a[d].position);d++);return 0==d?null:a[d-1].label}return null},b.gotoAndPlay=function(a){this.setPaused(!1),this._goto(a)},b.gotoAndStop=function(a){this.setPaused(!0),this._goto(a)},b.setPosition=function(a,b){0>a&&(a=0);var c=this.loop?a%this.duration:a,d=!this.loop&&a>=this.duration;if(c==this._prevPos)return d;this._prevPosition=a,this.position=this._prevPos=c;for(var e=0,f=this._tweens.length;f>e;e++)if(this._tweens[e].setPosition(c,b),c!=this._prevPos)return!1;return d&&this.setPaused(!0),this.dispatchEvent("change"),d},b.setPaused=function(a){this._paused=!!a,createjs.Tween._register(this,!a)},b.updateDuration=function(){this.duration=0;for(var a=0,b=this._tweens.length;b>a;a++){var c=this._tweens[a];c.duration>this.duration&&(this.duration=c.duration)}},b.tick=function(a){this.setPosition(this._prevPosition+a)},b.resolve=function(a){var b=parseFloat(a);return isNaN(b)&&(b=this._labels[a]),b},b.toString=function(){return"[Timeline]"},b.clone=function(){throw"Timeline can not be cloned."},b._goto=function(a){var b=this.resolve(a);null!=b&&this.setPosition(b)},createjs.Timeline=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(){throw"Ease cannot be instantiated."};a.linear=function(a){return a},a.none=a.linear,a.get=function(a){return-1>a&&(a=-1),a>1&&(a=1),function(b){return 0==a?b:0>a?b*(b*-a+1+a):b*((2-b)*a+(1-a))}},a.getPowIn=function(a){return function(b){return Math.pow(b,a)}},a.getPowOut=function(a){return function(b){return 1-Math.pow(1-b,a)}},a.getPowInOut=function(a){return function(b){return(b*=2)<1?.5*Math.pow(b,a):1-.5*Math.abs(Math.pow(2-b,a))}},a.quadIn=a.getPowIn(2),a.quadOut=a.getPowOut(2),a.quadInOut=a.getPowInOut(2),a.cubicIn=a.getPowIn(3),a.cubicOut=a.getPowOut(3),a.cubicInOut=a.getPowInOut(3),a.quartIn=a.getPowIn(4),a.quartOut=a.getPowOut(4),a.quartInOut=a.getPowInOut(4),a.quintIn=a.getPowIn(5),a.quintOut=a.getPowOut(5),a.quintInOut=a.getPowInOut(5),a.sineIn=function(a){return 1-Math.cos(a*Math.PI/2)},a.sineOut=function(a){return Math.sin(a*Math.PI/2)},a.sineInOut=function(a){return-.5*(Math.cos(Math.PI*a)-1)},a.getBackIn=function(a){return function(b){return b*b*((a+1)*b-a)}},a.backIn=a.getBackIn(1.7),a.getBackOut=function(a){return function(b){return--b*b*((a+1)*b+a)+1}},a.backOut=a.getBackOut(1.7),a.getBackInOut=function(a){return a*=1.525,function(b){return(b*=2)<1?.5*b*b*((a+1)*b-a):.5*((b-=2)*b*((a+1)*b+a)+2)}},a.backInOut=a.getBackInOut(1.7),a.circIn=function(a){return-(Math.sqrt(1-a*a)-1)},a.circOut=function(a){return Math.sqrt(1- --a*a)},a.circInOut=function(a){return(a*=2)<1?-.5*(Math.sqrt(1-a*a)-1):.5*(Math.sqrt(1-(a-=2)*a)+1)},a.bounceIn=function(b){return 1-a.bounceOut(1-b)},a.bounceOut=function(a){return 1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375},a.bounceInOut=function(b){return.5>b?.5*a.bounceIn(2*b):.5*a.bounceOut(2*b-1)+.5},a.getElasticIn=function(a,b){var c=2*Math.PI;return function(d){if(0==d||1==d)return d;var e=b/c*Math.asin(1/a);return-(a*Math.pow(2,10*(d-=1))*Math.sin((d-e)*c/b))}},a.elasticIn=a.getElasticIn(1,.3),a.getElasticOut=function(a,b){var c=2*Math.PI;return function(d){if(0==d||1==d)return d;var e=b/c*Math.asin(1/a);return a*Math.pow(2,-10*d)*Math.sin((d-e)*c/b)+1}},a.elasticOut=a.getElasticOut(1,.3),a.getElasticInOut=function(a,b){var c=2*Math.PI;return function(d){var e=b/c*Math.asin(1/a);return(d*=2)<1?-.5*a*Math.pow(2,10*(d-=1))*Math.sin((d-e)*c/b):.5*a*Math.pow(2,-10*(d-=1))*Math.sin((d-e)*c/b)+1}},a.elasticInOut=a.getElasticInOut(1,.3*1.5),createjs.Ease=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(){throw"MotionGuidePlugin cannot be instantiated."};a.priority=0,a._rotOffS,a._rotOffE,a._rotNormS,a._rotNormE,a.install=function(){return createjs.Tween.installPlugin(a,["guide","x","y","rotation"]),createjs.Tween.IGNORE},a.init=function(a,b,c){var d=a.target;return d.hasOwnProperty("x")||(d.x=0),d.hasOwnProperty("y")||(d.y=0),d.hasOwnProperty("rotation")||(d.rotation=0),"rotation"==b&&(a.__needsRot=!0),"guide"==b?null:c},a.step=function(b,c,d,e,f){if("rotation"==c&&(b.__rotGlobalS=d,b.__rotGlobalE=e,a.testRotData(b,f)),"guide"!=c)return e;var g,h=e;h.hasOwnProperty("path")||(h.path=[]);var i=h.path;if(h.hasOwnProperty("end")||(h.end=1),h.hasOwnProperty("start")||(h.start=d&&d.hasOwnProperty("end")&&d.path===i?d.end:0),h.hasOwnProperty("_segments")&&h._length)return e;var j=i.length,k=10;if(!(j>=6&&0==(j-2)%4))throw"invalid 'path' data, please see documentation for valid paths";h._segments=[],h._length=0;for(var l=2;j>l;l+=4){for(var m,n,o=i[l-2],p=i[l-1],q=i[l+0],r=i[l+1],s=i[l+2],t=i[l+3],u=o,v=p,w=0,x=[],y=1;k>=y;y++){var z=y/k,A=1-z;m=A*A*o+2*A*z*q+z*z*s,n=A*A*p+2*A*z*r+z*z*t,w+=x[x.push(Math.sqrt((g=m-u)*g+(g=n-v)*g))-1],u=m,v=n}h._segments.push(w),h._segments.push(x),h._length+=w}g=h.orient,h.orient=!0;var B={};return a.calc(h,h.start,B),b.__rotPathS=Number(B.rotation.toFixed(5)),a.calc(h,h.end,B),b.__rotPathE=Number(B.rotation.toFixed(5)),h.orient=!1,a.calc(h,h.end,f),h.orient=g,h.orient?(b.__guideData=h,a.testRotData(b,f),e):e},a.testRotData=function(a,b){if(void 0===a.__rotGlobalS||void 0===a.__rotGlobalE){if(a.__needsRot)return;a.__rotGlobalS=a.__rotGlobalE=void 0!==a._curQueueProps.rotation?a._curQueueProps.rotation:b.rotation=a.target.rotation||0}if(void 0!==a.__guideData){var c=a.__guideData,d=a.__rotGlobalE-a.__rotGlobalS,e=a.__rotPathE-a.__rotPathS,f=d-e;if("auto"==c.orient)f>180?f-=360:-180>f&&(f+=360);else if("cw"==c.orient){for(;0>f;)f+=360;0==f&&d>0&&180!=d&&(f+=360)}else if("ccw"==c.orient){for(f=d-(e>180?360-e:e);f>0;)f-=360;0==f&&0>d&&-180!=d&&(f-=360)}c.rotDelta=f,c.rotOffS=a.__rotGlobalS-a.__rotPathS,a.__rotGlobalS=a.__rotGlobalE=a.__guideData=a.__needsRot=void 0}},a.tween=function(b,c,d,e,f,g,h){var i=f.guide;if(void 0==i||i===e.guide)return d;if(i.lastRatio!=g){var j=(i.end-i.start)*(h?i.end:g)+i.start;switch(a.calc(i,j,b.target),i.orient){case"cw":case"ccw":case"auto":b.target.rotation+=i.rotOffS+i.rotDelta*g;break;case"fixed":default:b.target.rotation+=i.rotOffS}i.lastRatio=g}return"rotation"!=c||i.orient&&"false"!=i.orient?b.target[c]:d},a.calc=function(b,c,d){void 0==b._segments&&a.validate(b),void 0==d&&(d={x:0,y:0,rotation:0});for(var e=b._segments,f=b.path,g=b._length*c,h=e.length-2,i=0;g>e[i]&&h>i;)g-=e[i],i+=2;var j=e[i+1],k=0;for(h=j.length-1;g>j[k]&&h>k;)g-=j[k],k++;var l=k/++h+g/(h*j[k]);i=2*i+2;var m=1-l;return d.x=m*m*f[i-2]+2*m*l*f[i+0]+l*l*f[i+2],d.y=m*m*f[i-1]+2*m*l*f[i+1]+l*l*f[i+3],b.orient&&(d.rotation=57.2957795*Math.atan2((f[i+1]-f[i-1])*m+(f[i+3]-f[i+1])*l,(f[i+0]-f[i-2])*m+(f[i+2]-f[i+0])*l)),d},createjs.MotionGuidePlugin=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=createjs.TweenJS=createjs.TweenJS||{};a.version="0.5.1",a.buildDate="Thu, 12 Dec 2013 23:33:38 GMT"}();

SNAPS.ease = this.createjs.Ease;
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

    });
    this.target = target;
    this.watching = SNAPS.assert.arrayForce(props.watching);
/*
    if (props.hasOwnProperty('startTime')) {
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
    }*/

    if (this.watching.length) {
        SNAPS.assert.$TYPE(this.target, 'SNAP');
    }

    this.handler = SNAPS.assert.function(handler, function () {
        return _.identity
    });
    this.meta = meta || {};

    this.active = true;
};

SNAPS.Observer.prototype.apply = function (target) {
    target = target || this.target;

    if (this.watching.length) {
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

        var progress = (this.space.time - this.startTime) / (this.endTime - this.startTime);
        this.handler.call(target, progress);
    }
}
var Space = function () {
    this.id = 1;
    this.snaps = [];
    this.resetTime();
    this.edition = 0;
    this.editionStarted = 0;
    this.editionCompleted = 0;
    this.benchmarking = false;
    this.benchmarks = [];
    this.terminal = new Terminal();
};

Space.prototype.$TYPE = 'SPACE';

Space.prototype.count = function () {
    return this.snaps.length;
};

Space.prototype.setWindow = function (window) {
    this.window = window;
    this.document = window.document;
    window.addEventListener('resize', function(){
        console.log('resizing');
        this.terminal.dispatch('resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }.bind(this))
};

Space.prototype.getDocument = function(){
    if (this.document) {
        return this.document;
    } else if (typeof document !== 'undefined') {
        return document;
    } else {
        return null;
    }
};

Space.prototype.resetTime = function () {
    this.start = new Date().getTime();
    this.time = 0;
};

Space.prototype.setTime = function (n) {
    this.time = n;
    return this;
};

/**
 * deprecated - more efficient to do this inside link
 * ensures every snap in a link knows about the link
 * @param snap
 * @param link
 */
Space.prototype.addLink = function (snap, link) {
    if (!snap.simple) {
        snap.addLink(link);
    }
};

/**
 * deprecated -- more efficient to do this directy inside the link
 * @param link
 */
Space.prototype.removeLink = function (link) {
    _.each(link.snaps, function (snap) {
        if ((!snap.simple)) {
            snap.removeLink(link);
        }
    }, this);
};

/**
 * this is a heavily overloaded function
 *
 *  -- with no arguments: returns a new Snap
 *  -- if is a number: returns existing Snap by ID
 *  -- if is true: returns a new "simple" Snap
 *  -- if is object: returns a new Snap with a preset property list.
 *
 * @param input
 * @returns {*}
 */
Space.prototype.snap = function (input) {
    var snap;

    if (arguments.length) {
        if (_.isObject(input)) {
            snap = new Snap(this, this.snaps.length, input);
            this.snaps.push(snap);
        } else if (input === true) {
            snap = new Snap(this, this.snaps.length, {simple: true});
            this.snaps.push(snap);
        } else {
            snap = this.snaps[input] || SNAPS.INVALID_SNAP_ID;
        }
    } else {
        snap = new Snap(this, this.snaps.length);
        this.snaps.push(snap);
    }
    return snap;
};

Space.prototype.hasSnap = function (snap, onlyIfActive) {

    if (typeof snap == 'object') {
        if (snap.space !== this) {
            return false;
        }
    }
    var id = SNAPS.assert.toId(snap, 'SNAP');

    if (id >= this.snaps.length) {
        console.log('unregistered snap detected: %s', snap);
        return false;
    }
    if (onlyIfActive) {
        return this.snaps[id].active;
    } else {
        return true;
    }
};

Space.prototype.nextTime = function () {
    this.time = new Date().getTime() - this.start;
    return this.time;
};

Space.prototype.isUpdating = function () {
    return this.editionStarted > this.editionCompleted;
};

Space.prototype.startEdition = function (requestor) {
    if (this.benchmarking) {
        var t = new Date().getTime();
        var data = [requestor, t, t - this.startTime, this.time];
    }

    if (this.isUpdating()) {
        throw new Error('attempting to start an edition during the updating cycle');
    }

    this.editionStarted = ++this.edition;
    if (this.benchmarking) {
        this.benchmarks[this.edition] = data;
    }

    return this.editionStarted;
};

Space.prototype.endEdition = function (currentEd) {
    if (currentEd != this.editionStarted) {
        console.log('edition versions mismatch at endEdition: %s, %s', currentEd, this.editionStarted);
        return;
    }
    this.editionCompleted = this.editionStarted;
    if (this.benchmarking) {
        var t = new Date().getTime();
        this.benchmarks[this.editionStarted].push(t, t - this.startTime);
    }
};

Space.prototype.isEditing = function(){
    return this.editionCompleted < this.editionStarted;
};

Space.prototype.update = function (next) {
    if (next) {
        this.nextTime();
    }

    var currentEd = this.startEdition();

    var i;
    var snap;

    var updatedSnaps = [];

    var l = this.snaps.length;

    for (i = 0; i < l; ++i) {
        snap = this.snaps[i];
        if (snap.active && (!snap.simple)) {
            if (snap.hasPendingChanges() || snap.blendCount > 0) {
                updatedSnaps.push(snap);
            }
            snap.update(null, currentEd);
        }
    }

    l = updatedSnaps.length;

    for (i = 0; i < l; ++i) {
        snap = updatedSnaps[i];
        snap.dispatch('output');
    }

    this.endEdition(currentEd);
};

SNAPS.space = function () {
    return new Space();
};

/**
 * A Snap ("Synapse") is a collection of properties,
 * related to other Snaps through relationships.
 *
 * simple mode
 * ===========
 * Because relationships require target snaps and snaps have a significant overhead,
 * the option exists to set the snap to "simple mode" in which most of its subobjects
 * and all relationship/observer behavior are disabled.
 *
 * In simple mode, the snap is simply a property collection with an ID,
 * and its get/set methods immediately update its properties.
 *
 * @param space {SNAPS.Space} a collection of snaps
 * @param id {int} the place in the space array that the snap exists in
 * @constructor
 */

function Snap(space, id, props) {
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.id = SNAPS.assert.int(id, 'id must be a number');
    this.invalid = false;
    this._simple = !!(props && props.simple);
    if (this.simple) delete props.simple;
    /**
     * _props are the public properties of the snap. Do not access this directly -- use get and set.
     * @type {Object}
     */

    this._props = props || {};
    if (this.simple) return;

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
     *
     * @type {Array}
     */
    this.observers = [];

    this.propChangeTerminal = new Terminal();

    this.terminal = new Terminal({inherit: [[Snap.prototype.inherit, this]]});

    /**
     * collection of links that include this snap.
     * @type {Array}
     */
    this.links = [];

    this.active = true;

    this.blendCount = 0;
    this.physicsCount = 0;

    this.initUpdated();
}

Snap.prototype.__defineGetter__('simple', function(){
    return this._simple;
});

Snap.prototype.__defineSetter__('simple', function(value){
    throw 'simple, once set, cannot be changed';
});

Snap.prototype.identity = function(){
    var out = _.pick(this, 'id', 'active', 'simple', 'links', '$TYPE');
    out.links = _.map(out.links, function(link){
        return link.identity();
    });
    return out;
};

Snap.prototype.$TYPE = 'SNAP';

Snap.prototype.destroy = function () {
    this.active = false;
    this.unparent();
    this._myProps = null;
    this._pendingChanges = null;
    _.each(this.links, function(l){
        l.removeSnap(this, true);
    }, this);
};

Snap.prototype.addOutput = function (handler) {
    if (!this.output) {
        this.output = new signals.Signal();
    }

    this.output.add(handler);
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


Snap.prototype.updateBlends = function () {

    var blends = this.getLinks('semantic', function (link) {
        var semLink = link.get(1);
        return semLink.get('meta') == 'blend';
    });

    var blendValues = {};

    var time = this.space.time;

    var doneBlends = [];

    for (var i = 0; i < blends.length; ++i) {
        var blend = blends[i];
        var blendValueSnap = blend.get(2);
        var prop = blendValueSnap.get('prop');
        var endTime = blendValueSnap.get('endTime');
        var value;
        var endValue = blendValueSnap.get('endValue');
        var startValue = SNAPS.assert.or('number', blendValueSnap.get('startValue'), 0);

        var progress;

        if (endTime <= time) {
            value = endValue;
            progress = 1;
            doneBlends.push(blend);
        } else {
            progress = _blendProgress(blendValueSnap, time, endTime);
            value = (progress * endValue) + ((1 - progress) * startValue);
        }

        if (!blendValues[prop]) {
            blendValues[prop] = [];
        }

        blendValues[prop].push(value);
    }

    for (var b in blendValues) {
        if (blendValues[b].length != 1) {
            console.log('multiple blends for ' + b, this.id);
        }
        this.internalUpdate(b, blendValues[b][0]);
    }

    for (var d = 0; d < doneBlends.length; ++d) {
        doneBlends[0].destroy();
    }
    this.blendCount = Math.max(0, this.blendCount - doneBlends.length);
};

function _blendProgress(blendSnap, time, endTime) {

    var startTime = blendSnap.get('startTime');
    var dur = endTime - startTime;
    var progress = time - startTime;
    progress /= dur;

    if (blendSnap.has('blend')) {
        var blendFn = blendSnap.get('blend');
        if (typeof(blendFn) == 'function') {
            progress = blendFn(progress);
        }
    }
    return progress;
}

Snap.prototype.blend = function (prop, endValue, time, blendFn) {
    this.retireOtherBlends(prop);
    var valueSnap = this.space.snap(true); // simple/static snap
    valueSnap.set('prop', prop);
    var startValue = this.has(prop) ? parseFloat(this.get(prop)) || 0 : 0;
    valueSnap.set('startValue', startValue)
        .set('endValue', SNAPS.assert.number(endValue))
        .set('startTime', this.space.time)
        .set('endTime', this.space.time + Math.max(parseInt(time), 1))
        .set('blend', blendFn);
    var metaSnap = this.space.snap({
        simple: true,
        meta: 'blend',
        prop: prop
    });
    this.link('semantic', metaSnap, valueSnap);
    this.blendCount++;
};

Snap.prototype.retireOtherBlends = function (prop) {
    var otherBlends = this.getLinks('semantic', function (link) {

        var metaSnap =  link.get(1);
        return (metaSnap.get('meta') == 'blend') && (metaSnap.get('prop') == prop);
    });

    _.each(otherBlends, function (blend) {
        blend.destroy();
    })

};

Snap.prototype.link = function () {
    var args = _.toArray(arguments);
    var meta = null;
    var linkType;
    if (typeof(args[0]) == 'string') {
        linkType = args.shift();
    } else {
        linkType = 'node';
        meta = 'nodeChild';
    }
    args.unshift(this);
    return new SNAPS.Link(this.space, args, linkType, meta);
};

Snap.prototype.removeLink = function (link) {
    if (this.simple || (!this.links.length)) {
        return;
    }
    var linkId = isNaN(link) ? link.id : link;

    this.links = _.reject(this.links, function (link) {
        return link.inactive || (link.id == linkId);
    });
    return this
};

Snap.prototype.addLink = function (link) {
    if (this.simple) {
        return;
    }
    if (!_.find(this.links, function (l) {
        return l.id == link.id
    })) {
        this.links.push(link);
    }
};
Snap.prototype.getLinksTo = function (linkType, filter, meta) {
    var links = this.getLinks(linkType, filter, meta);
    var out= [];
    for(var l = 0; l < links.length; ++l){
        if (links[l].snaps[1].id == this.id){
            out.push(links[0]);
        }
    }
    return out;
};

Snap.prototype.getLinksFrom = function (linkType, filter, meta) {
    var links = this.getLinks(linkType, filter, meta);
    var out= [];
    for(var l = 0; l < links.length; ++l){
        if (links[l].snaps[0].id == this.id){
            out.push(links[0]);
        }
    }
    return out;
};

/**
 * returns a subset of the links array based on type and an optional filter.
 *
 * NOTE: while the filter sugar may make for cleaner code,
 * iterating over a link array manually reduces one very common dip into submethods.
 * Consider this as an opportunity for more efficient code if you need to create a filter function.
 * You'll see some of this denormalizing below.
 *
 * @param linkType {string} the type of link to get.
 * @param filter {function} (optional) a sub-criteria fro which links you want to get.
 * @returns {Array}
 * @param meta {variant} sets a required value for a meta property of a link;
 */
Snap.prototype.getLinks = function (linkType, filter, meta) {
    var out = [];
    var link;
    if (!this.simple) { // simple elements have no links
        var l;
        if (filter) {
            if (_.isFunction(filter)) {
                for (l = 0; l < this.links.length; ++l) {
                    link = this.links[l];
                    if (meta && (link.meta != meta)) {
                        continue;
                    }
                    if (link.active && (link.linkType == linkType) && filter(link, l)) {
                        out.push(link);
                    }
                }
            } else if (_.isObject(filter)) {
                for (l = 0; l < this.links.length; ++l) {
                    link = this.links[l];
                    if (meta && (link.meta != meta)) {
                        continue;
                    }
                    if (link.active && (link.linkType == linkType)) {
                        for (var p in filter) {
                            if (link && link[p] != filter[p]) {
                                link = null;
                            }
                        }
                        if (link) {
                            out.push(link);
                        }
                    }
                }
            } else {
                throw new Error('cannot filter');
            }
        } else {
            for (l = 0; l < this.links.length; ++l) {
                link = this.links[l];
                if (meta && (link.meta != meta)) {
                    continue;
                }
                if (link.active && (link.linkType == linkType)) {
                    out.push(link);
                }
            }
        }
    }
    return out;
};

Snap.prototype.nodeChildren = function (ids) {
    var children = [];
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.active && link.linkType == 'node' && link.meta == 'nodeChild' && link.snaps[0].id == this.id) {
            children.push(ids ? link.snaps[1].id : link.snaps[1]);
        }
    }
    return children;
};

Snap.prototype.nodeParentNodes = function () {
    var myId = this.id;
    return this.getLinks('node', function (n) {
        return n.snaps[1].id == myId;
    });
};

Snap.prototype.nodeParents = function (ids) {
    var nodes = this.nodeParentNodes();

    return _.reduce(nodes, function (o, link) {
        if (link.snaps[1].active) {
            o.push(ids ? link.snaps[0].id : link.snaps[0]);
        }
        return o;
    }, []);
};

Snap.prototype.nodeChildNodes = function () {
    var myId = this.id;
    return this.getLinks('node', function (link) {
        return link.meta == 'nodeChild' && link.snaps[0].id == myId;
    });
};

Snap.prototype.hasNodeChildren = function () {
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.linkType == 'node' && link.meta == 'nodeChild' && link.snaps[0].id == this.id) {
            return true;
        }
    }

    return false;
};

Snap.prototype.nodeSpawn = function () {
    var children = this.nodeChildren();

    var leafs = [];
    var pp = [];
    var parents = [];

    while (children.length || parents.length) {
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            if (child.hasNodeChildren()) {
                parents.push(child);
            } else {
                leafs.push(child);
            }
        }
        children = [];

        for (var p = 0; p < parents.length; ++p) {
            var parent = parents[p];
            children = children.concat(parent.nodeChildren());
            pp.push(parent);
        }
        parents = [];
    }

    return pp.concat(leafs);

};

Snap.prototype.nodeFamily = function () {

    var id = this.id;
    var out = {
        id: id
    };

    var childLinks = this.getLinks('node', function (link) {
        return link.snaps[0].id == id;
    });

    for (var l = 0; l < childLinks.length; ++l) {
        var link = childLinks[l];
        var nodeChild = link.get(1);
        var grandChildren = nodeChild.nodeFamily();
        if (link.meta && _.isString(link.meta)) {
            if (!out[link.meta]) {
                out[link.meta] = [];
            }
            out[link.meta].push(grandChildren);
        } else {
            if (!out.children) {
                out.children = [];
            }
            out.children.push(grandChildren);
        }
    }

    return out;
};

Snap.prototype.impulse = function (message, linkType, props, meta) {
    SNAPS.impulse(this, message, linkType, props, meta);

    return this;
};

/**
 * prepare this snap to be destroyed;
 * links all the children of this snap to its parent(s) if any
 * and destroys its node links.
 */
Snap.prototype.unparent = function () {
    if (this.simple) {
        return;
    }

    var nodes = this.getLinks('nodes');
    if (!nodes.length) {
        return;
    }
    var children = [];
    var parents = [];

    for (var n = 0; n < nodes.length; ++n) {
        var node = nodes[n];
        if (node.snaps[0].id == this.id) { // child  link
            children.push(node.snaps[1]);
        } else if (node.snaps[1].id == this.id) {
            parents.push(node.snaps[0]);
        }
        node.destroy();
    }

    for (var p = 0; p < parents.length; ++p) {
        var parent = parents[p];
        if (parent && parent.active && (!parent.simple)) {
            for (var c = 0; c < children.length; ++c) {
                parent.link(children[c]);
            }
        }
    }

    return this;
};

Snap.prototype.resParent = function (link) {
    for (var l = 0; l < this.links.length; ++l) {
        if (this.links[l].linkType == 'resource' && (this.id == this.links[l].snaps[1].id)) {
            return link ? this.links[l] : this.links[l].snaps[0];
        }
    }
    return false;
};

/**
 * Sends a miessage to the terminal of this node and all its children
 * @param message
 * @param data
 */
Snap.prototype.nodeBroadcast = function(message, data){
    var snaps = [this];

    while(snaps.length){
        var snap = snaps.shift(snaps);
        snap.terminal.dispatch(message, data);
        snaps.unshift.apply(snaps, this.nodeChildren());
    }
};

/**
 * check one or more properties for changes; enact handler when changes happen
 *
 * @param field {[{String}]} a list of properties to observe change on.
 * @param handler {function} What happens when the observed field(s) change.
 * @param meta {Object} optional - metadata for the observer.
 */
Snap.prototype.watch = function (field, handler, meta) {
    var o = new SNAPS.Observer({target: this, watching: field}, handler, meta);
    this.observers.push(o);
    return o;
};

/**
 * as above -- only complete freedom of observation configuration
 *
 * @param props {Object} a configuration for the observer
 * @param handler {function} What happens when the observed field(s) change.
 * @param meta {Object} optional - metadata for the observer.
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
    var oid = SNAPS.assert.int(obs, function(){ return obs.id});
    this.observers = _.reject(this.observers, function (o) {
        return o.id == oid;
    });
    obs.deactivate();
};

Snap.prototype.updateObservers = function () {
    var l = this.observers.length;
    for (i = 0; i < l; ++i) {
        this.observers[i].apply();
    }
};

Snap.prototype.has = function(prop, my) {
    return my ? this._myProps.hasOwnProperty(prop) : this._props.hasOwnProperty(prop);
};

Snap.prototype.set = function(prop, value, immediate) {
    if (this.simple) {
        this._props[prop] = value;
        return this;
    }
    if (this.blendCount > 0){
        this.retireOtherBlends(prop);
    }
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
    var out = {};

    for (var p in this._props){
        out[p] = this._props[p];
        if (/'/.test(this._props[p])){
            debugger;
        }
    }
    return out;
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
function _updateProperties () {
    if (this.simple) {
        return;
    }
    _.extend(this._props, this._pendingChanges);
    var pending = this.pending();
    if (pending) {
        ++changeSet;
        for (var p in pending) {
            this.propChangeTerminal.dispatch(p,
                pending[p].pending,
                pending[p].old,
                pending[p].new,
                changeSet,
                pending);
        }
    }

    this.lastChanges = pending;
    this._pendingChanges = {};
    SNAPS.cleanObj(this._props);
    SNAPS.cleanObj(this._myProps);
}
;

_updatePhysics = function () {
    var changes = {};
};

Snap.prototype.initUpdated = function () {
    this.listen('updated', function (broadcast, edition) {
        if ((!this.active) || (this.simple)) {
            return false;
        }

        /**
         * note - using the "long form" style of accessing a terminal's receptor.
         * Squeezing every bit of efficiency out of the system as this is a frequently
         * ran block of code.
         * In app code, unless you are a total efficiency freak,
         * call this.dispatch('updateBlends', broadcast, edition)
         */
        if (this.blendCount > 0) {
            this.terminal.receptor.updateBlends.dispatch(broadcast, edition);
        }

        if (this.physicsCount > 0) {
            this.terminal.receptor.updatePhysics.dispatch(broadcast, edition);
        }

        // @Deprecated: observers are est replaced with property watchers.
        // if you wan to react to any and all updates watch for updateProperties.
        if (this.observers.length) {
            this.terminal.receptor.updateObservers.dispatch(broadcast, edition);
        }

        if (check.not.emptyObject(this._pendingChanges)) {
            this.dispatch('updateProperties', broadcast, edition);
        }

        if (broadcast && this.hasNodeChildren()) {
            var children = this.nodeChildren();
            // @TODO: flatten recursion?
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

Space.prototype.bd = function (ele, parent) {
    var dom = SNAPS.boxDomElement(this, this.snaps.length, ele, parent);
    this.snaps.push(dom);
    return dom;
};

SNAPS.boxDomElement = function (space, i, e, p) {

    return new DomElement(space, i, e, p);
};

Space.prototype.bdDispatch = function () {
    var args = _.toArray(arguments);
    var message = args.shift();

    for (var s = 0; s < this.snaps.length; ++s) {
        var snap = this.snaps[s];
        if (snap.$TYPE == 'DOM') {
            if (!snap.hasDomParents()) {
                snap.domBroadcast(message, args);
            }
        }

    }
};

/**
 * DomElement is a child class of Snap. It manages a browser Element.
 * Note that most of the properties that relate to the element are managed by
 * two child resources, the attrSnap and styleSnap.
 *
 * Because these two snaps are resources they do not automatically inherit any values from
 * the DomElement; if you want them to you will have to link listeners in the DomElement
 * to its styleSnap/attrSnap properties yourself.
 *
 * Parenting is a bit complex for DomElements. Parenting in DOM actually affects visual features
 * of the Element; however, parenting of DomElements create inheritance behaviors in the local
 * properties of the DomElement.
 *
 * There are many times that one or the other sort of relationships are desirable (or both).
 * Because of this there is two ways to create parent/child relationships between DomElements
 * and / or their child element properties (accessed by the e() method).
 *
 * 1) linking both DomElements AND their elements is created by passing a parent to the DomElement
 *    at the time of creation.
 *
 * 2) linking JUST elements is created by passing a parent to the addElement method of the child.
 *
 * --------------- DomElement's element
 *
 * the DomElement does not necessarily have a DomElement. You can if you want pass it an existing
 * element as a constructor parameter; if this is not done the DomElement won't actually have any
 * element until an action that requires an element to be present in which case, one is made.
 *
 * 1) any time you set an attribute or a style value, an element will be made.
 * 2) if you add a parent to the DomElement, either during construction or via addElement, an element
 *    will be made in the update cycle.
 * 3) if you manually call e(), innerHTML, s(), or a() (which are examples of 1) and 2) above)
 *    an element will be made.
 *
 * --------------- Setting Element properties
 *
 * The methods attr(prop, value) and style(attr, value) add pending changes to the attrSnap and styleSnap
 * properties of a DomElement. This is the preferred way to manage an element's properties.
 *
 * You can directly set properties of an element (immediately) by calling a(prop, value) and s(prop, value).
 * However this is not desirable as it doesn't sync these properties whih attrSnap and styleSnap
 * which means you won't be able to introspect these properties via attr(prop) or style(prop).
 *
 * ............... property units
 *
 * If you want to set a property to a percent value you will have to enter a property string as in
 *
 * myDom.style('left', '50%').
 *
 * If you don't enter a unit, px will be assigned to any numeric property listed in _pxProps.
 * these include left, height, right, top, bottom, width,  min-*, max-*, and others.
 *
 * This means you can blend those style properties by assigning them numeric values as described below
 * and the value set in the Element will have the unit 'px' suffixed onto it.
 *
 * ............... Blending Element Properties
 *
 * To blend a property you call myDom.styleSnap.blend('left', 10, easeFn). As described above the units
 * that are output will be in pixels.
 *
 * --------------- Attaching DomElements to the Document
 *
 * just creating a DomElement instance does NOT place it in the browser's DOM tree. You must call
 * addElement to accomplish this. Until this is done, the DomElement will not be visible or part of the
 * DOM tree.
 *
 * The addElement method does one of two things:
 *
 * 1) if it has no parameter it attaches its element to the space's document (which should be set
 * to the pages' document.)
 * 2) if a parent is passed to addElement there are one of two possibilities:
 *    a) the parent is a browser Element in which case the caller's element is appended to that parent.
 *    b) the parent is a DomElement in which case the caller's element is appended to
 *       the parent's element. However the DomElements are not themselves linked.
 *
 * -------------- innerHTML
 *
 * There is two ways to put content inside elements:
 *
 * 1) actually parent DomElements to each other using addElement
 * 2) call innerHTML to put markup in hte DomElement's Element.
 *
 * You have to pick one - there is no real way to preserve nested DomElements AND allow you to
 * add custom markup to the innerHTML of an element; therefore calling innerHTML on any DomElement
 * that has domChildren will throw an error.
 *
 * @param space  {Space} the registry this DomElement belongs to; see Snap.prototype
 * @param id     {int} the id of this Snap within the Space; see Snap.prototype
 * @param ele    [optional {Element} a native Element
 * @param parent {DomElement | Element} if present, then the element of this DomElement
 *               will be made a child of the parents' DomElement
 *               AND this DomElement will be made a child of the parent.
 * @constructor
 */
var DomElement = function (space, id, ele, parent) {
    Snap.call(this, space, id, {});

    this.styleSnap = space.snap();
    this.link('resource', this.styleSnap).meta = 'style';
    // although this is referenced as a direct property we add it to the links to enable cascading delete
    this.styleSnap.listen('updateProperties', _styleSnapChanges, this);

    this.attrSnap = space.snap();
    this.link('resource', this.attrSnap).meta = 'attr';
    // although this is referenced as a direct property we add it to the links to enable cascading delete
    this.attrSnap.listen('updateProperties', _attrSnapChanges, this);

    this.propChangeTerminal.listen('innerhtml', function (newContent) {
        this.h(newContent);
    }, this);
    this._element = ele;
    if (parent) {
        if (parent.$TYPE == DomElement.prototype.$TYPE) {
            parent.e().appendChild(this.e());
            parent.link(this);
        } else {
            parent.appendChild(this.e());
        }
    }

    this.listen('element', function (element) {
        if (element && element.$TYPE == DomElement.prototype.$TYPE) {

        }
        var addElement = this.get('addElement');
        if (addElement) {
            if (addElement === true) {
                this.addElement();
            } else {
                var parent = addElement.$TYPE == DomElement.prototype.$TYPE ? addElement.e() : addElement;
                this.addElement(parent);
            }
        }
    }, this);
    this.propChangeTerminal.listen('innerhtml', this.h, this)
};

DomElement.prototype = Object.create(Snap.prototype);
DomElement.prototype.$TYPE = 'DOM';
SNAPS.typeAliases.SNAP.push(DomElement.prototype.$TYPE);

DomElement.prototype.domNodeName = function () {
    return this.has('tag') ? this.get('tag') : 'div';
};

DomElement.prototype.contains = function (x, y) {
    var rect = this.e().getBoundingClientRect();

    return !(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom);

};

DomElement.prototype.attr = function (prop, value) {
    if (typeof(prop) == 'object') {
        for (var p in prop) {
            this.attrSnap.set(p, prop[p]);
        }
    } else {
        if (arguments.length < 2) {
            return this.attrSnap.get(prop);
        }
        this.attrSnap.set(prop, value)
    }
    return this;
};

DomElement.prototype.innerHTML = function (content) {
    if (this.hasDomChildren()) {
        throw new Error('innerHTML: cannot add content to a browserDom snap with domChildren');
    }
    this.set('innerhtml', content);
    return this;
};

DomElement.prototype.destroy = function () {
    if (this._element) {
        this.removeElement();
    }
    Snap.prototype.destroy.call(this);
};

/**
 * Adds a boxDomElement's element to the page.
 *
 * If EITHER a DomElement node is passed in (either a native dom element or a SNAPS DomElement)
 * then this boxDomElement is added to the body.
 *
 * Note - the relationship between DomElements and page elements probably should,
 * but does not have to, be kept parallel; however passing a parent to addElement
 * will not make this node a child of that DomElement -- it will just enforce parent child
 * relationships between their elements.
 *
 * @param parent
 * @returns {DomElement}
 */
DomElement.prototype.addElement = function (parent) {
    if (!parent) {
        var parents = this.domParents();
        if (parents.length) {
            parent = parents[0];
        } else {
            parent = this.space.document.body;
        }
    }

    if (parent.$TYPE == DomElement.prototype.$TYPE) {
        parent = parent.e();
    }
    parent.appendChild(this.e());
    return this;
};

DomElement.prototype.parent = function () {
    if (this.space.document) {
        return this.space.document;
    } else if (this._element) {
        return this._element.document;
    } else {
        return null;
    }
};

DomElement.prototype.document = function () {
    var document = this.space.document;
    if (document) {
        return document;
    }
    return this.e() ? this.e().document : null;
};

DomElement.prototype.removeElement = function () {
    var parent = this.e().parentNode;
    if (parent) {
        parent.removeChild(this.e());
    }
    return this;
};

DomElement.prototype.setDebug = function (d) {
    this.debug = this.styleSnap.debug = this.attrSnap.debug = d;
    return this;
};

DomElement.prototype.domChildrenNodes = function () {
    var myId = this.id;
    return this.getLinks('node', function (n) {
        return n.meta == 'dom' && n.snaps[0].id == myId;
    });
};

DomElement.prototype.hasDomChildren = function () {
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.linkType == 'node' && link.meta == 'dom' && link.snaps[0].id == this.id) {
            return true;
        }
    }
    return false;
};

DomElement.prototype.domChildren = function () {
    var children = [];
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.linkType == 'node' && link.meta == 'dom' && link.snaps[0].id == this.id) {
            children.push(link.snaps[1]);
        }
    }
    return children;
};

DomElement.prototype.domParentNodes = function () {
    var myId = this.id;
    return this.getLinks('node', function (n) {
        return n.meta == 'dom' && n.snaps[1].id == myId;
    });
};

DomElement.prototype.domParent = function () {
    return this.domParents()[0];
}
DomElement.prototype.domParents = function () {
    var myId = this.id;

    var links = this.getLinks('node', function (n) {
        return n.meta == 'dom' && n.snaps[1].id == myId;
    });
    var out = [];
    for (var p = 0; p < links.length; ++p) {
        out.push(links[p].snaps[0]);
    }

    return out;
};

DomElement.prototype.hasDomParent = function () {
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.linkType == 'node' && link.meta == 'dom' && link.snaps[1].id == this.id) {
            return true;
        }
    }
    return false;
};

/**
 * automatically add 'dom' to the meta property of new links
 * @param dom {DomElement}
 * @returns {*}
 */
DomElement.prototype.link = function (dom) {
    var link;
    if (arguments.length == 1) {
        link = Snap.prototype.link.call(this, dom);
        if (dom.$TYPE == DomElement.prototype.$TYPE) {
            link.meta = 'dom';
        }
        ;
        this.element.innerHTML = '';
        delete this._props.innerhtml;
        delete this._pendingChanges.innerhtml;
    } else {
        var args = _.toArray(arguments);
        link = Snap.prototype.link.apply(this, args);
    }
    return link;
};

/**
 * data is kept in its own snap as it has different significance in use
 *
 * @type {RegExp}
 */

DomElement.prototype.d =
    DomElement.prototype.data = function () {
        var args = _.toArray(arguments);
        var prop = args[0];
        if (typeof(prop) == 'object') {
            var pArgs = args.slice(1);
            for (var p in prop) {
                var arg = prop[p];
                pArgs.unshift(arg);
                pArgs.unshift(p);
                this.d.apply(this, pArgs);
            }

            return;
        } else {
            var value = args[1];
        }
        prop = prop.replace(dataRE, '').toLowerCase();

        if (arguments.length > 1) {
            if (!this.dataSnap) {
                this._initDataSnap();
            }
            this.dataSnap.set(prop, value);
        } else {
            if (!this.dataSnap || !this.dataSnap.has(prop)) {
                return null;
            } else {
                return this.dataSnap.get(prop);
            }
        }

    };

DomElement.prototype._initDataSnap = function () {
    this.dataSnap = this.space.snap();
    var i, attrs, l;
    for (i = 0, attrs = this.e().attributes, l = attrs.length; i < l; i++) {
        var attr = (attrs.item(i).nodeName);
        if (dataRE.test(attr)) {
            this.d(this.a(attr));
        }
    }
};

/**
 * iteratively recursing through the DomElement tree, sending the message/data to the terminals of each DomElement
 * @param message
 * @param data
 *
 * note - this method is a derecursed tree walk == could use some unit testing to validate integrity
 */
Snap.prototype.domBroadcast = function (message, data) {
    var snaps = [this];

    while (snaps.length) {
        var snap = snaps.shift(snaps);
        snap.terminal.dispatch(message, data);
        if (snap.hasDomChildren()) {
            snaps.unshift.apply(snaps, snap.domChildren());
        }
    }
};

Space.prototype.domBroadcast = function (message, data) {

    for (var s = 0; s < this.snaps.length; ++s) {
        var snap = this.snaps[s];

        if (snap.$TYPE == DomElement.prototype.$TYPE && !snap.hasDomParent()) {
            snap.domBroadcast(message, data);
        }
    }

};

var attrNames = 'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,data,datetime,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,for,form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,manifest,max,maxlength,media,method,min,multiple,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,pubdate,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,seamless,selected,shape,size,sizes,span,spellcheck,src,srcdoc,srclang,start,step,style,summary,tabindex,target,title,type,usemap,value,width,wrap'
var _attrs = _.reduce(attrNames.split(','), function (out, p) {
    out[p] = true;
    return out
}, {});

var dataRE = /^data-/i;

/**
 * the above values are all known attrs;
 * however there are some attrs that are also elements and those attrs
 * (and for whom it is more common for them to be elements than attributes)
 * are overridden with the list below.
 */
var _styleOverrides = {
    color: true,
    width: true,
    height: true
};

var _htmlRE = /html|content/i;

/**
 * these are properties for which if numbers are provide a 'px' should be suffixed
 */
var _pxProps = _.reduce('border-bottom-width,border-left-width,border-radius,border-right-width,border-top-width,border-width,bottom,column-rule-width,column-width,columns,height,left,letter-spacing,line-height,margin,margin-bottom,margin-left,margin-right,margin-top,max-height,max-width,min-height,min-width,nav-down,nav-index,nav-left,nav-right,nav-up,outline-width,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,right,tab-size,text-indent,text-justify,top,width'.split(','),
    function (out, p) {
        out[p] = true;
        return out;
    }, {});

function _styleSnapChanges () {
    var state = this.styleSnap.state();
    this.s(state);
}

function _attrSnapChanges () {
    for (var p in this.attrSnap.lastChanges) {
        var value = this.attrSnap.lastChanges[p].pending;

        if (value === SNAPS.DELETE) {
            this.e().removeAttribute(p);
        } else {
            this.a(p, value);
        }
    }
}

//@TODO: is this async?
DomElement.prototype.element = DomElement.prototype.e = function () {
    if (!this._element) {
        if (typeof (document) == 'undefined') {
            if (this.space.document) {
                this._element = this.space.document.createElement(this.domNodeName());
                this.dispatch('element', this._element);
            } else {
                // this may not work if env is async....
                SNAPS.jsdom = require('jsdom');
                var self = this;

                SNAPS.jsdom.env(
                    '<html><body></body></html>',
                    [],
                    function (errors, w) {
                        window = w;
                        self.space.window = w;
                        self.space.document = window.document;
                        self.element = space.document.createElement(self.domNodeName());
                        self.dispatch('element', self.element);
                    }
                );
            }
        } else {
            this.window = window; // global
            this.document = document; // global
            this._element = document.createElement(this.domNodeName());
        }
    }
    return this._element;
};

DomElement.prototype.style = function (prop, value, immediate) {
    if (typeof(prop) == 'object') {
        for (var p in prop) {
            this.styleSnap.set(p, prop[p]);
        }
    } else if (arguments.length < 2) {
        return this.styleSnap.get(prop);
    } else {
        this.styleSnap.set(prop, value);
        if (this.space.isUpdating()) {
            this.s(prop, value);
        }
    }
    return this;
};

DomElement.prototype.h = DomElement.prototype.html = function (innerhtml) {
    if (arguments.length > 0) {
        if (this.hasDomChildren()) {
            throw new Error('attempting to add content to a browserDom snap with domChildren');
        }

        this.e().innerHTML = innerhtml;
        return this;
    } else {
        return this.e().innerHTML;
    }
};

DomElement.prototype.a = function (prop, value) {
    if (dataRE.test(prop)) {
        var args = _.toArray(arguments);
        return this.d.apply(this, args);
    }
    if (arguments.length > 1) {
        this.e().setAttribute(prop, value);
        return this;
    } else if (typeof prop == 'object') {
        for (var p in prop) {
            this.e().setAttribute(p, prop[p]);
        }
    } else {
        return this.e().getAttribute(prop);
    }
};

/**
 * directly write to the domElements's style. This for the most part should be done
 * through the snap system.
 *
 * parameters can be:
 *  -- prop (returns elements current value)
 *  -- prop, value
 *  -- prop, value, unit
 *  -- config object (prop/value pairs)
 *  -- config, unit
 *
 */
DomElement.prototype.s = function () {

    var args = _.toArray(arguments);
    var prop = args[0];
    var value;
    if (_.isArray(prop)) {
        value = prop[1];
        prop = prop[0];
    }
    if (typeof(prop) == 'object') {

        // this recursive call allows for a config object with subsequent arguments.
        _.each(prop, function (value, prop) {
            if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
                var unit = 'px';
                value = Math.round(value) + unit;
            }
            this.e().style[prop] = value;
        }, this);
        return this;
    } else if (args.length > 1) {
        value = args[1];

        // append 'px' (pixels) to numeric properties that require numeric units
        if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
            var unit;
            if (args.length > 2) {
                unit = args[2]
            } else {
                unit = 'px';
            }
            value = Math.round(value) + unit;
        }
        this.e().style[prop] = value;
        return this;
    } else {
        return this.e().style[prop];
    }
};

var pxRE = /([\d.]+)px/;
var pctRE = /([\d.]+)%/;

Space.prototype.size = function (sizeName, input, unit) {
    var size = new Size(this, this.snaps.length, sizeName, input, unit);
    this.snaps.push(size);
    return size;
};

DomElement.prototype.sizeResource = function(sizeName) {
    var id = this.id;
    return this.getLinks('resource', function(link) {
        return link.meta == sizeName && link.snaps[0].id == id;
    })[0];
};


DomElement.prototype.size = function (sizeName, value, unit) {
    if (arguments.length < 2) {
        var links = this.getLinksFrom('resource', null, sizeName);
        return links[0] ? links[0].snaps[1] : null;
    } else {
        var res = this.sizeResource(sizeName);
        // get mode
        if (arguments.length == 1) {
            return res ? res.snaps[1] : null;
        }

        if (res) {
            // recycle existing size
            size = res.snaps[1];
            size.set('value', value);
            size.set('unit', unit);
            return this;
        }

        var size = this.space.size(sizeName, value, unit);
        this.link('resource', size).meta = sizeName;

        if (size.get('unit', true) == '%') {
            var self = this;

            function orf() {
                self.clearProp(sizeName + 'Pixels', true);
                _updateSize.call(size);
            }

            this.set('onResizeFn', orf);
            this.terminal.listen('resize', orf);
            //@TODO: cleanup
        }
        return this;
    }
};

/**
 *
 * Represents a blendable, unit-conscious measurement, for width and height.
 *
 * note - the "block" value determines whether this measurement is in place;
 *      if false is set, no value will be shown for this property in the style.
 *
 * the 'value' property is a numeric and can be blended.
 *
 * @param space {Space}
 * @param id {int}
 * @param sizeName {string}  {String} usu. 'width' or 'height'
 * @param input {variant} number or size string('200px', '100%')
 * @param unit {string} (optional) '%' or 'px'
 * @constructor
 */

function Size(space, id, sizeName, input, unit) {
    Snap.call(this, space, id);

    this.listen('updateProperties', _updateSize, this);
    this.listen('updateDocumentSize', _updateSize, this);

    this.set('sizeName', sizeName);

    this.set('block', true);
    if (input === false) {
        this.set('block', false);
    } else if (unit) {
        this.set('value', input);
        this.set('unit', unit);
    } else if (typeof input == 'number') {
        this.set('unit', 'px');
        this.set('value', input);
    } else if (typeof input == 'string') {
        if (pctRE.test(input)) {
            this.set('unit', '%');
            this.set('value', parseFloat(pctRE.exec(input)[1]));
        } else if (pxRE.test(input)) {
            this.set('unit', 'px');
            this.set('value', parseFloat(pxRE.exec(input)[1]));
        } else {
            this.set('unit', 'px');
            this.set('value', parseFloat(input));
        }
    } else {
        throw new Error('cannot parse input');
    }
}

Size.prototype = Object.create(Snap.prototype);

Size.prototype.pixels = function() {
    var value = this.get('value');
    var unit = this.get('unit');
    var sizeName = this.get('sizeName');

    if (unit == 'px') {
        return value;
    } else if (unit == '%') {
        var pixelName = sizeName + 'Pixels';

        var parentSnap = this.resParent();
        if (parentSnap.has(pixelName)){
            return parentSnap.get(pixelName);
        }

        parentSnap = parentSnap.domParent();
        while (parentSnap) {
            //@TODO: multiple parents should not exist for domNodes
            var pixels = parentSnap.pixels();
            if (pixels !== null) {
                pixels *= value / 100;
                return pixels;
            }
            parentSnap = parentSnap.domParents()[0];
        }
    }
    return null;
};
        //@TODO: check document?

Size.prototype.sizeDomParent = function () {
    return this.getLinksTo('resource', null, this.get('sizeName'));
};

DomElement.prototype.pixels = function(sizeName) {
    var pixelName = sizeName + 'Pixels';
    if (!this.has(pixelName)) {
        this.set(pixelName, _domPixels.call(this, sizeName));
    }
    return this.get(pixelName);
};

_domPixels = function(sizeName) {
    var size = this.size(sizeName);
    var percent = null;
    if (!size) {
        return null;
    } else {
        var unit = size.get('unit');
        var value = size.get('value');
        if (unit == 'px') {
            return value;
        } else if (unit == '%') {
            percent = value;
        } else {
            return null;
        }

    }

    var domParents = this.domParents();

    if (!domParents.length) {
        // get from document
        var document = this.space.getDocument();
        if (document) {
            switch (sizeName) {
                case 'width':
                    return _.isNumber(document.innerWidth) ? document.innerWidth : null;
                    break;
                case 'height':
                    return _.isNumber(document.innerHeight) ? document.innerHeight : null;
                    break;
            }
        }
    } else {
        for (var p = 0; p < domParents.length; ++p) {
            var pPixels = domParents[p].pixels(sizeName);
            if (pPixels !== null) {
                return pPixels * percent / 100;
            }
        }
    }

    return null;
};

Size.domSize = function (dom, paramName) {
    for (var l = 0; l < dom.links.length; ++l) {
        var link = dom.links[l];
        if (link.linkType == 'resource' && link.meta == paramName && link.snaps[1].id == dom.id) {
            return link.snaps[0];
        }
    }
    return null;
};

Size.prototype.size = function (value) {
    if (!this.get('block')) {
        return null;
    } else if (value) {
        return this.get('value');
    } else {
        return this.get('value') + this.get('unit');
    }
};

/**
 * return the pixels percentage. For optimal dom this should not be initiated
 * until its proven you cannot determine an absolute size for the node
 * because there is no parental pixel basis.
 *
 * This means unless the space has no document this branch should never be called into action
 *
 * @returns {*}
 */
Size.prototype.pixels = function () {
    var unit = this.get('unit');
    var value = this.get('value');
    var paramName = this.get('paramName');

    switch (unit) {
        case 'px':
            return value;
            break;

        case '%':

            var parentDomNode = this.sizeDomParent().domParent();
            while (parentDomNode) {
                // either find a parent node with a valid pixel scalar
                var size = parentDomNode.size(paramName);
                if (size) {
                    var parentPixels = size.pixels();
                    if (parentPixels !== null) {
                        return value * parentPixels / 100;
                    }
                } else {
                    // check upstream containers.
                    parentDomNode = parentDomNode.domParent();
                }
            }
            return null;

            break;
    }
    return null;
};

/**
 * returns the local percent == percent of parent.
 * @returns {*}
 */
Size.prototype.percent = function () {
    var unit = this.get('unit');
    var value = this.get('value');
    var paramName = this.get('paramName');

    switch (unit) {

        case '%':

            return value;

            break;
    }
    return null;
};

SNAPS.Size = Size;

/**
 * updates an element's size based on its property
 * @private
 */
function _updateSize() {
    var dom = this.resParent();
    if (!dom) return;

    var value = this.get('value');
    var unit = this.get('unit');
    var sizeName = this.get('sizeName');
    var pixelName = sizeName + 'Pixels';
    var out = '';
    if (dom.has(pixelName)) {
        dom.clearProp(pixelName, true, true);
        // silently clear cached pixel size from this dom and the children of this.dom
    }
    var parentLink = this.resParent(true);
    if (!parentLink) {
        return;
    }
    var parentSnap;

    if (this.get('block')) {
        if (unit == '%') {
            parentSnap = dom.domParent();
            if (parentSnap){
                var pixels = parentSnap.pixels(sizeName);
                if (pixels !== null) {
                    value = pixels * value / 100;
                    unit = 'px';
                }
            } else {
                var window = this.space.window;
                if (window){
                    switch(sizeName){
                        case 'width':
                            value *= window.innerWidth /100;
                            unit = 'px';
                            break;

                        case 'height':
                            value *= window.innerHeight /100;
                            unit = 'px';
                            break;
                    }
                }
            }
            out =( value + unit);
        } else if (unit == 'px'){
            out = value + 'px';
        }
        dom.style(sizeName, out, true);
    }
}

    
        return SNAPS;
    
    }));
