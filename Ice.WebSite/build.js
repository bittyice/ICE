const { execSync } = require('child_process');
const fs = require('fs');

// 拷贝目录
function copyDir(src, dst, ignores = []) {
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
    }

    // 读取目录中的所有文件/目录
    let paths = fs.readdirSync(src);

    paths.forEach(function (path) {
        // 忽略的名称
        if (ignores.some(e => e == path)) {
            return;
        }

        const _src = src + '/' + path;
        const _dst = dst + '/' + path;

        let readable;
        let writable;

        let st = fs.statSync(_src);

        // 判断是否为文件
        if (st.isFile()) {
            // 创建读取流
            readable = fs.createReadStream(_src)
            // 创建写入流
            writable = fs.createWriteStream(_dst)
            // 通过管道来传输流
            readable.pipe(writable)
        }
        // 如果是目录则递归调用自身
        else if (st.isDirectory()) {
            copyDir(_src, _dst, ignores)
        }
    })
}

execSync("yarn install");
execSync("yarn build");
if(fs.existsSync('./build')){
    fs.rmdirSync('./build', { recursive: true });
}
fs.mkdirSync('./build');
copyDir('./public', './build/public');
copyDir('./.next/standalone', './build');
copyDir('./.next/static', './build/.next/static');
fs.copyFileSync('./Dockerfile', './build/Dockerfile');
