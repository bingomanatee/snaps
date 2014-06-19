Snap.prototype.link = function () {
    var args = _.toArray(arguments);
    var meta = null;
    var linkType;
    if (typeof(args[0]) == 'string') {
        linkType = args.shift();
    } else {
        linkType = 'node';
        meta = 'nodeChild';
    }
    args.unshift(this);
    return new SNAPS.Link(this.space, args, linkType, meta);
};

Snap.prototype.removeLink = function (link) {
    if (this.simple || (!this.links.length)) {
        return;
    }

    var newLinks = [];

    for (var l = 0; l < this.links.length; ++l){
        var oldLink = this.links[l];
        if (link.id != oldLink.id){
            newLinks.push(oldLink);
        }
    }
    this.links = newLinks;

    return this
};

Snap.prototype.addLink = function (link) {
    if (this.simple) {
        return; // this is not a throwable error -- simple Snaps can be linked to -- just don't keep a registry of links
    }

    this.links.push(link);
    this.dispatch('linked', link);
};

Snap.prototype.getLinksTo = function (linkType, filter, meta) {
    var links = this.getLinks(linkType, filter, meta);
    var out = [];
    for (var l = 0; l < links.length; ++l) {
        if (links[l].snaps[1].id == this.id) {
            out.push(links[l]);
        }
    }
    return out;
};

Snap.prototype.getLinksFrom = function (linkType, filter, meta) {
    var links = this.getLinks(linkType, filter, meta);
    var out = [];
    for (var l = 0; l < links.length; ++l) {
        if (links[l].snaps[0].id == this.id) {
            out.push(links[l]);
        }
    }
    return out;
};

/**
 * returns a subset of the links array based on type and an optional filter.
 *
 * NOTE: while the filter sugar may make for cleaner code,
 * iterating over a link array manually reduces one very common dip into submethods.
 * Consider this as an opportunity for more efficient code if you need to create a filter function.
 * You'll see some of this denormalizing below.
 *
 * @param linkType {string} the type of link to get.
 * @param filter {function} (optional) a sub-criteria fro which links you want to get.
 * @returns {Array}
 * @param meta {variant} sets a required value for a meta property of a link;
 */
Snap.prototype.getLinks = function (linkType, filter, meta) {
    if (this.simple) { // simple elements have no links
        return [];
    }
    var out = [];
    var link;
    var l;
    var ll = this.links.length;

    if (filter) {
        switch (typeof(filter)) {
            case 'function':
                for (l = 0; l < ll; ++l) {
                    link = this.links[l];
                    if (meta && (link.meta != meta)) {
                        continue;
                    }
                    if (link.active && (link.linkType == linkType) && filter(link, l)) {
                        out.push(link);
                    }
                }
                break;

            case 'object':
                for (l = 0; l < ll; ++l) {
                    link = this.links[l];

                    if (link.active && ((typeof meta == 'undefined' )|| (link.meta == meta)) && (link.linkType == linkType)) {
                        for (var p in filter) {
                            if (link && link[p] != filter[p]) {
                                link = null;
                            }
                        }
                        if (link) {
                            out.push(link);
                        }
                    }
                }
                break;
        }
    } else { // no filter;
        for (l = 0; l < ll; ++l) {
            link = this.links[l];
            if (link.active && (link.linkType == linkType) && ((typeof meta == 'undefined') || (link.meta == meta))) {
                out.push(link);
            }
        }
    }
    return out;
};

Snap.prototype.impulse = function (message, linkType, props, meta) {
    SNAPS.impulse(this, message, linkType, props, meta);

    return this;
};

/**
 * prepare this snap to be destroyed;
 * links all the children of this snap to its parent(s) if any
 * and destroys its node links.
 */
Snap.prototype.unparent = function () {
    if (this.simple) {
        return;
    }

    var nodes = this.getLinks('nodes');
    if (!nodes.length) {
        return;
    }
    var children = [];
    var parents = [];

    for (var n = 0; n < nodes.length; ++n) {
        var node = nodes[n];
        if (node.snaps[0].id == this.id) { // child  link
            children.push(node.snaps[1]);
        } else if (node.snaps[1].id == this.id) {
            parents.push(node.snaps[0]);
        }
        node.destroy();
    }

    for (var p = 0; p < parents.length; ++p) {
        var parent = parents[p];
        if (parent && parent.active && (!parent.simple)) {
            for (var c = 0; c < children.length; ++c) {
                parent.link(children[c]);
            }
        }
    }

    return this;
};

Snap.prototype.resParent = function (link) {
    for (var l = 0; l < this.links.length; ++l) {
        if (this.links[l].linkType == 'resource' && (this.id == this.links[l].snaps[1].id)) {
            return link ? this.links[l] : this.links[l].snaps[0];
        }
    }
    return false;
};

/**
 * Sends a miessage to the terminal of this node and all its children
 * @param message
 * @param data
 */
Snap.prototype.nodeBroadcast = function (message, data) {
    var snaps = [this];

    while (snaps.length) {
        var snap = snaps.shift(snaps);
        snap.terminal.dispatch(message, data);
        snaps.unshift.apply(snaps, this.nodeChildren());
    }
};
