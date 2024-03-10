const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer({ dest: "app/photos/" })
const { User, Employee } = require("../models")
const jwt = require("jsonwebtoken")

router.post("/login", async (req, res) => {
	const { login, password } = req.body

	try {
		const user = await User.findOne({
			where: {
				login,
				password,
			},
		})

		if (user) {
			const user_token = jwt.sign({ login }, "secret_key")
			res.status(200).json({ data: { user_token } })
		} else {
			res.status(401).json({ error: { code: 401, message: "Authentication failed" } })
		}
	} catch (error) {
		console.error("Error executing query: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

router.post("/user", upload.single("photo_file"), async (req, res) => {
	const { name, surname, patronymic, login, password, role_id } = req.body

	if (!name || !login || !password || !role_id) {
		return res.status(400).json({ error: { code: 400, message: "Missing required fields" } })
	}

	let photoPath = null
	if (req.file) {
		const photoName = req.file.filename
		photoPath = `photos/${photoName}`
	}

	try {
		const employee = await Employee.create({
			name,
			surname,
			patronymic,
			login,
			password,
			photo_path: photoPath,
			role_id,
		})
		res.status(201).json({ data: { id: employee.id, status: "created" } })
	} catch (error) {
		console.error("Error executing query: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

router.get("/users", async (req, res) => {
	try {
		const employees = await Employee.findAll({
			attributes: ["id", "name", "login", "status", "groups"],
		})

		const responseData = employees.map(employee => ({
			id: employee.id,
			name: employee.name,
			login: employee.login,
			status: employee.status,
			group: employee.groups,
		}))

		console.log("responseData", responseData)

		res.status(200).json({ data: responseData })
	} catch (error) {
		console.error("Error fetching employees: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

module.exports = router
