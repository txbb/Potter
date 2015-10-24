/* jshint multistr:true */

var domWorkspace;
var domEditor;
var domArticleContent;
var domEditArea;
var optBtns;

// 暂存上一次 focus 的区块
var lastFocusDom = null;

function init() {
    onScreenSizeChange();
    disableBtns(['table', 'color', 'textalign', 'img', 'link']);
    domEditor.innerHTML = '<div class="article-header"> \
        <div contenteditable>在此处编辑页面标题</div> \
        </div> \
        <div class="article-content"> \
        </div>';
    domArticleContent = domEditor.children[1];
    eventBind();
    fetchData();
}

function fetchData() {
    var back = [];
    var themes = window.data.themes;
    for (var key in themes) {
        back.push(window.data.themes[key]);
    }
    Session.setDefault('themesMap', themes);
    Session.setDefault('themes', back);
    Session.setDefault('files', window.data.files);
    Session.setDefault('currentThemeKey', back[0].key);
}

function onScreenSizeChange() {
    domWorkspace.style.height = parseInt(window.innerHeight - 44) + 'px';
}

function getSelection() {
    return window.getSelection();
}

// 主要事件绑定
function eventBind() {
    var ctn = $(domArticleContent);
    ctn.on('click', 'section', function(e) {
        var _this = $(this);
        if (e.target.nodeName.toUpperCase() === 'SECTION') {
            Txbb.Pop('modal', {
                title : '提示',
                body : '确认删除此区块么?',
                ok: function(){
                    _this.remove();
                    disableBtns(['table', 'color', 'textalign', 'img', 'link']);
                },
                cancel: function(){}
            });
        }
    }).on('focus', 'section', function(e) {
        var _this = $(this);
        var tar = $(e.target);
        if (tar.parent().hasClass('j-section-body')) {
            lastFocusDom = tar[0];
            enableBtns(['table', 'color', 'textalign', 'img', 'link']);
        } else {
            disableBtns(['table', 'color', 'textalign', 'img', 'link']);
        }
    });

    var win = $(window);
    win.on('resize', onScreenSizeChange);
}

// 执行具体的点按工具按钮操作
function handleOperation(tar, optName) {
    switch(optName) {
        case 'section':
            insertNewSection();
            break;
        case 'qa':
            insertQa();
            break;
        case 'table':
            insertTable();
            break;
        case 'index':
            insertIndexedSection();
            break;
        case 'subpanel':
            tar.parentNode.classList.toggle('active');
            break;
        case 'setcolor':
            setSelectionClass(tar.dataset.role);
            break;
        case 'setlink':
            var p = tar.parentNode;
            var toggleWrap = p.parentNode.parentNode;
            var name = p.children[0].value;
            var href = p.children[1].value;
            if (name && href) {
                setLink(name, href);
                p.children[0].value = '';
                p.children[1].value = '';
                toggleWrap.classList.remove('active');
            } else {
                Txbb.Pop('toast', '请输入合法字符');
            }
            break;
        default:
            Txbb.Pop('toast', optName + ' 操作尚未开发');
            break;
    }
}

function setSelectionClass(className) {
    var selection = getSelection();
    if (selection.type != 'Range') {
        Txbb.Pop('toast', '请选中文本');
    } else {
        var text = selection.focusNode.parentNode.innerHTML;
        var startPos = selection.baseOffset;
        var endPos = selection.extentOffset;
        if (selection.baseOffset > selection.extentOffset) {
            startPos = selection.extentOffset;
            endPos = selection.baseOffset;
        }
        var targetText = text.slice(startPos, endPos);
        text = text.substring(0, startPos) + '<span class="'+ className +'">'+ targetText +'</span>' + text.substring(endPos);
        selection.focusNode.parentNode.innerHTML = text;
    }
}

function setLink(linkName, linkHref) {
    if (lastFocusDom) {
        console.log(lastFocusDom, lastFocusDom.innerHTML);
        lastFocusDom.innerHTML = lastFocusDom.innerHTML + '<a href="'+ linkHref +'">' + linkName + '</a>';
        console.log(lastFocusDom.innerHTML);
    }
}

function disableBtns(optNameArr) {
    optBtns.forEach(function(elem) {
        if (optNameArr.indexOf(elem.dataset.type) > -1) {
            elem.classList.add('disabled');
        }
    });
}

function enableBtns(optNameArr) {
    optBtns.forEach(function(elem) {
        if (optNameArr.indexOf(elem.dataset.type) > -1) {
            elem.classList.remove('disabled');
        }
    });
}

function getParentEditable(dom) {
    if (dom.hasAttribute && dom.hasAttribute('contenteditable')) {
        return dom;
    } else {
        dom = dom.parentNode;
        while(!dom.hasAttribute('contenteditable')) {
            dom = dom.parentNode;
        }
        return dom;
    }
}

function insertNewSection() {
    var tmpl = '<section class="section"> \
        <h1 class="title"><div contenteditable>在此处编辑区块标题</div></h1> \
        <div class="body j-section-body"> \
            <div contenteditable> \
                <div>在此处编辑区块内容</div> \
            </div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

function insertTable() {
    var tmpl = '<table cellPadding="0" cellSpacing="0"> \
        <thead> \
            <tr> \
                <td><div contenteditable>标题1</div></td> \
                <td><div contenteditable>标题2</div></td> \
                <td><div contenteditable>标题3</div></td> \
                <td><div contenteditable>标题4</div></td> \
            </tr> \
        </thead> \
        <tbody> \
            <tr> \
                <td><div contenteditable>内容1</div></td> \
                <td><div contenteditable>内容1</div></td> \
                <td><div contenteditable>内容1</div></td> \
                <td><div contenteditable>内容1</div></td> \
            </tr> \
            <tr> \
                <td><div contenteditable>内容2</div></td> \
                <td><div contenteditable>内容2</div></td> \
                <td><div contenteditable>内容2</div></td> \
                <td><div contenteditable>内容2</div></td> \
            </tr> \
        </tbody> \
    </table>';
    var selection = getSelection();
    var dom = selection.focusNode;
    var ctn = getParentEditable(dom);
    var parent = ctn.parentNode.parentNode;
    parent.removeChild(parent.children[1]);
    parent.innerHTML = parent.innerHTML + tmpl;
}

function insertQa() {
    var tmpl = '<section class="qa-item"> \
        <div class="title"> \
            <div contenteditable>在这里写问题</div> \
        </div> \
        <div class="body"> \
            <div contenteditable>在这里写答案</div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

function insertIndexedSection() {
    var tmpl = '<section class="indexed"> \
        <div class="ol" contenteditable> \
            <div>在这里编写内容</div> \
            <div>在这里编写内容</div> \
            <div>在这里编写内容</div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

Template.dashboard.onRendered(function(){
    domWorkspace = this.find('.workspace');
    domEditor = this.find('.editor > .article');
    optBtns = this.findAll('.toolbar .item');
    domEditArea = this.find('.editarea');
    init();
});

Template.dashboard.events({
    'mousedown .toolbar .j-opt' : function(event, template) {
        var target = event.target;
        if ((target.dataset.type === 'subpanel' && !target.parentNode.classList.contains('disabled')) ||
            (!target.classList.contains('disabled') && target.dataset.type !== 'subpanel')) {
            handleOperation(target, target.dataset.type);
        }
        event.preventDefault();
        event.stopPropagation();
    },
    'click .nav-tabs li' : function(event, template) {
        var target = event.target;
        var index = parseInt(target.dataset.index);
        Session.set('activeTab', index);
    },
    'change #ThemeSelect' : function(event, template) {
        var target = event.target;
        var themeKey = target.options[target.selectedIndex].value;
        Session.set('currentThemeKey', themeKey);
    },
    'click #BtnCreate' : function(event) {
        domEditArea.classList.add('on');
    }
});

Template.dashboard.helpers({
    tableConfig: {
        rowNumber : [1,1,1,1,1,1,1,1],
        cellNumber : [1,1,1,1,1,1,1,1]
    },
    themes: function(){
        return Session.get('themes');
    },
    files: function(){
        return Session.get('files');
    },
    activeTab: function(){
        return Session.get('activeTab');
    },
    currentTheme: function(){
        var themesMap = Session.get('themesMap');
        var key = Session.get('currentThemeKey');
        if (key === 'C') {
            Session.set('activeTab', 0);
        } else if (key === 'B'){
            Session.set('activeTab', 1);
        }
        if (themesMap && key) {
            return themesMap[key];
        }
        return {};
    }
});
