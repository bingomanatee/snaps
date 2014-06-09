var pxRE = /([\d.]+)px/;
var pctRE = /([\d.]+)%/;

Space.prototype.size = function(sizeName, input, unit) {
    var size = new Size(this, this.snaps.length, sizeName, input, unit);
    this.snaps.push(size);
    return size;
};

DomElement.prototype.sizeResource = function(sizeName) {
    var id = this.id;
    return this.getLinks('resource', function(link) {
        return link.meta == sizeName && link.snaps[0].id == id;
    })[0];
};

DomElement.prototype.size = function(sizeName, value, unit) {
    var size;
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

    size = this.space.size(sizeName, value, unit);
    if (unit == '%') {
        var self = this;
        this.terminal.listen('resize', function() {
            debugger;
            _updateSize.call(size);
        });
    }
    this.link('resource', size).meta = sizeName;
    return this
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
 * @param sizeName {string}
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

Size.prototype.pixels = function() {
    var value = this.get('value');
    var unit = this.get('unit');
    var sizeName = this.get('sizeName');

    if (unit == 'px') {
        return value;
    } else if (unit == '%') {

        var parentSnap = this.resParent();

        parentSnap = parentSnap.domParents()[0];
        while (parentSnap) {
            //@TODO: multiple parents should not exist for domNodes
            var pixels = parentSnap.pixels();
            if (pixels !== null) {
                return pixels * value / 100;
            }
            parentSnap = parentSnap.domParents()[0];
        }
        //@TODO: check document?
    }
    return null;
};

DomElement.prototype.pixels = function(sizeName) {
    var pixelName = sizeName + 'Pixels';
    if (!this.has(pixelName)) {
        this.set(pixelName, _domPixels.call(this, sizeName));
    }
    return this.get(pixelName);
};

_domPixels = function(sizeName) {
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
        var document = this.document();
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

    var dom = this.resParent();
    if (!dom) return;

    var value = this.get('value');
    var unit = this.get('unit');
    var sizeName = this.get('sizeName');
    var pixelName = sizeName + 'Pixels';
    if (dom.has(pixelName)) {
        dom.clearProp(pixelName, true, true); // silently clear cached pixel size from this dom and the children of this.dom
    }

    if (unit == '%') {
        var pixels = dom.pixels(sizeName);
        if (pixels !== null) {
            value = pixels * value / 100;
            unit = 'px';
        }
    }

    if (this.get('block')) {
        dom.s(sizeName, value, unit);
    } else {
        dom.s(sizeName, SNAPS.DELETE);
    }

}
