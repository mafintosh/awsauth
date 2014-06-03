var awsauth = require('./')

awsauth({profile:'default'}, function(err, prof) {
  if (err) throw err
  console.log(prof)
})