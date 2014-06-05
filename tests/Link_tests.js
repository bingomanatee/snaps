var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');

describe('SNAPS', function() {

    describe('Link', function() {

        describe('#constructor', function() {

            describe('semantic', function() {
                var space = SNAPS.space();
                var snap = space.snap();
                var snap2 = space.snap();

                it('should be able to make a node link ', function() {

                    var link = new SNAPS.Link(space, [snap, snap2], 'semantic');

                    link.linkType.should.eql('semantic');
                    link.active.should.eql(true);
                    link.isValid(true).should.eql(true);

                    snap.getLinks('semantic')[0].should.eql(link);
                    snap2.getLinks('semantic')[0].should.eql(link);

                    var snap3 = link.get(1);
                    snap3.simple.should.eql(true);

                    link.destroy();

                    snap.getLinks('semantic').should.eql([]);
                    snap2.getLinks('semantic').should.eql([]);
                });

            });

            describe('semantic -- implicit destroy', function() {
                var space = SNAPS.space();
                var snap = space.snap();
                var snap2 = space.snap();

                it('should be able to make a semantic link ', function() {

                    var link = new SNAPS.Link(space, [snap, snap2], 'semantic');

                    link.linkType.should.eql('semantic');
                    link.active.should.eql(true);
                    link.isValid(true).should.eql(true);

                    snap.getLinks('semantic')[0].should.eql(link);
                    snap2.getLinks('semantic')[0].should.eql(link);

                    var snap3 = link.get(1);
                    snap3.simple.should.eql(true);

                    snap.destroy();
                    link.isValid(true).should.eql('inactive');

                    snap2.getLinks('semantic').map(function(link) {
                        return link.identity();
                    }).should.eql([]);
                });

            });

            describe('nodes', function() {
                var space = SNAPS.space();
                var snap = space.snap();
                var snap2 = space.snap();

                it('should be able to make a node link ', function() {

                    var link = new SNAPS.Link(space, [snap, snap2], 'node');

                    link.linkType.should.eql('node');
                    link.active.should.eql(true);
                    link.isValid().should.eql(true);

                    snap.getLinks('node')[0].should.eql(link);
                    snap2.getLinks('node')[0].should.eql(link);

                    link.destroy();

                    snap.getLinks('node').should.eql([]);
                    snap2.getLinks('node').should.eql([]);
                })

            });

            describe('nodes -- implicit destroy', function() {
                var space = SNAPS.space();
                var snap = space.snap();
                var snap2 = space.snap();

                it('should be able to make a node link ', function() {

                    var link = new SNAPS.Link(space, [snap, snap2], 'node');

                    link.linkType.should.eql('node');
                    link.active.should.eql(true);
                    link.isValid().should.eql(true);

                    snap.destroy();
                    link.isValid(true).should.eql('inactive');

                    snap2.getLinks('node').should.eql([]);
                })

            });

            describe('sets', function() {
                var space;
                var snap;
                var snap2;

                before(function() {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap2 = space.snap();
                });

                it('should be able to make a set link ', function() {

                    var link = new SNAPS.Link(space, [snap, snap2], 'set');

                    link.linkType.should.eql('set');
                    link.active.should.eql(true);
                    link.isValid().should.eql(true);

                    snap.getLinks('set')[0].should.eql(link);
                    snap2.getLinks('set')[0].should.eql(link);

                    link.destroy();

                    snap.getLinks('set').should.eql([]);
                    snap2.getLinks('set').should.eql([]);
                })

            });

            describe('sets -- implicit destroy', function() {
                var space;
                var snap;
                var snap2;
                var snap3;
                var snap4;

                before(function() {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap2 = space.snap();
                    snap3 = space.snap();
                    snap4 = space.snap();
                });

                it('should be able to make a set link which should not implode when empty', function() {

                    var setLink = new SNAPS.Link(space, [snap, snap2], 'set');
                    var resLink = snap.link('resource', snap3);
                    var nodeLink = snap.link(snap4);

                    setLink.linkType.should.eql('set');
                    resLink.linkType.should.eql('resource');
                    nodeLink.linkType.should.eql('node');

                    setLink.active.should.eql(true);
                    setLink.isValid().should.eql(true);

                    snap.destroy();
                    setLink.isValid(true).should.eql(true); // a set is not destroyed when one of its members is removed.
                    setLink.snaps.length.should.eql(1);

                    resLink.isValid(true).should.eql('inactive'); // resource links are destroyed when either of its members is removed
                    nodeLink.isValid(true).should.eql('inactive'); // node links are destroyed when either of its members is removed.

                    _.map(setLink.snaps, function(snap) {
                        return snap.identity();
                    }).should.eql([snap2.identity()]);

                    snap2.getLinks('set').map(function(link) {
                        return link.identity();
                    }).should.eql([setLink.identity()]);

                    snap2.destroy();
                    setLink.isValid(true).should.eql(true); // a set can be emptied of all members;
                    setLink.snaps.length.should.eql(0);
                    setLink.active.should.eql(true);
                })

            });

            describe('resource', function() {

                var space;
                var snap;
                var snap2;

                before(function() {
                    space = SNAPS.space();
                    snap = space.snap();
                    snap2 = space.snap();
                    snap.link('resource', snap2).meta = 'foo';
                });

                it('should be able to get parent of resource', function(){
                    snap2.resParent().should.eql(snap);
                })
            })
        });

        describe('nodes', function() {

            describe('parent children', function() {

                describe('first level children', function() {

                    var space;
                    var snap;
                    var snap2;
                    var snap3;

                    before(function() {
                        space = SNAPS.space();
                        snap = space.snap();
                        snap2 = space.snap();
                        snap3 = space.snap();
                        snap.link(snap2);
                        snap.link(snap3);
                    });

                    it('should have the expected children', function() {
                        snap.getLinks('node').length.should.eql(2);
                        var children = snap.nodeChildren();
                        children.length.should.eql(2);
                        children[0].id.should.eql(snap2.id);
                        children[1].id.should.eql(snap3.id);

                        snap2.nodeChildren().length.should.eql(0);
                        snap3.nodeChildren().length.should.eql(0);

                        _.sortBy(_.pluck(snap.nodeSpawn(), 'id'), _.identity).should.eql([ 1, 2]);
                    });
                });

                describe('multi level gendered children', function() {

                    var space;
                    var snap;
                    var snap2;
                    var snap3;
                    var s2Snap1;
                    var s2Snap2;
                    var s2Snap3;

                    before(function() {
                        space = SNAPS.space();
                        snap = space.snap();
                        snap2 = space.snap();
                        snap3 = space.snap();
                        s2Snap1 = space.snap();
                        s2Snap2 = space.snap();
                        s2Snap3 = space.snap();

                        snap.set('name', 'root');
                        snap2.set('name', 'snap2');
                        snap3.set('name', 'snap3');
                        s2Snap1.set('name', 's2Snap1');
                        s2Snap2.set('name', 's2Snap2');
                        s2Snap3.set('name', 's2Snap3');
                        space.update();

                        snap.link(snap2).meta = 'M';
                        snap.link(snap3).meta = 'F';

                        snap2.link(s2Snap1).meta = 'M';
                        snap2.link(s2Snap2).meta = 'F';
                        snap2.link(s2Snap3).meta = 'F';

                    });

                    /**
                     * this test validates that the presence of inbound
                     * nodes from snap to snap2 doesn't taint the
                     * result of snap2's children.
                     */
                    it('should have the expected family', function() {

                        snap.nodeFamily().should.eql(
                            {
                                "F": [
                                    {
                                        "id": 2
                                    }
                                ],
                                "M": [
                                    {
                                        "F": [
                                            {
                                                "id": 4
                                            },
                                            {
                                                "id": 5
                                            }
                                        ],
                                        "M": [
                                            {
                                                "id": 3
                                            }
                                        ],
                                        "id": 1
                                    }
                                ],
                                "id": 0
                            }
                        );
                    });
                });
                describe('multi level children', function() {

                    var space;
                    var snap;
                    var snap2;
                    var snap3;
                    var s2Snap1;
                    var s2Snap2;
                    var s2Snap3;

                    before(function() {
                        space = SNAPS.space();
                        snap = space.snap();
                        snap2 = space.snap();
                        snap3 = space.snap();
                        s2Snap1 = space.snap();
                        s2Snap2 = space.snap();
                        s2Snap3 = space.snap();

                        snap.set('name', 'root');
                        snap2.set('name', 'snap2');
                        snap3.set('name', 'snap3');
                        s2Snap1.set('name', 's2Snap1');
                        s2Snap2.set('name', 's2Snap2');
                        s2Snap3.set('name', 's2Snap3');
                        space.update();

                        snap.link(snap2);
                        snap.link(snap3);

                        snap2.link(s2Snap1);
                        snap2.link(s2Snap2);
                        snap2.link(s2Snap3);

                    });

                    /**
                     * this test validates that the presence of inbound
                     * nodes from snap to snap2 doesn't taint the
                     * result of snap2's children.
                     */
                    it('should have the expected children', function() {
                        snap.getLinks('node').length.should.eql(2);
                        var children = snap.nodeChildren();
                        children.length.should.eql(2);
                        children[0].id.should.eql(snap2.id);
                        children[1].id.should.eql(snap3.id);

                        var grandChildren = snap2.nodeChildren();
                        grandChildren.length.should.eql(3);
                        grandChildren[0].id.should.eql(s2Snap1.id);
                        grandChildren[1].id.should.eql(s2Snap2.id);
                        grandChildren[2].id.should.eql(s2Snap3.id);

                        _.sortBy(_.pluck(snap.nodeSpawn(), 'id'), _.identity).should.eql([ 1, 2, 3, 4, 5 ]);
                        _.sortBy(_.pluck(snap2.nodeSpawn(), 'id'), _.identity).should.eql([  3, 4, 5 ]);

                        snap.nodeFamily().should.eql({ id: 0,
                            nodeChild: [
                                { id: 1, nodeChild: [
                                    { id: 3 },
                                    { id: 4 },
                                    { id: 5 }
                                ] },
                                { id: 2 }
                            ] });
                    });
                });
            })
        })
    });
});
