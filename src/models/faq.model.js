import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_hi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  answer_hi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  question_bn: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  answer_bn: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true, // Soft deletes
  indexes: [
    {
      fields: ['isActive']
    }
  ]
});

// Instance method to get translated content
FAQ.prototype.getTranslated = function(language = 'en') {
  if (language === 'en') {
    return {
      question: this.question,
      answer: this.answer
    };
  }
  
  return {
    question: this[`question_${language}`] || this.question,
    answer: this[`answer_${language}`] || this.answer
  };
};

export default FAQ; 