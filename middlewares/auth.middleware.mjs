import jwt from "jsonwebtoken"
export const isLoggedIn=(req,res, next)=>{
try {
    const token=req.cookies.token
 if(!token)
 {
    return res.status(400).send({
        message:"User is not authenticated!"
    })
 }
 const decoded=jwt.verify(token, process.env.JWT_SECRET)
 req.user=decoded;
 next()
} catch (error) {
    return res.status(500).send({
        message: `Something went wrong, ${error}`
    })
}
}