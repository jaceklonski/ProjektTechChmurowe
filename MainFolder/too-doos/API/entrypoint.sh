#!/bin/sh
# 1) pobranie hasła z Docker Secret
DB_PASS=$(cat /run/secrets/db_password)

# 2) ustawienie DATABASE_URL
export DATABASE_URL="postgres://postgres:${DB_PASS}@too-doos-db:5432/too_doos?schema=public"

# 3) migracje
npx prisma migrate deploy

# 4) start serwera
exec node src/index.js
