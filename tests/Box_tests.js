var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var dom = require('jsdom');
var util = require('util');

describe('SNAPS', function() {
    describe('Box', function() {
        describe('basic container', function() {
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
    });
});
