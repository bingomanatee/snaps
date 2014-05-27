/* globals define */
define(function (require, exports, module) {

    var SNAPS = require('./snaps');


    var space = SNAPS.space();

    function animate() {
        space.update(true);
        requestAnimationFrame(animate);
    }

    var box = new SNAPS.BrowserDom(space, {
        width: 200,
        height: 150,
        'background-color': 'red',
        addElement: true,
        content: 'Bob the Box'
    });

    setTimeout(function(){
        box.styleSnap.blend('width', 400, 5000, SNAPS.ease.elasticIn);
    }, 4000);

    setTimeout(function(){
        box2.styleSnap.blend('width', 800, 3000);
        setTimeout(function(){
            box2.styleSnap.blend('width', 300, 4500);
        }, 2000);
    }, 3000);

    setTimeout(function(){
        box3.styleSnap.blend('width', 800, 300, SNAPS.ease.elasticOut);
    }, 2000);



    var box2 = new SNAPS.BrowserDom(space, {
        position: 'absolute',
        top: 300,
        width: 100,
        height: 150,
        html: 'Danny Dommo',
        addElement: true,
        'background-color': 'green'
    });

    var box3 = new SNAPS.BrowserDom(space, {
        position: 'absolute',
        top: 150,
        width: 100,
        height: 150,
        html: 'Danny Dommo',
        addElement: true,
        'background-color': 'blue'
    });

    animate();
});
