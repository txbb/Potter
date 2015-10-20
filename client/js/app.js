Meteor.startup(function () {
    console.log('欢迎使用 Potter, 这个项目由 txbb 维护, 使用 Meteor 开发。');
});

Template.body.helpers({

});

Router.route('/', function(){
    this.render('welcome');
});

Router.route('/dashboard', function(){
    this.render('dashboard');
});
