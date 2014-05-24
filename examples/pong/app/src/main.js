/* globals define */
define(function (require, exports, module) {

    var SNAPS = require('./snaps');

    var space = SNAPS.space();

    var snap = space.snap();

    snap.observe({startTime: 0, endTime: 10000}, function (p) {
        this.set('n', p);
        debugger;
    });

    function animate() {
        space.update(true);
        console.log('n: ', snap.get('n'));
        requestAnimationFrame(animate);
    }

    animate();
});
