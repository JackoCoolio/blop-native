package lib

import (
	"log"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func CreateConnectionManager(logger *log.Logger) ConnectionManager {
	return ConnectionManager{logger, sync.RWMutex{}, make(map[uuid.UUID]*Connection)}
}

type ConnectionManager struct {
	logger       *log.Logger               // Logger
	sync.RWMutex                           // Mutex
	connections  map[uuid.UUID]*Connection // List of connections, indexed by UUID
}

// A wrapper for a WebSocket connection.
type Connection struct {
	WebSocket      *websocket.Conn // Underlying websocket connection
	pingHandleLock sync.Mutex      // Mutex
}

// Executes fn for each connection.
func (mgr *ConnectionManager) ForEach(fn func(uuid.UUID, *Connection)) {
	for id, conn := range mgr.connections {
		fn(id, conn)
	}
}

// Concurrently executes fn for each connection.
func (mgr *ConnectionManager) ForEachParallel(fn func(uuid.UUID, *Connection)) {
	for id, conn := range mgr.connections {
		go fn(id, conn)
	}
}

// Registers a new connection (concurrency safe). Returns the UUID of the connection, as well as (a copy of) the connection itself.
func (mgr *ConnectionManager) Register(conn *websocket.Conn) uuid.UUID {
	// acquire lock
	mgr.Lock()
	defer mgr.Unlock()

	id := uuid.New()

	wrapper := Connection{conn, sync.Mutex{}}
	wrapperPointer := &wrapper
	mgr.connections[id] = wrapperPointer // neat that this works in Go

	return id
}

// Removes a connection from the manager (concurrency safe).
// This does NOT close the connection.
func (mgr *ConnectionManager) Remove(id uuid.UUID) {
	// acquire lock
	mgr.Lock()
	defer mgr.Unlock()

	mgr.logger.Printf("removed WS-%v\n", id)
	delete(mgr.connections, id)
}

// Returns the connection (heap-allocated) with the given ID from the manager.
func (mgr *ConnectionManager) Get(id uuid.UUID) *Connection {
	mgr.RLock()
	defer mgr.RUnlock()

	return mgr.connections[id]
}
