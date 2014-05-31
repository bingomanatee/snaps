/* globals define */
define(function (require, exports, module) {
    var PADDLEWIDTH = 350;
    var PADDLEBOTTOM = 5;
    var BLOCKHEIGHT = 25;
    var BALLSIZE = 10;
    var BLOCKMARGIN = 1;
    var PADDLEHEIGHT = 12;
    var GOPANELWIDTH = 80;
    var GOPANELHEIGHT = 80;
    var BLOCKWIDTHPERCENT = 5
    var BALL_COUUNT = 60;
    var WALLHEIGHT = 15;

    var SNAPS = require('./snaps');
    var xPanel, yPanel;
    var score = 0;
    var gameOver = false;

    var space = SNAPS.space();
    space.document = document;

    var back = space.bd()
        .attr('class', 'back abs')
        .addElement();
    back.addBox({widthPercent: 100, heightPercent: 100});

    /**
     * creating feedback panels for coordinates of lead ball
     */
    xPanel = space.bd()
        .attr('class', 'abs panel')
        .style('right', 150)
        .addElement();
    yPanel = space.bd()
        .attr('class', 'abs panel')
        .addElement();

    /**
     * Creating a series of blocks as targets
     * @type {Array}
     */
    var innerCourt = space.bd()
        .attr({
            margin: WALLHEIGHT,
            'class': 'abs'
        })
        .style({
            left: WALLHEIGHT,
            top: WALLHEIGHT
        })
        .addElement();
    innerCourt.addBox({width: window.innerWidth - (2 * WALLHEIGHT), heightPercent: 100});

    var blocks = _.flatten(_.map(_.range(0, 100, BLOCKWIDTHPERCENT), function (xPercent) {
        return _.map(_.range(0, 8), function (row) {
            var block = space.bd()
                .attr('class', 'abs block')
                .style('left', xPercent + '%')
                .style('top', (BLOCKHEIGHT + BLOCKMARGIN) * row)
                .addElement(innerCourt);
            block.addBox({widthPercent: BLOCKWIDTHPERCENT, height: BLOCKHEIGHT});
            return block;
        });
    }));

    /**
     * creating graphics for left, right wall
     */

    var rightWall = space.bd()
        .style('right', 0)
        .attr('class', 'abs wall')
        .addElement();
    rightWall.addBox({heightPercent: 100, width: WALLHEIGHT});

    var leftWall = space.bd()
        .style('left', 0)
        .attr('class', 'abs wall')
        .addElement();
    leftWall.addBox({heightPercent: 100, width: WALLHEIGHT});

    var topWall = space.bd()
        .attr('class', 'abs wall')
        .addElement();
    topWall.addBox({height: WALLHEIGHT});

    /**
     * creating ball trail
     */

    function _ball(i) {
        var ball = space.bd()
            .addElement()
            .attr('class', 'abs ball')
            .style('opacity', 1 / (1 + i));
        ball.addBox({width: BALLSIZE, height: BALLSIZE});
        return ball;
    }

    // initial position, velocity

    var x_dir = 1;
    var y_dir = 1;
    var x_speed = Math.random() / 2 + 0.5;
    var y_speed = Math.random() / 2 + 0.5;

    var velocity = Math.sqrt((x_speed * x_speed) + (y_speed * y_speed));

    var lastTime = space.time;
    var left = 10;
    var top = 10;

    var balls = _.map(_.range(0, BALL_COUUNT), _ball);
    balls[0].style('top', 250)
        .style('left', Math.round(Math.random() * window.innerWidth));

    function _copyPos(a, b) {
        b.style('left', a.style('left'));
        b.style('top', a.style('top'));
    }

    /**
     * creating paddle
     */

    var paddle = space.bd()
        .attr('class', 'abs paddle')
        .addElement()
        .style('bottom', PADDLEBOTTOM);
    paddle.addBox({width: PADDLEWIDTH, height: PADDLEHEIGHT});

    /**
     * creating display for game ending overlay
     */

    var centerPanel = space.bd()
        .style({left: 0, top: '50%'})
        .addElement()
        .style({display: 'none', opacity: 0})
        .attr('class', 'abs');

    centerPanel.addBox({widthPercent: 100, height: 1});
    var goPanel = space.bd(null, centerPanel)
        .attr('class', 'abs go-panel')
        .style({left: ((100 - GOPANELWIDTH ) / 2) + '%', top: -GOPANELHEIGHT - window.innerHeight / 2})
        .innerHTML('GAME OVER')
        .addElement(centerPanel.e());
    goPanel.addBox({widthPercent: GOPANELWIDTH, height: GOPANELHEIGHT});
    centerPanel.link(goPanel);

    var scorePanel = space.bd(null, centerPanel)
        .attr('class', 'abs score-panel')
        .style({left: ((100 - GOPANELWIDTH ) / 2) + '%', top: GOPANELHEIGHT / 2, opacity: 0})
        .innerHTML('score: 0')
        .addElement(centerPanel.e());
    scorePanel.addBox({widthPercent: GOPANELWIDTH, height: GOPANELHEIGHT});
    centerPanel.link(scorePanel);

    /**
     * creating a transparent overlay to detect mouse position to move panel
     */

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
        gameOver = true;
        centerPanel.style('display', 'block')
            .styleSnap.blend('opacity', 1, 2000, SNAPS.ease.bounceOut);

        goPanel.styleSnap.blend('top', -GOPANELHEIGHT, 800, SNAPS.ease.bounceOut);
        setTimeout(function(){
            scorePanel
                .styleSnap.blend('opacity', 1, 500, SNAPS.ease.bounceIn);
        }, 1000);
    }

    function animate() {

        space.update(1);
        if (!gameOver) {

            paddleXs.unshift({time: space.time, left: paddle.style('left')});
            while (paddleXs.length > 10) {
                paddleXs.pop();
            }
            var dTime = space.time - lastTime;
            for (var i = 1; i < balls.length; ++i) {
                _copyPos(balls[i - 1], balls[i]);
            }

            var x = balls[0].style('left');
            var y = balls[0].style('top');

            x += x_speed * x_dir * dTime;
            y += y_speed * y_dir * dTime;
            balls[0].style('left', x)
                .style('top', y);

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
                        score += 100;
                        scorePanel
                            .innerHTML('score: ' + score)
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
        }

        requestAnimationFrame(animate);
    }

    animate();
});
