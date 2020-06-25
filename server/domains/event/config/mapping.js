
module.exports = {
  index_name: "event",
  type_names: ["event", "snapshot", "subscriber", "delivery"],
  number_of_shards: 4,
  number_of_replicas: 0,  
  "event": {
    properties : {
      "id": {"type" : "keyword"  },
      "type": {"type" : "keyword"  },
      
      // namespace - on this name follow up actions (like webhooks) can be registered
      // could possibly be a request path: eg '/item/save', '/tag/delete'
      // good use of the command-pattern gives richer, more granular possibilities
      // eg update item date: instead of '/item/save' use  '/item/saveEventDate'
      "namespace": {"type": "keyword" },
      
      // additional namespaces to abstact the entity operation itself to a more bussiness
      // related information, eg. 'user.activateInvitation' gives context and preserves 
      // the original intent of the operation 
      "namespaces": {"type" : "keyword"  },
      
      "spaceId": {"type" : "keyword"  },
      "recordId": {"type": "keyword" },
      "domain":  {"type": "keyword" },
      "type": {"type": "keyword" }, // TODO => conflict with ES7 TYPE?
      "operation":  {"type": "keyword" },
      "description": {"type": "text" },
      "timestamp": {"type" : "date"  },
      // Additional meta info about the event, normally a serialized object
      "meta": {"type": "text" },
      "user": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "username" : {"type" : "keyword" }
        }
      },
      // the changedata is stored under 'changedFields.TYPE', TYPE to avoid conflicting mappings 
      "changedFields": {
        "properties" : {
          "type" : {"type" : "keyword" }
          // data.oldValue.DATATYPE for storing the old value here
          //"data": {}
        }
      },
      // Authorization: shares as nested object or flat?
      // Nested would allow exact, non-flattened queries, eg. username+privilege
      /*"recordShares": {
        "type" : "nested",
        "properties" : {
          "id" : {"type" : "string" },
          "username" : {"type" : "string" },
          "privilege":  {"type" : "integer" }
        }
      }*/
      // the actual record data is stored under 'data.TYPE', TYPE to avoid conflicting mappings 
      
      // ToDo: 
      

      // Type: Snapshot
      // the latest, complete representation of a record. 
      // the content should be equal to the specific record in the domain index+type
      // heavy data duplication, but almost necessary for implementing a fast & transparent 'organization wide event store'
      // also helps if something goes wrong in the write process: by comparing the index-record & the snapshot via timestamps
      // the changes can be reconstructed 
      "name": {"type": "keyword" },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },


      // Type: Subscriber
      // recipents on events 
      "subscriberKey": {"type" : "keyword"  },
      // internal, external
      "subscriptionType": {"type" : "keyword"  },
      
      "fieldChanges": {"type" : "keyword"  },
      // Serialized script, take care of security implications when using 'eval'
      // only for trusted (internal) code
      "sourceFormatter": {"type" : "keyword"  },
      
      "targetUrl": {"type": "keyword" },
      "targetMethod": {"type": "keyword" },
      "active": {"type": "boolean" },
      
      // Type: Delivery
      "eventId": {"type" : "keyword"  },
      "subscriberId": {"type" : "keyword"  },
      "httpResponseCode": {"type" : "integer"  },
      "message": {"type" : "text" },
      
      // response
      "response": {
        "properties" : {
          "timestamp" : {"type" : "date" }
          // headers
          // body
        }
      }
    }    
  }
}