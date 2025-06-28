package infrastructure

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

// InitRedis 初始化Redis连接
func InitRedis(addr string) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:        addr,
		PoolSize:    10,
		MaxRetries:  3,
		IdleTimeout: 5 * time.Minute,
	})

	// 测试Redis连接
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return rdb, nil
}
