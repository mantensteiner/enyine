
module.exports = {
  index_name: "value",
  type_names: ["value", "target", "sensor"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "value": {
    properties : {
      "id": {"type" : "keyword"  },
      "spaceId": {"type" : "keyword" },
      "commitId": {"type" : "keyword" },
      
      "targetId": {"type" : "keyword" },
      
      "sensorId": {"type" : "keyword" },
      
      // a value can be related to many items, but only have one value type (1 quantity/unit)
      "valueType": {
        properties: {
          "id": { "type" : "keyword" },
          "metricId": { "type" : "keyword" },            
          "quantityId": { "type" : "keyword" },     
          // the symbol defines the unit to be used (the factor)       
          "symbol": { "type" : "keyword" },
          // store the used factor on the calculation for later reference
          "factor": { "type" : "half_float" },
          // directly provide the datatype key for further use (UI, aggregations)
          "dataTypeKey": { "type" : "keyword" },            
        }
      },
      
      // values, different data types
      // the _int values are the converted, internal values for a quantity
      // this allows for calculations, aggregations over different units for a quantity
      // which are then converted to a display unit via the units factor
      "value": {
        "properties" : {
          "nr_float": {"type" : "float"  },
          "nr_float_int": {"type" : "float"  },
          "nr_double": {"type" : "double"  },
          "nr_double_int": {"type" : "double"  },
          "nr_long": {"type" : "long"  },
          "nr_long_int": {"type" : "long"  },
          "nr_integer": {"type" : "integer"  },
          "nr_integer_int": {"type" : "integer"  },
          "nr_short": {"type" : "short"  },
          "nr_short_int": {"type" : "short"  },
          "nr_byte": {"type" : "byte"  },
          "nr_byte_int": {"type" : "byte"  },
          
          // multiplier 
          "nr_mul": {"type" : "double" },
          // offset
          "nr_off": {"type" : "double" },
          // if needed: calculated value from mul/off
          "nr_calc": {"type" : "double" },

          "val_bool": {"type" : "boolean"  },
          "val_date": {"type" : "date"  },
          "val_geopoint": {"type" : "geo_point" },
          "val_ip": {"type" : "ip" },
          "val_keyword": {"type" : "keyword"  },
          "val_text": {"type" : "text"  },
        }
      },
      
      "createdOn" : {"type" : "date"  },
      "createdBy" : {"type" : "keyword" },
      "modifiedOn" : {"type" : "date"  },
      "modifiedBy" : {"type" : "keyword" },
      "date" : {"type" : "date"  },
      "comment": { "type" : "text" },
      /*"suggestComment" : {
        "type" : "completion",
        "index_analyzer" : "simple",
        "search_analyzer" : "simple",
        "payloads" : true
      },*/
      "responsible": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "email" : {"type" : "keyword" },
          "username" : {"type" : "keyword"  }
        }
      },
      
      "items": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "itemTypeId" : {"type" : "keyword" },
          
          // array of items which are parent to the current item
          // e.g. for aggs over multiple levels, eg items on a milestone relate the milestone here
          "parentItems" : {
            properties: {
                "id": {"type" : "keyword" },
                
                // also storing the relationType between the items allows for fine grained 
                // analytics over different layers
                "relationTypeId": {"type" : "keyword" }
            }
          }
        }
      },
      
      
      // relation to the ressource domain, typeId may classify relation 
      // which may be useful e.g. to show (text) aggregations from the ressource on certain types 
      "resources": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "typeId" : {"type" : "keyword" }
        }
      },
      "tags": {
        properties: {
          "id": {"type" : "keyword" },
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
          }
        }
      },

      // TARGET
      // the aggregated value from the values fitting the target
      "valueActual": {
        "properties" : {
          "nr_float": {"type" : "float"  },
          "nr_float_int": {"type" : "float"  },
          "nr_double": {"type" : "double"  },
          "nr_double_int": {"type" : "double"  },
          "nr_long": {"type" : "long"  },
          "nr_long_int": {"type" : "long"  },
          "nr_integer": {"type" : "integer"  },
          "nr_integer_int": {"type" : "integer"  },
          "nr_short": {"type" : "short"  },
          "nr_short_int": {"type" : "short"  },
          "nr_byte": {"type" : "byte"  },
          "nr_byte_int": {"type" : "byte"  },

          "nr_mul": {"type" : "double" },
          "nr_off": {"type" : "double" },
          "nr_calc": {"type" : "double" },
          
          "val_bool": {"type" : "boolean"  },
          "val_date": {"type" : "date"  },
          "val_geopoint": {"type" : "geo_point" },
          "val_ip": {"type" : "ip" },
          "val_keyword": {"type" : "keyword"  },
          "val_text": {"type" : "text"  }
        }
      },

      // SENSOR
      // a sensor must measure a certain quantity with unit
      // sensors are fixed sets of masterdata supported by the mobile-app (eg GPS, Heart Rate, Steps,...)
      "quantityId": { "type" : "keyword" }, 
      "symbol": { "type" : "keyword" }
    }
  }

}
