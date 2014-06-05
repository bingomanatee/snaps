var should = require('should');
var SNAPS = require('./../snaps');
var _ = require('lodash');
var dom = require('jsdom');
var util = require('util');

describe.skip('SNAPS', function() {
    describe('BoxCells', function() {
        describe('basic percent cells', function() {
            var space, bdCells;

            before(function(done){
                dom.env(
                    '<html><body></body></html>',
                    [],
                    function(errors, w) {
                        window = w;
                        document = window.document;

                        space = SNAPS.space();
                        space.document = document;

                        bdCells = space.bdCells(document.body, 'vertical', 500); // a column 500 pixels tall
                        bdCells.getBox().set('height', [300, 'px']);
                        bdCells.setDebug(true);
                      /*  bdCells.addCell(50, '%');
                        bdCells.addCell(35, '%');
                        bdCells.addCell(15, '%');*/
/*
                        bdCells.cells[0].innerHTML('first cell');
                        bdCells.cells[1].innerHTML('second cell');
                        bdCells.cells[2].innerHTML('third cell');*/
                        space.update();
                        done();
                    }
                );
                //Space.prototype.bdCells = function(parent, orientation, size) {
            })

            it('should have the cell and container', function(){

                document.innerHTML.should.eql(
                    '<html><body>' +
                        '<div style="width: 500px; height: 300px;">' +
                        '<div style="width: 250px; height: 100%;">first cell</div>' +
                        '<div style="width: 175px; height: 100%;">second cell</div>' +
                        '<div style="width: 75px; height: 100%;">third cell</div></div>' +
                        '</body></html>'
                );
            });
        });
    });
});
