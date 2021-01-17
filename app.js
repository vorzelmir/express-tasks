const express = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const users = require('./data/users');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);

// check if valid user parameters
const checkUser = (user, res) => {
  let flag = true;
  if (typeof user.name !== 'string') {
    flag = false;
    return res.status(404).json({
      message: 'Type of name must be a string',
    });
  }
  if (typeof user.age !== 'number') {
    flag = false;
    return res.status(404).json({
      message: 'Age must be a number',
    });
  }
  if (typeof user.active !== 'boolean') {
    flag = false;
    return res.status(404).json({
      message: 'Active must be true of false',
    });
  }
  return flag;
};

// get all users
const getAllUsers = (req, res) => {
  res.json(users);
};

// get one user
const getUser = (req, res) => {
  const foundId = users.some((user) => user.id === Number(req.params.id));
  const foundName = users.some((user) => user.name === req.params.name);

  if (foundId && foundName) {
    res.json(
      users.filter(
        (user) => user.id === Number(req.params.id)
        && user.name === req.params.name,
      ),
    );
  } else {
    res.status(400).json({
      message: `No user found with id ${req.params.id} and ${req.params.name} name`,
    });
  }
};

// create one user by the next id
const createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = {
    id: newId,
    ...req.body,
  };

  // checkUser(newUser, res);
  users.push(newUser);
  res.send(users);
};

// create one user by explicitly done id
const createUserById = (req, res) => {
  const newId = req.params.id;
  const newUser = {
    id: newId,
    ...req.body,
  };
  // checkUser(newUser, res);
  users.push(newUser);
  res.send(users);
};

// update user
const updateUser = (req, res) => {
  const found = users.some((user) => user.id === Number(req.params.id));
  const updUser = req.body;

  if (found) {
    users.forEach((user) => {
      if (user.id === Number(req.params.id)) {
        user.name = updUser.name ? updUser.name : user.name;
        user.age = updUser.age ? updUser.age : user.age;
        user.active = updUser.active ? updUser.active : user.active;

        res.json({
          message: 'User updated',
          user,
        });
      }
    });
  } else {
    res.status(400).json({
      message: `No user found ${req.params.id} id ${updUser.name} name ${updUser.age} age  ${updUser.active} active`,
    });
  }
};

// delete user
const deleteUser = (req, res) => {
  const found = users.some((user) => user.id === Number(req.params.id));
  if (!found) {
    res.status(400).json({
      message: `Can not delete ${req.params.id} user`,
    });
  } else {
    res.json({
      message: 'User deleted ',
      user: users.filter((user) => user.id !== Number(req.params.id)),
    });
  }
};

const schemaCreateUser = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
  active: Joi.boolean().required(),
});

const schemaGetUser = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
});

const schemaUpdateUser = Joi.object({
  name: Joi.string(),
  age: Joi.number(),
  active: Joi.boolean(),
});

const schemaDeletUser = Joi.object({
  id: Joi.number().required(),
});

app.get('/api/users', getAllUsers);
app.get('/api/users/:id/:name', validator.params(schemaGetUser), getUser);
app.post('/api/users', validator.body(schemaCreateUser), createUser);
app.post('/api/users/:id', validator.body(schemaCreateUser), createUserById);
app.put('/api/users/:id', validator.body(schemaUpdateUser), updateUser);
app.delete('/api/users/:id', validator.params(schemaDeletUser), deleteUser);

// Server
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
