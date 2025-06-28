package infrastructure

import (
	"encoding/json"
	"log"

	"insightflow/models"

	"github.com/Shopify/sarama"
)

// KafkaProducer Kafka生产者包装
// Topic和Partition的关系：
// - Topic是逻辑概念，类似数据库的"表"
// - Partition是物理概念，类似数据库表的"分片"
// - 一个Topic可以包含多个Partition，用于并行处理和负载分布
type KafkaProducer struct {
	producer sarama.SyncProducer
	topic    string
}

// NewKafkaProducer 创建Kafka生产者
// 当前配置：默认分区策略，适合中小型项目
// 分区说明：
// - 如果topic只有1个分区，所有消息串行处理，保证全局顺序
// - 如果topic有多个分区，相同key的消息会到同一分区，保证局部顺序
func NewKafkaProducer(brokers []string, topic string) (*KafkaProducer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.Retry.Max = 3
	config.Producer.RequiredAcks = sarama.WaitForAll

	// 分区策略：默认是Hash分区器
	// - 有key时：相同key的消息总是发到同一分区（保证用户事件顺序）
	// - 无key时：轮询发送到各个分区（负载均衡）

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}

	return &KafkaProducer{
		producer: producer,
		topic:    topic,
	}, nil
}

// SendEvent 发送事件到Kafka
// 使用UserID作为分区key，确保同一用户的事件按顺序处理
func (kp *KafkaProducer) SendEvent(event models.UserEvent) error {
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return err
	}

	message := &sarama.ProducerMessage{
		Topic: kp.topic,
		Key:   sarama.StringEncoder(event.UserID), // 分区key：同一用户到同一分区
		Value: sarama.ByteEncoder(eventJSON),
	}

	partition, offset, err := kp.producer.SendMessage(message)
	if err != nil {
		return err
	}

	// 可选：打印分区信息（调试用）
	log.Printf("事件发送成功: Topic=%s, Partition=%d, Offset=%d, UserID=%s",
		kp.topic, partition, offset, event.UserID)

	return nil
}

// Close 关闭生产者
func (kp *KafkaProducer) Close() error {
	return kp.producer.Close()
}

// KafkaConsumer Kafka消费者包装
// Consumer自动消费所有分区的消息
type KafkaConsumer struct {
	consumer sarama.Consumer
	topic    string
}

// NewKafkaConsumer 创建Kafka消费者
func NewKafkaConsumer(brokers []string, topic string) (*KafkaConsumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin

	consumer, err := sarama.NewConsumer(brokers, config)
	if err != nil {
		return nil, err
	}

	return &KafkaConsumer{
		consumer: consumer,
		topic:    topic,
	}, nil
}

// Start 启动消费者
// 自动检测分区数量并并行消费所有分区
func (kc *KafkaConsumer) Start(eventHandler func(models.UserEvent)) error {
	// 获取topic的所有分区
	partitions, err := kc.consumer.Partitions(kc.topic)
	if err != nil {
		return err
	}

	log.Printf("🎯 Kafka消费者已启动: Topic=%s, 分区数量=%d", kc.topic, len(partitions))

	// 为每个分区启动一个goroutine并行消费
	for _, partition := range partitions {
		go func(partitionID int32) {
			partitionConsumer, err := kc.consumer.ConsumePartition(kc.topic, partitionID, sarama.OffsetNewest)
			if err != nil {
				log.Printf("启动分区 %d 消费者失败: %v", partitionID, err)
				return
			}
			defer partitionConsumer.Close()

			log.Printf("开始消费分区: %d", partitionID)

			// 处理该分区的消息
			for {
				select {
				case message := <-partitionConsumer.Messages():
					var event models.UserEvent
					if err := json.Unmarshal(message.Value, &event); err != nil {
						log.Printf("解析Kafka消息失败: %v", err)
						continue
					}

					log.Printf("接收消息: Partition=%d, Offset=%d, UserID=%s",
						message.Partition, message.Offset, event.UserID)

					// 处理事件
					go eventHandler(event)

				case err := <-partitionConsumer.Errors():
					log.Printf("分区 %d 消费错误: %v", partitionID, err)
				}
			}
		}(partition)
	}

	return nil
}

// Close 关闭消费者
func (kc *KafkaConsumer) Close() error {
	return kc.consumer.Close()
}
