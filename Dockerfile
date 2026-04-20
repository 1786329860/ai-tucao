# ============================================
# AI吐槽研究所 - Dockerfile
# 适配 2G 内存服务器
# ============================================

FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# 复制源码并构建
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# 清理开发依赖，只保留生产依赖
RUN npm prune --production && npm cache clean --force

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "start"]
