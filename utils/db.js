const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/contact-app')

// // menambah 1 data
// const contact1 = new Contact({
//   nama: 'Bayu Krisna',
//   nohp: '082246319785',
//   email: 'bayukrisna@gmail.com',
// })

// // simpan ke collection
// contact1.save().then(contact => console.log(contact))