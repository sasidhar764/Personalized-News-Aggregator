const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendSummaryEmail = async (email, summaryContent) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Daily News Summary",
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Your Weekly News Summary</h2>
            <p style="color: #555;">Here are the top articles curated for you:</p>
            
            <div style="text-align: left; margin-top: 15px;">
              ${summaryContent.map(article => `
                <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                  <h3 style="color: #007bff; margin: 0;">${article.title}</h3>
                  <p style="color: #555; margin: 5px 0;">${article.description}</p>
                  <a href="${article.url}" style="display: inline-block; padding: 8px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                    Read More
                  </a>
                </div>
              `).join('')}
            </div>

            <p style="color: #777; font-size: 12px; margin-top: 20px;">
              You are receiving this email because you subscribed to our news updates. 
              <br> If you wish to unsubscribe, click <a href="#" style="color: #007bff; text-decoration: none;">here</a>.
            </p>
          </div>
        </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendSummaryEmail;
