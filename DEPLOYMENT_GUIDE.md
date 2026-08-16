# Deployment Guide - Alpha Edu Hub

This guide provides comprehensive deployment instructions for various platforms.

## Table of Contents
- [Render Deployment](#render-deployment)
- [Vercel Deployment](#vercel-deployment)
- [cPanel Deployment](#cpanel-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Render Deployment

### Prerequisites
- Render account (free tier available)
- GitHub repository with your code
- PostgreSQL database (Render provides free tier)

### Steps

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up/login

3. **Create PostgreSQL Database**
   - In Render dashboard, click "New"
   - Select "PostgreSQL"
   - Choose database name: `alpha_edu_hub`
   - Select region and plan (Free tier available)
   - Click "Create Database"
   - Wait for database to be ready
   - Copy the internal database URL from Render dashboard

4. **Create Web Service**
   - In Render dashboard, click "New"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: alpha-edu-hub
     - **Region**: Same as database
     - **Branch**: main
     - **Runtime**: Node
     - **Build Command**: `npm run build`
     - **Start Command**: `node server.js`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (paste your Render PostgreSQL URL)
     - `JWT_ACCESS_SECRET`: (generate secure random string)
     - `JWT_REFRESH_SECRET`: (generate secure random string)
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: (optional, for image uploads)
   - Click "Create Web Service"

5. **Run Database Migrations**
   - After deployment, access your service's shell
   - Run: `npx prisma migrate deploy`
   - Optionally run: `npm run seed` (for demo data)

6. **Access Your Application**
   - Render will provide a URL like `https://alpha-edu-hub.onrender.com`
   - Wait for deployment to complete
   - Access the application

### Generate JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository
- External PostgreSQL database (Vercel Postgres or other provider)

### Steps

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub

3. **Import Project**
   - In Vercel dashboard, click "Add New"
   - Select "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `./`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

4. **Configure Environment Variables**
   Add these in Vercel project settings:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (your PostgreSQL connection string)
   - `JWT_ACCESS_SECRET`: (generate secure random string)
   - `JWT_REFRESH_SECRET`: (generate secure random string)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: (optional)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel will provide a URL

6. **Database Setup**
   - Access your PostgreSQL database
   - Run migrations: `npx prisma migrate deploy`
   - Optionally seed: `npm run seed`

### Custom Domain (Optional)
- In Vercel project settings, go to "Domains"
- Add your custom domain
- Configure DNS records as instructed

## cPanel Deployment

For detailed cPanel deployment instructions, see [`CPANEL_DEPLOYMENT.md`](CPANEL_DEPLOYMENT.md).

### Quick Summary
1. Ensure cPanel supports Node.js (>= 18.0.0)
2. Create PostgreSQL database in cPanel
3. Clone repository to server
4. Install dependencies: `npm install`
5. Configure environment variables
6. Run migrations: `npx prisma migrate deploy`
7. Build application: `npm run build`
8. Create Node.js application in cPanel
9. Set startup file to `server.js`
10. Configure environment variables in cPanel
11. Restart application

## Environment Variables

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
- `JWT_ACCESS_SECRET`: Secret for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret for JWT refresh tokens
- `NODE_ENV`: Set to `production` for deployments

### Optional Variables
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image uploads
- `PORT`: Application port (auto-set by most platforms)

### Security Notes
- Never commit `.env` files to version control
- Use strong, randomly generated secrets
- Rotate secrets periodically in production
- Use different secrets for development and production

## Troubleshooting

### Build Failures

**Issue**: Build fails with authentication errors
- **Solution**: Pages requiring authentication should use `export const dynamic = 'force-dynamic'` to prevent static generation

**Issue**: Module not found errors
- **Solution**: Ensure all dependencies are installed: `npm install`

**Issue**: TypeScript errors
- **Solution**: Run `npm run lint` to check for issues

### Database Connection Issues

**Issue**: Cannot connect to database
- **Solution**: Verify `DATABASE_URL` format and credentials
- **Solution**: Ensure database is accessible from deployment platform
- **Solution**: Check firewall/security group settings

**Issue**: Migration failures
- **Solution**: Run `npx prisma migrate deploy` manually
- **Solution**: Check database permissions
- **Solution**: Ensure Prisma client is generated: `npx prisma generate`

### Runtime Errors

**Issue**: Application won't start
- **Solution**: Check server logs for specific errors
- **Solution**: Verify Node.js version (>= 18.0.0)
- **Solution**: Ensure build completed successfully

**Issue**: Authentication failures
- **Solution**: Verify JWT secrets are set correctly
- **Solution**: Check cookie settings in next.config.mjs
- **Solution**: Ensure HTTPS is enabled in production

### Platform-Specific Issues

**Render**:
- Free tier services spin down after inactivity
- Cold starts may take 30-60 seconds
- Database connection may need SSL configuration

**Vercel**:
- Serverless functions have execution time limits
- Consider using Vercel Postgres for better integration
- Edge functions may not support all Node.js modules

**cPanel**:
- Ensure Node.js version is >= 18.0.0
- Custom server (`server.js`) is required
- File permissions must be set correctly

## Performance Optimization

### Build Optimization
- Enable Next.js built-in caching
- Optimize images using Next.js Image component
- Minimize bundle size with tree shaking

### Database Optimization
- Use Prisma connection pooling
- Add database indexes for frequently queried fields
- Consider read replicas for high-traffic applications

### CDN Configuration
- Use CDN for static assets
- Configure caching headers
- Enable gzip compression

## Monitoring and Logging

### Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance (Vercel Analytics, Render monitoring)
- Set up uptime monitoring

### Database Monitoring
- Monitor query performance
- Track connection pool usage
- Set up automated backups

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Always use SSL in production
3. **Dependencies**: Keep dependencies updated
4. **Authentication**: Use strong JWT secrets
5. **Database**: Use connection pooling and prepared statements
6. **Rate Limiting**: Implement API rate limiting
7. **CORS**: Configure CORS properly
8. **Headers**: Set security headers (already configured in next.config.mjs)

## Backup and Recovery

### Database Backups
- Set up automated database backups
- Test restore procedures regularly
- Keep backups in multiple locations

### Application Backups
- Version control with Git
- Keep deployment configurations documented
- Maintain rollback procedures

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Open GitHub issues for platform-specific bugs
- Contact platform support for infrastructure issues

## Post-Deployment Checklist

- [ ] Application builds successfully
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Authentication working
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Error tracking enabled
- [ ] Performance optimized
- [ ] Security headers verified
- [ ] Documentation updated