package config

import "os"

// Config 应用程序配置结构
type Config struct {
	Port         string
	MySQLDSN     string
	RedisAddr    string
	KafkaBrokers []string

	// Kafka Topics 配置
	KafkaTopics KafkaTopicConfig
}

// KafkaTopicConfig Kafka主题配置
type KafkaTopicConfig struct {
	// 主要用户事件主题
	UserEvents string

	// 预留：未来可能的其他主题
	SystemEvents string // 系统事件（预留）
	AlertEvents  string // 告警事件（预留）
}

// Load 加载配置
func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		MySQLDSN:     getEnv("MYSQL_DSN", "developer:dev123@tcp(localhost:3306)/insightflow?parseTime=true"),
		RedisAddr:    getEnv("REDIS_ADDR", "localhost:6379"),
		KafkaBrokers: []string{getEnv("KAFKA_BROKERS", "localhost:9092")},

		KafkaTopics: KafkaTopicConfig{
			UserEvents:   getEnv("KAFKA_TOPIC_USER_EVENTS", "user_events"),
			SystemEvents: getEnv("KAFKA_TOPIC_SYSTEM_EVENTS", "system_events"),
			AlertEvents:  getEnv("KAFKA_TOPIC_ALERT_EVENTS", "alert_events"),
		},
	}
}

// GetMainTopic 获取主要topic（保持向后兼容）
func (c *Config) GetMainTopic() string {
	// 优先使用旧的环境变量，保证向后兼容
	if topic := getEnv("KAFKA_TOPIC", ""); topic != "" {
		return topic
	}
	return c.KafkaTopics.UserEvents
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
