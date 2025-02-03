import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';
import FAQ from '../models/faq.model.js';
import cache from '../utils/cache.js';


describe('FAQ API', () => {
  beforeEach(async () => {
    await FAQ.destroy({ where: {}, force: true });
    await cache.flush();
  });

  describe('GET /api/faqs', () => {
    it('should return empty array when no FAQs exist', async () => {
      const res = await request(app)
        .get('/api/faqs')
        .expect(200);

      expect(res.body).to.be.an('array').that.is.empty;
    });

    it('should return FAQs in requested language', async () => {
      const faq = await FAQ.create({
        question: 'Test Question?',
        answer: 'Test Answer',
        question_hi: 'टेस्ट प्रश्न?',
        answer_hi: 'टेस्ट उत्तर'
      });

      const res = await request(app)
        .get('/api/faqs?lang=hi')
        .expect(200);

      expect(res.body[0].question).to.equal('टेस्ट प्रश्न?');
      expect(res.body[0].answer).to.equal('टेस्ट उत्तर');
    });
  });

  describe('POST /api/faqs', () => {
    it('should create a new FAQ with translations', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .send({
          question: 'What is this?',
          answer: 'This is a test.'
        })
        .expect(201);

      expect(res.body.question).to.equal('What is this?');
      expect(res.body.question_hi).to.be.a('string');
      expect(res.body.question_bn).to.be.a('string');
    });
  });

  describe('PUT /api/faqs/:id', () => {
    it('should update FAQ and its translations', async () => {
      const faq = await FAQ.create({
        question: 'Old Question?',
        answer: 'Old Answer'
      });

      const res = await request(app)
        .put(`/api/faqs/${faq.id}`)
        .send({
          question: 'New Question?',
          answer: 'New Answer'
        })
        .expect(200);

      expect(res.body.question).to.equal('New Question?');
      expect(res.body.answer).to.equal('New Answer');
      expect(res.body.question_hi).to.be.a('string');
      expect(res.body.question_bn).to.be.a('string');
    });

    it('should return 404 for non-existent FAQ', async () => {
      await request(app)
        .put('/api/faqs/999999')
        .send({
          question: 'New Question?',
          answer: 'New Answer'
        })
        .expect(404);
    });
  });

  describe('DELETE /api/faqs/:id', () => {
    it('should soft delete FAQ', async () => {
      const faq = await FAQ.create({
        question: 'Delete me?',
        answer: 'Yes, delete this.'
      });

      await request(app)
        .delete(`/api/faqs/${faq.id}`)
        .expect(204);

      const deletedFaq = await FAQ.findByPk(faq.id, { paranoid: false });
      expect(deletedFaq.deletedAt).to.not.be.null;
    });

    it('should return 404 for non-existent FAQ', async () => {
      await request(app)
        .delete('/api/faqs/999999')
        .expect(404);
    });
  });
}); 