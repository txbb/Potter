var ua = window.navigator.userAgent;
var isTxbbClient = /msc\//.test(ua) || /msb\//.test(ua);
var domArticleContent = document.querySelector('.article-content');
var domArticleHeader = document.querySelector('.article-header');
if (isTxbbClient) {
    domArticleHeader.parentNode.removeChild(domArticleHeader);
}
function setCtnSize() {
    if (isTxbbClient) {
        domArticleContent.style.cssText = 'height:100%;margin-top: 0;';
    } else {
        domArticleContent.style.height = parseInt(domArticleContent.parentNode.offsetHeight - domArticleHeader.offsetHeight) + 'px';
    }
}
window.onload = setCtnSize;
window.onresize = setCtnSize;
