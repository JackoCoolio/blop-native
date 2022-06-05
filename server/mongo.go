package main

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

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
	return conn.database == nil
}

func connectMongoDB(uri string) (*mongo.Client, error) {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))

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

	go func() {
		client, err := connectMongoDB(uri)

		if err != nil {
			panic("couldn't connect to MongoDB")
		}

		// todo: choose database depending on development/production status
		db := client.Database("blopdev")

		if db == nil {
			panic("couldn't get database handle")
		}

		logger.Println("MongoDB connection ready")

		// important: set database after client so IsReady() is correct
		conn.client = client
		conn.database = db
	}()

	return conn
}
