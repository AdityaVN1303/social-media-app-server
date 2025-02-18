import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (userId , res)=>{
    const token = jwt.sign({userId} , process.env.JWT_SECRET , {
        expiresIn : '15d', 
    } )
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite:'None'
});
}