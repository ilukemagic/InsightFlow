package internal

import (
	"database/sql"
	"log"
	"net/http"

	"insightflow/config"
	"insightflow/handlers"
	"insightflow/infrastructure"
	"insightflow/middleware"
	"insightflow/services"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
)

// App 应用程序主结构
type App struct {
	Config         *config.Config
	DB             *sql.DB
	Redis          *redis.Client
	KafkaProducer  *infrastructure.KafkaProducer
	KafkaConsumer  *infrastructure.KafkaConsumer
	EventProcessor *services.EventProcessor
	ServiceManager *services.ServiceManager
	EventHandler   *handlers.EventHandler
}

// NewApp 初始化应用
func NewApp(cfg *config.Config) (*App, error) {
	app := &App{Config: cfg}

	// 初始化MySQL
	db, err := infrastructure.InitMySQL(cfg.MySQLDSN)
	if err != nil {
		return nil, err
	}
	app.DB = db

	// 初始化Redis
	rdb, err := infrastructure.InitRedis(cfg.RedisAddr)
	if err != nil {
		return nil, err
	}
	app.Redis = rdb

	// 初始化Kafka Producer
	kafkaProducer, err := infrastructure.NewKafkaProducer(cfg.KafkaBrokers, cfg.GetMainTopic())
	if err != nil {
		return nil, err
	}
	app.KafkaProducer = kafkaProducer

	// 初始化Kafka Consumer
	kafkaConsumer, err := infrastructure.NewKafkaConsumer(cfg.KafkaBrokers, cfg.GetMainTopic())
	if err != nil {
		return nil, err
	}
	app.KafkaConsumer = kafkaConsumer

	// 初始化服务管理器
	app.ServiceManager = services.NewServiceManagerWithRedis(app.Redis)

	// 初始化事件处理器
	app.EventProcessor = services.NewEventProcessor(app.DB, app.Redis)

	// 初始化HTTP处理器
	app.EventHandler = handlers.NewEventHandler(app.KafkaProducer, app.EventProcessor, app.Redis, app.ServiceManager)

	return app, nil
}

// SetupRoutes 设置路由
func (app *App) SetupRoutes() http.Handler {
	router := mux.NewRouter()

	// 创建中间件链（使用服务增强的中间件）
	middlewareChain := middleware.NewChain(
		middleware.ServiceLogger(app.ServiceManager),    // 使用时间服务的日志中间件
		middleware.Recovery(),                           // 恢复中间件
		middleware.ServiceRequestID(app.ServiceManager), // 使用时间服务的请求ID中间件
		middleware.ValidatedRequest(app.ServiceManager), // 带验证的请求中间件
		middleware.CORS(),                               // CORS中间件
	)

	// API路由
	api := router.PathPrefix("/api").Subrouter()

	// 事件接收接口
	api.HandleFunc("/events", app.EventHandler.HandleEvents).Methods("POST", "OPTIONS")

	// 统计查询接口（供BFF调用）
	api.HandleFunc("/stats/online", app.EventHandler.HandleOnlineUsers).Methods("GET")
	api.HandleFunc("/stats/hot-pages", app.EventHandler.HandleHotPages).Methods("GET")
	api.HandleFunc("/stats/events", app.EventHandler.HandleEventStats).Methods("GET")
	api.HandleFunc("/stats/conversion", app.EventHandler.HandleConversionRate).Methods("GET")
	api.HandleFunc("/stats/dashboard", app.EventHandler.HandleDashboard).Methods("GET")

	// 用户行为查询
	api.HandleFunc("/user/{userId}/events", app.EventHandler.HandleUserEvents).Methods("GET")
	api.HandleFunc("/funnel/{funnelId}/analysis", app.EventHandler.HandleFunnelAnalysis).Methods("GET")

	// 健康检查
	router.HandleFunc("/health", app.EventHandler.HandleHealth).Methods("GET")

	// 应用中间件链
	return middlewareChain.Then(router)
}

// StartKafkaConsumer 启动Kafka消费者（异步）
func (app *App) StartKafkaConsumer() {
	go func() {
		err := app.KafkaConsumer.Start(app.EventProcessor.ProcessEvent)
		if err != nil {
			log.Printf("Kafka消费者启动失败: %v", err)
		}
	}()
}

// Close 关闭资源
func (app *App) Close() {
	if app.DB != nil {
		app.DB.Close()
	}
	if app.Redis != nil {
		app.Redis.Close()
	}
	if app.KafkaProducer != nil {
		app.KafkaProducer.Close()
	}
	if app.KafkaConsumer != nil {
		app.KafkaConsumer.Close()
	}
}
