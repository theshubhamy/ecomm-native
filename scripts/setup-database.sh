#!/bin/bash

# Database Setup Script
# This script helps you set up your Supabase database

echo "🗄️  Supabase Database Setup"
echo "================================"
echo ""
echo "This script will guide you through setting up your database."
echo ""
echo "⚠️  IMPORTANT: You need to run the SQL scripts in Supabase SQL Editor"
echo ""
echo "Step 1: Create Schema"
echo "----------------------"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy the contents of: scripts/sql/schema.sql"
echo "4. Paste and click 'Run'"
echo ""
echo "Step 2: Seed Data"
echo "-----------------"
echo "1. In the same SQL Editor"
echo "2. Copy the contents of: scripts/sql/seed.sql"
echo "3. Paste and click 'Run'"
echo ""
echo "Alternative: Use the TypeScript seed script after creating schema:"
echo "  npx tsx scripts/seed-database.ts"
echo ""
echo "📝 Files to use:"
echo "   - scripts/sql/schema.sql (create tables)"
echo "   - scripts/sql/seed.sql (add data)"
echo ""

