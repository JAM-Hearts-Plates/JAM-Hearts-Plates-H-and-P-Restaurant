import { createTransport } from "nodemailer";


export const mailTransporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD
    }
  })
  
  export const emailMessage = `
  <div>
  <h1>Dear {{lastName}}</h1>
  <p>A new account has been created for you at Hearts and Plates</p>
  <h2>Thank you</h2>
  </div>
  `