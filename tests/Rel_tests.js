var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');

describe('SNAPS', function () {

    describe('Rel', function () {

        describe('#constructor', function () {

            describe('validation', function () {

                it('should throw an error if no space', function () {
                    try {
                        var rel = new SNAPS.Rel({});
                    } catch (err) {
                        err.should.eql("object does not have a property space");
                    }
                });

                it('should throw an error if space is not a SPACE', function () {
                    try {
                        var rel = new SNAPS.Rel({space: {$TYPE: 'FOO'}});
                    } catch (err) {
                        err.should.eql("object does not have a $TYPE SPACE");
                    }
                });

                it('should throw an error if from is not present', function () {

                    try {
                        var rel = new SNAPS.Rel({space: {$TYPE: 'SPACE'}});
                    } catch (err) {
                        err.should.eql("object does not have a property from");
                    }

                });

                it('should throw an error if to is not present', function () {

                    try {
                        var rel = new SNAPS.Rel({space: {$TYPE: 'SPACE'}, from: 1});
                    } catch (err) {
                        err.should.eql("object does not have a property to");
                    }

                });

                it('should throw an error if relType is not present', function () {

                    try {
                        var rel = new SNAPS.Rel({space: {$TYPE: 'SPACE'}, from: 1, to: 2});
                    } catch (err) {
                        err.should.eql("object does not have a property relType");
                    }

                });

            });

            describe('a good Rel', function () {

                var rel;

                before(function () {
                    rel = new SNAPS.Rel({space: {$TYPE: 'SPACE'}, from: 1, to: 2, relType: 'parent'});

                });

                it('should have from = 1', function(){
                    rel.fromId.should.eql(1);
                });

                it('should have to = 2', function(){
                    rel.toId.should.eql(2);
                });
            })
        })
    });

});