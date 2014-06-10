var attrNames = 'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,data,datetime,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,for,form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,manifest,max,maxlength,media,method,min,multiple,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,pubdate,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,seamless,selected,shape,size,sizes,span,spellcheck,src,srcdoc,srclang,start,step,style,summary,tabindex,target,title,type,usemap,value,width,wrap'
var _attrs = _.reduce(attrNames.split(','), function (out, p) {
    out[p] = true;
    return out
}, {});

var dataRE = /^data-/i;

/**
 * the above values are all known attrs;
 * however there are some attrs that are also elements and those attrs
 * (and for whom it is more common for them to be elements than attributes)
 * are overridden with the list below.
 */
var _styleOverrides = {
    color: true,
    width: true,
    height: true
};

var _htmlRE = /html|content/i;

/**
 * these are properties for which if numbers are provide a 'px' should be suffixed
 */
var _pxProps = _.reduce('border-bottom-width,border-left-width,border-radius,border-right-width,border-top-width,border-width,bottom,column-rule-width,column-width,columns,height,left,letter-spacing,line-height,margin,margin-bottom,margin-left,margin-right,margin-top,max-height,max-width,min-height,min-width,nav-down,nav-index,nav-left,nav-right,nav-up,outline-width,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,right,tab-size,text-indent,text-justify,top,width'.split(','),
    function (out, p) {
        out[p] = true;
        return out;
    }, {});

function _styleSnapChanges () {
    var state = this.styleSnap.state();
    this.s(state);
}

function _attrSnapChanges () {
    for (var p in this.attrSnap.lastChanges) {
        var value = this.attrSnap.lastChanges[p].pending;

        if (value === SNAPS.DELETE) {
            this.e().removeAttribute(p);
        } else {
            this.a(p, value);
        }
    }
}

//@TODO: is this async?
DomElement.prototype.element = DomElement.prototype.e = function () {
    if (!this._element) {
        if (typeof (document) == 'undefined') {
            if (this.space.document) {
                this._element = this.space.document.createElement(this.domNodeName());
                this.dispatch('element', this._element);
            } else {
                // this may not work if env is async....
                SNAPS.jsdom = require('jsdom');
                var self = this;

                SNAPS.jsdom.env(
                    '<html><body></body></html>',
                    [],
                    function (errors, w) {
                        window = w;
                        self.space.window = w;
                        self.space.document = window.document;
                        self.element = space.document.createElement(self.domNodeName());
                        self.dispatch('element', self.element);
                    }
                );
            }
        } else {
            this.window = window; // global
            this.document = document; // global
            this._element = document.createElement(this.domNodeName());
        }
    }
    return this._element;
};

DomElement.prototype.style = function (prop, value, immediate) {
    if (typeof(prop) == 'object') {
        for (var p in prop) {
            this.styleSnap.set(p, prop[p]);
        }
    } else if (arguments.length < 2) {
        return this.styleSnap.get(prop);
    } else {
        this.styleSnap.set(prop, value);
        if (this.space.isUpdating()) {
            this.s(prop, value);
        }
    }
    return this;
};

DomElement.prototype.h = DomElement.prototype.html = function (innerhtml) {
    if (arguments.length > 0) {
        if (this.hasDomChildren()) {
            throw new Error('attempting to add content to a browserDom snap with domChildren');
        }

        this.e().innerHTML = innerhtml;
        return this;
    } else {
        return this.e().innerHTML;
    }
};

DomElement.prototype.a = function (prop, value) {
    if (dataRE.test(prop)) {
        var args = _.toArray(arguments);
        return this.d.apply(this, args);
    }
    if (arguments.length > 1) {
        this.e().setAttribute(prop, value);
        return this;
    } else if (typeof prop == 'object') {
        for (var p in prop) {
            this.e().setAttribute(p, prop[p]);
        }
    } else {
        return this.e().getAttribute(prop);
    }
};

/**
 * directly write to the domElements's style. This for the most part should be done
 * through the snap system.
 *
 * parameters can be:
 *  -- prop (returns elements current value)
 *  -- prop, value
 *  -- prop, value, unit
 *  -- config object (prop/value pairs)
 *  -- config, unit
 *
 */
DomElement.prototype.s = function () {

    var args = _.toArray(arguments);
    var prop = args[0];
    var value;
    if (_.isArray(prop)) {
        value = prop[1];
        prop = prop[0];
    }
    if (typeof(prop) == 'object') {

        // this recursive call allows for a config object with subsequent arguments.
        _.each(prop, function (value, prop) {
            if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
                var unit = 'px';
                value = Math.round(value) + unit;
            }
            this.e().style[prop] = value;
        }, this);
        return this;
    } else if (args.length > 1) {
        value = args[1];

        // append 'px' (pixels) to numeric properties that require numeric units
        if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
            var unit;
            if (args.length > 2) {
                unit = args[2]
            } else {
                unit = 'px';
            }
            value = Math.round(value) + unit;
        }
        this.e().style[prop] = value;
        return this;
    } else {
        return this.e().style[prop];
    }
};
