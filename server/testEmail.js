const sendEmail = require("./utils/sendEmail");

sendEmail("sandhyaexample@gmail.com", "Test Email", "Hello, this is a test")
  .then(() => console.log("Email sent"))
  .catch(console.error);
