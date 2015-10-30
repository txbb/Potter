Meteor.startup(function () {
    console.log('欢迎使用 Potter, 这个项目由 txbb 维护, 使用 Meteor 开发，本项目仅支持webkit内核浏览器。');
    Session.setDefault('user', JSON.parse(localStorage.getItem('user')));
    window.Potter = {};
    window.Potter.loading = function(text){
        var wrap = document.getElementById('Loading');
        if (!wrap) {
            var div = document.createElement('div');
            div.className = 'loading';
            div.id = 'Loading';
            div.innerHTML = '<div class="inner"></div>';
            document.body.appendChild(div);
            wrap = document.getElementById('Loading');
        }
        wrap.firstChild.innerHTML = text;
        wrap.classList.add('on');
    };
    window.Potter.loadingHide = function() {
        var wrap = document.getElementById('Loading');
        if (wrap) {
            wrap.classList.remove('on');
        }
    };
});

Router.onBeforeAction(function() {
    if (!Session.get('user')) {
        this.render('welcome');
    } else {
        this.next();
    }
});

Router.route('/', function(){
    if (Session.get('user')) {
        Router.go('dashboard');
    } else {
        this.render('welcome');
    }
});

Router.route('/dashboard', function(){
    this.render('dashboard');
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('currentUser', function (a, b) {
    return Session.get('user');
});
