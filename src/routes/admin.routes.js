// src/routes/admin.routes.js
import express from 'express';
import { ensureAuthenticated } from '../middleware/auth.js';
import FAQ from '../models/faq.model.js';

const router = express.Router();



// Admin dashboard
router.get('/dashboard', async (req, res) => {
    const faqs = await FAQ.findAll();
    res.render('admin/dashboard', { faqs });
});

// New FAQ form
router.get('/faq/new', (req, res) => {
    res.render('admin/faq-form', { faq: null });
});

// Edit FAQ form
router.get('/faq/edit/:id', async (req, res) => {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
        req.flash('error_msg', 'FAQ not found');
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/faq-form', { faq });
});



export default router;