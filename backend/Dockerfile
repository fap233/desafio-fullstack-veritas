FROM golang:1.25-alpine3.21 AS builder

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.21

WORKDIR /root/

COPY --from=builder /app/server .

COPY tasks.json .

EXPOSE 8080

CMD ["./server"]

