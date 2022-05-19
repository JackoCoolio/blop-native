package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type ConnectionManager struct {
	logger      *log.Logger       // Logger
	id          uint              // Next ID
	connections []*websocket.Conn // List of connections
}

// Registers a new connection.
func (mgr *ConnectionManager) Register(conn *websocket.Conn) uint {
	beforeLen := len(mgr.connections)
	mgr.connections = append(mgr.connections, conn)
	afterLen := len(mgr.connections)
	fmt.Printf("before: %v after %v\n", beforeLen, afterLen)
	mgr.id++
	return mgr.id - 1
}

func wshandler(w http.ResponseWriter, r *http.Request, mgr *ConnectionManager) {
	conn, err := wsupgrader.Upgrade(w, r, nil)
	if err != nil {
		mgr.logger.Printf("failed to set websocket upgrade: %+v\n", err)
		return
	}

	id := mgr.Register(conn)

	for {
		t, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		mgr.logger.Printf("%v message from WS%v: '%v'\n", t, id, msg)

		outMsg := append([]byte("out: "), msg...)

		// broadcast
		mgr.logger.Printf("broadcasting to %v connections\n", len(mgr.connections))
		for id, eachConn := range mgr.connections {
			mgr.logger.Printf("broadcast to WS%v\n", id)
			eachConn.WriteMessage(t, outMsg)
		}
		// conn.WriteMessage(t, outMsg)
	}
}

func main() {
	logger := log.Default()
	logger.SetPrefix("[blop-backend] ")

	vars, err := getEnvVariables()
	if err != nil {
		logger.Fatalf(err.Error())
	}

	client, err := connectMongoDB(vars.MONGODB_URI)
	if err != nil {
		logger.Fatalf(err.Error())
	}

	db := client.Database("blopdev")
	if db == nil {
		logger.Fatalf("database doesn't exist")
	}

	connMgr := ConnectionManager{logger, 0, make([]*websocket.Conn, 0)}

	// send "shutdown" to connected websockets when server shuts down
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c // wait for signal
		logger.Println("shutting down...")
		logger.Println("sending shutdown signals to websocket connections...")
		for _, conn := range connMgr.connections {
			conn.WriteMessage(0, []byte("shutdown"))
			conn.Close()
		}
		logger.Println("shutdown messages sent")

		os.Exit(0)
	}()

	router := gin.Default()

	router.GET("/ws", func(c *gin.Context) {
		logger.Printf("incoming websocket connection from %v\n", c.Request.RemoteAddr)
		wshandler(c.Writer, c.Request, &connMgr)
		logger.Printf("closed\n")
	})

	router.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	router.Run("localhost:8080")
}
