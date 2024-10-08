/* 
!!The Class has only one instance and provides global point of access,
!!e.g. when we need only one connection to db, we don't want to open multiple connections
 */

const Database = (function () {
  let instance;
  function createInstance() {
    return { connection: "Database connected" + `${Date.now()}` };
  }
  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

const db1 = Database.getInstance();
console.log(db1);
const db2 = Database.getInstance();
console.log(db2);

console.log(db1 === db2);
