// Commitlint 配置文件
// 使用 Conventional Commits 规范

module.exports = {
  extends: ["@commitlint/config-conventional"],

  // 自定义规则
  rules: {
    // 类型枚举
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复 bug
        "docs", // 文档变更
        "style", // 代码格式（不影响代码运行的变动）
        "refactor", // 重构（既不是新增功能，也不是修改bug的代码变动）
        "perf", // 性能优化
        "test", // 增加测试
        "build", // 构建过程或辅助工具的变动
        "ci", // CI 配置文件和脚本的变动
        "chore", // 其他改动
        "revert", // 回滚
      ],
    ],

    // 主题不能为空
    "subject-empty": [2, "never"],

    // 主题最大长度
    "subject-max-length": [2, "always", 100],

    // 主题格式（首字母小写）
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],

    // 类型不能为空
    "type-empty": [2, "never"],

    // 类型格式（小写）
    "type-case": [2, "always", "lower-case"],

    // 范围格式（小写）
    "scope-case": [2, "always", "lower-case"],
  },
};
