// models/Role.js
module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    });
    return Role;
  };
  