const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SugerenciasSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('sugerencias', SugerenciasSchema);