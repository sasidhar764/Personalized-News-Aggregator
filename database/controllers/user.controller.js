const User = require('../models/user.model')

const getUsers = async (req, res) => {
    try {
        const users = await User.find({})
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: error.message || "Bad Request" })
    }
}

const createUser = async (req, res) => {
    try {
        if (req.body.preferredCategory && !Array.isArray(req.body.preferredCategory)) {
            req.body.preferredCategory = [req.body.preferredCategory]; // Convert to array if it's a single value
        }
        const user = await User.create(req.body)
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: error.message || "Bad Request" })
    }
}

const getUser = async (req, res) => {
    try {
        const un = req.params.username
        const user = await User.findOne({username : un})
        if (!user)
        {
            return res.status(500).json("User not found")
        }
        res.json(user)
    } catch (error) {
        req.status(500).json(error.message)
    }
}


const updateUser = async (req, res) => {
    try {
        const un = req.params.username
        const user = await User.findOneAndUpdate({ username: un }, req.body);
        if(!user)
        {
            return res.status(404)
        }
        const updateduser = await User.findOne({username : req.body.username})
        res.json(updateduser)
    } catch (error) {
        res.status(500)
    }
}

const updatePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOneAndUpdate({ email }, { password }, { new: true });
        if(!user)
        {
            return res.status(404)
        }
        res.json({message: "Password updated successfully", user})
    } catch (error) {
        res.status(500)
    }
}

const deleteUser = async (req, res) => {
    try {
        const un = req.params.username
        const user = await User.findOneAndDelete({ username: un })
        if(!user)
        {
            return res.status(404).send("User not found")
        }
        res.status(200).json({message : "User deleted successfully", user})
        
    } catch (error) {
        res.status(500)
    }
}

module.exports = {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updatePassword
}
