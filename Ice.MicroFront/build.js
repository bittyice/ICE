const { exec, execSync } = require('child_process');
const { copyDir, rmdir } = require('./icee_config/utiliy');
const fs = require('fs');

// 移除旧目录
if (fs.existsSync('./build')) {
    rmdir('./build');
    console.log('已移除旧build目录');
}

fs.mkdirSync("build");
fs.mkdirSync("./build/pc");
fs.mkdirSync("./build/mb");

// 生成PC端
execSync("yarn build:web", { stdio: 'inherit' });
console.log(`yarn build:web 生成成功`);
// 生成移动端
execSync("yarn build:mobile", { stdio: 'inherit' });
console.log(`yarn build:mobile 生成成功`);

// 拷贝生成目录到根目录
copyDir('./packages/ice-react-start/build', './build/pc');
console.log('拷贝build目录完成');
// 拷贝生成目录到根目录
copyDir('./packages/ice-mobile-start/build', './build/mb');
console.log('拷贝build目录完成');

// 拷贝public目录
copyDir('./public', './build');
console.log('拷贝build目录完成');
