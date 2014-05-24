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

Space.prototype.nextTime = function () {
    this.time = new Date().getTime() - this.start;
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