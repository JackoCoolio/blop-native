FROM golang:1.18-bullseye

WORKDIR /app

# copy everything
COPY . .

ENV PORT=8080

EXPOSE 8080

CMD [ "go", "run", "." ]
