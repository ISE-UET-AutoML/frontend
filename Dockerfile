# Stage 1: 'base' - Lớp nền chung cho cả hai môi trường
# ----------------------------------------------------------------
FROM node:20-alpine AS base

# Đặt thư mục làm việc
WORKDIR /app

# Copy các file quản lý package để tận dụng cache của Docker
COPY package*.json ./


# Stage 2: 'development' - Dành riêng cho môi trường Development
# ----------------------------------------------------------------
FROM base AS development

# Cài đặt tất cả dependencies, bao gồm cả devDependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Lệnh mặc định để khởi động dev server (thường có hot-reload)
# Giả sử trong package.json của bạn có script "start" hoặc "dev"
CMD ["npm", "run", "start"]


# Stage 3: 'builder' - Dùng để build ra các file tĩnh cho Production
# ----------------------------------------------------------------
FROM base AS builder

# Chỉ cài đặt production dependencies để tối ưu quá trình build
RUN npm ci --only=production

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng React
RUN npm run build


# Stage 4: 'production' - Image cuối cùng, siêu nhẹ cho Production
# ----------------------------------------------------------------
FROM nginx:1.27-alpine

# Copy các file tĩnh đã được build từ stage 'builder' vào thư mục của Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Sao chép file cấu hình Nginx để xử lý routing cho React
# Bạn cần tạo file này trong cùng thư mục với Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 mặc định của Nginx
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]