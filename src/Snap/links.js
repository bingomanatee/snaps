Snap.prototype.removeLink = function (link) {
    if (!this.links.length) return;
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
