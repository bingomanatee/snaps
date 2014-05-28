var attrNames = 'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,data,datetime,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,for,form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,manifest,max,maxlength,media,method,min,multiple,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,pubdate,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,seamless,selected,shape,size,sizes,span,spellcheck,src,srcdoc,srclang,start,step,style,summary,tabindex,target,title,type,usemap,value,width,wrap'
var _attrs = _.reduce(attrNames.split(','), function (out, p) {
    out[p] = true;
    return out
}, {});
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
 * BrowserDom is an element bridge between a DOM element
 * and properties of a snap instance.
 *
 * @param space {SNAPS.Space}
 * @param props {Object}
 * @constructor
 */

SNAPS.BrowserDom = function (space, props) {
    this.space = space;
    this.attrSnap = space.snap();

  //  var rel = this.attrSnap.rel('style', space.snap());
    this.styleSnap = space.snap();

    this.tagName = props.tagName || 'div';
    delete props.tagName;

    this.element = this.e = props.element || document.createElement(this.tagName);
    this.initOutput();
    delete props.watchedProps;

    if (props.addElement) {
        if (props.addElement === true) {
            this.addElement();
        } else {
            var parent = props.addElement.$TYPE == SNAPS.BrowserDom.prototype.$TYPE ? props.addElement.element : props.addElement;
            this.addElement(parent);
        }
        delete props.addElement;
    }

    for (var p in props) {
        if (_htmlRE.test(p)){
            this.h(props[p]);
        } else {
            var pp = p.toLowerCase();
            if (_styleOverrides[pp]) {
                this.styleSnap.set(pp, props[p]);
            } else if (_attrs[pp]) {
                this.attrSnap.set(pp, props[p]);
            } else {
                this.styleSnap.set(pp, props[p]);
            }
        }
    }
};

SNAPS.BrowserDom.prototype.$TYPE = 'BROWSERDOM';

function _styleSnapChanges() {
    var changes = this.styleSnap.lastChanges;
    //console.log('style changes: ', changes);
    for (var p in changes) {
        var value = this.styleSnap.get(p);

        if (value === SNAPS.DELETE) {
            this.element.style.removeProperty(p);
        } else {
            console.log('setting dom ', p, 'to', value);
            this.s(p, value);
        }
    }
}

function _attrSnapChanges() {
    for (var p in this.attrSnap.lastChanges) {
        var value = this.attrSnap.lastChanges[p].pending;

        if (value === SNAPS.DELETE) {
            this.element.removeAttribute(p);
        } else {
            this.a(p, value);
        }
    }
}

SNAPS.BrowserDom.prototype.initOutput = function () {
    this.attrSnap.listen('output', _attrSnapChanges, this);
    this.styleSnap.listen('output', _styleSnapChanges, this);
};

SNAPS.BrowserDom.prototype.set = function (prop, value) {
    this.attrSnap.set(prop, value);
};

SNAPS.BrowserDom.prototype.merge = function (prop, value, c) {
    this.attrSnap.merge(prop, value, c);
};

SNAPS.BrowserDom.prototype.setStyle = function (prop, value) {
    this.styleSnap.set(prop, value);
};

SNAPS.BrowserDom.prototype.destroy = function (prop, value) {
    this.removeElement();
    this.attrSnap.destroy();
    this.styleSnap.destroy();
    if (this.dataSnap){
        this.dataSnap.destroy();
    }
};
