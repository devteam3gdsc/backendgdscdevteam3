

const projectServices = {
    findProjects: async (userId,{...data})=>{
        const page = data.page || 1
        const limit = data.limit || 5
        const skip = (page - 1)*limit;
        const order = data.order || "descending";
        const criteria = data.criteria || "dateCreated"
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
    }
} 

export default projectServices;