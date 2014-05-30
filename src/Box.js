function Box(domElement, props) {
    Snap.call(this, domElement.space, domElement.space.snaps.length, props);
    this.terminal.listen('box', _sizeToDom, this);
    this.terminal.listen('updateProperties', this.resizeBox, this);
}

function _sizeToDom(width, height) {
    var de = this.domElement();

    if (width[1] == 'px') {
        de.setStyle('width', width[0]);
    } else {
        de.setStyle('width', width[0] + '%');
    }

    if (height[1] == 'px') {
        de.setStyle('height', height[0]);
    } else {
        de.setStyle('height', height[0] + '%');
    }
}

Box.prototype = Object.create(Snap.prototype);
Box.prototype.$TYPE = 'DOMBOX';
SNAPS.typeAliases.SNAP.push('DOMBOX');

Box.prototype.resizeBox = function() {
    debugger;
    this.terminal.dispatch('box', this.boxWidth(), this.boxHeight());
};

Box.prototype.boxHeight = function() {

    if (this.has('height')) {
        return [this.get('height'), 'px'];
    } else if (this.has('heightPercent')) {
        var parentBox = this.parentBox();
        var pct = this.get('heightPercent');
        if (parentBox) {
            var parentBoxHeight = parentBox.boxHeight();

            if (parentBoxHeight[1] == '%') {
                parentBoxHeight[0] *= pct;
                return parentBoxHeight;
            }
        } else {
            return [pct, '%'];
        }
    }
};

Box.prototype.boxWidth = function() {

    if (this.has('width')) {
        return [this.get('width'), 'px'];
    } else if (this.has('widthPercent')) {
        var parentBox = this.parentBox();
        var pct = this.get('widthPercent');
        if (parentBox) {
            var parentBoxWidth = parentBox.boxWidth();

            if (parentBoxWidth[1] == '%') {
                parentBoxWidth[0] *= pct;
                return parentBoxWidth;
            }
        } else {
            return [pct, '%'];
        }
    }
};

Box.prototype.parentBox = function() {
    var element = this.domElement();
    do {
        var parent = element.nodeParents()[0]; // todo: insulate against multiple parents
        var boxLinks = parent.getLinks('resource', function(link) {
            return link.meta == 'box' && link.snaps[0].id == parent.id;
        });
        if (boxLinks.length > 0) {
            return boxLinks[0].snaps[1];
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
