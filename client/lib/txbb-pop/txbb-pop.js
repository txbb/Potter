/**
 * Txbb.Pop 组件
 *
 * 同学帮帮弹出层组件
 * 0.2.2
 * by zhangyang
 */
(function(factory) {
    'use strict';

    if (typeof define !== 'undefined' && define.amd) {
        define('Txbb/Pop', function() {
            return factory.call(null);
        });
    } else {
        if (!window.Txbb) window.Txbb = {};
        window.Txbb.Pop = factory.call(null);
    }

}(function() {
    'use strict';

    // helps
    function q(s) {return document.querySelector(s);}
    function elem(nodeType, attrs) {
        var node = document.createElement(nodeType);
        if (attrs) {
            for (var k in attrs) {
                node[k] = attrs[k];
            }
        }
        return node;
    }
    function extend(origin, extendObj) {
        var back = {};
        if (origin) {
            for (var k1 in origin) {
                back[k1] = origin[k1];
            }
        }
        if (extendObj) {
            for (var k2 in extendObj) {
                back[k2] = extendObj[k2];
            }
        }
        return back;
    }
    Element.prototype._css = function (attrs) {
        if (!this) return this;
        if (attrs) {
            for (var k in attrs) {
                if (this.style.hasOwnProperty(k))
                    this.style[k] = attrs[k];
            }
        }
        return this;
    };
    Element.prototype._attr = function (attrs) {
        if (!this) return this;

        if (attrs && typeof attrs === 'object') {
            for (var k in attrs) {
                this.setAttribute(k, attrs[k]);
            }
        }

        if (attrs && typeof attrs === 'string') return this.getAttribute(attrs);

        return this;
    };
    Element.prototype._remove = function() {
        this.parentNode.removeChild(this);
    };
    Element.prototype._show = function() {
        this.style.display = 'block';
    };
    Element.prototype._hide = function() {
        this.style.display = 'none';
    };
    Element.prototype._addEvent = function(eventNames, handler) {
        var events = eventNames.split(/\s+/);
        var _this = this;
        events.forEach(function(evt) {
            _this.addEventListener(evt, handler, false);
        });
        return _this;
    };
    Element.prototype._offset = function() {
        var offset = {
            left: 0,
            top: 0
        };
        var dom = this;
        while (dom && dom !== document.body) {
            offset.left += dom.offsetLeft;
            offset.top += dom.offsetTop;
            dom = dom.offsetParent; // 0.1.1 修复 _offset 方法错误
        }
        return offset;
    };

    /*-------------- 华丽丽的分割线 ---------------*/
    var empty = function(){};
    var toastTiming;
    var toastStyle = {
        'box-sizing': 'border-box',
        'width': '260px',
        'background-color': 'rgba(0,0,0,.8)',
        'color': '#fff',
        'font-size': '16px',
        'border-radius': '4px',
        'position': 'absolute',
        'top': '30%',
        'left': '50%',
        'margin-top': '-40px',
        'margin-left': '-130px',
        'text-align': 'center',
        'line-height' : '1.4',
        'padding' : '2em 1em',
        'z-index': 10
    };

    function hideToast() {
        toastTiming = setTimeout(function(){
            q('#J-TxbbToast')._css({
                'opacity' : 0,
                '-webkit-transition' : 'opacity 1s linear'
            });
            toastTiming = setTimeout(function(){
                q('#J-TxbbToast')._remove();
            }, 1000);
        }, 1000);
    }

    function toast(msg) {
        if (q('#J-TxbbToast')) {
            clearTimeout(toastTiming);
            q('#J-TxbbToast')._css({
                'opacity' : 1,
                '-webkit-transition' : 'none'
            }).innerHTML = msg;
            hideToast();
            return;
        }

        var div = elem('div', {id : 'J-TxbbToast'});
        div._css(toastStyle).innerHTML = msg;
        document.body.appendChild(div);
        hideToast();
    }

    var overlayStyle = {
        'position' : 'fixed',
        'width' : '100%',
        'height' : '100%',
        'top' : 0,
        'left' : 0,
        'z-index' : 10,
        'background-color' : 'rgba(0,0,0,.7)'
    };
    var modalStyle = {
        'width' : '300px',
        'background-color' : 'white',
        'border-radius' : '4px',
        'padding' : '10px',
        'margin-top': '-150px',
        'margin-left': '-150px',
        'position' : 'absolute',
        'left' : '50%',
        'top' : '50%',
        'box-sizing' : 'border-box',
        'opacity' : 0,
        '-webkit-transform' : 'scale(0.7)',
        'z-index' : 10,
        '-webkit-transition' : 'all .2s ease'
    };
    var titleStyle = {
        'margin': '-10px -10px 0 -10px',
        'font-size' : '18px',
        'line-height' : '2.4',
        'text-align' : 'center',
        'font-weight': 'normal',
        'color' : '#333'
    };
    var btnStyle = {
        'line-height': 1,
        'font-size' : '14px',
        'color' : '#fff',
        'border': 'none',
        'padding' : '.8em 0',
        'border-radius' : '2px',
        'display' : 'inline-block',
        'outline' : 'none',
        'width' : '100px',
        'margin' : '0 5px'
    };
    var okBtnStyle = {
        'background-color' : '#9bce2d'
    };
    var cancelBtnStyle = {
        'background-color' : '#fd6e41'
    };
    var actionStyle = {
        'padding' : '10px',
        'text-align' : 'center',
        'margin' : '0 -10px -10px -10px'
    };
    var bodyStyle = {
        'max-height' : '200px',
        'overflow-y' : 'auto',
        'font-size' : '14px',
        'text-align' : 'center',
        '-webkit-overflow-scrolling': 'touch'
    };
    var modalOptions = {
        title: '',
        body: '',
        ok: empty,
        cancel: null,
        okText: '确定',
        cancelText: '取消'
    };

    function hideModal() {
        var wrap = q('#J-TxbbModal');
        wrap.firstChild._css({
            '-webkit-transform' : 'scale(.6)',
            'opacity' : 0
        });
        setTimeout(function() {
            wrap._remove();
        }, 300);
    }

    function modal(o) {
        var options = extend(modalOptions, o);
        var title = options.title;
        var body = options.body;
        var okText = options.okText;
        var cancelText = options.cancelText;
        var okCb = options.ok;
        var cancelCb = options.cancel;
        var id = 'J-TxbbModal';

        var wrap = q('#' + id);

        if (wrap) {
            wrap.innerHTML = '';
        } else {
            wrap = elem('div', {id : id});
            wrap._css(overlayStyle);
            document.body.appendChild(wrap);
            wrap._addEvent('touchmove', function(e) {
                if (e.target.id === id)
                    e.preventDefault();
            })._addEvent('click', function(e) {
                if (e.target.id === id)
                    hideModal();
            });
        }

        var modalElem = elem('div');
        modalElem._css(modalStyle);
        wrap.appendChild(modalElem);

        if (title) {
            var titleElem = elem('h1', {innerHTML : title});
            titleElem._css(titleStyle);
            modalElem.appendChild(titleElem);
        }

        var btnOk = elem('button', {innerHTML : okText});
        btnOk._css(extend(btnStyle, okBtnStyle));
        btnOk._addEvent('click', function(){
            var result = okCb(modalElem);
            if (result !== false)
                hideModal();
        });

        var actionElem = elem('div');
        actionElem._css(actionStyle);
        actionElem.appendChild(btnOk);

        if (cancelCb) {
            var btnCancel = elem('button', {innerHTML : cancelText});
            btnCancel._css(extend(btnStyle, cancelBtnStyle));
            btnCancel._addEvent('click', function(){
                if (cancelCb) cancelCb(modalElem);
                hideModal();
            });
            actionElem.appendChild(btnCancel);
        }

        var bodyElem;

        if (typeof body === 'object' && body.innerHTML) {
            bodyElem = elem('div', {innerHTML : body.innerHTML});
        } else {
            bodyElem = elem('div', {innerHTML : body});
        }

        bodyElem._addEvent('touchend', function(e) {
            e.preventDefault();
        });

        modalElem.appendChild(bodyElem);
        modalElem.appendChild(actionElem);
        
        setTimeout(function() {
            modalElem._css({
                '-webkit-transform' : 'scale(1)',
                'opacity' : 1
            });
            if (bodyElem.offsetHeight >= 200) {
                bodyElem._css(extend(bodyStyle, {
                    'border-top' : '1px solid #eee',
                    'border-bottom' : '1px solid #eee'
                }));
            } else {
                bodyElem._css(bodyStyle);
            }
        }, 100);
    }

    return function(name, options) {
        if (name === 'toast') {
            toast(options);
            return;
        }

        if (name === 'modal') {
            modal(options);
            return;
        }
    };
}));
