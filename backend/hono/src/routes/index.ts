/**
 * 路由索引文件
 */

import { Hono } from 'hono';
import dashboard from './dashboard';
import events from './events';
import users from './users';
import health from './health';

const routes = new Hono();

// 注册路由
routes.route('/bff', dashboard);
routes.route('/bff/events', events);
routes.route('/bff/user', users);
routes.route('/', health);

export default routes; 