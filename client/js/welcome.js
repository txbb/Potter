Template.welcome.onRendered(function(){
    this.find('.welcome-block').classList.add('active');
});

Template.welcome.events({
    "click button": function () {
        Session.set('page', 'dashboard');
    }
});
