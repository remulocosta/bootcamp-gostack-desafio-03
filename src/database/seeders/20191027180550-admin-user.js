const bcrypt = require('bcryptjs');

module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Administrador',
          email: 'admin@gympoint.com',
          password_hash: bcrypt.hashSync('123456', 7),
          admin_user: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Remulo',
          email: 'remulo.costa@gmail.com',
          password_hash: bcrypt.hashSync('123123', 7),
          admin_user: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Suzana',
          email: 'sucosta@gmail.com',
          password_hash: bcrypt.hashSync('121212', 7),
          admin_user: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
