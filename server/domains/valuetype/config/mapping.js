
module.exports = {
  index_name: "valuetype",
  type_names: ["valuetype"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "valuetype": {
    properties : {
      "id": { "type" : "keyword"  },
      "type": { "type" : "keyword"  },

      "sourceId": { "type" : "keyword"  },
      
      // Eg. "Body Weight"
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      
      // Preset master data types 
      // Users should be guided to using the global types, which allows for rich analytics 
      // at a later stage 
      // eg analyze/filter over valuetype 'Body Weight' over many users
      // find users that match a goal (eg lose 5kg) and extract patterns from their behaviour
      // to make recommendations to other users
      // 'global', 'space'
      "visibility": { "type": "keyword" },
      
      // allow everybody to create & save new value types visible to private spaces (my spaces)
      // global (system) types are curated to avoid messing up the UX
      "spaceId": { "type" : "keyword"  },
      "createdOn" : {"type" : "date"  },
      "createdBy" : {"type" : "keyword" },
      "modifiedOn" : {"type" : "date"  },
      "modifiedBy" : {"type" : "keyword" },
      "comment": { "type" : "text" },
      
      // To provide a set of default value types when configuring an itemtype from a template
      "templates": {
        properties: {
          "id": { "type" : "keyword" },
        }
      },
      
      // Define the quantity, but not the symbol.
      // The symbol is stored in the itemtype-object for the valuetype, 
      // let the user choose his prefered unit for a quantity.
      "quantity": {
        properties: {
          "id": { "type" : "keyword" }
        }
      }
    }
  }
}
