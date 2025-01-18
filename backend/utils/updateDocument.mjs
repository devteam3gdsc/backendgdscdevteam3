import User from "../models/Users.mjs";
import Post from "../models/Posts.mjs";
import Comments from "../models/Comments.mjs";
import { httpError } from "./httpResponse.mjs";

const updateDocument = async (model,amount,[...criterias],[...updates])=>{
    try {
    const filterData = {};
    const updatesNeeded = {};
    for ( let i of criterias){
        Object.assign(filterData,i);
    };
    for ( let i of updates){
        Object.assign(updatesNeeded,i);
    };
    let result;
    if (amount > 1){
        result = await model.updateMany(filterData,updatesNeeded).exec();
    }
    else {
        result = await model.updateOne(filterData,updatesNeeded).exec();
    }
    if (result.matchedCount === 0){
        throw new httpError(`${model} not found!`,404)
    }
    else return result;
    } 
    catch (error) {
     throw new httpError(`updateDocument services error: ${error[0]}`,500)
    }
}
export default updateDocument;