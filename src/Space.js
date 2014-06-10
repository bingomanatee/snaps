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
