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
        .expect(302);

      const faq = await FAQ.findOne({
        where: { question: 'What is this?' }
      });
      expect(faq).to.not.be.null;
      expect(faq.question_hi).to.be.a('string');
      expect(faq.question_bn).to.be.a('string');
    });
  });

  describe('POST /api/faqs/:id', () => {
    it('should update FAQ and its translations', (done) => {
      FAQ.create({
        question: 'Old Question?',
        answer: 'Old Answer'
      })
      .then(faq => {
        request(app)
          .post(`/api/faqs/${faq.id}`)
          .send({
            question: 'New Question?',
            answer: 'New Answer'
          })
          .expect(302)
          .end((err, res) => {
            if (err) return done(err);
            
            FAQ.findByPk(faq.id)
              .then(updatedFaq => {
                expect(updatedFaq.question).to.equal('New Question?');
                expect(updatedFaq.answer).to.equal('New Answer'); 
                expect(updatedFaq.question_hi).to.be.a('string');
                expect(updatedFaq.question_bn).to.be.a('string');
                done();
              })
              .catch(done);
          });
      })
      .catch(done);
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
        .expect(200);

      const deletedFaq = await FAQ.findByPk(faq.id, { paranoid: false });
      expect(deletedFaq.deletedAt).to.not.be.null;
    });

   
  });
}); 