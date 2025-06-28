package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"insightflow/config"
	"insightflow/internal"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化应用
	app, err := internal.NewApp(cfg)
	if err != nil {
		log.Fatalf("初始化应用失败: %v", err)
	}
	defer app.Close()

	// 启动Kafka消费者（异步）
	app.StartKafkaConsumer()

	// 设置路由
	router := app.SetupRoutes()

	// 启动HTTP服务器
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// 优雅关闭
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("正在关闭服务器...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("服务器关闭错误: %v", err)
		}
	}()

	log.Printf("🚀 InsightFlow 数据处理服务启动在端口 %s", cfg.Port)
	log.Printf("📊 Redis: %s", cfg.RedisAddr)
	log.Printf("📄 MySQL: %s", cfg.MySQLDSN)
	log.Printf("📨 Kafka: %v", cfg.KafkaBrokers)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服务器启动失败: %v", err)
	}

	log.Println("服务器已关闭")
}
