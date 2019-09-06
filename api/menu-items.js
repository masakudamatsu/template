// Data table: MenuItem
// Path: /api/menus/:menuId/menu-items/:menuItemId

// Dependencies
const express = require('express');
const sqlite3 = require('sqlite3');

// Set up a sub router with parameters inherited from the parent router
const menuItemsRouter = express.Router({mergeParams: true});

// Set up the database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// GET all requests
menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem ' +
              'WHERE menu_id = $menuId';
  const values = {
    $menuId: req.params.menuId // the paremter inherited
  };
  db.all(sql, values, (err, rows) => {
    if (err) {
      next(err);
    } else if (!rows) {
      res.sendStatus(404);
    } else {
      res.status(200).json({menuItems: rows});
    }
  });
});

// For POST and PUT requests,
// check the validity of user inputs
const checkInputs = (req, res, next) => {
  req.name = req.body.menuItem.name;
  req.description = req.body.menuItem.description;
  req.inventory = req.body.menuItem.inventory;
  req.price = req.body.menuItem.price;
  if (!req.name || !req.inventory || !req.price) {
    return res.sendStatus(400);
  }
  next();
}

// POST request
menuItemsRouter.post('/', checkInputs, (req, res, next) => {
  const menuId = req.params.menuId;
  const sql = 'INSERT INTO MenuItem ' +
              '(name, description, inventory, price, menu_id) ' +
              'VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: req.name,
    $description: req.description,
    $inventory: req.inventory,
    $price: req.price,
    $menuId: menuId
  };
  db.run(sql, values, function(err) { // Do not use the arrow function
      if (err) {
        next(err);
      }
      // Return the newly added row
      const sqlGet = 'SELECT * FROM MenuItem '+
                     'WHERE id = $id';
      const values = { $id: this.lastID } // This is why we cannot use the arrow function
      db.get(sqlGet, values, (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).json({menuItem: row});
        }
      );
    }
  );
});

// For PUT and Delete request,
// check if the requested menu item exists
menuItemsRouter.param('menuItemId', (req, res, next, id) => {
  const sql = 'SELECT * FROM MenuItem '+
              'WHERE id = $menuItemId';
  const values = { $menuItemId: id };
  db.get(sql, values, (err, menuItem) => {
      if (err) {
        next(err);
      } else if (!menuItem) {
        res.sendStatus(404);
      } else {
        req.menuItem = menuItem;
        next();
      }
    }
  );
});

// GET single row request
menuItemsRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).json({menuItem: req.menuItem});
});

// PUT request
menuItemsRouter.put('/:menuItemId', checkInputs, (req, res, next) => {
  const menuId = req.params.menuId;
  const menuItemId = req.params.menuItemId;
  const sql = 'UPDATE MenuItem ' +
              'SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId ' +
              'WHERE id = $id';
  const values = {
    $name: req.name,
    $description: req.description,
    $inventory: req.inventory,
    $price: req.price,
    $menuId: menuId,
    $id: menuItemId
  };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
    // Return the updated row
      const sqlGet = 'SELECT * FROM MenuItem '+
                     'WHERE id = $id';
      const values = { $id: menuItemId };
      db.get(sqlGet, values, (err, row) => {
          if (err) next(err);
          res.status(200).json({menuItem: row});
        }
      );
    }
  });
});

// Delete requests
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem '+
              'WHERE id = $menuItemId';
  const values = { $menuItemId: req.params.menuItemId };
  db.run(sql, values, (err) => {
      if (err) {
        next(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = menuItemsRouter;
