// The following code assumes
// API path: /api/menus/:menuId
// Data table name: Menu
// Each menu contains multiple menu items

// Dependencies
const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menu-items');

// Set up a sub-router
const menusRouter = express.Router();

// Set up the database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// GET all requests
menusRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Menu';
  db.all(sql, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menus: rows});
    }
  });
});

// For POST and PUT requests,
// check the validity of user inputs
const checkInputs = (req, res, next) => {
  req.title = req.body.menu.title;
  if (!req.title) {
    return res.sendStatus(400);
  }
  next();
}

// POST request
menusRouter.post('/', checkInputs, (req, res, next) => {
  const sql = 'INSERT INTO Menu ' +
              '(title) ' +
              'VALUES ($title)';
  const values = {
    $title: req.title
  };
  db.run(sql, values, function(err) { // Do not use the arrow function
      if (err) {
        next(err);
      }
      // Return the newly added row
      const sqlGet = 'SELECT * FROM Menu WHERE id = $id';
      const valuesGet = { $id: this.lastID }; // This is why we cannot use the arrow function
      db.get(sqlGet, valuesGet, (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).json({menu: row});
        }
      );
    }
  );
});

// For GET single, PUT, and DELETE requests,
// (also for requests on menu items)
// check if the requested menu exists
menusRouter.param('menuId', (req, res, next, id) => {
  const sql = 'SELECT * FROM Menu WHERE id = $id';
  const values = { $id: id };
  db.get(sql, values, (err, row) => {
      if (err) {
        next(err);
      } else if (!row) {
        res.sendStatus(404);
      } else {
        req.menu = row; // To be used for GET request below
        next();
      }
    }
  );
});

// GET single row request
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});


// PUT request
menusRouter.put('/:menuId', checkInputs, (req, res, next) => {
  const menuId = req.params.menuId;
  const sql = 'UPDATE Menu '+
              'SET title = $title '+
              'WHERE id = $id';
  const values = {
                  $title: req.title,
                  $id: menuId
                };
  db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
      // Return the updated row
        const sqlGet = 'SELECT * FROM Menu WHERE id = $id';
        const values = { $id: menuId };
        db.get(sqlGet, values, (err, row) => {
            if (err) next(err);
            res.status(200).json({menu: row});
          }
        );
      }
    }
  );
});

// Handle requests on menu items
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// Ensure that the menu to delete contains no menu items
menusRouter.use('/:menuId', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const values = { $menuId: req.params.menuId };
  db.get(sql, values, (err, menu) => {
      if (err) {
        next(err);
      } else if (menu) {
        res.sendStatus(400);
      } else {
        next();
      }
    }
  );
});

// DELETE request
menusRouter.delete('/:menuId', (req, res, next) => {
  const sql = 'DELETE FROM Menu WHERE id = $menuId';
  const values = { $menuId: req.params.menuId };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menusRouter;
