package services

import (
	"fmt"
	"insightflow/models"
)

// EventValidator 事件验证器
type EventValidator struct{}

// NewEventValidator 创建事件验证器
func NewEventValidator() *EventValidator {
	return &EventValidator{}
}

// Validate 验证UserEvent数据
func (v *EventValidator) Validate(event *models.UserEvent) error {
	if event.UserID == "" {
		return fmt.Errorf("user_id不能为空")
	}
	if event.SessionID == "" {
		return fmt.Errorf("session_id不能为空")
	}
	if event.EventType == "" {
		return fmt.Errorf("event_type不能为空")
	}
	if event.PageURL == "" {
		return fmt.Errorf("page_url不能为空")
	}
	if event.Timestamp <= 0 {
		return fmt.Errorf("timestamp必须大于0")
	}
	return nil
}

// IsValidEventType 检查事件类型是否有效
func (v *EventValidator) IsValidEventType(eventType string) bool {
	validTypes := []string{
		models.EventTypeClick, models.EventTypeView, models.EventTypeScroll,
		models.EventTypePurchase, models.EventTypeSubmit, models.EventTypeLoad, models.EventTypeExit,
		models.EventTypeVisibilityChange,
	}
	for _, validType := range validTypes {
		if eventType == validType {
			return true
		}
	}
	return false
}

// ValidateEventType 验证事件类型
func (v *EventValidator) ValidateEventType(event *models.UserEvent) error {
	if !v.IsValidEventType(event.EventType) {
		return fmt.Errorf("不支持的事件类型: %s", event.EventType)
	}
	return nil
}

// ValidateComplete 完整验证事件
func (v *EventValidator) ValidateComplete(event *models.UserEvent) error {
	if err := v.Validate(event); err != nil {
		return err
	}
	if err := v.ValidateEventType(event); err != nil {
		return err
	}
	return nil
}
