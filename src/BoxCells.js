Space.prototype.bdCells = function(parent, orientation, size) {
    var bdCells = SNAPS.bdCells(this, this.snaps.length, parent, orientation, size);
    this.snaps.push(bdCells);
    return bdCells;
};

SNAPS.bdCells = function(space, i, p, o, d) {

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
 * @constructor
 */
var DomCells = function(space, id, parent, orientation, size, unit) {
    DomElement.call(this, space, id, null, parent);
    this.set('isVert', orientation == 'vertical');
    this.set('size', size).set('unit', unit);
    this.update();
    this.addBox(this.cellsBoxProps(size, unit));

    this.cellCount = 0;
    this.cells = [];
    this.cellBoxes = [];
};

DomCells.prototype.$TYPE = 'DOMCELLS';
SNAPS.typeAliases.SNAP.push(DomCells.prototype.$TYPE);

DomCells.prototype = Object.create(DomElement.prototype);

DomCells.prototype.addCell = function(size, unit) {
    var cellDom = this.space.bd(null, this);
    cellDom.set('size', size).set('unit', unit);
    var props = this.cellSubBoxProps(size, unit);

    var box = cellDom.addBox(props);

    this.cellBoxes.push(box);
    this.cells.push(cellDom);
    this.link(cellDom);

    this.reconcileRelativeSizes();

    ++this.cellCount;
};

DomCells.prototype.reconcileRelativeSizes = function() {
    var relBoxElements = [];
    var absBoxElements = [];
    var percentBoxElements = [];
    var availableSize;
    var isVert = !!this.get('isVert');

    for (var cb = 0; cb < this.cells.length; ++cb) {
        var cell = this.cells[cb];
        if (cell.hasPendingChanges()){
            cell.update();
        }
        var box = this.cellBoxes[cb];
        var data = {cell: cell, box: box};

        if (cell.active) switch (cell.get('unit')) {
            case 'px':
                absBoxElements.push(data);
                break;

            case '%':
                percentBoxElements.push(data);
                break;

            default:
                relBoxElements.push(data);
        }
    }
    debugger;
    if (!(relBoxElements.length || percentBoxElements.length)) {
        return;
    }

    if (isVert) {
        availableSize = this.getBox().boxHeight();
    } else {
        availableSize = this.getBox().boxWidth();
    }
    if (_.isArray(availableSize) && availableSize[1] == 'px'){
        availableSize = availableSize[0];
    }

    if (_.isNumber(availableSize)) {
        for (var ab = 0; ab < absBoxElements.length; ++ab) {
            availableSize -= absBoxElements[ab].cell.get('size');
        }

        if (availableSize < 0) {
            return; // screwit
        }

        debugger;
        var percent = 0;
        for (var p = 0; p < percentBoxElements.length; ++p) {
            var pd = percentBoxElements[p];
            var size = pd.cell.get('size');
            percent += size;

            if (isVert) {
                pd.box.set('widthPercent', SNAPS.DELETE);
                pd.box.set('width', Math.round(availableSize * size / 100));
            } else {
                pd.box.set('heightPercent', SNAPS.DELETE);
                pd.box.set('height', Math.round(availableSize * size / 100));
            }
        }
        percent = Math.max(0, Math.min(100, percent));

        if (percent) {
            availableSize *= (100 - percent) / 100;
        }

        if (availableSize > 0) {
            var totalRelative = 0;
            var r;

            for (r = 0; r < relBoxElements.length; ++r) {
                totalRelative += relBoxElements[r].cell.has('size') && relBoxElements[r].cell.get('size') ? relBoxElements[r].cell.get('size') : 1;
            }

            if (totalRelative > 0) {
                for (r = 0; r < relBoxElements.length; ++r) {
                    totalRelative += relBoxElements[r].cell.has('size') && relBoxElements[r].cell.get('size') ? relBoxElements[r].cell.get('size') : 1;
                }
            }
        }
    }
};

/**
 *
 * the properties of the main container's box;
 * but the container itself. These are internal properties.
 *
 * @param size {Number | Array} -- value | [value, unit];
 * @param unit {String} optional -- default == 'px';
 * @returns {{}}
 */
DomCells.prototype.cellsBoxProps = function(size, unit) {
    var props = {};
    var isVert = this.get('isVert');

    if (_.isArray(size)) {
        unit = size[1];
        size = size[0];
    }

    if (!unit) {
        unit = 'px';
    }

    if (unit == 'px') {
        if (isVert) {
            props.height = size;
        } else {
            props.width = size;
        }
    } else if (unit == '%') {

        if (isVert) {
            props.heightPercent = size;
        } else {
            props.widthPercent = size;
        }

    }

    return props;
};

/**
 * the property of an added cell
 * @param value {Number | Array} -- value | [value, unit];
 * @param unit {String} optional -- default == 'px';
 * @returns {*}
 */
DomCells.prototype.cellSubBoxProps = function(value, unit) {
    var props = {};

    var isVert = this.get('isVert');

    if (_.isArray(value)) {
        unit = value[1];
        value = value[0];
    } else if (!unit) {
        unit = 'px';
    }

    if (unit == 'px') {
        if (isVert) {
            props.width = value;
        } else {
            props.height = value;
        }
    } else if (unit == '%') {
        if (isVert) {
            props.widthPercent = value;
        } else {
            props.heightPercent = value;
        }
    } else {
        // dimensions will have to be reconciled some other way
    }

    return props;
}
