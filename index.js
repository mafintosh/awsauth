var fs = require('fs')
var read = require('read')
var path = require('path')
var ini = require('ini')
var mkdirp = require('mkdirp')
var aws4 = require('aws4')
var https = require('https')

var HOME = process.env.HOME || process.env.USERPROFILE
var CONFIG = path.join(HOME, '.aws/config')

var prompt = function(defaultRegion, cb) {
  read({ prompt: 'Your AWS Access Key ID:' }, function(err, key) {
    if (err) return cb()

    read({ prompt: 'Your AWS Secret Access Key:' }, function(err, secret) {
      if (err) return cb()

      read({ prompt: 'Your preferred AWS region (optional, '+defaultRegion+'):' }, function(err, region) {
        if (err) return cb(err)

        cb(null, {
          aws_access_key_id: key,
          aws_secret_access_key: secret,
          region: region || defaultRegion
        })
      })
    })
  })
}

var verify = function(opts, cb) {
  var opts = aws4.sign({
    host: 'iam.amazonaws.com',
    path:'/?Action=GetUser&Version=2010-05-08'
  }, {
    accessKeyId: opts.key,
    secretAccessKey: opts.secret
  })

  var req = https.request(opts)

  req.on('response', function(res) {
    var buf = ''
    res.setEncoding('utf-8')
    res.on('data', function(data) {
      buf += data
    })
    res.on('end', function() {
      // access denied is this case is a good thing
      if (buf.indexOf('<Code>AccessDenied</Code>') > -1 || buf.indexOf('<UserId>') > -1) return cb()
      cb(new Error('Key verification failed!'))
    })
  })

  req.on('error', cb)

  req.end()
}

module.exports = function(opts, cb) {
  if (typeof opts === 'function') return module.exports('default', opts)
  if (typeof opts === 'string') opts = {profile:opts}

  var file = opts.config || CONFIG
  var region = opts.region || 'us-east-1'

  var fix = function(prof) {
    return {
      key: prof.aws_access_key_id,
      secret: prof.aws_secret_access_key,
      region: prof.region || region
    }
  }

  var fixEnv = function() {
    return {
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || region
    }
  }


  fs.readFile(file, 'utf-8', function(err, conf) {
    var profiles = conf ? ini.parse(conf) : {}
    var prof = profiles[opts.profile] || profiles['profile '+opts.profile]

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) return cb(null, fixEnv())
    if (prof) return cb(null, fix(prof))

    prompt(region, function(err, prof) {
      if (err) return cb(err)

      var onverify = function(err) {
        if (err) return cb(err)

        profiles[opts.profile === 'default' ? 'default' : 'profile '+opts.profile] = prof

        mkdirp(path.dirname(file), function(err) {
          if (err) return cb(err)

          fs.writeFile(file, ini.stringify(profiles), function(err) {
            if (err) return cb(err)
            cb(null, fix(prof))
          })
        })
      }

      if (opts.verify === false) return onverify()
      verify(prof, onverify)
    })
  })
}