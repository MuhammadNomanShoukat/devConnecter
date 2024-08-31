const express = require("express")
const router = express.Router()
const auth = require("../../middlewares/auth")
const { check, validationResult } = require("express-validator")
const User = require("../../models/Users")
const Profile = require("../../models/Profile")
const request = require('request');

// @route   GET api/profile/me
// @desc    Get my profile
// @access  Private
router.get("/me", [auth], async (req, res)=>{
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['user', 'avatar'])

        if(!profile){
            res.status(400).json({msg: "There is no profile for this user"})
        }

    }catch(err){
        res.status(500).send("server error")
    }
})

// @route   post api/profile
// @desc    Create or update user profile
// @access  Private
router.post("/", [auth, 
    [
        check("skills", "Skills are required").not().isEmpty(),
        check("status", "Status is required").not().isEmpty()

    ]
], async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram

    } = req.body
    

    const profileField = {}
    profileField.user = req.user.id
    if(company) profileField.company = company
    if(website) profileField.website = website
    if(location) profileField.location = location
    if(bio) profileField.bio = bio
    if(status) profileField.status = status
    if(githubusername) profileField.githubusername = githubusername
    if(skills) profileField.skills = skills.split(",").map(skill=>skill.trim())
    
    profileField.socials = {}
    if(youtube) profileField.socials.youtube = youtube
    if(twitter) profileField.socials.twitter = twitter
    if(facebook) profileField.socials.facebook = facebook
    if(linkedin) profileField.socials.linkedin = linkedin
    if(instagram) profileField.socials.youtube = instagram

    try{
        let profile = await Profile.findOne({user: req.user.id})
        
        if(profile){
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileField},
                {new: true}
            )
            return res.status(200).json(profile)
        }

        profile = new Profile(profileField)
        await profile.save()

        return res.status(200).json(profile)
    }catch(err){
        res.status(500).send("server error")
    }
})

// @route   POST api/profile/experience
// @desc    Post add user experience
// @access  Private
router.post("/experience", [auth, 
    [
        check("title", "Title is required").not().isEmpty(),
        check("company", "Company is required").not().isEmpty(),
        check("from", "From is required").not().isEmpty()
    ]
], async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description

    } = req.body


    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({user: req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)

    }catch(err){
        console.log(err.message)
        res.status(500).send("server error")
    }
})

// @route   POST api/profile/education
// @desc    Post add user education
// @access  Private
router.post("/education", [auth, 
    [
        check("school", "Title is required").not().isEmpty(),
        check("degree", "Company is required").not().isEmpty(),
        check("fieldofstudy", "From is required").not().isEmpty(),
        check("from", "From is required").not().isEmpty()
    ]
], async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description

    } = req.body


    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({user: req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)

    }catch(err){
        console.log(err.message)
        res.status(500).send("server error")
    }
})

// @route   DELETE api/profile/education/:exp_id
// @desc    Delete a user education
// @access  Private
router.delete("/education/:edu_id", [auth], async (req, res)=>{
    try{
        const profile = await Profile.findOne({user: req.user.id})
        if(!profile){
            return res.status(400).json({msg: "There is no profile for this user"})
        }

        const removeIndex = profile.education.map((item)=>item.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex, 1)

        await profile.save()

        res.status(200).json(profile)

    }catch(err){
        console.log(err.message)
        if(err.kind == "ObjectId"){
            return res.status(400).json({msg: "Profile not found"})
        }
        res.status(500).send("server error")
    }
})


// @route   GET api/profile
// @desc    Get all profiles
// @access  Private
router.get("/", async (req, res)=>{
    try{
        const profiles = await Profile.find().populate('user', ['user', 'avatar'])
        res.status(400).json(profiles)

    }catch(err){
        res.status(500).send("server error")
    }
})

// @route   GET api/profile/user/:userId
// @desc    Get user profile by user id
// @access  Private
router.get("/user/:userId", async (req, res)=>{
    try{
        const profile = await Profile.findOne({user: req.params.userId}).populate('user', ['user', 'avatar'])
        if(!profile){
            return res.status(400).json({msg: "There is no profile for this user"})
        }
        res.status(400).json(profile)

    }catch(err){
        console.log(err.message)
        if(err.kind == "ObjectId"){
            return res.status(400).json({msg: "Profile not found"})
        }
        res.status(500).send("server error")
    }
})

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete a user experience
// @access  Private
router.delete("/experience/:exp_id", [auth], async (req, res)=>{
    try{
        const profile = await Profile.findOne({user: req.user.id})
        if(!profile){
            return res.status(400).json({msg: "There is no profile for this user"})
        }

        const removeIndex = profile.experience.map((item)=>item.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.status(200).json(profile)

    }catch(err){
        console.log(err.message)
        if(err.kind == "ObjectId"){
            return res.status(400).json({msg: "Profile not found"})
        }
        res.status(500).send("server error")
    }
})



// @route   DELETE api/profile
// @desc    Delete user profile & user
// @access  Private
router.delete("/", [auth], async (req, res)=>{
    try{

        // delete user proifle
        await Profile.findOneAndDelete({user: req.user.id})

        // delete user 
        await User.findOneAndDelete({_id: req.user.id})

        res.status(200).send("User deleted")
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server error")
    }
})



// @route   GET api/profile/github/:username
// @desc    Get github user profile
// @access  Private
router.get("/github/:username", [auth], async (req, res)=>{

    const username = req.params.username; // Replace with the GitHub username

    const options = {
        url: `https://api.github.com/users/${username}`,
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    try{
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const userProfile = JSON.parse(body);
                console.log('GitHub User Profile:', userProfile);
                return res.status(200).json(userProfile)
            } else {
                res.status(404).send("Profile not found")
            }
        });
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server error")
    }
})




module.exports = router