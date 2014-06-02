Space.prototype.bdCells = function (parent, orientation, size) {
    var bdCells = SNAPS.bdCells(this, this.snaps.length, parent, orientation, size);
    this.snaps.push(bdCells);
    return bdCells;
};

SNAPS.bdCells = function (space, i, p, o, d) {

    return new DomCells(space, i, p, o, d);
};

/**
 * DomCells is a series of cells -- a row or column -- contained within a parent element
 * with which they share a dimension (width for columns, height for rows).
 *
 * @param space
 * @param id
 * @param parent
 * @param orientation {String} ('vertical' or 'horizontal').
 * @param size {Number | Array} [value, '%'] -- the shared size
 * @constructor
 */
var DomCells = function (space, id, parent, orientation, size) {
    DomElement.call(this, space, id, null, parent);
    this.set('isVertical', orientation == 'vertical');
    this.set('size', size || [100, '%']);
    this.addBox(this.cellsProps());
    this.cellCount = 0;
    this.cells = [];
    this.cellBoxes = [];
};

DomCells.prototype.$TYPE = 'DOMCELLS';
SNAPS.typeAliases.SNAP.push(DomCells.prototype.$TYPE);

DomCells.prototype = Object.create(DomElement.prototype);

DomCells.prototype.addCell = function (size, unit) {
    var cellDom = this.space.bd();
    var props = this.cellProps(size, unit);

    var box = cellDom.addBox(props);

    this.cellBoxes.push(box);
    this.cells.push(box);
    this.link(box);

    this.reconcileRelativeSizes();

    ++this.cellCount;
};

DomCells.prototype.reconcileRelativeSizes = function () {
    var relBoxes = [];
    var absBoxes = [];
    var percentBoxes = [];

    for (var cb = 0; cb < this.cellBoxes.length; ++cb) {
        var box = this.cellBoxes[cb];
        switch (box.get('sizeUnit')) {
            case 'px':
                absBoxes.push(box);
                break;

            case '%':
                percentBoxes.push(box);
                break;

            default:
                relBoxes.push(box);
        }
    }

    if (this.get('isVertical')){
        var availableSize = this.getBox();
    }
};

DomCells.prototype.cellsProps = function () {
    var props = {};
    var size = this.get('size');
    var isVertical = this.get('isVertical');
    var unit;
    var value;

    if (_.isArray(size)) {
        value = size[0];
        unit = size[1];
    } else {
        unit = 'px';
        value = size;
    }

    if (unit == 'px') {
        if (isVertical) {
            props.height = value;
        } else {
            props.width = value;
        }
    } else {

        if (isVertical) {
            props.heightPercent = value;
        } else {
            props.widthPercent = value;
        }

    }

    return props;
};

/**
 * the properties of a single cell
 *
 * @param value {Number | Array} -- value | [value, unit];
 * @param unit {String} optional -- default == 'px';
 * @returns {*}
 */
DomCells.prototype.cellProps = function (value, unit) {
    var props = this.celllsProps();

    var isVertical = this.get('isVertical');

    if (_.isArray(value)) {
        unit = value[1];
        value = value[0];
    } else if (!unit) {
        unit = 'px';
    }

    if (unit == 'px') {
        if (isVertical) {
            props.width = value;
        } else {
            props.height = value;
        }
    } else if (unit == '%') {
        if (isVertical) {
            props.widthPercent = value;
        } else {
            props.heightPercent = value;
        }
    } else {
        // dimensions will have to be reconciles
    }

    props.sizeValue = value;
    props.sizeUnit = unit;

    return props;
}