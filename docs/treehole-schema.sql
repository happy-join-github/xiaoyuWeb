-- ============================================================================
-- 小愈 — 树洞模块 数据库表结构
-- 适用数据库：MySQL 8.0+ / MariaDB 10.5+
-- 字符集：utf8mb4
--
-- 设计原则：所有外键均为逻辑外键，不设物理 FOREIGN KEY 约束。
-- 关联字段通过列注释标明所引用的表，通过 INDEX 保障查询性能。
--
-- 注：聊天会话和消息共享聊聊模块的 chat_sessions / chat_messages 表，
-- 创建树洞会话时写入 type='treehole' 即可。本文仅定义树洞专有的表。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 树洞情绪标签表
--    存储用户在树洞对话中选择的情绪标签。
--    每人每天每种情绪仅记录一次。
-- ----------------------------------------------------------------------------
CREATE TABLE `treehole_emotion_tags` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID，关联 users.id',
  `session_id`      BIGINT UNSIGNED DEFAULT NULL              COMMENT '来源树洞会话ID，关联 chat_sessions.id',

  -- 情绪
  `emotion`         ENUM('happy', 'calm', 'sad', 'anxious', 'irritable', 'tearful')
                      NOT NULL COMMENT '情绪类型（与 mood_records 枚举一致）',
  `record_date`     DATE            NOT NULL                  COMMENT '标签所属日期',

  -- 来源
  `source`          ENUM('treehole_prompt', 'manual')
                      NOT NULL DEFAULT 'treehole_prompt'
                      COMMENT '来源：treehole_prompt=树洞触发提议, manual=手动记录',

  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date_emotion` (`user_id`, `record_date`, `emotion`)
                      COMMENT '每人每天每种情绪仅一条',
  INDEX `idx_user_date` (`user_id`, `record_date`) COMMENT '查某天所有标签',
  INDEX `idx_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='树洞情绪标签 — 对话中捕获的情绪快照';


-- ----------------------------------------------------------------------------
-- 2. 树洞日记草稿表（可选）
--    暂存用户从树洞跳转到心情签到时携带的对话摘要。
--    前端当前使用 sessionStorage 实现，该表供服务端持久化方案使用。
-- ----------------------------------------------------------------------------
CREATE TABLE `treehole_diary_drafts` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '草稿ID',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',
  `session_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '来源树洞会话ID，关联 chat_sessions.id',
  `emotion`         VARCHAR(20)     DEFAULT NULL              COMMENT '情绪标签',
  `summary`         VARCHAR(500)    DEFAULT NULL              COMMENT '对话摘要',
  `status`          ENUM('pending', 'saved', 'expired')
                      NOT NULL DEFAULT 'pending'
                      COMMENT '状态：pending=待处理, saved=已保存到日记, expired=过期',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='树洞日记草稿 — 树洞→心情签到的数据桥接';


-- ============================================================================
-- 索引策略说明
-- ============================================================================
-- 高频查询：
--   1. 今日情绪标签 GET /api/treehole/emotion/today
--      → SELECT * FROM treehole_emotion_tags
--        WHERE user_id=? AND record_date=CURDATE()
--      → idx_user_date（复合索引覆盖）
--
--   2. 保存树洞情绪标签 POST /api/treehole/emotion
--      → INSERT ... ON DUPLICATE KEY UPDATE ...
--      → uk_user_date_emotion（唯一索引保证幂等）
--
--   3. 草稿查询 GET /api/treehole/draft
--      → SELECT * FROM treehole_diary_drafts
--        WHERE user_id=? AND status='pending'
--      → idx_user_status（复合索引覆盖）


-- ============================================================================
-- 初始种子数据（示例情绪标签）
-- ============================================================================
INSERT INTO `treehole_emotion_tags` (`user_id`, `session_id`, `emotion`, `record_date`, `source`) VALUES
(1, 4, 'tired',   '2026-07-27', 'treehole_prompt'),
(1, 4, 'anxious', '2026-07-27', 'treehole_prompt');
