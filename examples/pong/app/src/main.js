/* globals define */
define(function (require, exports, module) {
    var PADDLEWIDTH = 350;
    var PADDLEBOTTOM = 5;
    var BLOCKHEIGHT = 25;
    var BALLSIZE = 10;
    var BLOCKMARGIN = 4;
    var PADDLEHEIGHT = 12;

    var BLOCKWIDTHPERCENT = Math.ceil(100 * 200 / window.innerWidth);

    var SNAPS = require('./snaps');

    var space = SNAPS.space();
    space.document = document;

    var back = space.bd()
        .attr('class', 'back abs')
        .addElement();
    back.addBox({widthPercent: 100, heightPercent: 100});

    var xPanel = space.bd()
        .attr('class', 'abs panel')
        .style('right', 150)
        .addElement();
    var yPanel = space.bd()
        .attr('class', 'abs panel')
        .addElement();

    var blocks = _.flatten(_.map(_.range(0, 100, BLOCKWIDTHPERCENT), function (xPercent) {
        return _.map(_.range(0, 8), function (row) {
            var block = space.bd()
                .attr('class', 'abs block')
                .style('left', xPercent + '%')
                .style('top', (BLOCKMARGIN + BLOCKHEIGHT) * row)
                .addElement();
            block.addBox({widthPercent: BLOCKWIDTHPERCENT, height: BLOCKHEIGHT});
            return block;
        });
    }));

    var GOPANELWIDTH = 80;
    var GOPANELHEIGHT = 80;

    var rightWall = space.bd()
        .style('right', 0)
        .attr('class', 'abs wall')
        .addElement();
    rightWall.addBox({heightPercent: 100, width: 20});

    var leftWall = space.bd()
        .style('left', 0)
        .attr('class', 'abs wall')
        .addElement();
    leftWall.addBox({heightPercent: 100, width: 20});

    function _ball() {
        var ball = space.bd()
            .addElement();
        ball.attr('class', 'abs ball');
        ball.addBox({width: BALLSIZE, height: BALLSIZE});
        return ball;
    }

    var paddle = space.bd()
        .attr('class', 'abs paddle')
        .addElement()
        .style('bottom', PADDLEBOTTOM);
    paddle.addBox({width: PADDLEWIDTH, height: PADDLEHEIGHT});

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
        shadow[s].style('opacity', 1 / (1 + s));
    }

    var x_dir = 1;
    var y_dir = 1;
    ball.styleSnap.set('top', 250);
    ball.styleSnap.set('left', Math.round(Math.random() * window.innerWidth));
    var x_speed = Math.random() / 2 + 0.5;
    var y_speed = Math.random() / 2 + 0.5;

    var velocity = Math.sqrt((x_speed * x_speed) + (y_speed * y_speed));

    var lastTime = space.time;
    var left = 10;
    var top = 10;

    function _copyPos(a, b) {
        b.style('left', a.style('left'));
        b.style('top', a.style('top'));
    }

    var center = space.bd()
        .style({left: 0, top: '50%'})
        .addElement()
        .style({display: 'none', opacity: 0})
        .attr('class', 'abs');

    center.addBox({widthPercent: 100, height: 1});
    var goPanel = space.bd(null, center)
        .attr('class', 'abs go-panel')
        .style({left: ((100 - GOPANELWIDTH )/ 2) + '%', top: -GOPANELHEIGHT})
        .innerHTML('GAME OVER')
        .addElement(center.e());
    goPanel.addBox({widthPercent: GOPANELWIDTH, height: GOPANELHEIGHT});
    center.link(goPanel);

    var front = space.bd().addElement().attr('class', 'abs');
    front.addBox({widthPercent: 100, heightPercent: 100});

    front.e().addEventListener('mousemove', function (e) {
        paddle.style('left', e.clientX - PADDLEWIDTH / 2);
    });

    function _spinX() {
        if (paddleXs < 4) {
            return;
        }
        var time = space.time;
        var firstPos = paddleXs[0];
        var spin = _.reduce(paddleXs.slice(1), function (out, position) {
            var force = firstPos.left - position.left;
            var weight = Math.sqrt(firstPos.time - position.time);
            // console.log('force: ', force, 'weight: ', weight);
            out += force / weight;
            return out;
        }, 0);

        //     console.log('spin');
        x_speed += spin / 100;
        if (x_speed < 0) {
            x_speed *= -1;
            x_dir *= -1;
        }

        var newVel = Math.sqrt((x_speed * x_speed) + (y_speed * y_speed));
        var vScale = velocity / newVel;

        x_speed *= vScale;
        y_speed *= vScale;
    }

    var slip = false;

    var paddleXs = [];

    var first = 1;

    function _gameOver() {

        center.style('display', 'block')
            .styleSnap.blend('opacity', 1, 4000);

    }

    function animate() {

        paddleXs.unshift({time: space.time, left: paddle.style('left')});
        while (paddleXs.length > 10) {
            paddleXs.pop();
        }
        space.update(1);
        var dTime = space.time - lastTime;
        for (var i = 1; i < shadow.length; ++i) {
            _copyPos(shadow[i - 1], shadow[i]);
        }

        var x = ball.style('left');
        var y = ball.style('top');

        x += x_speed * x_dir * dTime;
        y += y_speed * y_dir * dTime;

        var right = window.innerWidth - 10;
        var bottom = window.innerHeight - PADDLEHEIGHT - PADDLEBOTTOM;
        if (x > right) {
            x -= x - right;
            x_dir *= -1;
        } else if (x < left) {
            x -= x - left;
            x_dir *= -1;
        }

        if (y >= bottom && y_dir > 0) {
            var paddleLeft = paddle.style('left');
            if (!slip) {
                console.log('at bottom -- paddleLeft = ', paddleLeft, ', right=', paddleLeft + PADDLEWIDTH, 'x = ', x);
            }
            if (!slip && (x > paddleLeft) && (x < paddleLeft + PADDLEWIDTH)) {

                y -= y - bottom;
                y_dir *= -1;
                _spinX();
            } else {
                slip = true;
                _gameOver();
            }
        } else if (y < top) {
            y -= y - top;
            y_dir *= -1;
        }

        ball.style('left', x);
        ball.style('top', y);

        lastTime = space.time;

        yPanel.innerHTML(Math.round(y));
        xPanel.innerHTML(Math.round(x));

        var hit = false;
        if (y < 300) {
            for (var b = 0; b < blocks.length; ++b) {
                var block = blocks[b];
                if ((!block.get('hit')) && block.contains(x + BALLSIZE / 2, y + BALLSIZE / 2)) {
                    block.style('background-color', 'white');
                    block.set('hit', true);
                    hit = true;
                    block.styleSnap.set('opacity', 1).update();
                    block.styleSnap.blend('opacity', 0, 500);
                }
            }
        }

        if (hit) {
            blocks = _.reject(blocks, function (block) {
                return block.get('hit')
            });
            console.log('blocks left: ', blocks.length);
            if (blocks.length <= 1) {
                _gameOver();
                goPanel.innerHTML('YOU WIN!')
            }
        }

        ++first;

        requestAnimationFrame(animate);
    }

    animate();
});
