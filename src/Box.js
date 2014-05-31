function Box(domElement, props) {
    Snap.call(this, domElement.space, domElement.space.snaps.length, props);
    this.terminal.listen('box', _sizeToDom, this);
    this.terminal.listen('updateProperties', this.resizeBox, this);
}

function _sizeToDom(width, height) {
    var de = this.domElement();

    if (width) {
        if (typeof width == 'number') {
            de.style('width', width);
        } else if (_.isArray(width)) {
            if (width[1] == 'px') {
                de.style('width', width[0]);
            } else {
                de.style('width', width[0] + '%');
            }
        }
    }

    if (typeof height == 'number') {
        de.style('height', height);
    } else if (_.isArray(height)) {
        if (height[1] == 'px') {
            de.style('height', height[0]);
        } else {
            de.style('height', height[0] + '%');
        }
    }
}

Box.prototype = Object.create(Snap.prototype);
Box.prototype.$TYPE = 'DOMBOX';
SNAPS.typeAliases.SNAP.push('DOMBOX');

Box.prototype.resizeBox = function() {
    this.terminal.dispatch('box', this.boxWidth(), this.boxHeight());
};

Box.prototype.boxHeight = function() {

    if (this.has('height')) {
        return [this.get('height'), 'px'];
    } else if (this.has('heightPercent')) {
        var pct = this.get('heightPercent');
        var parentBox = this.parentBox();
        while (parentBox) {
            if (parentBox.has('height')) {
                return parentBox.get('height') * pct / 100;
            } else if (parentBox.has('heightPercent')) {
                pct *= parentBox.get('heightPercent') / 100;
                parentBox = parentBox.parentBox();
            } else {
                parentBox = null;
            }
        }
        return[pct, '%'];

    } else {
        return [100, '%'];
    }
};

/**
 * this method attempts to elicit an absolute size based on nested percents;
 * if this box is percentage based, the box heritage is recursed until a box with a fixed size
 * is found and multiplies that absolute size by all the percentages.
 *
 * If no absolute sizes are found, the product of all the percents is returned.
 * @returns {*}
 */
Box.prototype.boxWidth = function() {

    if (this.has('width')) {
        return [this.get('width'), 'px'];
    } else if (this.has('widthPercent')) {
        var pct = this.get('widthPercent');
        var parentBox = this.parentBox();
        while (parentBox) {
            if (parentBox.has('width')) {
                return parentBox.get('width') * pct / 100;
            } else if (parentBox.has('widthPercent')) {
                pct *= parentBox.get('widthPercent') / 100;
                parentBox = parentBox.parentBox();
            } else {
                parentBox = null;
            }
        }
        return[pct, '%'];

    } else {
        return [100, '%'];
    }
};

Box.prototype.boxDebug = false;

Box.prototype.parentBox = function() {
    var element = this.domElement();
    if (this.boxDebug) console.log('parent box for DOM box %s: element = %s', this.id, element ? element.id : '---');
    if (!element) {
        throw new Error('no dom element for bos %', this.id);
    }
    do {
        var parent = element.domParents()[0]; // todo: insulate against multiple parents
        if (this.boxDebug) console.log('... domParent == %s', parent ? parent.id : '--');
        if (!parent) {
            return null;
        }
        var boxLinks = parent.getLinks('resource', function(link) {
            return link.meta == 'box' && link.snaps[0].id == parent.id;
        });
        if (boxLinks.length > 0) {
           if(this.boxDebug) console.log('!!! returning parent box %s', boxLinks[0].snaps[1]);
            return boxLinks[0].snaps[1];
        } else {
            if (this.boxDebug) console.log(' ... no box found , continue .... ')
        }
    } while (parent);

    return null;
};

Box.prototype.domElement = function() {
    var id = this.id;
    var domLinks = this.getLinks('resource', function(link) {
        return link.meta == 'box' && link.snaps[1].id == id;
    });

    return domLinks[0].snaps[0];
};
