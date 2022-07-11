package user

import (
	"blop-backend/lib"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type GetUserIdParams struct {
	Username string `json:"username"`
}

func GetUserIdHandler(c *gin.Context, logger *log.Logger, mongo *lib.MongoDBConnection) {
	var body GetUserIdParams

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "JSON",
		})
		return
	}

	// query database
	user, err := lib.GetUserByUsername(body.Username, mongo)
	if err != nil {
		c.Status(http.StatusNotFound)
	} else {
		c.JSON(http.StatusOK, gin.H{
			"id": user.Id,
		})
	}
}

type GetUserHandlerParams struct {
	Username string `json:"username"`
}

func GetUserHandler(c *gin.Context, logger *log.Logger, mongo *lib.MongoDBConnection, vars lib.EnvironmentVars) {
	var body GetUserHandlerParams

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "JSON",
		})
		return
	}

	user, err := lib.GetUserByUsername(body.Username, mongo)
	if err != nil {
		c.Status(http.StatusNotFound)
	} else {
		// user is bson
		c.JSON(http.StatusOK, user)
	}
}

func MeHandler(c *gin.Context, logger *log.Logger, mongo *lib.MongoDBConnection, vars lib.EnvironmentVars) {
	userId, err := lib.VerifyJWTFromContext(c, []byte(vars.JWT_KEY), jwt.SigningMethodHS256)

	if err != nil {
		// we couldn't parse the JWT
		c.Status(http.StatusInternalServerError)
		return
	}

	user, err := lib.GetUserById(userId, mongo)
	if err != nil {
		// signals that the local token should be discarded
		c.Status(http.StatusBadRequest)
	}

	logger.Printf("me: user: %v\n", user)

	c.JSON(http.StatusOK, user)
}

func VerifyHandler(c *gin.Context, logger *log.Logger, mongo *lib.MongoDBConnection, vars lib.EnvironmentVars) {
	// we don't need the user ID, because the client has it already!
	// JWTs aren't encrypted, they're signed
	_, err := lib.VerifyJWTFromContext(c, []byte(vars.JWT_KEY), jwt.SigningMethodHS256)

	if err != nil {
		if err == lib.ErrMissingAuthHeader || err == lib.ErrMalformedAuthHeader {
			c.Status(http.StatusBadRequest)
		} else {
			c.Status(http.StatusUnauthorized)
		}
		return
	}

	c.Status(http.StatusOK)
}
