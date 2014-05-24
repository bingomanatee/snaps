var SNAPS = require('./../snaps');

var count = 0;
var DURATION = 3000;
var SPACE_COUNT = 10000;

var space = SNAPS.space();
for (var i = 0; i < SPACE_COUNT; ++i) {
    space.snap();
}

var start = new Date().getTime();

function _iterateSpace() {
    ++count;
    space.update();

    if (new Date().getTime() - start < DURATION) {
        setImmediate(_iterateSpace);
    } else {
        console.log('%s counts in %d ms: %s / second with %s snaps',
            count, DURATION, Math.round(10000 * count / DURATION)/10, SPACE_COUNT);
    }
}

_iterateSpace();
