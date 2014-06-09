var pxRE = /([\d.]+)px/;
var pctRE = /([\d.]+)%/;

Space.prototype.size = function (sizeName, input, unit) {
    var size = new Size(this, this.snaps.length, sizeName, input, unit);
    this.snaps.push(size);
    return size;
};

DomElement.prototype.size = function (sizeName, value, unit) {
    if (arguments.length < 2) {
        var links = this.linksFrom('resource', null, sizeName);
        return links[0] ? links[0].snaps[1] : null;
    } else {
        var size = this.space.size(sizeName, value, unit);
        this.link('resource', size).meta = sizeName;
    }
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
 * @param paramName {String} usu. 'width' or 'height'
 * @param input {variant} number or size string('200px', '100%')
 * @param unit {string} (optional) '%' or 'px'
 * @constructor
 */
function Size(space, id, paramName, input, unit) {
    Snap.call(this, space, id);
    this.set('paramName', paramName);

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
            this.set('value', parseFloat(pctRE.exec(input)[1]));
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

Size.prototype.sizeDomParent = function () {
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.linkType == 'resource' && link.meta == this.get('paramName') && link.snaps[1].id == this.id) {
            return link.snaps[0];
        }
    }
    return null;
};

Size.domSize = function (dom, paramName) {
    for (var l = 0; l < dom.links.length; ++l) {
        var link = dom.links[l];
        if (link.linkType == 'resource' && link.meta == paramName && link.snaps[1].id == dom.id) {
            return link.snaps[0];
        }
    }
    return null;
};

Size.prototype.size = function (value) {
    if (!this.get('block')) {
        return null;
    } else if (value) {
        return this.get('value');
    } else {
        return this.get('value') + this.get('unit');
    }
};

/**
 * return the pixels percentage. For optimal dom this should not be initiated
 * until its proven you cannot determine an absolute size for the node
 * because there is no parental pixel basis.
 *
 * This means unless the space has no document this branch should never be called into action
 *
 * @returns {*}
 */
Size.prototype.pixels = function () {
    var unit = this.get('unit');
    var value = this.get('value');
    var paramName = this.get('paramName');

    switch (unit) {
        case 'px':
            return value;
            break;

        case '%':

            var parentDomNode = this.sizeDomParent().domParent();
            while (parentDomNode) {
                // either find a parent node with a valid pixel scalar
                var size = parentDomNode.size(paramName);
                if (size) {
                    var parentPixels = size.pixels();
                    if (parentPixels !== null) {
                        return value * parentPixels / 100;
                    }
                } else {
                    // check upstream containers.
                    parentDomNode = parentDomNode.domParent();
                }
            }
            return null;

            break;
    }
    return null;
};

/**
 * returns the local percent == percent of parent.
 * @returns {*}
 */
Size.prototype.percent = function () {
    var unit = this.get('unit');
    var value = this.get('value');
    var paramName = this.get('paramName');

    switch (unit) {

        case '%':

            return value;

            break;
    }
    return null;
};

SNAPS.Size = Size;

function _updateSize() {
    var parentLink = this.resParent(true);
    if (!parentLink) {
        return;
    }
    var parentSnap;

    if (this.get('block')) {
        var pixels = this.pixels();
        if (pixels !== null) {
            parentSnap = this.sizeDomParent();
            parentSnap.s(parentLink.meta, pixels, 'px');
        } else {
            var percent = this.percent();
            parentSnap = this.sizeDomParent();
            if (percent !== null) {
                parentSnap.s(parentLink.meta, percent, '%');
            } else {
                parentSnap.s(parentLink.meta, SNAPS.DELETE);

            }
        }
    }

}
