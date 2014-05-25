Snap.prototype.updateBlends = function () {
    var blends = this.getRels('blend');
    var blendValues = {};

    var time = this.space.time;

    var doneBlends = [];

    for (var i = 0; i < blends.length; ++i) {
        var blend = blends[i];
        var toSnap = blend.toSnap();
        var prop = toSnap.get('prop', 1);
        var endTime = toSnap.get('endTime', 1);
        var value;
        var endValue = toSnap.get('endValue', 1);

        var progress;

        if (endTime <= time) {
            value = endValue;
            progress = 1;
            doneBlends.push(blend);
        } else {
            var startTime = toSnap.get('startTime', 1);
            var startValue = SNAPS.assert.or('number', toSnap.get('startValue', 1), 0);
            var dur = endTime - startTime;
            progress = time - startTime;
            progress /= dur;

            value = (progress * endValue) + ((1 - progress) * startValue);
        }

        if (!blendValues[prop]) {
            blendValues[prop] = [];
        }
        blendValues[prop].push({
            value: value,
            progress: progress
        });
    }

    for (var b in blendValues) {
        var blendSet = blendValues[b];
        if (blendSet.length == 1) {
            this.set(b, blendSet[0].value);
        } else {
            var weight = 0;
            var netValue = 0;
            for (var bw = 0; bw < blendSet.length; ++bw) {
                var partProgress = blendSet[bw].progress;
                netValue += blendSet[bw].value * partProgress;
                weight += partProgress;
            }
            if (weight > 0) {
                this.set(b, netValue / weight);
            }
        }
    }

    for (var d = 0; d < doneBlends.length; ++d) {
        this.removeRel(doneBlends[d]);
        if (this.blendCount > 0) {
            --this.blendCount;
        }
    }
};
