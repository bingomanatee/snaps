function Box(domElement, props) {
    Snap.call(this, domElement.space, domElement.space.snaps.length, props);
    this.terminal.listen('box', _sizeToDom, this);
    this.terminal.listen('updateProperties', this.resizeBox, this);
}

DomElement.prototype.addBox = function (props) {
    var box = new Box(this, props);
    this.link('resource', box).meta = 'box';
    box.resizeBox();
    return box;
};

function _sizeToDom(width, height) {
    var de = this.boxDomElement();

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

Box.prototype.resizeBox = function () {
    this.terminal.dispatch('box', this.boxWidth(), this.boxHeight());
};

Box.prototype.boxHeight = function () {

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
Box.prototype.boxWidth = function () {

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


DomElement.prototype.getBox = function () {
    for (var l = 0; l < this.links.length; ++ l){
        var link = this.links[l];
        if (link.active && link.linkType == 'resource' && link.meta == 'box' && link.active){

            return link.snaps[1];
        }
    }
    return null;
};

Box.prototype.parentBox = function(){
    var element = this.boxDomElement();
    if (!element){
        throw "Box has no DomElement";
    }
     if (this.boxDebug) console.log('parent box for DOM box %s: element = %s', this.id, element ? element.id : '---');

    while (element) {
        var parent = element.domParents()[0]; // todo: insulate against multiple parents

        if (!parent) {
            if (this.boxDebug) console.log('... element %s has no parent', element.id);
            return null;
        }
        var box = parent.getBox();
        if (box) {
            if (this.boxDebug) console.log('... element %s box == %s', parent.id, box.id);
            return box;
        } else {
            if (this.boxDebug) console.log('... element has no box');
            element = parent;
        }
    }
    if (this.boxDebug) console.log('... element %s has no parent box found', this.id);

    return null;
};

DomElement.prototype.parentBox = function () {
    var element = this;
     if (this.boxDebug) console.log('parent box for DOM box %s: element = %s', this.id, element ? element.id : '---');

    while (element) {
        var parent = element.domParents()[0]; // todo: insulate against multiple parents
          if (this.boxDebug) console.log('... domParent == %s', parent ? parent.id : '--');
        if (!parent) {
            return null;
        }
        var box = parent.getBox();
        if (box) {
            return box;
        } else {
            element = parent;
        }
    }

    return null;
};

/**
 * the resource parent == the element the box is attempting to define a size for.
 * @returns {*}
 */

Box.prototype.boxDomElement = function () {
    var id = this.id;
    var domLinks = this.getLinks('resource', function (link) {
        return link.meta == 'box' && link.snaps[1].id == id;
    });

    return domLinks[0].snaps[0];
};
