const express = require("express")
const router = express.Router()
const auth = require('../../middlewares/auth')
const User = require('../../models/Users')
const bcrypt = require("bcryptjs")
const config = require('config')
const jwt = require('jsonwebtoken');
const { check, validationResult} = require('express-validator')

// @route   GET api/auth
// @desc    Test route
// @access  Public

router.get("/", auth, async (req, res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server error")
    }
})

// @route   POST api/auth
// @desc    Authenticate & get token
// @access  Public

router.post("/", [
    check('email', 'Please include a valid email address').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } 

    // getting payload from request
    const { email, password } = req.body
    
    try {
        // Checking the user into the database
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({errors: [{msg: "invalid credentials"}]})
        }

        // Comparing the password 
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({errors: [{msg: "invalid credentials"}]})
        }

        const payload = {
            user:{
                id:user._id
            }
        }

        // Generating a new JWT token for the user
        jwt.sign(payload, config.get('jwtToken'), { expiresIn: 3600 }, (err, token)=>{
            if (err) throw err
            res.json(token)
        });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


module.exports = router