# Deployment Guide

## Docker Deployment
```bash
docker-compose up -d
```

## Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` with production credentials
- [ ] Set strong `JWT_SECRET`
- [ ] Configure Supabase production project
- [ ] Set up OAuth app credentials
- [ ] Configure SMTP for email notifications
- [ ] Enable HTTPS
- [ ] Set up log aggregation
- [ ] Configure backup schedules

## Environment Variables
See `.env.example` for required variables.
