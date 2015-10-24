# Txbb.Pop
同学帮帮弹出层类组件，简洁、无依赖，使用 CSS3 实现动画效果。

## 为什么要再造一遍轮子
弹出层是常见的业务场景，而且弹出层的业务场景很简单，没必要使用大而全的库，并且，我们经常会有 *层上层* 这种情况，因此笔者写了两个功能， `toast` 及 `modal`。

## 包含两个业务点
toast 和 modal

![](test/toast.jpg)
![](test/modal.png)

## API
### toast
```javascript
Txbb.Pop('toast', text);
```

### modal
```javascript
Txbb.Pop('modal', options);
```

#### options
- body: 显示内容，可以是纯字符串，也可以是 dom 元素，当使用 dom 元素时，其 innerHTML 会被显示
- title: 显示标题
- ok: 确认回调,如果在点击确定按钮之后不想要隐藏掉当前窗体, 就在ok回调中 `return false`
- cancel: 取消回调
- okText: 确认按钮文字
- cancelText: 取消按钮文字
