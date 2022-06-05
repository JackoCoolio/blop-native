package lib

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

const USERS_COLLECTION string = "users"

// collections used by blop
var COLLECTIONS [1]string = [...]string{USERS_COLLECTION}

type MongoDBConnection struct {
	client   *mongo.Client   // The MongoDB client
	database *mongo.Database // The Blop database
}

func (conn *MongoDBConnection) Client() *mongo.Client {
	for !conn.IsReady() {
	}
	return conn.client
}

func (conn *MongoDBConnection) Database() *mongo.Database {
	for !conn.IsReady() {
	}
	return conn.database
}

func (conn *MongoDBConnection) IsReady() bool {
	return conn.database != nil
}

func connectMongoDB(uri string) (*mongo.Client, error) {
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	options := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPIOptions)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options)

	// check if we couldn't connect
	if err != nil {
		return nil, err
	}

	// check if ping doesn't respond
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		return nil, err
	}

	return client, nil
}

func InitializeMongoDB(uri string, logger *log.Logger) *MongoDBConnection {
	conn := &MongoDBConnection{nil, nil}

	client, err := connectMongoDB(uri)

	if err != nil {
		panic("couldn't connect to MongoDB")
	}

	// todo: choose database depending on development/production status
	db := client.Database("blopdev")

	// create collections
	for _, coll := range COLLECTIONS {
		// we don't care about the return value
		db.CreateCollection(context.TODO(), coll)
	}

	if db == nil {
		panic("couldn't get database handle")
	}

	logger.Println("MongoDB connection ready")

	// important: set database after client so IsReady() is correct
	conn.client = client
	conn.database = db

	return conn
}
