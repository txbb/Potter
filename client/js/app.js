Meteor.startup(function () {
    console.log('欢迎使用 Potter, 这个项目由 txbb 维护, 使用 Meteor 开发，本项目仅支持 IE11 及现代浏览器');
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
