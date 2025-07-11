# 🚀 YieldAgentX Vercel Deployment Guide

**Complete Step-by-Step Guide to Deploy YieldAgentX on Vercel**

This guide will walk you through deploying both the frontend and AI backend services on Vercel, setting up environment variables, and ensuring everything works seamlessly together.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **GitHub Account** - Your code should be in a public GitHub repository
- ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
- ✅ **API Keys Ready**:
  - WalletConnect Project ID ([Get here](https://cloud.walletconnect.com/sign-in))
  - OpenAI API Key ([Get here](https://platform.openai.com/api-keys)) - Optional but recommended
  - Hugging Face API Key ([Get here](https://huggingface.co/settings/tokens)) - Optional

## 🏗️ Deployment Architecture

```
YieldAgentX Vercel Deployment
├── Frontend (yieldagentx-frontend.vercel.app)
│   ├── Next.js 14 Application
│   ├── Web3 wallet integration
│   └── Real-time raffle interface
├── AI Service (yieldagentx-ai.vercel.app)
│   ├── Node.js backend
│   ├── OpenAI & Hugging Face integration
│   └── RESTful API endpoints
└── Smart Contracts (Deployed on Sepolia)
    ├── VRF Raffle Contract
    └── AI Vault Contract
```

## 🚀 Step 1: Prepare Your Repository

### 1.1 Fork or Clone the Repository
```bash
# If you haven't already, clone the repository
git clone https://github.com/your-username/YieldAgentX.git
cd YieldAgentX

# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify Project Structure
Ensure your project has this structure:
```
YieldAgentX/
├── frontend/          # Next.js frontend
├── ai/               # Node.js AI service
├── backend/          # Smart contracts (not deployed to Vercel)
├── package.json      # Root package.json
└── README.md        # This file
```

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Create Frontend Deployment

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Project Name**: `yieldagentx-frontend`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.2 Configure Frontend Environment Variables

In Vercel project settings, add these environment variables:

#### **Required Variables**
```env
# Wallet Integration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Contract Addresses (Sepolia Testnet)
NEXT_PUBLIC_VRF_RAFFLE_CONTRACT=0x742d35Cc6634C0532925a3b8D1C9E4C9b4dD4A5c
NEXT_PUBLIC_AI_VAULT_CONTRACT=0x299bB7655582f94f4293BB64775C9E1fcE210F3b

# AI Service URL (will be updated after AI deployment)
NEXT_PUBLIC_AI_SERVICE_URL=https://yieldagentx-ai.vercel.app
```

#### **Optional Variables**
```env
# Enable AI Features
NEXT_PUBLIC_ENABLE_AI_FEATURES=true

# Analytics (if you have them)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 2.3 Deploy Frontend
1. **Click "Deploy"**
2. **Wait for build to complete** (2-3 minutes)
3. **Your frontend will be available** at: `https://yieldagentx-frontend.vercel.app`

## 🤖 Step 3: Deploy AI Service to Vercel

### 3.1 Create AI Service Deployment

1. **In Vercel, click "New Project"** again
2. **Import the same GitHub repository**
3. **Configure the AI service project**:
   - **Project Name**: `yieldagentx-ai`
   - **Framework Preset**: `Other` or `Node.js`
   - **Root Directory**: `ai` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.2 Configure AI Service Environment Variables

#### **Required Variables**
```env
# AI Provider APIs
HUGGINGFACE_API_KEY=your_hugging_face_api_key
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
CORS_ORIGIN=https://yieldagentx-frontend.vercel.app
JWT_SECRET=your_secure_jwt_secret_here
```

#### **Optional Variables**
```env
# Features
ENABLE_RATE_LIMITING=true
LOG_LEVEL=info

# Advanced Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.3 Deploy AI Service
1. **Click "Deploy"**
2. **Wait for build to complete** (2-3 minutes)
3. **Your AI service will be available** at: `https://yieldagentx-ai.vercel.app`

## 🔗 Step 4: Connect Frontend and AI Service

### 4.1 Update Frontend Environment Variable

1. **Go to your frontend Vercel project**
2. **Navigate to Settings → Environment Variables**
3. **Update the AI service URL**:
   ```env
   NEXT_PUBLIC_AI_SERVICE_URL=https://yieldagentx-ai.vercel.app
   ```
4. **Click "Save"**
5. **Redeploy the frontend** (Vercel will auto-redeploy)

### 4.2 Update AI Service CORS

1. **Go to your AI service Vercel project**
2. **Navigate to Settings → Environment Variables**
3. **Update the CORS origin**:
   ```env
   CORS_ORIGIN=https://yieldagentx-frontend.vercel.app
   ```
4. **Click "Save"**
5. **Redeploy the AI service**

## ✅ Step 5: Verification & Testing

### 5.1 Test Frontend Deployment
1. **Visit your frontend URL**: `https://yieldagentx-frontend.vercel.app`
2. **Check that the page loads** without errors
3. **Try connecting a wallet** (MetaMask recommended)
4. **Navigate to different pages**: Dashboard, AI Agents, Raffle

### 5.2 Test AI Service Deployment
1. **Visit health endpoint**: `https://yieldagentx-ai.vercel.app/api/health`
2. **Should return**:
   ```json
   {
     "status": "healthy",
     "timestamp": 1234567890,
     "service": "AI Backend",
     "version": "1.0.0"
   }
   ```

### 5.3 Test Integration
1. **Go to AI Agents page** on your frontend
2. **Try creating an agent** (if wallet connected)
3. **Check browser console** for any errors
4. **Verify raffle functionality** on the raffle page

## 🔧 Step 6: Domain Configuration (Optional)

### 6.1 Add Custom Domain (Pro Feature)
If you have a custom domain:

1. **In Vercel project settings**
2. **Go to Domains**
3. **Add your custom domain**
4. **Update environment variables** to reflect new domain

### 6.2 Update CORS for Custom Domain
```env
# If using custom domain
CORS_ORIGIN=https://your-custom-domain.com
```

## 📊 Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics
1. **Enable Vercel Analytics** in project settings
2. **Monitor deployment health** and performance
3. **Track user interactions** and API usage

### 7.2 Error Monitoring
1. **Check Vercel Function logs** for AI service errors
2. **Monitor browser console** for frontend errors
3. **Set up alerts** for critical issues

## 🚨 Troubleshooting Common Issues

### Issue 1: Frontend Build Fails
**Problem**: Next.js build errors
**Solution**:
```bash
# Test build locally first
cd frontend
npm run build

# Common fixes:
# 1. Update Node.js version in Vercel (Settings → General → Node.js Version)
# 2. Check for TypeScript errors
# 3. Verify all dependencies are in package.json
```

### Issue 2: AI Service Not Responding
**Problem**: AI service returns 500 errors
**Solutions**:
1. **Check environment variables** are correctly set
2. **Verify API keys** are valid
3. **Check function timeout** (increase if needed)
4. **Review function logs** in Vercel dashboard

### Issue 3: CORS Errors
**Problem**: Frontend can't connect to AI service
**Solution**:
```env
# Ensure AI service has correct CORS origin
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Or allow multiple origins (for testing)
CORS_ORIGIN=https://localhost:3000,https://your-frontend-domain.vercel.app
```

### Issue 4: Wallet Connection Issues
**Problem**: Web3 wallet won't connect
**Solutions**:
1. **Verify WalletConnect Project ID** is correct
2. **Check network configuration** (Sepolia testnet)
3. **Ensure HTTPS** (required for Web3)
4. **Try different wallet** (MetaMask recommended)

## 🔄 Step 8: Continuous Deployment

### 8.1 Auto-Deploy Setup
Vercel automatically deploys when you push to your main branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically deploy both services
```

### 8.2 Preview Deployments
- **Every pull request** gets a preview deployment
- **Test changes** before merging to main
- **Share preview links** with team members

## 📋 Environment Variables Quick Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_VRF_RAFFLE_CONTRACT=0x742d35Cc6634C0532925a3b8D1C9E4C9b4dD4A5c
NEXT_PUBLIC_AI_VAULT_CONTRACT=0x299bB7655582f94f4293BB64775C9E1fcE210F3b
NEXT_PUBLIC_AI_SERVICE_URL=https://yieldagentx-ai.vercel.app
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

### AI Service (.env)
```env
HUGGINGFACE_API_KEY=your_hf_key
OPENAI_API_KEY=your_openai_key
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yieldagentx-frontend.vercel.app
JWT_SECRET=your_jwt_secret
ENABLE_RATE_LIMITING=true
LOG_LEVEL=info
```

## 🎉 Final Checklist

Before going live, ensure:

- ✅ **Frontend deploys successfully** without errors
- ✅ **AI service responds** to health checks
- ✅ **Environment variables** are correctly configured
- ✅ **CORS settings** allow frontend to access AI service
- ✅ **Wallet connection** works on production URL
- ✅ **Smart contracts** are deployed and verified on Sepolia
- ✅ **Raffle functionality** works end-to-end
- ✅ **Custom domains** configured (if applicable)
- ✅ **Analytics and monitoring** set up

## 🆘 Getting Help

If you encounter issues:

1. **Check Vercel function logs** (Dashboard → Functions → View logs)
2. **Review browser console** for frontend errors
3. **Test API endpoints** manually using curl or Postman
4. **Join the Chainlink Discord** for community support
5. **Open GitHub issues** for bug reports

## 🚀 Post-Deployment

After successful deployment:

1. **Update your README** with live URLs
2. **Submit to hackathon** with deployment links
3. **Share with community** for testing and feedback
4. **Monitor performance** and user feedback
5. **Plan next features** based on usage

---

## 📱 Quick Deployment Commands

```bash
# One-time setup
git clone https://github.com/your-username/YieldAgentX.git
cd YieldAgentX

# Update code and deploy
git add .
git commit -m "Deploy updates"
git push origin main

# Vercel will auto-deploy both frontend and AI service
```

**Your deployed URLs:**
- 🌐 **Frontend**: `https://yieldagentx-frontend.vercel.app`
- 🤖 **AI Service**: `https://yieldagentx-ai.vercel.app`
- ⛓️ **Smart Contracts**: Sepolia testnet (already deployed)

**Congratulations! Your YieldAgentX project is now live on Vercel! 🎉**
