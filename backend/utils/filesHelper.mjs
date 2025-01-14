import { v2 } from "cloudinary";

const getFiles = function (files,name){
    const codeFiles = files?.[name] || [];
    return codeFiles.map((file) => ({
        fileUrl: file.path, // Đường dẫn file trên Cloudinary
        fileName: file.originalname, // Tên gốc của file
    }));
}
const fileDestroy =  async(filesURL,type)=>{
    const urls = Array.isArray(filesURL)?filesURL:[filesURL]
    const publicIds = urls.map((url) => {
        const URLparts = url.fileUrl?url.fileUrl.split("/"):url.split("/");
        const URLlastPart = URLparts[URLparts.length - 1].split(".");
        const anotherURL = URLlastPart[0];
        const publicId = URLparts[URLparts.length - 2] + "/" + anotherURL;
        return publicId;
    });
    await Promise.all(
        publicIds.map((fileId) =>
        v2.uploader.destroy(fileId,{resource_type:type})
    ))
}
export { getFiles, fileDestroy}