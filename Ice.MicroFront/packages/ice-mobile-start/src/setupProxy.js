const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    let target = 'http://localhost:11180/';
    
    app.use(
        ['/api'],
        createProxyMiddleware({
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

                proxyResponse.headers.location = proxyResponse.headers.location.replace(target, 'http://localhost:3001/');
            }
        })
    );

    const wsProxyMiddleware = createProxyMiddleware(['/signalr-hubs'], {
        target: target,
        changeOrigin: true,
        ws: true
    });

    app.use(wsProxyMiddleware);
};