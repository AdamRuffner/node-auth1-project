const router = require("express").Router();

const Users = require("./users-model");

router.get('/', secure, (req,res) => {
    Users.find()
    .then( users => {
        res.status(200).json(users)
    })
})

//middleware
function secure(req, res, next) {
    if (req.session && req.session.user) {
      next()
    } else {
      res.status(401).json({ message: 'Unauthorized!' })
    }
  }


module.exports = router;
