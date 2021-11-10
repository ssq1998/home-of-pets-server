const ports = {
    development: {
        server: {
            host: 'localhost',
            port: 3000
        }
    },
    test: {
        server: {
            host: 'localhost',
            port: 3000
        }
    },
    production: {
        server: {
            host: 'localhost',
            port: 3000
        }
    }
}

const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = ports[NODE_ENV]