Meteor.startup(function () {
    console.log('欢迎使用 Potter, 这个项目由 txbb 维护, 使用 Meteor 开发，本项目仅支持webkit内核浏览器。');
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

Router.route('/', function(){
    this.render('welcome');
});

Router.route('/dashboard', function(){
    this.render('dashboard');
});

Template.registerHelper('equals', function (a, b) {
      return a === b;
});
