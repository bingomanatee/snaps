var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');

describe('SNAPS', function () {
    describe('signals', function () {
        var signalObj;
        var count = 0;
        var handler;

        before(function () {

            signalObj = {
                updated: new SNAPS.signals.Signal()
            };

            handler = function (n) {
                count += n || 1;
            }
        });

        it('should handle events', function () {

            count.should.eql(0);

            signalObj.updated.dispatch();

            count.should.eql(0);

            signalObj.updated.add(handler);

            signalObj.updated.dispatch();

            count.should.eql(1);

            signalObj.updated.dispatch(2);

            count.should.eql(3);

        });
    })
});

