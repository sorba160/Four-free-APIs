
const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
// const Note = require('../models/Notes')
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');

// Route 1 

router.get('/fetchallnotes', fetchuser, async (req, res) => {
   try {
      const notes = await Notes.find({ user: req.user.id })
      res.json(notes)

   } catch (error) {
      console.error(error.message)
      res.status(500).send("Internal Server error")
   }

})

//Route 2

router.post('/addnote', fetchuser, [
   body('title', 'enter a valid title').isLength({ min: 3 }),
   body('description', 'Description must be atleast five characers').isLength({ min: 5 }),

], async (req, res) => {
   try {


      const { title, description, tag } = req.body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
         title, description, tag, user: req.user.id
      })
      const saveNote = await note.save()

      res.json(saveNote)
   } catch (error) {
      console.error(error.message)
      res.status(500).send("Internal Server error")
   }

})

// Route 3

router.put('/updatenote/:id', fetchuser, [
   body('title', 'enter a valid title').isLength({ min: 3 }),
   body('description', 'Description must be atleast five characers').isLength({ min: 5 })

], async (req, res) => {
   const { title, description, tag } = req.body
   const newNote = {}
   if (title) {
      newNote.title = title
   }
   if (description) {
      newNote.description = description
   }
   if (title) {
      newNote.tag = tag
   }

   let note = await Notes.findById(req.params.id)
   if (!note) {
      return res.status(404).send("Not Found")
   }
   if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed")
   }

   note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
   res.json({note})
}) 

//Route 4 

router.delete('/deletenote/:id', fetchuser, [
   body('title', 'enter a valid title').isLength({ min: 3 }),
   body('description', 'Description must be atleast five characers').isLength({ min: 5 })

], async (req, res) => {
   
  
   let note = await Notes.findById(req.params.id)
   if (!note) {
      return res.status(404).send("Not Found")
   }
   if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed")
   }

   note = await Notes.findByIdAndDelete(req.params.id)
   res.json({"Success":"Note has been deleted", note:note} )
}) 




module.exports = router