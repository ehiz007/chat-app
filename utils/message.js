const generateMessage = (message) => ({
	message,
	createdAt: new Date().getTime(),
})

const generateLocationMessage = (location) => ({
	location,
	createdAt: new Date().getTime(),
})

module.exports = {
	generateMessage,
	generateLocationMessage,
}
