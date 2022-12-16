const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')

const { body, validationResult, check } = require('express-validator')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

// use EJS
app.set('view engine', 'ejs')

// Third-party middleware
app.use(expressLayouts) // express layout
app.use(methodOverride('_method')) // method override

// Built-in middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// konfigurasi flash
app.use(cookieParser('secret'))
app.use(session({
  cookie: {maxAge: 6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))
app.use(flash())

// halaman home
app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: 'Ardhi Harry',
      email: 'ardhiharry@gmail.com'
    },
    {
      nama: 'Bayu Krisna',
      email: 'bayukrisna@gmail.com'
    },
    {
      nama: 'Fanky Nurila',
      email: 'fankynurila@gmail.com'
    },
  ]
  
  res.render('index', {
    title: 'Home',
    layout: 'layouts/main',
    nama: 'Ardhi Harry',
    mahasiswa,
  })
})

// halaman about
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
    layout: 'layouts/main',
  })
})

// halaman contact
app.get('/contact', async (req, res) => {
  // Contact.find().then(contact => {
  //   res.send(contact)
  // })

  const contacts = await Contact.find()

  res.render('contact', {
    title: 'Contact',
    layout: 'layouts/main',
    contacts,
    msg: req.flash('msg'),
  })
})

// halaman form tambah contact
app.get('/contact/add', (req, res) => {
  res.render('contact-add', {
    title: 'Add Contact',
    layout: 'layouts/main',
  })
})

// proses tambah contact
app.post('/contact', [
  body('nama').custom(async (value) => {
    const duplikat = await Contact.findOne({ nama: value })
    if(duplikat) {
      throw new Error('Nama contact sudah digunakan')
    }
    return true
  }),
  check('email', 'Email tidak vaild!').isEmail(),
  check('nohp', 'No HP tidak vaild!').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    res.render('contact-add', {
      title: 'Add Contact',
      layout: 'layouts/main',
      errors: errors.array()
    })
  } else {
    Contact.insertMany(req.body, (error, result) => {
      // kirim flash message
      req.flash('msg', 'Data contact berhasil ditambahkan!')
      res.redirect('/contact')
    })
  }

})

// proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama })

//   if(!contact) {
//     res.status(404)
//     res.render('404', {
//       layout: 'layouts/error',
//       title: '404',
//     })
//   } else {
//     Contact.deleteOne({ _id : contact._id }).then(() => {
//       // kirim flash message
//       req.flash('msg', 'Data contact berhasil dihapus!')
//       res.redirect('/contact')
//     })

//   }
// })
app.delete('/contact', (req, res) => {
  Contact.deleteOne({ nama : req.body.nama }).then(() => {
    // kirim flash message
    req.flash('msg', 'Data contact berhasil dihapus!')
    res.redirect('/contact')
  })
})

// halaman form edit contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama })

  res.render('contact-edit', {
    title: 'Edit Contact',
    layout: 'layouts/main',
    contact,
  })
})

// proses edit contact
app.put('/contact', [
  body('nama').custom(async (value, { req }) => {
    const duplikat = await Contact.findOne({ nama: value })
    if(value !== req.body.oldNama && duplikat) {
      throw new Error('Nama contact sudah digunakan')
    }
    return true
  }),
  check('email', 'Email tidak vaild!').isEmail(),
  check('nohp', 'No HP tidak vaild!').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    res.render('contact-edit', {
      title: 'Edit Contact',
      layout: 'layouts/main',
      errors: errors.array(),
      contact: req.body,
    })
  } else {
    Contact.updateOne(
      { _id: req.body._id },
      {
        $set: {
          nama: req.body.nama,
          email: req.body.email,
          nohp: req.body.nohp,
        },
      }
    ).then(() => {
      // kirim flash message
      req.flash('msg', 'Data contact berhasil diubah!')
      res.redirect('/contact')
    })
    
  }

})

// halaman detail contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama })

  res.render('contact-detail', {
    title: 'Contact Detail',
    layout: 'layouts/main',
    contact,
  })
})

app.listen(port, () => {
  console.log(`Mongo Contact App listening at http://localhost:${port}`)
})