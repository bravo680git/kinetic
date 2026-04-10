# Stage 1: Frontend builder
FROM node:22-alpine AS frontend-builder

WORKDIR /app

RUN corepack enable

COPY shared ./shared
COPY frontend/package.json frontend/pnpm-lock.yaml* ./frontend/

WORKDIR /app/frontend

RUN pnpm install --frozen-lockfile

COPY frontend/ ./

RUN pnpm run build

# Stage 2: Build Go backend
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/go.mod backend/go.sum* ./

RUN go mod download

COPY backend/ ./

COPY --from=frontend-builder /app/frontend/dist ./dist

RUN CGO_ENABLED=0 GOOS=linux go build -o kinetic .

# Stage 3: Final runtime image
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=backend-builder /app/backend/kinetic .

EXPOSE 8080

CMD ["./kinetic"]
