/* globals define */
define(function (require, exports, module) {

    var SNAPS = require('./snaps');


    var space = SNAPS.space();
    space.document = document;

    function animate() {
        space.update(true);
        requestAnimationFrame(animate);
    }

    var box =  space.bd();
    box.setStyle({
        width: 200,
        height: 150,
        'background-color': 'red'
    });
    box.setContent( 'Bob the Box').addElement();



    var box2 =  space.bd().setStyle({
        position: 'absolute',
        top: 300,
        width: 100,
        height: 150,
        addElement: true,
        'background-color': 'green'
    }).setContent('Danny Dommo').addElement();

    var box3 =  space.bd().setStyle({
        position: 'absolute',
        top: 150,
        width: 100,
        height: 150,
        addElement: true,
        'background-color': 'blue'
    }).setContent("Three Musketeers").addElement();

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

    animate();
});
