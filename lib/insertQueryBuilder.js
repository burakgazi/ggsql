const moment = require('moment');

/**
 * Converts given object to insert sql query with returning id fields
 * @param {Object} obj - Object to be inserted to sql
 */
function insertQueryBuilder(obj) {
  const that = this;
  that.query = [];
  that.declars = '';
  that.decalarsName = [];
  that.index = 0;
  that.arrayLoop = (mapObjArray, parentId) => {
    for (let a = mapObjArray.length - 1; a > -1; a--) {
      that.main(mapObjArray[a], parentId);
    }
  };
  that.main = (mapObj, parentId) => {
    // Main function
    let values = '';
    let keys = '';
    // Make table name adjustmant and delete from object so we dont try to write it as value
    const dbName = mapObj._tableName;
    if(!dbName){
        throw new Error('No table name given!')
    }
    let name = dbName;

    that.index = 0;
    while (that.decalarsName.indexOf(`${name}${that.index}`) !== -1) {
      that.index += 1;
    }
    name = `${name}${that.index}`;
    if (!mapObj._declare) {
      mapObj._declare = name;
    }
    // Make lnkid adjustmant and delete from object so we dont try to write it as value
    if (mapObj._lnk) {
      mapObj[mapObj._lnk] = `@${parentId}`;
    }

    const mapObjKeys = Object.keys(mapObj);
    for (let moki = 0; moki < mapObjKeys.length; moki += 1) {
      let key = mapObjKeys[moki];
      let element = mapObj[key];
      // We do not want to write the properties to db
      if (!key.startsWith('_')) {
        key = `[${key}]`;
        // Continue on to normal operations
        if (element === null || element === undefined || Number.isNaN(element)) {
          element = 'NULL';
        }
        switch (element.constructor) {
          case String:
            keys += `${key},`;
            if (element === 'NULL') {
              values += 'NULL ,';
            } else if (element.startsWith('@')) {
              values += `${element} ,`;
            } else {
              values += `'${element.replace(/'/g, "''")}',`;
            }
            break;
          case Number:
            keys += `${key},`;
            values += `${`${element}`.replace(',', '.')},`;
            break;
          case Boolean:
            keys += `${key},`;
            values += `${element ? 1 : 0},`;
            break;
          case Array:
            that.arrayLoop(element, name);
            break;
          case Date:
            keys += `${key},`;
            values += `'${moment(element).format('YYYYMMDD HH:mm:ss')}',`;
            break;
          case Object:
            that.main(element, name);
            break;
          default:
            keys += `${key},`;
            values += 'NULL,';
            break;
        }
      }
    }
    let identityKey = '';
    if (that.decalarsName.indexOf(name) === -1) {
      identityKey += `select @${name} = @@IDENTITY;`;
      that.declars += `DECLARE @${name} int `;
      that.decalarsName.push(name);
    }
    keys = keys.substring(0, keys.length - 1);
    values = values.substring(0, values.length - 1);
    let subquery = `INSERT INTO  ${dbName} (${keys}) VALUES(${values});`;
    subquery += identityKey;
    that.query.push(subquery);
  };

  that.main(obj);
  let response = '';
  for (let a = that.query.length - 1; a > -1; a--) {
    response += that.query[a];
  }
  response += 'select ';
  for (let d = 0; d < that.decalarsName.length; d++) {
    const nm = that.decalarsName[d];
    response += `@${nm} `;
    response += `as '${nm}'`;
    if (d !== that.decalarsName.length - 1) {
      response += ',';
    }
  }
  return that.declars + response;
}


module.exports = insertQueryBuilder;