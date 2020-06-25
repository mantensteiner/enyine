
module.exports = {
  index_name: "item",
  type_names: ["item"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "item": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "txnId": {"type" : "keyword" },
      "spaceId": {"type" : "keyword" },
      "itemTypeId": {"type" : "keyword" },
      "token": {"type" : "keyword" },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      "mood" : {"type" : "keyword" },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "hasDate": {"type" : "boolean" },
      "date" : {"type" : "date" },

      "startDate" : {"type" : "date" },
      "endDate" : {"type" : "date" },
              
      "description": { "type" : "text" },
      "status": {
        "properties" : {
          "id": {"type" : "keyword" },
          "key": {"type" : "keyword" }
        }
      },
      "priority": {
        "properties" : {
          "id": {"type" : "keyword" },
          "key" : {"type" : "keyword" }
        }
      },
      "owner": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "username" : {"type" : "keyword" }
        }
      },
      "relations": {
        properties: {
          "id": {"type" : "keyword" },
          "itemTypeId": { "type" : "keyword" },
          "createdOn" : { "type" : "date" },
          "createdBy" : { "type" : "keyword" },
          "order" : { "type" : "integer" },
          "isParent" : {"type" : "boolean" },
          
          // from relationType
          "typeId": { "type" : "keyword"  },
          
          // custom fields inherited from relationType
          // customFields.DATATYPE: { properties: { valueId:'', value:...} }
        }
      },
      "tags": {
        properties: {
          "id": { "type" : "keyword" },
          "createdOn" : { "type" : "date" },
          "createdBy" : { "type" : "keyword" },
          "inherited": {
            properties: {
              "id": {"type" : "keyword" },
              // different types can be tagged, eg. items, values, messages, notes,...
              "typeId": { "type" : "keyword"  }, 
              "createdOn" : { "type" : "date" },
              "createdBy" : { "type" : "keyword" }
            }
          },
          "typeId": {"type" : "keyword" },
          "classId": {"type" : "keyword" },
          "keyId": {"type" : "keyword" },
          "privileges": {
            properties: {
              "userId": {"type" : "keyword" },
              "r": {"type" : "boolean" },
              "w": { "type" : "boolean"  }, 
              "d" : { "type" : "boolean" },
              "s" : { "type" : "boolean" }
            }
          },
        }
      },

      // Type: relationType
      // on space basis, but can be derived from template on space creation (duplicate with new id)
      // could also custom fields later
      // in general: things that are derived from a template get a new id,
      // but the id defined in the template is also stored in the record 
      // this allows for analytics later on independent of individual spaces
      // the id to be copied of (defined in template)
      "sourceId": {"type" : "keyword"  },
      "customFields" : {
        properties: {
          "dataType": {"type" : "keyword" },
          "name": {"type" : "keyword" },
          
          // can hold defaults (id,value to support optionSets)
          "defaultValues": {
            properties: {
              "id": {"type" : "keyword" },
              "value": {"type" : "keyword" }
            }
          }
        }
      }
    }    
  }  
}
