const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken')
const { isValid, isValidBody, isValidPassword, isValidName, isValidEmail, address } = require("../validations/validator")

/**************************************************Create User API**************************************************/
const createUser = async function (req, res) {
    try {
        let data = req.body
        const { title, name, phone, email, password } = data


        if (!isValid(data)) return res.status(400).send({ status: false, message: 'Please Enter The  User Details' })

        if (!isValid(title))
            return res.status(400).send({ status: false, message: 'Title Is Required' })

        if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) { return res.status(400).send({ status: false, data: "Enter a valid Title (e.g- Mr or Mrs or Miss)", }); }

        if (!isValid(name)) return res.status(400).send({ status: false, message: 'Name Is Required' })
        if (!isValidName(name)) return res.status(400).send({ status: false, msg: "Please Enter A Valid User Name" })

        if (!isValid(phone)) return res.status(400).send({ status: false, message: 'Phone Is Required' })
        if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/).test(phone)) { return res.status(400).send({ status: false, msg: `${phone} is Not a Valid Mobile Number ` }) }
        const checkPhone = await userModel.findOne({ phone: phone });

        if (checkPhone) return res.status(400).send({ status: false, message: `Phone Is Already Registered` })

        if (!isValid(email)) return res.status(400).send({ status: false, message: 'Email Is Required' })
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Email should be Valid Email Address' }) }

        const checkEmail = await userModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: `Email Address is Already Registered` })

        if (!isValid(password)) return res.status(400).send({ status: false, message: 'Password is Required' })
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Password should have length in range 8 to 15" }) }

        if (!isValidBody(data.address.street))
            return res.status(400).send({ status: false, message: 'Address Of street is Invalid' })
        if (!isValidBody(data.address.city))
            return res.status(400).send({ status: false, message: 'Address Of city is Invalid' })
        if (!(/^[1-9]{1}[0-9]{5}$/).test(data.address.pincode))
            return res.status(400).send({ status: false, message: 'Address Of pincode is Invalid' })

        const newUser = await userModel.create(data);
        res.status(201).send({ status: true, message: 'User created successfully!!!', data: newUser });

    } catch (err) {

        res.status(500).send({ status: false, message: err.message })
    }
}
/**************************************************User Login API**************************************************/


const loginUser = async function (req, res) {
    try {

        let data = req.body
        const { password, email } = data

        if (!isValid(data)) return res.status(400).send({ status: false, message: "Please Provide Login Details" })

        if (!isValid(email)) return res.status(400).send({ status: false, message: 'Email is Required' })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: 'Email Should Be Valid Email Address' })
        }

        if (!isValid(password)) return res.status(400).send({ status: false, message: 'Password is Required' })
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password should have length in range 8 to 15" })
        }
        const user = await userModel.findOne({ email: email, password: password })
        if (!user) return res.status(401).send({ status: false, message: 'Invalid Login Credentials' });


        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) * 24 * 60 * 60,
        }, 'DFGHJK34567890--85643ytfhgjkl')

        res.status(200).send({ status: true, message: "Login Sucsessful", data: token });

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createUser, loginUser }