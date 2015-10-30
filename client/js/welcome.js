Template.welcome.onRendered(function(){
    this.find('.welcome-block').classList.add('active');
});

Template.welcome.events({
    'submit form': function(e) {
        e.preventDefault();
        var account = $('form').find('input[name=account]').val();
        var password = $('form').find('input[name=password]').val();
        Potter.loading('正在登录...');
        Meteor.call('login', account, password, function(err, ret) {
            if (ret.error) {
                Txbb.Pop('toast', ret.error);
            } else {
                localStorage.setItem('user', JSON.stringify(ret.user));
                Session.set('user', JSON.parse(localStorage.getItem('user')));
                Router.go('dashboard');
            }
            Potter.loadingHide();
        });
    },
    'click .reg': function(e) {
        e.preventDefault();
        Txbb.Pop('modal', {
            title: '提示',
            body: '请找张杨要个账号去'
        });
    }
});
