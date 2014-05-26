var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var util = require('util');
var dom = require('jsdom');

describe('SNAPS', function () {

    describe('jsdom validation', function () {
        describe('createElement', function () {

            var document, window, div;

            before(function (done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function (errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        document.body.appendChild(div);
                        done();
                    }
                );
            });

            it('should be in document', function () {
                document.outerHTML.should.eql('<html><body><div></div></body></html>');
            });

            it('should render div', function () {
                div.outerHTML.should.eql('<div></div>')
            });

        });
        describe('style', function () {

            var document, window, div;

            before(function (done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function (errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        div.style.color = 'rgb(255,0,0)';
                        document.body.appendChild(div);

                        done();
                    }
                );
            });

            it('should render div', function () {
                div.outerHTML.should.eql("<div style=\"color: rgb(255, 0, 0);\"></div>")
            });

        });

        describe('setAttribute', function () {
            var document, window, div;

            before(function (done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function (errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        div.setAttribute('name', 'foo');
                        document.body.appendChild(div);

                        done();
                    }
                );
            });

            it('should render div', function () {
                div.outerHTML.should.eql("<div name=\"foo\"></div>")
            });

        });
    });

    describe('BrowserDom', function () {
        describe('#constructor', function () {

            describe('basic insertion', function () {
                var space, bd;
                var document, window, div;

                before(function (done) {

                    dom.env(
                        '<html><body></body></html>',
                        [],
                        function (errors, w) {
                            window = w;
                            document = window.document;
                            div = document.createElement('div');
                            document.body.appendChild(div);

                            space = SNAPS.space();
                            bd = space.bd({}, div, document.body);
                            done();
                        }
                    );
                });

                it('should be in document', function () {
                    document.body.outerHTML.should.eql("<body><div></div></body>");
                });

                it('should render div', function () {
                    div.outerHTML.should.eql('<div></div>')
                });
            });

            describe('#destroy', function () {
                var space, bd;
                var document, window, div;

                before(function (done) {

                    dom.env(
                        '<html><body></body></html>',
                        [],
                        function (errors, w) {
                            window = w;
                            document = window.document;
                            div = document.createElement('div');
                            document.body.appendChild(div);

                            space = SNAPS.space();
                            bd = space.bd({}, div, document.body);
                            done();
                        }
                    );
                });

                it('should remove itself from DOM when destroyed', function () {
                    document.body.outerHTML.should.eql("<body><div></div></body>");
                    bd.destroy();
                    document.body.outerHTML.should.eql("<body></body>");

                });
            });

            describe('attributes and elements', function () {
                var space, bd;
                var document, window, div;

                before(function (done) {

                    dom.env(
                        '<html><body></body></html>',
                        [],
                        function (errors, w) {
                            window = w;
                            document = window.document;
                            div = document.createElement('div');
                            document.body.appendChild(div);

                            space = SNAPS.space();
                            bd = space.bd({name: 'foo', color: 'rgb(255,0,0)'}, div, document.body);
                            space.update();
                            done();
                        }
                    );
                });

                it('should render div', function () {
                    div.outerHTML.should.eql("<div name=\"foo\" style=\"color: rgb(255, 0, 0);\"></div>")
                });
            });

        });

        describe('#set', function () {
            var space, bd;
            var document, window, div;

            before(function (done) {

                dom.env(
                    '<html><body></body></html>',
                    [],
                    function (errors, w) {
                        window = w;
                        document = window.document;
                        div = document.createElement('div');
                        document.body.appendChild(div);

                        space = SNAPS.space();
                        bd = space.bd({name: 'foo', color: 'rgb(255,0,0)'}, div, document.body);
                        space.update();
                        done();
                    }
                );
            });

            it('should allow you to set properties', function () {
                div.outerHTML.should.eql('<div name="foo" style="color: rgb(255, 0, 0);"></div>');
                bd.set('name', 'bar');
                div.outerHTML.should.eql('<div name="foo" style="color: rgb(255, 0, 0);"></div>');
                space.update();
                div.outerHTML.should.eql('<div name="bar" style="color: rgb(255, 0, 0);"></div>');
            });

        })
    });
});