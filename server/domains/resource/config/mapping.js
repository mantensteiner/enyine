
module.exports = {
  index_name: "resource",
  type_names: ["resource"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "resource": {
    properties : {
      "id": {"type" : "keyword"  },
      "type": {"type" : "keyword"  },
      "spaceId": {"type" : "keyword"  },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "uri": {"type" : "keyword"  },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      // base64 data
      "data": {"type" : "binary" },
      "filesize": {"type" : "long" },
      "filename" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "contentType": {"type" : "keyword" },
      "fulltext": {"type" : "text" },
      "relations": {
        "properties" : {
          "id" : {"type" : "keyword"},
          "entity" : {"type" : "keyword"}
        }
      }
    }
  }
}
