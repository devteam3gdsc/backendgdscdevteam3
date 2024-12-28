import Post from "../models/Posts.mjs"

const postController = {
//[GET] /community?page=...&limit=...
getPost: async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit;
        const posts = await Post.find({visibility: "public"})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            //.populate("author", "username")
            //.select("title content createAt likes files")
        const totalPosts = await Post.countDocuments({visibility: "public"});
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts
        })
    }catch(error) {
        return res.status(500).json(error);
    }
},
//[GET] /me/:id?page=...&limit=...
getUserPost: async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page -1)* limit;
        const userId = req.user.id;
        const posts = await Post.find({author: userId })
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
    const totalPosts = await Post.countDocuments({author: userId});
    const totalPages = Math.ceil(totalPosts / limit);
    res.status(200).json({
        posts,
        currentPage: page,
        totalPages,
        totalPosts
    })
    } catch(error) {
        res.status(500).json(error);
    }
},

//[POST] /createPost
createPost: async (req, res) => {
    try{
        const {title, content, tags, visibility, files} = req.body;
        const userId = req.user.id;
        console.log(userId);
        console.log(req.body);
        const newPost  = new Post({
            author: userId,
            title,
            content,    
            tags: tags || [],
            visibility: visibility || "public",
            files: files || []
        });
        try {
            const savePost = await newPost.save();
            console.log("Post Saved Successfully:", savePost);
           return res.status(201).json({
              message: "Post created successfully",
              post: savePost,
            });
          } catch (saveError) {
            console.error("Error Saving Post:", saveError);
           return res.status(400).json({
              error: "Failed to save post",
              details: saveError.message,
            });
          }
    }catch(error){
        res.status(500).json({error: "server error."});
    }
},

}

export default postController;