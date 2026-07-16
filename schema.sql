-- schema.sql
-- Это НАСТОЯЩИЙ SQL-файл — именно его и нужно вставлять в поле SQL-запроса
-- в phpMyAdmin (или другой панели MySQL), а не db.js/server.js — те останутся
-- на сервере и их запускает Node.js, а не MySQL.
--
-- Как использовать:
-- 1. Создай в панели хостинга (или в phpMyAdmin) базу данных, например made_noise
-- 2. Открой эту базу → вкладка "SQL"
-- 3. Скопируй всё содержимое этого файла целиком и вставь туда
-- 4. Нажми "Выполнить" / "Go" — один раз, при первой настройке

CREATE TABLE IF NOT EXISTS orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  created_at     DATETIME NOT NULL,
  fio            VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(50)  NOT NULL,
  social         VARCHAR(255),
  city           VARCHAR(255) NOT NULL,
  fio_receiver   VARCHAR(255),
  address        VARCHAR(500) NOT NULL,
  comment        TEXT,
  promo          VARCHAR(100),
  payment_method VARCHAR(50) NOT NULL,
  items_json     TEXT NOT NULL,
  total          INT NOT NULL,
  status         VARCHAR(30) NOT NULL DEFAULT 'new'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
