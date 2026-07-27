-- ============================================================================
-- 小愈 — 用户与个人设置模块 数据库表结构
-- 适用数据库：MySQL 8.0+ / MariaDB 10.5+
-- 字符集：utf8mb4
--
-- 设计原则：所有外键均为逻辑外键，不设物理 FOREIGN KEY 约束。
-- 关联字段通过列注释标明所引用的表，通过 INDEX 保障查询性能。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 用户账号表
--    存储登录账号与基础身份信息。
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '用户ID',
  `phone`         VARCHAR(20)      NOT NULL                  COMMENT '手机号（唯一标识）',
  `password_hash` VARCHAR(255)     NOT NULL                  COMMENT 'bcrypt 加密密码',
  `nickname`      VARCHAR(50)      NOT NULL DEFAULT ''       COMMENT '用户昵称',
  `avatar`        VARCHAR(10)      NOT NULL DEFAULT '🦊'     COMMENT '头像 emoji',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT '注册时间',
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`    DATETIME         DEFAULT NULL              COMMENT '软删除（注销账号）',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`) COMMENT '手机号唯一',
  INDEX `idx_nickname` (`nickname`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户账号表';


-- ----------------------------------------------------------------------------
-- 2. 用户资料表（1:1）
--    扩展的个人信息与陪伴数据面板。
-- ----------------------------------------------------------------------------
CREATE TABLE `user_profiles` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',

  -- AI 伙伴
  `ai_name`         VARCHAR(50)     NOT NULL DEFAULT '小愈'   COMMENT 'AI 伙伴昵称',
  `voice`           VARCHAR(50)     NOT NULL DEFAULT '温柔女声'
                      COMMENT 'AI 声线偏好',
  `character_tags`  JSON            DEFAULT NULL              COMMENT '性格标签数组，如 ["聆听者","知心朋友"]',
  `character_bio`   VARCHAR(500)    DEFAULT NULL              COMMENT '角色简介描述',

  -- 问候时段
  `morning_greeting_time`  VARCHAR(5) NOT NULL DEFAULT '08:00' COMMENT '早安推送时间',
  `evening_greeting_time`  VARCHAR(5) NOT NULL DEFAULT '22:00' COMMENT '晚安推送时间',

  -- 数据面板（冗余快照，每日或按事件更新）
  `companion_days`     INT UNSIGNED NOT NULL DEFAULT 0  COMMENT '陪伴天数',
  `chat_rounds`        INT UNSIGNED NOT NULL DEFAULT 0  COMMENT '累积聊天轮次',
  `diary_count`        INT UNSIGNED NOT NULL DEFAULT 0  COMMENT '日记/心情记录数',
  `collection_count`   INT UNSIGNED NOT NULL DEFAULT 0  COMMENT '收藏卡片数',

  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`) COMMENT '一个用户对应一条资料',

  INDEX `idx_ai_name` (`ai_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户资料扩展 — AI 伙伴设置 + 数据面板';


-- ----------------------------------------------------------------------------
-- 3. 应用设置表（1:1）
--    用户个性化偏好。
-- ----------------------------------------------------------------------------
CREATE TABLE `user_settings` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',

  -- 外观
  `theme_key`       VARCHAR(20)     NOT NULL DEFAULT 'morning'
                      COMMENT '主题 key：morning / forest / flower / moon / tea',
  `dark_mode`       TINYINT(1)     NOT NULL DEFAULT 0         COMMENT '深色模式：0=关闭, 1=开启',

  -- 隐私
  `anonymous_mode`  TINYINT(1)     NOT NULL DEFAULT 0         COMMENT '匿名倾诉模式',

  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='应用设置 — 主题、深色模式、隐私偏好';


-- ----------------------------------------------------------------------------
-- 4. 陪伴天数流水表（可选）
--    记录用户每天的活跃状态，用于精确计算连续陪伴天数。
-- ----------------------------------------------------------------------------
CREATE TABLE `user_daily_activity` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`     BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',
  `activity_date` DATE          NOT NULL                  COMMENT '活跃日期',
  `is_active`   TINYINT(1)     NOT NULL DEFAULT 1         COMMENT '是否有活跃行为',
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `activity_date`) COMMENT '每人每天一条',
  INDEX `idx_user_activity` (`user_id`, `activity_date` DESC) COMMENT '连续陪伴天数计算（倒序取最近记录）',
  INDEX `idx_date` (`activity_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户每日活跃记录 — 用于计算陪伴天数';


-- ============================================================================
-- 索引策略说明
-- ============================================================================
-- 高频查询：
--   1. 个人主页 GET /profile
--      → SELECT ... FROM users u JOIN user_profiles p ON u.id = p.user_id
--        WHERE u.id=? AND u.deleted_at IS NULL
--      → u: PRIMARY KEY（id）+ idx_deleted_at
--      → p: uk_user（user_id 唯一索引）
--
--   2. 登录 POST /auth/login
--      → SELECT * FROM users WHERE phone=? AND deleted_at IS NULL
--      → uk_phone（唯一索引，快速定位）+ idx_deleted_at
--
--   3. 注册 POST /auth/register（手机号去重）
--      → SELECT 1 FROM users WHERE phone=?  →  uk_phone
--
--   4. AI 设置 GET /profile/ai-settings
--      → SELECT * FROM user_profiles WHERE user_id=?  →  uk_user（唯一索引）
--
--   5. 应用设置 GET /profile/settings
--      → SELECT * FROM user_settings WHERE user_id=?  →  uk_user（唯一索引）
--
--   6. 连续陪伴天数
--      → SELECT activity_date FROM user_daily_activity
--        WHERE user_id=? ORDER BY activity_date DESC LIMIT 365
--      → idx_user_activity（覆盖索引，无需回表）
--
--   7. 昵称搜索
--      → SELECT * FROM users WHERE nickname LIKE ? AND deleted_at IS NULL
--      → idx_nickname + idx_deleted_at


-- ============================================================================
-- 初始种子数据（示例用户）
-- ============================================================================
INSERT INTO `users` (`id`, `phone`, `password_hash`, `nickname`, `avatar`) VALUES
(1, '13800138000', '$2a$10$dummyhashfordemo', '小柚子', '🦊');

INSERT INTO `user_profiles` (`user_id`, `ai_name`, `voice`, `character_tags`, `character_bio`, `companion_days`, `chat_rounds`, `diary_count`, `collection_count`) VALUES
(1, '小愈', '温柔女声', '["聆听者","知心朋友","鼓励者"]', '一个总是耐心倾听、温柔鼓励我的知心朋友', 14, 86, 14, 12);

INSERT INTO `user_settings` (`user_id`, `theme_key`, `dark_mode`, `anonymous_mode`) VALUES
(1, 'morning', 0, 0);
