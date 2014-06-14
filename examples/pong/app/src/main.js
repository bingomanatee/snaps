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
    var big = window.innerWidth > 900;
    var BLOCKWIDTHPERCENT = big ? 4 : 5;
    var BALL_COUUNT = 60;
    var WALLHEIGHT = 15;
    var BLOCKHEIGHTOFFSET = (BLOCKHEIGHT + BLOCKMARGIN);

    var SNAPS = require('./snaps');
    var xPanel, yPanel;
    var score = 0;
    var gameOver = false;

    var space = SNAPS.space();
    space.document = document;

    var back = space.bd()
        .attr('class', 'back abs')
        .elementToDom();
    back.size('width', 100, '%').size('height', 100, '%');

    /**
     * creating feedback panels for coordinates of lead ball
     */
    xPanel = space.bd()
        .attr('class', 'abs panel')
        .style('right', 150)
        .elementToDom();
    yPanel = space.bd()
        .attr('class', 'abs panel')
        .elementToDom();

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
        .elementToDom();
    innerCourt.size('width', window.innerWidth - (2 * WALLHEIGHT), 'px').size('height', 100, '%');

    var blocks = _.flatten(_.map(_.range(0, 100, BLOCKWIDTHPERCENT), function (xPercent) {
        return _.map(_.range(0, 8), function (row) {
            var block = space.bd(null, innerCourt)
                .attr('class', 'abs block')
                .style('left', xPercent + '%')
                .style('top', WALLHEIGHT + BLOCKHEIGHTOFFSET * row + 'px')
                .elementToDom(innerCourt);

            block.size('width', BLOCKWIDTHPERCENT, '%').size('height', BLOCKHEIGHT, 'px');
            return block;
        });
    }));

    /**
     * creating graphics for left, right wall
     */

    var rightWall = space.bd()
        .style('right', 0)
        .attr('class', 'abs wall')
        .elementToDom();

    rightWall.size('height', 100, '%').size('width', WALLHEIGHT, 'px');

    var leftWall = space.bd()
        .style('left', 0)
        .attr('class', 'abs wall')
        .elementToDom();
    leftWall.size('height', 100, '%').size('width', WALLHEIGHT, 'px');

    var topWall = space.bd()
        .attr('class', 'abs wall wall-top')
        .elementToDom();
    topWall.size('height', WALLHEIGHT, 'px').size('width', 100, '%');

    /**
     * creating ball trail
     */

    function _ball(i) {
        var ball = space.bd()
            .elementToDom()
            .attr('class', 'abs ball')
            .style('opacity', 1 / (1 + i));
        return ball;
    }

    // initial position, velocity

    var x_dir = 1;
    var y_dir = 1;
    var x_speed = Math.random() / 2 + 0.5;
    var y_speed = Math.random() / 2 + 0.5;
    if (big) {
        x_speed /= 1.5;
        y_speed /= 1.5;
    }

    var velocity = Math.sqrt((x_speed * x_speed) + (y_speed * y_speed));
    var velScale = (big ? 0.5 : 1) / velocity;

    x_speed *= velScale;
    y_speed *= velScale;

    var lastTime = space.time;
    var left = WALLHEIGHT;
    var top = WALLHEIGHT;

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
        .elementToDom()
        .style('bottom', PADDLEBOTTOM);
    paddle.size('width', PADDLEWIDTH, 'px').size('height', PADDLEHEIGHT, 'px');

    /**
     * creating display for game ending overlay
     */

    var centerPanel = space.bd()
        .style({left: 0, top: '50%'})
        .elementToDom()
        .style({display: 'none', opacity: 0})
        .attr('class', 'abs');
    centerPanel
        .size('width', 100, '%')
        .size('height', 1, 'px');

    var goPanel = space.bd(null, centerPanel)
        .attr('class', 'abs go-panel')
        .style({left: ((100 - GOPANELWIDTH ) / 2) + '%', top: -GOPANELHEIGHT - window.innerHeight / 2})
        .innerHTML('GAME OVER')
        .elementToDom();
    goPanel.size('width', GOPANELWIDTH, '%').size('height', GOPANELHEIGHT, 'px');
    centerPanel.link(goPanel);

    var scorePanel = space.bd(null, centerPanel)
        .attr('class', 'abs score-panel')
        .style({left: ((100 - GOPANELWIDTH ) / 2) + '%', top: GOPANELHEIGHT / 2, opacity: 0})
        .innerHTML('score: 0')
        .elementToDom(centerPanel.e());
    scorePanel.size('width', GOPANELWIDTH, '%').size('height', GOPANELHEIGHT, 'px');
    centerPanel.link(scorePanel);

    /**
     * creating a transparent overlay to detect mouse position to move panel
     */

    var front = space.bd().elementToDom().attr('class', 'abs');
    front.size('width', 100, '%').size('height', 100, '%');

    front.e().addEventListener('mousemove', function (e) {
        paddle.style('left', e.clientX - PADDLEWIDTH / 2);
    });

    function _spinX() {
        if (paddleXs.length < 4) {
            return;
        }

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
        setTimeout(function () {
            scorePanel
                .styleSnap.blend('opacity', 1, 500, SNAPS.ease.bounceIn);
        }, 1000);
    }

    var bounceTime = 0;

    function _startCooldown(which) {
        bounceTime = space.time;
        console.log('bounce', which);
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

            var right = window.innerWidth - WALLHEIGHT - BALLSIZE;
            var bottom = window.innerHeight - PADDLEHEIGHT - PADDLEBOTTOM - BALLSIZE;

            var cooldown = space.time - bounceTime;

            if (cooldown > 500) {
                if (x > right) {
                    x -= x - right;
                    x_dir *= -1;
                    _startCooldown('right');
                } else if (x < left) {
                    x -= x - left;
                    x_dir *= -1;
                    _startCooldown('left');
                }
                if (y >= bottom && y_dir > 0) {
                    var paddleLeft = paddle.style('left');
                    if (!slip && (x > paddleLeft) && (x < paddleLeft + PADDLEWIDTH)) {
                        y -= y - bottom;
                        y_dir *= -1;
                        _startCooldown('paddle');
                        _spinX();
                    } else {
                        slip = true;
                        _gameOver();
                    }
                } else if (y < top) {
                    y -= y - top;
                    y_dir *= -1;
                    _startCooldown('top');
                }
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
