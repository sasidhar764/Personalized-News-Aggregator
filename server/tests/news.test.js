const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const newsRoutes = require('../routes/news.route');
const News = require('../models/news.model');
const User = require('../models/user.model');
const Headlines = require('../models/headlines.model');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/news', newsRoutes);

describe('News API Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await News.deleteMany({});
    await User.deleteMany({});
    await Headlines.deleteMany({});
  });

  describe('POST /api/news/', () => {
    test('should get all news without filters', async () => {
      await News.create([
        { title: 'News 1', url: 'url1', category: 'Technology' },
        { title: 'News 2', url: 'url2', category: 'Sports' }
      ]);

      const response = await request(app)
        .post('/api/news/')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    test('should filter news by category', async () => {
      await News.create([
        { title: 'News 1', url: 'url1', category: 'Technology' },
        { title: 'News 2', url: 'url2', category: 'Sports' }
      ]);

      const response = await request(app)
        .post('/api/news/')
        .send({ categories: 'Technology' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].category).toBe('Technology');
    });

    test('should return empty array if no news matches filter', async () => {
      await News.create([
        { title: 'News 1', url: 'url1', category: 'Technology' },
      ]);

      const response = await request(app)
        .post('/api/news/')
        .send({ categories: 'Sports' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/news/headlines', () => {
    test('should get all headlines', async () => {
      await Headlines.create([
        { title: 'Headline 1', url: 'url1' },
        { title: 'Headline 2', url: 'url2' }
      ]);

      const response = await request(app)
        .get('/api/news/headlines');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    test('should return empty array if no headlines exist', async () => {
      const response = await request(app)
        .get('/api/news/headlines');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/news/incrementviewcount', () => {
    test('should increment view count', async () => {
      await News.create({ title: 'News 1', url: 'url1', viewcount: 0 });

      const response = await request(app)
        .put('/api/news/incrementviewcount')
        .send({ url: 'url1' });

      expect(response.status).toBe(200);
      expect(response.body.viewcount).toBe(1);
    });

    test('should return error if news item not found', async () => {
      const response = await request(app)
        .put('/api/news/incrementviewcount')
        .send({ url: 'nonexistentUrl' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('News or headline not found.');
    });
  });

  describe('POST /api/news/bookmark', () => {
    test('should add bookmark', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        bookmarks: [] 
      });
      await News.create({ title: 'News 1', url: 'url1' });

      const response = await request(app)
        .post('/api/news/bookmark')
        .send({ username: 'testuser', url: 'url1' });

      expect(response.status).toBe(200);
      expect(response.body.bookmarks).toContain('url1');
    });

    test('should remove bookmark if already bookmarked', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        bookmarks: ['url1'] 
      });
      await News.create({ title: 'News 1', url: 'url1' });

      const response = await request(app)
        .post('/api/news/bookmark')
        .send({ username: 'testuser', url: 'url1' });

      expect(response.status).toBe(200);
      expect(response.body.bookmarks).not.toContain('url1');
    });

    test('should return error if username or URL is missing', async () => {
      const response = await request(app)
        .post('/api/news/bookmark')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and URL are required.');
    });
  });

  describe('POST /api/news/reportarticle', () => {
    test('should report article', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        reportedArticles: [] 
      });
      await News.create({ title: 'News 1', url: 'url1', reportCount: 0 });

      const response = await request(app)
        .post('/api/news/reportarticle')
        .send({ username: 'testuser', url: 'url1' });

      expect(response.status).toBe(200);
      expect(response.body.reportCount).toBe(1);
    });

    test('should return error if article already reported by user', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        reportedArticles: ['url1'] 
      });
      await News.create({ title: 'News 1', url: 'url1', reportCount: 0 });

      const response = await request(app)
        .post('/api/news/reportarticle')
        .send({ username: 'testuser', url: 'url1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('You have already reported this article.');
    });

    test('should return error if article not found', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        reportedArticles: [] 
      });

      const response = await request(app)
        .post('/api/news/reportarticle')
        .send({ username: 'testuser', url: 'nonexistentUrl' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('News article not found.');
    });
  });

  describe('POST /api/news/preferred', () => {
    test('should get preferred news', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        preferredCategory: ['Technology'],
        language: 'English'
      });
      await News.create([
        { title: 'News 1', url: 'url1', category: 'Technology', language: 'English' },
        { title: 'News 2', url: 'url2', category: 'Sports' }
      ]);

      const response = await request(app)
        .post('/api/news/preferred')
        .send({ username: 'testuser' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    test('should return empty array if no preferred news matches', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        preferredCategory: ['Technology'],
        language: 'English'
      });
      await News.create([
        { title: 'News 1', url: 'url1', category: 'Sports', language: 'Hindi' }
      ]);

      const response = await request(app)
        .post('/api/news/preferred')
        .send({ username: 'testuser' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/news/togglesummary', () => {
    test('should enable news summary', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        summary: false 
      });

      const response = await request(app)
        .post('/api/news/togglesummary')
        .send({ username: 'testuser', enable: true });

      expect(response.status).toBe(200);
      const user = await User.findOne({ username: 'testuser' });
      expect(user.summary).toBe(true);
    });

    test('should disable news summary', async () => {
      await User.create({ 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'password123',
        summary: true 
      });

      const response = await request(app)
        .post('/api/news/togglesummary')
        .send({ username: 'testuser', enable: false });

      expect(response.status).toBe(200);
      const user = await User.findOne({ username: 'testuser' });
      expect(user.summary).toBe(false);
    });

    test('should return error if username or enable flag is missing', async () => {
      const response = await request(app)
        .post('/api/news/togglesummary')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and enable flag are required.');
    });
  });
});
