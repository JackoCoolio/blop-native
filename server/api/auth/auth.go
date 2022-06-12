package auth

import (
	"blop-backend/lib"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/gin-gonic/gin"
)

// Hashes a password using the SHA-256 algorithm.
func hash(password string, salt string) string {
	h := sha256.New()

	h.Write(append([]byte(salt), []byte(password)...))
	out := hex.EncodeToString(h.Sum(nil))
	return out
}

type AuthenticationParams struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

const USERNAME_CHARS string = "-_"
const PASSWORD_CHARS string = "~!@#$%^&*()_+~`! @#$%^&*()_-+={[}]|\\:;\"'<,>.?/"

// Returns true if the given username is valid.
func isValidUsername(username string) bool {
	usernameLen := len(username)
	if usernameLen > 24 || usernameLen < 4 {
		return false
	}

	for _, r := range username {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && !strings.ContainsRune(USERNAME_CHARS, r) {
			return false
		}
	}

	return true
}

// Returns true if the given password is valid.
func isValidPassword(password string) bool {
	passwordLen := len(password)
	if passwordLen > 512 || passwordLen < 8 {
		return false
	}

	for _, r := range password {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && !strings.ContainsRune(PASSWORD_CHARS, r) {
			return false
		}
	}

	return true
}

func CreateUserHandler(c *gin.Context, logger *log.Logger, mongo *lib.MongoDBConnection, vars lib.EnvironmentVars) {
	var body AuthenticationParams

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "JSON",
		})
	}

	// check if user exists
	if lib.UsernameExists(body.Username, mongo) {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "USERALREADYEXISTS",
		})
		return
	}

	// validate username
	if !isValidUsername(body.Username) {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "USERNAME",
		})
		return
	}

	// validate password
	if !isValidPassword(body.Password) {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "PASSWORD",
		})
		return
	}

	// hash the password
	hashedPassword := hash(body.Password, vars.SALT)

	// attempt to create user
	id, err := lib.CreateUser(body.Username, hashedPassword, mongo)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "COULDN'T CREATE USER",
		})
	}

	tokenString, err := lib.CreateSignedJWT(id, []byte(vars.JWT_KEY), time.Now().Add(5*time.Minute))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "COULDN'T SIGN JWT",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    id,
		"token": tokenString,
	})
}

func LoginHandler(c *gin.Context, logger *log.Logger, mongo *lib.MongoDBConnection, vars lib.EnvironmentVars) {
	var body AuthenticationParams

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"type": "JSON",
		})
		return
	}

	user, err := lib.GetUserByUsernameUnsafe(body.Username, mongo)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			// TODO: keep this in one place instead of synchronizing it between files
			"type": "USER",
		})
		return
	}

	hashedPassword := hash(body.Password, vars.SALT)

	if user.HashedPassword == hashedPassword {
		// correct password
		tokenString, err := lib.CreateSignedJWT(user.Id, []byte(vars.JWT_KEY), time.Now().Add(5*time.Minute))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "COULDN'T SIGN JWT",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":    user.Id,
			"token": tokenString,
		})
	} else {
		// incorrect password
		c.Status(http.StatusUnauthorized)
	}
}
