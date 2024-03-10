const express = require("express")
const bodyParser = require("body-parser")

const app = express()
const port = 3000

const userRoutes = require("./controllers/userController")
const workShiftRoutes = require("./controllers/workShiftController")

app.use(bodyParser.json())

app.use("/api-tort", userRoutes)
app.use("/api-tort", workShiftRoutes)

app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
