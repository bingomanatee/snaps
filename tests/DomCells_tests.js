var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var dom = require('jsdom');
var util = require('util');

function a(t) {
    return t.replace(/<div/g, "\t<div").split("\t");
}

describe('SNAPS', function () {
    describe.skip('DomCells', function () {
        describe('basic pixel cells -- vertical', function () {
            var space, bdCells;

            before(function (done) {
                dom.env(
                        '<html>' +
                        '<body>' +
                        '</body>' +
                        '</html>',
                    [],
                    function (errors, window) {

                        space = SNAPS.space();
                        space.setWindow(window);

                        bdCells = space.bdCells(window.document.body, 'vertical', [500, 300]); // a column 500 pixels across and 300 pixels tall

                        bdCells.addCell(50).innerHTML('first cell');
                        bdCells.addCell(100).innerHTML('second cell');
                        bdCells.addCell(200).innerHTML('third cell');
                        console.log('------ update ------');
                        space.update();
                        done();
                    }
                );
                //Space.prototype.bdCells = function(parent, orientation, size) {
            });

            it('should have the cell and container', function () {
                space.document.innerHTML.should.eql(
                        '<html><body>' +
                        '<div style="width: 500px; height: 300px;">' +
                        '<div style="height: 50px; width: 500px; top: 0px;"></div>' +
                        '<div style="height: 100px; width: 500px; top: 50px;"></div>' +
                        '<div style="height: 200px; width: 500px; top: 150px;"></div></div></body></html>'
                );
            });
        });

        describe('basic percent cells -- vertical', function () {
            var space, bdCells;

            before(function (done) {
                dom.env(
                        '<html>' +
                        '<body>' +
                        '</body>' +
                        '</html>',
                    [],
                    function (errors, window) {

                        space = SNAPS.space();
                        space.setWindow(window);

                        bdCells = space.bdCells(window.document.body, 'vertical', [500, 300]); // a column 500 pixels across and 300 pixels tall

                        bdCells.addCell(50, '%').innerHTML('first cell');
                        bdCells.addCell(35, '%').innerHTML('second cell');
                        bdCells.addCell(15, '%').innerHTML('third cell');

                        space.update();
                        done();
                    }
                );
                //Space.prototype.bdCells = function(parent, orientation, size) {
            });

            it('should have the cell and container', function () {
                a(space.document.innerHTML).should.eql([
                    "<html><body>",
                    "<div style=\"width: 500px; height: 300px;\">",
                    "<div style=\"height: 150px; width: 500px; top: 0px;\"></div>",
                    "<div style=\"height: 105px; width: 500px; top: 150px;\"></div>",
                    '<div style="height: 45px; width: 500px; top: 255px;"></div></div></body></html>'
                ]);
            });
        });

        describe('basic pixel cells -- horizontal', function () {
            var space, bdCells;

            before(function (done) {
                dom.env(
                        '<html>' +
                        '<body>' +
                        '</body>' +
                        '</html>',
                    [],
                    function (errors, window) {

                        space = SNAPS.space();
                        space.setWindow(window);

                        bdCells = space.bdCells(window.document.body, 'horizontal', [500, 300]); // a column 500 pixels across and 300 pixels tall

                        bdCells.addCell(50).innerHTML('first cell');
                        bdCells.addCell(100).innerHTML('second cell');
                        bdCells.addCell(150).innerHTML('third cell');

                        space.update();
                        done();
                    }
                );
                //Space.prototype.bdCells = function(parent, orientation, size) {
            });

            it('should have the cell and container', function () {
                a(space.document.innerHTML).should.eql(
                    [ '<html><body>',
                        '<div style="width: 500px; height: 300px;">',
                        '<div style="width: 50px; height: 300px; left: 0px;"></div>',
                        '<div style="width: 100px; height: 300px; left: 50px;"></div>',
                        '<div style="width: 150px; height: 300px; left: 150px;"></div></div></body></html>' ]
                );
            });
        });

        describe('basic percent cells -- horizontal', function () {
            var space, bdCells;

            before(function (done) {
                dom.env(
                        '<html>' +
                        '<body>' +
                        '</body>' +
                        '</html>',
                    [],
                    function (errors, window) {

                        space = SNAPS.space();
                        space.setWindow(window);

                        bdCells = space.bdCells(window.document.body, 'horizontal', [500, 300]); // a column 500 pixels across and 300 pixels tall

                        bdCells.addCell(50, '%').innerHTML('first cell');
                        bdCells.addCell(35, '%').innerHTML('second cell');
                        bdCells.addCell(15, '%').innerHTML('third cell');

                        console.log('------- updating -------');

                        space.update();
                        done();
                    }
                );
                //Space.prototype.bdCells = function(parent, orientation, size) {
            });

            it('should have the cell and container', function () {
                a(space.document.innerHTML).should.eql(
                    [ '<html><body>',
                        '<div style="width: 500px; height: 300px;">',
                        '<div style="width: 250px; height: 300px; left: 0px;"></div>',
                        '<div style="width: 175px; height: 300px; left: 250px;"></div>',
                        '<div style="width: 75px; height: 300px; left: 425px;"></div></div></body></html>' ]
                );
            });
        });

        describe('updated cells -- vertical', function () {
            var space, bdCells;

            before(function (done) {
                dom.env(
                        '<html>' +
                        '<body>' +
                        '</body>' +
                        '</html>',
                    [],
                    function (errors, window) {

                        space = SNAPS.space();
                        space.setWindow(window);

                        bdCells = space.bdCells(window.document.body, 'vertical', [500, 300]); // a column 500 pixels across and 300 pixels tall

                        bdCells.addCell(50, '%').innerHTML('first cell');
                        var c1 = bdCells.addCell(35, '%').innerHTML('second cell');
                        var c2 = bdCells.addCell(15, '%').innerHTML('third cell');

                        space.update();
                        c1.size('height', 25, '%');
                        c2.size('height', 25, '%');
                        space.update();
                        done();
                    }
                );
                //Space.prototype.bdCells = function(parent, orientation, size) {
            });

            it('should have the cell and container', function () {
                space.document.innerHTML.should.eql(
                        '<html><body>' +
                        '<div style="width: 500px; height: 300px;">' +
                        '<div style="height: 150px; width: 500px; top: 0px;"></div>' +
                        '<div style="height: 75px; width: 500px; top: 150px;"></div>' +
                        '<div style="height: 75px; width: 500px; top: 255px;"></div></div></body></html>'
                );
            });
        });
    });
});
