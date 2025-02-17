const express = require('express')
const router = express.Router()
const {getUsers, createUser, getUser, updateUser, deleteUser} = require('../controllers/user.controller')

router.get('/', getUsers)
router.post('/', createUser)
router.get('/:username', getUser)
router.put('/:username', updateUser)
router.delete('/:username', deleteUser)

module.exports = router
