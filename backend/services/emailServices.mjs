import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const mailOptions = {
        from: `"Support Team" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
    };
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
