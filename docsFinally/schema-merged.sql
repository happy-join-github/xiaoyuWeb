-- ============================================================================
-- 小愈 — 完整数据库设计（业务合并版）
-- 适用数据库：MySQL 8.0+ / MariaDB 10.5+
-- 字符集：utf8mb4 COLLATE utf8mb4_unicode_ci
--
-- 设计原则：
-- 1. 逻辑外键：不设物理 FOREIGN KEY，通过列注释标明关联，INDEX 保障性能
-- 2. 软删除：核心业务表含 deleted_at 字段；关联/日志表物理删除
-- 3. 冗余计数：高频 COUNT 查询用冗余字段 + 触发器维护，避免实时 COUNT
-- 4. 统一时间字段：created_at / updated_at / deleted_at 命名规范
--
-- 表总数：18 张（按依赖顺序创建）
-- 模块覆盖：用户 / 聊天 / 心情 / 卡片 / 树洞
-- ============================================================================

-- ============================================================================
-- 第一部分：用户与个人设置模块（4 表）
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 users — 用户账号表
-- 职责：登录凭证与基础身份，系统所有业务表的归属根
-- 关联：被 user_profiles / user_settings / user_daily_activity /
--       chat_sessions / mood_records / cards / treehole_* 等引用
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '用户ID（全局唯一）',
  `phone`         VARCHAR(20)      NOT NULL                  COMMENT '手机号（登录唯一标识，需唯一索引）',
  `password_hash` VARCHAR(255)     NOT NULL                  COMMENT 'bcrypt 加密密码哈希',
  `nickname`      VARCHAR(50)      NOT NULL DEFAULT ''       COMMENT '用户昵称（可修改）',
  `avatar`        VARCHAR(10)      NOT NULL DEFAULT '🦊'     COMMENT '头像 emoji 字符',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT '注册时间',
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    COMMENT '最后更新时间',
  `deleted_at`    DATETIME         DEFAULT NULL              COMMENT '软删除时间（注销账号标记）',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`) COMMENT '手机号唯一索引（登录/注册去重）',
  INDEX `idx_nickname` (`nickname`) COMMENT '支持按昵称搜索用户',
  INDEX `idx_deleted_at` (`deleted_at`) COMMENT '过滤已注销用户'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户账号表 — 系统核心归属表';


-- ----------------------------------------------------------------------------
-- 1.2 user_profiles — 用户资料扩展表（1:1）
-- 职责：AI 伙伴配置 + 陪伴数据面板
-- 业务：
--   - AI 伙伴名称/声线/性格标签/角色简介由用户在 AiSettings 页面配置
--   - 早安/晚安推送时间控制问候推送
--   - 数据面板字段为冗余快照，定期或事件驱动更新
-- ----------------------------------------------------------------------------
CREATE TABLE `user_profiles` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',

  -- AI 伙伴配置
  `ai_name`         VARCHAR(50)     NOT NULL DEFAULT '小愈'   COMMENT 'AI 伙伴昵称，默认"小愈"',
  `voice`           VARCHAR(50)     NOT NULL DEFAULT '温柔女声'
                      COMMENT 'AI 声线偏好',
  `character_tags`  JSON            DEFAULT NULL              COMMENT '性格标签数组，如 ["聆听者","知心朋友","鼓励者"]',
  `character_bio`   VARCHAR(500)    DEFAULT NULL              COMMENT '角色简介描述文字',

  -- 问候时段
  `morning_greeting_time`  VARCHAR(5) NOT NULL DEFAULT '08:00' COMMENT '早安问候推送时间（HH:mm）',
  `evening_greeting_time`  VARCHAR(5) NOT NULL DEFAULT '22:00' COMMENT '晚安问候推送时间（HH:mm）',

  -- 时间戳
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`) COMMENT '一个用户对应唯一一条扩展资料',
  INDEX `idx_ai_name` (`ai_name`) COMMENT '可按 AI 伙伴名称查询'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户资料扩展表 — AI 伙伴设置 + 数据面板（1:1）';


-- ----------------------------------------------------------------------------
-- 1.3 user_settings — 应用设置表（1:1）
-- 职责：用户个性化偏好，包括外观、隐私、通知
-- 业务：
--   - 主题切换影响全局 UI 色系（5 套预设）
--   - 匿名模式开启后隐藏用户身份
--   - 通知设置影响推送行为（卡片/晚安/周报/打卡）
-- ----------------------------------------------------------------------------
CREATE TABLE `user_settings` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',

  -- 外观设置
  `theme_key`       VARCHAR(20)     NOT NULL DEFAULT 'morning'
                      COMMENT '主题 key：morning|forest|flower|moon|tea',
  `dark_mode`       TINYINT(1)      NOT NULL DEFAULT 0
                      COMMENT '深色模式：0=关闭, 1=开启',

  -- 隐私设置
  `anonymous_mode`  TINYINT(1)      NOT NULL DEFAULT 0
                      COMMENT '匿名倾诉模式：0=关闭, 1=开启',

  -- 通知设置（Profile 页面内联配置项）
  `daily_card_push`     TINYINT(1)  NOT NULL DEFAULT 1        COMMENT '每日卡片推送通知',
  `goodnight_reminder`  TINYINT(1)  NOT NULL DEFAULT 1        COMMENT '晚安提醒推送',
  `weekly_report`       TINYINT(1)  NOT NULL DEFAULT 1        COMMENT '情绪周报推送通知',
  `checkin_reminder`    TINYINT(1)  NOT NULL DEFAULT 0        COMMENT '每日打卡提醒推送',

  -- 时间戳
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`) COMMENT '一个用户对应唯一一条设置'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='应用设置表 — 主题/深色/隐私/通知（1:1）';


-- ----------------------------------------------------------------------------
-- 1.4 user_daily_activity — 用户每日活跃流水表
-- 职责：精确计算陪伴天数，记录用户每日是否有活跃行为
-- 业务：每天一条活跃记录，用于 companionDays 精确计算
--       （区别于简单的注册天数，仅记录有交互行为的日子）
-- ----------------------------------------------------------------------------
CREATE TABLE `user_daily_activity` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `activity_date`   DATE            NOT NULL                  COMMENT '活跃日期',
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1         COMMENT '是否有活跃行为：1=有, 0=标记非活跃',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `activity_date`) COMMENT '每人每天一条活跃记录',
  INDEX `idx_user_activity` (`user_id`, `activity_date` DESC) COMMENT '连续陪伴天数计算索引（倒序取最近记录）',
  INDEX `idx_date` (`activity_date`) COMMENT '按日期全局查询活跃用户'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户每日活跃记录 — 用于精确计算陪伴天数';


-- ============================================================================
-- 第二部分：聊天模块（2 表，聊聊 + 树洞共用）
-- 说明：树洞的会话和消息直接写入本模块的 chat_sessions / chat_messages，
--       通过 type='treehole' 区分。树洞专有的情绪标签见第五部分。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 chat_sessions — 聊天会话表
-- 职责：存储所有 AI 对话会话（日常聊天 chat + 树洞倾诉 treehole）
-- 业务：
--   - type 字段区分模块，树洞也写入此表
--   - title 由 AI 首轮自动生成（首条用户消息摘要）
--   - 软删除（标记 deleted_at），消息不物理删除
--   - 会话列表按 last_message_at 倒序排列
-- ----------------------------------------------------------------------------
CREATE TABLE `chat_sessions` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '会话ID',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `type`            ENUM('chat', 'treehole') NOT NULL DEFAULT 'chat'
                      COMMENT '会话类型：chat=日常陪伴, treehole=树洞倾诉',

  -- 会话元信息
  `title`           VARCHAR(200)    DEFAULT NULL              COMMENT '会话标题（AI 首轮自动生成）',
  `preview`         VARCHAR(300)    DEFAULT NULL              COMMENT '最后一条消息摘要（列表预览用）',
  `message_count`   INT UNSIGNED    NOT NULL DEFAULT 0        COMMENT '消息总数（冗余，避免 COUNT）',
  `last_message_at` DATETIME        DEFAULT NULL              COMMENT '最后一条消息发送时间',

  -- 时间戳
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL              COMMENT '软删除时间',

  PRIMARY KEY (`id`),
  INDEX `idx_user_type` (`user_id`, `type`) COMMENT '按用户+类型查询会话列表',
  INDEX `idx_last_message` (`user_id`, `last_message_at` DESC) COMMENT '会话列表排序（最后消息倒序）',
  INDEX `idx_deleted` (`deleted_at`) COMMENT '软删除过滤'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='AI 聊天与树洞会话表（树洞复用，通过 type 区分）';


-- ----------------------------------------------------------------------------
-- 2.2 chat_messages — 聊天消息表
-- 职责：存储所有会话的消息内容（聊天 + 树洞）
-- 业务：
--   - role 区分消息发送者
--   - content 支持简单 HTML（<br> 换行等）
--   - tokens_used 可选的 AI token 消耗记录
--   - meta JSON 扩展（可存情绪标签、意图分类等）
--   - 按 session_id + created_at 顺序拉取消息列表
-- ----------------------------------------------------------------------------
CREATE TABLE `chat_messages` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '消息ID',
  `session_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '所属会话ID（关联 chat_sessions.id）',
  `role`            ENUM('ai', 'user') NOT NULL              COMMENT '消息角色：ai=AI回复, user=用户发送',
  `content`         TEXT            NOT NULL                  COMMENT '消息正文（支持 <br> 等简单 HTML 标签）',

  -- 扩展信息
  `tokens_used`     INT UNSIGNED    DEFAULT NULL              COMMENT 'AI 回复消耗的 token 数',
  `meta`            JSON            DEFAULT NULL              COMMENT '扩展元信息（如情绪分类、关键词等）',

  -- 时间戳
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL              COMMENT '软删除',

  PRIMARY KEY (`id`),
  INDEX `idx_session` (`session_id`, `created_at`) COMMENT '按会话拉取消息列表（时间正序）',
  INDEX `idx_role` (`session_id`, `role`) COMMENT '按角色统计消息数',
  INDEX `idx_created` (`created_at`) COMMENT '按时间查询消息'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='AI 聊天消息表（聊聊与树洞共用）';


-- ============================================================================
-- 第三部分：心情记录模块（3 表）
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 mood_config — 情绪标签配置表（参考数据）
-- 职责：定义 6 种情绪的展示文案、Emoji、分值、色值
-- 业务：
--   - 枚举值固定，可在后端作为常量或存入数据库
--   - score 字段用于月度/周度统计分析
--   - 与 aiReply.ts 的 10 分类不同，此处仅 6 种前端展示情绪
-- ----------------------------------------------------------------------------
CREATE TABLE `mood_config` (
  `mood`       ENUM('happy','calm','sad','anxious','irritable','tearful')
               NOT NULL PRIMARY KEY  COMMENT '情绪枚举主键',
  `label`      VARCHAR(20)  NOT NULL COMMENT '展示文案：开心/平静/低落/焦虑/烦躁/想哭',
  `emoji`      VARCHAR(10)  NOT NULL COMMENT 'Emoji 表情符号：😊 😌 😔 😣 😡 🥺',
  `score`      TINYINT UNSIGNED NOT NULL COMMENT '情绪分值：happy=5, calm=4, sad=2, anxious=2, irritable=1, tearful=1',
  `color`      VARCHAR(10)  NOT NULL COMMENT '展示色值：#7BC97B #97D4A0 #B8A0D0 #FFB085 #E88A6B #F4A988',
  `sort_order` INT          NOT NULL DEFAULT 0 COMMENT '排序权重（小→大）',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='情绪标签配置 — 6 种心情的文案/Emoji/分值/色值';


-- ----------------------------------------------------------------------------
-- 3.2 mood_records — 心情记录表
-- 职责：存储用户每日心情打卡数据
-- 业务：
--   - 每人每天最多一条记录（唯一约束）
--   - note 最长 50 字（前端限制）
--   - keywords 由服务端自动提取或 AI 生成
--   - 覆盖更新：当日已有记录时直接 UPDATE
--   - 连续打卡天数通过倒序扫描 record_date 计算
--   - 月度统计：BETWEEN 日期范围，利用 idx_user_records 索引
--   - 情绪分布：GROUP BY mood，利用 idx_user_mood 覆盖索引
-- ----------------------------------------------------------------------------
CREATE TABLE `mood_records` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`     BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `record_date` DATE            NOT NULL                  COMMENT '记录日期（每人每天最多一条）',

  -- 心情数据
  `mood`        ENUM('happy','calm','sad','anxious','irritable','tearful')
                NOT NULL COMMENT '心情类型（与 mood_config 枚举一致）',
  `score`       TINYINT UNSIGNED NOT NULL DEFAULT 0
                COMMENT '心情分数 1-5（冗余自 mood_config.score，便于统计免 JOIN）',
  `note`        VARCHAR(200)    DEFAULT NULL              COMMENT '今日小话（选填，前端限制最长 50 字）',

  -- 关键词（可选，服务端自动提取）
  `keywords`    JSON            DEFAULT NULL              COMMENT '关键词数组，如 ["工作","焦虑"]',

  -- 时间戳
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`  DATETIME DEFAULT NULL                     COMMENT '软删除',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `record_date`)    COMMENT '每人每天仅一条记录（支持覆盖更新）',

  INDEX `idx_user_records`  (`user_id`, `record_date` DESC) COMMENT '用户记录列表/连续打卡/月度查询',
  INDEX `idx_user_mood`     (`user_id`, `mood`, `record_date`) COMMENT '用户特定情绪的分布趋势',
  INDEX `idx_date`          (`record_date`)                   COMMENT '按日期全局查询',
  INDEX `idx_deleted_at`    (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='每日心情记录表 — 每人每天一条，支持覆盖更新';


-- ----------------------------------------------------------------------------
-- 3.3 weekly_reports — 周报快照表（可选）
-- 职责：缓存已生成的周报摘要，避免实时聚合历史数据
-- 业务：
--   - 每人每周一条快照，由定时任务或按需生成
--   - 周报不存在时回退到实时聚合（通过 mood_records 计算）
--   - summary_text 由 AI 生成治愈文案
-- ----------------------------------------------------------------------------
CREATE TABLE `weekly_reports` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `year_week`       VARCHAR(7)      NOT NULL                  COMMENT '年周标识，如 "2026-W29"',
  `week_range`      VARCHAR(50)     DEFAULT NULL              COMMENT '日期范围文案，如 "7.13 - 7.19"',

  -- 统计数据
  `record_count`    INT UNSIGNED    NOT NULL DEFAULT 0        COMMENT '当周记录条数',
  `dominant_mood`   VARCHAR(20)     DEFAULT NULL              COMMENT '主导情绪（出现最多的 mood 值）',
  `avg_score`       DECIMAL(3,1)    DEFAULT NULL              COMMENT '当周平均情绪分值',
  `summary_text`    VARCHAR(200)    DEFAULT NULL              COMMENT 'AI 生成的治愈摘要文案',
  `keywords`        JSON            DEFAULT NULL              COMMENT '本周关键词聚合数组',

  -- 时间戳
  `generated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '快照生成时间',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_week` (`user_id`, `year_week`) COMMENT '每人每周一条快照',
  INDEX `idx_user_week_data` (`user_id`, `year_week`, `avg_score`, `summary_text`)
    COMMENT '周报查询覆盖索引，无需回表'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='周报快照表 — 每周情绪摘要缓存';


-- ============================================================================
-- 第四部分：治愈卡片模块（7 表）
-- 说明：平台内容流 + 用户创作 + 社区 + 主题合集 + 收藏体系
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 cards — 卡片主表
-- 职责：存储全部卡片（系统预置 + 用户创作 + 社区卡片）
-- 业务：
--   - source=system 为平台预置内容，user_id 为 NULL
--   - source=user 为用户创作（含社区卡片）
--   - 社区卡片 = source=user AND is_public=1
--   - 4 种类型：quote(暖心话) / audio(声音) / landscape(风景) / user-note(用户手账)
--   - 系统卡片使用 content/category/date_label/style_class 字段
--   - 用户卡片使用 author/bg_template/custom_text/custom_image/is_public 字段
--   - likes_count 为冗余计数，通过触发器维护
-- ----------------------------------------------------------------------------
CREATE TABLE `cards` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '卡片ID',
  `source`        ENUM('system', 'user') NOT NULL DEFAULT 'user'
                    COMMENT '来源：system=平台预置, user=用户创作',
  `type`          ENUM('quote', 'audio', 'landscape', 'user-note') NOT NULL
                    COMMENT '卡片类型：quote=暖心话, audio=声音, landscape=风景, user-note=用户手账',
  `user_id`       BIGINT UNSIGNED  DEFAULT NULL
                    COMMENT '创建者ID（source=user 时为创作者；source=system 时为 NULL）',

  -- 平台内容字段（source=system 时使用）
  `content`       VARCHAR(500)     DEFAULT NULL
                    COMMENT '卡片正文（系统卡片必填，支持 <br> 换行）',
  `category`      VARCHAR(50)      DEFAULT NULL
                    COMMENT '分类标签：暖心话 / 风景 / 声音 / 社区',
  `date_label`    VARCHAR(100)     DEFAULT NULL
                    COMMENT '展示标签：如"暖心话 · No.142"、"SUNSET"',
  `style_class`   VARCHAR(20)      DEFAULT NULL
                    COMMENT '样式变体：c-1~c-4(引用) / l-1(风景) / user-1~user-3(用户)',

  -- 用户手账字段（source=user 时使用）
  `author`        VARCHAR(50)      DEFAULT NULL
                    COMMENT '作者昵称（创建时从 user_profiles 同步）',
  `bg_template`   ENUM('warm', 'calm', 'dream') DEFAULT NULL
                    COMMENT '背景模板：warm=暖橘, calm=静谧蓝, dream=梦幻紫',
  `custom_text`   VARCHAR(500)     DEFAULT NULL
                    COMMENT '用户自定义文字内容',
  `custom_image`  VARCHAR(500)     DEFAULT NULL
                    COMMENT '用户配图 URL',
  `is_public`     TINYINT(1)       NOT NULL DEFAULT 0
                    COMMENT '是否公开：0=私密（仅自己可见）, 1=公开（广场可见）',

  -- 计数与时间
  `likes_count`   INT UNSIGNED     NOT NULL DEFAULT 0
                    COMMENT '点赞/收藏总数（冗余计数，通过触发器维护）',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT '创建时间',
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    COMMENT '最后更新时间',
  `deleted_at`    DATETIME         DEFAULT NULL
                    COMMENT '软删除时间',

  PRIMARY KEY (`id`),

  -- 6 类 Tab 列表查询索引
  INDEX `idx_system_created`    (`source`, `deleted_at`, `created_at` DESC)
    COMMENT '系统卡片列表（时间倒序）',
  INDEX `idx_system_type`       (`source`, `type`, `deleted_at`)
    COMMENT '系统卡片按类型筛选（quote/audio/landscape）',
  INDEX `idx_user_cards`        (`user_id`, `deleted_at`, `created_at` DESC)
    COMMENT '用户卡片列表（时间倒序）',
  INDEX `idx_community_created` (`source`, `is_public`, `deleted_at`, `created_at` DESC)
    COMMENT '社区广场列表（最新排序）',
  INDEX `idx_community_likes`   (`source`, `is_public`, `deleted_at`, `likes_count` DESC)
    COMMENT '社区广场列表（最热排序）',
  INDEX `idx_category`          (`category`, `deleted_at`)
    COMMENT '按分类筛选卡片',
  INDEX `idx_deleted_at`        (`deleted_at`)
    COMMENT '软删除过滤',

  -- 全文索引（支持中文搜索，需 MySQL 8+ 或 MariaDB 10.5+）
  FULLTEXT INDEX `ft_search`    (`content`, `custom_text`, `author`)
    COMMENT '全文搜索索引：正文/自定义文字/作者名'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='卡片主表 — 平台内容 + 用户手账 + 社区卡片';


-- ----------------------------------------------------------------------------
-- 4.2 user_favorites — 用户点赞/收藏关系表（多对多）
-- 职责：记录用户与卡片的收藏关系
-- 业务：
--   - 同一用户对同一卡片只能收藏一次（唯一约束）
--   - 对应前端 collectedIds（Set<number>）+ 卡片 liked 状态
--   - 插入/删除时通过触发器维护 cards.likes_count
-- ----------------------------------------------------------------------------
CREATE TABLE `user_favorites` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `card_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '卡片ID（关联 cards.id）',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                 COMMENT '收藏时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_card` (`user_id`, `card_id`)
    COMMENT '同一用户对同一卡片只能收藏一次',

  INDEX `idx_user_id` (`user_id`)   COMMENT '查询用户收藏列表',
  INDEX `idx_card_id` (`card_id`)   COMMENT '查询卡片被收藏情况'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户收藏关系表 — 卡片 liked 状态的依据';


-- ----------------------------------------------------------------------------
-- 4.3 topics — 主题合集表
-- 职责：预设的卡片主题分组，如"睡前的轻声""给焦虑的你"
-- 业务：封面图/颜色样式在前端定义，数据库仅存标识
-- ----------------------------------------------------------------------------
CREATE TABLE `topics` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主题ID',
  `label`       VARCHAR(50)     NOT NULL                  COMMENT '主题名称，如"睡前的轻声"',
  `sub`         VARCHAR(100)    DEFAULT NULL              COMMENT '副标题，如"10 句话"',
  `cover_url`   VARCHAR(500)    DEFAULT NULL              COMMENT '封面图片 URL',
  `color_class` VARCHAR(20)     DEFAULT NULL              COMMENT '样式 class：t-1~t-4',
  `sort_order`  INT             NOT NULL DEFAULT 0      COMMENT '排序权重（小→大）',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='主题合集 — 卡片的分组展示';


-- ----------------------------------------------------------------------------
-- 4.4 topic_cards — 主题-卡片关联表（多对多）
-- 职责：卡片与主题的多对多关系
-- 业务：一张卡片可属于多个主题，同一主题内的卡片可排序
-- ----------------------------------------------------------------------------
CREATE TABLE `topic_cards` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `topic_id`   BIGINT UNSIGNED NOT NULL                 COMMENT '主题ID（关联 topics.id）',
  `card_id`    BIGINT UNSIGNED NOT NULL                 COMMENT '卡片ID（关联 cards.id）',
  `sort_order` INT             NOT NULL DEFAULT 0     COMMENT '卡片在主题内的排序位置',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_topic_card` (`topic_id`, `card_id`)
    COMMENT '同一卡片不能重复加入同一主题',

  INDEX `idx_topic_sort` (`topic_id`, `sort_order`) COMMENT '主题内卡片排序查询',
  INDEX `idx_card_id`    (`card_id`) COMMENT '查询卡片所属的所有主题'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='主题-卡片多对多关联表';


-- ----------------------------------------------------------------------------
-- 4.5 user_collections — 用户收藏集表（收藏夹）
-- 职责：用户可创建多个命名收藏集，将卡片分类收藏
-- 业务：前端 CardDetail 页面支持创建/删除收藏集、卡片移入/移出
-- ----------------------------------------------------------------------------
CREATE TABLE `user_collections` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '收藏集ID',
  `user_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '所属用户ID（关联 users.id）',
  `name`       VARCHAR(100)    NOT NULL                  COMMENT '收藏集名称，如"每日治愈""金句合集"',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`) COMMENT '查询用户的所有收藏集'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='收藏集 — 用户自定义卡片分组';


-- ----------------------------------------------------------------------------
-- 4.6 collection_cards — 收藏集-卡片关联表（多对多）
-- 职责：记录卡片属于哪个收藏集
-- 业务：同一卡片可加入多个收藏集，按加入时间排序
-- ----------------------------------------------------------------------------
CREATE TABLE `collection_cards` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_id` BIGINT UNSIGNED NOT NULL                 COMMENT '收藏集ID（关联 user_collections.id）',
  `card_id`       BIGINT UNSIGNED NOT NULL                 COMMENT '卡片ID（关联 cards.id）',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT '加入收藏集的时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection_card` (`collection_id`, `card_id`)
    COMMENT '同一收藏集内不能重复添加同一卡片',

  INDEX `idx_collection_created` (`collection_id`, `created_at` DESC)
    COMMENT '收藏集内卡片按加入时间排序',
  INDEX `idx_card_id`            (`card_id`)
    COMMENT '查询卡片被加入了哪些收藏集'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='收藏集-卡片多对多关联表';


-- ----------------------------------------------------------------------------
-- 4.7 daily_recommendations — 每日推荐记录表（可选）
-- 职责：记录每天为用户推荐的系统卡片，保证一天内推荐不变
-- 业务：基于日期伪随机或运营配置，每天一条唯一推荐
-- ----------------------------------------------------------------------------
CREATE TABLE `daily_recommendations` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `card_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '推荐的系统卡片ID（关联 cards.id）',
  `recommend_date`  DATE            NOT NULL                  COMMENT '推荐日期',
  `seed`            INT             NOT NULL DEFAULT 0      COMMENT '伪随机种子（日期序列整数）',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date` (`recommend_date`) COMMENT '每天只有一条推荐记录',
  INDEX `idx_date_card` (`recommend_date`, `card_id`) COMMENT '每日推荐查询覆盖索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='每日推荐卡片记录 — 保证一天内推荐固定';


-- ============================================================================
-- 第五部分：树洞模块（2 表，专属）
-- 说明：聊天会话和消息复用第二部分 chat_sessions/chat_messages，
--       创建树洞会话时写入 type='treehole'。本部分仅定义树洞专有表。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 treehole_emotion_tags — 树洞情绪标签表
-- 职责：记录用户在树洞对话中选择的情绪标签
-- 业务：
--   - 每人每天每种情绪仅记录一次（唯一约束）
--   - source 区分触发来源：treehole_prompt（3 轮后弹出）或 manual（手动）
--   - 与 mood_records 的 mood 枚举保持一致（6 种情绪）
--   - 当天数据用于 MoodCheckin 页面回填（通过 sessionStorage 桥接）
-- ----------------------------------------------------------------------------
CREATE TABLE `treehole_emotion_tags` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `session_id`      BIGINT UNSIGNED DEFAULT NULL              COMMENT '来源树洞会话ID（关联 chat_sessions.id）',

  -- 情绪
  `emotion`         ENUM('happy','calm','sad','anxious','irritable','tearful')
                      NOT NULL COMMENT '情绪类型（与 mood_records.mood 枚举一致）',
  `record_date`     DATE            NOT NULL                  COMMENT '标签所属日期',

  -- 来源
  `source`          ENUM('treehole_prompt', 'manual')
                      NOT NULL DEFAULT 'treehole_prompt'
                      COMMENT '来源：treehole_prompt=树洞3轮后触发提议, manual=手动记录',

  -- 时间
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date_emotion` (`user_id`, `record_date`, `emotion`)
                      COMMENT '每人每天每种情绪仅一条',
  INDEX `idx_user_date` (`user_id`, `record_date`) COMMENT '查询某天所有情绪标签',
  INDEX `idx_session` (`session_id`) COMMENT '按会话查询标签'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='树洞情绪标签 — 对话中捕获的情绪快照';


-- ----------------------------------------------------------------------------
-- 5.2 treehole_diary_drafts — 树洞日记草稿表（可选）
-- 职责：暂存用户从树洞跳转到心情签到时的对话摘要
-- 业务：
--   - 前端当前使用 sessionStorage 实现，此表供服务端持久化方案使用
--   - 状态流转：pending → saved（已写入 mood_records）/ expired（超时作废）
-- ----------------------------------------------------------------------------
CREATE TABLE `treehole_diary_drafts` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '草稿ID',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID（关联 users.id）',
  `session_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '来源树洞会话ID（关联 chat_sessions.id）',
  `emotion`         VARCHAR(20)     DEFAULT NULL              COMMENT '选填的情绪标签',
  `summary`         VARCHAR(500)    DEFAULT NULL              COMMENT '对话摘要文字',
  `status`          ENUM('pending', 'saved', 'expired')
                      NOT NULL DEFAULT 'pending'
                      COMMENT '状态：pending=待处理, saved=已保存到日记, expired=已过期',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_user_status` (`user_id`, `status`) COMMENT '查询用户待处理的草稿',
  INDEX `idx_session` (`session_id`) COMMENT '按会话查询草稿'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='树洞日记草稿 — 树洞→心情签到的中间数据';


-- ============================================================================
-- 第六部分：触发器（维护冗余计数）
-- ============================================================================

DELIMITER //

-- 收藏时增加卡片 likes_count
CREATE TRIGGER `trg_favorites_after_insert`
AFTER INSERT ON `user_favorites`
FOR EACH ROW
BEGIN
  UPDATE `cards` SET `likes_count` = `likes_count` + 1 WHERE `id` = NEW.`card_id`;
END//

-- 取消收藏时减少卡片 likes_count
CREATE TRIGGER `trg_favorites_after_delete`
AFTER DELETE ON `user_favorites`
FOR EACH ROW
BEGIN
  UPDATE `cards` SET `likes_count` = `likes_count` - 1 WHERE `id` = OLD.`card_id`;
END//

DELIMITER ;

-- 触发器和冗余计数设计原则：
-- 仅保留有明确性能必要的冗余计数器：
--   - chat_sessions.message_count：避免会话列表 N+1 COUNT（保留，应用层维护）
--   - cards.likes_count：支持社区按热度排序，通过触发器维护
-- 已移除的冗余计数（数据量小，实时计算成本低）：
--   - user_profiles.companion_days / chat_rounds / diary_count / collection_count
--   - topics.card_count


-- ============================================================================
-- 第七部分：初始种子数据
-- ============================================================================

-- ---- 7.1 用户示例 ----
INSERT INTO `users` (`id`, `phone`, `password_hash`, `nickname`, `avatar`) VALUES
(1, '13800138000', '$2a$10$dummyhashfordemo', '小柚子', '🦊');

INSERT INTO `user_profiles` (`user_id`, `ai_name`, `voice`, `character_tags`, `character_bio`) VALUES
(1, '小愈', '温柔女声', '["聆听者","知心朋友","鼓励者"]', '一个总是耐心倾听、温柔鼓励我的知心朋友');

INSERT INTO `user_settings` (`user_id`, `theme_key`, `dark_mode`, `anonymous_mode`) VALUES
(1, 'morning', 0, 0);

-- ---- 7.2 情绪配置 ----
INSERT INTO `mood_config` (`mood`, `label`, `emoji`, `score`, `color`, `sort_order`) VALUES
('happy',     '开心',   '😊', 5, '#7BC97B', 1),
('calm',      '平静',   '😌', 4, '#97D4A0', 2),
('sad',       '低落',   '😔', 2, '#B8A0D0', 3),
('anxious',   '焦虑',   '😣', 2, '#FFB085', 4),
('irritable', '烦躁',   '😡', 1, '#E88A6B', 5),
('tearful',   '想哭',   '🥺', 1, '#F4A988', 6);

-- ---- 7.3 心情记录示例 ----
INSERT INTO `mood_records` (`user_id`, `record_date`, `mood`, `score`, `note`) VALUES
(1, '2026-07-13', 'calm',     4, '今天心情不错，和朋友聊了天'),
(1, '2026-07-14', 'sad',      2, '工作有点累'),
(1, '2026-07-15', 'anxious',  2, '项目延期了，很焦虑'),
(1, '2026-07-16', 'calm',     4, '问题解决了，松了口气'),
(1, '2026-07-17', 'happy',    5, '周末去公园散步了'),
(1, '2026-07-18', 'sad',      2, '有点无聊'),
(1, '2026-07-19', 'calm',     4, '新的一周开始了'),
(1, '2026-07-20', 'happy',    5, '今天天气很好，出门拍了照片 📷'),
(1, '2026-07-21', 'happy',    5, '约了朋友吃饭，聊得很开心'),
(1, '2026-07-22', 'calm',     4, '安静地看了一本书'),
(1, '2026-07-23', 'irritable',1, '被莫名其妙的事情惹到了'),
(1, '2026-07-24', 'calm',     4, '整理了一下房间，心情变好了'),
(1, '2026-07-25', 'happy',    5, '收到了一束花 💐'),
(1, '2026-07-26', 'happy',    5, '今天做了顿好吃的犒劳自己 🍳');

-- ---- 7.4 周报快照示例 ----
INSERT INTO `weekly_reports` (`user_id`, `year_week`, `week_range`, `record_count`, `dominant_mood`, `avg_score`, `summary_text`, `keywords`) VALUES
(1, '2026-W29', '7.13 - 7.19', 7, 'calm', 3.6, '像被温柔地托着，慢慢稳下来', '["工作压力","好天气","放松","焦虑"]'),
(1, '2026-W30', '7.20 - 7.26', 7, 'happy', 4.3, '阳光从缝隙里照进来，心里暖洋洋的', '["朋友","美食","天气","整理"]');

-- ---- 7.5 会话示例（聊聊 + 树洞） ----
INSERT INTO `chat_sessions` (`id`, `user_id`, `type`, `title`, `preview`, `message_count`, `last_message_at`) VALUES
(1, 1, 'chat', '工作的烦恼',     '今天真的好累，所有事都堆在一起…', 12, '2026-07-27 09:33:00'),
(2, 1, 'chat', '和家人吵架',     '不知道该怎么面对，感觉很愧疚…',   8,  '2026-07-26 22:10:00'),
(3, 1, 'chat', '即将到来的面试', '准备了好久的面试，还是很紧张…',   15, '2026-07-25 20:30:00'),
(4, 1, 'treehole', '树洞 · 07/27', '今天真的好累，所有事堆在一起，不想说话', 5, '2026-07-27 09:24:00');

INSERT INTO `chat_messages` (`session_id`, `role`, `content`) VALUES
(1, 'ai',   '早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~'),
(1, 'user', '嗯…其实有点累'),
(1, 'ai',   '嗯嗯，我在 💛<br>是身体上的累，还是心里那种？慢慢说，不着急。'),
(4, 'ai',   '我在这里 🌙<br>想说什么都可以，慢慢来。'),
(4, 'user', '今天真的好累，所有事都堆在一起，不想和任何人说话。'),
(4, 'ai',   '嗯…听起来真的很沉重。<br>累了就先这样待一会儿，不说话也没关系。');

-- ---- 7.6 系统卡片 ----
INSERT INTO `cards` (`id`, `source`, `type`, `content`, `category`, `date_label`, `style_class`, `likes_count`) VALUES
(1,  'system', 'quote',     '允许自己慢一点，<br>那不叫懒，<br>那叫在好好生活。',           '暖心话', '暖心话 · No.142', 'c-1', 42),
(2,  'system', 'quote',     '难过的时候，<br>就当世界在给你<br>一个长长的拥抱。',       '暖心话', '暖心话 · No.143', 'c-2', 38),
(3,  'system', 'landscape', '晚霞，是天空最温柔的「今天辛苦了」。',                    '风景',   'SUNSET',           'l-1', 56),
(4,  'system', 'quote',     '吃饭要慢慢吃，<br>走路要慢慢走，<br>喜欢你也是。',         '暖心话', '暖心话 · No.144', 'c-3', 44),
(5,  'system', 'quote',     '今天也是被世界<br>悄悄爱着的一天，<br>只是你还没发现。',     '暖心话', '暖心话 · No.145', 'c-4', 51),
(6,  'system', 'audio',     '',                                                         '声音',   '白噪音 · 窗外的雨',  '',   23),
(7,  'system', 'quote',     '你不需要成为谁，<br>你只需要成为你自己。',                 '暖心话', '暖心话 · No.146', 'c-1', 33),
(8,  'system', 'quote',     '今天不想努力也没关系，<br>休息也是一种进步。',               '暖心话', '暖心话 · No.147', 'c-2', 47),
(9,  'system', 'landscape', '海风吹过的时候，<br>所有心事都变轻了。',                    '风景',   'OCEAN',            'l-1', 39),
(10, 'system', 'quote',     '你已经做得很好了，<br>剩下的交给时间吧。',                  '暖心话', '暖心话 · No.148', 'c-3', 62),
(11, 'system', 'audio',     '',                                                         '声音',   '白噪音 · 篝火晚风',  '',   18),
(12, 'system', 'quote',     '心里的褶皱，<br>会被时间慢慢熨平。',                        '暖心话', '暖心话 · No.149', 'c-4', 29),
(13, 'system', 'quote',     '所有的不开心<br>都会在今天结束。',                          '暖心话', '暖心话 · No.150', 'c-1', 55),
(14, 'system', 'landscape', '月亮不睡你不睡，<br>你是人间小美味。',                      '风景',   'MOON',             'l-1', 41),
(15, 'system', 'quote',     '你比你以为的<br>更值得被爱。',                               '暖心话', '暖心话 · No.151', 'c-2', 73),
(16, 'system', 'audio',     '',                                                         '声音',   '白噪音 · 清晨鸟鸣',  '',   31),
(17, 'system', 'quote',     '不需要总是坚强，<br>脆弱也是一种勇气。',                    '暖心话', '暖心话 · No.152', 'c-3', 36),
(18, 'system', 'quote',     '慢慢来，<br>谁不是一边受伤一边长大。',                      '暖心话', '暖心话 · No.153', 'c-4', 48),
(19, 'system', 'landscape', '下雨天的窗户，<br>是最好的白噪音。',                        '风景',   'RAIN',             'l-1', 27),
(20, 'system', 'quote',     '生活原本沉闷，<br>但跑起来就有风。',                        '暖心话', '暖心话 · No.154', 'c-1', 59),
(21, 'system', 'audio',     '',                                                         '声音',   '白噪音 · 森林漫步',  '',   15),
(22, 'system', 'quote',     '对自己温柔一点，<br>你也是宇宙的孩子。',                    '暖心话', '暖心话 · No.155', 'c-2', 44);

-- ---- 7.7 主题合集 ----
INSERT INTO `topics` (`id`, `label`, `sub`, `color_class`, `sort_order`) VALUES
(1, '睡前的轻声',   '10 句话',  't-1', 1),
(2, '给焦虑的你',   '致你',     't-2', 2),
(3, '一个人的晚餐', '一个人',   't-3', 3),
(4, '30 天晚安',    '慢生活',   't-4', 4);

INSERT INTO `topic_cards` (`topic_id`, `card_id`, `sort_order`) VALUES
(1, 1, 1), (1, 4, 2),
(2, 2, 1), (2, 5, 2),
(3, 4, 1),
(4, 1, 1), (4, 2, 2), (4, 4, 3), (4, 5, 4);

-- ---- 7.8 树洞情绪标签（注意：使用 ENUM 中定义的合法值） ----
INSERT INTO `treehole_emotion_tags` (`user_id`, `session_id`, `emotion`, `record_date`, `source`) VALUES
(1, 4, 'sad',     '2026-07-27', 'treehole_prompt'),
(1, 4, 'anxious', '2026-07-27', 'treehole_prompt');


-- ============================================================================
-- 第八部分：索引策略速查
-- ============================================================================
-- 参见各表注释。高频查询模式摘要：
--
-- 【用户】uk_phone → 登录/注册去重
-- 【用户】uk_user (user_profiles/user_settings) → 个人信息
-- 【用户】idx_user_activity → 连续陪伴天数
-- 【聊天】idx_last_message → 会话列表倒序
-- 【聊天】idx_session → 消息列表时间正序
-- 【心情】uk_user_date → 每日签到/更新
-- 【心情】idx_user_records → 月度统计/连续打卡
-- 【心情】uk_user_week → 周报快照
-- 【卡片】idx_system_* → 系统卡片 Tab 列表
-- 【卡片】idx_user_cards → 我的创作列表
-- 【卡片】idx_community_* → 广场列表(最新/最热)
-- 【卡片】ft_search → 全文搜索
-- 【卡片】uk_user_card → 收藏状态
-- 【卡片】idx_topic_sort → 主题卡片列表
-- 【树洞】uk_user_date_emotion → 情绪标签幂等
-- 【树洞】idx_user_date → 今日标签列表
