var pxRE = /([\d.]+)px/;
var pctRE = /([\d.]+)%/;

Space.prototype.size = function (sizeName, input, unit) {
    var size = new Size(this, this.snaps.length, sizeName, input, unit);
    this.snaps.push(size);
    return size;
};

DomElement.prototype.sizeResource = function (sizeName) {
    var links = this.getLinksFrom('size', null, sizeName);
    if (links.length == 1){
        return links[0].snaps[0];
    } else {
        return links.length;
    }
};

DomElement.prototype.size = function (sizeName, value, unit) {
    if (arguments.length < 2) {
        var links = this.getLinksFrom('resource', null, sizeName);
        return links[0] ? links[0].snaps[1] : null;
    } else {
        var res = this.sizeResource(sizeName);
        // get mode
        if (arguments.length == 1) {
            return res ? res.snaps[1] : null;
        }

        if (res) {
            // recycle existing size
            size = res.snaps[1];
            size.set('value', value);
            size.set('unit', unit);
            return this;
        }

        var size = this.space.size(sizeName, value, unit);
        this.link('resource', size).meta = sizeName;

        if (size.get('unit', true) == '%') {
            var self = this;

            function orf() {
                self.clearProp(sizeName + 'Pixels', true);
                _updateSize.call(size);
            }

            this.set('onResizeFn', orf);
            this.terminal.listen('resize', orf);
            //@TODO: cleanup
        }
        return this;
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
 * @param sizeName {string}  {String} usu. 'width' or 'height'
 * @param input {variant} number or size string('200px', '100%')
 * @param unit {string} (optional) '%' or 'px'
 * @constructor
 */

function Size(space, id, sizeName, input, unit) {
    Snap.call(this, space, id);

    this.listen('updateProperties', _updateSize, this);
    this.listen('updateDocumentSize', _updateSize, this);

    this.set('sizeName', sizeName);

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

Size.prototype.pixels = function () {
    var value = this.get('value');
    var unit = this.get('unit');
    var sizeName = this.get('sizeName');

    if (unit == 'px') {
        return value;
    } else if (unit == '%') {
        var pixelName = sizeName + 'Pixels';

        var parentSnap = this.resParent();
        if (parentSnap.has(pixelName)) {
            return parentSnap.get(pixelName);
        }

        parentSnap = parentSnap.domParent();
        while (parentSnap) {
            //@TODO: multiple parents should not exist for domNodes
            var pixels = parentSnap.pixels();
            if (pixels !== null) {
                pixels *= value / 100;
                return pixels;
            }
            parentSnap = parentSnap.domParents()[0];
        }
    }
    return null;
};
//@TODO: check document?

Size.prototype.sizeDomParent = function () {
    return this.getLinksTo('resource', null, this.get('sizeName'));
};

DomElement.prototype.pixels = function (sizeName) {
    var pixelName = sizeName + 'Pixels';
    if (!this.has(pixelName)) {
        this.set(pixelName, _domPixels.call(this, sizeName));
    }
    return this.get(pixelName);
};

_domPixels = function (sizeName) {
    var size = this.size(sizeName);
    var percent = null;
    if (!size) {
        return null;
    } else {
        var unit = size.get('unit');
        var value = size.get('value');
        if (unit == 'px') {
            return value;
        } else if (unit == '%') {
            percent = value;
        } else {
            return null;
        }

    }

    var domParents = this.domParents();

    if (!domParents.length) {
        // get from document
        var document = this.space.getDocument();
        if (document) {
            switch (sizeName) {
                case 'width':
                    return _.isNumber(document.innerWidth) ? document.innerWidth : null;
                    break;
                case 'height':
                    return _.isNumber(document.innerHeight) ? document.innerHeight : null;
                    break;
            }
        }
    } else {
        for (var p = 0; p < domParents.length; ++p) {
            var pPixels = domParents[p].pixels(sizeName);
            if (pPixels !== null) {
                return pPixels * percent / 100;
            }
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

/**
 * updates an element's size based on its property
 * @private
 */
function _updateSize() {
    var dom = this.resParent();
    if (!dom) {
        return;
    }

    var value = this.get('value');
    var unit = this.get('unit');
    var sizeName = this.get('sizeName');
    var pixelName = sizeName + 'Pixels';
    var out = '';
    if (dom.has(pixelName)) {
        dom.clearProp(pixelName, true, true);
        // silently clear cached pixel size from this dom and the children of this.dom
    }

    var parentSnap;

    if (this.get('block')) {
        switch (unit) {
            case '%':
                parentSnap = dom.domParent();
                if (parentSnap) {
                    var pixels = parentSnap.pixels(sizeName);
                    if (pixels !== null) {
                        value = pixels * value / 100;
                        unit = 'px';
                    }
                } else {
                    var window = this.space.window;
                    if (window) {
                        switch (sizeName) {
                            case 'width':
                                value *= window.innerWidth / 100;
                                unit = 'px';
                                break;

                            case 'height':
                                value *= window.innerHeight / 100;
                                unit = 'px';
                                break;
                        }
                    }

                }
                out = value + unit;
                break;

            case 'px':
                out = value + 'px';
                break;

            default:

        }
        dom.style(sizeName, out, true);
    }
}
