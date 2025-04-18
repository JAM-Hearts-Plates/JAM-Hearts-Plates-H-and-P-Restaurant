import { createTransport } from "nodemailer";


export const mailTransporter = createTransport({
  service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  })
  
  export const emailMessage = `
  <div>
  <h1>Dear {{lastName}}</h1>
  <p>A new account has been created for you at Hearts and Plates</p>
  <h2>Thank you</h2>
  </div>
  `