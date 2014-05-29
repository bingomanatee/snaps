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

    this.changeReceptors = {};

    this.terminal = new Terminal({inherit: [[this.inherit, this]]});

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

