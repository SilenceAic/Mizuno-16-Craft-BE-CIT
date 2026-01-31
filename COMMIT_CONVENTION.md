# Git Commit 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来规范化 commit 信息。

## Commit 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（必填）

- **feat**: 新功能
- **fix**: 修复 bug
- **upd**: 更新
- **docs**: 文档变更
- **style**: 代码格式（不影响代码运行的变动）
- **refactor**: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- **perf**: 性能优化
- **test**: 增加测试
- **build**: 构建过程或辅助工具的变动
- **ci**: CI 配置文件和脚本的变动
- **chore**: 其他改动
- **revert**: 回滚

### Scope（可选）

用于说明 commit 影响的范围，例如：blocks, items, textures, scripts 等。

### Subject（必填）

简短描述，不超过 100 个字符。

## 示例

```bash
# 添加新功能
git commit -m "feat(blocks): 添加新的工作台变体"

# 修复 bug
git commit -m "fix(items): 修复物品分类错误"

# 文档更新
git commit -m "docs: 更新 README 文件"

# 代码格式调整
git commit -m "style(scripts): 格式化代码"

# 重构
git commit -m "refactor(textures): 重构纹理加载逻辑"

# 性能优化
git commit -m "perf(scripts): 优化方块状态计算性能"
```

## 自动检查

项目已配置 husky 和 commitlint，在执行 `git commit` 时会自动检查 commit 信息是否符合规范。

如果 commit 信息不符合规范，提交会被拒绝，需要修改后重新提交。

## 配置文件

- `commitlint.config.js`: commitlint 配置
- `.husky/commit-msg`: commit 信息检查钩子
- `.husky/pre-commit`: 提交前代码检查钩子
