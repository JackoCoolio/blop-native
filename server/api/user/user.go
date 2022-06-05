package user

import (
	"blop-backend/lib"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
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
	}

	// query database
	id := lib.GetUserId(body.Username, mongo)

	if id != "" {
		c.JSON(http.StatusOK, gin.H{
			"id": id,
		})
	} else {
		c.Status(http.StatusNotFound)
	}
}
