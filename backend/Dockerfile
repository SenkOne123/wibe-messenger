# Используем официальный образ Node.js (Alpine для минимального размера)
FROM node:20-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем схему prisma
COPY prisma ./prisma/

# Генерируем Prisma Client (необходимо для работы Prisma внутри контейнера)
RUN npx prisma generate

# Копируем весь остальной исходный код
COPY . .

# Собираем TypeScript проект
RUN npm run build

# Указываем порт, который будет слушать приложение
EXPOSE 3000

# Запускаем скомпилированный код
CMD ["npm", "start"]
