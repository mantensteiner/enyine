
module.exports = {
  index_name: "vcs",
  type_names: ["commit"],
  number_of_shards: 4,
  number_of_replicas: 0,  
  "vcs": {
    commit: {
      properties : {
        "id": {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        "spaceId": {"type" : "string", "index" : "not_analyzed", "doc_values": true },    
        "date": {"type" : "date", "doc_values": true },          
        "createdBy": {"type" : "string", "index" : "not_analyzed", "doc_values": true },   
        "modifiedBy": {"type" : "string", "index" : "not_analyzed", "doc_values": true },   
        "createdOn": {"type" : "date", "doc_values": true },   
        "modifiedOn": {"type" : "date", "doc_values": true },
        "repositoryFullName": {"type" : "string", "index" : "not_analyzed", "doc_values": true },          
        "message": {"type" : "string", "index" : "not_analyzed", "doc_values": true },          
        "time": {"type" : "float", "doc_values": true },
        "token": {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        "value": {"type" : "float", "doc_values": true },
        "url": {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        "source": {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        
        // author, committer, pusher with data from VCV-user, eg. github account
        // the userinfo is matched against the internal user / aliases
        "author": {
          "properties" : {
            "name" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
            "email" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
            "username" : {"type" : "string", "index" : "not_analyzed", "doc_values": true  }
          }
        },
        "committer": {
          "properties" : {
            "name" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
            "email" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
            "username" : {"type" : "string", "index" : "not_analyzed", "doc_values": true  }
          }
        },
        "pusher": {
          "properties" : {
            "name" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
            "email" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
            "username" : {"type" : "string", "index" : "not_analyzed", "doc_values": true  }
          }
        },
        "added": {"type" : "string" },
        "modified": {"type" : "string" },
        "removed": {"type" : "string" }
      }
    }
  }
}
