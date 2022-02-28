
const express = require('express')
const User = require("../models/User")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')

// Route 1 : creating user


router.post('/createuser', [
  body('name', 'enter a valid name').isLength({ min: 3 }),
  body('email', 'enter a valid email').isEmail(),
  body('password', 'password must be of 5 character').isLength({ min: 5 })

], async (req, res) => {

  //    console.log(req.body)
  //    const user = User(req.body)
  //    user.save()
  //    res.send(req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {


    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.status(400).json({ error: " A user with this email already exist" })
    }


    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(req.body.password, salt)
    user = await User.create({

      name: req.body.name,
      email: req.body.email,
      password: secPass
    })

    // .then(user => res.json(user))
    //  .catch(err=>{console.log(err)
    //  res.json({error:"Please enter a unique email"})})
    //    res.send(req.body)
    const JWT_SECRET = "Harryisagoodboy";
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET)
    // console.log(jwtData);
    res.json({ authtoken })
    // res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("some error occured")
  }
})

//https://education.github.com/discount_requests/6655260/additional_information



// Route 2 : for login

router.post('/login', [

  body('email', 'enter a valid email').isEmail(),
  body('password', 'password cannot be wrong').exists()


], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body
  try {
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" })

    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try to login with correct credentials" })

    }
    const JWT_SECRET = "Harryisagoodboy";
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET)
    // console.log(jwtData);
    res.json({ authtoken })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server error")
  }
})




// Route 3 : logged user data 
router.post('/getuser', fetchuser, async (req, res) => {
  try {

    const userId = req.user.id
    const user = await User.findById(userId).select("-password")
     res.send(user)

  } catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server error")
  }
})
module.exports = router 