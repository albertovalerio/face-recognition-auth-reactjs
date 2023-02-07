const crypto = require ("crypto")
const { PRIVATE_KEY } = process.env

module.exports = {
    euclideanDistance: (featuresA, featuresB) => {
        return featuresA.map((x, i) => Math.abs( x - featuresB[i] ) ** 2).reduce((sum, now) => sum + now) ** (1/2)
    },
    manhattanDistance: (featuresA, featuresB) => {
        return featuresA.map((x, i) => Math.abs( x - featuresB[i] )).reduce((sum, now) => sum + now)
    },
    getInitializationVector: (len) => {
        return crypto.randomBytes(len)
    },
    encryptBiometrics: (decriptor, iv) => {
        const message = decriptor.join('###')
        const cipher = crypto.createCipheriv('aes-256-cbc', PRIVATE_KEY, iv)
        let encryptedData = cipher.update(message, 'utf-8', 'hex')        
        encryptedData += cipher.final('hex')
        return encryptedData
    },
    decryptBiometrics: (descriptor, iv) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', PRIVATE_KEY, iv)
        let decryptedData = decipher.update(descriptor, 'hex', 'utf-8')
        decryptedData += decipher.final('utf8')
        return decryptedData.split('###')
    }
}