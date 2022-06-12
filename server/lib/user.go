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

// User information that is safe to give to clients.
type User struct {
	// The user ID
	Id string `bson:"_id"`
	// A unique, user-chosen, human-readable identifier
	Username string `bson:"username"`
}

// User that contains information that is NOT safe to give to clients.
// Includes hashed password.
type UnsafeUser struct {
	User
	// A hashed version of the user's password
	HashedPassword string `bson:"password"`
}

// Finds the user with the given ID.
func GetUserById(userId string, mongo *MongoDBConnection) (User, error) {
	users := mongo.Database().Collection(USERS_COLLECTION)

	// options
	projection := bson.D{{Key: "password", Value: 0}}
	filter := bson.D{{Key: "_id", Value: userId}}
	opts := options.FindOne().SetProjection(projection)

	var user User
	err := users.FindOne(context.TODO(), filter, opts).Decode(&user)

	return user, err
}

// Finds the user with the given username.
// This does not include sensitive information like hashed passwords.
func GetUserByUsername(username string, mongo *MongoDBConnection) (User, error) {
	users := mongo.Database().Collection(USERS_COLLECTION)

	// options
	projection := bson.M{
		"_id":      1,
		"username": 1,
		"password": 0, // exclude password!
	}
	opts := options.FindOne().SetProjection(projection)

	// filter
	filter := bson.M{
		"username": username,
	}

	var user User
	err := users.FindOne(context.TODO(), filter, opts).Decode(&user)

	return user, err
}

// Finds the user with the given username.
// This does not apply a projection, so all data (including hashed password!) will be returned.
// In other words, do not give the unmodified return value of this function to the user.
func GetUserByUsernameUnsafe(username string, mongo *MongoDBConnection) (UnsafeUser, error) {
	users := mongo.Database().Collection(USERS_COLLECTION)

	// options
	projection := bson.M{
		"_id":      1,
		"username": 1,
		"password": 1,
	}
	opts := options.FindOne().SetProjection(projection)

	// filter
	filter := bson.M{
		"username": username,
	}

	var user UnsafeUser
	err := users.FindOne(context.TODO(), filter, opts).Decode(&user)

	return user, err
}
