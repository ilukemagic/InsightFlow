package services

import (
	"insightflow/models"
	"time"
)

// CacheService 缓存处理服务
type CacheService struct {
	timeService *TimeService
}

// NewCacheService 创建缓存服务
func NewCacheService() *CacheService {
	return &CacheService{
		timeService: NewTimeService(),
	}
}

// GenerateCacheKey 生成缓存键
func (cs *CacheService) GenerateCacheKey(prefix string, params ...string) string {
	key := prefix
	for _, param := range params {
		key += "_" + param
	}
	return key
}

// IsExpired 检查缓存是否过期
func (cs *CacheService) IsExpired(cache *models.AnalysisCache) bool {
	expireTime, err := cs.timeService.ParseTimeString(cache.ExpireTime)
	if err != nil {
		return true
	}
	return time.Now().After(expireTime)
}

// SetExpireTime 设置缓存过期时间
func (cs *CacheService) SetExpireTime(cache *models.AnalysisCache, duration time.Duration) {
	cache.ExpireTime = time.Now().Add(duration).Format("2006-01-02 15:04:05")
}

// CreateCacheEntry 创建缓存条目
func (cs *CacheService) CreateCacheEntry(key string, data interface{}, duration time.Duration) *models.AnalysisCache {
	cache := &models.AnalysisCache{
		CacheKey:   key,
		ResultData: data,
		CreatedAt:  cs.timeService.GetCurrentTimeString(),
	}
	cs.SetExpireTime(cache, duration)
	return cache
}

// GetOrCreateCacheKey 获取或创建缓存键
func (cs *CacheService) GetOrCreateCacheKey(cacheType string, userID string, timeRange string) string {
	return cs.GenerateCacheKey(cacheType, userID, timeRange)
}

// IsValidCache 检查缓存是否有效
func (cs *CacheService) IsValidCache(cache *models.AnalysisCache) bool {
	return cache != nil && !cs.IsExpired(cache)
}
