// much better, so clean and nice
const t = require('tap');
const Project = require('../index');

t.test('Insert Query Builder', (t) => {
  t.equal(
    Project.updateQueryBuilder({
      name: 'mike',
      age: 35,
      _tableName: 'tblUser',
      _idName: 'lid',
      _id: 1,
    }),
    "UPDATE tblUser SET [name]='mike', [age]=35 WHERE [lid]= 1;",
    'Update 2 fields'
  );
  t.equal(
    Project.updateQueryBuilder({
      name: 'Jane',
      adresses: [
        {
          no: 2,
          floor: null,
          adress: '@123',
          residential: true,
          saved_at: new Date('2023-01-01T01:00:00'),
          _tableName: 'tblAddress',
          _idName: 'altid',
          _id: 2,
        },
      ],
      _tableName: 'tblUsers',
      _idName: 'lid',
      _id: 1,
    }),
    "UPDATE tblUsers SET [name]='Jane' WHERE [lid]= 1;UPDATE tblAddress SET [no]=2, [floor]=NULL, [adress]='@123', [residential]=1, [saved_at]='20230101 01:00:00' WHERE [altid]= 2;",
    'Update sub document with datetime and bool'
  );

  t.throws(() => Project.updateQueryBuilder({ a: 1 }), 'No table name given!');

  t.end();
});

