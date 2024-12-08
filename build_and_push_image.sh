#!/bin/bash

# 构建并推送Docker镜像
echo "正在构建并推送Docker镜像..."
if docker buildx build --platform linux/amd64 --build-arg NODE_ENV=production -t blowxian/phind_ai:latest --push .; then     # 需要替换为你的镜像名称
    echo "Docker镜像构建并推送成功。"
else
    echo "Docker镜像构建或推送失败！"
    exit 1
fi

echo "所有操作成功完成。"