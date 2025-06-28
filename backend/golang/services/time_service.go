package services

import (
	"insightflow/models"
	"time"
)

// TimeService 时间处理服务
type TimeService struct{}

// NewTimeService 创建时间服务
func NewTimeService() *TimeService {
	return &TimeService{}
}

// SetCurrentTimestamp 设置当前时间戳
func (ts *TimeService) SetCurrentTimestamp(event *models.UserEvent) {
	event.Timestamp = time.Now().UnixMilli()
}

// GetEventAge 获取事件距离现在的时间(秒)
func (ts *TimeService) GetEventAge(event *models.UserEvent) int64 {
	return (time.Now().UnixMilli() - event.Timestamp) / 1000
}

// IsEventFresh 检查事件是否新鲜(在指定秒数内)
func (ts *TimeService) IsEventFresh(event *models.UserEvent, maxAgeSeconds int64) bool {
	return ts.GetEventAge(event) <= maxAgeSeconds
}

// FormatTimestamp 格式化时间戳为字符串
func (ts *TimeService) FormatTimestamp(timestamp int64) string {
	return time.UnixMilli(timestamp).Format("2006-01-02 15:04:05")
}

// ParseTimeString 解析时间字符串
func (ts *TimeService) ParseTimeString(timeStr string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05", timeStr)
}

// GetCurrentTimeString 获取当前时间字符串
func (ts *TimeService) GetCurrentTimeString() string {
	return time.Now().Format("2006-01-02 15:04:05")
}
