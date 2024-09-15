const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const {courseEnrollmentEmail} = require("../mail/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/paymentSuccessEmail");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {

    // get course id and user id
    const { course_id } = req.body;
    const userId = req.user.id;

    // validation
    // valid course id
    if (!course_id) {
        return res.status(200).json({
            success: false,
            message: "Please provide valid course id" 
        });
      }

    // valid course detail
    let course;
    try{
        course = await Course.findById(course_id);
        if (!course) {
            return res
              .status(200)
              .json({ success: false, message: "Could not find the Course" })
          }

        // user already paid for the same course
        const uid = new mongoose.Types.ObjectId(userId);

        if (course.studentsEnrolled.includes(uid)) {
          return res
            .status(200)
            .json({ success: false, message: "Student is already Enrolled" })
        }
    
    }catch(error){
        console.log(error)
        res
          .status(500)
          .json({ success: false, message: error.message })    
    }

    // order create 
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            course_id,
            userId
        }
    };

    try {
        // Initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return response
        res.json({
          success: true,
          courseName:course.courseName,
          courseDescription: course.courseDescription,
          thumbnail:course.thumbnail,
          orderId:paymentResponse.id,
          currency:paymentResponse.currency,
          amount: paymentResponse.amount,
        //   data: paymentResponse,
        });
    } catch (error) {
        console.log(error)
        res
          .status(500)
          .json({ success: false, message: "Could not initiate order." });
      }

    };    

// verify signature of razorpay and server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";
    const signature = req.headers("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is Authorised");
        const {courseId,userId} = req.body.payload.payment.entity.notes;

        try{
            // fulfill the action
            // find the course and enroll in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                                    {_id: courseId},
                                                    {$push:{studentsEnrolled:userId}},
                                                    {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false, 
                    message: "Course not found", 
                });
            }

        
        console.log(enrolledCourse);

        // mail send kardo confirmation wala
        const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulation from BG",
                                    "Congratulation, you are onboarded into new Course",
        );

        console.log(emailResponse);
        return res.status(200).json({
            success: false, 
            message: "Signature verified and course added", 
        });

    }catch(error){
        return res.status(500).json({
            success: false, 
            message: "Course not found", 
        });
    }
}
    else{
        return res.status(400).json({
            success: false, 
            message: "Invalid request", 
        });
    }
}