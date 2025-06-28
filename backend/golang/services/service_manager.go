package services

import "github.com/go-redis/redis/v8"

// ServiceManager 服务管理器，统一管理所有业务服务
type ServiceManager struct {
	EventValidator *EventValidator
	TimeService    *TimeService
	CacheService   *CacheService
	UserService    *UserService
	StatsService   *StatsService
}

// NewServiceManager 创建服务管理器（无外部依赖）
func NewServiceManager() *ServiceManager {
	return &ServiceManager{
		EventValidator: NewEventValidator(),
		TimeService:    NewTimeService(),
		CacheService:   NewCacheService(),
		UserService:    NewUserService(),
		StatsService:   nil, // 需要后续通过SetStatsService设置
	}
}

// NewServiceManagerWithRedis 创建带Redis的服务管理器
func NewServiceManagerWithRedis(redis *redis.Client) *ServiceManager {
	sm := &ServiceManager{
		EventValidator: NewEventValidator(),
		TimeService:    NewTimeService(),
		CacheService:   NewCacheService(),
		UserService:    NewUserService(),
	}
	sm.StatsService = NewStatsService(redis, sm)
	return sm
}

// SetStatsService 设置统计服务（用于后续注入）
func (sm *ServiceManager) SetStatsService(redis *redis.Client) {
	sm.StatsService = NewStatsService(redis, sm)
}

// GetEventValidator 获取事件验证器
func (sm *ServiceManager) GetEventValidator() *EventValidator {
	return sm.EventValidator
}

// GetTimeService 获取时间服务
func (sm *ServiceManager) GetTimeService() *TimeService {
	return sm.TimeService
}

// GetCacheService 获取缓存服务
func (sm *ServiceManager) GetCacheService() *CacheService {
	return sm.CacheService
}

// GetUserService 获取用户服务
func (sm *ServiceManager) GetUserService() *UserService {
	return sm.UserService
}

// GetStatsService 获取统计服务
func (sm *ServiceManager) GetStatsService() *StatsService {
	return sm.StatsService
}
