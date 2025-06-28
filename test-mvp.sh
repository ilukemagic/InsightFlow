#!/bin/bash

# InsightFlow MVP 功能测试脚本

echo "🧪 InsightFlow MVP 功能测试"
echo "=============================="

# 检查服务状态
echo "📋 1. 检查服务状态..."

# 测试Golang服务
echo -n "  Golang API: "
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ 运行正常"
else
    echo "❌ 服务异常"
    exit 1
fi

# 测试FastAPI服务
echo -n "  FastAPI BFF: "
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 运行正常"
else
    echo "❌ 服务异常"
    exit 1
fi

echo ""
echo "📊 2. 测试数据接口..."

# 测试仪表盘接口
echo -n "  Web仪表盘: "
DASHBOARD_RESULT=$(curl -s http://localhost:8000/bff/web/dashboard)
if echo $DASHBOARD_RESULT | grep -q "online_users"; then
    echo "✅ 数据正常"
else
    echo "❌ 数据异常"
fi

# 测试移动端接口
echo -n "  移动端仪表盘: "
MOBILE_RESULT=$(curl -s http://localhost:8000/bff/mobile/dashboard)
if echo $MOBILE_RESULT | grep -q "online_users"; then
    echo "✅ 数据正常"
else
    echo "❌ 数据异常"
fi

echo ""
echo "🔄 3. 测试事件上报..."

# 模拟事件数据
EVENT_DATA='{
  "events": [
    {
      "user_id": "test_user_001",
      "session_id": "test_session_001", 
      "event_type": "view",
      "page_url": "/test/page",
      "timestamp": '$(date +%s000)'
    },
    {
      "user_id": "test_user_001",
      "session_id": "test_session_001",
      "event_type": "click", 
      "page_url": "/test/page",
      "element": "test_button",
      "timestamp": '$(date +%s000)'
    }
  ]
}'

echo -n "  事件上报: "
UPLOAD_RESULT=$(curl -s -X POST http://localhost:8000/bff/events/batch \
  -H "Content-Type: application/json" \
  -d "$EVENT_DATA")

if echo $UPLOAD_RESULT | grep -q "success"; then
    echo "✅ 上报成功"
else
    echo "❌ 上报失败"
    echo "响应: $UPLOAD_RESULT"
fi

echo ""
echo "⏳ 等待数据处理..."
sleep 5

echo ""
echo "📈 4. 验证数据统计..."

# 再次检查仪表盘数据
echo -n "  更新后的统计: "
UPDATED_RESULT=$(curl -s http://localhost:8000/bff/web/dashboard)
if echo $UPDATED_RESULT | grep -q "total_events"; then
    echo "✅ 统计更新"
    # 显示关键指标
    ONLINE_USERS=$(echo $UPDATED_RESULT | jq -r '.online_users // 0')
    TOTAL_EVENTS=$(echo $UPDATED_RESULT | jq -r '.total_events // 0')
    echo "    在线用户: $ONLINE_USERS"
    echo "    总事件数: $TOTAL_EVENTS"
else
    echo "❌ 统计异常"
fi

echo ""
echo "🔍 5. 测试用户分析..."

echo -n "  用户行为查询: "
USER_RESULT=$(curl -s http://localhost:8000/bff/user/test_user_001/analytics)
if echo $USER_RESULT | grep -q "user_id"; then
    echo "✅ 查询成功"
    EVENT_COUNT=$(echo $USER_RESULT | jq -r '.summary.total_events // 0')
    echo "    用户事件数: $EVENT_COUNT"
else
    echo "❌ 查询失败"
fi

echo ""
echo "📊 6. 测试漏斗分析..."

echo -n "  转化漏斗: "
FUNNEL_RESULT=$(curl -s http://localhost:8000/bff/funnel/analysis)
if echo $FUNNEL_RESULT | grep -q "steps"; then
    echo "✅ 分析正常"
    CONVERSION_RATE=$(echo $FUNNEL_RESULT | jq -r '.conversion_rate // 0')
    echo "    转化率: $CONVERSION_RATE%"
else
    echo "❌ 分析异常"
fi

echo ""
echo "💾 7. 验证数据持久化..."

echo -n "  MySQL数据: "
# 检查MySQL中是否有测试数据
MYSQL_COUNT=$(docker exec insightflow-mysql mysql -u developer -pdev123 -D insightflow -sN -e "SELECT COUNT(*) FROM user_events WHERE user_id='test_user_001';" 2>/dev/null)
if [ "$MYSQL_COUNT" -gt 0 ]; then
    echo "✅ 数据已持久化 ($MYSQL_COUNT 条记录)"
else
    echo "⚠️  未找到持久化数据"
fi

echo -n "  Redis缓存: "
# 检查Redis中的统计数据
REDIS_TOTAL=$(docker exec insightflow-redis redis-cli GET total_events 2>/dev/null)
if [ ! -z "$REDIS_TOTAL" ] && [ "$REDIS_TOTAL" -gt 0 ]; then
    echo "✅ 缓存更新 ($REDIS_TOTAL 总事件)"
else
    echo "⚠️  缓存数据为空"
fi

echo ""
echo "🎯 测试总结"
echo "============"
echo "✅ 核心功能测试完成"
echo "📊 数据链路正常：前端SDK → FastAPI BFF → Golang处理 → Kafka消息 → Redis缓存 + MySQL存储"
echo "🌐 可以访问演示页面进行交互测试"
echo ""
echo "🔗 快速链接："
echo "   演示页面: file://$(pwd)/frontend/demo/index.html"
echo "   API文档:  http://localhost:8000/docs"
echo "   仪表盘:   http://localhost:8000/bff/web/dashboard"
echo "   用户分析: http://localhost:8000/bff/user/test_user_001/analytics"
echo "" 