package lib

import (
	"context"
	"fmt"

	"github.com/rs/xid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func userExistsWithKey(value string, key string, mongo *MongoDBConnection) bool {
	fmt.Println("get collection")
	users := mongo.Database().Collection(USERS_COLLECTION)
	fmt.Println("find one")
	user := users.FindOne(context.TODO(), bson.D{{Key: key, Value: value}})
	fmt.Println("ok")

	// todo: actually analyze the error
	// for now we just assume it means that the user doesn't exist
	if user.Err() != nil {
		return false
	}
	return true
}

// Returns true if a user with the given username exists.
func UsernameExists(username string, mongo *MongoDBConnection) bool {
	return userExistsWithKey(username, "username", mongo)
}

// Returns true if a user with the given ID exists.
func UserIdExists(userId string, mongo *MongoDBConnection) bool {
	return userExistsWithKey(userId, "_id", mongo)
}

// Attempts to create a user with the given username and hashed password.
func CreateUser(username string, hashedPassword string, mongo *MongoDBConnection) (string, error) {
	fmt.Println("creating")
	users := mongo.Database().Collection(USERS_COLLECTION)
	fmt.Println("collection")

	// just assume ID is unique for now
	id := xid.New()

	// create
	_, err := users.InsertOne(context.TODO(), bson.D{
		{Key: "_id", Value: id.String()},
		{Key: "username", Value: username},
		{Key: "password", Value: hashedPassword},
	})
	fmt.Println("inserted")

	if err != nil {
		return "", err
	}

	return id.String(), nil
}

// Returns the ID of the user with the given username.
func GetUserId(username string, mongo *MongoDBConnection) string {
	users := mongo.Database().Collection(USERS_COLLECTION)

	// options
	projection := bson.D{{Key: "_id", Value: 1}}
	filter := bson.D{
		{Key: "username", Value: username},
	}
	opts := options.FindOne().SetProjection(projection)

	var user bson.D
	err := users.FindOne(context.TODO(), filter, opts).Decode(&user)

	if err != nil {
		return ""
	} else {
		id := user.Map()["_id"]
		fmt.Println(id)
		return "foo id"
	}

}
