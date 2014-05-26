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
                snap.hasUpdates().should.eql(false);
                snap.set('foo', 1);
                new String(typeof( snap.get('foo'))).should.eql('undefined');
                snap.hasUpdates().should.eql(true);

                snap.update();

                snap.get('foo').should.eql(1);
                snap.hasUpdates().should.eql(false);
            })

            it('should let you set a property with instant update', function () {
                snap.hasUpdates().should.eql(false);
                snap.setAndUpdate('foo', 1);
                snap.get('foo').should.eql(1);
                snap.hasUpdates().should.eql(false);
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
                            snap.addChild(snapChild);
                        });

                        it('should cascade a property to a child', function () {

                            snap.set('foo', 1);
                            snap.hasUpdates().should.eql(true);
                            snapChild.hasUpdates().should.eql(true);

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
                            snap.addChild(snapChild);
                            snapGrandchild = space.snap();
                            snapChild.addChild(snapGrandchild);
                        });

                        it('should cascade a property to a child', function () {

                            snap.set('foo', 1);
                            snap.hasUpdates().should.eql(true);
                            snapChild.hasUpdates().should.eql(true);
                            snapGrandchild.hasUpdates().should.eql(true);

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

                            snap.hasUpdates().should.eql(true);
                            snapChild.hasUpdates().should.eql(false);
                            snapGrandchild.hasUpdates().should.eql(false);

                            space.update();

                            snap.get('foo').should.eql(3);
                            snapChild.get('foo').should.eql(2);
                            snapGrandchild.get('foo').should.eql(2);

                        })
                    })
                })
            })
        });

        describe('relationships', function () {

            describe('#getRel', function () {
                var space, snap;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();

                    snap.rels = [
                        new SNAPS.Rel({from: snap, space: space, to: 1, relType: 'foo'}),
                        new SNAPS.Rel({from: snap, space: space, to: 2, relType: 'foo'}),
                        new SNAPS.Rel({from: snap, space: space, to: 1, relType: 'bar'}),
                        new SNAPS.Rel({from: snap, space: space, to: 2, relType: 'bar'})
                    ]
                });

                it('should get foos', function () {

                    var foos = _.map(snap.getRels('foo'), function (r) {
                        return r.toJSON();
                    });

                    foos.should.eql([
                        { fromId: 0, toId: 1, relType: 'foo' },
                        { fromId: 0, toId: 2, relType: 'foo' }
                    ]);
                });

                it('should get 1s', function () {

                    var foos = _.map(snap.getRels(1), function (r) {
                        return r.toJSON();
                    });

                    foos.should.eql([
                        { fromId: 0, toId: 1, relType: 'foo' },
                        { fromId: 0, toId: 1, relType: 'bar' }
                    ]);
                });

                it('should get foo 1s', function () {

                    var foos = _.map(snap.getRels(1, 'foo'), function (r) {
                        return r.toJSON();
                    });

                    foos.should.eql([
                        { fromId: 0, toId: 1, relType: 'foo' }
                    ]);

                    // asking with different order of params

                    foos = _.map(snap.getRels('foo', 1), function (r) {
                        return r.toJSON();
                    });

                    foos.should.eql([
                        { fromId: 0, toId: 1, relType: 'foo' }
                    ]);
                })
            });

            describe('parent child relationships', function () {

                describe('1-1 relationship', function () {

                    var space;
                    var snap;

                    before(function () {
                        space = SNAPS.space();
                        snap = space.snap();
                        snap.addChild();
                    });

                    it('should reflect parent child relationships', function () {

                        var family = snap.family();
                        family.should.eql({
                            id: 0,
                            children: [
                                {id: 1, children: []}
                            ]
                        });

                    })
                })

            });

            describe('1-1-1 relationship', function () {

                var space;
                var snap;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap.addChild().addChild();
                });

                it('should reflect parent child relationships', function () {

                    var family = snap.family();
                    family.should.eql({
                        id: 0,
                        children: [
                            {id: 1, children: [
                                {id: 2, children: []}
                            ]}
                        ]
                    });

                })
            });

            describe('1-many relationship', function () {

                var space;
                var snap;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap.addChild();
                    snap.addChild();
                    snap.addChild();
                });

                it('should reflect parent child relationships', function () {

                    var family = snap.family();
                    family.should.eql({
                        id: 0,
                        children: [
                            {id: 1, children: []},
                            {id: 2, children: []},
                            {id: 3, children: []}
                        ]
                    });

                });
            });

            describe('1-many-many relationship', function () {

                var space;
                var snap;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    var c1 = snap.addChild();
                    c1.addChild();
                    c1.addChild();

                    var c2 = snap.addChild();
                    c2.addChild();
                    c2.addChild();
                });

                it('should reflect parent child relationships', function () {

                    var family = snap.family();

                    family.should.eql({ id: 0,
                        children: [
                            { id: 1,
                                children: [
                                    { id: 2, children: [] },
                                    { id: 3, children: [] }
                                ] },
                            { id: 4,
                                children: [
                                    { id: 5, children: [] },
                                    { id: 6, children: [] }
                                ] }
                        ]
                    });

                });
            });

            describe('1-many-many remove middle relationship', function () {

                var space;
                var snap;
                var c1;

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    c1 = snap.addChild();
                    c1.addChild();
                    c1.addChild();

                    var c2 = snap.addChild();
                    c2.addChild();
                    c2.addChild();

                    //  console.log('before remove: %s', util.inspect(snap.family(), {depth: 8}));

                    c1.destroy();

                    //   console.log('after remove for %s: %s', c1.id, util.inspect(snap.family(), {depth: 8}));

                });

                it('should reflect parent child relationships', function () {
                    snap.family().should.eql({ id: 0,
                        children: [
                            { id: 4,
                                children: [
                                    { id: 5, children: [] },
                                    { id: 6, children: [] }
                                ] },
                            { id: 2, children: [] },
                            { id: 3, children: [] }
                        ] });

                });
            });

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
                snap.hasUpdates().should.eql(false);
                snap.set('foo', 1);
                new String(typeof( snap.get('foo'))).should.eql('undefined');
                snap.update();
                snap.get('foo').should.eql(1);
                snap.del('foo').update();
                new String(typeof( snap.get('foo'))).should.eql('undefined');
            });
        });

        describe('blends', function () {

            describe('basic', function(){

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

            describe('should allow you to "change your mind"', function(){

                var space;
                var snap;
                var yValues = [];

                before(function () {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap.setAndUpdate('y', 0);
                    snap.blend('y', 200, 100);
                    for (var i =0; i < 200; i += 10){
                        yValues.push( {time: space.time, y: snap.get('y')});
                        space.time += 10;
                        space.update();

                        switch (space.time){
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
    });

});