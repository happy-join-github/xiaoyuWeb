-- ============================================================================
-- 小愈 — 聊聊模块 数据库表结构
-- 适用数据库：MySQL 8.0+ / MariaDB 10.5+
-- 字符集：utf8mb4
--
-- 设计原则：所有外键均为逻辑外键，不设物理 FOREIGN KEY 约束。
-- 关联字段通过列注释标明所引用的表，通过 INDEX 保障查询性能。
--
-- 注：树洞模块复用本模块的 chat_sessions 和 chat_messages 表，
-- 通过 type='treehole' 区分。树洞专有的表情标签和日记草稿
-- 见 treehole-schema.sql。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 聊天会话表
--    存储所有 AI 对话会话：日常聊天（chat）与树洞倾诉（treehole）。
--    treehole 类型也会写入此表，由 type 字段区分。
-- ----------------------------------------------------------------------------
CREATE TABLE `chat_sessions` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '会话ID',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID，关联 users.id',
  `type`            ENUM('chat', 'treehole') NOT NULL DEFAULT 'chat'
                      COMMENT '会话类型：chat=日常聊天, treehole=树洞倾诉',

  -- 会话元信息
  `title`           VARCHAR(200)    DEFAULT NULL              COMMENT '会话标题（AI 首轮自动生成）',
  `preview`         VARCHAR(300)    DEFAULT NULL              COMMENT '最后一条消息摘要（列表预览）',
  `message_count`   INT UNSIGNED    NOT NULL DEFAULT 0        COMMENT '消息总数',
  `last_message_at` DATETIME        DEFAULT NULL              COMMENT '最后一条消息的发送时间',

  -- 时间戳
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL              COMMENT '软删除时间',

  PRIMARY KEY (`id`),
  INDEX `idx_user_type` (`user_id`, `type`) COMMENT '按用户+类型查询会话列表',
  INDEX `idx_last_message` (`user_id`, `last_message_at` DESC) COMMENT '按最后消息时间倒序排列',
  INDEX `idx_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='AI 聊天与树洞会话表（树洞共享）';


-- ----------------------------------------------------------------------------
-- 2. 聊天消息表
--    存储所有会话的消息内容，树洞消息也写入此表。
-- ----------------------------------------------------------------------------
CREATE TABLE `chat_messages` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '消息ID',
  `session_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '所属会话ID，关联 chat_sessions.id',
  `role`            ENUM('ai', 'user') NOT NULL              COMMENT '消息角色：ai=AI回复, user=用户发送',
  `content`         TEXT            NOT NULL                  COMMENT '消息正文（支持 <br> 等简单 HTML）',

  -- 附加信息
  `tokens_used`     INT UNSIGNED    DEFAULT NULL              COMMENT 'AI 回复消耗的 token 数（可选，用于计费/统计）',
  `meta`            JSON            DEFAULT NULL              COMMENT '扩展元信息（如情绪标签、意图分类等）',

  -- 时间戳
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL              COMMENT '软删除',

  PRIMARY KEY (`id`),
  INDEX `idx_session` (`session_id`, `created_at`) COMMENT '按会话拉取消息列表（按时间顺序）',
  INDEX `idx_role` (`session_id`, `role`) COMMENT '按角色统计消息数',
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='AI 聊天消息表（树洞共享）';


-- ============================================================================
-- 索引策略说明
-- ============================================================================
-- 高频查询：
--   1. 会话列表 GET /api/chat/sessions
--      → SELECT * FROM chat_sessions
--        WHERE user_id=? AND type='chat' AND deleted_at IS NULL
--        ORDER BY last_message_at DESC
--      → idx_last_message（覆盖排序 + 用户筛选）+ idx_user_type（type 过滤）
--
--   2. 消息列表 GET /api/chat/sessions/:id/messages
--      → SELECT * FROM chat_messages
--        WHERE session_id=? AND deleted_at IS NULL
--        ORDER BY created_at ASC
--      → idx_session（session_id + created_at 复合索引）
--
--   3. 发送消息 POST /api/chat/sessions/:id/messages
--      → INSERT INTO chat_messages ... （写入）
--      → UPDATE chat_sessions SET message_count=message_count+1,
--          last_message_at=NOW(), preview=?  WHERE id=?
--      → 会话表 PRIMARY KEY（id）
--
--   4. 删除会话 DELETE /api/chat/sessions/:id
--      → UPDATE chat_sessions SET deleted_at=NOW() WHERE id=?
--      （软删除，不物理删除消息；消息通过 session_id 关联保留）
--
--   5. 聊天历史分组 GET /api/chat/history
--      → 按 last_message_at 时间跨度分组，逻辑在服务端实现
--      → 数据源：idx_last_message 索引


-- ============================================================================
-- 初始种子数据（示例会话与消息）
-- ============================================================================
INSERT INTO `chat_sessions` (`id`, `user_id`, `type`, `title`, `preview`, `message_count`, `last_message_at`) VALUES
(1, 1, 'chat', '工作的烦恼',     '今天真的好累，所有事都堆在一起…', 12, '2026-07-27 09:33:00'),
(2, 1, 'chat', '和家人吵架',     '不知道该怎么面对，感觉很愧疚…',   8,  '2026-07-26 22:10:00'),
(3, 1, 'chat', '即将到来的面试', '准备了好久的面试，还是很紧张…',   15, '2026-07-25 20:30:00'),
(4, 1, 'treehole', '树洞 · 07/27', '今天真的好累，所有事堆在一起，不想说话', 5, '2026-07-27 09:24:00');

INSERT INTO `chat_messages` (`session_id`, `role`, `content`) VALUES
-- 会话1：工作的烦恼
(1, 'ai',   '早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~'),
(1, 'user', '嗯…其实有点累'),
(1, 'ai',   '嗯嗯，我在 💛<br>是身体上的累，还是心里那种？慢慢说，不着急。'),
-- 会话4：树洞（共享存储）
(4, 'ai',   '我在这里 🌙<br>想说什么都可以，慢慢来。'),
(4, 'user', '今天真的好累，所有事都堆在一起，不想和任何人说话。'),
(4, 'ai',   '嗯…听起来真的很沉重。<br>累了就先这样待一会儿，不说话也没关系。');
