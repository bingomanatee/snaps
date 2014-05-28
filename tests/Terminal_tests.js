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

        describe('interrupting handlers mid-dispatch', function () {

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

                handler2 = function (n) {
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

    describe('Terminal', function () {

        describe('#constructor', function () {

            describe('single listener', function () {

                var terminal;
                var count;

                before(function () {
                    terminal = new SNAPS.Terminal({foo: function (n) {
                        count += n;
                    }
                    });
                    count = 0;
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('bar', 1).should.eql('no signal'); // should not mind dispatches for nonexistent dispatchers
                    count.should.eql(4);
                })

            });

            describe('parametric listener', function () {

                var terminal;
                var counter;

                before(function () {
                    counter = {count: 0};
                    terminal = new SNAPS.Terminal({
                        foo: [[function (n) {
                            this.count += n;
                        }, counter]]
                    });
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('bar', 1).should.eql('no signal'); // should not mind dispatches for nonexistent dispatchers
                    counter.count.should.eql(4);
                });

            });

            describe('mixed parametric, functional listener', function () {

                var terminal;
                var counter;

                before(function () {
                    counter = {count: 0};
                    terminal = new SNAPS.Terminal({
                        foo: [[function (n) {
                            this.count += n;
                        }, counter], function(n){
                            counter.count += n;
                        }]
                    });
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('bar', 1).should.eql('no signal'); // should not mind dispatches for nonexistent dispatchers
                    counter.count.should.eql(8); // two listeners adding input to foo.
                });

            });

            describe('multiple listener', function () {

                var terminal;
                var count;
                var debits;

                before(function () {
                    terminal = new SNAPS.Terminal({foo: [
                        function (n) {
                            count += n;
                        },
                        function (n) {
                            if (n < 0) {
                                ++debits;
                            }
                        }
                    ]
                    });
                    count = 0;
                    debits = 0;
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('foo', -1);
                    terminal.dispatch('bar', 2).should.eql('no signal');
                    count.should.eql(3);
                    debits.should.eql(1);
                })

            });

            describe('locked listeners', function () {

                var terminal;
                var count;

                before(function () {
                    terminal = new SNAPS.Terminal({foo: [
                        function (n) {
                            count += n;
                        }
                    ]
                    }, ['foo']);
                    count = 0;
                });

                it('should not allow addition against locked category', function () {
                    try {
                        terminal.listen('bar', _.identity);
                        terminal.listen('foo', _.identity);
                        ''.should.eql(1); // should not reach this.
                    } catch (err) {
                        err.message.should.eql('attempt to add listener to Terminal with locked listener foo');
                    }
                })

            });

        });

        describe ('#addOnce', function(){


            describe('simple addOnce', function () {
                var terminal;
                var count;

                before(function () {
                    terminal = new SNAPS.Terminal();
                    terminal.listenOnce('foo', function (n) {
                        count += n;

                    });
                    count = 0;
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('foo', 4).should.eql('no bindings');
                    terminal.dispatch('bar', 1).should.eql('no signal'); // should not mind dispatches for nonexistent dispatchers
                    count.should.eql(4);
                })

            });


        });

        describe('#add', function () {

            describe('simple add', function () {
                var terminal;
                var count;

                before(function () {
                    terminal = new SNAPS.Terminal();
                    terminal.listen('foo', function (n) {
                        count += n;

                    });
                    count = 0;
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('bar', 1).should.eql('no signal'); // should not mind dispatches for nonexistent dispatchers
                    count.should.eql(4);
                })

            });

            describe('deep add', function () {
                var terminal;
                var counter = {count: 0};

                before(function () {
                    terminal = new SNAPS.Terminal();
                    terminal.listen('foo', function (n) {
                        this.count += n;

                    }, counter);
                    count = 0;
                });

                it('should update count when called', function () {
                    terminal.dispatch('foo', 4);
                    terminal.dispatch('bar', 1).should.eql('no signal'); // should not mind dispatches for nonexistent dispatchers
                    counter.count.should.eql(4); // should accept context argument
                })

            });

        })
    });

});

