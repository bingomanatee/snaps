var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var util = require('util');

describe('SNAPS', function () {

    describe('Space', function () {

        describe('#count', function () {
            var space;
            before(function () {
                space = SNAPS.space();
            });

            it('should start with zero snaps', function () {
                SNAPS.space().count().should.eql(0);
            });

            it('should add to count by creating a snap', function () {
                var snap = space.snap();
                space.count().should.eql(1);

                space.snap(0).should.equal(snap);

                var snap2 = space.snap();

                space.count().should.eql(2);
                snap2.id.should.eql(1);
            })

        })
    });

    describe('#snap', function () {
        var space;

        beforeEach(function(){
             space = SNAPS.space();
        });

        it('should return snap if no parameters passed', function(){
            var snap = space.snap();
            snap.$TYPE.should.eql('SNAP');
            snap.simple.should.eql(false);
        });

        it('should return empty if missing snap requested', function () {
            space.snap(0).invalid.should.eql(true);
        });

        it('should return snap if valid snap ID requested', function () {
            var snap = space.snap();
            space.snap(snap.id);
            snap.$TYPE.should.eql('SNAP');
            snap.simple.should.eql(false);

        });

        it('should return simple snap if true passed', function () {
            var snap = space.snap(true);
            snap.$TYPE.should.eql('SNAP');
            snap.simple.should.eql(true);

        });

        it('should return snap with preset properties if object passed', function(){
            var snap = space.snap({x: 1});
            snap.$TYPE.should.eql('SNAP');
            snap.simple.should.eql(false);
            snap.get('x').should.eql(1)
        })
    })
});