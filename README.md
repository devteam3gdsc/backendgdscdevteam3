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
"\_id": "678b9af913897a8f51046a39",
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
"**v": 0,
"Stored": false,
"Liked": false,
"isAuthor": false
},
{
"\_id": "678b72d0347f6c1ab0a2c9fc",
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
"**v": 0,
"Stored": false,
"Liked": false,
"isAuthor": false
},
{
"\_id": "678aa600532cf0c6876ccbd1",
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
"\_\_v": 0,
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
"\_id": "6786b1df20d6160de991e269",
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
"\_\_v": 0,
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

**\***AFTER MVP:

//[PUT]: /post/setState/:postId?state=... "public/private"
https://backendgdscdevteam3.onrender.com/post/setState/6786b1df20d6160de991e269?state=public

//[GET]: /user/posts/:userId
http://localhost:4000/user/posts/67969873ecbc4d64613ffb1d
{
"posts": [
{
"\_id": "679698beecbc4d64613ffb27",
"title": "imtest",
"tags": [],
"author": "67969873ecbc4d64613ffb1d",
"authorname": "imtest",
"avatar": "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1737924020/User_avatar_files/vxnhwx2kfayl2xrs8mv1.png",
"likes": [],
"totalLikes": 0,
"files": [
{
"fileUrl": "https://res.cloudinary.com/devteam3-gdsc/raw/upload/v1737924832/User_code_files/rg6keq8ebd9b1zzomxuo",
"fileName": "1726.js"
}
],
"visibility": "public",
"stored": [],
"totalComments": 0,
"editedAt": "2025-01-26T20:53:53.055Z",
"createdAt": "2025-01-26T20:19:10.163Z",
"updatedAt": "2025-01-26T20:53:53.056Z",
"**v": 0,
"Stored": false,
"Liked": false,
"isAuthor": false
},
{
"\_id": "679698b5ecbc4d64613ffb23",
"title": "dffff",
"tags": [],
"author": "67969873ecbc4d64613ffb1d",
"authorname": "imtest",
"avatar": "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1737924020/User_avatar_files/vxnhwx2kfayl2xrs8mv1.png",
"likes": [],
"totalLikes": 0,
"files": [],
"visibility": "public",
"stored": [],
"totalComments": 0,
"editedAt": "2025-01-26T20:19:01.568Z",
"createdAt": "2025-01-26T20:19:01.570Z",
"updatedAt": "2025-01-26T20:40:21.117Z",
"**v": 0,
"Stored": false,
"Liked": false,
"isAuthor": false
}
],
"currentPage": 1,
"totalPages": 1,
"totalPosts": 2,
"hasMore": false
}

//[GET]: /user/:userId/follow

//[GET]: /user/:userId/unfollow

//[GET]: /post/halfDetail/:postId
http://localhost:4000/post/halfDetail/6786b1e720d6160de991e26c
{
"title": "sadfs",
"content": "bbb",
"authorname": "aaa",
"avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
}

//[GET]: /following
http://localhost:4000/following
{
"posts": [
{
"\_id": "679698beecbc4d64613ffb27",
"title": "imtest",
"tags": [],
"author": "67969873ecbc4d64613ffb1d",
"authorname": "imtest",
"avatar": "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1737924020/User_avatar_files/vxnhwx2kfayl2xrs8mv1.png",
"likes": [],
"totalLikes": 0,
"files": [
{
"fileUrl": "https://res.cloudinary.com/devteam3-gdsc/raw/upload/v1737924832/User_code_files/rg6keq8ebd9b1zzomxuo",
"fileName": "1726.js"
}
],
"visibility": "public",
"stored": [],
"totalComments": 0,
"editedAt": "2025-01-26T20:53:53.055Z",
"createdAt": "2025-01-26T20:19:10.163Z",
"updatedAt": "2025-01-26T20:53:53.056Z",
"**v": 0,
"Stored": false,
"Liked": false,
"isAuthor": false
},
{
"\_id": "679698b5ecbc4d64613ffb23",
"title": "dffff",
"tags": [],
"author": "67969873ecbc4d64613ffb1d",
"authorname": "imtest",
"avatar": "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1737924020/User_avatar_files/vxnhwx2kfayl2xrs8mv1.png",
"likes": [],
"totalLikes": 0,
"files": [],
"visibility": "public",
"stored": [],
"totalComments": 0,
"editedAt": "2025-01-26T20:19:01.568Z",
"createdAt": "2025-01-26T20:19:01.570Z",
"updatedAt": "2025-01-26T20:40:21.117Z",
"**v": 0,
"Stored": false,
"Liked": false,
"isAuthor": false
}
],
"currentPage": 1,
"totalPages": 1,
"totalPosts": 2,
"hasMore": false
}

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
"\_id": "678e1c77dfab7903559fa3ec",
"createdAt": "2025-01-20T09:50:47.955Z",
"\_\_v": 0
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

// notification invite to group 
  {
            "_id": "67a6e0903e412198afeb216f",
            "userId": "6791aebf4277d1beaf39ded7",
            "senderId": "679597b08d8bedbe78208c33",
            "senderName": "haibabon",
            "senderAvatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            "type": "invite",
            "message": "invited you join group",
            "relatedEntityId": "67a5e2e1560b4238c754b169",
            "entityType": "Group",
            "isRead": false,
            "extraData": null,
            "createdAt": "2025-02-08T04:41:52.212Z",
            "__v": 0
        }

http://localhost:4000/notification?page=1&limit=5&filter=unread
http://localhost:4000/notification?page=1&limit=5&filter=read

http://localhost:4000/notification/678e26163b439fe3ec3666b5/delete

http://localhost:4000/notification/read

http://localhost:4000/notification/comment/678e230f7924e5732ca33d95

http://localhost:4000/notification/678e2f279a4af19bbae50a81/detail
{
"\_id": "678e2f279a4af19bbae50a81",
"userId": "678e1b282517777299fbc019",
"senderId": "678e1b282517777299fbc019",
"type": "comments",
"message": "678e1b282517777299fbc019 commented on your post.",
"relatedEntityId": "678e230f7924e5732ca33d95",
"entityType": "Comments",
"isRead": false,
"extraData": null,
"createdAt": "2025-01-20T11:10:31.753Z",
"\_\_v": 0
}

http://localhost:4000/notification/678e2f279a4af19bbae50a81/read
{
"\_id": "678e2f279a4af19bbae50a81",
"userId": "678e1b282517777299fbc019",
"senderId": "678e1b282517777299fbc019",
"type": "comments",
"message": "678e1b282517777299fbc019 commented on your post.",
"relatedEntityId": "678e230f7924e5732ca33d95",
"entityType": "Comments",
"isRead": true,
"extraData": null,
"createdAt": "2025-01-20T11:10:31.753Z",
"\_\_v": 0
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



// POST http://localhost:4000/group/create
{
    "name": "groupuser2",
    "description": "",
    "private": false,
    "moderation": false,
    "avatar": "",
    "creator": "679597b08d8bedbe78208c33",
    "members": [
        {
            "user": "679597b08d8bedbe78208c33",
            "role": "creator",
            "_id": "67a5cfe37221d6573c1d81f3"
        }
    ],
    "projects": [],
    "posts": [],
    "_id": "67a5cfe37221d6573c1d81f2",
    "createdAt": "2025-02-07T09:18:27.827Z",
    "updatedAt": "2025-02-07T09:18:27.827Z",
    "__v": 0
}

// PUT http://localhost:4000/group/update/67a5cfe37221d6573c1d81f2
{
    "_id": "67a5cfe37221d6573c1d81f2",
    "name": "groupuser2222",
    "description": "",
    "private": false,
    "moderation": false,
    "avatar": "",
    "creator": "679597b08d8bedbe78208c33",
    "members": [
        {
            "user": "679597b08d8bedbe78208c33",
            "role": "creator",
            "_id": "67a5cfe37221d6573c1d81f3"
        }
    ],
    "projects": [],
    "posts": [],
    "createdAt": "2025-02-07T09:18:27.827Z",
    "updatedAt": "2025-02-07T09:20:05.388Z",
    "__v": 0
}

// GET http://localhost:4000/group/fullData/67a5cfe37221d6573c1d81f2
{
    "name": "groupuser2222",
    "bio": "",
    "avatar": "",
    "members": [
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
    ],
    "numberOfPosts": 0,
    "numberOfMembers": 1,
    "numberOfProjects": 0,
    "joined": true,
    "canJoin": true
}

// DELETE http://localhost:4000/group/delete/67a5cfe37221d6573c1d81f2
{
    "message": "Group deleted successfully"
}


// POST http://localhost:4000/group/invite/67a4cfee39057ae06b9727af
{
  "members": ["6786b1c520d6160de991e264", "67872550d1dd8257ea418b42"]
}
{
    "message": "Invite new member successfully"
}

// DELETE http://localhost:4000/group/removeMember/67a4cfee39057ae06b9727af/67872e57d1dd8257ea418e67
{
  "members": ["67872e57d1dd8257ea418e67"]
}
{
    "message": "Delete member successfully"
}

// POST http://localhost:4000/group/join/67a4b1a5fd48ada7ebba874c
{
    "message": "Join group successfully"
}

// POST http://localhost:4000/group/leave/67a4b1a5fd48ada7ebba874c
{
    "message": "leave group successfully"
}


// POST http://localhost:4000/group/assignAdmin/67a5e2e1560b4238c754b169/67872e57d1dd8257ea418e67
{
    "message": "assign admin group successfully"
}

// POST http://localhost:4000/group/assignCreator/67a5e767a29c317761d87ad8/67872e57d1dd8257ea418e67
{
    "message": "assign creator group successfully"
}


// POST
http://localhost:4000/group/confirmInvite/67a5e2e1560b4238c754b169?accept=true
{
    "confirm": {
        "message": "User joined the group"
    }
}

//------------PROJECT------------
// POST
http://localhost:4000/project/create/67a5e2e1560b4238c754b169


// POST 
http://localhost:4000/project/update/67a72552dd3d9cde964ffd6a


//DELETE
http://localhost:4000/project/delete/67a72552dd3d9cde964ffd6a
{
    "message": "Deleting project successfully"
}


//--------------PROJECT--------------
// POST 
http://localhost:4000/project/create/67a5e2e1560b4238c754b169
{
    "project": {
        "name": "create first project",
        "description": "",
        "private": false,
        "avatar": "",
        "creator": "679597b08d8bedbe78208c33",
        "group": "67a5e2e1560b4238c754b169",
        "pendingInvites": [],
        "sections": [],
        "_id": "67a86388ac612cf5f33de671",
        "members": [
            {
                "user": "679597b08d8bedbe78208c33",
                "role": "leader",
                "_id": "67a86388ac612cf5f33de672"
            }
        ],
        "createdAt": "2025-02-09T08:12:56.079Z",
        "updatedAt": "2025-02-09T08:12:56.079Z",
        "__v": 0
    },
    "rootSection": {
        "name": "create first project",
        "description": "",
        "project": "67a86388ac612cf5f33de671",
        "parent": null,
        "children": [],
        "participants": [
            "679597b08d8bedbe78208c33"
        ],
        "_id": "67a86388ac612cf5f33de674",
        "createdAt": "2025-02-09T08:12:56.154Z",
        "updatedAt": "2025-02-09T08:12:56.154Z",
        "__v": 0
    }
}

// GET 
http://localhost:4000/project/fullData/67a86388ac612cf5f33de671
{
    "name": "create first project",
    "bio": "",
    "avatar": "",
    "members": [
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
    ],
    "numberOfMembers": 1,
    "sections": [
        {
            "_id": "67a86388ac612cf5f33de674",
            "name": "create first project",
            "participants": [
                "679597b08d8bedbe78208c33"
            ],
            "children": []
        }
    ],
    "joined": true,
    "canJoin": true
}

// POST
http://localhost:4000/project/invite/67a86388ac612cf5f33de671
{
  "members": ["67872846d1dd8257ea418c48"]
}
{
    "message": "Invite new member successfully"
}

// DELETE 
http://localhost:4000/project/removeMember/67a86388ac612cf5f33de671/679597b08d8bedbe78208c33
{
    "message": "Delete member successfully"
}

// POST 
http://localhost:4000/project/join/67a86388ac612cf5f33de671
{
    "message": "Join project successfully"
}

// POST
http://localhost:4000/project/leave/67a86388ac612cf5f33de671
{
    "message": "leave project successfully"
}

// POST 
http://localhost:4000/project/assignAdmin/67a86388ac612cf5f33de671/6791aebf4277d1beaf39ded7
{
    "message": "assign admin project successfully"
}

// POST 
http://localhost:4000/project/removeAdmin/67a86388ac612cf5f33de671/6791aebf4277d1beaf39ded7
{
    "message": "Remove admin project successfully"
}
