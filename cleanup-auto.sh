#!/bin/bash

# ==========================================
# CLEANUP SCRIPT - Prevent Empty/Garbage Files
# ==========================================

echo "🧹 Running automated cleanup..."

# Remove empty JavaScript files (excluding node_modules)
echo "Removing empty JavaScript files..."
find . -name "*.js" -size 0 -type f -not -path "*/node_modules/*" -delete

# Remove duplicate documentation files (but preserve essential ones)
echo "Removing duplicate documentation..."
find . -name "*_STATUS.md" -not -name "HACKATHON_SUBMISSION_COMPLETE.md" -delete
find . -name "*_COMPLETE.md" -not -name "HACKATHON_SUBMISSION_COMPLETE.md" -delete  
find . -name "*_FIXED.md" -delete
find . -name "*_PROGRESS.md" -delete
find . -name "TEMP_*.md" -delete
find . -name "BACKUP_*.md" -delete

# Remove temporary/backup files
echo "Removing temporary files..."
find . -name "*-temp.js" -delete
find . -name "*_temp.js" -delete
find . -name "*.tmp.js" -delete
find . -name "*-backup.js" -delete
find . -name "*_backup.js" -delete
find . -name "*-old.js" -delete
find . -name "*_old.js" -delete
find . -name "*-duplicate.js" -delete
find . -name "*_duplicate.js" -delete
find . -name "*-copy.js" -delete
find . -name "*_copy.js" -delete

# Remove empty directories (excluding node_modules)
echo "Removing empty directories..."
find . -type d -empty -not -path "*/node_modules/*" -delete 2>/dev/null || true

# Check for essential files
echo "✅ Checking essential files..."
if [ ! -f "README.md" ]; then
    echo "❌ README.md missing!"
    exit 1
fi

if [ ! -f "HACKATHON_SUBMISSION_COMPLETE.md" ]; then
    echo "❌ HACKATHON_SUBMISSION_COMPLETE.md missing!"
    exit 1
fi

echo "✅ Cleanup completed successfully!"
echo "📁 Project is clean and ready!"

# List remaining files for verification
echo ""
echo "📋 Remaining project structure:"
echo "================================"
tree -I 'node_modules|.git' -L 2 || ls -la
