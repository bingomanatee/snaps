var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var dom = require('jsdom');
var util = require('util');

describe('SNAPS', function() {
    describe('Box', function() {
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
                        div = document.createElement('div');
                        document.body.appendChild(div);

                        space = SNAPS.space();
                        space.document = document;

                        domSnap = space.bd(document.createElement('div'), document.body);
                        domSnap.setDebug(true);
                        domSnap.addBox({width: 500, height: 300});
                        space.update();
                        done();
                    }
                );
            });

            it('should set the width to 500, 300', function() {
                domSnap.styleSnap.get('width').should.eql(500);
                document.innerHTML.should.eql('<html><body><div></div><div style="width: 500px; height: 300px;"></div></body></html>')
            })
        });

        describe('basic box with children', function() {
            var domSnap;
            var window, document, space;
            before(function(done) {
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        document.body.appendChild(div);

                        space = SNAPS.space();
                        space.document = document;

                        domSnap = space.bd(document.createElement('div'), document.body);
                        var childSnap = space.bd(document.createElement('div'), domSnap).innerHTML('i do not have my width defined');
                        domSnap.setDebug(true);
                        domSnap.addBox({width: 500, height: 300});
                        space.update();
                        done();
                    }
                );
            });

            it('should set the width to 500, 300', function() {
                domSnap.styleSnap.get('width').should.eql(500);
                document.innerHTML.should.eql('<html><body><div></div><div style="width: 500px; height: 300px;"><div>i do not have my width defined</div></div></body></html>')
            })
        });

        describe('basic box with child box', function() {
            var domSnap;
            var window, document, space;
            before(function(done) {
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        document.body.appendChild(div);

                        space = SNAPS.space();
                        space.document = document;

                        domSnap = space.bd(document.createElement('div'), document.body);
                        var childSnap = space.bd(document.createElement('div'), domSnap).innerHTML('i have my own box');
                        domSnap.link(childSnap);
                        domSnap.setDebug(true);
                        domSnap.addBox({width: 500, height: 300});
                        childSnap.addBox({widthPercent: 50, heightPercent: 75});
                        space.update();

                      //  console.log('family: %s', JSON.stringify(domSnap.nodeFamily(), true , 3));

                        done();
                    }
                );
            });

            it('should set the child widths to 250px, 225px', function() {
                domSnap.styleSnap.get('width').should.eql(500);
                document.innerHTML.should.eql(
                    '<html><body><div></div><div style="width: 500px; height: 300px;"><div style="width: 250px; height: 225px;">i have my own box</div></div></body></html>'
                )
            })
        });
    });
});
