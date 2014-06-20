/**
 * This resource manages the size and position of its parents' Dom children.
 * @param space
 * @param orientation {string} 'horizontal' or 'vertical' (or 'h' and 'v' for the lazy)
 * @constructor
 */

function DomCellManager(space, orientation) {
    Snap.call(this, space);
    this.set('isVert', /^v/i.test(orientation));
    this.listen('linked', _onDCMLinked.bind(this));
}

function _onDCMLinked(link) {
    this.sizeChildren();
}

Space.prototype.domCellManager = function(orientation){
    return new DomCellManager(this, this.nextId(), orientation);
};

DomCellManager.prototype.$TYPE = 'DOMCELLMGR';
SNAPS.typeAliases.SNAP.push(DomCellManager.prototype.$TYPE);

DomCellManager.prototype = Object.create(Snap.prototype);

function _DCMOrderedChildren(domCellManager) {
    var c;
    var unordered = [];
    var csName = domCellManager.get('isVert') ? 'vCellSize' : 'hSellSize';

    var parent = Snaps.assert.$TYPE(domCellManager.resParent(), DomElement.prototype.$TYPE);
    if (!parent) {
        return; // might not be linked yet
    }
    var children = parent.domChildren();

    var maxOrdered = 0;
    for ( c = 0; c < children.length; ++c) {
        var child = children[c];

        if (child.has(csName)) {
            maxOrdered = Math.max(child.get(csName), maxOrdered);
        } else {
            children[c] = null;
            unordered.push(child);
        }
    }
    if (unordered.length) {
        children = _.compact(children);

        children = _.sortBy(children, function (child) {
            return child.get(csName);
        });

        console.log('warning: DomCellManager has unordered children; enforcing order of ' + csName);
        unordered = _.sortBy(unordered, 'id'); // as good a guess as any...

        children = children.concat(unordered);
        for (c = 0; c < children.length; ++c){
            children[c].set(csName, c);
        }
    } else {
        return _.sortBy(children, function (child) {
            return child.get(csName);
        });
    }

}

DomCellManager.prototype.sizeChildren = function () {
    var children = _DCMOrderedChildren(this);
    var offset = 0;
    var sizeName;
    var styleName;

    if (this.get('isVert')) {
        sizeName = 'height' ;
        styleName = 'top';

    } else {
        sizeName = 'width' ;
        styleName = 'left';

    }
    for (var c = 0; c < children.length; ++c) {
       var child = children[c];
        if (offset > 0) {
            child.style(styleName, offset + 'px');
        }
       var size = child.size(sizeName);
        if (size) {
            offset += size.pixels();
        }
    }
};