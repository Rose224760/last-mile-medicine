# Last Mile Medicine - FAQ

## General Questions

### What is Last Mile Medicine?
Last Mile Medicine is a smart medicine finder platform that helps people quickly locate nearby pharmacies that have the medicine they need. Unlike traditional mapping apps, we focus on medicine availability, open/closed status, and accessibility.

### How is this different from Google Maps?
Google Maps shows pharmacy locations but doesn't tell you:
- Which store has your medicine in stock
- Whether they're open right now
- If delivery is available
- Cheaper generic alternatives

We solve all of these problems.

### Who is this for?
- Patients needing emergency medicines
- Elderly people who can't visit multiple stores
- Parents with sick children
- People with chronic illnesses needing regular refills
- Rural users with limited pharmacy access

---

## Technical Questions

### How do you know which pharmacy has stock?
We use multiple methods:
1. **Pharmacy updates**: Pharmacies can update their stock via our dashboard
2. **Crowd verification**: Users confirm when they find medicines
3. **Reliability scores**: Track which pharmacies keep accurate information
4. **Future**: Integration with pharmacy billing software for auto-updates

### Is the prescription scanner accurate?
The demo uses mock OCR for demonstration. In production, we'll use:
- OCR.space API (free tier available)
- Google Vision API
- Tesseract.js for offline processing
- Manual review option for unclear prescriptions

### How do you calculate distance?
We use the Haversine formula to calculate straight-line distance between user and pharmacy. For actual travel time, we integrate with Google Maps routing.

### What if GPS location is inaccurate?
- Users can manually set their location on the map
- Default location fallback (city center)
- Address-based search option (future feature)

### Can this work offline?
Currently requires internet for:
- Map tiles from OpenStreetMap
- API calls to backend
- Location services

**Future offline features:**
- Cached pharmacy data
- Progressive Web App (PWA)
- SMS-based search for zero-internet scenarios

---

## Privacy & Security

### What data do you collect?
We collect minimal data:
- Search queries (medicine names)
- Location (for finding nearby pharmacies)
- Phone number (optional, for pharmacy verification)

We DO NOT store:
- Medical records
- Personal health information
- Credit card details

### Is my location data shared?
No. Location is used only for:
- Finding nearby pharmacies
- Calculating distances

It's not shared with third parties or stored permanently.

### What about prescription photos?
- Processed server-side and deleted after OCR
- Not stored in database
- Only medicine names are extracted (no personal info)

### GDPR/Privacy compliance?
For production:
- User consent before data collection
- Data encryption in transit (HTTPS)
- Right to deletion
- Transparent privacy policy
- Regular security audits

---

## Business Questions

### How do you make money?
**Phase 1 (MVP):** Free for all users and pharmacies

**Phase 2 (Growth):**
1. **Pharmacy subscriptions**:
   - Basic: Free (manual updates)
   - Premium: ₹999/month (auto-updates, priority listing, analytics)

2. **Delivery partnerships**: Commission on orders

3. **Sponsored listings**: Ethical partnerships with pharmacies

4. **Government contracts**: Public health data insights

5. **B2B**: Supply chain optimization for pharmaceutical distributors

### What's your competitive advantage?
1. **Focus on discovery, not delivery**: Faster than waiting for delivery
2. **Emergency mode**: Unique feature for urgent needs
3. **Rural accessibility**: SMS mode, low data usage
4. **Public health value**: Shortage heatmaps help government planning
5. **Free for end-users**: No subscription required

### Who are your competitors?
**Direct:**
- Google Maps (limited medicine info)
- JustDial (no real-time data)

**Indirect:**
- PharmEasy, 1mg (delivery-focused, not discovery)
- Netmeds (own inventory)

**Our differentiation:** We're infrastructure, not inventory.

### What's your go-to-market strategy?
**Phase 1:** One city (Bangalore)
- Partner with 100 pharmacies
- Grassroots marketing in hospitals
- Social media campaigns

**Phase 2:** Tier-1 cities (Mumbai, Delhi, Hyderabad)
- Hospital partnerships
- Doctor referrals
- Government collaboration

**Phase 3:** Tier-2 and rural expansion
- SMS integration
- NGO partnerships
- Low-connectivity optimization

---

## User Questions

### How do I know if information is accurate?
- **Reliability scores**: Pharmacies rated 1-5 stars based on update frequency and user confirmations
- **Last updated timestamp**: See when pharmacy last updated their stock
- **User verification**: "Found here" / "Not available" crowdsourced confirmations

### What if no pharmacies have my medicine?
- Search expands to 20km radius
- Generic alternative suggestions
- Notification when stock becomes available (future)
- Direct prescription upload to hospital pharmacy (future)

### Can I reserve medicine?
Not in MVP. Future feature:
- Reserve for 20 minutes
- Pharmacy receives notification
- Penalty for false reservations

### Is this available in my city?
MVP covers Bangalore (demo data).
Post-launch roadmap:
- Month 1-3: Bangalore
- Month 4-6: Mumbai, Delhi, Hyderabad
- Month 7-12: 20+ cities

### Do I need to create an account?
No account needed for basic search. Optional account for:
- Saving medicine history
- Setting up reminders
- Favorite pharmacies
- Prescription storage

---

## Pharmacy Questions

### How can my pharmacy join?
**For MVP:** Contact us via demo form

**For production:**
1. Sign up on web dashboard
2. Verify license and registration
3. Add medicines to inventory
4. Start appearing in searches

Process takes 24-48 hours.

### What's the cost?
- **Basic plan**: Free forever
  - Manual stock updates
  - Basic listing
- **Premium plan**: ₹999/month
  - Auto-sync with billing software
  - Priority placement
  - Analytics dashboard
  - Featured badge

### How do I update my stock?
Three ways:
1. **Web dashboard**: One-click stock updates
2. **Mobile app**: Quick toggle in/out of stock (future)
3. **API integration**: Auto-sync with your billing software (future)

### Will this increase my sales?
Yes, because:
- Increased visibility to nearby customers
- Customers call to confirm before visiting (reduces drop-ins)
- Emergency mode highlights 24-hour stores
- Better than Google Maps (more specific info)

---

## Development Questions

### What tech stack do you use?
**Frontend:**
- React 18
- Leaflet for maps
- React Icons
- Responsive CSS

**Backend:**
- Node.js + Express
- JSON file storage (MVP)
- Upgradeable to MongoDB/Firebase

**APIs:**
- OCR.space (prescription scanning)
- OpenStreetMap (maps)
- Google Maps (directions)

### Can this scale to millions of users?
Yes, architecture supports:
- Cloud deployment (AWS/GCP/Azure)
- Database migration (PostgreSQL/MongoDB)
- Redis caching
- Load balancing
- CDN for images
- Horizontal scaling

### Is it open source?
MVP is proprietary.

Future possibilities:
- Open-source SDK for hospital integrations
- Public API for researchers
- Community contributions for translations

### How can I contribute?
Post-hackathon:
- Beta testing
- Pharmacy partnerships
- Translation help (regional languages)
- Feature suggestions

---

## Future Features

### What's on the roadmap?
**Phase 2:**
- Voice search
- SMS integration
- Medicine history tracker
- Multi-language support
- Pharmacy mobile app

**Phase 3:**
- Hospital integration
- WhatsApp bot
- Medicine donation tracking
- Telemedicine referrals
- Insurance integration

See [ROADMAP.md](../ROADMAP.md) for full list.

### Will you add delivery?
Not directly. We'll partner with existing delivery services:
- Dunzo
- Swiggy Instamart
- PharmEasy (white-label partnership)

Our focus remains **discovery**, letting specialists handle delivery.

### Voice search for elderly?
Yes! Planned for Phase 2:
- Voice input using Web Speech API
- Regional language support
- Simple voice commands: "Find Paracetamol near me"

### Government partnerships?
Absolutely. We can provide:
- Medicine shortage heatmaps
- Supply chain optimization data
- Emergency stockpile recommendations
- Rural healthcare planning insights

---

## Troubleshooting

### App not loading?
1. Check internet connection
2. Clear browser cache
3. Try different browser (Chrome recommended)
4. Ensure JavaScript is enabled

### Map not showing?
- Allow location access in browser
- Check if OpenStreetMap is accessible
- Verify firewall isn't blocking map tiles

### Pharmacy not found?
- Try emergency mode (might be closed)
- Increase search radius in settings
- Report missing pharmacy via form

### OCR not detecting medicines?
- Use clear, well-lit photo
- Avoid glare on paper
- Ensure text is readable
- Try cropping to prescription area only

---

## Contact & Support

**For Hackathon Judges:**
- Demo issues: Check QUICKSTART.md
- Technical questions: See code comments
- Business questions: This FAQ

**For Future Users:**
- Email: support@lastmilemedicine.com (future)
- Twitter: @LastMileMed (future)
- Phone: +91-XXX-XXXX-XXXX (future)

---

**Still have questions?**
Create an issue in the GitHub repository or reach out during Q&A!

Built with ❤️ for better healthcare access 🌍
