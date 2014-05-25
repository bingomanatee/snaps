var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var util = require('util');

describe('SNAPS', function () {

    describe('assert', function () {
        describe('#type', function () {

            describe('string', function () {
                it('should return input for string', function () {
                    SNAPS.assert.string('foo').should.eql('foo');
                });

                it('should return err for object', function () {
                    try {
                        SNAPS.assert.string({});
                        ''.should.eql(2); // should never get this far.
                    } catch (err) {
                        err.message.should.eql('Invalid string');
                    }
                });

                it('should return err for number', function () {
                    try {
                        SNAPS.assert.string(1);
                        ''.should.eql(2); // should never get this far.
                    } catch (err) {
                        err.message.should.eql('Invalid string');
                        result = err;
                    }
                });
            });

            describe('number', function () {
                it('should return input for number', function () {
                    SNAPS.assert.number(1).should.eql(1);
                });

                it('should return err for string', function () {
                    var result;
                    try {
                        result = SNAPS.assert.number('1');
                    } catch (err) {
                        err.message.should.eql('Invalid number');
                        result = err;
                    }

                    result.should.not.eql(1);
                });
            });

            describe('array', function () {
                it('should return input for array', function () {
                    SNAPS.assert.array([]).should.eql([]);
                });

                it('should return err for string', function () {
                    try {
                        result = SNAPS.assert.array('');
                        ''.should.eql(2); // should never get this far.
                    } catch (err) {
                        err.message.should.eql('Invalid array');
                        result = err;
                    }
                });
            });

            describe('arrayForce', function () {

                it('should not alter an array', function () {
                    SNAPS.assert.arrayForce(['foo']).should.eql(['foo']);
                });

                it('should put any non array content into an array', function () {

                    SNAPS.assert.arrayForce('bar').should.eql(['bar']);
                })
            })

        });

        describe('int', function () {
            it('should return a valid int', function () {

                SNAPS.assert.int(2).should.eql(2);
            });

            it('should throw an error on a float', function () {
                try {
                    var result = SNAPS.assert.int(1.1);
                    ''.should.eql(2); // thrown if we get here -- which we shouldn't...
                } catch (err) {
                    err.message.should.eql('Invalid integer');
                }
            });

            it('should throw an error on a non number', function () {
                try {
                    var result = SNAPS.assert.int([]);
                    ''.should.eql(2); // thrown if we get here -- which we shouldn't...
                } catch (err) {
                    err.message.should.eql('Invalid integer');
                }
            });
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

        describe('#or', function () {

            it('should return the result if type matches', function () {
                SNAPS.assert.or('array', [1, 2, 3], [4, 5, 6]).should.eql([1, 2, 3]);
                SNAPS.assert.or('object', {a: 1, b: 2}, {a: 3, b: 4}).should.eql({a: 1, b: 2});
            })

        });

        describe('#size', function () {
            describe('<number>', function () {

                it('should allow a number of the proper size', function () {
                    SNAPS.assert.size(4, 'number', 1, 5).should.eql(4);
                });

                it('should not allow a number of the proper size', function () {
                    try {
                        SNAPS.assert.size(10, 'number', 1, 5).should.eql(4);
                        ''.should.eql(1); // should never reach
                    } catch (err) {
                        err.message.should.eql("must be no greater than 1");
                    }
                });
            })

            describe('<array>', function () {

                it('should allow a number of the proper size', function () {
                    SNAPS.assert.size([1, 2], 'array', 1, 5).should.eql([1, 2]);
                });

                it('should not allow a number of the proper size', function () {
                    try {
                        SNAPS.assert.size([1, 2], 'array', 3, 5).should.eql([1, 2]);
                        ''.should.eql(1); // should never reach
                    } catch (err) {
                        err.message.should.eql("must be at least 3");
                    }
                });
            })

        })
    });

    describe('misc', function () {

    })

});