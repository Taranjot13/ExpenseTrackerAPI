const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  icon: {
    type: String,
    default: '💰'
  },
  budget: {
    type: Number,
    min: 0,
    default: null
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique category name per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

// Method to check if category is over budget
categorySchema.methods.isOverBudget = async function(totalSpent) {
  if (!this.budget) return false;
  return totalSpent > this.budget;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
