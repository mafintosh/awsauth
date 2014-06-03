# awsauth

[ghauth](https://github.com/rvagg/ghauth) but for aws

```
npm install awsauth
```

## Usage

``` js
var awsauth = require('awsauth')

awsauth({
  profile: 'my-profile'
}, function(err, profile) {
  if (err) throw err
  console.log(profile)
})
```

Running this will output something like this:

```
$ node example.js

Your AWS Access Key ID: AKIAEXAMPLEEXAMPLE12
Your AWS Secret Access Key: SECRETKEYSECRETKEYSECRETKEYSECRETKEY1234
Your preferred AWS region (optional, us-east-1): eu-west-1

{
  key: 'AKIAEXAMPLEEXAMPLE12',
  secret: 'SECRETKEYSECRETKEYSECRETKEYSECRETKEY1234',
  region: 'eu-west-1'
}
```

[awsauth](https://github.com/mafintosh/awsauth) will first look in `~/.aws/config` for the profile (the place the aws cli tool stores credentials)
and if not found it will prompt and then verify the keys. If the keys are verified it will store them in the config file

## More options

``` js
awsauth({
  profile: 'my-profile',
  verify: false, // skip the verification step
  config: 'some-other-config-file-path' // use another config file,
  region: 'eu-west-1' // change the default region
}, function() {
  ...
})
```

## License

MIT