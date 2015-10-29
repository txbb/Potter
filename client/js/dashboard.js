/* jshint multistr:true */

var domWorkspace;
var domEditor;
var domArticleContent;
var domEditArea;
var optBtns;

// 暂存上一次 focus 的区块
var lastFocusDom = null;

// 初始化
function init() {
    onScreenSizeChange();
    disableBtns(['table', 'color', 'textalign', 'img', 'link', 'icon']);
    Meteor.call('getThemes', function(err, themes) {
        Session.set('themes', themes);
    });
    getFiles();
}

// 新建页面
function newPage(text) {
    if (typeof text === 'string') {
        domEditor.children[0].innerHTML = text;
        $(domEditor.children[0]).find('.j-ctn').attr('contenteditable', true);
    } else {
        domEditor.children[0].innerHTML = '<div class="article-header"> \
            <div contenteditable class="j-ctn">在此处编辑页面标题</div> \
            </div> \
            <div class="article-content"> \
            </div>';
    }
    domArticleContent = domEditor.children[0].children[1];
    domArticleContent.style.height = parseInt(domArticleContent.parentNode.offsetHeight - domArticleContent.parentNode.children[0].offsetHeight) + 'px';
    domEditArea.classList.add('on');
    eventBind();
}

// 屏幕大小变化事件
function onScreenSizeChange() {
    domWorkspace.style.height = parseInt(window.innerHeight - 44) + 'px';
}

// 获得当前选择的对象
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
        highlightCell(rowNo, cellNo);
    }).on('mousedown', function(e){
        var tar = $(e.target);
        var p = tar.parent();
        var rowNo = p.data('value');
        var cellNo = tar.data('value');
        insertTable(rowNo, cellNo);
        tar.parents('[data-type=table]').removeClass('active');
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
            $('[data-type=subpanel]').parent().removeClass('active');
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
            insertImage(tar.dataset.value, 'icon');
            break;
        case 'upload':
            var input = $(tar).prev('input');
            var files = input[0].files;
            uploadImage(files);
            input.val('');
            $(tar).parent().parent().parent().removeClass('active');
            break;
        default:
            Txbb.Pop('toast', optName + ' 操作尚未开发');
            break;
    }
}

// 插入图片、图标
function insertImage(src, className) {
    var selection = getSelection();
    if (selection.type != 'Caret') {
        Txbb.Pop('toast', '请选择插入位置');
    } else {
        var focusNode = selection.focusNode;
        var anchorOffset = 0;
        var value = '';
        var parentNode = null;
        var imgText = '<img class="'+ (className ? className : 'image') +'" src="'+src+'"/>';
        if (focusNode.nodeType === 3) {
            anchorOffset = selection.anchorOffset;
            parentNode = focusNode.parentNode;
            value = parentNode.innerHTML.substring(0, anchorOffset) + imgText + parentNode.innerHTML.substring(anchorOffset, parentNode.innerHTML.length);
        } else if (focusNode.nodeType === 1) {
            parentNode = focusNode;
            value = imgText;
        }
        parentNode.innerHTML = value;
    }
}

// 设置文本颜色
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

// 添加链接
function setLink(linkName, linkHref) {
    if (lastFocusDom) {
        lastFocusDom.innerHTML = lastFocusDom.innerHTML + '<a href="'+ linkHref +'">' + linkName + '</a>';
    }
}

// 设置文本位置
function setTextAlign(value) {
    var selection = getSelection();
    var node = selection.focusNode;
    if (node.nodeType === 3) {
        node.parentNode.style.textAlign = value;
    } else if (node.nodeType === 1) {
        node.style.textAlign = value;
    }
}

// 禁用操作
function disableBtns(optNameArr) {
    optBtns.forEach(function(elem) {
        if (optNameArr.indexOf(elem.dataset.type) > -1) {
            elem.classList.add('disabled');
            elem.classList.remove('active');
        }
    });
}

// 启用操作
function enableBtns(optNameArr) {
    optBtns.forEach(function(elem) {
        if (optNameArr.indexOf(elem.dataset.type) > -1) {
            elem.classList.remove('disabled');
            elem.classList.remove('active');
        }
    });
}

// 获得node的父级可编辑区
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

// 插入新章节
function insertNewSection() {
    var tmpl = '<section class="section"> \
        <h1 class="title"><div contenteditable class="j-ctn">在此处编辑区块标题</div></h1> \
        <div class="body j-section-body"> \
            <div contenteditable class="j-ctn"> \
                <div>在此处编辑区块内容</div> \
            </div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

// 插入表格
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
        theads += '<td><div contenteditable class="j-ctn">标题</div></td>';
    }
    theads += '</tr>';

    var tbody = '';
    for (var r=2; r<=rowNo; r++) {
        tbody += '<tr>';
        for (c=1; c<= cellNo; c++) {
            tbody += '<td><div contenteditable class="j-ctn">内容</div></td>';
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

// 插入问答
function insertQa() {
    var tmpl = '<section class="qa-item"> \
        <div class="title"> \
            <div contenteditable class="j-ctn">在这里写问题</div> \
        </div> \
        <div class="body j-text-body"> \
            <div contenteditable class="j-ctn">在这里写答案</div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

// 插入序列
function insertIndexedSection() {
    var tmpl = '<section class="indexed"> \
        <div class="ol j-text-body j-ctn" contenteditable> \
            <div>在这里编写内容</div> \
            <div>在这里编写内容</div> \
            <div>在这里编写内容</div> \
        </div> \
    </section>';
    domArticleContent.innerHTML = domArticleContent.innerHTML + tmpl;
}

// 上传图片
function uploadImage(files) {
    if (!files.length) {
        return;
    }
    var file = files[0];
    Meteor.call('getUptToken', function(err, token) {
        if (!err) {
            Potter.loading('正在上传图片');
            var form = new FormData();
            form.append('token', token);
            form.append('file', file);
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                if (req.status === 200 && req.readyState === 4) {
                    var resp = JSON.parse(req.responseText);
                    insertImage(resp.domain + resp.key);
                    Potter.loadingHide();
                } else if (req.status !== 200 && req.readyState === 4) {
                    Txbb.Pop('toast', req.responseText);
                    Potter.loadingHide();
                }
            };
            req.open('POST', 'http://upload.qiniu.com/');
            req.send(form);
        }
    });
}

// 发布文章
function post() {
    var theme = getCurrentTheme();
    var $editor = $(domEditor);
    var title = $editor.find('.article-header').text().trim();
    var div = document.createElement('div');
    div.innerHTML = $editor.html();
    $(div).find('div').removeAttr('contenteditable');
    Potter.loading('正在发布页面');
    Meteor.call('post', div.innerHTML, title, theme.id, function(err, resp) {
        if (resp.code) {
            Txbb.Pop('toast', resp.msg);
        } else {
            Txbb.Pop('modal', {
                title : '提示',
                body: '上传成功!<br/><a href="'+resp.domain + resp.key + '">'+resp.domain + resp.key + '</a>',
                ok: getFiles,
                dontCloseClickBack: true
            });
            newPage();
        }
        Potter.loadingHide();
    });
}

// 获得历史上传记录
function getFiles() {
    Potter.loading('正在获取历史发布');
    Meteor.call('getFiles', function(err, resp){
        if (resp.error) {
            Txbb.Pop('toast', resp.error);
        } else {
            Session.set('files', resp);
        }
        Potter.loadingHide();
    });
}

// 读取一条历史记录
function getFile(path, themeId) {
    Potter.loading('正在获取该页面');
    $.get(path, function(resp){
        var ctn = $(resp.substring(resp.indexOf('<div class="article theme-'), resp.lastIndexOf('</div>'))).html();
        Potter.loadingHide();
        newPage(ctn);
        Session.set('currentThemeId', themeId);
    }, 'html');
}

// TODO: 自动保存
function autoSave() {

}

// TODO: 加载自动保存区的内容
function loadSave() {

}

// TODO: 预览
function preView() {

}

function getCurrentTheme() {
    var themes = Session.get('themes');
    var currentThemeId = Session.get('currentThemeId');
    if (themes) {
        if (!currentThemeId) currentThemeId = themes[0].id;
        for (var idx in themes) {
            if (themes[idx].id === currentThemeId) {
                return themes[idx];
            }
        }
    } else {
        return {};
    }
}

Template.dashboard.onRendered(function(){
    domWorkspace = this.find('.workspace');
    domEditor = this.find('.editor');
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
    'change #ThemeSelect' : function(event, template) {
        var target = event.target;
        var themeId = target.options[target.selectedIndex].value;
        Session.set('currentThemeId', themeId);
    },
    'click #BtnCreate' : newPage,
    'click #BtnSend' : function(e){
        e.preventDefault();

        Txbb.Pop('modal', {
            title: '提示',
            body: '您确认发布此页面么？',
            ok: post,
            cancel: function(){}
        });
    },
    'click .tree-view .trigger': function(e) {
        e.preventDefault();
        e.target.parentNode.classList.toggle('on');
    },
    'click .tree-view a': function(e) {
        e.preventDefault();
        getFile(this.path, this.type);
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
    files: function(type){
        var files = Session.get('files');
        var filesMap = {};
        if (files) {
            files.forEach(function(item){
                if (!filesMap[item.type]) {
                    filesMap[item.type] = [];
                }
                filesMap[item.type].push(item);
            });
        }
        return filesMap[type];
    },
    currentTheme: function(){
        return getCurrentTheme();
    }
});
