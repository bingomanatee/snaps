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