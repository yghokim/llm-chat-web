module.exports = {
    apps: [{
        name: 'llm-chat-web',
        script: 'main.py',
        interpreter: "python3",
        args: '--production --https'
    }]
};