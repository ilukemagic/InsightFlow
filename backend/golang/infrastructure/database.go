package infrastructure

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

// InitMySQL 初始化MySQL连接
func InitMySQL(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	// 设置连接池参数
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)

	// 测试连接
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
