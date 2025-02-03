import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import expressLayouts from 'express-ejs-layouts';

import faqRoutes from './routes/faq.routes.js';
import adminRoutes from './routes/admin.routes.js';
import sequelize from './config/database.js';

import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';
import FAQ from './models/faq.model.js';

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', './layouts/main');
app.use(expressLayouts);


app.use(express.static(path.join(__dirname, 'public')));
app.use('/ckeditor', express.static(path.join(__dirname, '../node_modules/ckeditor4')));


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));


app.use(flash());


app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  next();
});






app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FAQ API',
    version: '1.0.0',
    description: 'API for managing multilingual FAQs'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  paths: {
    '/api/faqs': {
      get: {
        summary: 'Get all FAQs',
        parameters: [
          {
            in: 'query',
            name: 'lang',
            schema: {
              type: 'string',
              enum: ['en', 'hi', 'bn']
            },
            description: 'Language code'
          }
        ],
        responses: {
          200: {
            description: 'List of FAQs'
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/admin', adminRoutes);
app.use('/api/faqs', faqRoutes);
app.get('/', async (req, res) => {
  const lang = req.query.lang || 'en';
  const faqs = await FAQ.findAll({ where: { isActive: true } });
  const translatedFaqs = faqs.map(faq => faq.getTranslated(lang));
  res.render('public/faqs', { faqs: translatedFaqs, lang });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer(); 

export default app;