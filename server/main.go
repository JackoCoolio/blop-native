package main

import (
	"log"
	"os"
	"os/signal"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	logger := log.Default()
	logger.SetPrefix("[blop-backend] ")

	vars, err := getEnvVariables()
	if err != nil {
		logger.Fatalf(err.Error())
	}

	_ = InitializeMongoDB(vars.MONGODB_URI, logger)

	connMgr := ConnectionManager{logger, sync.RWMutex{}, make(map[uuid.UUID]*Connection)}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c // wait for signal
		logger.Println("shutting down...")
		for _, conn := range connMgr.connections {
			// do any necessary cleanup
			conn.ws.Close()
		}

		os.Exit(0)
	}()

	router := gin.Default()

	router.GET("/ws", func(c *gin.Context) {
		logger.Printf("incoming websocket connection from %v\n", c.Request.RemoteAddr)
		wsHandler(c.Writer, c.Request, &connMgr)
		logger.Printf("closed\n")
	})

	router.POST("/auth/create", func(c *gin.Context) {
		AuthHandler(c, logger, vars)
	})

	// needs to be 0.0.0.0 to be able to connect
	// localhost does NOT work
	router.Run("localhost:8080")
}
