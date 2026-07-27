-- ============================================================================
-- 小愈 — 心情记录模块 数据库表结构
-- 适用数据库：MySQL 8.0+ / MariaDB 10.5+
-- 字符集：utf8mb4
--
-- 设计原则：所有外键均为逻辑外键，不设物理 FOREIGN KEY 约束。
-- 关联字段通过列注释标明所引用的表，通过 INDEX 保障查询性能。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 心情记录表
--    存储用户每日心情打卡数据。
-- ----------------------------------------------------------------------------
CREATE TABLE `mood_records` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',
  `record_date` DATE           NOT NULL                  COMMENT '记录日期（每人每天最多一条）',

  -- 心情
  `mood`       ENUM('happy', 'calm', 'sad', 'anxious', 'irritable', 'tearful')
               NOT NULL COMMENT '心情类型',
  `score`      TINYINT UNSIGNED NOT NULL DEFAULT 0
               COMMENT '心情分数 1-5（枚举映射，冗余便于统计）',
  `note`       VARCHAR(200)    DEFAULT NULL               COMMENT '今日小话（选填，最长 50 字）',

  -- 关键词（自动提取）
  `keywords`   JSON            DEFAULT NULL               COMMENT '关键词数组，如 ["工作","焦虑"]',

  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL                      COMMENT '软删除',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `record_date`)    COMMENT '每人每天仅一条记录',

  -- 记录列表按时间倒序（也覆盖按月查询：BETWEEN 可前向扫描该索引）
  INDEX `idx_user_records`  (`user_id`, `record_date` DESC)  COMMENT '用户记录列表 + 连续打卡计算',
  -- 情绪分布统计（某用户某种情绪的分布趋势）
  INDEX `idx_user_mood`     (`user_id`, `mood`, `record_date`)
    COMMENT '用户情绪分布统计',
  -- 按日期全局查询
  INDEX `idx_date`          (`record_date`)                   COMMENT '按日期查询',
  -- 软删除过滤
  INDEX `idx_deleted_at`    (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='每日心情记录 — 每人每天一条，可覆盖更新';


-- ----------------------------------------------------------------------------
-- 2. 情绪标签配置表（参考数据）
--    记录每种心情的展示文案、emoji、分数、颜色。
--    可在后端作为枚举常量，也可存入数据库便于运营调整。
-- ----------------------------------------------------------------------------
CREATE TABLE `mood_config` (
  `mood`    ENUM('happy', 'calm', 'sad', 'anxious', 'irritable', 'tearful')
            NOT NULL PRIMARY KEY  COMMENT '心情枚举值',
  `label`   VARCHAR(20)  NOT NULL COMMENT '展示文案，如"开心""平静"',
  `emoji`   VARCHAR(10)  NOT NULL COMMENT '表情符号，如 😊 😌',
  `score`   TINYINT UNSIGNED NOT NULL COMMENT '情绪分值 1-5',
  `color`   VARCHAR(10)  NOT NULL COMMENT '展示色值，如 #7BC97B',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='情绪标签配置 — 文案、表情、分数、颜色';


-- ----------------------------------------------------------------------------
-- 3. 周报快照表（可选）
--    存储历史周报摘要，避免实时聚合历史数据。
-- ----------------------------------------------------------------------------
CREATE TABLE `weekly_reports` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',

  `year_week`       VARCHAR(7)      NOT NULL                  COMMENT '年周，如 "2026-W29"',
  `week_range`      VARCHAR(50)     DEFAULT NULL              COMMENT '日期范围文案，如 "7.13 - 7.19"',

  `record_count`    INT UNSIGNED    NOT NULL DEFAULT 0        COMMENT '当周记录条数',
  `dominant_mood`   VARCHAR(20)     DEFAULT NULL              COMMENT '主导情绪',
  `avg_score`       DECIMAL(3,1)    DEFAULT NULL              COMMENT '平均分',
  `summary_text`    VARCHAR(200)    DEFAULT NULL              COMMENT 'AI 摘要文案',
  `keywords`        JSON            DEFAULT NULL              COMMENT '本周关键词数组',

  `generated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                      COMMENT '生成时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_week` (`user_id`, `year_week`) COMMENT '每人每周一条快照',

  -- 查询某用户某周的周报（覆盖索引，无需回表）
  INDEX `idx_user_week_data` (`user_id`, `year_week`, `avg_score`, `summary_text`)
    COMMENT '周报查询覆盖索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='周报快照 — 每周情绪摘要（可选缓存）';


-- ============================================================================
-- 索引策略说明
-- ============================================================================
-- 高频查询：
--   1. 日历视图 GET /mood?year=2026&month=7
--      → SELECT * FROM mood_records WHERE user_id=? AND record_date
--        BETWEEN '2026-07-01' AND '2026-07-31' ORDER BY record_date
--      → idx_user_records（user_id + record_date DESC，BETWEEN 可前向扫描，
--        结果天然按 record_date 升序排列）
--
--   2. 签到 GET /mood/checkin
--      → SELECT * FROM mood_records WHERE user_id=? AND record_date=CURDATE()
--      → uk_user_date（唯一索引，最多一条记录）
--
--   3. 详情 GET /mood/detail?date=2026-07-20
--      → 同上 uk_user_date
--
--   4. 连续打卡天数
--      → SELECT record_date FROM mood_records WHERE user_id=?
--        ORDER BY record_date DESC LIMIT 365
--      → idx_user_records（覆盖索引，DESC 顺序匹配，无需回表）
--
--   5. 情绪分布统计
--      → SELECT mood, COUNT(1) FROM mood_records
--        WHERE user_id=? AND record_date BETWEEN ? AND ?
--        GROUP BY mood
--      → idx_user_mood（user_id + mood + record_date，覆盖 GROUP BY）
--
--   6. 周报 GET /mood/report?year=2026&week=29
--      → SELECT * FROM weekly_reports WHERE user_id=? AND year_week='2026-W29'
--      → uk_user_week（唯一索引）
--      或只取关键字段：
--      → idx_user_week_data（覆盖索引，无需回表，直接返回 avg_score 等）


-- ============================================================================
-- 初始种子数据
-- ============================================================================

-- ---- 情绪配置 ----
INSERT INTO `mood_config` (`mood`, `label`, `emoji`, `score`, `color`, `sort_order`) VALUES
('happy',     '开心',   '😊', 5, '#7BC97B', 1),
('calm',      '平静',   '😌', 4, '#97D4A0', 2),
('sad',       '低落',   '😔', 2, '#B8A0D0', 3),
('anxious',   '焦虑',   '😣', 2, '#FFB085', 4),
('irritable', '烦躁',   '😡', 1, '#E88A6B', 5),
('tearful',   '想哭',   '🥺', 1, '#F4A988', 6);

-- ---- 示例心情记录（用户ID=1） ----
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

-- ---- 示例周报快照 ----
INSERT INTO `weekly_reports` (`user_id`, `year_week`, `week_range`, `record_count`, `dominant_mood`, `avg_score`, `summary_text`, `keywords`) VALUES
(1, '2026-W29', '7.13 - 7.19', 7, 'calm', 3.6, '像被温柔地托着，慢慢稳下来', '["工作压力","好天气","放松","焦虑"]'),
(1, '2026-W30', '7.20 - 7.26', 7, 'happy', 4.3, '阳光从缝隙里照进来，心里暖洋洋的', '["朋友","美食","天气","整理"]');
