<img src="logo.png" style="width:255px"/>

# Potter
帮帮的说明页发布小工具，使用 [Meteor](http://meteor.com) 开发，可以编辑静态 html 页面，提交至七牛云服务器。

## 使用方法

得到源码之后在 server/main 文件夹下添加一个 `config.js`，该文件十分重要，其中包括颜色主题的定义、七牛key的配置，以及账号信息都存储于此。

### server/main/config.js 案例
```javascript
// 七牛配置
this.CONFIG = {
    AK : '',
    SK : '',
    BUCKET : 'test',
    DOMAIN : 'http://7xnvd4.com1.z0.glb.clouddn.com/'
};

// 主题配置
this.data = {
    themes: [
        {
            id: 'C',
            name: 'C端',
            colors: {
                main: '#77d2c5',
                secondary: '#9bce2d',
                danger: '#fd6e41',
                success: '#9bce2d'
            }
        },
        {
            id: 'B',
            name: 'B端',
            colors: {
                main: '#1eabc9',
                secondary: '#7cd1e0',
                danger: '#fd6e41',
                success: '#9bce2d'
            }
        },
        {
            id: 'tudou',
            name: '土豆CRM',
            colors: {
                main: '#F7812D',
                secondary: '#F79D2D',
                danger: '#fd6e41',
                success: '#9bce2d'
            }
        }
    ]
};

// 账号
this.accounts = [
    {
        account: 'admin',
        password: 'admin'
    }
];
```
