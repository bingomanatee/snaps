var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var util = require('util');
var dom = require('jsdom');

describe('SNAPS', function() {

    describe('jsdom validation', function() {
        describe('createElement', function() {

            var document, window, div;

            before(function(done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        document.body.appendChild(div);
                        done();
                    }
                );
            });

            it('should be in document', function() {
                document.outerHTML.should.eql('<html><body><div></div></body></html>');
            });

            it('should render div', function() {
                div.outerHTML.should.eql('<div></div>')
            });

        });
        describe('style', function() {

            var document, window, div;

            before(function(done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        div.style.color = 'rgb(255,0,0)';
                        document.body.appendChild(div);

                        done();
                    }
                );
            });

            it('should render div', function() {
                div.outerHTML.should.eql("<div style=\"color: rgb(255, 0, 0);\"></div>")
            });

        });

        describe('setAttribute', function() {
            var document, window, div;

            before(function(done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        div.setAttribute('name', 'foo');
                        document.body.appendChild(div);

                        done();
                    }
                );
            });

            it('should render div', function() {
                div.outerHTML.should.eql("<div name=\"foo\"></div>")
            });

        });
    });

    describe('BrowserDom', function() {
        describe('#constructor', function() {

            describe('basic insertion', function() {
                var space, bd;
                var document, window, div;

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
                            bd = space.bd(div, document.body);
                            done();
                        }
                    );
                });

                it('should be in document', function() {
                    document.body.outerHTML.should.eql("<body><div></div></body>");
                });

                it('should render div', function() {
                    div.outerHTML.should.eql('<div></div>')
                });
            });

            describe('#destroy', function() {
                var space, bd;
                var document, window, div;

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
                            bd = space.bd(div, document.body);
                            done();
                        }
                    );
                });

                it('should remove itself from DOM when destroyed', function() {
                    document.body.outerHTML.should.eql("<body><div></div></body>");
                    bd.destroy();
                    document.body.outerHTML.should.eql("<body></body>");

                });
            });

            describe('attributes and elements', function() {
                var space, bd;
                var document, window, div;

                before(function(done) {

                    dom.env(
                        '<html><body></body></html>',
                        [],
                        function(errors, w) {
                            window = w;
                            document = window.document;
                            div = document.createElement('div');

                            space = SNAPS.space();
                            bd = space.bd(div, document.body);
                            bd.a('name', 'foo').s('color', 'rgb(255,0,0)');
                            space.update();
                            done();
                        }
                    );
                });

                it('should render div', function() {
                    div.outerHTML.should.eql("<div name=\"foo\" style=\"color: rgb(255, 0, 0);\"></div>")
                });
            });

        });

        describe('#set', function() {
            var space, bd;
            var document, window, div;

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
                        bd = space.bd(div, document.body).a('name', 'foo').s('color', 'rgb(255,0,0)');
                        space.update();
                        done();
                    }
                );
            });

            it('should allow you to set properties', function() {
                div.outerHTML.should.eql('<div name="foo" style="color: rgb(255, 0, 0);"></div>');
                bd.attrSnap.set('name', 'bar');
                div.outerHTML.should.eql('<div name="foo" style="color: rgb(255, 0, 0);"></div>');
                space.update();
                div.outerHTML.should.eql('<div name="bar" style="color: rgb(255, 0, 0);"></div>');
            });

        });

        describe.only('dom children', function() {
            var space, bd, document, window, div, bd2;

            dom.env(
                '<html><body></body></html>',
                [],
                function(errors, w) {
                    window = w;
                    document = window.document;
                    div = document.createElement('div');
                    var div2 = document.createElement('span');
                    document.body.appendChild(div);

                    space = SNAPS.space();
                    bd = space.bd(div, document.body)
                        .a('class', 'foo')
                        .s('color', 'rgb(255,0,0)');
                    bd2 = space.bd(div2, bd)
                        .html('bar');
                    space.update();
                    done();
                });

            it('should embed one bd in another', function() {
                bd.hasDomChildren().should.eql(false);
                bd.link(bd2);
                bd.hasDomChildren().should.eql(true);
                document.innerHTML.should.eql('<html><body><div class="foo" style="color: rgb(255, 0, 0);"><span>bar</span></div></body></html>');

            });
        describe.only('blocking setting of HTML when domChldren are present', function() {
            var space, bd, document, window, div, bd2;

            dom.env(
                '<html><body></body></html>',
                [],
                function(errors, w) {
                    window = w;
                    document = window.document;
                    div = document.createElement('div');
                    var div2 = document.createElement('span');
                    document.body.appendChild(div);

                    space = SNAPS.space();
                    bd = space.bd(div, document.body)
                        .a('class', 'foo')
                        .s('color', 'rgb(255,0,0)');
                    bd2 = space.bd(div2, bd)
                        .html('bar');
                    bd.link(bd2);
                    space.update();
                    done();
                });

            it('should embed one bd in another', function() {
                bd2.innerHTML('a new body'); // we CAN add content to the child node because it itself has no child domNodes.
                space.update();

                document.innerHTML.should.eql('<html><body><div class="foo" style="color: rgb(255, 0, 0);"><span>a new body</span></div></body></html>');

                try {
                    bd.innerHTML('vey');
                    ''.should.eql(1); // should not get here
                } catch(err){
                    err.message.should.eql('innerHTML: cannot add content to a browserDom snap with domChildren');
                }
            });
        });
        });
    });
});
