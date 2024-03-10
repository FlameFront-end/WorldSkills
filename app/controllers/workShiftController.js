const express = require("express")
const router = express.Router()
const { WorkShift } = require("../models")

router.post("/work-shift", async (req, res) => {
	const { start, end } = req.body

	if (!start || !end) {
		return res.status(400).json({ error: { code: 400, message: "Missing required fields" } })
	}

	const startDateTime = new Date(start).toISOString().slice(0, 19).replace("T", " ")
	const endDateTime = new Date(end).toISOString().slice(0, 19).replace("T", " ")

	if (startDateTime >= endDateTime) {
		return res
			.status(400)
			.json({ error: { code: 400, message: "Start date and time must be before end date and time" } })
	}

	try {
		const workShift = await WorkShift.create({
			start: startDateTime,
			end: endDateTime,
			active: false,
		})
		res.status(201).json({ id: workShift.id, start: startDateTime, end: endDateTime })
	} catch (error) {
		console.error("Error executing query: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

router.get("/work-shift/:id/open", async (req, res) => {
	try {
		const openShiftsCount = await WorkShift.count({ where: { active: true } })
		if (openShiftsCount > 0) {
			return res.status(403).json({ error: { code: 403, message: "Forbidden. There are open shifts!" } })
		}
		const workShiftId = req.params.id
		await WorkShift.update({ active: true }, { where: { id: workShiftId } })
		const workShift = await WorkShift.findByPk(workShiftId)
		res.status(200).json({ data: workShift })
	} catch (error) {
		console.error("Error executing query: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

router.get("/work-shift/:id/close", async (req, res) => {
	try {
		const closeShiftsCount = await WorkShift.count({ where: { active: false } })
		if (closeShiftsCount > 0) {
			return res.status(403).json({ error: { code: 403, message: "Forbidden. The shift is already closed!" } })
		}
		const workShiftId = req.params.id
		await WorkShift.update({ active: false }, { where: { id: workShiftId } })
		const workShift = await WorkShift.findByPk(workShiftId)
		res.status(200).json({ data: workShift })
	} catch (error) {
		console.error("Error executing query: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

router.post("/work-shift/:id/user", async (req, res) => {
	const shiftId = req.params.id
	const { user_id } = req.body

	try {
		const existingShiftUser = await WorkShift.findOne({
			where: { id: shiftId },
			include: [{ model: Employee, where: { id: user_id } }],
		})

		if (existingShiftUser) {
			return res.status(403).json({ error: { code: 403, message: "Forbidden. The worker is already on shift!" } })
		}

		await WorkShift.addEmployee(user_id)

		res.status(200).json({ data: { id_user: user_id, status: "added" } })
	} catch (error) {
		console.error("Error adding user to shift: ", error)
		res.status(500).json({ error: { code: 500, message: "Internal Server Error" } })
	}
})

module.exports = router
