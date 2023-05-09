// much better, so clean and nice
const t = require('tap');
const Project = require('../index');

t.test('Insert Query Builder', (t) => {
  t.equal(
    Project.insertQueryBuilder({
      name: 'mike',
      age: 35,
      _tableName: 'tblUser',
    }),
    "DECLARE @tblUser0 int INSERT INTO  tblUser ([name],[age]) VALUES('mike',35);select @tblUser0 = @@IDENTITY;select @tblUser0 as 'tblUser0'",
    'Insert 1 object'
  );
  t.equal(
    Project.insertQueryBuilder({
      name: 'Jane',
      adresses: [
        {
          no: 2,
          floor: null,
          adress: '@123',
          residential: true,
          saved_at: new Date('2023-01-01T01:00:00'),
          _tableName: 'tblAddress',
        },
      ],
      _tableName: 'tblUsers',
    }),
    "DECLARE @tblAddress0 int DECLARE @tblUsers0 int INSERT INTO  tblUsers ([name]) VALUES('Jane');select @tblUsers0 = @@IDENTITY;INSERT INTO  tblAddress ([no],[floor],[adress],[residential],[saved_at]) VALUES(2,NULL ,@123 ,1,'20230101 01:00:00');select @tblAddress0 = @@IDENTITY;select @tblAddress0 as 'tblAddress0',@tblUsers0 as 'tblUsers0'",
    'Insert sub objcet with date and bool'
  );

  t.throws(() => Project.insertQueryBuilder({ a: 1 }), 'No table name given!');

  t.end();
});

