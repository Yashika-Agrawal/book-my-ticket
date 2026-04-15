import { pool } from "../config/db.mjs";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const register = async (req,res)=>{
    try {
        const {name,email, password} = req.body;
    if(!email || !password || !name)
    {
       return res.status(400).send({
           message: "Name, email and password is required "
       })
    }
    if (!email.includes("@")) {
        return res.status(400).send({
            message: "Invalid email format"
        });
    }
    if(password.length<8){
        return res.status(400).send({
            message:"Password should be atleast of 8 characters"
        })
    }
    const query = "SELECT * FROM users WHERE email = $1";
    const existingUser = await pool.query(query, [email]);
    if(existingUser.rowCount!==0)
    {
       return res.status(400).send({
           message:"User already exist"
       })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const insertSql="INSERT INTO users (name, email, password) VALUES ($1, $2, $3)"
    const result = await pool.query(insertSql, [name, email, hashedPassword]);
    console.log(result , "result")
    return res.status(201).send({
        message: "User registered successfully!",
        success: true,
    })
   
    } catch (error) {
        return res.status(500).send({
            message: `Something went wrong!`
        })
    }
 }
export const login = async (req,res)=>{
    try {
        const {email, password} = req.body;
    if(!email || !password)
    {
        return res.status(400).send({
            message: "Email or password is missing"
        })
    }
    const userSql = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userSql, [email]);
    if( userResult.rowCount==0)
    {
        return res.status(404).send({
            message: "User not found",
            success: false,
        })
    }
    const userPassword= userResult.rows[0].password
    const userId=userResult.rows[0].id
    const userEmail=userResult.rows[0].email
    const userName=userResult.rows[0].name
    const match = await bcrypt.compare(password, userPassword);
    if(!match)
    {
        return res.status(401).send({
            message:"Email or password is incorrect"
        })
    }

    const token = jwt.sign({ id: userId, email:userEmail, name:userName }, process.env.JWT_SECRET, {
        expiresIn: "1d",
        });
    const cookieOptions = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        };
    res.cookie("token", token, cookieOptions);
    res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            id: userId,
            name:userName,
            email: userEmail,
        },
        });

    } catch (error) {
        return res.status(500).send({
            message: `Something went wrong, ${error}`
        })
    }
}