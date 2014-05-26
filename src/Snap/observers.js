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