import User from "../models/Users.mjs";
import Post from "../models/Posts.mjs";
import Comments from "../models/Comments.mjs";
import {httpError} from "./httpResponse.mjs";
const findDocument = async (model,amount,[...criterias],[...keys])=>{
    try {
    const filterData = {};
    const keysNeeded = {};
    for ( let i of criterias){
        Object.assign(filterData,i);
    };
    for ( let i of keys){
         Object.assign(keysNeeded,i);
    };
    let result;
    if (amount > 1){
        result = await model.find(filterData,keysNeeded).exec();
    }
    else {
        result = await model.findOne(filterData,keysNeeded).exec();
    }
    if (!result){
        throw new httpError(`${model} not found!`,404)
    }
    else return amount>1?result[0]:result
    } 
    catch (error) {
     throw new httpError(`findDocument services error: ${error}`,500)
    }
}

export default findDocument;