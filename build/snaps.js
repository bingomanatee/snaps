var SNAPS = {
    signals: signals,
    DELETE: {SNAP_DELETE: true}
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

    or: function(){
        var args = _.toArray(arguments);
        var name = args.shift();
        var alt = args.pop();
        try {
           return SNAPS.assert[name].apply(SNAPS.assert, args);
        } catch(err){
            return alt;
        }
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

        var progress = (this.space.time - this.startTime) / (this.endTime - this.startTime);
        this.handler.call(target, progress);
    }
}
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
    this.snap = space.snap();

    var rel = this.snap.rel('style', space.snap());
    this.styleSnap = rel.toSnap();

    this.tagName = props.tagName || 'div';
    delete props.tagName;

    this.element = this.e = props.element || document.createElement(this.tagName);
    this.changeWatchers = {};
    this.initOutput();

    this.initWatchers(props.watchedProps || ['classes', 'content', 'id', 'name']);
    delete props.watchedProps;

    if (props.addElement === true) {
        this.addElement();
        delete props.addElement;
    } else if (props.addElement) {
        var parent = SNAPS.assert.$TYPE(props.addElement, 'BROWSERDOM', function () {
            return props.addElement;
        });
        this.addElement(parent);
        delete props.addElement;
    }

    for (var p in props) {
        if (this.changeWatchers[p]) {
            this.snap.set(p, props[p]);
        } else {
            this.styleSnap.set(p, props[p]);
        }
    }
};

SNAPS.BrowserDom.prototype.$TYPE = 'BROWSERDOM';

SNAPS.BrowserDom.prototype.stylesChanged = function (eleSnap) {

    for (var p in eleSnap.lastChanges) {
        var value = eleSnap.lastChanges[p].pending;

        if (value == SNAPS.DELETE) {
            this.element.style.removeProperty(p);
        } else {
            this.s(p, value);
        }
    }
};

SNAPS.BrowserDom.prototype.initOutput = function () {

    this.snap.addOutput(this.changed.bind(this));
    this.styleSnap.addOutput(this.stylesChanged.bind(this));
};

SNAPS.BrowserDom.prototype.addElement = function (parent) {
    if (!parent) {
        parent = document.body;
    }
    parent.appendChild(this.element);
};

function DomChangeClass(classes) {
    if (_.isArray(classes)) {
        classes = classes.join(' ');
    }
    this.e.className = classes;
}

function DomChangeId(id) {
    this.a('id', id);
}

function DomChangeName(id) {
    this.a('name', id);
}

function DomChangeContent(html) {
    this.h(html);
}

SNAPS.BrowserDom.prototype.initWatchers = function (watchers) {

    for (var i = 0; i < watchers.length; ++i) {
        var w = watchers[i].toLowerCase();

        switch (w) {

            case 'classes':
                this.changeWatchers.classes = DomChangeClass.bind(this);
                break;

            case 'id':
                this.changeWatchers.id = DomChangeId.bind(this);
                break;

            case 'content':
                this.changeWatchers.content = DomChangeContent.bind(this);
                break;

            case 'name':
                this.changeWatchers.name = DomChangeName.bind(this);
                break;

            default:
                throw 'Unknown Watcher ' + w;
        }
    }
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

    if (arguments.length > 1) {
        this.element.setAttribute(prop, value);
        return this;
    } else {
        return this.element.getAttribute(prop);
    }
};

SNAPS.BrowserDom.prototype.s = SNAPS.BrowserDom.prototype.style = function (prop, value) {

    if (arguments.length > 1) {
        this.element.style[prop] = value;
        return this;
    } else {
        return this.element.style[prop];
    }
};

SNAPS.removeElement = function () {
    if (this.element.parent) {
        this.element.parent.removeChild(this.element);
    }
};

/**
 *
 * @param changes {Object}
 */
SNAPS.BrowserDom.prototype.changed = function (snap, space, time) {

    var changes = snap.lastChanges;
    if (!changes){
        return;
    }
    for (var p in changes) {
        if (this.changeWatchers.hasOwnProperty(p)) {
            var value = changes[p].pending;
            var old = changes[p].old
            var watcher = this.changeWatchers[p];
            watcher(value, old);
        } else {
            this.setStyle(p, changes[p].pending);
        }
    }
};

SNAPS.BrowserDom.prototype.set = function (prop, value) {
    this.snap.set(prop, value);
};

SNAPS.BrowserDom.prototype.merge = function (prop, value, c) {
    this.snap.merge(prop, value, c);
};

SNAPS.BrowserDom.prototype.setStyle = function (prop, value) {
    this.styleSnap.set(prop, value);
};
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

Snap.prototype.update = function (broadcast) {
    if (!this.active) {
        // shouldn't be possible but just in case
        return;
    }

    if (this.blendCount > 0) {
        this.updateBlends();
    }

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

    if (this.output) {
        this.lastChanges = this.pending();
    } else {
        this.lastChanges = false;
    }

    this._pendingChanges = {};
    if (broadcast) {
        this.broadcast('child', 'update');
    }
};

Snap.prototype.updateBlends = function () {
    var blends = this.getRels('blends');
    var blendValues = {};
    var time = this.space.time;

    var doneBlends = [];

    for (var i = 0; i < blends.length; ++i) {
        var blend = blends[i];
        var prop = blend.get('prop');
        var endTime = blend.get('endTime');
        var value;
        var endValue = blend.get('endValue');
        var progress;

        if (endTime <= time) {
            value = endValue;
            progress = 1;
            doneBlends.push(blend);
        } else {
            var startTime = blend.get('startTime');
            var startValue = blend.get('startValue');
            var dur = endTime - startTime;
            progress = time - startTime;
            progress /= dur;

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
            this.set(b, blend[0].value);
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

        for (var d = 0; d < doneBlends.length; ++d) {
            this.removeRel(doneBlends[d]);
        }
    }
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

Snap.prototype.set = function (prop, value) {
    this._myProps[prop] = value;
    this._pendingChanges[prop] = value;
    this.broadcast('child', 'inherit', prop, value);
};

Snap.prototype.del = function (prop) {
    this.set(prop, SNAP.DELETE);
};

Snap.prototype.setAndUpdate = function (prop, value) {
    this.set(prop, value);
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

    for (var p in this._pendingChanges) {
        return true;
    }
    return false;
};

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
    var valueSnap = this.space.snap();
    valueSnap.set('prop', prop);
    var startValue = this.has(prop) ? parseFloat(this.get(prop)) || 0 : 0;
    valueSnap.set('startValue', startValue);
    valueSnap.set('endValue', endValue);
    valueSnap.set('startTime', this.space.time);
    valueSnap.set('endTime', this.space.time + Math.max(parseInt(time), 1));
    valueSnap.set('blend', blend);
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

Space.prototype.bd = function(props, ele, parent){
    props = SNAPS.assert.or('object', props, {});
    if (ele){
        props.element = ele;
    }
    if (parent){
        props.addElement = parent;
    }

    return new SNAPS.BrowserDom(this, props);
};

Space.prototype.nextTime = function () {
    this.time = new Date().getTime() - this.start;
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