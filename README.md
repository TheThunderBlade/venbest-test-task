## Моя конфігурація:
    1. NodeJS: v20.11.0
    2. PostgreSQL 15

## Кроки для запуску програми:
    1. Створити .env файл
    2. Встановити всі пакети => npm install
    3. Створити базу даних venbest_db(Таблиці зі зв'язками створяться автоматично)
    4. Виконати команду yarn run start:dev

## Приклад .prod.env файлу
    POSTGRES_HOST=localhost
    POSTGRESS_PORT=5432
    POSTGRES_USER=postgres
    POSTGRESS_PASSWORD=1111
    POSTGRES_DB=venbest_db