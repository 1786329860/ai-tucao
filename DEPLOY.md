# AI吐槽研究所 - 部署指南

## 服务器要求
- Ubuntu + 1Panel + OpenResty
- 2核 / 2G 内存 / 30G 磁盘
- Docker 已安装
- Git 已安装

---

## 方式一：自动部署（推荐）

当代码推送到 GitHub `main` 分支时，自动部署到服务器。

### 步骤 1：在 GitHub 仓库配置 Secrets

进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

添加以下 4 个 Secrets：

| Secret 名称 | 值 | 说明 |
|---|---|---|
| `SERVER_HOST` | `你的服务器IP` | 例如 `123.45.67.89` |
| `SERVER_USER` | `root` | SSH 登录用户名 |
| `SERVER_PASS` | `你的SSH密码` | SSH 登录密码 |
| `SERVER_PORT` | `22` | SSH 端口（默认22，如修改过请填实际端口） |

### 步骤 2：服务器首次手动准备

SSH 登录服务器，执行：

```bash
# 安装 Docker（如果未安装）
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# 安装 Docker Compose（如果未安装）
docker compose version || apt install docker-compose-plugin -y

# 克隆项目
cd /opt
git clone https://github.com/1786329860/ai-tucao.git
cd ai-tucao

# 配置环境变量（填入你的 DeepSeek API Key）
cp .env.example .env
vim .env
# 将 DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key 改为你的真实 Key

# 首次构建并启动
docker compose up -d --build
```

### 步骤 3：配置 1Panel / OpenResty

#### 3.1 在 1Panel 中创建网站
- 网站类型：反向代理
- 域名：`tucao.aixiaolv.icu`
- 代理地址：`http://127.0.0.1:3000`

#### 3.2 配置 SSL 证书
- 在 1Panel 中为 `tucao.aixiaolv.icu` 申请 Let's Encrypt 免费证书

#### 3.3 添加 DNS 解析
在你的域名 DNS 管理中添加 A 记录：
```
tucao    A    你的服务器IP
```

### 步骤 4：验证自动部署

之后每次你修改代码并推送到 GitHub：
```bash
git add .
git commit -m "更新内容"
git push
```

GitHub Actions 会自动：
1. SSH 连接到你的服务器
2. 拉取最新代码
3. 重新构建 Docker 镜像
4. 重启容器

你可以在 GitHub 仓库的 **Actions** 标签页查看部署状态。

---

## 方式二：手动部署

### 1. 克隆项目
```bash
cd /opt
git clone https://github.com/1786329860/ai-tucao.git
cd ai-tucao
```

### 2. 配置环境变量
```bash
cp .env.example .env
vim .env
# 填入你的 DeepSeek API Key
```

### 3. 构建并启动
```bash
docker compose up -d --build
```

### 4. 后续更新
```bash
cd /opt/ai-tucao
git pull
docker compose up -d --build
```

---

## 常用命令

```bash
# 查看日志
docker logs -f ai-tucao

# 重启服务
docker compose restart

# 更新代码后重新构建
git pull && docker compose up -d --build

# 停止服务
docker compose down

# 查看容器状态
docker ps
```

## 注意事项
- 服务器只有 2G 内存，Docker 容器已限制为最多使用 1G
- DeepSeek API 需要国内网络可访问（api.deepseek.com 国内直连）
- 如果遇到内存不足，可以增加 swap 空间
- `.env` 文件包含 API 密钥，已被 `.gitignore` 排除，不会上传到 GitHub
