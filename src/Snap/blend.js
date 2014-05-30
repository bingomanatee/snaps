Snap.prototype.updateBlends = function () {

    var blends = this.getLinks('semantic', function (link) {
        var semLink = link.get(1);
        return semLink.get('meta') == 'blend';
    });


    var blendValues = {};

    var time = this.space.time;

    var doneBlends = [];

    for (var i = 0; i < blends.length; ++i) {
        var blend = blends[i];
        var blendValueSnap = blend.get(2);
        var prop = blendValueSnap.get('prop');
        var endTime = blendValueSnap.get('endTime');
        var value;
        var endValue = blendValueSnap.get('endValue');
        var startValue = SNAPS.assert.or('number', blendValueSnap.get('startValue'), 0);

        var progress;

        if (endTime <= time) {
            value = endValue;
            progress = 1;
            doneBlends.push(blend);
        } else {
            progress = _blendProgress(blendValueSnap, time, endTime);
            value = (progress * endValue) + ((1 - progress) * startValue);
        }

        if (!blendValues[prop]) {
            blendValues[prop] = [];
        }

        blendValues[prop].push(value);
    }

    for (var b in blendValues) {
        if (blendValues[b].length != 1) {
            console.log('multiple blends for ' + b, this.id);
        }
        this.internalUpdate(b, blendValues[b][0]);
    }

    for (var d = 0; d < doneBlends.length; ++d) {
        doneBlends[0].destroy();
    }
    this.blendCount = Math.max(0, this.blendCount - doneBlends.length);
};

function _blendProgress(blendSnap, time, endTime) {

    var startTime = blendSnap.get('startTime');
    var dur = endTime - startTime;
    var progress = time - startTime;
    progress /= dur;

    if (blendSnap.has('blend')) {
        var blendFn = blendSnap.get('blend');
        if (typeof(blendFn) == 'function') {
            progress = blendFn(progress);
        }
    }
    return progress;
}

Snap.prototype.blend = function (prop, endValue, time, blendFn) {
    this.retireOtherBlends(prop);
    var valueSnap = this.space.snap(true); // simple/static snap
    valueSnap.set('prop', prop);
    var startValue = this.has(prop) ? parseFloat(this.get(prop)) || 0 : 0;
    valueSnap.set('startValue', startValue)
        .set('endValue', SNAPS.assert.number(endValue))
        .set('startTime', this.space.time)
        .set('endTime', this.space.time + Math.max(parseInt(time), 1))
        .set('blend', blendFn);
    var metaSnap = this.space.snap({
        simple: true,
        meta: 'blend',
        prop: prop
    });
    this.link('semantic', metaSnap, valueSnap);
    this.blendCount++;
};

Snap.prototype.retireOtherBlends = function (prop) {
    var otherBlends = this.getLinks('semantic', function (link) {

        var metaSnap =  link.get(1);
        return (metaSnap.get('meta') == 'blend') && (metaSnap.get('prop') == prop);
    });

    _.each(otherBlends, function (blend) {
        blend.destroy();
    })

};
