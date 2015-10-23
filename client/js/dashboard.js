/* jshint multistr:true */

var domWorkspace;
var domEditor;
var domArticleContent;
var optBtns;

function init() {
    onScreenSizeChange();
    disableBtns(['table', 'color', 'left', 'middle', 'right', 'img', 'links']);
    domEditor.innerHTML = '<div class="article"><div class="article-header"> \
        <div contenteditable>在此处编辑页面标题</div> \
        </div> \
        <div class="article-content"> \
        </div> \
    </div>';
    domArticleContent = domEditor.firstChild.children[1];
    eventBind();
    fetchData();
}

function fetchData() {
    var back = [];
    for (var key in window.data.themes) {
        back.push(window.data.themes[key]);
    }
    Session.set('themes', back);

    Session.set('files', window.data.files);

    Session.set('activeTab', 0);
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
            if (confirm('确定删除此区块么?')) {
                _this.remove();
                disableBtns(['table']);
            }
        }
    }).on('focus', 'section', function(e) {
        var _this = $(this);
        var tar = $(e.target);
        if (tar.parent().hasClass('j-section-body')) {
            enableBtns(['table']);
        } else {
            disableBtns(['table']);
        }
    });
}

// 执行具体的点按工具按钮操作
function handleOperation(optName) {
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
        default:
            alert(optName + ' 操作尚未开发');
            break;
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

function setColor() {
    
}

Template.dashboard.onRendered(function(){
    domWorkspace = this.find('.workspace');
    domEditor = this.find('.editor');
    optBtns = this.findAll('.toolbar .item');
    init();
});

Template.dashboard.events({
    'mousedown .toolbar .j-opt' : function(event, template) {
        var target = event.target;
        if (!target.classList.contains('disabled')) {
            handleOperation(target.dataset.type);
        }
        event.preventDefault();
    },
    'click .nav-tabs li' : function(event, template) {
        var target = event.target;
        console.log(target.dataset.index);
        var index = parseInt(target.dataset.index);
        Session.set('activeTab', index);
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
    }
});
