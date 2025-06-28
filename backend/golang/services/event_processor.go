package services

import (
	"context"
	"database/sql"
	"log"
	"strconv"
	"time"

	"insightflow/models"

	"github.com/go-redis/redis/v8"
)

// EventProcessor 事件处理器
type EventProcessor struct {
	DB             *sql.DB
	Redis          *redis.Client
	ServiceManager *ServiceManager
}

// NewEventProcessor 创建事件处理器
func NewEventProcessor(db *sql.DB, redis *redis.Client) *EventProcessor {
	return &EventProcessor{
		DB:             db,
		Redis:          redis,
		ServiceManager: NewServiceManager(),
	}
}

// ProcessEvent 处理单个事件
func (ep *EventProcessor) ProcessEvent(event models.UserEvent) {
	ctx := context.Background()

	// 并行处理实时统计和数据持久化
	go ep.updateRealTimeStats(ctx, event)
	go ep.persistEvent(event)

	log.Printf("处理事件: %s - %s - %s", event.UserID, event.EventType, event.PageURL)
}

// updateRealTimeStats 更新实时统计数据
func (ep *EventProcessor) updateRealTimeStats(ctx context.Context, event models.UserEvent) {
	pipe := ep.Redis.Pipeline()

	// 更新在线用户（使用SET，自动去重，5分钟过期）
	pipe.SAdd(ctx, "online_users", event.UserID)
	pipe.Expire(ctx, "online_users", 5*time.Minute)

	// 总事件计数
	pipe.Incr(ctx, "total_events")

	// 按事件类型计数
	pipe.Incr(ctx, "events:"+event.EventType)

	// 热门页面排行榜（使用ZSET）
	if event.EventType == "view" || event.EventType == "click" {
		pipe.ZIncrBy(ctx, "hot_pages", 1, event.PageURL)
	}

	// 用户会话数据
	sessionKey := "session:" + event.SessionID
	pipe.HSet(ctx, sessionKey, map[string]interface{}{
		"user_id":       event.UserID,
		"last_activity": time.Now().Unix(),
		"page_url":      event.PageURL,
	})
	pipe.Expire(ctx, sessionKey, 30*time.Minute)

	// 每小时事件统计
	hourKey := "events:hour:" + time.Now().Format("2006010215")
	pipe.Incr(ctx, hourKey)
	pipe.Expire(ctx, hourKey, 25*time.Hour) // 保留一天多一点

	// 执行管道
	if _, err := pipe.Exec(ctx); err != nil {
		log.Printf("更新Redis统计失败: %v", err)
	}
}

// persistEvent 持久化事件到数据库
func (ep *EventProcessor) persistEvent(event models.UserEvent) {
	query := `
		INSERT INTO user_events (
			user_id, session_id, event_type, page_url, element, 
			element_text, position_x, position_y, user_agent, timestamp
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	// 处理可选字段
	var elementText sql.NullString
	if event.ElementText != "" {
		elementText = sql.NullString{String: event.ElementText, Valid: true}
	}

	var positionX, positionY sql.NullInt64
	if event.PositionX != nil {
		positionX = sql.NullInt64{Int64: int64(*event.PositionX), Valid: true}
	}
	if event.PositionY != nil {
		positionY = sql.NullInt64{Int64: int64(*event.PositionY), Valid: true}
	}

	_, err := ep.DB.Exec(query,
		event.UserID,
		event.SessionID,
		event.EventType,
		event.PageURL,
		event.Element,
		elementText,
		positionX,
		positionY,
		event.UserAgent,
		event.Timestamp,
	)

	if err != nil {
		log.Printf("持久化事件失败: %v", err)
		return
	}

	// 更新用户信息表
	ep.updateUserInfo(event)
}

// updateUserInfo 更新用户信息
func (ep *EventProcessor) updateUserInfo(event models.UserEvent) {
	// 检查用户是否存在
	var existingUser models.User
	err := ep.DB.QueryRow(`
		SELECT user_id, first_visit, last_visit, total_events, total_sessions, 
		       COALESCE(device_type, '') as device_type, COALESCE(browser, '') as browser,
		       created_at, updated_at 
		FROM users WHERE user_id = ?`, event.UserID).Scan(
		&existingUser.UserID,
		&existingUser.FirstVisit,
		&existingUser.LastVisit,
		&existingUser.TotalEvents,
		&existingUser.TotalSessions,
		&existingUser.DeviceType,
		&existingUser.Browser,
		&existingUser.CreatedAt,
		&existingUser.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		// 新用户，使用UserService创建
		newUser := ep.ServiceManager.GetUserService().InitializeNewUser(
			event.UserID,
			nil, // device_type 可以从 user_agent 解析
			nil, // browser 可以从 user_agent 解析
		)

		// 插入到数据库
		_, err = ep.DB.Exec(`
			INSERT INTO users (user_id, first_visit, last_visit, total_events, total_sessions, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, newUser.UserID, newUser.FirstVisit, newUser.LastVisit,
			newUser.TotalEvents, newUser.TotalSessions, newUser.CreatedAt, newUser.UpdatedAt)

		if err != nil {
			log.Printf("插入新用户失败: %v", err)
		}
	} else if err != nil {
		log.Printf("查询用户信息失败: %v", err)
		return
	} else {
		// 现有用户，使用UserService更新
		ep.ServiceManager.GetUserService().IncrementEvents(&existingUser)
		ep.ServiceManager.GetUserService().UpdateLastVisit(&existingUser)

		// 更新到数据库
		_, err = ep.DB.Exec(`
			UPDATE users 
			SET last_visit = ?, total_events = ?, updated_at = ?
			WHERE user_id = ?
		`, existingUser.LastVisit, existingUser.TotalEvents, existingUser.UpdatedAt, existingUser.UserID)

		if err != nil {
			log.Printf("更新用户信息失败: %v", err)
		}
	}
}

// CalculateFunnel 计算购买转化漏斗
func (ep *EventProcessor) CalculateFunnel() models.FunnelResult {
	ctx := context.Background()

	// 获取最近24小时的转化数据
	views := ep.getEventCount(ctx, "view")
	clicks := ep.getEventCount(ctx, "click")
	addCarts := ep.getEventCount(ctx, "add_to_cart")
	purchases := ep.getEventCount(ctx, "purchase")

	steps := []models.FunnelStep{
		{
			Step:           "页面访问",
			Users:          views,
			ConversionRate: 100.0,
		},
		{
			Step:           "商品点击",
			Users:          clicks,
			ConversionRate: calculateRate(clicks, views),
		},
		{
			Step:           "加入购物车",
			Users:          addCarts,
			ConversionRate: calculateRate(addCarts, views),
		},
		{
			Step:           "完成购买",
			Users:          purchases,
			ConversionRate: calculateRate(purchases, views),
		},
	}

	return models.FunnelResult{
		Steps:          steps,
		TotalUsers:     views,
		ConversionRate: calculateRate(purchases, views),
	}
}

// getEventCount 获取事件计数
func (ep *EventProcessor) getEventCount(ctx context.Context, eventType string) int64 {
	val, err := ep.Redis.Get(ctx, "events:"+eventType).Result()
	if err != nil {
		return 0
	}

	count, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		return 0
	}

	return count
}

// CalculateRetention 计算用户留存率
func (ep *EventProcessor) CalculateRetention(days int) map[string]float64 {
	query := `
		SELECT 
			DATE(created_at) as date,
			COUNT(DISTINCT user_id) as daily_users
		FROM user_events 
		WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
		GROUP BY DATE(created_at)
		ORDER BY date
	`

	rows, err := ep.DB.Query(query, days)
	if err != nil {
		log.Printf("查询留存数据失败: %v", err)
		return nil
	}
	defer rows.Close()

	retention := make(map[string]float64)

	for rows.Next() {
		var date string
		var users int64

		if err := rows.Scan(&date, &users); err != nil {
			continue
		}

		// 简化版留存计算（实际应该更复杂）
		retention[date] = float64(users)
	}

	return retention
}

// GetUserPath 获取用户行为路径
func (ep *EventProcessor) GetUserPath(userID string, limit int) []map[string]interface{} {
	query := `
		SELECT event_type, page_url, element, timestamp, created_at
		FROM user_events 
		WHERE user_id = ? 
		ORDER BY timestamp DESC 
		LIMIT ?
	`

	rows, err := ep.DB.Query(query, userID, limit)
	if err != nil {
		log.Printf("查询用户路径失败: %v", err)
		return nil
	}
	defer rows.Close()

	var path []map[string]interface{}
	for rows.Next() {
		var eventType, pageURL, element string
		var timestamp int64
		var createdAt time.Time

		if err := rows.Scan(&eventType, &pageURL, &element, &timestamp, &createdAt); err != nil {
			continue
		}

		path = append(path, map[string]interface{}{
			"event_type": eventType,
			"page_url":   pageURL,
			"element":    element,
			"timestamp":  timestamp,
			"created_at": createdAt,
		})
	}

	return path
}

// GetHotElements 获取热门元素
func (ep *EventProcessor) GetHotElements(ctx context.Context, limit int64) []map[string]interface{} {
	query := `
		SELECT element, COUNT(*) as clicks
		FROM user_events 
		WHERE event_type = 'click' 
		AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
		AND element != '' 
		GROUP BY element 
		ORDER BY clicks DESC 
		LIMIT ?
	`

	rows, err := ep.DB.Query(query, limit)
	if err != nil {
		log.Printf("查询热门元素失败: %v", err)
		return nil
	}
	defer rows.Close()

	var elements []map[string]interface{}
	for rows.Next() {
		var element string
		var clicks int64

		if err := rows.Scan(&element, &clicks); err != nil {
			continue
		}

		elements = append(elements, map[string]interface{}{
			"element": element,
			"clicks":  clicks,
		})
	}

	return elements
}

// CleanupExpiredData 清理过期数据
func (ep *EventProcessor) CleanupExpiredData(ctx context.Context) {
	// 清理7天前的事件数据
	_, err := ep.DB.Exec(`
		DELETE FROM user_events 
		WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
	`)
	if err != nil {
		log.Printf("清理过期事件数据失败: %v", err)
	}

	log.Println("数据清理完成")
}

// calculateRate 计算转化率
func calculateRate(numerator, denominator int64) float64 {
	if denominator == 0 {
		return 0
	}
	return float64(numerator) / float64(denominator) * 100
}
