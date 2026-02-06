const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'play.example.com', // server
  port: 25565,              // optional
  username: 'MyBot'         // or email for premium account
})

bot.on('spawn', () => {
  console.log('Spawned — I am ready!')
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  if (message === 'hi') bot.chat(`Hello ${username}!`)
})

// Example: find nearest diamond ore within 32 blocks
const block = bot.findBlock({
  matching: (b) => b.name === 'diamond_ore',
  maxDistance: 32
})
console.log('Nearest diamond ore:', block?.position)
