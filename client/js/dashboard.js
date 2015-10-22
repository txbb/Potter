var domWorkspace;

function onScreenSizeChange() {

}

function init() {
    domWorkspace.style.height = parseInt(window.innerHeight - 44) + 'px';
}

Template.dashboard.onRendered(function(){
    domWorkspace = this.find('.workspace');
    init();
});
