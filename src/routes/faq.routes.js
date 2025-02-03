import express from 'express';
import { translate } from '@vitalets/google-translate-api';
// i am using @vitalets/google-translate-api library because google-translate-api 
// requires money transacation to access api while this library is free for limited request on specific ip
// but unlimited if used with proxy .😁
import { HttpProxyAgent } from 'http-proxy-agent';
import FAQ from '../models/faq.model.js';
import cache from '../utils/cache.js';


const router = express.Router();
const agent = new HttpProxyAgent('http://188.253.112.218'); // proxy ip 
// Available proxy list you can find "https://free-proxy-list.net/" (with anonymous in *Anonymity and yes in Google columns).



const translateText = async (text, lang) => {
  try {
    const result = await translate(text, {
      to: lang,
      fetchOptions: { agent },
      host: 'translate.googleapis.com', 
      timeout: 5000 
    });
    return result.text;
  } catch (error) {
    console.error(`Translation failed for ${lang}:`, error);
    return text; 
  }
};

// Middleware to handle language parameter
const handleLanguage = (req, res, next) => {
  req.language = req.query.lang || 'en';
  next();
};


router.get('/', handleLanguage, async (req, res) => {
  try {
    const cacheKey = cache.getCacheKey('faqs', { lang: req.language });
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const faqs = await FAQ.findAll({
      where: { isActive: true }
    });

    const translatedFaqs = faqs.map(faq => faq.getTranslated(req.language));
    await cache.set(cacheKey, translatedFaqs);

    res.json(translatedFaqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { question, answer } = req.body;

    const [questionHi, answerHi, questionBn, answerBn] = await Promise.all([
      translateText(question, 'hi'),
      translateText(answer, 'hi'),
      translateText(question, 'bn'),
      translateText(answer, 'bn')
    ]);

    await FAQ.create({
      question,
      answer,
      question_hi: questionHi,
      answer_hi: answerHi,
      question_bn: questionBn,
      answer_bn: answerBn,
      createdBy: req.user?.id || 'system'
    });

    await cache.flush();
    req.flash('success', 'FAQ created successfully!');
    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to create FAQ');
    return res.redirect('/admin/faq/new');
  }
});

// Update FAQ
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const faq = await FAQ.findByPk(id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Translate updates
    const [questionHi, answerHi, questionBn, answerBn] = await Promise.all([
      translateText(question, 'hi'),
      translateText(answer, 'hi'), 
      translateText(question, 'bn'),
      translateText(answer, 'bn')
    ]);

    await faq.update({
      question,
      answer,
      question_hi: questionHi,
      answer_hi: answerHi,
      question_bn: questionBn,
      answer_bn: answerBn,
      updatedBy: req.user?.id || 'system'
    });

    // Clear cache
    await cache.flush();
    req.flash('success', 'FAQ updated successfully!');
    res.redirect('/admin/dashboard');

    // res.json(faq); 

  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to update FAQ');
    return res.redirect('/admin/faq/edit/' + id);
  }
});


// Delete FAQ (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    await faq.destroy();
    await cache.flush();
   
    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to delete FAQ');
    return res.redirect('/admin/dashboard');
  }
});


export default router;