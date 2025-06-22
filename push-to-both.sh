#!/bin/bash

# 同時推送到 GitHub 和 GitLab 的腳本
echo "🚀 開始推送到 GitHub 和 GitLab..."

# 推送到 GitHub (origin)
echo "📤 推送到 GitHub..."
git push origin main

# 推送到 GitLab
echo "📤 推送到 GitLab..."
git push gitlab main

echo "✅ 推送完成！"
echo "GitHub: https://github.com/ji4/Medicine-Buddha-Mantra"
echo "GitLab: https://gitlab.com/ji4/Medicine-Buddha-Mantra" 