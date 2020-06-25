
module.exports = {
  index_name: "command",
  type_names: ["command"],
  number_of_shards: 4,
  number_of_replicas: 0,  
  "command": {
    properties : {
      "id": {"type" : "keyword"  },
      "type": {"type" : "keyword"  },

      "url": {"type": "keyword" },
      "method": {"type": "keyword" },       
      "headers": {"type": "text" },
      "body": {"type": "text" },        
      "query": {"type": "text" },        
      "params": {"type": "text" },        
      
      "status": {"type": "keyword" },
      "timestamp": {"type" : "date" },
      "user": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "username" : {"type" : "keyword" }
        }
      }
    }
  }
}