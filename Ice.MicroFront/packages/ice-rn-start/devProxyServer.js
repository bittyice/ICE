// 本地开发环境代理服务器，由于本地后端没有部署kong，所以使用该代理模拟kong，负责代理后端端口

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 6666;

let target = 'http://localhost:11180/';

app.use(
    '/api',
    createProxyMiddleware({
        changeOrigin: true,
        target: target,
        changeOrigin: true,
        onProxyRes: (proxyResponse, request, response) => {
            if (proxyResponse.status < 300 || proxyResponse.status >= 400) {
                return;
            }

            // 处理重定向
            if (!proxyResponse.headers.location) {
                return;
            }

            proxyResponse.headers.location = proxyResponse.headers.location.replace(authTarget, `http://localhost:${port}/`);
        }
    })
);

app.use(express.static('.', {
    extensions: ['html']
}))

app.use('/Login', express.static('.', {
    extensions: ['html']
}));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})