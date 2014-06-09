var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var dom = require('jsdom');
var util = require('util');

describe('SNAPS', function() {

    describe('Snap', function() {

        describe('Size', function() {
            // analyzing size properties in isolation without reference to a domElement

            describe('false', function() {
                var space;
                var size;
                before(function() {
                    space = SNAPS.space();
                    size = space.size('width', false);
                    space.update();
                });

                it('should return null for size()', function() {
                    (size.size() === null).should.eql(true);
                });
                it('should return null for size(true)', function() {
                    ( size.size(true) === null).should.eql(true);
                });
            });

            describe('100', function() {
                var space;
                var size;
                before(function() {
                    space = SNAPS.space();
                    size = space.size('width', '100px');
                    space.update();
                });

                it('should return null for size()', function() {
                    (size.size()).should.eql('100px');
                });
                it('should return null for size(true)', function() {
                    (size.size(true)).should.eql(100);
                });
            });

            describe('100%', function() {
                var space;
                var size;
                before(function() {
                    space = SNAPS.space();
                    size = space.size('width', '100%');
                    space.update();
                });

                it('should return null for size()', function() {
                    (size.size()).should.eql('100%');
                });
                it('should return null for size(true)', function() {
                    (size.size(true)).should.eql(100);
                });
            });

            describe('100px', function() {
                var space;
                var size;
                before(function() {
                    space = SNAPS.space();
                    size = space.size('width', '100px');
                    space.update();
                });

                it('should return null for size()', function() {
                    (size.size()).should.eql('100px');
                });
                it('should return null for size(true)', function() {
                    (size.size(true)).should.eql(100);
                });
            });

        })
    });

    describe('assigned property - percent', function() {
        describe('basic box', function() {
            var domSnap;
            var window, document, space;
            before(function(done) {
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;
                        document.innerWidth = 1024;

                        space = SNAPS.space();
                        space.document = document;
                        space.window = w;

                        domSnap = space.bd().addElement();
                        done();
                    }
                );
            });

            describe('initial content%', function() {
                it('should have html', function() {
                    document.innerHTML.should.eql('<html><body><div></div></body></html>');
                });
            });

            describe('width = 50%', function() {
                it('should assign 50% width to domSnap', function() {
                    domSnap.size('width', 50, '%');
                    space.update();
                    document.innerHTML.should.eql('<html><body><div style="width: 512px;"></div></body></html>');
                });

                it('should react to document size change', function(){
                    space.window.innerWidth = 600;
                    space.domBroadcast('resize');
                    space.update();
                    document.innerHTML.should.eql('<html><body><div style="width: 512px;"></div></body></html>');
                })
            })
        });
    });
    describe('assigned property - percent string', function() {
        describe('basic box', function() {
            var domSnap;
            var window, document, space;
            before(function(done) {
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, window) {

                        window.innerWidth = 1024;
                        window.innerHeight = 768;
                        space = SNAPS.space();
                        space.setWindow(window);

                        domSnap = space.bd().addElement();
                        done();
                    }
                );
            });

            describe('initial content%', function() {
                it('should have html', function() {
                    document.innerHTML.should.eql('<html><body><div></div></body></html>');
                });
            });

            describe.only('width = 512ps', function() {
                it('should translate the requested 50% width to to a pixel size', function() {
                    domSnap.size('width', '50%');
                    space.update();
                    space.document.innerHTML.should.eql('<html><body><div style="width: 512px;"></div></body></html>');
                    space.window.innerWidth = 800;
                    var ev = space.document.createEvent("HTMLEvents", 'resize');
                    // manually triggering a resize
                    domSnap.terminal.dispatch('resize', {
                        width: space.window.innerWidth,
                        height: space.window.innerHeight
                    });
                    space.update();
                    space.document.innerHTML.should.eql('<html><body><div style="width: 400px;"></div></body></html>');
                });
            })
        });
    });

    describe('assigned property - pixels', function() {
        describe('basic box', function() {
            var domSnap;
            var window, document, space;
            before(function(done) {
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;

                        space = SNAPS.space();
                        space.document = document;

                        domSnap = space.bd().addElement();
                        done();
                    }
                );
            });

            describe('initial content%', function() {
                it('should have html', function() {
                    document.innerHTML.should.eql('<html><body><div></div></body></html>');
                });
            });

            describe('width = 50px', function() {
                it('should assign 50px width to domSnap', function() {
                    domSnap.size('width', 50, 'px');
                    space.update();
                    document.innerHTML.should.eql('<html><body><div style="width: 50px;"></div></body></html>');
                });
            })
        });
    });
    describe('assigned property - pixels string', function() {
        describe('basic box', function() {
            var domSnap;
            var window, document, space;
            before(function(done) {
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;

                        space = SNAPS.space();
                        space.document = document;

                        domSnap = space.bd().addElement();
                        done();
                    }
                );
            });

            describe('initial content px', function() {
                it('should have html', function() {
                    document.innerHTML.should.eql('<html><body><div></div></body></html>');
                });
            });

            describe('width = 50px', function() {
                it('should assign 50px width to domSnap', function() {
                    domSnap.size('width', '50px');
                    space.update();
                    document.innerHTML.should.eql('<html><body><div style="width: 50px;"></div></body></html>');
                });
            })
        });
    });

    describe('inheritance', function(){

        describe('pixels parent, percent child', function() {
            describe('basic box', function() {
                var domSnap, domChildSnap;
                var window, document, space;
                before(function(done) {
                    dom.env(
                        '<html><body></body></html>',
                        [],
                        function(errors, w) {
                            window = w;
                            document = window.document;

                            space = SNAPS.space();
                            space.document = document;

                            domSnap = space.bd().addElement();

                            domChildSnap = space.bd(null, domSnap);
                            done();
                        }
                    );
                });

                describe('initial content%', function() {
                    it('should have html', function() {
                        document.innerHTML.should.eql('<html><body><div><div></div></div></body></html>');
                    });
                });

                describe('width = 50%', function() {
                    it('should assign 50px width to domSnap', function() {
                        domSnap.size('width', 200, 'px');
                        domChildSnap.size('width', 50, '%');
                        space.update();
                        document.innerHTML.should.eql('<html><body><div style="width: 200px;"><div style="width: 50%;"></div></div></body></html>');
                    });
                })
            });
        });


    })
});
