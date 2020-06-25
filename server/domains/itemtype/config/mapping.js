
module.exports = {
  index_name: "itemtype",
  type_names: ["itemtype"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "itemtype": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "sourceId": {"type" : "keyword" },
      "spaceId": {"type" : "keyword" },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      // e.g. a github labelname
      "aliasNames": { "type" : "keyword" },
      "color": { "type" : "keyword" },
      "icon": { "type" : "keyword" },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      
      "valueTypes": {
        properties: {
          "id": { "type" : "keyword" },
          // id from inherited valueType (e.g. from system or own)
          "sourceId": { "type" : "keyword" },
          "quantityId": { "type" : "keyword" },
          "dataTypeKey": {"type" : "keyword"  },
          "symbol": { "type" : "keyword" },
          "name" : {
            "type" : "text",
            "fields": {
              "raw": { "type": "keyword" }
            }
          },
          // inline analytics by aggregation type, timeframe, target-value
          metrics: {
            properties: {
              "id": { "type" : "keyword" },
              "name" : {
                "type" : "text",
                "fields": {
                  "raw": { "type": "keyword" }
                }
              },
              "enabled": { "type" : "boolean" },
              "aggType": { 
                properties: {
                  "id": { "type" : "keyword" },
                  "name": { "type" : "keyword" }
                } 
              },
              "timeframe": { 
                properties: {
                  "id": { "type" : "keyword" },
                  "name": { "type" : "keyword" },
                  // expression: h,day,month,...,total
                  "exp": { "type" : "keyword" }
                } 
              },
              "timerange": { 
                properties: {
                  "id": { "type" : "keyword" },
                  "start": { "type" : "date" },
                  "end": { "type" : "date" }
                } 
              },
              // used data type inherits from dataTypeKey in quantity, _int calculated from used symbol
              "targetValue": {
                "properties" : {
                  "nr_float": {"type" : "float" },
                  "nr_float_int": {"type" : "float" },
                  "nr_double": {"type" : "double" },
                  "nr_double_int": {"type" : "double" },
                  "nr_long": {"type" : "long" },
                  "nr_long_int": {"type" : "long" },
                  "nr_integer": {"type" : "integer" },
                  "nr_integer_int": {"type" : "integer" },
                  "nr_short": {"type" : "short" },
                  "nr_short_int": {"type" : "short" },
                  "nr_byte": {"type" : "byte" },
                  "nr_byte_int": {"type" : "byte" },
                  
                  // multiplier 
                  "nr_mul": {"type" : "double" },
                  // offset
                  "nr_off": {"type" : "double" },
                  // if needed: calculated value from mul/off
                  "nr_calc": {"type" : "double" },

                  "val_bool": {"type" : "boolean" },
                  "val_date": {"type" : "date" },
                  "val_geopoint": {"type" : "geo_point" },
                  "val_ip": {"type" : "ip" },
                  "val_keyword": {"type" : "keyword" },
                  "val_text": {"type" : "text" },
                }
              },

              // predefined set of options for easier value selections 
              "selectionSet": { 
                properties: {
                  "order": {"type" : "short" },
                  
                  "nr_float": {"type" : "float" },
                  "nr_float_int": {"type" : "float" },
                  "nr_double": {"type" : "double" },
                  "nr_double_int": {"type" : "double" },
                  "nr_long": {"type" : "long" },
                  "nr_long_int": {"type" : "long" },
                  "nr_integer": {"type" : "integer" },
                  "nr_integer_int": {"type" : "integer" },
                  "nr_short": {"type" : "short" },
                  "nr_short_int": {"type" : "short" },
                  "nr_byte": {"type" : "byte" },
                  "nr_byte_int": {"type" : "byte" },
                  
                  "val_bool": {"type" : "boolean" },
                  "val_date": {"type" : "date" },
                  "val_geopoint": {"type" : "geo_point" },
                  "val_ip": {"type" : "ip" },
                  "val_keyword": {"type" : "keyword" },
                  "val_text": {"type" : "text" }
                } 
              }
            }               
          }
        }
      },
      
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
          
          // ToDo: store layout (eg grid) information for customizable positioning
        }
      }
    }    
  }
}
