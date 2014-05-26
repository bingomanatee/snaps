var SNAPS = {
    signals: signals,
    DELETE: {SNAP_DELETE: true}, // an imperitave to remove a value from a collection.
    INVALID_SNAP_ID: {invalid: true},
    cleanObj: function(o){
        for (var p in o){
            if (o[p] === SNAPS.DELETE){
                delete o[p];
            }
        }

    }
};

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

        switch(typeName){
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
                        if (response){
                            return response('too short');
                        }
                        throw new Error(message || 'must be at least ' + min);
                    }
                }

                if (max != null) {
                    if (item.length > max) {
                        if (response){
                            return response('too long');
                        }
                        throw new Error(message || 'must be no greater than ' + min);
                    }
                }

                break;

            case 'number':

                if (min != null) {
                    if (item < min) {
                        if (response){
                            return response('too short');
                        }
                        throw new Error(message || 'must be at least ' + min);
                    }
                }

                if (max != null) {
                    if (item > max) {
                        if (response){
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
    }


};


var relId = 0;
/**
 *
 * Rel (Relationship) is a trinary join of two snaps;
 * it has a string relType and optional metadata.
 * It exists to allow for semantic joins
 * 
 * @param params {Object} configures the Rel
 * @param meta {Object} an optional annotation
 * @constructor
 */
SNAPS.Rel = function (params, meta) {
    this.id = ++relId;
    var space = SNAPS.assert.prop(params, 'space');
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.meta = _.isObject(meta) ? meta : false;

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

SNAPS.Rel.prototype.fromSnap = function () {
    return this.space.snap(this.fromId, true);
};

SNAPS.Rel.prototype.toJSON = function(){
    return {fromId: this.fromId, toId: this.toId, relType: this.relType}
};

SNAPS.Rel.prototype.destroy = function(){
    this.active = false;
    this.fromSnap().removeRel(this);
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
var attrNames = 'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,data,datetime,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,for,form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,manifest,max,maxlength,media,method,min,multiple,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,pubdate,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,seamless,selected,shape,size,sizes,span,spellcheck,src,srcdoc,srclang,start,step,style,summary,tabindex,target,title,type,usemap,value,width,wrap'
var _attrs = _.reduce(attrNames.split(','), function (out, p) {
    out[p] = true;
    return out
}, {});
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
 * BrowserDom is an element bridge between a DOM element
 * and properties of a snap instance.
 *
 * @param space {SNAPS.Space}
 * @param props {Object}
 * @constructor
 */

SNAPS.BrowserDom = function (space, props) {
    this.space = space;
    this.attrSnap = space.snap();

    var rel = this.attrSnap.rel('style', space.snap());
    this.styleSnap = rel.toSnap();

    this.tagName = props.tagName || 'div';
    delete props.tagName;

    this.element = this.e = props.element || document.createElement(this.tagName);
    this.initOutput();
    delete props.watchedProps;

    if (props.addElement) {
        if (props.addElement === true) {
            this.addElement();
        } else {
            var parent = props.addElement.$TYPE == SNAPS.BrowserDom.prototype.$TYPE ? props.addElement.element : props.addElement;
            this.addElement(parent);
        }
        delete props.addElement;
    }

    for (var p in props) {
        if (_htmlRE.test(p)){
            this.h(props[p]);
        } else {
            var pp = p.toLowerCase();
            if (_styleOverrides[pp]) {
                this.styleSnap.set(pp, props[p]);
            } else if (_attrs[pp]) {
                this.attrSnap.set(pp, props[p]);
            } else {
                this.styleSnap.set(pp, props[p]);
            }
        }
    }
};

SNAPS.BrowserDom.prototype.$TYPE = 'BROWSERDOM';

function _styleSnapChanges(eleSnap) {
    for (var p in eleSnap.lastChanges) {
        var value = eleSnap.lastChanges[p].pending;

        if (value === SNAPS.DELETE) {
            this.element.style.removeProperty(p);
        } else {
            this.s(p, value);
        }
    }
}

function _attrSnapChanges(attrSnap) {
    for (var p in attrSnap.lastChanges) {
        var value = attrSnap.lastChanges[p].pending;

        if (value === SNAPS.DELETE) {
            this.element.removeAttribute(p);
        } else {
            this.a(p, value);
        }
    }
}

SNAPS.BrowserDom.prototype.initOutput = function () {

    this.attrSnap.addOutput(_attrSnapChanges.bind(this));
    this.styleSnap.addOutput(_styleSnapChanges.bind(this));
};

SNAPS.BrowserDom.prototype.set = function (prop, value) {
    this.attrSnap.set(prop, value);
};

SNAPS.BrowserDom.prototype.merge = function (prop, value, c) {
    this.attrSnap.merge(prop, value, c);
};

SNAPS.BrowserDom.prototype.setStyle = function (prop, value) {
    this.styleSnap.set(prop, value);
};

SNAPS.BrowserDom.prototype.destroy = function (prop, value) {
    this.removeElement();
    this.attrSnap.destroy();
    this.styleSnap.destroy();
    if (this.dataSnap){
        this.dataSnap.destroy();
    }
};
SNAPS.BrowserDom.prototype.addElement = function (parent) {
    if (!parent) {
        parent = document.body;
    }
    parent.appendChild(this.element);
};

SNAPS.BrowserDom.prototype.h = SNAPS.BrowserDom.prototype.html = function (value) {

    if (arguments.length > 0) {
        this.element.innerHTML = value;
        return this;
    } else {
        return this.element.innerHTML;
    }
};

SNAPS.BrowserDom.prototype.a = SNAPS.BrowserDom.prototype.attr = function (prop, value) {

    if (dataRE.test(prop)) {
        var args = _.toArray(arguments);
        return this.d.apply(this, args);
    }
    if (arguments.length > 1) {
        this.element.setAttribute(prop, value);
        return this;
    } else {
        return this.element.getAttribute(prop);
    }
};

/**
 * these are properties for which if numbers are provide a 'px' should be suffixed
 */
var _pxProps = _.reduce('border-bottom-width,border-left-width,border-radius,border-right-width,border-top-width,border-width,bottom,column-rule-width,column-width,columns,height,left,letter-spacing,line-height,margin,margin-bottom,margin-left,margin-right,margin-top,max-height,max-width,min-height,min-width,nav-down,nav-index,nav-left,nav-right,nav-up,outline-width,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,right,tab-size,text-indent,text-justify,top,width'.split(','),
    function (out, p) {
        out[p] = true;
        return out;
    }, {});

SNAPS.BrowserDom.prototype.s = SNAPS.BrowserDom.prototype.style = function (prop, value) {
    if (arguments.length > 1) {
        if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
            value = Math.round(value) + 'px';
        }

        this.element.style[prop] = value;

        return this;
    } else {
        return this.element.style[prop];
    }
};

//@TODO: park dom nodes in a pool
SNAPS.BrowserDom.prototype.removeElement = function () {
    var parent = this.element.parentNode;
    if (parent) {
        parent.removeChild(this.element);
    }
};

/**
 * data is kept in its own snap as it has different significance in use
 *
 * @type {RegExp}
 */

var dataRE = /^data-/i;
SNAPS.BrowserDom.prototype.d =
    SNAPS.BrowserDom.prototype.data = function (prop, value) {
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

SNAPS.BrowserDom.prototype._initDataSnap = function () {
    this.dataSnap = this.space.snap();
    for (var i = 0, attrs = this.element.attributes, l = attrs.length; i < l; i++) {
        var attr = (attrs.item(i).nodeName);
        if (dataRE.test(attr)) {
            this.d(this.a(attr));
        }
    }
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
    this.simple = !!(props && props.simple);
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
     * @type {Array}
     */
    this.observers = [];

    this._changeSignals = {};

    /**
     * rels (relationships) are collections of pointers to other Snaps.
     * Some of these include classic 'parent', 'child' relationships --
     * others can be any sort of internal relationships you may want.
     *
     * @type {Array}
     */
    this.rels = [];

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


Snap.prototype.$TYPE = 'SNAP';

Snap.prototype.state = function () {
    return _.clone(this._props);
};

Snap.prototype.destroy = function () {
    this.active = false;
    this.unparent();
    this._myProps = null;
    this._pendingChanges = null;
    _.each(this.links, function(l){
        l.removeSnap(this, true);
    }, this);
    this.rels = null;
};

Snap.prototype.addOutput = function (handler) {
    if (!this.output) {
        this.output = new signals.Signal();
    }

    this.output.add(handler);
};

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
    var blends = this.getRels('blend');
    var blendValues = {};

    var time = this.space.time;

    var doneBlends = [];

    for (var i = 0; i < blends.length; ++i) {
        var blend = blends[i];
        var toSnap = blend.toSnap();
        var prop = toSnap.get('prop', 1);
        var endTime = toSnap.get('endTime', 1);
        var value;
        var endValue = toSnap.get('endValue', 1);

        var progress;

        if (endTime <= time) {
            value = endValue;
            progress = 1;
            doneBlends.push(blend);
        } else {
            var startTime = toSnap.get('startTime', 1);
            var startValue = SNAPS.assert.or('number', toSnap.get('startValue', 1), 0);
            var dur = endTime - startTime;
            progress = time - startTime;
            progress /= dur;

            if (toSnap.has('blend')) {
                var blendFn = toSnap.get('blend');
                if (typeof(blendFn) == 'function') {
                    progress = blendFn(progress);
                }
            }
            value = (progress * endValue) + ((1 - progress) * startValue);
        }

        if (!blendValues[prop]) {
            blendValues[prop] = [];
        }

        blendValues[prop].push({
            value: value,
            progress: progress
        });
    }

    for (var b in blendValues) {
        var blendSet = blendValues[b];
        if (blendSet.length == 1) {
            this.set(b, blendSet[0].value);
        } else {
            var weight = 0;
            var netValue = 0;
            for (var bw = 0; bw < blendSet.length; ++bw) {
                var partProgress = blendSet[bw].progress;
                netValue += blendSet[bw].value * partProgress;
                weight += partProgress;
            }
            if (weight > 0) {
                this.set(b, netValue / weight);
            }
        }
    }

    for (var d = 0; d < doneBlends.length; ++d) {
        this.removeRel(doneBlends[d]);
        if (this.blendCount > 0) {
            --this.blendCount;
        }
    }
};

Snap.prototype.blend = function (prop, endValue, time, blendFn) {
    this.retireOtherBlends(prop, time);
    var valueSnap = this.space.snap();
    valueSnap.set('prop', prop);
    var startValue = this.has(prop) ? parseFloat(this.get(prop)) || 0 : 0;
    valueSnap.set('startValue', startValue)
        .set('endValue', endValue)
        .set('startTime', this.space.time)
        .set('endTime', this.space.time + Math.max(parseInt(time), 1))
        .set('blend', blendFn);
    this.rel('blend', valueSnap, {prop: prop});
    this.blendCount++;
};

Snap.prototype.retireOtherBlends = function (prop, time) {
    var otherBlends = _.filter(this.getRels('blend'), function (r) {
        return r.meta.prop == prop;
    });

    _.each(otherBlends, function (blend) {
        blend.destroy();
    })

};
Snap.prototype.removeLink = function (link) {
    if (!this.links.length) return;
    var linkId = isNaN(link) ? link.id : link;

    this.links = _.reject(this.links, function (link) {
        return link.id == linkId;
    })
};

Snap.prototype.addLink = function (link) {
    if (!_.find(this.links, function (l) {
        return l.id == link.id
    })) {
        this.links.push(link);
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

Snap.prototype.getRels = function (relType) {
    if (this.simple){
        throw 'Cannot add relationships to simple snaps';
    }
    return _.reduce(this.rels, function (list, rel) {
        if (rel.relType == relType) {
            list.push(rel);
        }
        return list;
    }, []);
};

Snap.prototype.rel = function (relType, toId, meta) {
    if (this.simple){
        throw 'Cannot add relationships to simple snaps';
    }
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
    if (this.simple){
        return [];
    }
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

/**
 * adds (and creates if necessary) a child snap.
 *
 * @param snap {Snap}
 * @returns {*}
 */
Snap.prototype.addChild = function (snap) {
    if (this.simple){
        throw 'Cannot add child to simple snap';
    }
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
    if (this.simple){
        return [];
    }
    var out = [];
    for (var i = 0; i < this.rels.length; ++i) {
        if (this.rels[i].relType == 'child') {
            out.push(this.rels[i].toSnap());
        }
    }
    return out;
};

Snap.prototype.unparent = function () {
    if (this.simple){
        return;
    }
    var parentRels = this.getRels('parent');
    for (var i = 0; i < parentRels.length; ++i) {
        var parent = parentRels[i].toSnap();
        parent.adoptChildren(this);
        parent.cleanseRels();
    }

};

Snap.prototype.adoptChildren = function (snap) {
    if (this.simple){
        return;
    }

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
    if (this.simple){
        return;
    }
    this.rels = _.filter(this.rels, function (r) {
        return r.active;
    });
};

Snap.prototype.removeRel = function (rel) {
    if (this.simple){
        return;
    }
    this.rels = _.reject(this.rels, function (r) {
        return r.id == rel.id;
    });
    rel.active = false;
};

Snap.prototype.broadcast = function (target, message, prop, value) {
    if (this.simple){
        return;
    }
    for (var i = 0; i < this.rels.length; ++i) {
        var rel = this.rels[i];
        if (rel.relType == target) {
            rel.broadcast(this.id, message, prop, value);
        }
    }
};
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

Snap.prototype.broadcastToChildren = function () {
    this.broadcast('child', 'update');
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
    this.start = new Date().getTime();
    this.time = 0;
};

Space.prototype.setTime = function (n) {
    this.time = n;
    return this;
};

Space.prototype.addLink = function(id, link){
    if (this.snaps[id] && (!this.snaps[id].simple)){
        this.snaps[id].addLink(link);
    }
};
Space.prototype.removeLink = function(link){
    _.each(link.ids, function(id){
        if (this.snaps[id] && (!this.snaps[id].simple)){
            this.snaps[id].removeLink(link);
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

Space.prototype.bd = function (props, ele, parent) {
    props = SNAPS.assert.or('object', props, {});
    if (ele) {
        props.element = ele;
    }
    if (parent) {
        props.addElement = parent;
    }

    return new SNAPS.BrowserDom(this, props);
};

Space.prototype.nextTime = function () {
    this.time = new Date().getTime() - this.start;
    return this.time;
};

Space.prototype.update = function (next) {
    if (next) {
        this.nextTime();
    }

    var i;
    var snap;

    var l = this.snaps.length;

    for (i = 0; i < l; ++i) {
        snap = this.snaps[i];
        if (snap.active) {
            snap.update();
        }
    }

    l = this.snaps.length;

    for (i = 0; i < l; ++i) {
        snap = this.snaps[i];
        if (snap.active && snap.output) {
            snap.output.dispatch(snap, this, this.time);
        }
    }

};

SNAPS.space = function () {
    return new Space();
};