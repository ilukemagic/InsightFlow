package services

import (
	"insightflow/models"
	"time"
)

// UserService 用户服务
type UserService struct {
	timeService *TimeService
}

// NewUserService 创建用户服务
func NewUserService() *UserService {
	return &UserService{
		timeService: NewTimeService(),
	}
}

// UpdateLastVisit 更新用户最后访问时间
func (us *UserService) UpdateLastVisit(user *models.User) {
	currentTime := us.timeService.GetCurrentTimeString()
	user.LastVisit = currentTime
	user.UpdatedAt = currentTime
}

// IncrementEvents 增加用户事件计数
func (us *UserService) IncrementEvents(user *models.User) {
	user.TotalEvents++
	user.UpdatedAt = us.timeService.GetCurrentTimeString()
}

// IncrementSessions 增加用户会话计数
func (us *UserService) IncrementSessions(user *models.User) {
	user.TotalSessions++
	user.UpdatedAt = us.timeService.GetCurrentTimeString()
}

// InitializeNewUser 初始化新用户
func (us *UserService) InitializeNewUser(userID string, deviceType, browser *string) *models.User {
	currentTime := us.timeService.GetCurrentTimeString()
	return &models.User{
		UserID:        userID,
		FirstVisit:    currentTime,
		LastVisit:     currentTime,
		TotalEvents:   0,
		TotalSessions: 1,
		DeviceType:    deviceType,
		Browser:       browser,
		CreatedAt:     currentTime,
		UpdatedAt:     currentTime,
	}
}

// UpdateUserActivity 更新用户活动信息
func (us *UserService) UpdateUserActivity(user *models.User, isNewSession bool) {
	us.UpdateLastVisit(user)
	us.IncrementEvents(user)

	if isNewSession {
		us.IncrementSessions(user)
	}
}

// IsActiveUser 检查用户是否活跃(最近访问时间在指定小时内)
func (us *UserService) IsActiveUser(user *models.User, hoursThreshold int64) bool {
	lastVisit, err := us.timeService.ParseTimeString(user.LastVisit)
	if err != nil {
		return false
	}

	thresholdTime := us.timeService.GetCurrentTimeString()
	threshold, _ := us.timeService.ParseTimeString(thresholdTime)
	threshold = threshold.Add(-time.Duration(hoursThreshold) * time.Hour)

	return lastVisit.After(threshold)
}
