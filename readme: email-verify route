//-------------API----------------
//---------------AUTH---------------
// [POST] /auth/signup
https://backendgdscdevteam3.onrender.com/auth/signup
//req:
{
  "username": "postman",
  "email": "postman@gmail.com",
"password": "test"
}
//res:
"Sign up successfully!" || "Username has already existed"

// [POST] /auth/login
https://backendgdscdevteam3.onrender.com/auth/login
//req:
{
  "username": "postman",
  "email": "postman@gmail.com",
"password": "test"
}
//res: 
{
    "newAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGI5MDQyZjQwYTg1MzcwODA1MWNiMCIsImlhdCI6MTczNzIxNDI4NSwiZXhwIjoxNzM3MjE0NTg1fQ.DQ8kPd_mP6dfdtsONs4VsKDUGLYOq5Fb4igA26DQd0Q"
}
// [POST] /auth/refresh
https://backendgdscdevteam3.onrender.com/auth/refresh

// [POST] /auth/logout
https://backendgdscdevteam3.onrender.com/auth/logout


//----------------USER----------------
//[GET] /user/fullInfo
https://backendgdscdevteam3.onrender.com/user/fullInfo
{
    "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    "username": "postman",
    "email": "postman@gmail.com"
}
//[GET] /user/publicInfo
https://backendgdscdevteam3.onrender.com/user/publicInfo
{
    "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
}

//[PUT] /user/updateFull
https://backendgdscdevteam3.onrender.com/user/updateFull
"updated successfully"

//[PUT] /user/updatePassword
https://backendgdscdevteam3.onrender.com/user/updatePassword
{
"oldPassword": "test",
"newPassword": "hiii"
}
"updated success"

//[GET] /me
https://backendgdscdevteam3.onrender.com/me

//[GET] /community
https://backendgdscdevteam3.onrender.com/community
?page=...&limit=...&search=...&type=...
{
    "posts": [
        {
            "_id": "678b9af913897a8f51046a39",
            "title": "",
            "content": "",
            "tags": [],
            "author": "678b72a5347f6c1ab0a2c9f7",
            "authorname": "khanhnam",
            "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            "likes": [],
            "totalLikes": 0,
            "files": [],
            "visibility": "public",
            "stored": [],
            "totalComments": 0,
            "editedAt": "2025-01-18T12:14:03.789Z",
            "createdAt": "2025-01-18T12:13:45.955Z",
            "updatedAt": "2025-01-18T12:14:03.789Z",
            "__v": 0,
            "Stored": false,
            "Liked": false,
            "isAuthor": false
        },
        {
            "_id": "678b72d0347f6c1ab0a2c9fc",
            "title": "editme",
            "content": "edtit",
            "tags": [],
            "author": "678b72a5347f6c1ab0a2c9f7",
            "authorname": "khanhnam",
            "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            "likes": [],
            "totalLikes": 0,
            "files": [
                {
                    "fileUrl": "https://res.cloudinary.com/devteam3-gdsc/raw/upload/v1737200957/User_code_files/blwtllbxstx5neln3nki",
                    "fileName": "2629.js"
                }
            ],
            "visibility": "public",
            "stored": [],
            "totalComments": 0,
            "editedAt": "2025-01-18T11:49:20.062Z",
            "createdAt": "2025-01-18T09:22:24.099Z",
            "updatedAt": "2025-01-18T11:49:20.064Z",
            "__v": 0,
            "Stored": false,
            "Liked": false,
            "isAuthor": false
        },
        {
            "_id": "678aa600532cf0c6876ccbd1",
            "title": "e",
            "content": "sf",
            "tags": [
                "Python",
                "Javascript",
                "Bash/Shell",
                "Go",
                "Kotlin",
                "Rust",
                "Powershell",
                "C",
                "C++",
                "PHP"
            ],
            "author": "67872e57d1dd8257ea418e67",
            "authorname": "hello",
            "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            "likes": [
                "67872e57d1dd8257ea418e67"
            ],
            "totalLikes": 1,
            "files": [],
            "visibility": "public",
            "stored": [
                "67872e57d1dd8257ea418e67"
            ],
            "totalComments": 0,
            "editedAt": "2025-01-17T18:48:32.492Z",
            "createdAt": "2025-01-17T18:48:32.509Z",
            "updatedAt": "2025-01-17T18:58:32.804Z",
            "__v": 0,
            "Stored": false,
            "Liked": false,
            "isAuthor": false
        }
}
//[POST] /post/create
https://backendgdscdevteam3.onrender.com/post/create
{
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "tags": ["tutorial", "coding"],
  "author": "64bfc96f5e6f2b002f134ef1", 
  "authorname": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "files": [
    {
      "fileUrl": "https://example.com/file1.jpg",
      "fileName": "file1.jpg"
    },
    {
      "fileUrl": "https://example.com/file2.pdf",
      "fileName": "file2.pdf"
    }
  ],
  "visibility": "public"
}
{
    "message": "Post created successfully!",
    "postId": "678bd1741ce703e95fd0ce80"
}

//[GET] /post/store/:postId
https://backendgdscdevteam3.onrender.com/post/store/6786b1df20d6160de991e269

//[GET] /post/unstored/:postId
https://backendgdscdevteam3.onrender.com/post/unstored/6786b1df20d6160de991e269

//[GET] /post/like/:postId
https://backendgdscdevteam3.onrender.com/post/like/6786b1df20d6160de991e269

//[GET] /post/unlike/:postId
https://backendgdscdevteam3.onrender.com/post/unlike/6786b1df20d6160de991e269

//[GET] /post/detail/:postId
https://backendgdscdevteam3.onrender.com/post/detail/6786b1df20d6160de991e269
{
    "post": [
        {
            "_id": "6786b1df20d6160de991e269",
            "title": "dfdsf",
            "content": "gg",
            "tags": [],
            "author": "6786b1c520d6160de991e264",
            "authorname": "aaa",
            "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            "likes": [
                "6787269ed1dd8257ea418be5"
            ],
            "totalLikes": 1,
            "files": [
                {
                    "fileUrl": "https://res.cloudinary.com/devteam3-gdsc/raw/upload/v1736880606/User_code_files/qcldxerrpdir79p7buyv",
                    "fileName": "2624.js"
                },
                {
                    "fileUrl": "https://res.cloudinary.com/devteam3-gdsc/raw/upload/v1736880606/User_code_files/jkbsz1firqncfrsxsont",
                    "fileName": "2623.js"
                }
            ],
            "visibility": "public",
            "stored": [],
            "totalComments": 2,
            "editedAt": "2025-01-14T18:50:07.058Z",
            "createdAt": "2025-01-14T18:50:07.061Z",
            "updatedAt": "2025-01-18T16:24:46.876Z",
            "__v": 0,
            "Stored": false,
            "Liked": false,
            "isAuthor": false
        }
    ]
}

//[PUT] /post/edit/:postId
https://backendgdscdevteam3.onrender.com/post/edit/678bd6761c0661f04626f3f3

//[DELETE] /post/delete/:postId
https://backendgdscdevteam3.onrender.com/post/delete/678bd6761c0661f04626f3f3


//-----------------COMMENT----------------
//[GET] /post/detail/:postId/comment
https://backendgdscdevteam3.onrender.com/post/detail/6786b1df20d6160de991e269/comment

//[POST] /post/:postId/comment/create
https://backendgdscdevteam3.onrender.com/post/86b1df20d6160de991e269/comment/create

//[DELETE] /post/:postId/comment/delete/:commentId
https://backendgdscdevteam3.onrender.com/post/6786b1df20d6160de991e269/comment/delete/678728f4d1dd8257ea418ca5

//[PUT] /post/:postId/comment/edit/:commentId
https://backendgdscdevteam3.onrender.com/post/6786b1df20d6160de991e269/comment/edit/678728f4d1dd8257ea418ca5




//NOTIFICATION 

http://localhost:4000/notification/like/6786b1df20d6160de991e269
{
    "userId": "6786b1c520d6160de991e264",
    "senderId": "678e1b282517777299fbc019",
    "type": "like",
    "message": "678e1b282517777299fbc019 liked your post.",
    "relatedEntityId": "6786b1df20d6160de991e269",
    "entityType": "Post",
    "isRead": false,
    "extraData": null,
    "_id": "678e1c77dfab7903559fa3ec",
    "createdAt": "2025-01-20T09:50:47.955Z",
    "__v": 0
}

http://localhost:4000/notification
{
    "notifications": [
        {
            "_id": "678e26163b439fe3ec3666b5",
            "userId": "678e1b282517777299fbc019",
            "senderId": "678e1b282517777299fbc019",
            "type": "comments",
            "message": "678e1b282517777299fbc019 commented on your post.",
            "relatedEntityId": "678e230f7924e5732ca33d95",
            "entityType": "Comments",
            "isRead": false,
            "extraData": null,
            "createdAt": "2025-01-20T10:31:50.592Z",
            "__v": 0
        },
        {
            "_id": "678e25ff9c975695e3cf205c",
            "userId": "678e1b282517777299fbc019",
            "senderId": "678e1b282517777299fbc019",
            "type": "comments",
            "message": "678e1b282517777299fbc019 commented on your post.",
            "relatedEntityId": "678e230f7924e5732ca33d95",
            "entityType": "Comments",
            "isRead": false,
            "extraData": null,
            "createdAt": "2025-01-20T10:31:27.189Z",
            "__v": 0
        },
        {
            "_id": "678e25e19f86dbfe950e788b",
            "userId": "678e1b282517777299fbc019",
            "senderId": "678e1b282517777299fbc019",
            "type": "comments",
            "message": "678e1b282517777299fbc019 commented on your post.",
            "relatedEntityId": "678e230f7924e5732ca33d95",
            "entityType": "Comments",
            "isRead": false,
            "extraData": null,
            "createdAt": "2025-01-20T10:30:57.303Z",
            "__v": 0
        }
    ],
    "currentPage": 1,
    "totalPages": 1,
    "totalNotifications": 3,
    "hasMore": false
}

http://localhost:4000/notification?page=1&limit=5&filter=unread
http://localhost:4000/notification?page=1&limit=5&filter=read

http://localhost:4000/notification/678e26163b439fe3ec3666b5/delete

http://localhost:4000/notification/read

http://localhost:4000/notification/comment/678e230f7924e5732ca33d95

http://localhost:4000/notification/678e2f279a4af19bbae50a81/detail
{
    "_id": "678e2f279a4af19bbae50a81",
    "userId": "678e1b282517777299fbc019",
    "senderId": "678e1b282517777299fbc019",
    "type": "comments",
    "message": "678e1b282517777299fbc019 commented on your post.",
    "relatedEntityId": "678e230f7924e5732ca33d95",
    "entityType": "Comments",
    "isRead": false,
    "extraData": null,
    "createdAt": "2025-01-20T11:10:31.753Z",
    "__v": 0
}


http://localhost:4000/notification/678e2f279a4af19bbae50a81/read
{
    "_id": "678e2f279a4af19bbae50a81",
    "userId": "678e1b282517777299fbc019",
    "senderId": "678e1b282517777299fbc019",
    "type": "comments",
    "message": "678e1b282517777299fbc019 commented on your post.",
    "relatedEntityId": "678e230f7924e5732ca33d95",
    "entityType": "Comments",
    "isRead": true,
    "extraData": null,
    "createdAt": "2025-01-20T11:10:31.753Z",
    "__v": 0
}



//EMAIL-VERIFY

// [POST] /auth/passwordReset

http://localhost:4000/auth/forgot-password
{
    "email": "ngovietthanhbinh2006@gmail.com"
}
{
    "message": "Email sent successfully"
}

// [POST] /auth/passwordNew/:token

http://localhost:4000/auth/passwordReset/82ca52b4c5f82b3b7b60015f69c84458be8c9eff
{
    "newPassword": "hi hi hi"
}

{
    "message": "Password reset successfully"
}















