require("dotenv").config()
require("./database/schema").connect()
const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("./model/user")
const { TOKEN_KEY, FRONTEND_URL } = process.env
const cors = require("cors")
const auth = require("./middleware/auth")
const mimetypes = require("mime-types")
const fs = require("fs")
const uuid = require("uuid")
const request = require('request').defaults({ encoding: null })
const { euclideanDistance, manhattanDistance, encryptBiometrics, decryptBiometrics, getInitializationVector } = require("./utils")
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json({limit: '5mb'}))
const corsOptions = {
    origin: FRONTEND_URL
}
app.use(express.static('public'))


app.post('/api/auth/register', cors(corsOptions), async (req, res) => {

    try {
        const { name, email, password, screenshot, descriptor } = req.body

        if (!(name && email && password && screenshot && descriptor)) {
            return res.status(400).send('Dati mancanti.')
        }

        if (!email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            return res.status(400).send('The EMAIL field is not in the standard form.')
        }

        const oldUser = await User.findOne({ email })
        if (oldUser) {
            return res.status(409).send('User already registered. Please log in.')
        }

        const mime = (screenshot.split(';')[0]).split(':')[1]
        const ext = mimetypes.extension(mime)
        const path = 'uploads/'+uuid.v4()+'.'+ext
        fs.writeFile(path, screenshot.split(',')[1], 'base64', (e) => {
            if (e) {
                console.log(e)
                throw 'Unable to save file.'
            }
        })
        const encryptedUserPassword = await bcrypt.hash(password, 10)
        const iv = getInitializationVector(16)
        const user = await User.create({
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            email: email.toLowerCase(),
            password: encryptedUserPassword,
            image_src: path,
            init_vector: Buffer.from(iv, 'binary').toString('base64'),
            face_descriptor: encryptBiometrics(descriptor, iv)
        })
        console.log({user:user.name, email: user.email})
        const token = jwt.sign(
            { user_id: user._id, email },
            TOKEN_KEY,
            { expiresIn: '2h' }
        )

        return res.status(200).json({
                name: user.name,
                email: user.email,
                screenshot: user.image_src,
                registerPic: screenshot,
                token
            })
    }
    catch (e) {
        console.log(e)
        return res.status(500).send(e)
    }
    
})

app.post('/api/auth/login', cors(corsOptions), async (req, res) => {
    
    try {
        const { email, password, screenshot, descriptor } = req.body

        if (!(email && password && screenshot && descriptor)) {
            return res.status(400).send('Dati mancanti.')
        }

        if (!email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            return res.status(400).send('The EMAIL field is not in the standard form.')
        }

        const users = await User.find({})
        let threshold = 0.5
        let bestMatchUser = {}
        users.forEach(u => {
            const iv = Buffer.from(u.init_vector, 'base64')
            const distance = euclideanDistance(descriptor, decryptBiometrics(u.face_descriptor, iv))
            if (distance < threshold) {
                threshold = distance
                bestMatchUser = u
            }
        })
        console.log({bestMatchUser:bestMatchUser.name, threshold})
        if (Object.keys(bestMatchUser).length === 0) {
            return res.status(400).send('It was not possible to associate the IMAGE inserted with the one registered. Insert a new image.')
        }
        if (email !== bestMatchUser.email) {
            return res.status(400).send('EMAIL or PASSWORD provided are incorrect.')
        }

        const userByEmail = await User.findOne({ email })
        if ((await bcrypt.compare(password, bestMatchUser.password)) && (await bcrypt.compare(password, userByEmail.password))) {
            const token = jwt.sign(
                { user_id: bestMatchUser._id, email },
                process.env.TOKEN_KEY,
                {expiresIn: '2h' }
            )
            const image_path = path.join(__dirname, bestMatchUser.image_src)
            let registerPic = ''
            fs.readFile(image_path, (e,c) => {
                if (e) {
                    console.log(e)
                    throw 'An error occurred with image reading.'
                } else {
                    const mime = mimetypes.contentType(image_path.split('.')[1])
                    registerPic = "data:" + mime + ";base64," + c.toString('base64')
                    return res.status(200).json({
                        name: bestMatchUser.name,
                        email: bestMatchUser.email,
                        screenshot: bestMatchUser.image_src,
                        registerPic,
                        loginPic: screenshot,
                        token
                    })
                }
            })
            
        } else {
            return res.status(400).send('EMAIL or PASSWORD provided are incorrect.')
        }
    }
    catch (e) {
        console.log(e)
        return res.status(500).send(e)
    }
})

app.post('/api/auth/logout', cors(corsOptions), auth, (req, res) => {
    // TODO: invalidate token
    return res.status(200).send('Logged out successfully!')
})

app.post('/api/image/get/from/url', cors(corsOptions), (req, res) => {
    try {
        const { url } = req.body
        if (!(url)) {
            return res.status(400).send('Missing data.')
        }
        request.get(url, (error, response, body) => {
            if (!error && response.statusCode === 200 && response.headers["content-type"].includes('image')) {
                const data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64')
                return res.status(200).json({blob: data})
            } else {
                return res.status(400).send('The URL provided does not match an image.')
            }
        })
    }
    catch (e) {
        console.log(e)
        return res.status(500).send(e)
    }
})


app.post('/api/image/get/profile/pic', cors(corsOptions), auth, async (req, res) => {
    
    try {
        const { email } = req.body

        if (!(email)) {
            return res.status(400).send('Dati mancanti.')
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(409).send('User not found.')
        }

        const image_path = path.join(__dirname, user.image_src)
        fs.readFile(image_path, (e,c) => {
            if (e) {
                console.log(e)
                return res.status(500).send(e)
            } else {
                const mime = mimetypes.contentType(image_path.split('.')[1])
                const data = "data:" + mime + ";base64," + c.toString('base64')
                return res.status(200).send({blob: data})
            }
        })
    }
    catch (e) {
        return res.status(500).send(e)
    }
})

app.post('/api/image/get/matches', cors(corsOptions), (req, res) => {
    try {
        const { target, threshold } = req.body

        let falsePositive = []
        let falseNegative = []

        fs.readFile('faces.json', (err, oldData) => {
            if (err) {
                console.log(err)
                throw err
            } else {
                const obj = JSON.parse(oldData)
                let data = []
                const names = obj.map(name => name.person)
                const people = [...new Set(names)]
                people.map(p => {
                    const dataByName = obj.filter(o => o.person === p)
                    obj.map(o => {
                        let el = {
                            match: p === o.person ? 1 : 0,
                            personA: p,
                            personB: o.person,
                            faceA: dataByName[0].src,
                            faceB: o.src,
                            euclidean: euclideanDistance(dataByName[0].description, o.description),
                            manhattan: manhattanDistance(dataByName[0].description, o.description)
                        }
                        data.push(el)
                    })
                })

                if ( target === 'euclidean' ) {
                    falsePositive = data.filter(a => a.match === 0 && a.euclidean < threshold)
                    falsePositive.sort((a,b) => b.euclidean - a.euclidean)
                    falseNegative = data.filter(a => a.match === 1 && a.euclidean > threshold)
                    falseNegative.sort((a,b) => a.euclidean - b.euclidean)
                } else if ( target === 'manhattan' ) {
                    falsePositive = data.filter(a => a.match === 0 && a.manhattan < threshold)
                    falsePositive.sort((a,b) => b.manhattan - a.manhattan)
                    falseNegative = data.filter(a => a.match === 1 && a.manhattan > threshold)
                    falseNegative.sort((a,b) => a.manhattan - b.manhattan)
                } else {
                    return res.status(400).send('Malformed request.')
                }
                return res.status(200).json({
                    target,
                    total: data.length,
                    fail: falsePositive.length + falseNegative.length,
                    pass: data.length - (falsePositive.length + falseNegative.length),
                    falsePositive: falsePositive,
                    falseNegative: falseNegative
                })
            }
        })
                
    } catch (e) {
        console.log(e)
        return res.status(500).send(e)
    }
})


app.get('/', (req, res) => {
    res.json({ message: 'Hello from server!' })
})

module.exports = app