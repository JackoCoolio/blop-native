package main

import (
	"blop-backend/api"
	"blop-backend/lib"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	logger := log.Default()
	logger.SetPrefix("[blop-backend] ")

	vars, err := lib.GetEnvVariables()
	if err != nil {
		logger.Fatalf(err.Error())
	}

	mongo := lib.InitializeMongoDB(vars.MONGODB_URI, logger)

	connMgr := lib.CreateConnectionManager(logger)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c // wait for signal
		logger.Println("shutting down...")
		connMgr.ForEach(func(_ uuid.UUID, c *lib.Connection) {
			// do any necessary cleanup
			c.WebSocket.Close()
		})

		os.Exit(0)
	}()

	router := gin.Default()

	router.GET("/ws", func(c *gin.Context) {
		logger.Printf("incoming websocket connection from %v\n", c.Request.RemoteAddr)
		lib.WebSocketHandler(c.Writer, c.Request, &connMgr)
		logger.Printf("closed\n")
	})

	api.SetupApiRoutes(router, logger, mongo, vars)

	// needs to be 0.0.0.0 to be able to connect
	// localhost does NOT work
	router.Run(fmt.Sprintf("localhost:%v", vars.PORT))
}
