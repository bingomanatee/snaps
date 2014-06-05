var pxRE = /([\d.]+)px/;
var pctRE = /([\d.]+)%/;

Space.prototype.size = function(input, unit) {
    var size = new Size(this, this.snaps.length, input, unit);
    this.snaps.push(size);
    return size;
};

DomElement.prototype.size = function(sizeName, value, unit) {

    var size = this.space.size(value, unit);
    this.link('resource', size).meta = sizeName;
};

/**
 *
 * Represents a blendable, unit-conscious measurement, for width and height.
 *
 * note - the "block" value determines whether this measurement is in place;
 *      if false is set, no value will be shown for this property in the style.
 *
 * the 'value' property is a numeric and can be blended.
 *
 * @param space {Space}
 * @param id {int}
 * @param input {variant} number or size string('200px', '100%')
 * @param unit {string} (optional) '%' or 'px'
 * @constructor
 */
function Size(space, id, input, unit) {
    Snap.call(this, space, id);

    this.listen('updateProperties', _updateSize, this);

    this.set('block', true);
    if (input === false) {
        this.set('block', false);
    } else if (unit) {
        this.set('value', input);
        this.set('unit', unit);
    } else if (typeof input == 'number') {
        this.set('unit', 'px');
        this.set('value', input);
    } else if (typeof input == 'string') {
        if (pctRE.test(input)) {
            this.set('unit', '%');
            this.set('value', pctRE.exec(input)[1]);
        } else if (pxRE.test(input)) {
            this.set('unit', 'px');
            this.set('value', parseFloat(pxRE.exec(input)[1]));
        } else {
            this.set('unit', 'px');
            this.set('value', parseFloat(input));
        }
    } else {
        throw new Error('cannot parse input');
    }
}

Size.prototype = Object.create(Snap.prototype);

Size.prototype.size = function(value) {
    if (!this.get('block')) {
        return null;
    } else if (value) {
        return this.get('value');
    } else {
        return this.get('value') + this.get('unit');
    }
};

SNAPS.Size = Size;

function _updateSize() {
    var parentLink = this.resParent(true);
    if (!parentLink) return;
    var parentSnap = parentLink.snaps[0];

    if (this.get('block')) {
        parentSnap.s(parentLink.meta, this.get('value'), this.get('unit'));
    } else {
        parentSnap.s(parentLink.meta, SNAPS.DELETE);
    }

}
