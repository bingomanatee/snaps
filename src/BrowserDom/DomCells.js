/**
 * DomCells are collection of elements that have been defined as containers
 * for a row or column of DomCell elements.
 *
 * This allows for layout elements like header/footer/content, table-type grids,
 */

/**
 * This is the outward facing factory of cells.
 *
 * @param parent
 * @param orientation
 * @param size {int | [int]} -- either a value (defined
 * @param unit {string} optional -- by default is 'px'
 * @returns {*}
 */
Space.prototype.bdCells = function (parent, orientation, size, unit) {
    var bdCells = _bdCells(this, this.snaps.length, parent, orientation, size, unit);
    this.snaps.push(bdCells);
    return bdCells;
};

/**
 * This is the factory for a bdCells type DomElement.
 *
 * @param space
 * @param i
 * @param p
 * @param o
 * @param d
 * @returns {DomCells}
 */
function _bdCells(space, i, p, o, d) {
    return new DomCells(space, i, p, o, d);
};

/**
 * DomCells is a series of cells -- a row or column -- contained within a parent element
 * with which they share a dimension (width for columns, height for rows).
 *
 * The DomCells class itself has a box for which the shared dimension is defined.
 * Without further modification, the shared size (i.e., the width for the entire row)
 * is set to 100%.
 *
 * @param space
 * @param id
 * @param parent
 * @param orientation {String} ('vertical' or 'horizontal').
 * @param size {Number | Array} [value, '%'] -- the shared size
 * @param unit {string} (optional) the unit of that size
 * @constructor
 */
function DomCells(space, id, parent, orientation, size, unit) {
    DomElement.call(this, space, id, null, parent);
    this.set('isVert', orientation == 'vertical');
    var w, h;
    var wu, hu;
    if (!unit) {
        unit = '%';
    }
    wu = hu = unit;

    if (_.isArray(size)) {
        w = size[0];
        h = size[1];
    } else {
        if (orientation == 'vertical') {
            w = size;
            wu = unit;
            h = 100;
            hu = '%';
        } else {
            w = 100;
            wu = '%';
            h = size;
        }
    }
    this.size('width', w, wu);
    this.size('height', h, hu);
    this.update();
};

DomCells.prototype.$TYPE = 'DOMCELLS';
SNAPS.typeAliases.SNAP.push(DomCells.prototype.$TYPE);

DomCells.prototype = Object.create(DomElement.prototype);

function DomCell(cells, isVert, size, unit) {
    DomElement.call(this, cells.space, cells.space.nextId(), null, cells);
    this.size(isVert ? 'height' : 'width', size, unit)
        .size(isVert ? 'width' : 'height', 100, '%')
        .listen('updated', function () {
            cells.setCellOffset(cellDom);
        });
}

DomCell.prototype.$TYPE = 'DOMCELL';
SNAPS.typeAliases.SNAP.push(DomCell.prototype.$TYPE);

DomCell.prototype = Object.create(DomElement.prototype);

DomCell.prototype.asBdCell = function (orientation) {
    this.set('isVert', orientation == 'vertical');
};

DomCell.prototype.addCell = function () {
    if (!this.has('isVert')) {
        throw new Error('attempting to add a sub-cell to a cell tha thas not been given an orientation; call asBdCelll first.');
    }

    var args = _.toArray(arguments);

    _addCell.apply(this, args);
};

function _addCell(size, unit) {
    var cellDom = new DomCell(this, this.get('isVert'), size, unit);
    cellDom.set('cellIndex', this.domChildrenLinks().length, true);
    this.setCellOffset(cellDom);
    return cellDom;
};

DomCells.prototype.addCell = _addCell;

/**
 * //@TODO: refactor this into the DomCell definition
 * setting the offset of
 * @param cellDom
 */
DomCells.prototype.setCellOffset = function (cellDom) {
    var prevCells = this.domChildren();
    var thisIndex = cellDom.get('cellIndex');
    var prev = [];
    var distance = 0;
    var isVert = this.get('isVert');
    //  console.log('<<< getting offset of cell %s', thisIndex);
    for (var p = 0; p < prevCells.length; ++p) {
        var snap = prevCells[p];
        var c = snap.get('cellIndex');
        //   console.log('considering cell %s', c);
        if (c < thisIndex) {
            switch (isVert) {
                case true:
                    var size = snap.size('height');
                    //   console.log('size: %s', JSON.stringify(size.state()));
                    if (size.get('value') == 50) {
                        debugger;
                    }
                    var height = snap.pixels('height');
                    if (height != null) {
                        distance += height;
                        //      console.log('adding height %s', height);
                    } else {
                        //       console.log('height is null');
                        debugger;
                    }
                    break;

                case false:
                    var width = snap.pixels('width');
                    if (width != null) {
                        distance += width;
                        //             console.log('adding width %s', width);
                    } else {
                        //              console.log('width is null');
                        debugger;
                    }
                    break;

                default:
                    throw new Error('isVertical must be horizontal or vertical');
            }
            prev.push(snap);
        } else {
            //   console.log('skipping index %s', c);
        }
    }

    //console.log('total offset: %s', distance);

    switch (isVert) {
        case true:
            cellDom.style('top', distance + 'px');
            break;

        case false:
            cellDom.style('left', distance + 'px');
            break;

        default:
            throw new Error('isVertical must be horizontal or vertical');
    }

};