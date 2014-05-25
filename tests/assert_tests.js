var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');

describe('SNAPS', function () {

    describe('assert', function () {
        describe('#type', function () {

            describe('string', function () {
                it('should return input for string', function () {
                    SNAPS.assert.type('foo', 'string').should.eql('foo');
                });

                it('should return err for object', function () {
                    var result;
                    try {
                        result = SNAPS.assert.type({}, 'string');
                    } catch (err) {
                        err.should.eql('must be a string');
                        result = err;
                    }

                    result.should.not.eql('foo');
                });

                it('should return err for number', function () {
                    var result;
                    try {
                        result = SNAPS.assert.type(1, 'string');
                    } catch (err) {
                        err.should.eql('must be a string');
                        result = err;
                    }

                    result.should.not.eql(1);
                });
            });

            describe('number', function () {
                it('should return input for number', function () {
                    SNAPS.assert.type(1, 'number').should.eql(1);
                });

                it('should return err for string', function () {
                    var result;
                    try {
                        result = SNAPS.assert.type('1', 'number');
                    } catch (err) {
                        err.should.eql('must be a number');
                        result = err;
                    }

                    result.should.not.eql(1);
                });
            });

            describe('array', function () {
                it('should return input for array', function () {
                    SNAPS.assert.type([], 'array').should.eql([]);
                });

                it('should return err for string', function () {
                    var result;
                    try {
                        result = SNAPS.assert.type('', 'array');
                    } catch (err) {
                        err.should.eql('must be an array');
                        result = err;
                    }

                    result.should.not.eql(1);
                });
            });

            describe('arrayForce', function(){

                it('should not alter an array', function(){
                    SNAPS.assert.arrayForce(['foo']).should.eql(['foo']);
                });

                it('should put any non array content into an array', function(){

                    SNAPS.assert.arrayForce('bar').should.eql(['bar']);
                })
            })

        });

        describe ('int', function(){
            it('should return a valid int', function(){

                SNAPS.assert.int(2).should.eql(2);
            });

            it('should throw an error on a float', function () {
                try {
                    var result = SNAPS.assert.int(1.1);
                    ''.should.eql(2); // thrown if we get here -- which we shouldn't...
                } catch (err) {
                    err.should.eql('must be an integer');
                }
            })

            it('should throw an error on a non number', function () {
                try {
                    var result = SNAPS.assert.int([]);
                    ''.should.eql(2); // thrown if we get here -- which we shouldn't...
                } catch (err) {
                    err.should.eql('must be a number');
                }
            })
        });

        describe('#prop', function () {

            it('should return a valid property of a valid object', function () {
                SNAPS.assert.prop({foo: 3}, 'foo').should.eql(3);
            });

            it('should throw an error on missing property', function () {
                try {
                    var result = SNAPS.assert.prop({foo: 3}, 'bar');
                    ''.should.eql(2); // thrown if we get here -- which we shouldn't...
                } catch (err) {
                    err.should.eql('object does not have a property bar');
                }
            })
        });

        describe('#TYPE', function () {

            it('should return the object if it has the right type', function () {
                SNAPS.assert.$TYPE({$TYPE: 'FOO', n: 3}, 'FOO').n.should.eql(3);
            });

            it('should error if object is not the right type', function () {
                try {
                    var result = SNAPS.assert.$TYPE({$TYPE: 'FOO', n: 3}, 'BAR');
                    ''.should.eql(2); // thrown if we get here -- which we shouldn't...
                } catch (err) {
                    err.should.eql("object does not have a $TYPE BAR");
                }
            })

        });

        describe ('#or', function(){

           it('should return the result if type matches', function(){
               SNAPS.assert.or('array', [1, 2, 3], [4, 5, 6]).should.eql([1,2,3]);
               SNAPS.assert.or('object', {a: 1, b: 2}, {a: 3, b: 4}).should.eql({a: 1, b: 2});
           })

        });
    });

    describe('misc', function(){

    })

});