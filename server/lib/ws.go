package lib

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Handles a ping from a client with the given ID.
func pingHandler(mgr *ConnectionManager, id uuid.UUID, appData string) error {
	// get connection from ID
	conn := mgr.Get(id)

	// expect a ping around every 30 seconds (client sends a ping every 5 seconds atm)
	// if we don't receive a ping, we assume that we lost connection
	conn.WebSocket.SetReadDeadline(time.Now().Add(time.Second * 30))

	// acquire ping handle lock to indicate that all incoming pings will be handled
	if !conn.pingHandleLock.TryLock() {
		// we're currently handling a ping so this ping will get bundled with it
		return nil
	}

	// we have the lock, so remember to unlock it
	defer conn.pingHandleLock.Unlock()

	// DEBUG: wait for a random amount of time between 20 and 40ms
	// otherwise, when server is running locally, ping will always be 0ms
	time.Sleep(time.Millisecond * time.Duration(rand.Uint32()%20+20))

	// handle the ping
	conn.WebSocket.WriteControl(websocket.PongMessage, []byte(appData), time.Now().Add(time.Millisecond*500))
	return nil
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request, mgr *ConnectionManager) {
	ws, err := wsupgrader.Upgrade(w, r, nil)
	if err != nil {
		mgr.logger.Printf("failed to set websocket upgrade: %+v\n", err)
		return
	}

	id := mgr.Register(ws)
	defer mgr.Remove(id)

	ws.SetPingHandler(func(appData string) error {
		go pingHandler(mgr, id, appData)
		return nil
	})

	for {
		t, msg, err := ws.ReadMessage()
		if err != nil {
			break
		}

		// expect a ping within 60 seconds (client sends ping every 30 seconds)
		ws.SetReadDeadline(time.Now().Add(time.Second * 60))

		// DEBUG: wait for a random amount of time between 20 and 40ms
		time.Sleep(time.Millisecond * time.Duration(rand.Uint32()%20+20))

		if t == websocket.CloseMessage {
			mgr.logger.Printf("close message from '%v'\n", id)
			return
		}

		mgr.logger.Printf("%v message from WS-%v: '%v'\n", t, id, string(msg[:]))

		outMsg := []byte(fmt.Sprintf("MESSAGE[%v]: %v", len(msg), string(msg)))

		// broadcast
		mgr.logger.Printf("broadcasting to %v connections\n", len(mgr.connections))
		mgr.RLock()
		for id, eachConn := range mgr.connections {
			go func(id uuid.UUID, eachConn *Connection) {
				mgr.logger.Printf("broadcast to WS%v\n", id)
				eachConn.WebSocket.SetWriteDeadline(time.Now().Add(time.Second * 2))
				err := eachConn.WebSocket.WriteMessage(t, outMsg)
				if err != nil {
					mgr.logger.Printf("write timeout with WS%v\n", id)
					eachConn.WebSocket.Close()
				}
			}(id, eachConn)
		}
		mgr.RUnlock()
		// conn.WriteMessage(t, outMsg)
	}
}
