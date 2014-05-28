var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var util = require('util');

describe('SNAPS', function () {

    describe('Snap', function () {
        var Snap;
        before(function () {
            Snap = SNAPS.Snap('TESTING');
        });

        describe('#constructor', function () {

            describe('validation', function () {

                it('should throw error when non-space is passed', function () {
                        try {
                            var snap = new Snap('TESTING')(1);
                            ''.should.eql(1); // force an error -- should not be reached
                        } catch (err) {
                            err.message.should.eql('Invalid object');
                        }
                    }
                );

                it('should throw error when a non-number id is passed', function () {
                        try {
                            var snap = new Snap({$TYPE: 'SPACE'});
                            ''.should.eql(1); // force an error -- should not be reached
                        } catch (err) {
                            err.message.should.eql('id must be a number');
                        }
                    }
                )
            });

            describe('a good Snap', function () {

                var snap;

                before(function () {
                    snap = new Snap({$TYPE: 'SPACE', foo: 3}, 1);
                });

                it('should have id 1', function () {
                    snap.id.should.eql(1)
                });

                it('should have the passed in space', function () {
                    snap.space.foo.should.eql(3)
                });
            })
        });

        describe('#get and #set', function () {
            var space;
            var snap;

            before(function () {
                space = SNAPS.space();
                snap = space.snap();
            });

            it('should let you set a property', function () {
                snap.hasPendingChanges().should.eql(false);
                snap.set('foo', 1);
                new String(typeof( snap.get('foo'))).should.eql('undefined');
                snap.hasPendingChanges().should.eql(true);

                snap.update();

                snap.get('foo').should.eql(1);
                snap.hasPendingChanges().should.eql(false);
            });

            it('should let you set a property with instant update', function () {
                snap.hasPendingChanges().should.eql(false);
                snap.setAndUpdate('foo', 1);
                snap.get('foo').should.eql(1);
                snap.hasPendingChanges().should.eql(false);
            });

            describe('children', function () {

                describe('inheritance', function () {

                    describe('(simple)', function () {

                        var space;
                        var snap;
                        var snapChild;

                        before(function () {
                            space = SNAPS.space();
                            snap = space.snap();
                            snapChild = space.snap();
                            snap.link(snapChild);
                        });

                        it('should cascade a property to a child', function () {

                            snap.set('foo', 1);
                            snap.hasPendingChanges().should.eql(true);
                            snapChild.hasPendingChanges().should.eql(true);

                            space.update();

                            snap.get('foo').should.eql(1);
                            snapChild.get('foo').should.eql(1);

                        })

                    })

                    describe('(multi-level)', function () {

                        var space;
                        var snap;
                        var snapChild;
                        var snapGrandchild;

                        before(function () {
                            space = SNAPS.space();
                            snap = space.snap();
                            snapChild = space.snap();
                            snap.link(snapChild);
                            snapGrandchild = space.snap();
                            snapChild.link(snapGrandchild);
                        });

                        it('should cascade a property to a child', function () {

                            snap.set('foo', 1);
                            snap.hasPendingChanges().should.eql(true);
                            snapChild.hasPendingChanges().should.eql(true);
                            snapGrandchild.hasPendingChanges().should.eql(true);

                            space.update();

                            // cascading inheritance sets all decendents' foo to 1

                            snap.get('foo').should.eql(1);
                            snapChild.get('foo').should.eql(1);
                            snapGrandchild.get('foo').should.eql(1);

                            snapChild.set('foo', 2);

                            /**
                             the inheritance tree sets a new value of foo to 2
                             also, any upstream changes to foo should not affect
                             snapChild's foo or snapChild's children's foo.
                             */

                            space.update();

                            snap.get('foo').should.eql(1);
                            snapChild.get('foo').should.eql(2);
                            snapGrandchild.get('foo').should.eql(2);

                            snap.set('foo', 3);

                            /**
                             * now, not only does the update not cascade downwards,
                             * the downstream snaps are also immune to being set to dirty.
                             */

                            snap.hasPendingChanges().should.eql(true);
                            snapChild.hasPendingChanges().should.eql(false);
                            snapGrandchild.hasPendingChanges().should.eql(false);

                            space.update();

                            snap.get('foo').should.eql(3);
                            snapChild.get('foo').should.eql(2);
                            snapGrandchild.get('foo').should.eql(2);

                        })
                    })
                })
            })
        });

        describe('observers', function () {
            describe('change watcher', function () {
                var space;
                var snap;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                });

                it('should handle change', function () {

                    snap.set('x', 1);

                    var o = snap.watch('x', function (changes) {
                        this.set('y', 2 * changes.x.pending);
                    });

                    space.update();

                    snap.get('y').should.eql(2);

                    snap.removeObserver(o);

                    snap.set('x', 3);

                    space.update();

                    snap.get('y').should.eql(2);

                });
            });

        });

        describe('#del', function () {
            var space;
            var snap;

            before(function () {
                space = SNAPS.space();
                snap = space.snap();
            });

            it('should let you set and delete a property', function () {
                snap.hasPendingChanges().should.eql(false);
                snap.set('foo', 1);
                new String(typeof( snap.get('foo'))).should.eql('undefined');
                snap.update();
                snap.get('foo').should.eql(1);
                snap.del('foo').update();
                new String(typeof( snap.get('foo'))).should.eql('undefined');
            });
        });

        describe('blends', function () {

            describe('basic', function () {

                var space;
                var snap;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap.setAndUpdate('y', 0);
                    snap.blend('y', 100, 50);
                });

                it('should set values at times', function () {

                    snap.get('y').should.eql(0);
                    snap.blendCount.should.eql(1);
                    space.setTime(25);
                    space.update();
                    snap.blendCount.should.eql(1);
                    snap.get('y').should.eql(50);
                    space.setTime(50, true).update();
                    snap.get('y').should.eql(100);
                    snap.blendCount.should.eql(0);
                    space.setTime(51, true).update();
                    snap.blendCount.should.eql(0);

                });
            });

            describe('should allow you to "change your mind"', function () {

                var space;
                var snap;
                var yValues = [];

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap.setAndUpdate('y', 0);
                    snap.blend('y', 200, 100);
                    for (var i = 0; i < 200; i += 10) {
                        yValues.push({time: space.time, y: snap.get('y')});
                        space.time += 10;
                        space.update();

                        switch (space.time) {
                            case 30:
                                snap.blend('y', 0, 100);
                                break;

                            case 60:
                                snap.blend('y', 300, 50);
                                break;
                        }
                    }
                });

                it('should set values at times', function () {
                    yValues.should.eql(require('./blend.json'));
                });
            })

        });

        describe('#impulse', function () {

            describe('filtered node child impulse spread', function () {
                var space;
                var hits;
                var s1, s2, s3, s4, s5, s6, s7;
                var expectedIds = [];

                before(function () {

                    space = SNAPS.space();
                    hits = [];

                    function _hit() {
                        hits.push(this.id);
                       // console.log(' >>>>>>>>>> PUSHING SNAP ID %s', this.id);
                    }

                    s1 = space.snap();
                    s2 = space.snap();
                    s3 = space.snap();
                    s1.link(s2);
                    s1.link(s3);

                    s4 = space.snap();
                    s5 = space.snap();
                    s6 = space.snap();
                    s3.link(s4);
                    s3.link(s5);
                    s3.link(s6);

                    // every snap listens for impulse
                    [s1, s2, s3, s4, s5, s6].forEach(function (s) {
                        s.listen('foo', _hit, s);
                    });


                    [s2, s4, s6].forEach(function (s) {
                        s.set('bar', 1);
                    });

                    [s1, s3, s5].forEach(function (s) {
                        s.set('bar', 2);
                       if (s.id > 0) expectedIds.push(s.id);
                        return;
                        console.log('snap: %s, profile: %s', s.id,
                            util.inspect( s.terminal.profile()));
                    });


                    space.update();

                });

                it('should have ids in hits', function () {
                    s1.impulse('foo', 'node', {snapFilter: function (s) {
                        var bar = s.get('bar');
                       // console.log('bar of %s == %s', s.id, bar);
                        return bar == 2;
                    }
                    });
                    hits.should.eql(expectedIds);
                })

            })

            describe('basic node child impulse spread', function () {
                var space;
                var hits;
                var s1, s2, s3, s4, s5, s6, s7;

                before(function () {

                    space = SNAPS.space();
                    hits = [];

                    function _hit() {
                        hits.push(this.id);
                    }

                    s1 = space.snap();

                    s2 = space.snap();
                    s3 = space.snap();
                    s1.link(s2);
                    s1.link(s3);

                    s4 = space.snap();
                    s5 = space.snap();
                    s6 = space.snap();
                    s3.link(s4);
                    s3.link(s5);
                    s3.link(s6);

                    s2.listen('foo', _hit, s2);
                    s5.listen('foo', _hit, s5);

                    s1.impulse('foo', 'node');

                });

                it('should have ids in hits', function () {
                    hits.should.eql([s2.id, s5.id]);
                })

            })

        });

        describe('updating', function(){
            var space;
            var snap;

            before(function(){
                space = SNAPS.space();
                snap = space.snap();
            });

            it('should only have pendingUpdates once', function(){

                snap.hasPendingChanges().should.eql(false);
                snap.update();
                snap.hasPendingChanges().should.eql(false);
                snap.set('foo', 1);
                snap.hasPendingChanges().should.eql(true);
                snap.update();
                snap.hasPendingChanges().should.eql(false);

            });


        });
    });

});
