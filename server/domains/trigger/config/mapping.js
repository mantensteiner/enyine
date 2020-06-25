module.exports = {
  index_name: "trigger",
  type_names: ["trigger"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "trigger": {
    trigger: {
      properties: {
        "id": {"type": "string", "index": "not_analyzed"},
        "spaceId": {"type": "string", "index": "not_analyzed"},
        "name": { "type" : "string" },
        "createdOn" : {"type" : "date" },
        "modifiedOn" : {"type" : "date" },
        "createdBy" : {"type" : "string" },
        "modifiedBy" : {"type" : "string" },
        "value" : {"type" : "float" },
        "trigger": {
          "properties" : {
            "users" : {
              "properties" : {
                "id" : {"type" : "string", "index" : "not_analyzed" },
                "username" : {"type": "string", "index" : "not_analyzed"  }
              }
            },
            "recordType" : {"type": "string", "index" : "not_analyzed"  },
            "unitId" : {"type": "string", "index" : "not_analyzed"  },
            "criteria" : {
              "properties" : {
                "type" : {"type" : "string", "index" : "not_analyzed" }
              }
            }
          }
        },
        "lastExecution": {
          "properties" : {
            "date" : {"type": "date" },
            "results" : {
              "properties" : {
                "type" : {"type" : "string", "index" : "not_analyzed" },
                "action" : {"type" : "string", "index" : "not_analyzed" },
                "recordType" : {"type" : "string", "index" : "not_analyzed" },
                "recordId" : {"type" : "string", "index" : "not_analyzed" }
              }
            }
          }
        },
        "actions": {
          "properties" : {
            "type" : {"type" : "string", "index" : "not_analyzed" },
            "recordType" : {"type" : "string", "index" : "not_analyzed" },
            "actionHandler" : {
              "properties" : {
                "name" : {"type" : "string", "index" : "not_analyzed" },
                "order" : {"type" : "integer", "index" : "not_analyzed" },
                "condition" : {"type" : "string", "index" : "not_analyzed" }
              }
            }
          }
        }
      }
    }
  }
}
