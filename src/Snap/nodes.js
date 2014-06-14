
Snap.prototype.nodeChildLinks = function () {
    return this.getLinksFrom('node');
};

/**
 * returns links of type 'node' to this snap
 * @returns {*}
 */
Snap.prototype.nodeParentLinks = function () {
    return this.getLinksTo('node');
};

/**
 * returns snaps of nodeParentNodes;
 * @param ids
 * @returns {*}
 */
Snap.prototype.nodeParents = function () {
    var parents =  this.getLinksTo('node');
    for (var p = 0; p < parents.length; ++p){
        parents[p] = parents[p].snaps[0];
    }
    return parents;
};

Snap.prototype.nodeChildren = function () {
    var children =  this.getLinksFrom('node');
    for (var p = 0; p < children.length; ++p){
        children[p] = children[p].snaps[1];
    }
    return children;
};

Snap.prototype.hasNodeChildren = function () {
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.linkType == 'node' && link.meta == 'nodeChild' && link.snaps[0].id == this.id) {
            return true;
        }
    }

    return false;
};

Snap.prototype.nodeSpawn = function () {
    var children = this.nodeChildren();

    var leafs = [];
    var pp = [];
    var parents = [];

    while (children.length || parents.length) {
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            if (child.hasNodeChildren()) {
                parents.push(child);
            } else {
                leafs.push(child);
            }
        }
        children = [];

        for (var p = 0; p < parents.length; ++p) {
            var parent = parents[p];
            children = children.concat(parent.nodeChildren());
            pp.push(parent);
        }
        parents = [];
    }

    return pp.concat(leafs);

};

Snap.prototype.nodeFamily = function () {

    var id = this.id;
    var out = {
        id: id
    };

    var childLinks = this.getLinks('node', function (link) {
        return link.snaps[0].id == id;
    });

    for (var l = 0; l < childLinks.length; ++l) {
        var link = childLinks[l];
        var nodeChild = link.get(1);
        var grandChildren = nodeChild.nodeFamily();
        if (link.meta && _.isString(link.meta)) {
            if (!out[link.meta]) {
                out[link.meta] = [];
            }
            out[link.meta].push(grandChildren);
        } else {
            if (!out.children) {
                out.children = [];
            }
            out.children.push(grandChildren);
        }
    }

    return out;
};