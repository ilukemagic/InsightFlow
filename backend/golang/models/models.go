package models

import "time"

// 事件类型常量
const (
	EventTypeClick            = "click"
	EventTypeView             = "view"
	EventTypeScroll           = "scroll"
	EventTypePurchase         = "purchase"
	EventTypeSubmit           = "submit"
	EventTypeLoad             = "load"
	EventTypeExit             = "exit"
	EventTypeVisibilityChange = "visibility_change"
)

// 设备类型常量
const (
	DeviceTypeDesktop = "desktop"
	DeviceTypeMobile  = "mobile"
	DeviceTypeTablet  = "tablet"
)

// 缓存过期时间常量
const (
	CacheExpireShort  = 5 * time.Minute // 5分钟
	CacheExpireMedium = 1 * time.Hour   // 1小时
	CacheExpireLong   = 24 * time.Hour  // 24小时
)

// UserEvent 用户事件结构
type UserEvent struct {
	ID           int64       `json:"id,omitempty" db:"id"`                     // 数据库主键
	UserID       string      `json:"user_id" db:"user_id"`                     // 用户ID
	SessionID    string      `json:"session_id" db:"session_id"`               // 会话ID
	EventType    string      `json:"event_type" db:"event_type"`               // 事件类型
	PageURL      string      `json:"page_url" db:"page_url"`                   // 页面URL
	PageTitle    string      `json:"page_title,omitempty"`                     // 页面标题(应用层字段)
	Element      string      `json:"element,omitempty" db:"element"`           // 元素标识
	ElementID    string      `json:"element_id,omitempty"`                     // 元素ID(应用层字段)
	ElementClass string      `json:"element_class,omitempty"`                  // 元素Class(应用层字段)
	ElementText  string      `json:"element_text,omitempty" db:"element_text"` // 元素文本
	PositionX    *int        `json:"position_x,omitempty" db:"position_x"`     // 点击X坐标
	PositionY    *int        `json:"position_y,omitempty" db:"position_y"`     // 点击Y坐标
	UserAgent    string      `json:"user_agent,omitempty" db:"user_agent"`     // 用户代理
	IPAddress    string      `json:"ip_address,omitempty" db:"ip_address"`     // IP地址
	Timestamp    int64       `json:"timestamp" db:"timestamp"`                 // 事件时间戳
	CreatedAt    *string     `json:"created_at,omitempty" db:"created_at"`     // 创建时间
	ExtraData    interface{} `json:"extra_data,omitempty"`                     // 扩展数据(应用层字段)
}

// User 用户信息结构
type User struct {
	UserID        string  `json:"user_id" db:"user_id"`                   // 用户ID
	FirstVisit    string  `json:"first_visit" db:"first_visit"`           // 首次访问时间
	LastVisit     string  `json:"last_visit" db:"last_visit"`             // 最后访问时间
	TotalEvents   int     `json:"total_events" db:"total_events"`         // 总事件数
	TotalSessions int     `json:"total_sessions" db:"total_sessions"`     // 总会话数
	DeviceType    *string `json:"device_type,omitempty" db:"device_type"` // 设备类型
	Browser       *string `json:"browser,omitempty" db:"browser"`         // 浏览器
	CreatedAt     string  `json:"created_at" db:"created_at"`             // 创建时间
	UpdatedAt     string  `json:"updated_at" db:"updated_at"`             // 更新时间
}

// AnalysisCache 分析结果缓存结构
type AnalysisCache struct {
	CacheKey   string      `json:"cache_key" db:"cache_key"`     // 缓存键
	ResultData interface{} `json:"result_data" db:"result_data"` // 分析结果JSON
	ExpireTime string      `json:"expire_time" db:"expire_time"` // 过期时间
	CreatedAt  string      `json:"created_at" db:"created_at"`   // 创建时间
}

// FunnelConfig 漏斗配置结构
type FunnelConfig struct {
	ID         int         `json:"id" db:"id"`                   // 配置ID
	FunnelName string      `json:"funnel_name" db:"funnel_name"` // 漏斗名称
	Steps      interface{} `json:"steps" db:"steps"`             // 漏斗步骤配置(JSON)
	IsActive   bool        `json:"is_active" db:"is_active"`     // 是否启用
	CreatedAt  string      `json:"created_at" db:"created_at"`   // 创建时间
	UpdatedAt  string      `json:"updated_at" db:"updated_at"`   // 更新时间
}

// EventBatchRequest 批量事件请求
type EventBatchRequest struct {
	Events []UserEvent `json:"events"`
}

// StatsResponse 统计响应结构
type StatsResponse struct {
	OnlineUsers    int64            `json:"online_users"`
	TotalEvents    int64            `json:"total_events"`
	EventsByType   map[string]int64 `json:"events_by_type"`
	HotPages       []PageStat       `json:"hot_pages"`
	ConversionRate float64          `json:"conversion_rate"`
}

// PageStat 页面统计
type PageStat struct {
	PageURL string `json:"page_url"`
	Views   int64  `json:"views"`
}

// FunnelResult 漏斗分析结果
type FunnelResult struct {
	Steps          []FunnelStep `json:"steps"`
	TotalUsers     int64        `json:"total_users"`
	ConversionRate float64      `json:"conversion_rate"`
}

// FunnelStep 漏斗步骤
type FunnelStep struct {
	Step           string  `json:"step"`
	Users          int64   `json:"users"`
	ConversionRate float64 `json:"conversion_rate"`
}

// HealthResponse 健康检查响应
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
	Service   string `json:"service"`
}

// EventResponse 事件接收响应
type EventResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Count   int    `json:"count"`
}
