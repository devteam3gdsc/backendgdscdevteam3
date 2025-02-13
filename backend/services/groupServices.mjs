import { Group } from "../models/Group.mjs";
import findDocument from "../utils/findDocument.mjs";
import User from "../models/Users.mjs";
import mongoose from "mongoose";

const groupServices = {
    createGroup : async (data, creatorId) => {
        try {
            const avatar = (await findDocument(User,{_id:creatorId},{_id:0,avatar:1})).avatar
            const newGroup = new Group({
                ...data,
                creator: creatorId,
                members: [{
                    user: creatorId,
                    role: "admin",
                    avatar
                }]
            });
            await newGroup.save();
            return newGroup;
        } catch (error) {
            throw new Error(`Creating group service error: ${error}`, 500);
        }
    },
    findGroups : async (userId,{...data})=>{
        try {
            const page = data.page || 1;
            const limit = data.limit || 5
            const skip = (page - 1)*limit;
            const search = data.search || "";
            const order = data.order || "descending";
            const criteria = data.criteria || "dateCreated";
            const user = data.user?new mongoose.Types.ObjectId(`${data.user}`):"";
            console.log(1)
            switch (criteria) {
                case "dateCreated": {
                  var sortValue = "createdAt";
                  break;
                }
                case "posts": {
                  var sortValue = "totalPosts";
                  break;
                }
                case "members": {
                  var sortValue = "totalMembers";
                  break;
                }
              }
            switch (order) {
                case "descending": {
                  var sortOrder = -1;
                  break;
                }
                case "ascending": {
                  var sortOrder = 1;
                  break;
                }
            }
            const matchData = [];
            if (search){
                matchData.push({name:{$regex:search,$options:"i"}})
            }
            if (data.role){
                matchData.push({members:{$elemMatch:{user:userId,role:data.role}}})
            }
            if (user){
                matchData.push({members:{$elemMatch:{user:user}}})
            }
            const Data = await Group.aggregate([
                {$match: matchData.length === 0?{}:{$and:matchData}},
                {$sort: {[sortValue]:sortOrder}},
                {$facet:{
                    groups:[
                        {$skip:skip},
                        {$limit:Number(limit)},
                        {$addFields:{
                            joined:{ 
                                $in: [userId,"$members.user"]
                            },
                            visibleMembers:{
                                $map: {
                                    input: {$slice:["$members",0,4]},
                                    as: "member",
                                    in: "$$member.avatar"
                                }
                            }
                        }}
                    ],
                    countingGroups:[
                        {$count:"totalGroups"}
                    ]
                }}
            ])
            if (!Data[0].countingGroups[0]){
                return {
                    group:[],
                    totalGroups:0,
                    currentPage:1,
                    hasMore:false
                }
            }
            const totalGroups = Data[0].countingGroups[0].totalGroups;
            const groups = Data[0].groups
            const totalPages = Math.ceil(totalGroups/limit);
            const hasMore = totalPages - page > 0 ? true : false;
            return {
                groups,
                currentPage:page,
                totalPages,
                hasMore
            }  
        } catch (error) {
            throw new Error(`finding groups service error: ${error}`, 500);
        }
    }
}
export default groupServices;