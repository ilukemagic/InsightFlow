-- InsightFlow 数据库初始化脚本

-- 用户事件表（核心表）
CREATE TABLE user_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID', 
    event_type VARCHAR(32) NOT NULL COMMENT '事件类型：click, view, scroll, purchase等',
    page_url VARCHAR(512) NOT NULL COMMENT '页面URL',
    element VARCHAR(128) COMMENT '元素标识',
    element_text VARCHAR(256) COMMENT '元素文本',
    position_x INT COMMENT '点击位置X坐标',
    position_y INT COMMENT '点击位置Y坐标',
    user_agent VARCHAR(512) COMMENT '用户代理',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    timestamp BIGINT NOT NULL COMMENT '事件时间戳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_page_url (page_url),
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户行为事件表';

-- 用户信息表
CREATE TABLE users (
    user_id VARCHAR(64) PRIMARY KEY COMMENT '用户ID',
    first_visit TIMESTAMP NOT NULL COMMENT '首次访问时间',
    last_visit TIMESTAMP NOT NULL COMMENT '最后访问时间',
    total_events INT DEFAULT 0 COMMENT '总事件数',
    total_sessions INT DEFAULT 0 COMMENT '总会话数',
    device_type VARCHAR(32) COMMENT '设备类型',
    browser VARCHAR(64) COMMENT '浏览器',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_first_visit (first_visit),
    INDEX idx_last_visit (last_visit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础信息表';

-- 分析结果缓存表
CREATE TABLE analysis_cache (
    cache_key VARCHAR(128) PRIMARY KEY COMMENT '缓存键',
    result_data JSON COMMENT '分析结果JSON',
    expire_time TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expire_time (expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分析结果缓存表';

-- 漏斗配置表
CREATE TABLE funnel_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funnel_name VARCHAR(64) NOT NULL COMMENT '漏斗名称',
    steps JSON NOT NULL COMMENT '漏斗步骤配置',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='漏斗配置表';

-- 插入默认漏斗配置
INSERT INTO funnel_configs (funnel_name, steps) VALUES 
('购买转化漏斗', JSON_ARRAY(
    JSON_OBJECT('step', 1, 'name', '页面访问', 'event_type', 'view'),
    JSON_OBJECT('step', 2, 'name', '商品点击', 'event_type', 'click', 'element', 'product'),
    JSON_OBJECT('step', 3, 'name', '加入购物车', 'event_type', 'click', 'element', 'add_cart'),
    JSON_OBJECT('step', 4, 'name', '完成购买', 'event_type', 'purchase')
));

-- 创建测试数据
INSERT INTO user_events (user_id, session_id, event_type, page_url, element, element_text, position_x, position_y, timestamp) VALUES
('user_001', 'session_001', 'view', '/product/123', NULL, NULL, NULL, NULL, UNIX_TIMESTAMP() * 1000),
('user_001', 'session_001', 'click', '/product/123', 'product', '商品详情', 300, 400, UNIX_TIMESTAMP() * 1000 + 5000),
('user_001', 'session_001', 'click', '/product/123', 'add_cart', '加入购物车', 450, 600, UNIX_TIMESTAMP() * 1000 + 15000),
('user_002', 'session_002', 'view', '/product/456', NULL, NULL, NULL, NULL, UNIX_TIMESTAMP() * 1000 + 30000),
('user_002', 'session_002', 'click', '/product/456', 'product', '商品详情', 320, 380, UNIX_TIMESTAMP() * 1000 + 35000);

COMMIT; 