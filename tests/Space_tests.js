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

        it('should return empty if missing snap requested', function () {

            var space = SNAPS.space();
            new String(typeof(space.snap(0))).should.eql('undefined');

        });

        it('should throw error if second parameter of snap is set', function(){

            var space = SNAPS.space();

            try{
                space.snap(0, true);
                ''.should.eql('should not get this far');
            } catch(err){
                err.should.eql('cannot find snap 0');
            }

        })

    })
});