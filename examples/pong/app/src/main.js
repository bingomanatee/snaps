/* globals define */
define(function (require, exports, module) {

    var SNAPS = require('./snaps');

    var space = SNAPS.space();

    function animate() {
        space.update(true);
        requestAnimationFrame(animate);
    }

    var box = new SNAPS.BrowserDom(space, {
        width: '200px',
        height: '150px',
        'background-color': 'red',
        addElement: true,
        content: 'Bob the Box'
    });

    animate();
});
