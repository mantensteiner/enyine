
module.exports = {
  index_name: "user",
  type_names: ["user", "avatar", "userbilling"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "user": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "email" : {"type" : "keyword" },
      "username" : {"type" : "keyword" },
      "firstName" : {"type" : "keyword" },
      "lastName" : {"type" : "keyword" },
      "fullName" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "birthDate": {"type" : "date" },
      "countryCode" : {"type" : "keyword" },
      "country" : {"type" : "keyword" },
      
      // Should be in the format {source:xx, name: xx}, eg {source:'github', name:'mantenpanther'}
      //"aliasNames" : {"type" : "string" },
      "aliasNames": {
        "properties" : {
          "source" : {"type" : "keyword" },
          "name" : {"type" : "keyword" }
        }
      },         
      "acceptInvitations" : {"type" : "boolean" },
      "spaces": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "name" : {"type" : "text" }
        }
      }, 
      "spaceInvitations": {
        "properties" : {
          "token" : { "type" : "keyword" },
          "spaceId" : { "type" : "keyword"},
          "spaceName" : { "type" : "keyword" }
        }
      },

      // AVATAR
      "userId": {"type" : "keyword"  }, 
      "uploadedOn": {"type" : "date"  },
      "data": {"type" : "binary"  },

      // USERBILLING
      "extraInfo" : {"type" : "text" }, // VAT...
      "plan" : {
        properties : {
          "id": {"type" : "keyword" },
          "started": {"type" : "date" },
          "status": {"type": "keyword"}, // active, cancelled, expiring
          "expirationDate": {"type": "date"}, // time until account gets cancelled
        }
      },
      "payment" : {
        properties : {
          "id": {"type" : "keyword" },
          "method": {"type" : "keyword" }, // eg Paypal
          "nextBillingDate": {"type" : "date" }
        }
      },
      "paymentHistory" : {
        properties : {
          "id": {"type" : "keyword" },
          "method": {"type" : "keyword" }, // eg Paypal
          "reference": {"type" : "keyword" },  // Shortened id (7 digits, hashed id)
          "billingDate": {"type" : "date" },
          "endsOn": {"type" : "date" },
          "amount": {"type" : "integer" },
          "currency": {"type" : "keyword" },
          "statuscode" : {"type": "keyword"}, // scheduled,failed,succeeded
          "receipt" : {"type": "keyword"} // file data (pdf)
        }
      }
    }
  }
}
