const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: "rzp_test_Sniov1AvjJXyED",
  key_secret: "kwYXyRviS6bXq1Drt3F8Nm6D",
});

async function run() {
  try {
    const order = await instance.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: "rcpt_test",
    });
    console.log("Success:", order);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
