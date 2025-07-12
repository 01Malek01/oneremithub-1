#!/bin/bash

# Add all changes
git add .

# Check status
echo "Git status:"
git status

# Commit changes
git commit -m "feat: Implement comprehensive Naira-focused payment system

- Add flexible payment structures (lump sum, installments, flexible, recurring)
- Implement payment schedule management with Naira currency
- Create payment history tracking and analytics
- Add payment calculation utilities for late fees and progress
- Update formatters for Nigerian currency and locale
- Enhance transaction types with payment support
- Add payment setup dialog for configuration
- Implement payment schedule card component
- Add payment history table with filtering and sorting
- Update Transactions page with payment management features

Key features:
- Support for all Nigerian payment methods (bank transfer, cash, card, mobile money, POS, crypto)
- Automatic late fee calculations with grace periods
- Payment progress tracking and analytics
- Flexible installment management
- Professional FAANG-level UI/UX"

# Push to GitHub
git push origin main

echo "Changes pushed successfully!" 