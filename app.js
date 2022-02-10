const socketio = require("socket.io")
const http = require("http")
const Filter = require("bad-words")
const express = require("express")
const path = require("path")
const app = express()
const { generateMessage, generateLocationMessage } = require("./utils/message")
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require("./utils/users")

const port = process.env.PORT || 4000
const publicDirectory = path.join(__dirname, "./public")

app.use(express.static(publicDirectory))

const server = http.createServer(app)
const io = socketio(server)

io.on("connection", (socket) => {
	socket.on("join", ({ username, room }, cb) => {
		const { user, error } = addUser({ id: socket.id, username, room })
		if (error) {
			return cb(error)
		}
		socket.join(user.room)
		socket.emit("newMessage", {
			...generateMessage("Welcome"),
			username: "Admin",
		})

		socket.broadcast.to(user.room).emit("newMessage", {
			...generateMessage(`${user.username} has joined`),
			username: "Admin",
		})

		io.to(user.room).emit("roomData", {
			users: getUsersInRoom(room),
			room: user.room,
		})
	})

	socket.on("sendMessage", (message, cb) => {
		const { username, room } = getUser(socket.id)
		const filter = new Filter()
		if (filter.isProfane(message)) {
			cb()
			socket.emit("newMessage", {
				...generateMessage(filter.clean(message)),
				username,
				type: "sender",
			})
			socket.broadcast.to(room).emit("newMessage", {
				...generateMessage(filter.clean(message)),
				username,
			})
		} else {
			socket.emit("newMessage", {
				...generateMessage(message),
				username,
				type: "sender",
			})
			socket
				.to(room)
				.emit("newMessage", { ...generateMessage(message), username })
			cb()
		}
	})

	socket.on("sendLocation", ({ long, lat } = location, callback) => {
		const { username, room } = getUser(socket.id)

		if (!long || !lat) {
			return callback("No location shared")
		}
		socket.emit("sendLocation", {
			...generateLocationMessage(`https://google.com/maps/@${long},${lat}`),
			username,
			type: "sender",
		})
		socket.to(room).emit("sendLocation", {
			...generateLocationMessage(`https://google.com/maps/@${long},${lat}`),
			username,
		})
		callback()
	})

	socket.on("disconnect", () => {
		if (socket.id) {
			const user = removeUser(socket.id)
			if (user) {
				io.to(user.room).emit("newMessage", {
					...generateMessage(`${user.username} has left`),
					username: "Admin",
				})
				io.to(user.room).emit("roomData", {
					users: getUsersInRoom(user.room),
					room: user.room,
				})
			}
		} else {
			socket.emit("join", "Click ok to join the room again")
		}
	})
})

server.listen(port, () => {
	console.log(`Server is up on port: localhost:${port} !!`)
})
