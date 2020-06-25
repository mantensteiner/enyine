
module.exports = {
  dataTypes: [{
          id: 'nr_float',
          name: 'Float',
          desc: '32bit floating point'
      },{
          id: 'nr_double',
          name: 'Double',
          desc: '64bit floating point'
      },{
          id: 'nr_long',
          name: 'Long',
          desc: '64 bit integer'
      },{
          id: 'nr_integer',
          name: 'Integer',
          desc: '32bit integer'
      },{
          id: 'nr_short',
          name: 'Short',
          desc: '16bit integer'
      },{
          id: 'nr_byte',
          name: 'Byte',
          desc: '8bit integer'
      },{
          id: 'val_bool',
          name: 'Bool',
          desc: 'boolean'
      },{
          id: 'val_date',
          name: 'Date',
          desc: 'string or number with (milli)second-since-the-epoch'
      },{
          id: 'val_geopoint',
          name: 'Geopoint',
          desc: 'latitude-longitude pair'
      },{
          id: 'val_ip',
          name: 'IP Address',
          desc: 'IPv4 or IPv6 address'
      },{
          id: 'val_keyword',
          name: 'Term',
          desc: 'string (term)'
      },{
          id: 'val_text',
          name: 'Text',
          desc: 'string (tokenized text, searchable)'
      }
  ]
}