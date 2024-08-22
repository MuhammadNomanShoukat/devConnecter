const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs")
const config = require('config')
const jwt = require('jsonwebtoken');
const { check, validationResult } = require("express-validator")
const User = require("../../models/Users")

// @route   POST api/users
// @desc    Test route
// @access  Public
router.post("/",[
    check("name", "Name is required field").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Please enter a password with 6 or more character").isLength({min: 6})
] , async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    } 

    // getting payload from request body
    const { name, email, password } = req.body
    
    try{
        // checking the user if exists into the database
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({errors: [{msg: "User already exist"}]})
        }

        // creating a gravatar
        const avatar = gravatar.url(email, {
            s:'200',
            r:'pg',
            d:'mm'
        })

        // creating a new user object
        const newUser = new User({
            name,
            email,
            password,
            avatar
        })

        // generating a salt and password
        const salt = await bcrypt.genSalt(10)
        newUser.password = await bcrypt.hash(password, salt)

        // save a new user into the database
        await newUser.save()

        const payload = {
            user:{
                id: newUser.id
            }
        }

        // generating a JWT token for a new user
        jwt.sign(payload, config.get('jwtToken'), { expiresIn: 3600 }, (err, token)=>{
            if (err) throw err
            res.json(token)
        });
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server error")
    }
})

module.exports = router