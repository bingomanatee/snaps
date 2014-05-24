var SNAPS = require('./../snaps');

var count = 0;
var DURATION = 3000;
var SPACE_COUNT = 10000;
var TIME_OBS_COUNT = 40;
var OBS_MAX_TIME = DURATION * 2;

var space = SNAPS.space();
for (var i = 0; i < SPACE_COUNT; ++i) {
    var snap = space.snap();
    for (var n = 0; n < TIME_OBS_COUNT; ++n) {
        snap.observe({minTime: 0, maxTime: OBS_MAX_TIME}, function (progress) {
            this.set('y' + n, Math.round(progress * 100));
        });
    }
}

var start = new Date().getTime();

function _iterateSpace() {
    ++count;
    space.update();

    if (new Date().getTime() - start < DURATION) {
        setImmediate(_iterateSpace);
    } else {
        console.log(
            '%s counts in %d ms: %s / second with %s snaps, %s time based observers on each',
            count,
            DURATION,
            Math.round(10000 * count / DURATION) / 10,
            SPACE_COUNT,
            TIME_OBS_COUNT
        );
    }
}

_iterateSpace();
