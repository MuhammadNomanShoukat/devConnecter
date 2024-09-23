const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const User = require("../../models/Users");
const Post = require("../../models/Post");
const { check, validationResult } = require("express-validator");

// @route   POST api/posts
// @desc    Add a post comment
// @access  Private

router.put(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        user: req.user.id,
        name: user.name,
        text: req.body.text,
        avatar: user.avatar,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send("server error");
    }

    res.send("Post Route");
  }
);

// @route   DELETE api/posts
// @desc    Delete post by id
// @access  Public

router.delete("/comment/:id/:comment_id", [auth], async (req, res) => {
  try {
    // const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);
    
   

    const comment = post.comments.find(comment=>comment.id === req.params.comment_id)
    if(!comment){
        return res.status(404).json({msg: "Comment not found"})
    }

    if(comment.user.toString() !== req.user.id){
        return res.status(404).json({msg: "User not authorized"})
    }

    const removeIndex = post.comments.map(comment=>comment.user).indexOf(req.user.id)
    post.comments.splice(removeIndex, 1)

    await post.save()
    res.json(post.comments)

  } catch (err) {
    console.log(err.message);
    return res.status(500).send("server error");
  }
});

// @route   GET api/posts/like/:id
// @desc    Like a post by user id
// @access  Public

router.put("/like/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error");
  }
});

// @route   GET api/posts/like/:id
// @desc    Unlike a post by user id
// @access  Public

router.put("/unlike/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post not liked yet" });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error");
  }
});

// @route   GET api/posts
// @desc    Get post by id
// @access  Public

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    return res.status(500).send("Server error");
  }
});

// @route   DELETE api/posts
// @desc    Delete post by id
// @access  Public

router.delete("/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id); // Replace post.remove() with this

    res.json("Post removed");
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    return res.status(500).send("Server error");
  }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Public

router.get("/", [auth], async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error");
  }
});

// @route   POST api/posts
// @desc    Add post route
// @access  Private

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        user: req.user.id,
        name: user.name,
        text: req.body.text,
        avatar: user.avatar,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send("server error");
    }

    res.send("Post Route");
  }
);

module.exports = router;
