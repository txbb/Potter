/*jshint esnext:true*/

let qiniu = Npm.require('qiniu');
let fs = Npm.require('fs');

function getUptDeadline() {
    let now = new Date();
    let time = now.getTime();
    return Math.floor(time/1000) + 3600;
}

function preZero(num) {
    return num > 9 ? num : '0' + num;
}

function printTime(time) {
    var d = new Date();
    if (time) d.setTime(time);
    return preZero(parseInt(d.getMonth() + 1)) + '月' + preZero(parseInt(d.getDate())) + '日 ' + preZero(parseInt(d.getHours())) + ':' + preZero(parseInt(d.getMinutes()));
}

qiniu.conf.ACCESS_KEY = CONFIG.AK;
qiniu.conf.SECRET_KEY = CONFIG.SK;

// TODO: 超时处理
function uploadBuf(body, key, callback) {
    let token = new qiniu.rs.PutPolicy2({
        scope: CONFIG.BUCKET + ':' + key,
        expires: getUptDeadline(),
        returnBody: '{"key": $(key), "domain": "'+ CONFIG.DOMAIN +'"}'
    });
    let extra = new qiniu.io.PutExtra();
    // extra.params = params;
    // extra.mimeType = mimeType;
    // extra.crc32 = crc32;
    // extra.checkCrc = checkCrc;

    qiniu.io.put(token.token(), key, body, extra, function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            callback(null, ret);
        } else {
            // 上传失败将结果直接返回前端，前端进行处理
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
            callback(null, err);
        }
    });
}

// 发布文章
function post(articleText, title, themeId, callback) {
    let tmpl = Assets.getText('template.html');
    let html = tmpl.replace(/\{\{content\}\}/g, articleText)
                   .replace(/\{\{title\}\}/g, title);
    uploadBuf(html, 'p/' + themeId + '/' + title + '.html', callback);
}

// 获得主题
function getThemes(callback) {
    callback(null, data.themes);
}

// 处理历史记录
function handleFiles(data) {
    let back = [];
    data.forEach(function(file){
        let key = file.key;
        let putTime = printTime(Math.floor(file.putTime/10000));
        let path = CONFIG.DOMAIN + file.key;
        let arr = key.split('/');
        let type = arr[1];
        let name = arr[2].substring(0, arr[2].indexOf('.html'));
        back.push({
            key: key,
            type: type,
            name: name,
            path: path,
            putTime: putTime
        });
    });
    return back;
}

// 获取所有历史记录
function getFiles(callback) {
    qiniu.rsf.listPrefix(CONFIG.BUCKET, 'p/', null, 1000, function(err, ret) {
        if (!err) {
            callback(null, handleFiles(ret.items));
        } else {
            callback(null, err);
            // http://developer.qiniu.com/docs/v6/api/reference/rs/list.html
        }
    });
}

Meteor.startup(function () {
    // Meteor 客户端访问服务端
    Meteor.methods({
        login(account, password) {
            let back = {
                error: '账号未找到'
            };
            for (let i = 0,l = accounts.length; i<l ;i++) {
                if (accounts[i].account.toLowerCase() === account.toLowerCase()) {
                    if (accounts[i].password === password) {
                        back.error = 0;
                        back.user = accounts[i];
                        this.setUserId(account);
                    } else {
                        back.error = '密码错误';
                    }
                    break;
                }
            }
            return back;
        },
        // 获得上传token
        getUptToken() {
            let token = new qiniu.rs.PutPolicy2({
                scope: CONFIG.BUCKET,
                expires: getUptDeadline(),
                returnBody: '{"key": $(key), "domain": "'+ CONFIG.DOMAIN +'"}'
            });
            return token.token();
        },
        // 发布文章
        post(articleText, title, path){
            let syncPost = Meteor.wrapAsync(post);
            let result = syncPost(articleText, title, path);
            return result;
        },
        // 获取所有主题
        getThemes() {
            let funcSync = Meteor.wrapAsync(getThemes);
            return funcSync();
        },
        // 获取所有文章列表
        getFiles() {
            let getFilesSync = Meteor.wrapAsync(getFiles);
            return getFilesSync();
        }
    });
});
