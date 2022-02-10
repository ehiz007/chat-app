const users = []

const addUser = ({ id, username, room }) => {
	// clean data
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()

	// validate data
	if (!username || !room) {
		return { error: "username or room are required!" }
	}

	// check for existing user

	const existingUser = users.find(
		(user) => user.room === room && user.username === username,
	)
	if (existingUser) {
		return {
			error: "username already exists!",
		}
	}
	const user = { id, username, room }
	users.push(user)
	return { user }
}

const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id
	})
	if (index != -1) {
		return users.splice(index, 1)[0]
	}
}

const getUser = (id) => users.find((user) => user.id === id)

const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase()
	const roomUsers = users.filter((user) => user.room === room)
	return roomUsers.length > 0 ? roomUsers : []
}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
}
