# 🚀 Embedding System Setup Guide

## ✅ Implementation Complete!

Tất cả các components đã được implement theo kế hoạch. Dưới đây là hướng dẫn setup và sử dụng.

---

## 📋 Prerequisites

### 1. PostgreSQL với pgvector Extension

```bash
# Install pgvector extension
# On Ubuntu/Debian:
sudo apt-get install postgresql-14-pgvector  # Adjust version as needed

# Or compile from source:
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### 2. Redis Server

```bash
# Install Redis
# On Ubuntu/Debian:
sudo apt-get install redis-server

# On macOS:
brew install redis

# Start Redis
redis-server

# Or use Redis Cloud (free tier available)
```

---

## 🔧 Environment Variables

Thêm vào `.env` file:

```env
# Existing
GEMINI_API_KEY=your-gemini-api-key

# New - Redis Configuration
REDIS_URL=redis://localhost:6379

# Optional - Embedding Configuration
EMBEDDING_BATCH_SIZE=10
EMBEDDING_DELAY_MS=100
EMBEDDING_CONCURRENCY=3
```

---

## 🗄️ Database Migration

### 1. Enable pgvector Extension

Connect to PostgreSQL và chạy:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run Migration

```bash
# Generate Prisma client với schema mới
npx prisma generate

# Apply migration
npx prisma migrate deploy
# Hoặc cho development:
npx prisma migrate dev
```

Migration sẽ:
- ✅ Add `embedding` column (vector(768))
- ✅ Add `embeddingStatus` column (default: 'PENDING')
- ✅ Create indexes cho performance

---

## 🏃 Running the Application

### 1. Install Dependencies

```bash
npm install
```

Dependencies đã được thêm:
- `bullmq` - Queue system
- `ioredis` - Redis client
- `pgvector` - PostgreSQL vector extension support

### 2. Start Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 3. Verify Services

Check logs để verify:
- ✅ Redis connected
- ✅ Embedding queue initialized
- ✅ Embedding worker started

---

## 📡 API Endpoints

### 1. Sync Emails (Auto-queue embeddings)

```http
POST /mail/sync?limit=50
Authorization: Bearer <token>
```

Sau khi sync, emails sẽ tự động được queue để generate embeddings.

### 2. Semantic Search

```http
GET /workflows/search/semantic?query=meeting tomorrow&limit=10&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "subject": "...",
      "embeddingStatus": "COMPLETED",
      ...
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 10,
    "offset": 0,
    "hasMore": false,
    "currentPage": 1
  }
}
```

### 3. Regular Search (Fallback)

```http
GET /workflows/search?query=meeting&limit=10
Authorization: Bearer <token>
```

Nếu semantic search fail, sẽ tự động fallback về fuzzy text search.

---

## 🔄 How It Works

### Flow Diagram

```
1. User syncs emails
   ↓
2. Emails saved với embeddingStatus = "PENDING"
   ↓
3. Email IDs được queue vào BullMQ
   ↓
4. Background worker xử lý batch (10 emails/batch)
   ↓
5. Generate embeddings với Gemini API
   ↓
6. Update database với embeddings và status = "COMPLETED"
   ↓
7. User có thể search semantically
```

### Status Flow

```
PENDING → PROCESSING → COMPLETED
                    ↓
                  FAILED
```

---

## 🐛 Troubleshooting

### 1. Redis Connection Failed

**Error:** `Redis connection error`

**Solution:**
- Verify Redis is running: `redis-cli ping` (should return `PONG`)
- Check `REDIS_URL` in `.env`
- For Redis Cloud, use full URL: `redis://username:password@host:port`

### 2. pgvector Extension Not Found

**Error:** `extension "vector" does not exist`

**Solution:**
```sql
-- Check if extension is available
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Install if available
CREATE EXTENSION vector;
```

### 3. Embedding Generation Failed

**Error:** `Failed to generate embedding`

**Possible causes:**
- Invalid `GEMINI_API_KEY`
- Rate limit exceeded (1,500 requests/minute)
- Network issues

**Solution:**
- Verify API key
- Check Gemini API status
- Check logs for detailed error

### 4. Vector Index Not Created

**Note:** Vector index (ivfflat) requires data. Create after initial data load:

```sql
CREATE INDEX email_workflows_embedding_idx 
ON email_workflows 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

---

## 📊 Monitoring

### Queue Stats

Check queue status (có thể thêm endpoint):

```typescript
const stats = await embeddingQueue.getQueueStats();
console.log(stats);
// { waiting: 5, active: 2, completed: 100, failed: 1 }
```

### Database Queries

Check embedding status:

```sql
-- Count by status
SELECT "embeddingStatus", COUNT(*) 
FROM email_workflows 
GROUP BY "embeddingStatus";

-- Find pending embeddings
SELECT id, subject, "embeddingStatus"
FROM email_workflows
WHERE "embeddingStatus" = 'PENDING'
LIMIT 10;
```

---

## 🎯 Next Steps

1. **Monitor Performance:**
   - Track embedding generation time
   - Monitor queue length
   - Check error rates

2. **Optimize:**
   - Adjust batch size nếu cần
   - Tune concurrency settings
   - Add vector index sau khi có data

3. **Scale:**
   - Add more workers nếu cần
   - Use Redis Cluster cho production
   - Consider caching embeddings

---

## 📝 Notes

- Embeddings được generate **asynchronously** - không block user requests
- Semantic search sẽ **fallback** về fuzzy search nếu embedding service unavailable
- Queue system đảm bảo **reliability** với retry mechanism
- Batch processing **optimizes** API calls và rate limits

---

## ✅ Checklist

- [ ] PostgreSQL với pgvector extension installed
- [ ] Redis server running
- [ ] Environment variables configured
- [ ] Migration applied
- [ ] Dependencies installed
- [ ] Application started successfully
- [ ] Test sync emails
- [ ] Test semantic search

---

**Happy coding! 🚀**
