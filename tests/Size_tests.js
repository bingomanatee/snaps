var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var dom = require('jsdom');
var util = require('util');

describe('SNAPS', function() {

    describe('Snap', function() {

        describe('Size', function() {

            describe('false', function() {
                var space;
                var size;
                before(function() {
                    space = SNAPS.space();
                    size = space.size(false);
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
                    size = space.size('100px');
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
                    size = space.size('100%');
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
                    size = space.size('100px');
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

    describe('assigned property', function() {
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

            describe('inital content%', function() {
                it('should have html', function() {
                    document.innerHTML.should.eql('<html><body><div></div></body></html>');
                });
            });

            describe('width = 50%', function() {
                it('should assign 50% width to domSnap', function() {
                    domSnap.size('width', 50, '%');
                    space.update();
                    document.innerHTML.should.eql('<html><body><div style="width: 50%;"></div></body></html>');
                });
            })
        });
    });
});
