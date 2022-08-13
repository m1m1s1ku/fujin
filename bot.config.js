module.exports = {
    apps : [
        {
          name: "pince-bot",
          script: "./src/index.ts",
          watch: false,
          env: {
              "BOT_TOKEN": "xxx:xxx"
          }
        }
    ]
}