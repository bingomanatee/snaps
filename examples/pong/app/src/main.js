/* globals define */
define(function (require, exports, module) {

    var SNAPS = require('./snaps');

    var space = SNAPS.space();
    space.document = document;

    var back = space.bd()
        .addElement();
    back.addBox({widtPercent: 100, heightPercent: 100});
    back.attrSnap.set('class', 'back abs');

    var rightWall = space.bd()
        .setStyle('right', 0)
        .addElement();
    rightWall.addBox({heightPercent: 100, width: 20});
    rightWall.attrSnap.set('class', 'abs wall');

    var leftWall = space.bd()
        .setStyle('left', 0)
        .addElement();
    leftWall.addBox({heightPercent: 100, width: 20});
    leftWall.attrSnap.set('class', 'abs wall');

    function _ball() {
        var ball = space.bd()
            .addElement();
        ball.attrSnap.set('class', 'abs ball');
        ball.addBox({width: 10, height: 10});
        return ball;
    }

    var ball = _ball();
    var ball2 = _ball();
    var ball3 = _ball();
    var ball4 = _ball();
    var ball5 = _ball();
    var ball6 = _ball();
    var shadow = [
        ball,
        ball2,
        ball3,
        ball4,
        ball5,
        ball6
    ];
    for (var s = 1; s < shadow.length; ++s) {
        shadow[s].setStyle('opacity', 1 / (1 + s));
    }

    var x_dir = 1;
    var y_dir = 1;
    ball.styleSnap.set('top', Math.round(Math.random() * window.innerHeight));
    ball.styleSnap.set('left', Math.round(Math.random() * window.innerWidth));
    var x_speed = Math.random() + 0.2;
    var y_speed = Math.random() + 0.2;
    var lastTime = space.time;
    var left = 10;
    var top = 10;

    function _copyPos(a, b) {
        b.setStyle('left', a.styleSnap.get('left'));
        b.setStyle('top', a.styleSnap.get('top'));
    }

    function animate() {
        space.update(1);
        var dTime = space.time - lastTime;
        for (var i = 1; i < shadow.length; ++i) {
            _copyPos(shadow[i - 1], shadow[i]);
        }

        var x = ball.styleSnap.get('left');
        var y = ball.styleSnap.get('top');

        x += x_speed * x_dir * x_speed * dTime;
        y += y_speed * y_dir * y_speed * dTime;
        var right = window.innerWidth - 10;
        var bottom = window.innerHeight - 5;
        if (x > right) {
            x -= x - right;
            x_dir *= -1;
        } else if (x < left) {
            x -= x - left;
            x_dir *= -1;
        }

        if (y > bottom) {
            y -= y - bottom;
            y_dir *= -1;
        } else if (y < top) {
            y -= y - top;
            y_dir *= -1;
        }

        ball.setStyle('left', x);
        ball.setStyle('top', y);

        lastTime = space.time;

        requestAnimationFrame(animate);
    }

    animate();
});
