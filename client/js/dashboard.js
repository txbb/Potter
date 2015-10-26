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
    disableBtns(['table', 'color', 'textalign', 'img', 'link', 'icon']);
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
                    disableBtns(['table', 'color', 'textalign', 'img', 'link', 'icon']);
                },
                cancel: function(){}
            });
        }
    }).on('focus', 'section', function(e) {
        var _this = $(this);
        var tar = $(e.target);
        if (tar.parent().hasClass('j-section-body')) {
            lastFocusDom = tar[0];
            enableBtns(['table', 'color', 'textalign', 'img', 'link', 'icon']);
        } else if(tar.parent()[0].nodeName === 'TD') {
            lastFocusDom = tar[0];
            enableBtns(['color', 'textalign', 'link', 'icon']);
            disableBtns(['table', 'img']);
        } else if(tar.parent().hasClass('j-text-body')){
            lastFocusDom = tar[0];
            enableBtns(['color', 'link', 'icon']);
            disableBtns(['table', 'img', 'textalign']);
        } else {
            disableBtns(['table', 'color', 'textalign', 'img', 'link', 'icon']);
        }
    }).on('click', 'a', function(e){
        e.preventDefault();
    });

    var win = $(window);
    win.on('resize', onScreenSizeChange);

    var table = $('#Table');
    var cells = table.find('.cell');
    function highlightCell(row, cell) {
        setTimeout(function(){
            cells.each(function(){
                var _this = $(this);
                var p = _this.parent();
                var rowNo = p.data('value');
                var cellNo = _this.data('value');
                if (rowNo <= row && cellNo <= cell) {
                    _this.addClass('active');
                } else {
                    _this.removeClass('active');
                }
            });
        }, 20);
    }
    cells.on('mouseover', function(e){
        var tar = $(e.target);
        var p = tar.parent();
        var rowNo = p.data('value');
        var cellNo = tar.data('value');
        console.log('mouseover',tar);
        highlightCell(rowNo, cellNo);
        // tar.addClass('active');
    }).on('mousedown', function(e){
        var tar = $(e.target);
        var p = tar.parent();
        var rowNo = p.data('value');
        var cellNo = tar.data('value');
        insertTable(rowNo, cellNo);
    });
    table.on('mouseleave', function(){
        cells.removeClass('active');
    });
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
        case 'index':
            insertIndexedSection();
            break;
        case 'subpanel':
            $(tar).parent().parent().children().removeClass('active');
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
        case 'textalign':
            setTextAlign(tar.dataset.value);
            break;
        case 'seticon':
            setIcon(tar.dataset.value);
            break;
        case 'upload':
            var files = $(tar).prev('input')[0].files;
            uploadImage(files);
            break;
        default:
            Txbb.Pop('toast', optName + ' 操作尚未开发');
            break;
    }
}

function setIcon(src) {
    var selection = getSelection();
    if (selection.type != 'Caret') {
        Txbb.Pop('toast', '请选择插入图标的位置');
    } else {
        var focusNode = selection.focusNode;
        var anchorOffset = 0;
        var value = '';
        var parentNode = null;
        if (focusNode.nodeType === 3) {
            anchorOffset = selection.anchorOffset;
            parentNode = focusNode.parentNode;
            value = parentNode.innerHTML.substring(0, anchorOffset) + '<img class="icon" src="'+src+'"/>' + parentNode.innerHTML.substring(anchorOffset, parentNode.innerHTML.length);
        } else if (focusNode.nodeType === 1) {
            parentNode = focusNode;
            value = '<img class="icon" src="'+src+'"/>';
        }
        parentNode.innerHTML = value;
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
        lastFocusDom.innerHTML = lastFocusDom.innerHTML + '<a href="'+ linkHref +'">' + linkName + '</a>';
    }
}

function setTextAlign(value) {
    var selection = getSelection();
    var node = selection.focusNode;
    if (node.nodeType === 3) {
        node.parentNode.style.textAlign = value;
    } else if (node.nodeType === 1) {
        node.style.textAlign = value;
    }
}

function disableBtns(optNameArr) {
    optBtns.forEach(function(elem) {
        if (optNameArr.indexOf(elem.dataset.type) > -1) {
            elem.classList.add('disabled');
            elem.classList.remove('active');
        }
    });
}

function enableBtns(optNameArr) {
    optBtns.forEach(function(elem) {
        if (optNameArr.indexOf(elem.dataset.type) > -1) {
            elem.classList.remove('disabled');
            elem.classList.remove('active');
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

function insertTable(rowNo, cellNo) {
    var tmpl = '<table cellPadding="0" cellSpacing="0"> \
        <thead> \
            {{theads}} \
        </thead> \
        <tbody> \
            {{trs}} \
        </tbody> \
    </table>';

    var theads = '<tr>';
    for (var c=1; c<= cellNo; c++) {
        theads += '<td><div contenteditable>标题</div></td>';
    }
    theads += '</tr>';

    var tbody = '';
    for (var r=2; r<=rowNo; r++) {
        tbody += '<tr>';
        for (c=1; c<= cellNo; c++) {
            tbody += '<td><div contenteditable>内容</div></td>';
        }
        tbody += '</tr>';
    }

    tmpl = tmpl.replace('{{theads}}', theads)
               .replace('{{trs}}', tbody);

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
        <div class="body j-text-body"> \
            <div contenteditable>在这里写答案</div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

function insertIndexedSection() {
    var tmpl = '<section class="indexed"> \
        <div class="ol j-text-body" contenteditable> \
            <div>在这里编写内容</div> \
            <div>在这里编写内容</div> \
            <div>在这里编写内容</div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

function autoSave() {
    // TODO: 自动保存
}

function loadSave() {
    // TODO: 加载自动保存区的内容
}

function preView() {
    // TODO: 预览
}

function post() {
    // TODO: 提交
}

function uploadImage(files) {
    // 上传图片
    if (!files.length) {
        return;
    }
    var file = files[0];
    Meteor.call('getUptToken', function(err, token) {
        if (!err) {
            var form = new FormData();
            form.append('token', 'iN7NgwM31j4-BZacMjPrOQBs34UG1maYCAQmhdCV:ok3U4MYW6GTOPq7x4itxwOl2P-Q=:eyJzY29wZSI6InF0ZXN0YnVja2V0IiwiZGVhZGxpbmUiOjE0NDU4NjMzNTR9');
            form.append('file', file);
            // form.append('key', 'zysmedia');
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                console.log('statechange', req);
            };
            req.open('POST', 'http://upload.qiniu.com/');
            req.send(form);
        }
    });
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
        rowNumber : [1,2,3,4,5,6,7,8],
        cellNumber : [1,2,3,4,5,6,7,8]
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
