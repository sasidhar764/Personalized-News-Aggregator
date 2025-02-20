const express = require('express')
const router = express.Router()
const {getUsers, createUser, getUser, updateUser, deleteUser, updatePassword} = require('../controllers/user.controller')

router.get('/', getUsers)
router.post('/', createUser)
router.put('/reset-password', updatePassword)
router.get('/:username', getUser)
router.put('/:username', updateUser)
router.delete('/:username', deleteUser)

module.exports = router
