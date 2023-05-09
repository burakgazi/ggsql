const moment = require('moment');

/**
 * Converts object to update sql query
 * @param {Object} obj - Object to be updated
 */
function updateQueryBuilder(obj) {
  // insertinto statement
  const that = this;
  that.query = [];
  that.declars = '';
  that.decalarsName = [];
  that.index = 0;
  that.arrayLoop = (mapObjArray) => {
    for (let a = 0; a < mapObjArray.length; a++) {
      that.main(mapObjArray[a]);
    }
  };

  that.main = (mapObj) => {
    // Main function
    const values = [];
    const keys = [];
    // Make table name adjustmant and delete from object so we dont try to write it as value
    const dbName = mapObj._tableName;
    if (!dbName) {
      throw new Error('No table name given!');
    }
    // Make lnkid adjustmant and delete from object so we dont try to write it as value
    const objKeys = Object.keys(mapObj);
    for (let oi = 0; oi < objKeys.length; oi += 1) {
      let key = objKeys[oi];
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
            keys.push(`${key}`);
            if (element === 'NULL') {
              values.push('NULL');
            } else {
              values.push(`'${element.replace(/'/g, "''")}'`);
            }
            break;
          case Number:
            keys.push(`${key}`);
            values.push(`${element}`.replace(',', '.'));
            break;
          case Boolean:
            keys.push(`${key}`);
            values.push(`${element ? 1 : 0}`);
            break;
          case Array:
            that.arrayLoop(element);
            break;
          case Date:
            keys.push(`${key}`);
            values.push(`'${moment(element).format('YYYYMMDD HH:mm:ss')}'`);
            break;
          case Object:
            that.main(element);
            break;
          default:
            keys.push(`${key}`);
            values.push('NULL');
            break;
        }
      }
    }

    if (keys.length > 0) {
      let subquery = `UPDATE ${dbName} SET `;
      for (let k = 0; k < keys.length; k++) {
        subquery += `${keys[k]}=${values[k]}`;
        if (k !== keys.length - 1) {
          subquery += ', ';
        }
      }
      subquery += ` WHERE [${mapObj._idName}]= ${mapObj._id};`;
      
      that.query.push(subquery);
    }
  };

  that.main(obj);
  let response = '';
  for (let a = that.query.length - 1; a > -1; a--) {
    response += that.query[a];
  }
  return response;
}

module.exports = updateQueryBuilder;
