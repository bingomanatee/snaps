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