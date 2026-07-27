-- ============================================================================
-- 小愈 — 治愈卡片模块 数据库表结构
-- 适用数据库：MySQL 8.0+ / MariaDB 10.5+
-- 字符集：utf8mb4（支持 emoji 和中文）
--
-- 设计原则：所有外键均为逻辑外键，不设物理 FOREIGN KEY 约束。
-- 关联字段通过列注释标明所引用的表，通过 INDEX 保障查询性能。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 卡片主表
--    存储全部卡片：系统预置内容（source=system）和用户创作（source=user）。
--    社区卡片本质是 source=user 且 is_public=1 的其他用户卡片。
-- ----------------------------------------------------------------------------
CREATE TABLE `cards` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '卡片ID',
  `source`        ENUM('system', 'user') NOT NULL DEFAULT 'user'
                    COMMENT '来源：system=平台预置, user=用户创作',
  `type`          ENUM('quote', 'audio', 'landscape', 'user-note') NOT NULL
                    COMMENT '卡片类型：quote=暖心话, audio=声音, landscape=风景, user-note=用户手账',
  `user_id`       BIGINT UNSIGNED  DEFAULT NULL
                    COMMENT '创建者用户ID（source=user 时为创作者；source=system 时为 NULL）',

  -- 平台内容字段（source=system 时使用）
  `content`       VARCHAR(500)     DEFAULT NULL
                    COMMENT '卡片正文（系统卡片必填，支持 <br> 换行）',
  `category`      VARCHAR(50)      DEFAULT NULL
                    COMMENT '分类：暖心话 / 风景 / 声音 / 社区',
  `date_label`    VARCHAR(100)     DEFAULT NULL
                    COMMENT '展示日期/编号标签，如"暖心话 · No.142"、"SUNSET"',
  `style_class`   VARCHAR(20)      DEFAULT NULL
                    COMMENT '样式变体 class：c-1~c-4（引用）/ l-1（风景）/ user-1~user-3（用户）',

  -- 用户手账字段（source=user 时使用）
  `author`        VARCHAR(50)      DEFAULT NULL
                    COMMENT '作者昵称（创建时从用户资料同步）',
  `bg_template`   ENUM('warm', 'calm', 'dream') DEFAULT NULL
                    COMMENT '背景模板：warm=暖橘, calm=静谧蓝, dream=梦幻紫',
  `custom_text`   VARCHAR(500)     DEFAULT NULL
                    COMMENT '用户自定义文字',
  `custom_image`  VARCHAR(500)     DEFAULT NULL
                    COMMENT '用户配图 URL',
  `is_public`     TINYINT(1)       NOT NULL DEFAULT '0'
                    COMMENT '是否公开：0=私密（仅自己可见）, 1=公开（广场可见）',

  -- 计数与时间
  `likes_count`   INT UNSIGNED     NOT NULL DEFAULT '0'
                    COMMENT '点赞总数（冗余计数，避免 COUNT 开销）',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT '创建时间',
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    COMMENT '最后更新时间',
  `deleted_at`    DATETIME         DEFAULT NULL
                    COMMENT '软删除时间（非 NULL 表示已删除）',

  PRIMARY KEY (`id`),

  -- Tab 列表：今日推荐（source=system 按时间排序）
  INDEX `idx_system_created`  (`source`, `deleted_at`, `created_at` DESC)
    COMMENT '系统卡片列表 + 时间排序',
  -- Tab 列表：暖心话 / 声音 / 风景（source=system + type 筛选）
  INDEX `idx_system_type`     (`source`, `type`, `deleted_at`)
    COMMENT '系统卡片按类型筛选',
  -- Tab 列表：我的创作（按用户 + 时间倒序）
  INDEX `idx_user_cards`      (`user_id`, `deleted_at`, `created_at` DESC)
    COMMENT '用户卡片列表 + 时间排序',
  -- Tab 列表：社区广场（公开卡片，最新排序）
  INDEX `idx_community_created` (`source`, `is_public`, `deleted_at`, `created_at` DESC)
    COMMENT '社区广场最新排序',
  -- Tab 列表：社区广场（公开卡片，最热排序）
  INDEX `idx_community_likes`   (`source`, `is_public`, `deleted_at`, `likes_count` DESC)
    COMMENT '社区广场最热排序',
  -- 按分类筛选
  INDEX `idx_category`        (`category`, `deleted_at`)
    COMMENT '按分类筛选',
  -- 软删除过滤
  INDEX `idx_deleted_at`      (`deleted_at`)
    COMMENT '软删除过滤',

  -- 全文索引（支持中文搜索，需 MySQL 8+ 或 MariaDB 10.5+）
  FULLTEXT INDEX `ft_search`  (`content`, `custom_text`, `author`)
    COMMENT '全文搜索：内容/自定义文字/作者'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='卡片主表 — 平台内容 + 用户手账 + 社区卡片';


-- ----------------------------------------------------------------------------
-- 2. 用户点赞/收藏表（多对多）
--    liked 状态通过此表关联查询：EXISTS (SELECT 1 FROM user_favorites WHERE ...)
-- ----------------------------------------------------------------------------
CREATE TABLE `user_favorites` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `user_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '用户ID',
  `card_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '卡片ID',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                 COMMENT '收藏时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_card` (`user_id`, `card_id`)
    COMMENT '同一用户对同一卡片只能收藏一次',

  INDEX `idx_user_id`   (`user_id`)   COMMENT '查询用户收藏列表',
  INDEX `idx_card_id`   (`card_id`)   COMMENT '查询卡片被哪些人收藏'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户点赞/收藏关系表 — 对应前端 collectedIds + liked 状态';


-- ----------------------------------------------------------------------------
-- 3. 主题合集表
-- ----------------------------------------------------------------------------
CREATE TABLE `topics` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主题ID',
  `label`       VARCHAR(50)     NOT NULL                  COMMENT '主题名称，如"睡前的轻声"',
  `sub`         VARCHAR(100)    DEFAULT NULL              COMMENT '副标题，如"10 句话"',
  `cover_url`   VARCHAR(500)    DEFAULT NULL              COMMENT '封面图片 URL',
  `color_class` VARCHAR(20)     DEFAULT NULL              COMMENT '样式 class：t-1~t-4',
  `card_count`  INT UNSIGNED    NOT NULL DEFAULT '0'      COMMENT '包含卡片数（冗余）',
  `sort_order`  INT             NOT NULL DEFAULT '0'      COMMENT '排序权重（小→大）',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='主题合集 — 如"睡前的轻声""给焦虑的你"等';


-- ----------------------------------------------------------------------------
-- 4. 主题-卡片关联表（多对多）
-- ----------------------------------------------------------------------------
CREATE TABLE `topic_cards` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `topic_id`   BIGINT UNSIGNED NOT NULL                 COMMENT '主题ID',
  `card_id`    BIGINT UNSIGNED NOT NULL                 COMMENT '卡片ID',
  `sort_order` INT             NOT NULL DEFAULT '0'     COMMENT '卡片在主题内的排序',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_topic_card` (`topic_id`, `card_id`)
    COMMENT '同一卡片不能重复加入同一主题',

  INDEX `idx_topic_sort` (`topic_id`, `sort_order`) COMMENT '主题内卡片排序',
  INDEX `idx_card_id`  (`card_id`)  COMMENT '查询卡片所属的主题'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='主题与卡片的多对多关联';


-- ----------------------------------------------------------------------------
-- 5. 用户收藏集（收藏夹）
--    用户可创建多个命名收藏集，将卡片分类归档。
-- ----------------------------------------------------------------------------
CREATE TABLE `user_collections` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '收藏集ID',
  `user_id`    BIGINT UNSIGNED NOT NULL                  COMMENT '所属用户ID',
  `name`       VARCHAR(100)    NOT NULL                  COMMENT '收藏集名称，如"每日治愈""金句合集"',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`) COMMENT '查询用户的所有收藏集'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='收藏集 — 用户自定义分组';


-- ----------------------------------------------------------------------------
-- 6. 收藏集-卡片关联表（多对多）
-- ----------------------------------------------------------------------------
CREATE TABLE `collection_cards` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_id` BIGINT UNSIGNED NOT NULL                 COMMENT '收藏集ID',
  `card_id`       BIGINT UNSIGNED NOT NULL                 COMMENT '卡片ID',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT '加入时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection_card` (`collection_id`, `card_id`)
    COMMENT '同一卡片不能重复加入同一收藏集',

  INDEX `idx_collection_created` (`collection_id`, `created_at` DESC)
    COMMENT '收藏集内卡片按加入时间排序',
  INDEX `idx_card_id`       (`card_id`)       COMMENT '查询卡片被加入哪些收藏集'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='收藏集与卡片的多对多关联';


-- ----------------------------------------------------------------------------
-- 7. 每日推荐记录表（可选）
--    记录每天为用户推荐了哪张卡片，保证一天内不变。
-- ----------------------------------------------------------------------------
CREATE TABLE `daily_recommendations` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `card_id`     BIGINT UNSIGNED NOT NULL                  COMMENT '推荐的系统卡片ID',
  `recommend_date` DATE         NOT NULL                  COMMENT '推荐日期',
  `seed`        INT             NOT NULL DEFAULT '0'      COMMENT '伪随机种子（日期序列）',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date` (`recommend_date`) COMMENT '每天只有一条推荐',
  INDEX `idx_date_card` (`recommend_date`, `card_id`) COMMENT '每日推荐查询覆盖索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='每日推荐记录 — 确保一天内推荐卡片不变';


-- ============================================================================
-- 索引策略说明
-- ============================================================================
-- 高频查询模式及对应索引：
--
-- 1. Tab 列表（/cards）
--    recommend → SELECT * FROM cards WHERE source='system'
--                AND deleted_at IS NULL ORDER BY created_at DESC
--                →  idx_system_created
--    warm      → SELECT * FROM cards WHERE source='system' AND type='quote'
--                AND deleted_at IS NULL        →  idx_system_type
--    audio     → SELECT * FROM cards WHERE source='system' AND type='audio'
--                AND deleted_at IS NULL        →  idx_system_type
--    scene     → SELECT * FROM cards WHERE source='system' AND type='landscape'
--                AND deleted_at IS NULL        →  idx_system_type
--    my-cards  → SELECT * FROM cards WHERE user_id=?
--                AND deleted_at IS NULL ORDER BY created_at DESC
--                →  idx_user_cards
--    community → SELECT * FROM cards WHERE source='user' AND is_public=1
--                AND deleted_at IS NULL ORDER BY created_at DESC
--                →  idx_community_created
--                ORDER BY likes_count DESC     →  idx_community_likes
--
-- 2. 搜索（keyword）
--    SELECT ... WHERE MATCH(content, custom_text, author) AGAINST(...)
--    →  ft_search 全文索引
--    后备方案：keyword 也可用 LIKE 配合 idx_category
--
-- 3. 详情页（/cards/:id）
--    SELECT * FROM cards WHERE id=?  →  PRIMARY KEY
--    SELECT 1 FROM user_favorites WHERE user_id=? AND card_id=?
--    →  uk_user_card（唯一索引，无需回表）
--
-- 4. 主题合集
--    SELECT * FROM topic_cards WHERE topic_id=? ORDER BY sort_order
--    →  idx_topic_sort（覆盖索引，无需回表）
--
-- 5. 收藏集
--    SELECT * FROM user_collections WHERE user_id=?  →  idx_user_id
--    SELECT * FROM collection_cards WHERE collection_id=?
--    ORDER BY created_at DESC         →  idx_collection_created
--
-- 6. 点赞计数
--    SELECT COUNT(1) FROM user_favorites WHERE card_id=?
--    →  idx_card_id（覆盖索引的二级索引）
--    （也可从 cards.likes_count 冗余字段直接读取，避免 COUNT 开销）
--
-- 7. 每日推荐
--    SELECT card_id FROM daily_recommendations WHERE recommend_date=CURDATE()
--    →  idx_date_card（覆盖索引，无需回表）


-- ============================================================================
-- 触发器：自动维护 likes_count（可选）
-- ============================================================================
DELIMITER //

CREATE TRIGGER `trg_favorites_after_insert`
AFTER INSERT ON `user_favorites`
FOR EACH ROW
BEGIN
  UPDATE `cards` SET `likes_count` = `likes_count` + 1 WHERE `id` = NEW.`card_id`;
END//

CREATE TRIGGER `trg_favorites_after_delete`
AFTER DELETE ON `user_favorites`
FOR EACH ROW
BEGIN
  UPDATE `cards` SET `likes_count` = `likes_count` - 1 WHERE `id` = OLD.`card_id`;
END//

DELIMITER ;


-- ============================================================================
-- 初始种子数据
-- ============================================================================

-- ---- 系统卡片 ----
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

-- ---- 主题合集 ----
INSERT INTO `topics` (`id`, `label`, `sub`, `color_class`, `card_count`, `sort_order`) VALUES
(1, '睡前的轻声',   '10 句话',  't-1', 2, 1),
(2, '给焦虑的你',   '致你',     't-2', 2, 2),
(3, '一个人的晚餐', '一个人',   't-3', 1, 3),
(4, '30 天晚安',    '慢生活',   't-4', 4, 4);

-- ---- 主题-卡片关联 ----
INSERT INTO `topic_cards` (`topic_id`, `card_id`, `sort_order`) VALUES
(1, 1,  1),
(1, 4,  2),
(2, 2,  1),
(2, 5,  2),
(3, 4,  1),
(4, 1,  1),
(4, 2,  2),
(4, 4,  3),
(4, 5,  4);
