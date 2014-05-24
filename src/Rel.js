SNAPS.Rel = function (params, meta) {
    var space = SNAPS.assert.prop(params, 'space');
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');

    var fromId = SNAPS.assert.prop(params, 'from');
    if (!_.isNumber(fromId)) {
        fromId = SNAPS.assert.$TYPE(fromId, 'SNAP').id;
    }
    this.fromId = fromId;

    var toId = SNAPS.assert.prop(params, 'to');
    if (!_.isNumber(toId)) {
        toId = SNAPS.assert.$TYPE(toId, 'SNAP').id;
    }
    this.toId = toId;

    var relType = SNAPS.assert.prop(params, 'relType');
    relType = SNAPS.assert.string(relType, 'relType must be string');
    this.relType = SNAPS.assert.notempty(relType, 'string', 'relType must not be empty');
    this.active = true;
};

SNAPS.Rel.prototype.broadcast = function (fromId, message, property, value) {
    this.toSnap().hear(message, property, value);
};

SNAPS.Rel.prototype.toSnap = function () {
    return this.space.snap(this.toId, true);
};

SNAPS.Rel.prototype.toJSON = function(){
    return {fromId: this.fromId, toId: this.toId, relType: this.relType}
};