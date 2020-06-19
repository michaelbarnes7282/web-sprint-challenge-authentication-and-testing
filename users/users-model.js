const db = require("../database/dbConfig.js");

module.exports = {
  add,
  find,
  findBy,
  findById,
};


function find() {
  return db("users").select("id", "username").orderBy("id");
}

// return the role name as role, together with the user data
function findBy(filter) {
  return db('users')
  .where(filter)
  .orderBy('id');
}

async function add(user) {
  try {
    const [id] = await db("users").insert(user, "id");

    return findById(id);
  } catch (error) {
    throw error;
  }
}

function findById(id) {
  return db("users").where({ id }).first();
}