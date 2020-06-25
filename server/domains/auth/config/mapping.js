
module.exports = {
  index_name: "account",
  type_names: ["account", "accountStats"],
  number_of_shards: 4,
  number_of_replicas: 0,
  account: {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" }, // the custom type field (_type is deprecated)

      // account
      "userId": {"type" : "keyword" },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "username": {"type" : "keyword" },
      "email": {"type" : "keyword" },
      "passwordHash": {"type" : "keyword" },
      "createdOn" : {"type" : "date" },
      "activatedOn" : {"type" : "date" },
      "activated" : {"type" : "boolean" },
      "activationIp": {"type" : "keyword" },
      "activationAgent": {"type" : "keyword" },
      "activationToken": {"type" : "keyword" },
      "activationTokenExpires": {"type" : "date" },
      "hasTempUsername": {"type" : "boolean" },
      "accessTokenGoogle": {"type" : "keyword" },

      // accountStats
      "logins": {
        "properties" : {
          "date" : {"type" : "date" },
          // ip-type supports only ipv4?
          "ip": {"type" : "keyword" }, 
          "agent": {"type" : "keyword" }
        }
      },
      "failedLoginAttempts": {
        "properties" : {
          "nr" : { "type" : "integer" },
          "date" : {"type" : "date" }
        }
      },
      "failedLogins": {
        "properties" : {
          "date" : {"type" : "date" },
          "ip": {"type" : "keyword" },
          "agent": {"type" : "keyword" },
          "message": {"type" : "text" }
        }
      },
      "passwortResets": {
        "properties" : {
          "date" : {"type" : "date" },
          "ip": {"type" : "keyword" },
          "agent": {"type" : "keyword" },
          "action":  {"type" : "keyword" }
        }
      }
    }
  }
}
