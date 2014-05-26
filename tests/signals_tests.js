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

        describe('interrupting handlers mid-dispatch', function(){

            var signalObj;
            var count = 0;
            var count2 = 0;
            var handler;
            var handler2;

            before(function () {

                signalObj = {
                    updated: new SNAPS.signals.Signal()
                };

                handler = function (n) {
                    count += n || 1;
                    bh2.active = count > 2;
                };

                var bh = signalObj.updated.add(handler);

                handler2 = function(n){
                    count2 += n || 1;
                };

                var bh2 = signalObj.updated.add(handler2);

            });

            it('should allow handlers to pre-empt each other mid-dispatch;', function () {
                signalObj.updated.dispatch(1);
                count.should.eql(1);
                count2.should.eql(0);
                signalObj.updated.dispatch(1);
                count.should.eql(2);
                count2.should.eql(0);
                signalObj.updated.dispatch(1);
                count.should.eql(3);
                count2.should.eql(1);
            });

        })
    });


});

