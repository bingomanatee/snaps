/**
 * Impulse sends the same message to a set of snaps' terminals.
 * By default it sends messages down the family tree
 * but it can be trained to follow other link patterns.
 *
 * @param origin {Snap | Link} the sending root of the message; will not receive the message.
 * @param message {string}
 * @param linkType {String} default = 'node';
 * @param props {Object} configures communication pattern of Impulse;
 * @param meta {variant} optional -- content of message.
 */

SNAPS.impulse = function (origin, message, linkType, props, meta) {

    linkType = linkType || 'node';
    var heardSnapIds = [];
    var heardLinkIds = [];
    var linkFilter = props && props.linkFilter ? SNAPS.assert.fn(props.linkFilter) : false;
    var snapFilter = props && props.snapFilter ? SNAPS.assert.fn(props.snapFilter) : false;

    meta = meta || (props && props.meta ? props.meta : false);
    var linkIdStartPlace;
    switch (this.linkType) {
        case 'node':
            linkIdStartPlace = 1;

            break;

        case 'semantic':
            linkIdStartPlace = 2;

            break;
        default:
            linkIdStartPlace = 0;
    }
    var links = [];
    var snaps = [];

    switch (origin.$TYPE) {

        case 'SNAP':
            snaps = [origin];
            heardSnapIds.push(origin.id);
            break;

        case 'LINK':
            links = [origin];
            break;

        default:
            throw 'Impulse received with no valid origin'
    }

    while (snaps.length || links.length) {

        for (var i = 0; i < links.length; ++i) {
            var link = links[i];
            var lHeard = false;
            for (var lh = 0; (!lHeard) && lh < heardLinkIds.length; ++lh) {
                lHeard = (heardLinkIds[lh] == link.id);
            }
            heardLinkIds.push(link.id);

            if (lHeard || (link.linkType !== linkType)) {
                continue;
            }
            if (linkFilter && (!linkFilter(link))) {
                continue;
            }
            for (var l = linkIdStartPlace; l < link.ids.length; ++l) {
                var linkSnap = link.get(l);
                if ((!linkSnap.active) || (linkSnap.simple)) {
                    continue;
                }
                snaps.push(linkSnap);
            }
        }
        links = [];

        snaps = _.uniq(snaps);
        for (var s = 0; s < snaps.length; ++s) {
            var snap = snaps[s];
            var sHeard = false;
            for (var sh = 0; (!sHeard) && sh < heardSnapIds.length; ++sh) {
                sHeard = (heardSnapIds[sh] == snap.id);
            }
            heardSnapIds.push(snap.id);

            if ( !snap.active || snap.simple || (snapFilter && !snapFilter(snap))) {
                continue;
            }
            if (!sHeard) {
                snap.dispatch(message, meta);
            }
            switch (linkType) {
                case 'semantic':
                    for (var sl = 0; sl < snap.links.length; ++sl) {
                        var slink = snap.links[sl];
                        if (slink.ids[0] == snap.id) {
                            links.push(slink);
                        }
                    }
                    break;

                case 'node':
                    for (var sl = 0; sl < snap.links.length; ++sl) {
                        var slink = snap.links[sl];
                        if (slink.ids[0] == snap.id) {
               //             console.log('adding link %s from %s', slink.ids.join(','), snap.id);
                            links.push(slink);
                        }
                    }
                    break;

                default:
                    throw 'not set up to send impulse to other networks yet...';
            }
        }
        snaps = [];

    }

};