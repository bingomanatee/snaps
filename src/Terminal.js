/**
 * This is a router for signals;
 * as Signal is not designed to filter messages by type
 * the Terminal does this for a suite of signals.
 */

function Terminal(initial, locked) {
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

Terminal.prototype.checkWhat = function (what, doErr) {

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
    return this.receptor[what] ? this.receptor[what]._bindings.length : 0;
};

Terminal.prototype.listen = function () {
    var args = _.toArray(arguments);
    var what = SNAPS.assert.notempty(args.shift(), 'string');

    this.checkWhat(what, true);

    if (!this.receptor[what]) {
        this.receptor[what] = new signals.Signal();
    }

    if (check.array(args[0])) {
        this.receptor[what].add.apply(this.receptor[what], args[0]);
    } else {
        this.receptor[what].add.apply(this.receptor[what], args);
    }

};

Terminal.prototype.dispatch = function () {
    var args = _.toArray(arguments);
    var what = SNAPS.assert.notempty(args.shift(), 'string');

    if (this.receptor[what]) {
        if (this.receptor[what].active) {
            if(this.receptor[what]._bindings.length > 0){
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