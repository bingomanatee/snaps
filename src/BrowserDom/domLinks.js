DomElement.prototype.domChildrenNodes = function () {
    return this.getLinksFrom('node', null, 'dom');
};

DomElement.prototype.hasDomChildren = function () {
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.active && link.linkType == 'node' && link.meta == 'dom' && link.snaps[0].id == this.id) {
            return true;
        }
    }
    return false;
};

DomElement.prototype.domChildren = function () {
    var children = [];
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.linkType == 'node' && link.meta == 'dom' && link.snaps[0].id == this.id) {
            children.push(link.snaps[1]);
        }
    }
    return children;
};

DomElement.prototype.domParentNodes = function () {
    return this.getLinksTo('node', null, 'dom');
};

DomElement.prototype.domParent = function () {
    var parents = this.getLinksTo('node', null, 'dom');
    if (parents.length == 1) {
        return parents[0].snaps[0];
    } else {
        return parents.length;
    }
};

DomElement.prototype.domParents = function () {
    return this.getLinksTo('node', null, 'dom');
};

DomElement.prototype.hasDomParent = function () {
    for (var l = 0; l < this.links.length; ++l) {
        var link = this.links[l];
        if (link.active && link.linkType == 'node' && link.meta == 'dom' && link.snaps[1].id == this.id) {
            return true;
        }
    }
    return false;
};