Snap.prototype.removeLink = function (link) {
    if (!this.links.length) {
        return;
    }
    var linkId = isNaN(link) ? link.id : link;

    this.links = _.reject(this.links, function (link) {
        return link.id == linkId;
    })
};

Snap.prototype.addLink = function (link) {
    if (!_.find(this.links, function (l) {
        return l.id == link.id
    })) {
        this.links.push(link);
    }
};

Snap.prototype.link = function () {
    var args = _.toArray(arguments);
    var linkType;
    if (typeof(args[0]) == 'string') {
        linkType = args.shift();
    } else {
        linkType = 'node';
    }
    args.unshift(this);
    return new SNAPS.Link(this.space, args, linkType);
};

Snap.prototype.getLinks = function (linkType, filter) {
    return _.filter(this.links, function (l) {
        return (l.linkType == linkType) ? ((filter) ? filter(l) : true) : false;
    });
};

Snap.prototype.nodeChildNodes = function () {
    var myId = this.id;
    return this.getLinks('node', function (n) {
        return n.ids[0] == myId;
    });
};

Snap.prototype.nodeChildren = function (ids) {
    var nodes = this.nodeChildNodes();

    return _.map(nodes, function (n) {
        return n.get(1, ids);
    });
};

Snap.prototype.hasNodeChildren = function () {
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.linkType == 'node' && link.ids[0] == this.id) {
            return true;
        }
    }

    return false;
};

Snap.prototype.nodeSpawn = function (ids) {
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

    var out = {
        id: this.id
    };

    var childLinks = this.getLinks('node', function (link) {
        return link.ids[0] == this.id;
    }.bind(this));

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