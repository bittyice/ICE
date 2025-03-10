#!/bin/bash
workdir=$(pwd)
echo "当前目录：$workdir，开始执行"

back="Ice.Micro"
front="Ice.MicroFront"

#拉取后端
cd ${back}
git pull
echo "项目 ${back} 已拉取"
echo ""
cd $workdir

#拉取前端
cd ${front}
git pull
echo "项目 ${front} 已拉取"
echo ""
cd $workdir

#生成发布目录
[ ! -d "publish" ] && mkdir "publish"

#生成后端
echo ""
echo ""
echo "开始生成项目 ${back}"
dir="${back}/hosts/Ice.Micro.HttpApi.Host"
outdir="publish/${back}"
cd $dir
dotnet publish --configuration Release
echo "项目 ${back} 已生成"
cd $workdir
rm -rf $outdir
cp -r "${dir}/bin/Release/net7.0/publish/" $outdir
cp "${back}/Dockerfile" $outdir
echo "项目 ${back} 已拷贝到 ${outdir}"

##复制docker-compose.yml
cd $workdir
cp "${back}/docker-compose.yml" "publish/"

#生成前端
echo ""
echo ""
echo "开始生成项目 ${front}"
cd $front
yarn install
node build.js
echo "项目 ${front} 已生成"
# 执行压缩命令
npx compress-cra -d ./build/pc
npx compress-cra -d ./build/mb
echo "已压缩前端文件"
cd $workdir
outdir="publish/${front}"
rm -rf $outdir
mkdir $outdir
cp -r "${front}/build" "$outdir/build"
cp "${front}/Dockerfile" $outdir
cp "${front}/nginx.conf" $outdir
echo "项目 ${front} 已拷贝到 ${outdir}"

#发布代码
echo ""
echo ""
echo "开始发布代码到远程服务"
cd $workdir

ip="root@124.70.128.82"
serverdir="/root/IceMicro"
echo "发布地址：$ip"
scp -r ./publish/* $ip:$serverdir
echo "代码已发布到$ip"
