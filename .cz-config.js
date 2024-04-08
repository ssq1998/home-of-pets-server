module.exports = {
  // 可选类型
  types: [
    { value: 'feat', name: 'feat: 新功能' },
    { value: 'fix', name: 'fix: 修复' },
    { value: 'docs', name: 'docs: 文档变更' },
    { value: 'style', name: 'style: 代码格式(不影响代码运行的变动)' },
    { value: 'refactor', name: 'refactor: 重构(既不是增加feature，也不是修复bug)' },
    { value: 'perf', name: 'perf: 性能优化' },
    { value: 'test', name: 'test: 增加测试' },
    { value: 'chore', name: 'chore: 构建过程或辅助功能的变动' },
    { value: 'revert', name: 'revert: 回退' },
    { value: 'build', name: 'build: 打包' },
  ],
  // 消息步骤
  messages: {
    type: '请选择提交类型:',
    scope: '请输入修改范围[必填]:\n',
    customScope: '请输入修改范围[必填]:\n',
    subject: '请简要描述提交[必填]:\n',
    body: '请输入详细描述[可选]:\n',
    breaking: 'Breaking Changes 非兼容性说明 [可选]:\n',
    footer: '请输入要关闭的issue[可选]:\n',
    confirmCommit: '确认提交?',
  },
  allowCustomScopes: true,
  // 跳过问题
  skipQuestions: ['footer'],
  // subject文字默认长度
  subjectLimit: 72,
}
