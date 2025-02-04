import Comments from "../models/Comments.mjs"


const commentServices = {
    getComments : async (userId, {...matchData}, skip, limit, sortOrder) =>{
        const Data = await Comments.aggregate([
            {$match:{...matchData}},
            {$sort:{editedAt:sortOrder}},
            {$facet:{
                comments:[
                    {skip:skip},
                    {limit:limit},
                    {
                        $addFields:{
                            isAuthor:{
                                $eq: ["$author",userId]
                            }
                        }
                    }
                ],
                countingComments:[
                    {$count:"totalComments"}
                ]
            }}
        ])
        if (Data[0].countingComments[0]){
            return {
                comments:[],
                hasMore: false
            }
        }
        else {
            return {
                comments: Data[0].comments,
                totalComments: Data[0].countingComments[0].totalComments
            }
        }
    }
}