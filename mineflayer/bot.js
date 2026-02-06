const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalBlock } = goals

const bot = mineflayer.createBot({
  host: '0.0.0.0',
  port: 25565,
  username: 'MyBot',
  version: '1.21.9'
})

// Load pathfinder plugin for movement
bot.loadPlugin(pathfinder)

let isMining = false

// Auto-mining function
async function autoMine() {
  if (isMining) return
  isMining = true

  try {
    // Find nearest valuable block (stone, coal, iron, etc.)
    const blockToMine = bot.findBlock({
      matching: (block) => {
        return block.name === 'stone' ||
               block.name === 'coal_ore' ||
               block.name === 'iron_ore' ||
               block.name === 'dirt' ||
               block.name === 'oak_log'
      },
      maxDistance: 32
    })

    if (blockToMine) {
      console.log(`Found ${blockToMine.name} at ${blockToMine.position}`)

      // Move to the block
      const defaultMove = new Movements(bot)
      bot.pathfinder.setMovements(defaultMove)

      const goal = new GoalBlock(blockToMine.position.x, blockToMine.position.y, blockToMine.position.z)
      await bot.pathfinder.goto(goal)

      // Mine the block
      console.log(`Mining ${blockToMine.name}...`)
      await bot.dig(blockToMine)
      console.log(`Successfully mined ${blockToMine.name}!`)

      // Wait a bit before next mining
      setTimeout(autoMine, 1000)
    } else {
      console.log('No blocks found nearby, exploring...')
      // Move randomly to explore
      const x = bot.entity.position.x + (Math.random() - 0.5) * 20
      const z = bot.entity.position.z + (Math.random() - 0.5) * 20
      const y = bot.entity.position.y

      const defaultMove = new Movements(bot)
      bot.pathfinder.setMovements(defaultMove)
      const goal = new GoalBlock(Math.floor(x), Math.floor(y), Math.floor(z))

      await bot.pathfinder.goto(goal)
      setTimeout(autoMine, 2000)
    }
  } catch (err) {
    console.log('Error during mining:', err.message)
    setTimeout(autoMine, 3000)
  } finally {
    isMining = false
  }
}

bot.on('spawn', () => {
  console.log('Spawned — I am ready!')
  console.log('Starting auto-mining bot...')

  // Start auto-mining after 2 seconds
  setTimeout(() => {
    autoMine()
  }, 2000)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  if (message === 'hi') bot.chat(`Hello ${username}!`)
  if (message === 'stop') {
    isMining = false
    bot.chat('Stopping auto-mine...')
  }
  if (message === 'start') {
    bot.chat('Starting auto-mine...')
    autoMine()
  }
  if (message === 'pos') {
    const pos = bot.entity.position
    bot.chat(`I am at ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`)
  }
})

bot.on('error', (err) => {
  console.log('Bot error:', err)
})

bot.on('kicked', (reason) => {
  console.log('Bot was kicked:', reason)
})
